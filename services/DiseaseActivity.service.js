const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/DiseaseActivity"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const DiseaseActivityAnimal = require("../models/DiseaseActivityAnimal");
const Farm = require("../models/Farm");
const AnimalSex = require("../models/AnimalSex");
const AnimalStatus = require("../models/AnimalStatus");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.DiseaseActivityID)
      $where["DiseaseActivityID"] = req.query.DiseaseActivityID;

    if (req.query.DiseaseActivityDate)
      $where["DiseaseActivityDate"] = req.query.DiseaseActivityDate;

    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

    if (req.query.DiseaseID) $where["DiseaseID"] = req.query.DiseaseID;

    if (req.query.DiseaseNextDate)
      $where["DiseaseNextDate"] = req.query.DiseaseNextDate;

    if (req.query.DiseaseMethodID)
      $where["DiseaseMethodID"] = req.query.DiseaseMethodID;

    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

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

    query["include"] = [{ all: true, required: false }];

    return { query: query };
  },

  async getData(data) {
    let dj = data.toJSON();

    let masterData = {
      OrganizationID: dj.OrganizationID,
      OrganizationName: dj.Organization
        ? dj.Organization.OrganizationName
        : null,
      ResponsibilityStaffID: dj.ResponsibilityStaffID,
      ResponsibilityStaffName: dj.Staff
        ? `${dj.Staff.StaffNumber} ${dj.Staff.StaffGivenName}  ${dj.Staff.StaffSurname}`
        : null,
      isActive: dj.isActive,
      isRemove: dj.isRemove,
      CreatedUserID: dj.CreatedUserID,
      CreatedDateTime: dj.CreatedDateTime,
      UpdatedUserID: dj.UpdatedUserID,
      UpdatedDateTime: dj.UpdatedDateTime,
    };

    data = {
      DiseaseActivityID: dj.DiseaseActivityID,
      DiseaseActivityDate: dj.DiseaseActivityDate,
      ThaiDiseaseActivityDate: dj.ThaiDiseaseActivityDate,
      FarmID: dj.FarmID,
      FarmName: dj.Farm ? dj.Farm.FarmName : null,
      DiseaseID: dj.DiseaseID,
      DiseaseName: dj.Disease ? dj.Disease.DiseaseName : null,
      DiseaseNextDate: dj.DiseaseNextDate,
      ThaiDiseaseNextDate: dj.ThaiDiseaseNextDate,
      DiseaseMethodID: dj.DiseaseMethodID,
      DiseaseMethod: dj.DiseaseMethod
        ? dj.DiseaseMethod.DiseaseMethodName
        : null,
      DiseaseMethodOther: dj.DiseaseMethodOther,
      CountAnimal: await data.countDiseaseActivityAnimal(),
      ...masterData,
      // Animaleiei: await data.getDiseaseActivityAnimal(),
      // DiseaseActivityAnimal: dj.DiseaseActivityAnimal,
    };

    return data;
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
                return await this.getData(data);
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
          include: [
            { all: true, required: false },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let data = await this.getData(obj);

        resolve(data);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.DiseaseActivityID);

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error));
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
