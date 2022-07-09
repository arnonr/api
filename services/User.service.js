const config = require("../configs/app"),
  db = require("../models/User"),
  jwt = require("jsonwebtoken"),
  {
    ErrorBadRequest,
    ErrorNotFound,
    ErrorUnauthorized,
  } = require("../configs/errorMethods"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");

const Title = require("../models/Title");
const Gender = require("../models/Gender");
const MarriedStatus = require("../models/MarriedStatus");
const Organization = require("../models/Organization");
const PositionType = require("../models/PositionType");
const Position = require("../models/Position");
const Province = require("../models/Province");
const Amphur = require("../models/Amphur");
const Tumbol = require("../models/Tumbol");
const Education = require("../models/Education");
const Group = require("../models/Group");
const GroupAuthorize = require("../models/GroupAuthorize");

const UserToAnimalType = require("../models/UserToAnimalType");
const AnimalType = require("../models/AnimalType");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.UserID) $where["UserID"] = req.query.UserID;
    if (req.query.Username)
      $where["Username"] = {
        [Op.like]: "%" + req.query.Username + "%",
      };
    if (req.query.StaffID) $where["StaffID"] = req.query.StaffID;
    if (req.query.GroupID) $where["GroupID"] = req.query.GroupID;

    // AnimalTypeID
    let WhereAnimalType = {};
    if (req.query.AnimalTypeID) {
      var AnimalTypeIDList = req.query.AnimalTypeID.split(",");
      WhereAnimalType = {
        AnimalTypeID: {
          [Op.in]: AnimalTypeIDList,
        },
      };
    }

    if (req.query.IsApprove) $where["IsApprove"] = req.query.IsApprove;
    if (req.query.ApproveByStaffID)
      $where["ApproveByStaffID"] = req.query.ApproveByStaffID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["UserID", "ASC"]];
    if (req.query.orderByField && req.query.orderBy)
      $order = [
        [
          req.query.orderByField,
          req.query.orderBy.toLowerCase() == "desc" ? "desc" : "asc",
        ],
      ];
    query["order"] = $order;

    if (!isNaN(limit)) query["limit"] = limit;

    if (!isNaN(offset)) query["offset"] = offset;

    query["include"] = [
      { all: true },
      {
        model: AnimalType,
        where: WhereAnimalType,
      },
    ];

    return { query: query };
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch(req, limit, offset);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([db.findAll(_q.query), db.count(_q.query)])
          .then((result) => {
            let rows = result[0],
              count = result[1];

            //
            rows = rows.map((data) => {
              let animalTypeArray = "";
              data.AnimalTypes.forEach((element) => {
                if (animalTypeArray == "") {
                  animalTypeArray = element.AnimalTypeName;
                } else {
                  animalTypeArray =
                    animalTypeArray + "," + element.AnimalTypeName;
                }
              });
              data = { ...data.toJSON(), AnimalTypes: animalTypeArray };

              return data;
            });
            //

            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: rows,
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = await db.findByPk(id, {
          include: [
            { all: true },
            {
              model: AnimalType,
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let animalTypeArray = "";
        obj.toJSON().AnimalTypes.forEach((element) => {
          if (animalTypeArray == "") {
            animalTypeArray = element.AnimalTypeName;
          } else {
            animalTypeArray = animalTypeArray + "," + element.AnimalTypeName;
          }
        });

        obj = { ...obj.toJSON(), AnimalTypes: animalTypeArray };

        resolve(obj);
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้
        const obj = new db(data);
        obj.Password = obj.passwordHash(obj.Password);
        const inserted = await obj.save();

        // insert ProjectToAnimalType
        let AnimalTypeIDList = data.AnimalTypeID.split(",");
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = UserToAnimalType.create({
            UserID: inserted.UserID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
          });
        });

        const res = await db.findByPk(inserted.UserID, {
          include: [
            { all: true, nested: true },
            {
              model: AnimalType,
            },
          ],
        });

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check ID
        const obj = await db.findByPk(id);
        if (!obj) reject(ErrorNotFound("id: not found"));

        //check เงื่อนไขตรงนี้ได้

        // Update
        data.UserID = parseInt(id);
        data.Password = obj.passwordHash(data.Password);
        data.UpdatedUserID = 1;

        await db.update(data, { where: { UserID: id } });

        const res = await db.findByPk(id, {
          include: [
            { all: true, nested: true },
            {
              model: AnimalType,
            },
          ],
        });

        // insert ProjectToAnimalType
        let AnimalTypeIDList = res.AnimalTypeID.split(",");

        const searchPTA = await UserToAnimalType.findAll({
          where: { UserID: res.UserID },
        });
        // loop pta ของโครงการนี้ทั้งหมดที่มาจาก DB
        searchPTA.forEach((pta) => {
          // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
          if (!AnimalTypeIDList.includes(pta.AnimalTypeID)) {
            UserToAnimalType.destroy({
              where: { UserToAnimalTypeID: pta.UserToAnimalTypeID },
            });
          }
        });

        AnimalTypeIDList.forEach(async (AnimalTypeID) => {
          const searchPTAOne = await UserToAnimalType.findOne({
            where: {
              UserID: res.UserID,
              AnimalTypeID: AnimalTypeID,
            },
          });

          if (!searchPTAOne) {
            const obj1 = UserToAnimalType.create({
              UserID: res.UserID,
              AnimalTypeID: AnimalTypeID,
              CreatedUserID: data.UpdatedUserID,
            });
          }
        });

        // await User.update(data, { where: { id: id }, individualHooks: true });
        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await db.findByPk(id);
        if (!obj) reject(ErrorNotFound("id: not found"));

        await db.update(
          { isRemove: 1, isActive: 0 },
          { where: { UserID: id } }
        );

        // delete ProjectToAnimalType
        let AnimalTypeIDList = obj.AnimalTypeID.split(",");
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = UserToAnimalType.update({ isRemove: 1, isActive: 0 });
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  login(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await db.findOne({
          where: { Username: data.Username },
          include: { all: true },
        });

        // ตรวจสอบว่ามี username
        if (!obj) {
          reject(ErrorUnauthorized("Username not found"));
        } else {
          // ตรวจสอบ Password
          if (!obj.validPassword(data.Password)) {
            reject(ErrorUnauthorized("Password is invalid."));
          }

          if (obj.IsApprove === 0) {
            reject(ErrorUnauthorized("รออนุมัติ"));
          }

          if (obj.IsApprove === 2) {
            reject(ErrorUnauthorized("ไม่อนุมัติ"));
          }
        }
        // let userData = {
        //   id: obj.id,
        //   username: obj.username,
        //   //   firstname: obj.firstname,
        //   //   lastname: obj.lastname,
        //   //   role: obj.role,
        //   //   email: obj.email,
        //   photoURL:
        //     "https://icons-for-free.com/iconfiles/png/512/business+costume+male+man+office+user+icon-1320196264882354682.png",
        //   createdDatetime: obj.created_datetime,
        //   updatedDatetime: obj.updated_datetime,
        // };

        resolve({ accessToken: obj.generateJWT(obj), userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },

  register(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //   validate Data
        const obj = new db(data);
        obj.password = obj.passwordHash(obj.password);
        const inserted = await obj.save();
        resolve(inserted);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  refreshToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const decoded = jwt.decode(accessToken);
        const obj = await db.findOne({
          where: { Username: decoded.Username },
          include: { all: true },
        });

        if (!obj) {
          reject(ErrorUnauthorized("Username not found"));
        }
        resolve({ accessToken: obj.generateJWT(obj), userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
