const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models"),
  { Op } = require("sequelize");

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

const methods = {
  report1(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Search
        let $where = {};

        // ZoneID อ้างจากจังหวัด
        if (req.query.OrganizationZoneID)
          $where["OrganizationZoneID"] = req.query.OrganizationZoneID;

        if (req.query.ProvinceID)
          $where["FarmProvinceID"] = req.query.ProvinceID;

        if (req.query.AmphurID) $where["FarmAmphurID"] = req.query.AmphurID;

        if (req.query.TumbolID) $where["FarmTumbolID"] = req.query.TumbolID;

        if (req.query.AIZoneID) $where["AIZoneID"] = req.query.AIZoneID;

        if (req.query.OrganizationID)
          $where["OrganizationID"] = req.query.OrganizationID;

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

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
        let $where = {};

        // ZoneID อ้างจากจังหวัด
        if (req.query.AnimalEarID)
          $where["AnimalEarID"] = req.query.AnimalEarID;

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        query["include"] = [
          {
            model: AnimalStatus,
          },
          {
            model: ProductionStatus,
          },
          {
            model: Farm,
          },
        ];

        let animal = await Animal.findOne({
          ...query,
        });

        // animal = await Promise.all(
        //   animal.map(async (e) => {

        //   })
        // );

        let data = {
          AnimalEarID: animal.AnimalEarID,
          AnimalMicrochip: animal.AnimalMicrochip,
          AnimalBirthDate: animal.AnimalBirthDate,
          AnimalStatus: animal.AnimalStatus.AnimalStatusName,
          ProductionStatus: animal.ProductionStatus.ProductionStatusName,
          AnimalPar: animal.AnimalPar,
          //
          AnimalBreed: animal.AnimalBreedAll,
          // father

          // father Breed
          // moather
          // moather breed
          AnimalSource: animal.AnimalSource, // แปลไทย
          // วันที่เข้าฝูง คือไรว่ะ
          Farm: animal.Farm.FarmName,
          FarmIdentificationNumber: animal.Farm.FarmIdentificationNumber,
          //

          // Young: young,
          // Child: child,
          // Total: total,
          // Farms: farms,
          // FarmCount: farms.length,
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
        // Search
        let $where = {};
        // req.query.AIZoneID
        // req.query.startDate
        // req.query.endDate

        // ต้อง get เจ้าหน้าที่ที่อยู่ในศูนย์วิจัยทั้งหมด
        if (req.query.AIZoneID) {
          // AIZONE มาจาก organizationID
          // $where["ParentOrganizationID"] = req.query.ParentOrganizationID;
          // let organization = `with recursive cte (OrganizationID, ParentOrganizationID) as (
          //   select     OrganizationID,
          //              ParentOrganizationID
          //   from       Organization
          //   where      ParentOrganizationID = ${req.query.OrganizationID}
          //   union all
          //   select     o.OrganizationID,
          //              o.ParentOrganizationID
          //   from       Organization o
          //   inner join cte
          //           on o.ParentOrganizationID = cte.OrganizationID
          // )
          // select * from cte;`;

          // const res = await sequelize.query(organization);

          // let orgArr = [req.query.ParentOrganizationID];
          // res[0].map((r) => {
          //   orgArr.push(r.OrganizationID);
          // });

          // $where["OrganizationID"] = { [Op.in]: orgArr };
          // $where["OrganizationAiZoneID"] = req.query.AIZoneID;

          let organization = await Organization.findAll({
            where: {
              OrganizationAiZoneID: req.query.AIZoneID,
            },
          });

          let orgArr = [];
          res[0].map((r) => {
            orgArr.push(r.OrganizationID);
          });

          // $where["OrganizationID"] = { [Op.in]: orgArr };
        }

        // ตาราง staff,
        let staff = await Staff.findAll({
          where: { OrganizationID: { [Op.in]: orgArr } },
        });

        staff = await Promise.all(
          staff.map(async (s) => {
            let ai = await AI.findAll({
              where: {
                ResponsibilityStaffID: s.StaffID,
              },
            });
            // s.r1
            // let uniqueAIs = [...new Set(ai)];
            // s.r1 = uniqueAIs.length

            let uniqueAIs = ai.filter((element, index) => {
              return ai.indexOf(element) === index;
            });

            s.r1 = uniqueAIs.length();
            s.r2 = ai.length();
            return s;
          })
        );

        // ขึ้นข้อมูล จำนวนที่ผสม

        // ZoneID อ้างจากจังหวัด
        if (req.query.AnimalEarID)
          $where["AnimalEarID"] = req.query.AnimalEarID;

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        query["include"] = [
          {
            model: AnimalStatus,
          },
          {
            model: ProductionStatus,
          },
          {
            model: Farm,
          },
        ];

        let animal = await Animal.findOne({
          ...query,
        });

        // animal = await Promise.all(
        //   animal.map(async (e) => {

        //   })
        // );

        let data = {
          AnimalEarID: animal.AnimalEarID,
          AnimalMicrochip: animal.AnimalMicrochip,
          AnimalBirthDate: animal.AnimalBirthDate,
          AnimalStatus: animal.AnimalStatus.AnimalStatusName,
          ProductionStatus: animal.ProductionStatus.ProductionStatusName,
          AnimalPar: animal.AnimalPar,
          //
          AnimalBreed: animal.AnimalBreedAll,
          // father

          // father Breed
          // moather
          // moather breed
          AnimalSource: animal.AnimalSource, // แปลไทย
          // วันที่เข้าฝูง คือไรว่ะ
          Farm: animal.Farm.FarmName,
          FarmIdentificationNumber: animal.Farm.FarmIdentificationNumber,
          //

          // Young: young,
          // Child: child,
          // Total: total,
          // Farms: farms,
          // FarmCount: farms.length,
        };
        resolve(data);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
  report4(req) {
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
