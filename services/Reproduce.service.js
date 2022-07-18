const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Reproduce"),
  { Op } = require("sequelize");

const RpToOvarySymptom = require("../models/RpToLeftOvarySymptom");
const RpToVaginaSymptom = require("../models/RpToVaginaSymptom");
const OvarySymptom = require("../models/OvarySymptom");
const VaginaSymptom = require("../models/VaginaSymptom");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.ReproduceID) $where["ReproduceID"] = req.query.ReproduceID;
    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;
    if (req.query.HeatTypeID) $where["HeatTypeID"] = req.query.HeatTypeID;
    if (req.query.HeatCircleID) $where["HeatCircleID"] = req.query.HeatCircleID;

    // AnimalTypeID
    let WhereLeftOvarySymptom = null;
    if (req.query.LeftOvarySymptomID) {
      WhereLeftOvarySymptom = {
        OvarySymptomID: {
          [Op.in]: JSON.parse(req.query.LeftOvarySymptomID),
        },
      };
    }

    // AnimalTypeID
    let WhereRightOvarySymptom = null;
    if (req.query.RightOvarySymptomID) {
      WhereRightOvarySymptom = {
        OvarySymptomID: {
          [Op.in]: JSON.parse(req.query.RightOvarySymptomID),
        },
      };
    }

    // AnimalTypeID
    let WhereVaginaSymptom = null;
    if (req.query.VaginaSymptomID) {
      WhereVaginaSymptom = {
        VaginaSymptomID: {
          [Op.in]: JSON.parse(req.query.VaginaSymptomID),
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
    $order = [["ReproduceID", "ASC"]];
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
        model: OvarySymptom,
        where: WhereLeftOvarySymptom,
      },
      {
        model: VaginaSymptom,
        where: WhereVaginaSymptom,
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
              let leftOvarySymptomArray = [];
              data.LeftOvarySymptom.forEach((element) => {
                leftOvarySymptomArray.push(element.OvarySymptomName);
              });

              let vaginaSymptomArray = [];
              data.VaginaSymptom.forEach((element) => {
                vaginaSymptomArray.push(element.VaginaSymptomName);
              });

              data = {
                ...data.toJSON(),
                LeftOvarySymptomArray: leftOvarySymptomArray,
                LeftOvarySymptomID: JSON.parse(
                  data.toJSON().LeftOvarySymptomID
                ),
                VaginaSymptom: vaginaSymptomArray,
                VaginaSymptomID: JSON.parse(data.toJSON().VaginaSymptomID),
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
              model: OvarySymptom,
            },
            {
              model: VaginaSymptom,
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let leftOvarySymptomArray = [];
        obj.toJSON().LeftOvarySymptom.forEach((element) => {
          leftOvarySymptomArray.push(element.OvarySymptomName);
        });

        let vaginaSymptomArray = [];
        obj.toJSON().VaginaSymptom.forEach((element) => {
          vaginaSymptomArray.push(element.VaginaSymptomName);
        });

        obj = {
          ...obj.toJSON(),
          LeftOvarySymptom: leftOvarySymptomArray,
          VaginaSymptom: vaginaSymptomArray,
          LeftOvarySymptomID: JSON.parse(obj.toJSON().LeftOvarySymptomID),
          VaginaSymptomID: JSON.parse(obj.toJSON().VaginaSymptomID),
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
        if (data.LeftOvarySymptomID) {
          if (!Array.isArray(data.LeftOvarySymptomID)) {
            reject(
              ErrorBadRequest("LeftOvarySymptom ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var LeftOvarySymptomIDList = [...data.LeftOvarySymptomID];
          data.LeftOvarySymptomID = JSON.stringify(data.LeftOvarySymptomID);
        }

        if (data.VaginaSymptomID) {
          if (!Array.isArray(data.VaginaSymptomID)) {
            reject(ErrorBadRequest("VaginaSymptom ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var VaginaSymptomIDList = [...data.VaginaSymptomID];
          data.VaginaSymptomID = JSON.stringify(data.VaginaSymptomID);
        }

        const obj = new db(data);
        const inserted = await obj.save();

        if (data.LeftOvarySymptomID) {
          // insert ReproduceToAnimalType
          LeftOvarySymptomIDList.forEach((LeftOvarySymptomID) => {
            const obj1 = RpToOvarySymptom.create({
              ReproduceID: inserted.ReproduceID,
              OvarySymptomID: LeftOvarySymptomID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.VaginaSymptomID) {
          // insert ReproduceToAnimalSex
          VaginaSymptomIDList.forEach((VaginaSymptomID) => {
            const obj1 = RpToVaginaSymptom.create({
              ReproduceID: inserted.ReproduceID,
              VaginaSymptomID: VaginaSymptomID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        let res = methods.findById(inserted.ReproduceID);

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
        data.ReproduceID = parseInt(id);

        if (data.LeftOvarySymptomID) {
          var LeftOvarySymptomIDList = [...data.LeftOvarySymptomID];
          data.LeftOvarySymptomID = JSON.stringify(data.LeftOvarySymptomID);
        }

        if (data.VaginaSymptomID) {
          var VaginaSymptomIDList = [...data.VaginaSymptomID];
          data.VaginaSymptomID = JSON.stringify(data.VaginaSymptomID);
        }

        await db.update(data, { where: { ReproduceID: id } });

        if (data.LeftOvarySymptomID) {
          // insert ProjectToAnimalType
          const searchATA = await RpToOvarySymptom.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          searchATA.forEach((ata) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!LeftOvarySymptomIDList.includes(ata.LefOvarySymptomID)) {
              ReproduceToAnimalType.destroy({
                where: {
                  ReproduceToAnimalTypeID: ata.ReproduceToAnimalTypeID,
                },
              });
            }
          });

          AnimalTypeIDList.forEach(async (AnimalTypeID) => {
            const searchATAOne = await ReproduceToAnimalType.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                AnimalTypeID: AnimalTypeID,
              },
            });

            if (!searchATAOne) {
              const obj1 = ReproduceToAnimalType.create({
                ReproduceID: obj.ReproduceID,
                AnimalTypeID: AnimalTypeID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }
        //

        if (data.AnimalSexID) {
          // insert ProjectToAnimalType
          const searchATS = await ReproduceToAnimalSex.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });

          // loop ats ของทั้งหมดที่มาจาก DB
          searchATS.forEach((ats) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!AnimalSexIDList.includes(ats.AnimalSexID)) {
              ReproduceToAnimalSex.destroy({
                where: {
                  ReproduceToAnimalSexID: ats.ReproduceToAnimalSexID,
                },
              });
            }
          });

          AnimalSexIDList.forEach(async (AnimalSexID) => {
            const searchATSOne = await ReproduceToAnimalSex.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                AnimalSexID: AnimalSexID,
              },
            });

            if (!searchATSOne) {
              const obj1 = ReproduceToAnimalSex.create({
                ReproduceID: obj.ReproduceID,
                AnimalSexID: AnimalSexID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }
        //

        let res = methods.findById(data.ReproduceID);

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
          { where: { ReproduceID: id } }
        );

        // delete ProjectToAnimalType
        const obj1 = RpToOvarySymptom.update(
          { isRemove: 1, isActive: 0 },
          { where: { ReproduceID: id } }
        );

        const obj2 = RpToVaginaSymptom.update(
          { isRemove: 1, isActive: 0 },
          { where: { ReproduceID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
