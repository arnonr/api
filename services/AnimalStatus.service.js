const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/AnimalStatus"),
  { Op } = require("sequelize");

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
      $where["AnimalStatusCode"] = req.query.AnimalStatusCode;

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
      var AnimalTypeIDList = req.query.AnimalTypeID.split(",");
      WhereAnimalType = {
        AnimalTypeID: {
          [Op.in]: AnimalTypeIDList,
        },
      };
    }

    // AnimalTypeID
    let WhereAnimalSex = null;
    if (req.query.AnimalSexID) {
      var AnimalSexIDList = req.query.AnimalSexID.split(",");
      WhereAnimalSex = {
        AnimalSexID: {
          [Op.in]: AnimalSexIDList,
        },
      };
    }

    // if (req.query.AnimalTypeID) $where["AnimalGenreID"] = req.query.AnimalGenreID;
    // if (req.query.AnimalSexID) $where["AnimalGroupStatusID"] = req.query.AnimalGroupStatusID;

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

    // query["include"] = [
    //   { all: true },
    //   {
    //     model: AnimalStatusToAnimalType,
    //     as: "AnimalStatusToAnimalType",
    //     where: WhereAnimalType,
    //   },
    //   {
    //     model: AnimalStatusToAnimalSex,
    //     as: "AnimalStatusToAnimalSex",
    //     // where: WhereAnimalSex,
    //   },
    // ];

    query["include"] = [
      { all: true },
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

              let animalSexArray = "";
              data.AnimalSexes.forEach((element) => {
                if (animalSexArray == "") {
                  animalSexArray = element.AnimalSexName;
                } else {
                  animalSexArray = animalSexArray + "," + element.AnimalSexName;
                }
              });

              data = {
                ...data.toJSON(),
                AnimalTypes: animalTypeArray,
                AnimalSexes: animalSexArray,
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
            { all: true },
            {
              model: AnimalType,
            },
            {
              model: AnimalSex,
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

        let animalSexArray = "";
        obj.toJSON().AnimalSexes.forEach((element) => {
          if (animalSexArray == "") {
            animalSexArray = element.AnimalSexName;
          } else {
            animalSexArray = animalSexArray + "," + element.AnimalSexName;
          }
        });

        obj = {
          ...obj.toJSON(),
          AnimalTypes: animalTypeArray,
          AnimalSexes: animalSexArray,
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
        const obj = new db(data);
        const inserted = await obj.save();

        // insert AnimalStatusToAnimalType
        let AnimalTypeIDList = data.AnimalTypeID.split(",");
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = AnimalStatusToAnimalType.create({
            AnimalStatusID: inserted.AnimalStatusID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
          });
        });

        // insert AnimalStatusToAnimalType
        let AnimalSexIDList = data.AnimalSexID.split(",");
        AnimalSexIDList.forEach((AnimalSexID) => {
          const obj1 = AnimalStatusToAnimalSex.create({
            AnimalStatusID: inserted.AnimalStatusID,
            AnimalSexID: AnimalSexID,
            CreatedUserID: data.CreatedUserID,
          });
        });

        const res = await db.findByPk(inserted.AnimalStatusID, {
          include: [
            { all: true },
            {
              model: AnimalType,
            },
            {
              model: AnimalSex,
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
        data.AnimalStatusID = parseInt(id);
        data.UpdatedUserID = 1;

        await db.update(data, { where: { AnimalStatusID: id } });

        const res = await db.findByPk(id, {
          include: [
            { all: true },
            {
              model: AnimalType,
            },
            {
              model: AnimalSex,
            },
          ],
        });

        // insert ProjectToAnimalType
        let AnimalTypeIDList = res.AnimalTypeID.split(",");

        const searchATA = await AnimalStatusToAnimalType.findAll({
          where: { AnimalStatusID: res.AnimalStatusID },
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
              AnimalStatusID: res.AnimalStatusID,
              AnimalTypeID: AnimalTypeID,
            },
          });

          if (!searchATAOne) {
            const obj1 = AnimalStatusToAnimalType.create({
              AnimalStatusID: res.AnimalStatusID,
              AnimalTypeID: AnimalTypeID,
              CreatedUserID: data.UpdatedUserID,
            });
          }
        });
        //

        // insert ProjectToAnimalType
        let AnimalSexIDList = res.AnimalSexID.split(",");

        const searchATS = await AnimalStatusToAnimalSex.findAll({
          where: { AnimalStatusID: res.AnimalStatusID },
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
              AnimalStatusID: res.AnimalStatusID,
              AnimalSexID: AnimalSexID,
            },
          });

          if (!searchATSOne) {
            const obj1 = AnimalStatusToAnimalSex.create({
              AnimalStatusID: res.AnimalStatusID,
              AnimalSexID: AnimalSexID,
              CreatedUserID: data.UpdatedUserID,
            });
          }
        });
        //

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
          { where: { AnimalStatusID: id } }
        );

        // delete ProjectToAnimalType
        const obj1 = AnimalStatusToAnimalType.update(
          { isRemove: 1, isActive: 0 },
          { where: { AnimalStatusID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
