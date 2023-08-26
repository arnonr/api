const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models"),
  { Op, literal, fn } = require("sequelize");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

const Organization = require("../models/Organization");
const OrganizationType = require("../models/OrganizationType");
const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");
const AnimalStatus = require("../models/AnimalStatus");
const AnimalSex = require("../models/AnimalSex");
const AnimalType = require("../models/AnimalType");
const ProductionStatus = require("../models/ProductionStatus");
const AI = require("../models/AI");
const Province = require("../models/Province");
const Amphur = require("../models/Amphur");
const Tumbol = require("../models/Tumbol");
const Semen = require("../models/Semen");
const Project = require("../models/Project");
const ProjectToAnimalType = require("../models/ProjectToAnimalType");
const PregnancyCheckup = require("../models/PregnancyCheckup");
const PregnancyCheckStatus = require("../models/PregnancyCheckStatus");
const GiveBirth = require("../models/GiveBirth");
const AnimalBreed = require("../models/AnimalBreed");
const ProgressCheckup = require("../models/ProgressCheckup");
const TransferEmbryo = require("../models/TransferEmbryo");
const Embryo = require("../models/Embryo");
const e = require("cors");
const GiveBirthHelp = require("../models/GiveBirthHelp");
const Reproduce = require("../models/Reproduce");
const _ = require("lodash");

