const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/CauseEnvironment"),
  { Op, fn } = require("sequelize");

const CauseEnvToAnimalType = require("../models/CauseEnvToAnimalType");
const AnimalType = require("../models/AnimalType");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.CauseEnvironmentID)
      $where["CauseEnvironmentID"] = req.query.CauseEnvironmentID;

    if (req.query.CauseEnvironmentCode)
      $where["CauseEnvironmentCode"] = {
        [Op.like]: "%" + req.query.CauseEnvironmentCode + "%",
      };

    if (req.query.CauseEnvironmentName)
      $where["CauseEnvironmentName"] = {
        [Op.like]: "%" + req.query.CauseEnvironmentName + "%",
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
    $order = [["CauseEnvironmentID", "ASC"]];
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

        // insert CauseEnvToAnimalType
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = CauseEnvToAnimalType.create({
            CauseEnvironmentID: inserted.CauseEnvironmentID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        let res = methods.findById(inserted.CauseEnvironmentID);

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
        data.CauseEnvironmentID = parseInt(id);

        if (data.AnimalTypeID) {
          if (!Array.isArray(data.AnimalTypeID)) {
            reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var AnimalTypeIDList = [...data.AnimalTypeID];
          data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);
        }

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { CauseEnvironmentID: id } });

        if (data.AnimalTypeID === null) {
          CauseEnvToAnimalType.destroy({
            where: {
              CauseEnvironmentID: id,
            },
            // truncate: true,
          });
        }

        if (data.AnimalTypeID) {
          // insert CauseEnvToAnimalType
          const searchPTA = await CauseEnvToAnimalType.findAll({
            where: { CauseEnvironmentID: obj.CauseEnvironmentID },
          });
          // loop pta ของโครงการนี้ทั้งหมดที่มาจาก DB
          searchPTA.forEach((pta) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!AnimalTypeIDList.includes(pta.AnimalTypeID)) {
              CauseEnvToAnimalType.destroy({
                where: {
                  CauseEnvToAnimalTypeID: pta.CauseEnvToAnimalTypeID,
                },
              });
            }
          });

          AnimalTypeIDList.forEach(async (AnimalTypeID) => {
            const searchPTAOne = await CauseEnvToAnimalType.findOne({
              where: {
                CauseEnvironmentID: obj.CauseEnvironmentID,
                AnimalTypeID: AnimalTypeID,
              },
            });

            if (!searchPTAOne) {
              const obj1 = CauseEnvToAnimalType.create({
                CauseEnvironmentID: obj.CauseEnvironmentID,
                AnimalTypeID: AnimalTypeID,
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            }
          });
        }
        let res = methods.findById(data.CauseEnvironmentID);
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
          { where: { CauseEnvironmentID: id } }
        );

        // delete CauseEnvToAnimalType
        const obj1 = CauseEnvToAnimalType.update(
          { isRemove: 1, isActive: 0, updatedAt: fn("GETDATE") },
          { where: { CauseEnvironmentID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
