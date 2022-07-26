const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/DiseaseActivity"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.DiseaseActivityID)
      $where["DiseaseActivityID"] = req.query.DiseaseActivityID;

    if (req.query.DiseaseActivityDate)
      $where["DiseaseActivityDate"] = req.query.DiseaseActivityDate;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.DiseaseID) $where["DiseaseID"] = req.query.DiseaseID;

    if (req.query.DiseaseNextDate)
      $where["DiseaseNextDate"] = req.query.DiseaseNextDate;

    if (req.query.DiseaseMethodID)
      $where["DiseaseMethodID"] = req.query.DiseaseMethodID;

    if (req.query.DiseaseResultID)
      $where["DiseaseResultID"] = req.query.DiseaseResultID;

    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.PAR) $where["PAR"] = req.query.PAR;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["DiseaseActivityID", "ASC"]];
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
      //   {
      //     model: Staff,
      //     attributes: ['StaffGivenName', 'StaffSurname']
      //   },
    ];

    return { query: query };
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch(req, limit, offset);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([
          db.findAll(_q.query),
          delete _q.query.include,
          db.count(_q.query),
        ])
          .then(async (result) => {
            let rows = result[0],
              count = result[2];

            rows = await Promise.all(
              rows.map(async (data) => {
                let dataJson = data.toJSON();

                let animalArray = [];
                dataJson.AnimalID = JSON.parse(dataJson.AnimalID);

                for (const d of dataJson.AnimalID) {
                  let animal = await Animal.findByPk(d);
                  animalArray.push(animal);
                }

                dataJson.Animal = animalArray;
                return dataJson;
              })
            );

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
        const obj = await db.findByPk(id, {
          include: { all: true, required: false },
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let dataJson = obj.toJSON();
        let animalArray = [];

        dataJson.AnimalID = JSON.parse(dataJson.AnimalID);

        for (const d of dataJson.AnimalID) {
          let animal = await Animal.findByPk(d);
          animalArray.push(animal);
        }

        dataJson.Animal = animalArray;

        resolve(dataJson);
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้
        if (!Array.isArray(data.AnimalID)) {
          reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        data.AnimalID = JSON.stringify(data.AnimalID);

        const obj = new db(data);
        const inserted = await obj.save();

        if (data.AnimalID) {
          if (!Array.isArray(data.AnimalID)) {
            reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          data.AnimalID = JSON.stringify(data.AnimalID);
        }

        let res = methods.findById(inserted.DiseaseActivityID);

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
        data.DiseaseActivityID = parseInt(id);

        await db.update(data, { where: { DiseaseActivityID: id } });

        let res = methods.findById(data.DiseaseActivityID);

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
          { where: { DiseaseActivityID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
