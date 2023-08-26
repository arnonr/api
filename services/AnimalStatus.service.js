const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/AnimalStatus"),
  { Op, fn } = require("sequelize");

const AnimalStatusToAnimalType = require("../models/AnimalStatusToAnimalType");
const AnimalStatusToAnimalSex = require("../models/AnimalStatusToAnimalSex");
const AnimalType = require("../models/AnimalType");
const AnimalSex = require("../models/AnimalSex");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.AnimalStatusID)
      $where["AnimalStatusID"] = req.query.AnimalStatusID;

    if (req.query.AnimalStatusCode)
      $where["AnimalStatusCode"] = {
        [Op.like]: "%" + req.query.AnimalStatusCode + "%",
      };

    if (req.query.AnimalStatusName)
      $where["AnimalStatusName"] = {
        [Op.like]: "%" + req.query.AnimalStatusName + "%",
      };

    if (req.query.AnimalStatusStartAgeAmount)
      $where["AnimalStatusID"] = req.query.AnimalStatusStartAgeAmount;

    if (req.query.AnimalStatusStartAgeUnit)
      $where["AnimalStatusStartAgeUnit"] = {
        [Op.like]: "%" + req.query.AnimalStatusStartAgeUnit + "%",
      };

    // AnimalTypeID
    let WhereAnimalType = null;
    if (req.query.AnimalTypeID) {
      WhereAnimalType = {
        AnimalTypeID: {
          [Op.in]: JSON.parse(req.query.AnimalTypeID),
        },
      };
    }

    // AnimalTypeID
    let WhereAnimalSex = null;
    if (req.query.AnimalSexID) {
      WhereAnimalSex = {
        AnimalSexID: {
          [Op.in]: JSON.parse(req.query.AnimalSexID),
        },
      };
    }

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["AnimalStatusID", "ASC"]];
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
      { all: true, required: false },
      {
        model: AnimalType,
        where: WhereAnimalType,
      },
      {
        model: AnimalSex,
        where: WhereAnimalSex,
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
              count = rows.length;

            //
            rows = rows.map((data) => {
              let animalTypeArray = [];
              data.AnimalTypes.forEach((element) => {
                animalTypeArray.push(element.AnimalTypeName);
              });

              let animalSexArray = [];
              data.AnimalSexes.forEach((element) => {
                console.log("FREEDOM");
                animalSexArray.push(element.AnimalSexName);
              });

              data = {
                ...data.toJSON(),
                AnimalTypeName: animalTypeArray,
                AnimalTypeID: JSON.parse(data.toJSON().AnimalTypeID),
                AnimalSexName: animalSexArray,
                AnimalSexID: JSON.parse(data.toJSON().AnimalSexID),
                AnimalSexes: undefined,
                AnimalTypes: undefined,
              };
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
            { all: true, required: false },
            {
              model: AnimalType,
            },
            {
              model: AnimalSex,
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let animalTypeArray = [];
        obj.toJSON().AnimalTypes.forEach((element) => {
          animalTypeArray.push(element.AnimalTypeName);
        });

        let animalSexArray = [];
        obj.toJSON().AnimalSexes.forEach((element) => {
          animalSexArray.push(element.AnimalSexName);
        });

        obj = {
          ...obj.toJSON(),
          AnimalTypeName: animalTypeArray,
          AnimalSexName: animalSexArray,
          AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
          AnimalSexID: JSON.parse(obj.toJSON().AnimalSexID),
          AnimalSexes: undefined,
          AnimalTypes: undefined,
        };

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
        if (!Array.isArray(data.AnimalTypeID)) {
          reject(ErrorBadRequest("AnimalType ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        let AnimalTypeIDList = [...data.AnimalTypeID];
        data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);

        if (!Array.isArray(data.AnimalSexID)) {
          reject(ErrorBadRequest("AnimalSex ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        let AnimalSexIDList = [...data.AnimalSexID];
        data.AnimalSexID = JSON.stringify(data.AnimalSexID);

        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        // insert AnimalStatusToAnimalType
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = AnimalStatusToAnimalType.create({
            AnimalStatusID: inserted.AnimalStatusID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        // insert AnimalStatusToAnimalSex
        AnimalSexIDList.forEach((AnimalSexID) => {
          const obj1 = AnimalStatusToAnimalSex.create({
            AnimalStatusID: inserted.AnimalStatusID,
            AnimalSexID: AnimalSexID,
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        let res = methods.findById(inserted.AnimalStatusID);

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

        // Update
        data.AnimalStatusID = parseInt(id);

        if (data.AnimalTypeID) {
          var AnimalTypeIDList = [...data.AnimalTypeID];
          data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);
        }

        if (data.AnimalSexID) {
          var AnimalSexIDList = [...data.AnimalSexID];
          data.AnimalSexID = JSON.stringify(data.AnimalSexID);
        }

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { AnimalStatusID: id } });

        if (data.AnimalTypeID === null) {
          AnimalStatusToAnimalType.destroy({
            where: {
              AnimalStatusID: id,
            },
            // // truncate: true,
          });
        }

        if (data.AnimalTypeID) {
          // insert ProjectToAnimalType
          const searchATA = await AnimalStatusToAnimalType.findAll({
            where: { AnimalStatusID: obj.AnimalStatusID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          searchATA.forEach((ata) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!AnimalTypeIDList.includes(ata.AnimalTypeID)) {
              AnimalStatusToAnimalType.destroy({
                where: {
                  AnimalStatusToAnimalTypeID: ata.AnimalStatusToAnimalTypeID,
                },
              });
            }
          });

          AnimalTypeIDList.forEach(async (AnimalTypeID) => {
            const searchATAOne = await AnimalStatusToAnimalType.findOne({
              where: {
                AnimalStatusID: obj.AnimalStatusID,
                AnimalTypeID: AnimalTypeID,
              },
            });

            if (!searchATAOne) {
              const obj1 = AnimalStatusToAnimalType.create({
                AnimalStatusID: obj.AnimalStatusID,
                AnimalTypeID: AnimalTypeID,
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            }
          });
        }
        //

        if (data.AnimalSexID === null) {
          AnimalStatusToAnimalSex.destroy({
            where: {
              AnimalStatusID: id,
            },
            // truncate: true,
          });
        }

        if (data.AnimalSexID) {
          // insert ProjectToAnimalType
          const searchATS = await AnimalStatusToAnimalSex.findAll({
            where: { AnimalStatusID: obj.AnimalStatusID },
          });

          // loop ats ของทั้งหมดที่มาจาก DB
          searchATS.forEach((ats) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!AnimalSexIDList.includes(ats.AnimalSexID)) {
              AnimalStatusToAnimalSex.destroy({
                where: {
                  AnimalStatusToAnimalSexID: ats.AnimalStatusToAnimalSexID,
                },
              });
            }
          });

          AnimalSexIDList.forEach(async (AnimalSexID) => {
            const searchATSOne = await AnimalStatusToAnimalSex.findOne({
              where: {
                AnimalStatusID: obj.AnimalStatusID,
                AnimalSexID: AnimalSexID,
              },
            });

            if (!searchATSOne) {
              const obj1 = AnimalStatusToAnimalSex.create({
                AnimalStatusID: obj.AnimalStatusID,
                AnimalSexID: AnimalSexID,
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            }
          });
        }
        //

        let res = methods.findById(data.AnimalStatusID);

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
          { isRemove: 1, isActive: 0, updatedAt: fn("GETDATE") },
          { where: { AnimalStatusID: id } }
        );

        // delete ProjectToAnimalType
        const obj1 = AnimalStatusToAnimalType.destroy({
          where: { AnimalStatusID: id },
          // truncate: true,
        });
        const obj2 = AnimalStatusToAnimalSex.destroy({
          where: { AnimalStatusID: id },
          // truncate: true,
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
