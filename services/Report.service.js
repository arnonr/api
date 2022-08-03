const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models"),
  { Op } = require("sequelize");

const Organization = require("../models/Organization");
const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const methods = {
  report1(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // REPORT1
        let $where = {};

        if (req.query.OrganizationZoneID)
          $where["OrganizationZoneID"] = req.query.OrganizationZoneID;
        if (req.query.ProvinceID) $where["FarmProvinceID"] = req.query.ProvinceID;
        if (req.query.AmphurID) $where["FarmAmphurID"] = req.query.AmphurID;
        if (req.query.TumbolID) $where["FarmTumbolID"] = req.query.TumbolID;

        if (req.query.AIZoneID) $where["AIZoneID"] = req.query.AIZoneID;
        if (req.query.OrganizationID)
          $where["OrganizationID"] = req.query.OrganizationID;

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        let animal = await Animal.findAll({
          where: {
            AnimalTypeID: { [Op.in]: JSON.parse(req.query.AnimalTypeID) },
            AnimalSexID: 2,
          },
          include: [
            { all: true, required: false },
            {
              model: Farm,
              as: "AnimalFarm",
              ...query,
            },
          ],
        });

        console.log(animal);

        animal.forEach((a) => {
          if(a.AnimalStatus == 1){
            
          }
        });
        

        // AnimalStatus1:



        let data = {};
        data = {
          AnimalStatus1: 50,
          AnimalStatus2: 60,
          AnimalStatus3: 100,
          Total: 160,
          Farms: [
            {
              FarmIdentificationNumber: "109909043",
              FarmName: "ทดสอบ",
              AnimalStatus1: 1,
              AnimalStatus2: 2,
              AnimalStatus1: 3,
              Total: 10,
            },
            {
              FarmIdentificationNumber: "109909043",
              FarmName: "ทดสอบ",
              AnimalStatus1: 1,
              AnimalStatus2: 2,
              AnimalStatus1: 3,
              Total: 10,
            },
          ],
          FarmCount: 100,
        };
        resolve(data);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },
};

module.exports = { ...methods };
