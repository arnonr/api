const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models"),
  { Op, literal } = require("sequelize");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

const Organization = require("../models/Organization");
const OrganizationType = require("../models/OrganizationType");
const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");
const AnimalStatus = require("../models/AnimalStatus");
const ProductionStatus = require("../models/ProductionStatus");
const AI = require("../models/AI");
const Province = require("../models/Province");
const Amphur = require("../models/Amphur");
const Tumbol = require("../models/Tumbol");
const Semen = require("../models/Semen");
const Project = require("../models/Project");
const ProjectToAnimalType = require("../models/ProjectToAnimalType");
const PregnancyCheckup = require("../models/PregnancyCheckup");
const GiveBirth = require("../models/GiveBirth");
const AnimalBreed = require("../models/AnimalBreed");
const ProgressCheckup = require("../models/ProgressCheckup");
const TransferEmbryo = require("../models/TransferEmbryo");
const Embryo = require("../models/Embryo");

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

          if (req.queryAIZoneID) {
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

          if (req.queryAIZoneID) {
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
          $whereAI['AIDate'] = {
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

          if (req.queryAIZoneID) {
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
          $whereTransferEmbryo['TransferDate'] = {
            [Op.between]: [
              dayjs(req.query.StartDate).format("YYYY-MM-DD"),
              dayjs(req.query.EndDate).format("YYYY-MM-DD"),
            ],
          };
        }

        $whereEmbryo["EmbryoID"] = { [Op.ne]: null };

        const queryTransferEmbryo =
          Object.keys($whereTransferEmbryo).length > 0 ? { where: $whereTransferEmbryo } : {};

        const query =
          Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

        const queryEmbryo =
          Object.keys($whereEmbryo).length > 0 ? { where: $whereEmbryo } : {};

        const ai = await TransferEmbryo.findAll({
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

        let res = [];
        ai.forEach((el) => {
          res.push({
            AnimalID: el.AnimalID,
            // SemenNumber: el.Semen ? el.Semen.SemenNumber : "-",
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

  report99(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // console.log("ARNON")
        // let orgType = await OrganizationType.findAll();
        // let org = await Organization.findAll();

        // org.forEach(el => {
        //   let index = orgType.find((ot) => {
        //     console.log(ot.OrganizationTypeCode)
        //     console.log(el.OrganizationTypeID)
        //     return ot.OrganizationTypeCode == el.OrganizationTypeID
        //   })
        //   console.log(index)
        //   el.OrganizationTypeID = index.OrganizationTypeID
        //   el.save();
        // });

        // let province = await Province.findAll();
        // let org = await Organization.findAll();

        // org.forEach(el => {
        //   let index = province.find((pv) => {
        //     return pv.ProvinceCode.substring(0, 2) == el.OrganizationProvinceID
        //   })
        //   if(index){
        //     el.OrganizationProvinceID = index.ProvinceID
        //     el.save();
        //   }

        // });

        // let tumbol = await Tumbol.findAll();

        // let id = 63008;

        // let org = await Farm.findByPk(id);

        // org.forEach(el => {
        //   let index = tumbol.find((pv) => {
        //     return pv.TumbolCode.substring(0, 6) == el.FarmTumbolID
        //   })
        //   if(index){
        //     el.FarmProvinceID = index.ProvinceID
        //     el.FarmAmphurID = index.AmphurID
        //     el.FarmTumbolID = index.TumbolID
        //     el.FarmZipCode = index.Zipcode
        //     el.save();
        //   }

        // });

        // let tumbol = await Tumbol.findAll();
        // let org = await Organization.findAll();

        // org.forEach(el => {
        //   let index = tumbol.find((pv) => {
        //     return pv.TumbolID == el.OrganizationTumbolID
        //   })
        //   if(index){
        //     // el.OrganizationTumbolID = index.TumbolID
        //     el.OrganizationZipCode = index.Zipcode
        //     el.save();
        //   }

        // });

        // let orgParent = await Organization.findAll();
        // let org = await Organization.findAll();

        // org.forEach(el => {
        //   let index = orgParent.find((pv) => {
        //     return pv.OrganizationCode == el.ParentOrganizationID
        //   })
        //   if(index){
        //     el.ParentOrganizationID = index.OrganizationID
        //     el.save();
        //   }

        // });

        // let semen = await Semen.findAll({ where: { BreederID: 1 } });
        // let animal = await Animal.findAll();

        // if (semen) {
        //   semen.forEach((el) => {
        //     let index = animal.find((pv) => {
        //       return pv.AnimalIdentificationID == el.SemenNumber;
        //     });

        //     if (index) {
        //       el.BreederID = index.AnimalID;
        //       el.save();
        //     }
        //   });
        // }

        let project = Project.findAll();

        (await project).forEach((e) => {
          let type = JSON.parse(e.AnimalTypeID);

          type.forEach(async (t) => {
            let pa = new ProjectToAnimalType({
              ProjectID: e.ProjectID,
              AnimalTypeID: t,
              CreatedUserID: 1,
              CreatedDatetime: Date.now(),
            });

            await pa.save();
          });
        });

        resolve({});
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
};

module.exports = { ...methods };
