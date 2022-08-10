const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Reproduce"),
  { Op } = require("sequelize");

const RpToLeftOvarySymptom = require("../models/RpToLeftOvarySymptom");
const RpToRightOvarySymptom = require("../models/RpToRightOvarySymptom");
const OvarySymptom = require("../models/OvarySymptom");
const VaginaSymptom = require("../models/VaginaSymptom");
const RpToVaginaSymptom = require("../models/RpToVaginaSymptom");
const OtherSymptom = require("../models/OtherSymptom");
const RpToOtherSymptom = require("../models/RpToOtherSymptom");
const CauseAnimal = require("../models/CauseAnimal");
const RpToCauseAnimal = require("../models/RpToCauseAnimal");
const CauseEnvironment = require("../models/CauseEnvironment");
const RpToCauseEnvironment = require("../models/RpToCauseEnvironment");
const CauseFeeder = require("../models/CauseFeeder");
const RpToCauseFeeder = require("../models/RpToCauseFeeder");
const CauseHealth = require("../models/CauseHealth");
const RpToCauseHealth = require("../models/RpToCauseHealth");
const CureHormone = require("../models/CureHormone");
const RpToCureHormone = require("../models/RpToCureHormone");
const CureAntibiotic = require("../models/CureAntibiotic");
const RpToCureAntibiotic = require("../models/RpToCureAntibiotic");
const CureVitamin = require("../models/CureVitamin");
const RpToCureVitamin = require("../models/RpToCureVitamin");
const ReproduceSuggestion = require("../models/ReproduceSuggestion");
const RpToRpSuggestion = require("../models/RpToRpSuggestion");

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
        as: "LeftOvarySymptom",
        where: WhereLeftOvarySymptom,
      },
      {
        model: OvarySymptom,
        as: "RightOvarySymptom",
        where: WhereRightOvarySymptom,
      },
      {
        model: VaginaSymptom,
        where: WhereVaginaSymptom,
        as: "VaginaSymptom",
      },
      {
        model: OtherSymptom,
        // where: WhereVOtherSymptom,
        as: "OtherSymptom",
      },
      {
        model: CauseAnimal,
        as: "CauseAnimal",
      },
      {
        model: CauseEnvironment,
        as: "CauseEnvironment",
      },
      {
        model: CauseFeeder,
        as: "CauseFeeder",
      },
      {
        model: CauseHealth,
        as: "CauseHealth",
      },
      {
        model: CureAntibiotic,
        as: "CureAntibiotic",
        through: { attributes: ["Amount"] },
      },
      {
        model: CureHormone,
        as: "CureHormone",
        through: { attributes: ["Amount"] },
      },
      {
        model: CureVitamin,
        as: "CureVitamin",
        through: { attributes: ["Amount"] },
      },
      {
        model: ReproduceSuggestion,
        as: "ReproduceSuggestion",
      },
    ];

    return { query: query };
  },

  getData(obj) {
    let dataJson = obj.toJSON();

    let leftOvarySymptomArray = [];
    dataJson.LeftOvarySymptom.forEach((element) => {
      leftOvarySymptomArray.push(element.OvarySymptomName);
    });

    let rightOvarySymptomArray = [];
    obj.toJSON().RightOvarySymptom.forEach((element) => {
      rightOvarySymptomArray.push(element.OvarySymptomName);
    });

    let vaginaSymptomArray = [];
    obj.toJSON().VaginaSymptom.forEach((element) => {
      vaginaSymptomArray.push(element.VaginaSymptomName);
    });

    let otherSymptomArray = [];
    obj.toJSON().OtherSymptom.forEach((element) => {
      otherSymptomArray.push(element.OtherSymptomName);
    });

    let causeAnimalArray = [];
    obj.toJSON().CauseAnimal.forEach((element) => {
      causeAnimalArray.push(element.CauseAnimalName);
    });

    let causeEnvironmentArray = [];
    obj.toJSON().CauseEnvironment.forEach((element) => {
      causeEnvironmentArray.push(element.CauseEnvironmentName);
    });

    let causeFeederArray = [];
    obj.toJSON().CauseFeeder.forEach((element) => {
      causeFeederArray.push(element.CauseFeederName);
    });

    let causeHealthArray = [];
    obj.toJSON().CauseHealth.forEach((element) => {
      causeHealthArray.push(element.CauseHealthName);
    });

    let cureAntibioticArray = [];
    obj.toJSON().CureAntibiotic.forEach((element) => {
      cureAntibioticArray.push([
        element.CureAntibioticName,
        element.RpToCureAntibiotic.Amount,
      ]);
    });

    let cureHormoneArray = [];
    obj.toJSON().CureHormone.forEach((element) => {
      cureHormoneArray.push([
        element.CureHormoneName,
        element.RpToCureHormone.Amount,
      ]);
    });

    let cureVitaminArray = [];
    obj.toJSON().CureVitamin.forEach((element) => {
      cureVitaminArray.push([
        element.CureVitaminName,
        element.RpToCureVitamin.Amount,
      ]);
    });

    let reproduceSuggestionArray = [];
    obj.toJSON().ReproduceSuggestion.forEach((element) => {
      reproduceSuggestionArray.push(element.ReproduceSuggestionName);
    });

    obj = {
      AnimalID: dataJson.AnimalID,
      ThaiReproduceDate: dataJson.ThaiReproduceDate,
      ThaiStandingHeatDate: dataJson.ThaiStandingHeatDate,
      BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
      HeatTypeName: dataJson.HeatType ? dataJson.HeatType.HeatTypeName : null,
      HeatCircleName: dataJson.HeatCircle
        ? dataJson.HeatCircle.HeatCircleName
        : null,
      FarmerRemark: dataJson.FarmerRemark,
      DiagnoseVulvaName: dataJson.DiagnoseVulva
        ? dataJson.DiagnoseVulva == "INTUMESCE"
          ? "บวม"
          : "ไม่บวม"
        : null,

      DiagnoseVaginaName: dataJson.DiagnoseVulva
        ? dataJson.DiagnoseVulva == "INTUMESCE"
          ? "บวม"
          : "ไม่บวม"
        : null,

      DiagnoseVaginaMucilageName: dataJson.DiagnoseVaginaMucilage
        ? dataJson.DiagnoseVaginaMucilage == "YES"
          ? "มีเมือก"
          : "ไม่มีเมือก"
        : null,

      CervixTypeName: dataJson.CervixType
        ? dataJson.CervixType == "CURVE"
          ? "คด"
          : "ไม่คด"
        : null,

      CervicalName: dataJson.Cervical
        ? dataJson.Cervical == "CLOSE"
          ? "ปิด"
          : "เปิด"
        : null,

      AdnexaTypeName: dataJson.AdnexaType
        ? dataJson.AdnexaType == "EQUAL"
          ? "เท่ากัน"
          : "ไม่เท่ากัน"
        : null,

      AdnexaToneName: !dataJson.AdnexaType
        ? null
        : dataJson.AdnexaType == 1
        ? "+"
        : dataJson.AdnexaType == 2
        ? "++"
        : dataJson.AdnexaType == 3
        ? "+++"
        : dataJson.AdnexaType == 4
        ? "++++"
        : null,

      CureByHormoneName: dataJson.CureByHormone
        ? dataJson.CureByHormone == 1
          ? "checked"
          : "unchecked"
        : null,

      CureByAntibioticName: dataJson.CureByAntibiotic
        ? dataJson.CureByAntibiotic == 1
          ? "checked"
          : "unchecked"
        : null,

      CureByVitaminName: dataJson.CureByVitamin
        ? dataJson.CureByVitamin == 1
          ? "checked"
          : "unchecked"
        : null,

      ...dataJson,

      LeftOvarySymptom: leftOvarySymptomArray,
      LeftOvarySymptomID: JSON.parse(obj.toJSON().LeftOvarySymptomID),
      RightOvarySymptom: rightOvarySymptomArray,
      RightOvarySymptomID: JSON.parse(obj.toJSON().RightOvarySymptomID),
      VaginaSymptom: vaginaSymptomArray,
      VaginaSymptomID: JSON.parse(obj.toJSON().VaginaSymptomID),
      OtherSymptom: otherSymptomArray,
      OtherSymptomID: JSON.parse(obj.toJSON().OtherSymptomID),
      CauseAnimal: causeAnimalArray,
      CauseAnimalID: JSON.parse(obj.toJSON().CauseAnimalID),
      CauseEnvironment: causeEnvironmentArray,
      CauseEnvironmentID: JSON.parse(obj.toJSON().CauseEnvironmentID),
      CauseFeeder: causeFeederArray,
      CauseFeederID: JSON.parse(obj.toJSON().CauseFeederID),
      CauseHealth: causeHealthArray,
      CauseHealthID: JSON.parse(obj.toJSON().CauseHealthID),
      CureAntibiotic: cureAntibioticArray,
      CureAntibioticID: JSON.parse(obj.toJSON().CureAntibioticID),
      CureHormone: cureHormoneArray,
      CureHormoneID: JSON.parse(obj.toJSON().CureHormoneID),
      CureVitamin: cureVitaminArray,
      CureVitaminID: JSON.parse(obj.toJSON().CureVitaminID),
      ReproduceSuggestion: reproduceSuggestionArray,
      ReproduceSuggestionID: JSON.parse(obj.toJSON().ReproduceSuggestionID),
      ResponsibilityStaffName: dataJson.Staff
        ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
        : null,
    };

    return obj;
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

            rows = rows.map((data) => {
              data = this.getData(data);
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
              as: "RightOvarySymptom",
            },
            {
              model: OvarySymptom,
              as: "LeftOvarySymptom",
            },
            {
              model: VaginaSymptom,
              as: "VaginaSymptom",
            },
            {
              model: OtherSymptom,
              as: "OtherSymptom",
            },
            {
              model: CauseAnimal,
              as: "CauseAnimal",
            },
            {
              model: CauseEnvironment,
              as: "CauseEnvironment",
            },
            {
              model: CauseFeeder,
              as: "CauseFeeder",
            },
            {
              model: CauseHealth,
              as: "CauseHealth",
            },
            {
              model: CureAntibiotic,
              as: "CureAntibiotic",
              through: { attributes: ["Amount"] },
            },
            {
              model: CureHormone,
              as: "CureHormone",
              through: { attributes: ["Amount"] },
            },
            {
              model: CureVitamin,
              as: "CureVitamin",
              through: { attributes: ["Amount"] },
            },
            {
              model: ReproduceSuggestion,
              as: "ReproduceSuggestion",
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let data = this.getData(obj);

        resolve(data);
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

        if (data.RightOvarySymptomID) {
          if (!Array.isArray(data.RightOvarySymptomID)) {
            reject(
              ErrorBadRequest("RightOvarySymptom ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var RightOvarySymptomIDList = [...data.RightOvarySymptomID];
          data.RightOvarySymptomID = JSON.stringify(data.RightOvarySymptomID);
        }

        if (data.VaginaSymptomID) {
          if (!Array.isArray(data.VaginaSymptomID)) {
            reject(ErrorBadRequest("VaginaSymptom ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var VaginaSymptomIDList = [...data.VaginaSymptomID];
          data.VaginaSymptomID = JSON.stringify(data.VaginaSymptomID);
        }

        if (data.OtherSymptomID) {
          if (!Array.isArray(data.OtherSymptomID)) {
            reject(ErrorBadRequest("OtherSymptom ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var OtherSymptomIDList = [...data.OtherSymptomID];
          data.OtherSymptomID = JSON.stringify(data.OtherSymptomID);
        }

        if (data.CauseAnimalID) {
          if (!Array.isArray(data.CauseAnimalID)) {
            reject(ErrorBadRequest("CauseAnimal ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CauseAnimalIDList = [...data.CauseAnimalID];
          data.CauseAnimalID = JSON.stringify(data.CauseAnimalID);
        }

        if (data.CauseEnvironmentID) {
          if (!Array.isArray(data.CauseEnvironmentID)) {
            reject(
              ErrorBadRequest("Cause Environment ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var CauseEnvironmentIDList = [...data.CauseEnvironmentID];
          data.CauseEnvironmentID = JSON.stringify(data.CauseEnvironmentID);
        }

        if (data.CauseFeederID) {
          if (!Array.isArray(data.CauseFeederID)) {
            reject(ErrorBadRequest("Caus Feeder ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CauseFeederIDList = [...data.CauseFeederID];
          data.CauseFeederID = JSON.stringify(data.CauseFeederID);
        }

        if (data.CauseHealthID) {
          if (!Array.isArray(data.CauseHealthID)) {
            reject(ErrorBadRequest("Cause Health ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CauseHealthIDList = [...data.CauseHealthID];
          data.CauseHealthID = JSON.stringify(data.CauseHealthID);
        }

        if (data.CureAntibioticID) {
          if (!Array.isArray(data.CureAntibioticID)) {
            reject(
              ErrorBadRequest("Cure Antibiotic ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var CureAntibioticIDList = [...data.CureAntibioticID];
          data.CureAntibioticID = JSON.stringify(data.CureAntibioticID);
        }

        if (data.CureHormoneID) {
          if (!Array.isArray(data.CureHormoneID)) {
            reject(ErrorBadRequest("Cure Hormone ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CureHormoneIDList = [...data.CureHormoneID];
          data.CureHormoneID = JSON.stringify(data.CureHormoneID);
        }

        if (data.CureVitaminID) {
          if (!Array.isArray(data.CureVitaminID)) {
            reject(ErrorBadRequest("Cure Vitamin ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CureVitaminIDList = [...data.CureVitaminID];
          data.CureVitaminID = JSON.stringify(data.CureVitaminID);
        }

        if (data.ReproduceSuggestionID) {
          if (!Array.isArray(data.ReproduceSuggestionID)) {
            reject(
              ErrorBadRequest("ReproduceSuggestion ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var ReproduceSuggestionIDList = [...data.ReproduceSuggestionID];
          data.ReproduceSuggestionID = JSON.stringify(
            data.ReproduceSuggestionID
          );
        }

        // return
        const obj = new db(data);
        const inserted = await obj.save();

        // return

        if (data.LeftOvarySymptomID) {
          // insert RpToAnimalType
          LeftOvarySymptomIDList.forEach((LeftOvarySymptomID) => {
            const obj1 = RpToLeftOvarySymptom.create({
              ReproduceID: inserted.ReproduceID,
              OvarySymptomID: LeftOvarySymptomID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.RightOvarySymptomID) {
          // insert RpToAnimalType
          RightOvarySymptomIDList.forEach((RightOvarySymptomID) => {
            const obj1 = RpToRightOvarySymptom.create({
              ReproduceID: inserted.ReproduceID,
              OvarySymptomID: RightOvarySymptomID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.OtherSymptomID) {
          // insert RpToAnimalType
          OtherSymptomIDList.forEach((OtherSymptomID) => {
            const obj1 = RpToOtherSymptom.create({
              ReproduceID: inserted.ReproduceID,
              OtherSymptomID: OtherSymptomID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.VaginaSymptomID) {
          // insert RpToAnimalSex
          VaginaSymptomIDList.forEach((VaginaSymptomID) => {
            const obj1 = RpToVaginaSymptom.create({
              ReproduceID: inserted.ReproduceID,
              VaginaSymptomID: VaginaSymptomID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.CauseAnimalID) {
          // insert RpToAnimalSex
          CauseAnimalIDList.forEach((CauseAnimalID) => {
            const obj1 = RpToCauseAnimal.create({
              ReproduceID: inserted.ReproduceID,
              CauseAnimalID: CauseAnimalID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.CauseEnvironmentID) {
          CauseEnvironmentIDList.forEach((CauseEnvironmentID) => {
            const obj1 = RpToCauseEnvironment.create({
              ReproduceID: inserted.ReproduceID,
              CauseEnvironmentID: CauseEnvironmentID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.CauseFeederID) {
          CauseFeederIDList.forEach((CauseFeederID) => {
            const obj1 = RpToCauseFeeder.create({
              ReproduceID: inserted.ReproduceID,
              CauseFeederID: CauseFeederID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.CauseHealthID) {
          CauseHealthIDList.forEach((CauseHealthID) => {
            const obj1 = RpToCauseHealth.create({
              ReproduceID: inserted.ReproduceID,
              CauseHealthID: CauseHealthID,
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.CureAntibioticID) {
          CureAntibioticIDList.forEach((CureAntibioticID) => {
            const obj1 = RpToCureAntibiotic.create({
              ReproduceID: inserted.ReproduceID,
              CureAntibioticID: CureAntibioticID[0],
              Amount: CureAntibioticID[1],
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.CureHormoneID) {
          CureHormoneIDList.forEach((CureHormoneID) => {
            const obj1 = RpToCureHormone.create({
              ReproduceID: inserted.ReproduceID,
              CureHormoneID: CureHormoneID[0],
              Amount: CureHormoneID[1],
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.CureVitaminID) {
          CureVitaminIDList.forEach((CureVitaminID) => {
            const obj1 = RpToCureVitamin.create({
              ReproduceID: inserted.ReproduceID,
              CureVitaminID: CureVitaminID[0],
              Amount: CureVitaminID[1],
              CreatedUserID: data.CreatedUserID,
            });
          });
        }

        if (data.ReproduceSuggestionID) {
          ReproduceSuggestionIDList.forEach((ReproduceSuggestionID) => {
            const obj1 = RpToRpSuggestion.create({
              ReproduceID: inserted.ReproduceID,
              ReproduceSuggestionID: ReproduceSuggestionID,
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

        if (data.RightOvarySymptomID) {
          if (!Array.isArray(data.RightOvarySymptomID)) {
            reject(
              ErrorBadRequest("RightOvarySymptom ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var RightOvarySymptomIDList = [...data.RightOvarySymptomID];
          data.RightOvarySymptomID = JSON.stringify(data.RightOvarySymptomID);
        }

        if (data.VaginaSymptomID) {
          if (!Array.isArray(data.VaginaSymptomID)) {
            reject(ErrorBadRequest("VaginaSymptom ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var VaginaSymptomIDList = [...data.VaginaSymptomID];
          data.VaginaSymptomID = JSON.stringify(data.VaginaSymptomID);
        }

        if (data.OtherSymptomID) {
          if (!Array.isArray(data.OtherSymptomID)) {
            reject(ErrorBadRequest("OtherSymptom ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var OtherSymptomIDList = [...data.OtherSymptomID];
          data.OtherSymptomID = JSON.stringify(data.OtherSymptomID);
        }

        if (data.CauseAnimalID) {
          if (!Array.isArray(data.CauseAnimalID)) {
            reject(ErrorBadRequest("CauseAnimal ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CauseAnimalIDList = [...data.CauseAnimalID];
          data.CauseAnimalID = JSON.stringify(data.CauseAnimalID);
        }

        if (data.CauseEnvironmentID) {
          if (!Array.isArray(data.CauseEnvironmentID)) {
            reject(
              ErrorBadRequest("Cause Environment ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var CauseEnvironmentIDList = [...data.CauseEnvironmentID];
          data.CauseEnvironmentID = JSON.stringify(data.CauseEnvironmentID);
        }

        if (data.CauseFeederID) {
          if (!Array.isArray(data.CauseFeederID)) {
            reject(ErrorBadRequest("Caus Feeder ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CauseFeederIDList = [...data.CauseFeederID];
          data.CauseFeederID = JSON.stringify(data.CauseFeederID);
        }

        if (data.CauseHealthID) {
          if (!Array.isArray(data.CauseHealthID)) {
            reject(ErrorBadRequest("Cause Health ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CauseHealthIDList = [...data.CauseHealthID];
          data.CauseHealthID = JSON.stringify(data.CauseHealthID);
        }

        if (data.CureAntibioticID) {
          if (!Array.isArray(data.CureAntibioticID)) {
            reject(
              ErrorBadRequest("Cure Antibiotic ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var CureAntibioticIDList = [...data.CureAntibioticID];
          data.CureAntibioticID = JSON.stringify(data.CureAntibioticID);
        }

        if (data.CureHormoneID) {
          if (!Array.isArray(data.CureHormoneID)) {
            reject(ErrorBadRequest("Cure Hormone ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CureHormoneIDList = [...data.CureHormoneID];
          data.CureHormoneID = JSON.stringify(data.CureHormoneID);
        }

        if (data.CureVitaminID) {
          if (!Array.isArray(data.CureVitaminID)) {
            reject(ErrorBadRequest("Cure Vitamin ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var CureVitaminIDList = [...data.CureVitaminID];
          data.CureVitaminID = JSON.stringify(data.CureVitaminID);
        }

        if (data.ReproduceSuggestionID) {
          if (!Array.isArray(data.ReproduceSuggestionID)) {
            reject(
              ErrorBadRequest("ReproduceSuggestion ID ต้องอยู่ในรูปแบบ Array")
            );
            return;
          }
          var ReproduceSuggestionIDList = [...data.ReproduceSuggestionID];
          data.ReproduceSuggestionID = JSON.stringify(
            data.ReproduceSuggestionID
          );
        }

        await db.update(data, { where: { ReproduceID: id } });

        if (data.LeftOvarySymptomID === null) {
          RpToLeftOvarySymptom.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.LeftOvarySymptomID) {
          // insert ProjectToAnimalType
          const search = await RpToLeftOvarySymptom.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!LeftOvarySymptomIDList.includes(s.OvarySymptomID)) {
              RpToLeftOvarySymptom.destroy({
                where: {
                  RpToLeftOvarySymptomID: s.RpToLeftOvarySymptomID,
                },
              });
            }
          });

          LeftOvarySymptomIDList.forEach(async (ID) => {
            const search = await RpToLeftOvarySymptom.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                OvarySymptomID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToLeftOvarySymptom.create({
                ReproduceID: obj.ReproduceID,
                OvarySymptomID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }
        //

        if (data.RightOvarySymptomID === null) {
          RpToRightOvarySymptom.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.RightOvarySymptomID) {
          // insert ProjectToAnimalType
          const search = await RpToRightOvarySymptom.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!RightOvarySymptomIDList.includes(s.OvarySymptomID)) {
              RpToRightOvarySymptom.destroy({
                where: {
                  RpToRightOvarySymptomID: s.RpToRightOvarySymptomID,
                },
              });
            }
          });

          RightOvarySymptomIDList.forEach(async (ID) => {
            const search = await RpToRightOvarySymptom.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                OvarySymptomID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToRightOvarySymptom.create({
                ReproduceID: obj.ReproduceID,
                OvarySymptomID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }

        if (data.VaginaSymptomID === null) {
          RpToVaginaSymptom.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.VaginaSymptomID) {
          // insert ProjectToAnimalType
          const search = await RpToVaginaSymptom.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!VaginaSymptomIDList.includes(s.VaginaSymptomID)) {
              RpToVaginaSymptom.destroy({
                where: {
                  RpToVaginaSymptomID: s.RpToVaginaSymptomID,
                },
              });
            }
          });

          VaginaSymptomIDList.forEach(async (ID) => {
            const search = await RpToVaginaSymptom.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                VaginaSymptomID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToVaginaSymptom.create({
                ReproduceID: obj.ReproduceID,
                VaginaSymptomID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }

        if (data.OtherSymptomID === null) {
          RpToOtherSymptom.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.OtherSymptomID) {
          // insert ProjectToAnimalType
          const search = await RpToOtherSymptom.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!OtherSymptomIDList.includes(s.OtherSymptomID)) {
              RpToOtherSymptom.destroy({
                where: {
                  RpToOtherSymptomID: s.RpToOtherSymptomID,
                },
              });
            }
          });

          OtherSymptomIDList.forEach(async (ID) => {
            const search = await RpToOtherSymptom.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                OtherSymptomID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToOtherSymptom.create({
                ReproduceID: obj.ReproduceID,
                OtherSymptomID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }
        //

        if (data.CauseAnimalID === null) {
          RpToCauseAnimal.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.CauseAnimalID) {
          // insert ProjectToAnimalType
          const search = await RpToCauseAnimal.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!CauseAnimalIDList.includes(s.CauseAnimalID)) {
              RpToCauseAnimal.destroy({
                where: {
                  RpToCauseAnimalID: s.RpToCauseAnimalID,
                },
              });
            }
          });

          CauseAnimalIDList.forEach(async (ID) => {
            const search = await RpToCauseAnimal.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                CauseAnimalID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToCauseAnimal.create({
                ReproduceID: obj.ReproduceID,
                CauseAnimalID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }
        //

        if (data.CauseEnvironmentID === null) {
          RpToCauseEnvironment.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.CauseEnvironmentID) {
          // insert ProjectToAnimalType
          const search = await RpToCauseEnvironment.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!CauseEnvironmentIDList.includes(s.CauseEnvironmentID)) {
              RpToCauseEnvironment.destroy({
                where: {
                  RpToCauseEnvironmentID: s.RpToCauseEnvironmentID,
                },
              });
            }
          });

          CauseEnvironmentIDList.forEach(async (ID) => {
            const search = await RpToCauseEnvironment.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                CauseEnvironmentID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToCauseEnvironment.create({
                ReproduceID: obj.ReproduceID,
                CauseEnvironmentID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }
        //

        if (data.CauseFeederID === null) {
          RpToCauseFeeder.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.CauseFeederID) {
          // insert ProjectToAnimalType
          const search = await RpToCauseFeeder.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!CauseFeederIDList.includes(s.CauseFeederID)) {
              RpToCauseFeeder.destroy({
                where: {
                  RpToCauseFeederID: s.RpToCauseFeederID,
                },
              });
            }
          });

          CauseFeederIDList.forEach(async (ID) => {
            const search = await RpToCauseFeeder.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                CauseFeederID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToCauseFeeder.create({
                ReproduceID: obj.ReproduceID,
                CauseFeederID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }
        //

        if (data.CauseHealthID === null) {
          RpToCauseHealth.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.CauseHealthID) {
          // insert ProjectToAnimalType
          const search = await RpToCauseHealth.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!CauseHealthIDList.includes(s.CauseHealthID)) {
              RpToCauseHealth.destroy({
                where: {
                  RpToCauseHealthID: s.RpToCauseHealthID,
                },
              });
            }
          });

          CauseHealthIDList.forEach(async (ID) => {
            const search = await RpToCauseHealth.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                CauseHealthID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToCauseHealth.create({
                ReproduceID: obj.ReproduceID,
                CauseHealthID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }

        //

        if (data.CureAntibioticID === null) {
          RpToCureAntibiotic.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.CureAntibioticID) {
          const search = await RpToCureAntibiotic.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });

          search.forEach((s) => {
            let i = 0;

            CureAntibioticIDList.find((element) => {
              if (element[0] == s.CureAntibioticID) {
                i = 1;
              }
            });

            if (i == 0) {
              RpToCureAntibiotic.destroy({
                where: {
                  RpToCureAntibioticID: s.RpToCureAntibioticID,
                },
              });
            }
          });

          CureAntibioticIDList.forEach(async (ID) => {
            const searchOne = await RpToCureAntibiotic.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                CureAntibioticID: ID[0],
              },
            });

            if (!searchOne) {
              const obj1 = RpToCureAntibiotic.create({
                ReproduceID: obj.ReproduceID,
                CureAntibioticID: ID[0],
                Amount: ID[1],
                CreatedUserID: data.UpdatedUserID,
              });
            } else {
              searchOne.Amount = ID[1];
              await searchOne.save();
            }
          });
        }

        //

        if (data.CureHormoneID === null) {
          RpToCureHormone.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        //
        if (data.CureHormoneID) {
          const search = await RpToCureHormone.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });

          search.forEach((s) => {
            let i = 0;

            CureHormoneIDList.find((element) => {
              if (element[0] == s.CureHormoneID) {
                i = 1;
              }
            });

            if (i == 0) {
              RpToCureHormone.destroy({
                where: {
                  RpToCureHormoneID: s.RpToCureHormoneID,
                },
              });
            }
          });

          CureHormoneIDList.forEach(async (ID) => {
            const searchOne = await RpToCureHormone.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                CureHormoneID: ID[0],
              },
            });

            if (!searchOne) {
              const obj1 = RpToCureHormone.create({
                ReproduceID: obj.ReproduceID,
                CureHormoneID: ID[0],
                Amount: ID[1],
                CreatedUserID: data.UpdatedUserID,
              });
            } else {
              searchOne.Amount = ID[1];
              await searchOne.save();
            }
          });
        }

        //

        if (data.CureVitaminID === null) {
          RpToCureVitamin.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.CureVitaminID) {
          const search = await RpToCureVitamin.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });

          search.forEach((s) => {
            let i = 0;

            CureVitaminIDList.find((element) => {
              if (element[0] == s.CureVitaminID) {
                i = 1;
              }
            });

            if (i == 0) {
              RpToCureVitamin.destroy({
                where: {
                  RpToCureVitaminID: s.RpToCureVitaminID,
                },
              });
            }
          });

          CureVitaminIDList.forEach(async (ID) => {
            const searchOne = await RpToCureVitamin.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                CureVitaminID: ID[0],
              },
            });

            if (!searchOne) {
              const obj1 = RpToCureVitamin.create({
                ReproduceID: obj.ReproduceID,
                CureVitaminID: ID[0],
                Amount: ID[1],
                CreatedUserID: data.UpdatedUserID,
              });
            } else {
              searchOne.Amount = ID[1];
              await searchOne.save();
            }
          });
        }

        //

        if (data.ReproduceSuggestionID === null) {
          RpToRpSuggestion.destroy({
            where: {
              ReproduceID: id,
            },
            // truncate: true,
          });
        }

        if (data.ReproduceSuggestionID) {
          // insert ProjectToAnimalType
          const search = await RpToRpSuggestion.findAll({
            where: { ReproduceID: obj.ReproduceID },
          });
          // loop pta ของทั้งหมดที่มาจาก DB
          search.forEach((s) => {
            if (!ReproduceSuggestionIDList.includes(s.ReproduceSuggestionID)) {
              RpToRpSuggestion.destroy({
                where: {
                  RpToRpSuggestionID: s.RpToRpSuggestionID,
                },
              });
            }
          });

          ReproduceSuggestionIDList.forEach(async (ID) => {
            const search = await RpToRpSuggestion.findOne({
              where: {
                ReproduceID: obj.ReproduceID,
                ReproduceSuggestionID: ID,
              },
            });

            if (!search) {
              const obj1 = RpToRpSuggestion.create({
                ReproduceID: obj.ReproduceID,
                ReproduceSuggestionID: ID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }

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
        const obj1 = RpToRightOvarySymptom.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj2 = RpToVaginaSymptom.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj3 = RpToLeftOvarySymptom.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj4 = RpToOtherSymptom.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj5 = RpToCauseAnimal.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj6 = RpToCauseEnvironment.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj7 = RpToCauseFeeder.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj8 = RpToCauseHealth.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj9 = RpToCureHormone.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj10 = RpToCureAntibiotic.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj11 = RpToCureVitamin.destroy({
          where: { ReproduceID: id },
          // truncate: true,
        });

        const obj12 = RpToRpSuggestion.destroy({
          where: { ReproduceID: id },
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
