const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/TMRFormula"),
  { Op, fn } = require("sequelize");

const TMRFormulaToConcentrate = require("../models/TMRFormulaToConcentrate");
const Concentrate = require("../models/Concentrate");
const TMRFormulaToRoughages = require("../models/TMRFormulaToRoughages");
const Roughages = require("../models/Roughages");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.TMRFormulaID) $where["TMRFormulaID"] = req.query.TMRFormulaID;
    if (req.query.TMRFormulaCode)
      $where["TMRFormulaCode"] = {
        [Op.like]: "%" + req.query.TMRFormulaCode + "%",
      };
    if (req.query.TMRFormulaName)
      $where["TMRFormulaName"] = {
        [Op.like]: "%" + req.query.TMRFormulaName + "%",
      };

    if (req.query.TotalTMR) $where["TotalTMR"] = req.query.TotalTMR;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;
    if (req.query.ProteinPercentage)
      $where["ProteinPercentage"] = req.query.ProteinPercentage;
    if (req.query.CaloriePercentage)
      $where["CaloriePercentage"] = req.query.CaloriePercentage;
    if (req.query.Cost) $where["Cost"] = req.query.Cost;

    // ConcentrateID
    let WhereConcentrate = null;

    if (req.query.ConcentrateID) {
      WhereConcentrate = {
        ConcentrateID: {
          [Op.in]: JSON.parse(req.query.ConcentrateID),
        },
      };
    }

    // RoughagesID
    let WhereRoughages = null;

    if (req.query.RoughagesID) {
      WhereRoughages = {
        RoughagesID: {
          [Op.in]: JSON.parse(req.query.RoughagesID),
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
    $order = [["TMRFormulaID", "ASC"]];
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
        model: Concentrate,
        where: WhereConcentrate,
        through: { attributes: ["Amount"] },
      },
      {
        model: Roughages,
        where: WhereRoughages,
        through: { attributes: ["Amount"] },
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
              let concentrateArray = [];
              data.Concentrates.forEach((element) => {
                concentrateArray.push([
                  element.ConcentrateName,
                  element.TMRFormulaToConcentrate.Amount,
                ]);
              });

              let roughagesArray = [];
              data.Roughages.forEach((element) => {
                roughagesArray.push([
                  element.RoughagesName,
                  element.TMRFormulaToRoughages.Amount,
                ]);
              });

              data = {
                ...data.toJSON(),
                Concentrates: concentrateArray,
                ConcentrateID: JSON.parse(data.toJSON().ConcentrateID),
                Roughages: roughagesArray,
                RoughagesID: JSON.parse(data.toJSON().RoughagesID),
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
              model: Concentrate,
              through: { attributes: ["Amount"] },
            },
            {
              model: Roughages,
              through: { attributes: ["Amount"] },
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let concentrateArray = [];
        obj.toJSON().Concentrates.forEach((element) => {
          concentrateArray.push([
            element.ConcentrateName,
            element.TMRFormulaToConcentrate.Amount,
          ]);
        });

        let roughagesArray = [];
        obj.toJSON().Roughages.forEach((element) => {
          roughagesArray.push([
            element.RoughagesName,
            element.TMRFormulaToRoughages.Amount,
          ]);
        });

        obj = {
          ...obj.toJSON(),
          Concentrates: concentrateArray,
          Roughages: roughagesArray,
          ConcentrateID: JSON.parse(obj.toJSON().ConcentrateID),
          RoughagesID: JSON.parse(obj.toJSON().RoughagesID),
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
        if (!Array.isArray(data.ConcentrateID)) {
          reject(ErrorBadRequest("Concentrate ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        let ConcentrateIDList = [...data.ConcentrateID];
        data.ConcentrateID = JSON.stringify(data.ConcentrateID);

        if (!Array.isArray(data.RoughagesID)) {
          reject(ErrorBadRequest("Roughages ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        let RoughagesIDList = [...data.RoughagesID];
        data.RoughagesID = JSON.stringify(data.RoughagesID);

        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        // insert AnimalStatusToAnimalType
        ConcentrateIDList.forEach((ConcentrateID) => {
          const obj1 = TMRFormulaToConcentrate.create({
            TMRFormulaID: inserted.TMRFormulaID,
            ConcentrateID: ConcentrateID[0],
            Amount: ConcentrateID[1],
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        // insert AnimalStatusToAnimalSex
        RoughagesIDList.forEach((RoughagesID) => {
          const obj2 = TMRFormulaToRoughages.create({
            TMRFormulaID: inserted.TMRFormulaID,
            RoughagesID: RoughagesID[0],
            Amount: RoughagesID[1],
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        let res = methods.findById(inserted.TMRFormulaID);

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
        data.TMRFormulaID = parseInt(id);

        if (data.ConcentrateID) {
          if (!Array.isArray(data.ConcentrateID)) {
            reject(ErrorBadRequest("Concentrate ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var ConcentrateIDList = [...data.ConcentrateID];
          data.ConcentrateID = JSON.stringify(data.ConcentrateID);
        }

        if (data.RoughagesID) {
          if (!Array.isArray(data.RoughagesID)) {
            reject(ErrorBadRequest("Roughages ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }

          var RoughagesIDList = [...data.RoughagesID];
          data.RoughagesID = JSON.stringify(data.RoughagesID);
        }

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { TMRFormulaID: id } });

        if (data.ConcentrateID) {
          // ค้นหา table junction
          const searchTTC = await TMRFormulaToConcentrate.findAll({
            where: { TMRFormulaID: obj.TMRFormulaID },
          });

          // วนรอบ table junction ที่ได้เพื่อหา ConcentrateID ที่ตรงกันกับ Data อันใหม่ ทั้ง concentrate และ amount ถ้่าไม่เจอให้ลบ
          searchTTC.forEach((ttc) => {
            let i = 0;
            ConcentrateIDList.find((element) => {
              if (element[0] == ttc.ConcentrateID) {
                i = 1;
              }
            });

            if (i == 0) {
              TMRFormulaToConcentrate.destroy({
                where: {
                  TMRFormulaToConcentrateID: ttc.TMRFormulaToConcentrateID,
                },
              });
            }
          });

          ConcentrateIDList.forEach(async (ConcentrateID) => {
            const searchTTCOne = await TMRFormulaToConcentrate.findOne({
              where: {
                TMRFormulaID: obj.TMRFormulaID,
                ConcentrateID: ConcentrateID[0],
              },
            });

            if (!searchTTCOne) {
              const obj1 = TMRFormulaToConcentrate.create({
                TMRFormulaID: obj.TMRFormulaID,
                ConcentrateID: ConcentrateID[0],
                Amount: ConcentrateID[1],
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            } else {
              searchTTCOne.Amount = ConcentrateID[1];
              await searchTTCOne.save();
            }
          });
        }

        if (data.RoughagesID) {
          // ค้นหา table junction
          const searchTTR = await TMRFormulaToRoughages.findAll({
            where: { TMRFormulaID: obj.TMRFormulaID },
          });

          // วนรอบ table junction ที่ได้เพื่อหา ConcentrateID ที่ตรงกันกับ Data อันใหม่ ทั้ง concentrate และ amount ถ้่าไม่เจอให้ลบ
          searchTTR.forEach((ttr) => {
            let i = 0;
            RoughagesIDList.find((element) => {
              if (element[0] == ttr.RoughagesID) {
                i = 1;
              }
            });

            if (i == 0) {
              TMRFormulaToRoughages.destroy({
                where: {
                  TMRFormulaToRoughagesID: ttr.TMRFormulaToRoughagesID,
                },
              });
            }
          });

          RoughagesIDList.forEach(async (RoughagesID) => {
            const searchTTROne = await TMRFormulaToRoughages.findOne({
              where: {
                TMRFormulaID: obj.TMRFormulaID,
                RoughagesID: RoughagesID[0],
              },
            });

            if (!searchTTROne) {
              const obj2 = TMRFormulaToRoughages.create({
                TMRFormulaID: obj.TMRFormulaID,
                RoughagesID: RoughagesID[0],
                Amount: RoughagesID[1],
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            } else {
              searchTTROne.Amount = RoughagesID[1];
              await searchTTROne.save();
            }
          });
        }

        let res = methods.findById(data.TMRFormulaID);

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
          { where: { TMRFormulaID: id } }
        );

        const obj1 = TMRFormulaToConcentrate.update(
          { isRemove: 1, isActive: 0, updatedAt: fn("GETDATE") },
          { where: { TMRFormulaID: id } }
        );

        const obj2 = TMRFormulaToRoughages.update(
          { isRemove: 1, isActive: 0, updatedAt: fn("GETDATE") },
          { where: { TMRFormulaID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