const methods = {
  report1(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Search
        let $where = {};

        // ZoneID อ้างจากจังหวัด

        if (req.query.ProvinceID)
          $where["FarmProvinceID"] = req.query.ProvinceID;

        if (req.query.AmphurID) $where["FarmAmphurID"] = req.query.AmphurID;

        if (req.query.TumbolID) $where["FarmTumbolID"] = req.query.TumbolID;

        $whereProvince = {};
        if (req.query.ZoneID)
          $whereProvince["OrganizationZoneID"] = req.query.OrganizationZoneID;

        if (req.query.AIZoneID) $whereProvince["AIZoneID"] = req.query.AIZoneID;

        if (req.query.OrganizationID)
          $where["OrganizationID"] = req.query.OrganizationID;

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        const queryProvince =
          Object.keys($whereProvince).length > 0
            ? { where: $whereProvince }
            : {};

        // รายงาน จำนวนตาม animal_status แม่โค โคสาว ลูกโค (เพศเมียทั้งหมด)
        // และตารางเป็นรายการฟาร์ม จำนวนตาม animal_status แม่โค โคสาว ลูกโค (เพศเมียทั้งหมด) และรวม

        let AnimalTypeID = JSON.parse(req.query.AnimalTypeID);
        let AnimalStatusID = [];

        if (AnimalTypeID.includes(1) || AnimalTypeID.includes(2)) {
          AnimalStatusID = [5, 3, 1];
        } else if (AnimalTypeID.includes(3) || AnimalTypeID.includes(4)) {
          AnimalStatusID = [10, 8, 6];
        } else if (AnimalTypeID.includes(17) || AnimalTypeID.includes(18)) {
          AnimalStatusID = [15, 13, 11];
        } else {
        }

        let mom = 0;
        let young = 0;
        let child = 0;
        let total = 0;

        let farms = await Farm.findAll({
          ...query,
          include: { model: Province, as: "Province", queryProvince },
        });

        farms = await Promise.all(
          farms.map(async (e) => {
            let f = {
              FarmIdentificationNumber: e.FarmIdentificationNumber,
              FarmName: e.FarmName,
              mom: 0,
              young: 0,
              child: 0,
              total: 0,
            };

            // แม่พันธุ์
            let animalStatus1 = await Animal.findAll({
              where: {
                FarmID: e.FarmID,
                AnimalStatusID: AnimalStatusID[0],
                AnimalSexID: 2,
                AnimalTypeID: { [Op.in]: AnimalTypeID },
              },
            });

            // สาว
            let animalStatus2 = await Animal.findAll({
              where: {
                FarmID: e.FarmID,
                AnimalStatusID: AnimalStatusID[1],
                AnimalSexID: 2,
                AnimalTypeID: { [Op.in]: AnimalTypeID },
              },
            });

            // ลูกโค
            let animalStatus3 = await Animal.findAll({
              where: {
                FarmID: e.FarmID,
                AnimalStatusID: AnimalStatusID[2],
                AnimalSexID: 2,
                AnimalTypeID: { [Op.in]: AnimalTypeID },
              },
            });

            f.mom = animalStatus1.length;
            f.young = animalStatus2.length;
            f.child = animalStatus3.length;

            f.total = f.mom + f.young + f.child;

            mom += f.mom;
            young += f.young;
            child += f.child;
            total += f.total;

            return f;
          })
        );

        let data = {
          Mom: mom,
          Young: young,
          Child: child,
          Total: total,
          Farms: farms,
          FarmCount: farms.length,
        };
        resolve(data);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
  report11(req) {
    // report ทะเบียนประวัติโคเพศเมีย
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        // ตาราง animal
        const animal = await Animal.findAll({
          attributes: {
            include: [
              [
                literal(`(
              SELECT Weight
              FROM ProgressCheckup
              WHERE
                ProgressCheckup.AnimalID = Animal.AnimalID
              ORDER BY ProgressCheckupID DESC
              LIMIT 1
          )`),
                "Weight",
              ],
              [
                literal(`(
              SELECT Height
              FROM ProgressCheckup
              WHERE
                ProgressCheckup.AnimalID = Animal.AnimalID
              ORDER BY ProgressCheckupID DESC
              LIMIT 1
          )`),
                "Height",
              ],
              [
                literal(`(
              SELECT SemenNumber
              FROM Semen
              WHERE
                Semen.BreederID = Animal.AnimalID
              ORDER BY SemenID DESC
              LIMIT 1
          )`),
                "SemenNumber",
              ],
            ],
          },
          where: { animalSexID: 2 },
          include: [
            {
              model: Farm,
              as: "AnimalFarm",
              ...query,
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed1",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed2",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed3",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed4",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed5",
            },
            {
              model: Animal,
              as: "AnimalFather",
            },
            {
              model: Animal,
              as: "AnimalMother",
            },
            {
              model: AnimalStatus,
              as: "AnimalStatus",
            },
          ],
        });
        let res = [];
        animal.forEach((el) => {
          res.push({
            AnimalID: el.AnimalID,
            AnimalEarID: el.AnimalEarID,
            SemenNumber: el.dataValues.SemenNumber,
            AnimalName: el.AnimalName,
            AnimalBreedAll: el.AnimalBreedAll,
            ThaiAnimalBirthDate: el.ThaiAnimalBirthDate,
            AnimalWeight: el.dataValues.Weight ? el.dataValues.Weight : "-",
            AnimalHeight: el.dataValues.Height ? el.dataValues.Height : "-",
            AnimalFather: el.AnimalFather ? el.AnimalFather.AnimalEarID : "-",
            AnimalMother: el.AnimalMother ? el.AnimalMother.AnimalEarID : "-",
            AnimalStatusName: el.AnimalStatus.AnimalStatusName,
            AnimalSource:
              el.AnimalSource == "BORN"
                ? "เกิดในฟาร์ม"
                : el.AnimalSource == "BUY"
                ? "ซื้อมา"
                : el.AnimalSource == "TRANSFER"
                ? "ย้ายมา"
                : "-",
          });
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
  report2(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Search
        // ZoneID อ้างจากจังหวัด
        let $where = {};
        if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        query["include"] = [
          { all: true, required: false },
          // {
          //   model: AnimalStatus,
          //   as: "AnimalStatus"
          // },
          // {
          //   model: ProductionStatus,
          //   as: "ProductionStatus"
          // },
          // {
          //   model: Farm,
          //   as: "AnimalFarm"
          // },
        ];

        let animal = await Animal.findOne({
          ...query,
        });

        // animal = await Promise.all(
        //   animal.map(async (e) => {

        //   })
        // );
        let animalFather = {
          AnimalEarID: "-",
          AnimalBreedAll: "-",
        };

        if (animal.AnimalFatherID) {
          console.log(animal.AnimalFatherID);
          animalFather = await Animal.findOne({
            where: { AnimalID: animal.AnimalFatherID },
            include: {
              all: true,
              required: false,
            },
          });
        }

        let animalMother = {
          AnimalEarID: "-",
          AnimalBreedAll: "-",
        };

        if (animal.AnimalMotherID) {
          animalMother = await Animal.findOne({
            where: { AnimalID: animal.AnimalMotherID },
            include: {
              all: true,
              required: false,
            },
          });
        }

        //
        let ai = await AI.findAll({ AnimalID: animal.AnimalID });

        let AIrows = ai.map((data) => {
          let dataJson = data.toJSON();
          data = {
            PAR: dataJson.PAR,
            TimeNo: dataJson.TimeNo,
            ThaiAIDate: dataJson.ThaiAIDate,
            SemenNumber:
              dataJson.Semen != null ? dataJson.Semen.SemenNumber : null,
            Dose: dataJson.Dose,
            AIStatusName: dataJson.AIStatusName,
            PregnancyCheckup: dataJson.PregnancyCheckups
              ? dataJson.PregnancyCheckups[0]
                ? dataJson.PregnancyCheckups[0].toJSON().PregnancyCheckStatus
                    .PregnancyCheckStatusName
                : null
              : null,
            ThaiGiveBirthDate: dataJson.GiveBirth
              ? dataJson.GiveBirth.ThaiGiveBirthDate
              : null,
            ChildGender: dataJson.GiveBirth
              ? dataJson.GiveBirth.ChildGender
              : null,
            ResponsibilityStaffName: dataJson.Staff
              ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
              : null,
          };
          return data;
        });

        let data = {
          AnimalID: animal.AnimalID,
          AnimalEarID: animal.AnimalEarID,
          AnimalMicrochip: animal.AnimalMicrochip,
          AnimalName: animal.AnimalName,
          ThaiAnimalBirthDate: animal.ThaiAnimalBirthDate,
          AnimalStatus: animal.AnimalStatus.AnimalStatusName,
          ProductionStatus: animal.ProductionStatus
            ? animal.ProductionStatus.ProductionStatusName
            : "-",
          AnimalPar: animal.AnimalPar,
          AnimalSource: animal.AnimalSource,
          FarmName: animal.AnimalFarm.FarmName,
          FarmIdentificationNumber: animal.AnimalFarm.FarmIdentificationNumber,
          AnimalBreedAll: animal.AnimalBreedAll,
          AnimalFatherEarID: animalFather.AnimalEarID,
          AnimalFatherBreedAll: animalFather.AnimalBreedAll,
          AnimalMotherEarID: animalMother.AnimalEarID,
          AnimalMotherBreedAll: animalMother.AnimalBreedAll,
          ai: AIrows,

          // ข้อมูลการผสม
        };
        resolve(data);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
  report3(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let $where = {};

        let provinceIDArr = [];
        const province = await Province.findAll({
          where: { AIZoneID: req.query.AIZoneID },
        });

        province.forEach((p) => {
          provinceIDArr.push(p.ProvinceID);
        });

        let organizationIDArr = [];
        const organization = await Organization.findAll({
          where: { OrganizationProvinceID: { [Op.in]: provinceIDArr } },
        });

        organization.forEach((o) => {
          organizationIDArr.push(o.OrganizationID);
        });

        // ตาราง staff,
        const staff = await Staff.findAll({
          where: { StaffOrganizationID: { [Op.in]: organizationIDArr } },
        });

        let res = [];

        // if(){

        // }
        // date: {
        //   [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        //  },

        // await Promise.all(

        let AIDate = {
          [Op.ne]: null,
        };

        let AnimalCreatedDatetime = {
          [Op.ne]: null,
        };

        let CheckupDate = {
          [Op.ne]: null,
        };

        let GiveBirthDate = {
          [Op.ne]: null,
        };

        if (req.query.StartDate) {
          AIDate = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };

          AnimalCreatedDatetime = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };

          CheckupDate = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };

          GiveBirthDate = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        for (let s of staff) {
          let AIWhere = {
            ResponsibilityStaffID: s.StaffID,
            AIDate: AIDate,
          };

          const ai = await AI.findAll({
            where: AIWhere,
          });

          let AnimalWhere = {
            CreatedUserID: s.StaffID,
            CreatedDatetime: AnimalCreatedDatetime,
          };

          const animal = await Animal.findAll({
            where: AnimalWhere,
          });

          let PregnancyCheckupWhere = {
            ResponsibilityStaffID: s.StaffID,
            CheckupDate: CheckupDate,
          };

          const pregnancyCheckup = await PregnancyCheckup.findAll({
            where: PregnancyCheckupWhere,
          });

          let pregnancyStatus1 = pregnancyCheckup.filter((el, index) => {
            return el.PregnancyCheckStatusID == 1;
          });

          const seen = new Set();
          let uniqueAIs = ai.filter((el, index) => {
            const duplicate = seen.has(el.AnimalID);
            seen.add(el.AnimalID);
            return !duplicate;
          });

          let percent = parseFloat(
            ((pregnancyStatus1.length * 100) / pregnancyCheckup.length).toFixed(
              2
            )
          );

          let giveBirthWhere = {
            ResponsibilityStaffID: s.StaffID,
            GiveBirthDate: GiveBirthDate,
          };

          let giveBirth = await GiveBirth.findAll({
            where: giveBirthWhere,
          });

          let childM = 0;
          let childF = 0;

          if (giveBirth) {
            giveBirth.filter((el, index) => {
              // ChildGender
              if (el.ChildGender != null) {
                let ChildGender = el.ChildGender.split(",");
                for (let cg of ChildGender) {
                  if (cg == "M") {
                    childM = childM + 1;
                  } else if (cg == "F") {
                    childF = childF + 1;
                  } else {
                  }
                }
              }
            });
          }

          res.push({
            StaffNumber: s.StaffNumber,
            StaffFullName: `${s.StaffGivenName} ${s.StaffSurname}`,
            r1: uniqueAIs.length,
            r2: ai.length,
            r3: animal.length,
            r4: pregnancyCheckup.length,
            r5: pregnancyStatus1.length,
            percent: percent,
            childM: childM,
            childF: childF,
            childT: childM + childF,
          });
        }

        // );

        // // ขึ้นข้อมูล จำนวนที่ผสม

        // // ZoneID อ้างจากจังหวัด
        // if (req.query.AnimalEarID)
        //   $where["AnimalEarID"] = req.query.AnimalEarID;

        // const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // query["include"] = [
        //   {
        //     model: AnimalStatus,
        //   },
        //   {
        //     model: ProductionStatus,
        //   },
        //   {
        //     model: Farm,
        //   },
        // ];

        // let animal = await Animal.findOne({
        //   ...query,
        // });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
  report4(req) {
    // report พ่อพันธุ์
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};

        // เราจะค้นหาฟาร์ม จาก
        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        // ตาราง animal
        let animalStatusID = null;
        if (
          req.query.AnimalTypeID.includes(1) ||
          req.query.AnimalTypeID.includes(2)
        ) {
          animalStatusID = 4;
        }

        if (
          req.query.AnimalTypeID.includes(3) ||
          req.query.AnimalTypeID.includes(4)
        ) {
          animalStatusID = 9;
        }

        if (
          req.query.AnimalTypeID.includes(17) ||
          req.query.AnimalTypeID.includes(18)
        ) {
          animalStatusID = 14;
        }

        const animal = await Animal.findAll({
          attributes: {
            include: [
              [
                literal(`(
                SELECT Weight
                FROM ProgressCheckup
                WHERE
                  ProgressCheckup.AnimalID = Animal.AnimalID
                ORDER BY ProgressCheckupID DESC
                LIMIT 1
            )`),
                "Weight",
              ],
              [
                literal(`(
                SELECT Height
                FROM ProgressCheckup
                WHERE
                  ProgressCheckup.AnimalID = Animal.AnimalID
                ORDER BY ProgressCheckupID DESC
                LIMIT 1
            )`),
                "Height",
              ],
              [
                literal(`(
                SELECT SemenNumber
                FROM Semen
                WHERE
                  Semen.BreederID = Animal.AnimalID
                ORDER BY SemenID DESC
                LIMIT 1
            )`),
                "SemenNumber",
              ],
            ],
          },
          where: { AnimalStatusID: animalStatusID },
          include: [
            {
              model: Farm,
              as: "AnimalFarm",
              ...query,
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed1",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed2",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed3",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed4",
            },
            {
              model: AnimalBreed,
              as: "AnimalBreed5",
            },
            {
              model: Animal,
              as: "AnimalFather",
            },
            {
              model: Animal,
              as: "AnimalMother",
            },
            {
              model: AnimalStatus,
              as: "AnimalStatus",
            },
          ],
        });
        let res = [];
        animal.forEach((el) => {
          res.push({
            AnimalID: el.AnimalID,
            AnimalEarID: el.AnimalEarID,
            SemenNumber: el.dataValues.SemenNumber,
            AnimalName: el.AnimalName,
            AnimalBreedAll: el.AnimalBreedAll,
            ThaiAnimalBirthDate: el.ThaiAnimalBirthDate,
            AnimalWeight: el.dataValues.Weight ? el.dataValues.Weight : "-",
            AnimalHeight: el.dataValues.Height ? el.dataValues.Height : "-",
            AnimalFather: el.AnimalFather ? el.AnimalFather.AnimalEarID : "-",
            AnimalMother: el.AnimalMother ? el.AnimalMother.AnimalEarID : "-",
            AnimalStatusName: el.AnimalStatus.AnimalStatusName,
            AnimalSource:
              el.AnimalSource == "BORN"
                ? "เกิดในฟาร์ม"
                : el.AnimalSource == "BUY"
                ? "ซื้อมา"
                : el.AnimalSource == "TRANSFER"
                ? "ย้ายมา"
                : "-",
          });
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
  report5(req) {
    // report รายงานการใช้น้ำเชื้อ
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereAI = {};

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        let $whereSemen = {};
        if (req.query.SemenNumber) {
          $whereSemen["SemenNumber"] = {
            [Op.like]: "%" + req.query.SemenNumber + "%",
          };
        }

        let AIDate = {};
        if (req.query.StartDate) {
          $whereAI["AIDate"] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        $whereAI["SemenID"] = { [Op.ne]: null };

        const queryAI =
          Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        const querySemen =
          Object.keys($whereSemen).length > 0 ? { where: $whereSemen } : {};

        const ai = await AI.findAll({
          ...queryAI,
          include: [
            {
              model: Animal,
              as: "Animal",
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed1",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed2",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed3",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed4",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed5",
                },
                {
                  model: Animal,
                  as: "AnimalFather",
                },
                {
                  model: Animal,
                  as: "AnimalMother",
                },
                {
                  model: AnimalStatus,
                  as: "AnimalStatus",
                },
              ],
              // ...query,
            },
            {
              model: Semen,
              as: "Semen",
              ...querySemen,
            },
          ],
        });

        let res = [];
        ai.forEach((el) => {
          res.push({
            AnimalID: el.AnimalID,
            SemenNumber: el.Semen ? el.Semen.SemenNumber : "-",
            AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
            AnimalBreedAll: el.Animal ? el.Animal.AnimalBreedAll : "-",
            ThaiAnimalBirthDate: el.Animal
              ? el.Animal.ThaiAnimalBirthDate
              : "-",
            AnimalStatusName: el.Animal
              ? el.Animal.AnimalStatus.AnimalStatusName
              : "-",
            AnimalFather: !el.Animal
              ? "-"
              : el.Animal.AnimalFather
              ? el.Animal.AnimalFather.AnimalEarID
              : "-",
            AnimalMother: !el.Animal
              ? "-"
              : el.Animal.AnimalMother
              ? el.Animal.AnimalMother.AnimalEarID
              : "-",
            Par: el.PAR,
            TimeNo: el.TimeNo,
            ThaiAIDate: el.ThaiAIDate,
            Dose: el.Dose,
            //
            AIStatus:
              el.AIStatus == 0
                ? "รอผล"
                : el.AIStatus == 1
                ? "สำเร็จ"
                : "ไม่สำเร็จ",
            // Farm
            FarmName: el.Animal.AnimalFarm.FarmName,
          });
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
  report6(req) {
    // report รายงานการใช้น้ำเชื้อ
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereTransferEmbryo = {};

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        let $whereEmbryo = {};
        if (req.query.EmbryoNumber) {
          $whereEmbryo["EmbryoNumber"] = {
            [Op.like]: "%" + req.query.EmbryoNumber + "%",
          };
        }

        let TransferEmbryoDate = {};
        if (req.query.StartDate) {
          $whereTransferEmbryo["TransferDate"] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        $whereEmbryo["EmbryoID"] = { [Op.ne]: null };

        const queryTransferEmbryo =
          Object.keys($whereTransferEmbryo).length > 0
            ? { where: $whereTransferEmbryo }
            : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        const queryEmbryo =
          Object.keys($whereEmbryo).length > 0 ? { where: $whereEmbryo } : {};

        // const ai = await TransferEmbryo.findAll({
        //   ...queryTransferEmbryo,
        //   include: [
        //     {
        //       model: Animal,
        //       as: "Animal",
        //       where: {
        //         AnimalTypeID: {
        //           [Op.in]: JSON.parse(req.query.AnimalTypeID),
        //         },
        //       },
        //       include: [
        //         {
        //           model: Farm,
        //           as: "AnimalFarm",
        //           ...query,
        //         },
        //         {
        //           model: AnimalBreed,
        //           as: "AnimalBreed1",
        //         },
        //         {
        //           model: AnimalBreed,
        //           as: "AnimalBreed2",
        //         },
        //         {
        //           model: AnimalBreed,
        //           as: "AnimalBreed3",
        //         },
        //         {
        //           model: AnimalBreed,
        //           as: "AnimalBreed4",
        //         },
        //         {
        //           model: AnimalBreed,
        //           as: "AnimalBreed5",
        //         },
        //         {
        //           model: Animal,
        //           as: "AnimalFather",
        //         },
        //         {
        //           model: Animal,
        //           as: "AnimalMother",
        //         },
        //         {
        //           model: AnimalStatus,
        //           as: "AnimalStatus",
        //         },
        //       ],
        //       // ...query,
        //     },
        //     {
        //       model: Embryo,
        //       as: "Embryo",
        //       ...queryEmbryo,
        //     },
        //   ],
        // });

        const ai1 = await TransferEmbryo.findAll({
          ...queryTransferEmbryo,
          include: [
            {
              model: Animal,
              as: "Animal",
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed1",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed2",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed3",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed4",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed5",
                },
                {
                  model: Animal,
                  as: "AnimalFather",
                },
                {
                  model: Animal,
                  as: "AnimalMother",
                },
                {
                  model: AnimalStatus,
                  as: "AnimalStatus",
                },
              ],
              // ...query,
            },
            {
              model: Embryo,
              as: "Embryo",
              ...queryEmbryo,
            },
          ],
        });

        // const loadAIs = async (filter) => {
        //   const ais = await AI.findAll(filter);
        //   return Promise.all(ais.map(lazyLoad));
        // };

        // const lazyLoad = async (ai) => {
        //   const [animal] = await Promise.all([ai.getAnimal()]);
        //   // some data manipulation here to build a complexObject with all the data - not relevant
        //   return {};
        // };

        let res = [];
        ai1.forEach((el) => {
          res.push({
            AnimalID: el.AnimalID,
            EmbryoNumber: el.Embryo ? el.Embryo.EmbryoNumber : "-",
            AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
            AnimalBreedAll: el.Animal ? el.Animal.AnimalBreedAll : "-",
            ThaiAnimalBirthDate: el.Animal
              ? el.Animal.ThaiAnimalBirthDate
              : "-",
            AnimalStatusName: el.Animal
              ? el.Animal.AnimalStatus.AnimalStatusName
              : "-",
            AnimalFather: !el.Animal
              ? "-"
              : el.Animal.AnimalFather
              ? el.Animal.AnimalFather.AnimalEarID
              : "-",
            AnimalMother: !el.Animal
              ? "-"
              : el.Animal.AnimalMother
              ? el.Animal.AnimalMother.AnimalEarID
              : "-",
            Par: el.PAR,
            TimeNo: el.TimeNo,
            ThaiTransferDate: el.ThaiTransferDate,
            FarmName: el.Animal.AnimalFarm.FarmName,
          });
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  report7(req) {
    // report การเจริญเติบโต
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereAnimal = {};

        let provinceIDArr = [];

        if (req.query.AIZoneID) {
          provinceIDArr = [];
          const province = await Province.findAll({
            where: { AIZoneID: req.query.AIZoneID },
          });

          province.forEach((p) => {
            provinceIDArr.push(p.ProvinceID);
          });
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        if (req.query.AnimalSexID) {
          $whereAnimal["AnimalSexID"] = req.query.AnimalSexID;
        }

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        const queryAnimal =
          Object.keys($whereAnimal).length > 0 ? { where: $whereAnimal } : {};

        const pc = await ProgressCheckup.findAll({
          include: [
            {
              model: Animal,
              as: "Animal",
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed1",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed2",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed3",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed4",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed5",
                },
                // {
                //   model: Animal,
                //   as: "AnimalFather",
                // },
                // {
                //   model: Animal,
                //   as: "AnimalMother",
                // },
                {
                  model: AnimalStatus,
                  as: "AnimalStatus",
                },
                {
                  model: AnimalSex,
                  as: "AnimalSex",
                  ...queryAnimal,
                },
              ],
              // ...query,
            },
          ],
        });

        let res = [];
        pc.forEach((el) => {
          res.push({
            AnimalID: el.AnimalID,
            // EmbryoNumber: el.Embryo ? el.Embryo.EmbryoNumber : "-",
            AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
            AnimalSex: el.Animal ? el.Animal.AnimalSex.AnimalSexName : "-",
            AnimalAge: el.Animal ? el.Animal.AnimalAge : "-",
            AnimalBreedAll: el.Animal ? el.Animal.AnimalBreedAll : "-",
            AnimalStatusName: el.Animal
              ? el.Animal.AnimalStatus.AnimalStatusName
              : "-",
            FarmName: el.Animal.AnimalFarm.FarmName,
            ThaiCheckupDate: el.ThaiCheckupDate,
            Weight: el.Weight,
            Height: el.Height,
            PerimeterChest: el.PerimeterChest,
            PerimeterBall: el.PerimeterBall,
          });
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  report8(req) {
    // report ครบกำหนดคลอด
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereAI = {};

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        let AIDate = {};
        if (req.query.StartDate) {
          $whereAI["EstimateBirthDate"] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        const queryAI =
          Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        let order = [];
        if (req.query.Type == "FARM") {
          order = [[Animal, "FarmID", "ASC"]];
        }
        if (req.query.Type == "STAFF") {
          order = [["ResponsibilityStaffID", "ASC"]];
        }

        const ai = await AI.findAll({
          ...queryAI,
          order: order,
          include: [
            {
              model: Animal,
              as: "Animal",
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                },
              ],
            },
            {
              model: Semen,
              as: "Semen",
            },
            { model: Staff },
            {
              model: GiveBirth,
              as: "GiveBirth",
              include: [{ model: GiveBirthHelp }, { model: Staff }],
            },
          ],
        });

        let res = [];
        // res = [{ FarmID: 1, FarmName: 2, AI: [{},{}] }];

        if (req.query.Type == "FARM") {
          const sortAI = (el) => {
            let resSort = {
              AnimalID: el.AnimalID,
              AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
              AnimalName: el.Animal ? el.Animal.AnimalName : "-",
              Par: el.PAR,
              TimeNo: el.TimeNo,
              ThaiAIDate: el.ThaiAIDate,
              SemenNumber: el.Semen ? el.Semen.SemenNumber : "-",
              ThaiEstimateBirthDate: el.ThaiEstimateBirthDate,
              ThaiGiveBirthDate: el.GiveBirth
                ? el.GiveBirth.ThaiGiveBirthDate
                : "-",
              GiveBirthState: el.GiveBirth
                ? el.GiveBirth.GiveBirthState == "NORMAL"
                  ? "คลอดปกติ"
                  : el.GiveBirth.GiveBirthState == "DIFFICULT"
                  ? "คลอดยาก"
                  : "คลอดก่อน"
                : "-",
              GiveBirthState: el.GiveBirth
                ? el.GiveBirth.GiveBirthState == "NORMAL"
                  ? "คลอดปกติ"
                  : el.GiveBirth.GiveBirthState == "DIFFICULT"
                  ? "คลอดยาก"
                  : "คลอดก่อน"
                : "-",
              GiveBirthHelp: el.GiveBirth
                ? el.GiveBirth.GiveBirthHelp.GiveBirthHelpName
                : "-",
              ResponsibilityStaffName: el.GiveBirth
                ? el.GiveBirth.Staff.StaffFullName
                : "-",
              ChildGender: el.GiveBirth ? el.GiveBirth.ChildGender : "-",
            };

            return resSort;
          };

          ai.forEach((el) => {
            let latestArr = res[res.length - 1];

            if (latestArr) {
              if (el.Animal.FarmID == latestArr.FarmID) {
                latestArr.AI.push(sortAI(el));
              } else {
                res.push({
                  FarmID: el.Animal.FarmID,
                  FarmName: el.Animal.AnimalFarm.FarmName,
                  AI: [sortAI(el)],
                });
              }
            } else {
              res.push({
                FarmID: el.Animal.FarmID,
                FarmName: el.Animal.AnimalFarm.FarmName,
                AI: [sortAI(el)],
              });
            }
          });
        }

        if (req.query.Type == "STAFF") {
          const sortAI = (el) => {
            let resSort = {
              AnimalID: el.AnimalID,
              AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
              AnimalName: el.Animal ? el.Animal.AnimalName : "-",
              Par: el.PAR,
              TimeNo: el.TimeNo,
              ThaiAIDate: el.ThaiAIDate,
              SemenNumber: el.Semen ? el.Semen.SemenNumber : "-",
              ThaiEstimateBirthDate: el.ThaiEstimateBirthDate,
              ThaiGiveBirthDate: el.GiveBirth
                ? el.GiveBirth.ThaiGiveBirthDate
                : "-",
              GiveBirthState: el.GiveBirth
                ? el.GiveBirth.GiveBirthState == "NORMAL"
                  ? "คลอดปกติ"
                  : el.GiveBirth.GiveBirthState == "DIFFICULT"
                  ? "คลอดยาก"
                  : "คลอดก่อน"
                : "-",
              GiveBirthState: el.GiveBirth
                ? el.GiveBirth.GiveBirthState == "NORMAL"
                  ? "คลอดปกติ"
                  : el.GiveBirth.GiveBirthState == "DIFFICULT"
                  ? "คลอดยาก"
                  : "คลอดก่อน"
                : "-",
              GiveBirthHelp: el.GiveBirth
                ? el.GiveBirth.GiveBirthHelp.GiveBirthHelpName
                : "-",
              ResponsibilityStaffName: el.GiveBirth
                ? el.GiveBirth.Staff.StaffFullName
                : "-",
              ChildGender: el.GiveBirth ? el.GiveBirth.ChildGender : "-",
            };

            return resSort;
          };

          ai.forEach((el) => {
            let latestArr = res[res.length - 1];

            if (latestArr) {
              if (el.ResponsibilityStaffID == latestArr.ResponsibilityStaffID) {
                latestArr.AI.push(sortAI(el));
              } else {
                res.push({
                  StaffID: el.ResponsibilityStaffID,
                  StaffName: el.Staff ? el.Staff.StaffFullName : "-",
                  AI: [sortAI(el)],
                });
              }
            } else {
              res.push({
                StaffID: el.ResponsibilityStaffID,
                StaffName: el.Staff ? el.Staff.StaffFullName : "-",
                AI: [sortAI(el)],
              });
            }
          });
        }

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  report9(req) {
    // report รายงานตรวจท้อง
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereAI = {};

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        if (req.query.ProjectID) {
          $whereFarm["ProjectID"] = req.query.ProjectID;
        }

        if (req.query.ProjectID) {
          $whereAI["ProjectID"] = req.query.ProjectID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        let AIDate = {};
        if (req.query.StartDate) {
          $whereAI["AIDate"] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        const queryAI =
          Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        let order = [[Animal, "FarmID", "ASC"]];

        const ai = await AI.findAll({
          ...queryAI,
          order: order,
          include: [
            {
              model: Animal,
              as: "Animal",
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                  include: [
                    { model: Amphur, as: "Amphur" },
                    { model: Province, as: "Province" },
                  ],
                },
              ],
            },
            {
              model: Semen,
              as: "Semen",
            },
            { model: Staff },
            { model: Project },
            {
              model: PregnancyCheckup,
              include: [{ model: PregnancyCheckStatus }],
            },
          ],
        });

        let res = [];

        let aiTotal = ai.length;

        const sortAI = (el) => {
          let pregnancyCheckup = "";
          let pregnancyCheckupDate = "";
          if (el.PregnancyCheckups.length != 0) {
            let pc = el.PregnancyCheckups[el.PregnancyCheckups.length - 1];
            pregnancyCheckup = pc.PregnancyCheckStatus.PregnancyCheckStatusName;
            pregnancyCheckupDate = pc.ThaiCheckupDate;
          }

          let day = dayjs().diff(dayjs(el.AIDate), "day");

          let resSort = {};
          if (day >= req.query.day) {
            resSort = {
              AnimalID: el.AnimalID,
              AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
              AnimalName: el.Animal ? el.Animal.AnimalName : "-",
              Par: el.PAR,
              TimeNo: el.TimeNo,
              SemenNumber: el.Semen ? el.Semen.SemenNumber : "-",
              ThaiAIDate: el.ThaiAIDate,
              Day: day,
              ProjectName: el.Project ? el.Project.ProjectName : "-",
              ThaipregnancyCheckupDate: pregnancyCheckupDate,
              pregnancyCheckup: pregnancyCheckup,
              ResponsibilityStaffName: el.Staff ? el.Staff.StaffFullName : "-",
            };
          }

          return resSort;
        };

        ai.forEach((el) => {
          let latestArr = res[res.length - 1];

          if (latestArr) {
            if (el.Animal.FarmID == latestArr.FarmID) {
              let aiItem = sortAI(el);
              if (!_.isEmpty(aiItem)) {
                latestArr.AI.push(aiItem);
              }
            } else {
              let aiItem = sortAI(el);
              if (!_.isEmpty(aiItem)) {
                res.push({
                  FarmID: el.Animal.FarmID,
                  FarmName: el.Animal.AnimalFarm.FarmName,
                  AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                  ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
                  AI: [aiItem],
                });
              }
            }
          } else {
            let aiItem = sortAI(el);
            console.log(aiItem);
            if (!_.isEmpty(aiItem)) {
              res.push({
                FarmID: el.Animal.FarmID,
                FarmName: el.Animal.AnimalFarm.FarmName,
                AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
                AI: [aiItem],
              });
            }
          }
        });

        resolve({
          Total: aiTotal,
          Farm: res,
        });
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  report10(req) {
    // report โคสาวยังไม่ได้รับการผสม ยังไม่เสร็จเอาข้อมูลมาแสดงเฉยๆ
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        const animal = await Animal.findAll({
          where: {
            AnimalTypeID: {
              [Op.in]: JSON.parse(req.query.AnimalTypeID),
            },
            // BirthDate: {

            // }
          },
          include: [
            {
              model: Farm,
              as: "AnimalFarm",
              // ...query,
            },
          ],
        });

        let res = [];

        animal.forEach((el) => {
          res.push({
            AnimalID: el.AnimalID,
            AnimalEarID: el.AnimalEarID,
            AnimalName: el.AnimalName,
            ThaiBirthDate: el.ThaiBirthDate,
            AnimalAge: el.AnimalAge,
            Weight: "",
            FarmIdentificationNumber: el.AnimalFarm.FarmIdentificationNumber,
            FarmName: el.AnimalFarm.FarmName,
          });
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  report11(req) {
    // report ตรวจระบบสืบพันธุ์หลังคลอด 30 วัน
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereGiveBirth = {};

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        if (req.query.StartDate) {
          $whereGiveBirth["GiveBirthDate"] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        const queryGiveBirth =
          Object.keys($whereGiveBirth).length > 0
            ? { where: $whereGiveBirth }
            : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        let order = [[Animal, "FarmID", "ASC"]];

        const gb = await GiveBirth.findAll({
          ...queryGiveBirth,
          order: order,
          include: [
            {
              model: Animal,
              as: "Animal",
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                  include: [
                    {
                      model: Amphur,
                      as: "Amphur",
                    },
                    {
                      model: Province,
                      as: "Province",
                    },
                  ],
                },
              ],
            },
            {
              model: AI,
              as: "AI",
            },
          ],
        });

        let res = [];

        const sortAI = (el) => {
          let resSort = {
            AnimalID: el.AnimalID,
            AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
            PAR: el.PAR,
            ThaiGiveBirthDate: el.GiveBirth
              ? el.GiveBirth.ThaiGiveBirthDate
              : "-",
            TimeNo: el.AI ? el.AI.TimeNo : "-",
            ThaiAIDate: el.AI ? el.AI.ThaiAIDate : "-",
            ThaiReproduceDate: "-",
            Symptom: "-",
            Cure: "-",
            BCS: "-",
            ResponsibilityStaff: "-",
          };

          return resSort;
        };

        gb.forEach((el) => {
          let latestArr = res[res.length - 1];

          if (latestArr) {
            if (el.Animal.FarmID == latestArr.FarmID) {
              latestArr.GiveBirth.push(sortAI(el));
            } else {
              res.push({
                FarmID: el.Animal.FarmID,
                FarmName: el.Animal.AnimalFarm.FarmName,
                AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
                GiveBirth: [sortAI(el)],
              });
            }
          } else {
            res.push({
              FarmID: el.Animal.FarmID,
              FarmName: el.Animal.AnimalFarm.FarmName,
              AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
              ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
              GiveBirth: [sortAI(el)],
            });
          }
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  report12(req) {
    // report แก้ไขปัญหาทางระบบสืบพันธุ์
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereAnimal = {};
        let $whereReproduce = {};

        if (req.query.AnimalID) {
          $whereAnimal["AnimalID"] = req.query.AnimalID;
        }

        if (req.query.ResponsibilityStaffID) {
          $whereReproduce["ResponsibilityStaffID"] =
            req.query.ResponsibilityStaffID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        if (req.query.StartDate) {
          $whereReproduce["ReproduceDate"] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        const queryReproduce =
          Object.keys($whereReproduce).length > 0
            ? { where: $whereReproduce }
            : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        const queryAnimal =
          Object.keys($whereAnimal).length > 0 ? { where: $whereAnimal } : {};

        let order = [[Animal, "FarmID", "ASC"]];

        const gb = await Reproduce.findAll({
          ...queryReproduce,
          order: order,
          include: [
            {
              model: Animal,
              as: "Animal",
              ...queryAnimal,
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                },
              ],
            },
            { model: Staff },
          ],
        });

        let res = [];

        const sortAI = (el) => {
          let resSort = {
            AnimalID: el.AnimalID,
            AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
            FarmIdentificationNumber: el.Animal
              ? el.Animal.AnimalFarm.FarmIdentificationNumber
              : "-",
            FarmName: el.Animal ? el.Animal.AnimalFarm.FarmName : "-",
            PAR: 0,
            ThaiReproduceDate: el.ThaiReproduceDate,
            FarmerRemark: el.FarmerRemark,
            Symptom: "-",
            Cure: "-",
            result: "-",
            BCS: el.BCSID,
            ResponsibilityStaff: el.Staff ? el.Staff.StaffFullName : "-",
          };

          return resSort;
        };

        gb.forEach((el) => {
          res.push(sortAI(el));
        });

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  //
  report13(req) {
    // report รายงาน ผท6
    return new Promise(async (resolve, reject) => {
      try {
        // let $where = {};
        let $whereFarm = {};
        let $whereAI = {};

        if (req.query.OrganizationID) {
          $whereFarm["OrganizationID"] = req.query.OrganizationID;
        }

        if (req.query.ProjectID) {
          $whereAI["ProjectID"] = req.query.ProjectID;
        }

        let provinceIDArr = [];
        if (!req.query.ProvinceID) {
          if (req.query.OrganizationZoneID) {
            const province = await Province.findAll({
              where: { OrganizationZoneID: req.query.OrganizationZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }

          if (req.query.AIZoneID) {
            provinceIDArr = [];
            const province = await Province.findAll({
              where: { AIZoneID: req.query.AIZoneID },
            });

            province.forEach((p) => {
              provinceIDArr.push(p.ProvinceID);
            });
          }
        }

        if (req.query.TumbolID) {
          $whereFarm["FarmTumbolID"] = req.query.TumbolID;
        }

        if (req.query.AmphurID) {
          $whereFarm["FarmAmphurID"] = req.query.AmphurID;
        }

        if (req.query.ProvinceID) {
          provinceIDArr = [req.query.ProvinceID];
        }

        if (provinceIDArr.length != 0) {
          $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
        }

        if (req.query.FarmID) {
          $whereFarm["FarmID"] = req.query.FarmID;
        }

        let AIDate = {};
        if (req.query.StartDate) {
          $whereAI["AIDate"] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        const queryAI =
          Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        let order = [[Animal, "FarmID", "ASC"]];

        const ai = await AI.findAll({
          ...queryAI,
          order: order,
          include: [
            {
              model: Animal,
              as: "Animal",
              where: {
                AnimalTypeID: {
                  [Op.in]: JSON.parse(req.query.AnimalTypeID),
                },
              },
              include: [
                {
                  model: Farm,
                  as: "AnimalFarm",
                  ...query,
                  include: [
                    { model: Amphur, as: "Amphur" },
                    { model: Province, as: "Province" },
                  ],
                },
              ],
            },
            {
              model: Semen,
              as: "Semen",
            },
            { model: Staff },
            { model: Project },
            {
              model: PregnancyCheckup,
              include: [{ model: PregnancyCheckStatus }],
            },
          ],
        });

        let res = [];

        let aiTotal = ai.length;
        let pregTotal = [0, 0, 0, 0];

        const sortAI = (el) => {
          let pregnancyCheckup = "-";
          if (el.PregnancyCheckups.length != 0) {
            let pc = el.PregnancyCheckups[el.PregnancyCheckups.length - 1];
            pregnancyCheckup = pc.PregnancyCheckStatus.PregnancyCheckStatusName;
          }

          if (pregnancyCheckup == "ท้อง") {
            pregTotal[0] = pregTotal[0] + 1;
          } else if (pregnancyCheckup == "ไม่ท้อง") {
            pregTotal[1] = pregTotal[1] + 1;
          } else if (pregnancyCheckup == "รอตรวจซ้ำ") {
            pregTotal[2] = pregTotal[2] + 1;
          } else {
            pregTotal[3] = pregTotal[3] + 1;
          }

          let resSort = {
            AnimalID: el.AnimalID,
            AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
            Par: el.PAR,
            TimeNo: el.TimeNo,
            SemenNumber: el.Semen ? el.Semen.SemenNumber : "-",
            ThaiAIDate: el.ThaiAIDate,
            ResponsibilityStaffName: el.Staff ? el.Staff.StaffFullName : "-",
            ProjectName: el.Project ? el.Project.ProjectName : "-",
            pregnancyCheckup: pregnancyCheckup,
          };

          return resSort;
        };

        ai.forEach((el) => {
          let latestArr = res[res.length - 1];

          if (latestArr) {
            if (el.Animal.FarmID == latestArr.FarmID) {
              latestArr.AI.push(sortAI(el));
            } else {
              res.push({
                FarmID: el.Animal.FarmID,
                FarmName: el.Animal.AnimalFarm.FarmName,
                AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
                AI: [sortAI(el)],
              });
            }
          } else {
            res.push({
              FarmID: el.Animal.FarmID,
              FarmName: el.Animal.AnimalFarm.FarmName,
              AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
              ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
              AI: [sortAI(el)],
            });
          }
        });

        resolve({
          Total: aiTotal,
          preg1: pregTotal[0],
          preg2: pregTotal[1],
          preg3: pregTotal[2],
          preg4: pregTotal[3],
          Farm: res,
        });
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  GenerateNumber(FarmID, BirthDate, AnimalTypeID) {
    return new Promise(async (resolve, reject) => {
      try {
        let farm = await Farm.findByPk(FarmID, {
          include: { all: true, required: false },
        });

        let AnimalEarGenerate = "";
        let AnimalNationalID = "";

        if (farm) {
          let year = String(new Date().getFullYear()).slice(2);

          let ProvinceAndAmphur = farm.Amphur.AmphurCode.slice(0, 4);

          let AnimalTypeCode = await AnimalType.findByPk(AnimalTypeID);
          AnimalTypeCode = AnimalTypeCode.AnimalTypeCode.slice(1);

          // Running Number
          let prefixID = year + ProvinceAndAmphur + AnimalTypeCode;

          // Running Number
          let animal = await Animal.max("AnimalEarID", {
            where: {
              AnimalEarID: {
                [Op.startsWith]: prefixID,
              },
            },
          });

          if (animal) {
            let codeLastest = animal.substr(-6);
            codeLastest = parseInt(codeLastest) + 1;
            let number = 6 - parseInt(String(codeLastest).length);

            if (number != 0) {
              codeLastest = String(codeLastest);
              for (let i = 1; i <= number; i++) {
                codeLastest = "0" + codeLastest;
              }
            }
            AnimalEarGenerate = prefixID + codeLastest;
          } else {
            AnimalEarGenerate = prefixID + "000001";
          }

          //
          // year
          // ProvinceAndAmphur

          // N,M
          let type1 = "N";

          // C,D,B,G animalType
          let type2 = null;
          if (AnimalTypeID == 1) {
            type2 = "C";
          } else if (AnimalTypeID == 3 || AnimalTypeID == 4) {
            type2 = "B";
          } else if (AnimalTypeID == 17 || AnimalTypeID == 18) {
            type2 = "G";
          } else {
            type2 = "C";
          }

          let prefixID2 = year + ProvinceAndAmphur + type1 + type2;

          let animal2 = await Animal.max("AnimalNationalID", {
            where: {
              AnimalNationalID: {
                [Op.startsWith]: prefixID2,
              },
            },
          });

          if (animal2) {
            let codeLastest = animal.substr(-5);
            codeLastest = parseInt(codeLastest) + 1;
            let number = 5 - parseInt(String(codeLastest).length);

            if (number != 0) {
              codeLastest = String(codeLastest);
              for (let i = 1; i <= number; i++) {
                codeLastest = "0" + codeLastest;
              }
            }

            AnimalNationalID = prefixID2 + codeLastest;
          } else {
            AnimalNationalID = prefixID2 + "00001";
          }
        } else {
          reject(ErrorNotFound("Farm ID: not found"));
        }

        resolve({
          AnimalNumberGenerate: AnimalEarGenerate,
          AnimalEarGenerate: AnimalEarGenerate,
          AnimalNationalID: AnimalNationalID,
        });
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  report99(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get All animal
        let animal = await Animal.findAll({
          where: { AnimalIdentificationID: null },
        });

        for (let index = 0; index < animal.length; index++) {
          const el = animal[index];

          // let number = this.GenerateNumber(
          //   el.FarmID,
          //   el.BirthDate,
          //   el.AnimalTypeID
          // );
          //

          // Generate 15 หลัก
          let AnimalIdentificationID = null;
          let farm1 = await Farm.findByPk(el.FarmID);

          let year1 = null;
          if (el.AnimalDateJoin) {
            year1 = dayjs(el.AnimalDateJoin).format("YY");
          } else {
            year1 = dayjs().format("YY");
          }

          let ProvinceAndAmphur1 = farm1.FarmAmphurID;

          let AnimalTypeCode1 = await AnimalType.findByPk(el.AnimalTypeID);
          AnimalTypeCode1 = AnimalTypeCode1.AnimalTypeCode.slice(1);

          let prefixID1 =
            String(year1) +
            String(ProvinceAndAmphur1) +
            String(AnimalTypeCode1);

          let animal1 = await Animal.max("AnimalIdentificationID", {
            where: {
              AnimalIdentificationID: {
                [Op.startsWith]: prefixID1,
              },
            },
          });

          if (animal1) {
            let codeLastest1 = animal1.substr(-6);
            codeLastest1 = parseInt(codeLastest1) + 1;
            var number1 = 6 - parseInt(String(codeLastest1).length);

            if (number1 != 0) {
              codeLastest1 = String(codeLastest1);
              for (let i = 1; i <= number1; i++) {
                codeLastest1 = "0" + codeLastest1;
              }
            }

            AnimalIdentificationID = String(prefixID1) + String(codeLastest1);
          } else {
            AnimalIdentificationID = String(prefixID1) + String("000001");
          }

          //

          // let AnimalNationalID = null;
          // let farm = await Farm.findByPk(el.FarmID);

          // let year = dayjs().format('YY');
          // let ProvinceAndAmphur = farm.FarmAmphurID;

          // let AnimalTypeCode = await AnimalType.findByPk(el.AnimalTypeID);
          // AnimalTypeCode = AnimalTypeCode.AnimalTypeCode.slice(1);

          // // Running Number

          // let type1 = "N";
          // // C,D,B,G animalType
          // let type2 = null;
          // if (el.AnimalTypeID == 1) {
          //   type2 = "C";
          // } else if (el.AnimalTypeID == 3 || el.AnimalTypeID == 4) {
          //   type2 = "B";
          // } else if (el.AnimalTypeID == 17 || el.AnimalTypeID == 18) {
          //   type2 = "G";
          // } else {
          //   type2 = "C";
          // }

          // let prefixID2 = String(year) + String(ProvinceAndAmphur) + type1 + type2;

          // let animal2 = await Animal.max("AnimalNationalID", {
          //   where: {
          //     AnimalNationalID: {
          //       [Op.startsWith]: prefixID2,
          //     },
          //   },
          // });

          // if (animal2) {
          //   let codeLastest = animal2.substr(-5);
          //   codeLastest = parseInt(codeLastest) + 1;
          //   var number = 5 - parseInt(String(codeLastest).length);

          //   if (number != 0) {
          //     codeLastest = String(codeLastest);
          //     for (let i = 1; i <= number; i++) {
          //       codeLastest = "0" + codeLastest;
          //     }
          //   }

          //   AnimalNationalID = prefixID2 + codeLastest;
          // } else {
          //   AnimalNationalID = prefixID2 + "00001";
          // }

          //

          // el.AnimalNationalID = AnimalNationalID;
          el.AnimalIdentificationID = AnimalIdentificationID;
          // console.log(el.AnimalNationalID);
          await el.save();
        }

        // For Animal
        // Generate New Number
        // Save New Number

        resolve({ Animal: animal });
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
};

// repot99(req){
//       return new Promise(async (resolve, reject) => {
//       try {

//         let staff = Staff.findAll({where: {CreatedDatetime: {[Op.like]: '%2023-10%'}}})

//         resolve({message: 'success'});
//       } catch (error) {
//         reject(ErrorNotFound(error));
//       }
//     });
//   },
// }

module.exports = { ...methods };
