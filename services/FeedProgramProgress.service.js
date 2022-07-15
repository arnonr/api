const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/FeedProgramProgress"),
  { Op } = require("sequelize");

const FeedPPToConcentrate = require("../models/FeedPPToConcentrate");
const Concentrate = require("../models/Concentrate");
const FeedPPToRoughages = require("../models/FeedPPToRoughages");
const Roughages = require("../models/Roughages");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.FeedProgramProgressID) $where["FeedProgramProgressID"] = req.query.FeedProgramProgressID;
    if (req.query.FeedProgramID) $where["FeedProgramID"] = req.query.FeedProgramID;
    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

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
    $order = [["FeedProgramProgressID", "ASC"]];
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
                  element.FeedPPToConcentrate.Amount,
                ]);
              });

              let roughagesArray = [];
              data.Roughages.forEach((element) => {
                roughagesArray.push([
                  element.RoughagesName,
                  element.FeedPPToRoughages.Amount,
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
            element.FeedPPToConcentrate.Amount,
          ]);
        });

        let roughagesArray = [];
        obj.toJSON().Roughages.forEach((element) => {
          roughagesArray.push([
            element.RoughagesName,
            element.FeedPPToRoughages.Amount,
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

        const obj = new db(data);
        const inserted = await obj.save();

        // insert AnimalStatusToAnimalType
        ConcentrateIDList.forEach((ConcentrateID) => {
          const obj1 = FeedPPToConcentrate.create({
            FeedProgramProgressID: inserted.FeedProgramProgressID,
            ConcentrateID: ConcentrateID[0],
            Amount: ConcentrateID[1],
            CreatedUserID: data.CreatedUserID,
          });
        });

        // insert AnimalStatusToAnimalSex
        RoughagesIDList.forEach((RoughagesID) => {
          const obj2 = FeedPPToRoughages.create({
            FeedProgramProgressID: inserted.FeedProgramProgressID,
            RoughagesID: RoughagesID[0],
            Amount: RoughagesID[1],
            CreatedUserID: data.CreatedUserID,
          });
        });

        let res = methods.findById(inserted.FeedProgramProgressID);

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
        data.FeedProgramProgressID = parseInt(id);

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

        await db.update(data, { where: { FeedProgramProgressID: id } });


        if (data.ConcentrateID) {
          // ค้นหา table junction
          const searchFPPTC = await FeedPPToConcentrate.findAll({
            where: { FeedProgramProgressID: obj.FeedProgramProgressID },
          });

          // วนรอบ table junction ที่ได้เพื่อหา ConcentrateID ที่ตรงกันกับ Data อันใหม่ ทั้ง concentrate และ amount ถ้่าไม่เจอให้ลบ
          searchFPPTC.forEach((fpptc) => {
            let i = 0;
            ConcentrateIDList.find((element) => {
              if (element[0] == fpptc.ConcentrateID) {
                i = 1;
              }
            });

            if (i == 0) {
              FeedPPToConcentrate.destroy({
                where: {
                  FeedPPToConcentrateID: fpptc.FeedPPToConcentrateID,
                },
              });
            }
          });
          // 
          ConcentrateIDList.forEach(async (ConcentrateID) => {
            const searchFPPTCOne = await FeedPPToConcentrate.findOne({
              where: {
                FeedProgramProgressID: obj.FeedProgramProgressID,
                ConcentrateID: ConcentrateID[0],
              },
            });

            if (!searchFPPTCOne) {
              const obj1 = await FeedPPToConcentrate.create({
                FeedProgramProgressID: obj.FeedProgramProgressID,
                ConcentrateID: ConcentrateID[0],
                Amount: ConcentrateID[1],
                CreatedUserID: data.UpdatedUserID,
              });
            }else{
              searchFPPTCOne.Amount = ConcentrateID[1];
              await searchFPPTCOne.save();
            }
          });
        }

        if (data.RoughagesID) {
          // ค้นหา table junction
          const searchTTR = await FeedPPToRoughages.findAll({
            where: { FeedProgramProgressID: obj.FeedProgramProgressID },
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
              FeedPPToRoughages.destroy({
                where: {
                  FeedPPToRoughagesID: ttr.FeedPPToRoughagesID,
                },
              });
            }
          });

          RoughagesIDList.forEach(async (RoughagesID) => {
            const searchTTROne = await FeedPPToRoughages.findOne({
              where: {
                FeedProgramProgressID: obj.FeedProgramProgressID,
                RoughagesID: RoughagesID[0],
              },
            });

            if (!searchTTROne) {
              const obj2 = await FeedPPToRoughages.create({
                FeedProgramProgressID: obj.FeedProgramProgressID,
                RoughagesID: RoughagesID[0],
                Amount: RoughagesID[1],
                CreatedUserID: data.UpdatedUserID,
              });
            }else{
              searchTTROne.Amount = RoughagesID[1];
              await searchTTROne.save();
            }
          });
        }

        let res = methods.findById(data.FeedProgramProgressID);
        
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
          { where: { FeedProgramProgressID: id } }
        );

        const obj1 = FeedPPToConcentrate.update(
          { isRemove: 1, isActive: 0 },
          { where: { FeedProgramProgressID: id } }
        );

        const obj2 = FeedPPToRoughages.update(
          { isRemove: 1, isActive: 0 },
          { where: { FeedProgramProgressID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
