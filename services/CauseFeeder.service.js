const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/CauseFeeder"),
  { Op, fn } = require("sequelize");

const CauseFeederToAnimalType = require("../models/CauseFeederToAnimalType");
const AnimalType = require("../models/AnimalType");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.CauseFeederID)
      $where["CauseFeederID"] = req.query.CauseFeederID;

    if (req.query.CauseFeederCode)
      $where["CauseFeederCode"] = {
        [Op.like]: "%" + req.query.CauseFeederCode + "%",
      };

    if (req.query.CauseFeederName)
      $where["CauseFeederName"] = {
        [Op.like]: "%" + req.query.CauseFeederName + "%",
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

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["CauseFeederID", "ASC"]];
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
              data = {
                ...data.toJSON(),
                AnimalTypes: animalTypeArray,
                AnimalTypeID: JSON.parse(data.toJSON().AnimalTypeID),
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
          include: [{ all: true, required: false }],
        });

        console.log(obj.toJSON());
        if (!obj) reject(ErrorNotFound("id: not found"));
        console;
        let animalTypeArray = [];

        obj.toJSON().AnimalTypes.forEach((element) => {
          animalTypeArray.push(element.AnimalTypeName);
        });

        obj = {
          ...obj.toJSON(),
          AnimalTypes: animalTypeArray,
          AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
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
          reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        let AnimalTypeIDList = [...data.AnimalTypeID];
        data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);

        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        // insert CauseFeederToAnimalType
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = CauseFeederToAnimalType.create({
            CauseFeederID: inserted.CauseFeederID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        let res = methods.findById(inserted.CauseFeederID);

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
        data.CauseFeederID = parseInt(id);

        if (data.AnimalTypeID) {
          if (!Array.isArray(data.AnimalTypeID)) {
            reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var AnimalTypeIDList = [...data.AnimalTypeID];
          data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);
        }

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { CauseFeederID: id } });

        if (data.AnimalTypeID === null) {
          CauseFeederToAnimalType.destroy({
            where: {
              CauseFeederID: id,
            },
            // truncate: true,
          });
        }

        if (data.AnimalTypeID) {
          // insert CauseFeederToAnimalType
          const searchPTA = await CauseFeederToAnimalType.findAll({
            where: { CauseFeederID: obj.CauseFeederID },
          });
          // loop pta ของโครงการนี้ทั้งหมดที่มาจาก DB
          searchPTA.forEach((pta) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!AnimalTypeIDList.includes(pta.AnimalTypeID)) {
              CauseFeederToAnimalType.destroy({
                where: {
                  CauseFeederToAnimalTypeID: pta.CauseFeederToAnimalTypeID,
                },
              });
            }
          });

          AnimalTypeIDList.forEach(async (AnimalTypeID) => {
            const searchPTAOne = await CauseFeederToAnimalType.findOne({
              where: {
                CauseFeederID: obj.CauseFeederID,
                AnimalTypeID: AnimalTypeID,
              },
            });

            if (!searchPTAOne) {
              const obj1 = CauseFeederToAnimalType.create({
                CauseFeederID: obj.CauseFeederID,
                AnimalTypeID: AnimalTypeID,
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            }
          });
        }
        let res = methods.findById(data.CauseFeederID);
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
          { where: { CauseFeederID: id } }
        );

        // delete CauseFeederToAnimalType
        const obj1 = CauseFeederToAnimalType.destroy({
          where: { CauseFeederID: id },
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
