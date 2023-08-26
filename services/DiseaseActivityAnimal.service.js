const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/DiseaseActivityAnimal"),
  { Op, fn } = require("sequelize");

const DiseaseActivity = require("../models/DiseaseActivity");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");
const AnimalSex = require("../models/AnimalSex");
const AnimalStatus = require("../models/AnimalStatus");
const Disease = require("../models/Disease");
const DiseaseMethod = require("../models/DiseaseMethod");
const Organization = require("../models/Organization");
const Staff = require("../models/Staff");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.DiseaseActivityAnimalID)
      $where["DiseaseActivityAnimalID"] = req.query.DiseaseActivityAnimalID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.DiseaseActivityID)
      $where["DiseaseActivityID"] = req.query.DiseaseActivityID;

    if (req.query.DiseaseResultID)
      $where["AnimalID"] = req.query.DiseaseResultID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["DiseaseActivityAnimalID", "ASC"]];
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

    if (req.query.AnimalTypeID) $where["AnimalTypeID"] = req.query.AnimalTypeID;

    query["include"] = [
      { all: true, required: false },
      {
        model: DiseaseActivity,
        as: "DiseaseActivity",
        include: [
          { model: Organization, as: "Organization" },
          { model: Staff, as: "Staff" },
          { model: Disease, as: "Disease" },
          { model: DiseaseMethod, as: "DiseaseMethod" },
          { model: Farm, as: "Farm" },
        ],
      },
      {
        model: Animal,
        as: "Animal",
        include: [
          { model: Farm, as: "AnimalFarm" },
          { model: AnimalSex, as: "AnimalSex" },
          { model: AnimalStatus, as: "AnimalStatus" },
        ],
      },
    ];

    return { query: query };
  },

  async getData(data) {
    let dj = data.toJSON();

    let masterData = {
      isActive: dj.isActive,
      isRemove: dj.isRemove,
      CreatedUserID: dj.CreatedUserID,
      CreatedDateTime: dj.CreatedDateTime,
      UpdatedUserID: dj.UpdatedUserID,
      UpdatedDateTime: dj.UpdatedDateTime,
    };

    data = {
      DiseaseActivityAnimalID: dj.DiseaseActivityAnimalID,
      DiseaseActivityID: dj.DiseaseActivityID,
      AnimalID: dj.AnimalID,
      DiseaseResultID: dj.DiseaseResultID,
      DiseaseResultName: dj.DiseaseResult
        ? dj.DiseaseResult.DiseaseResultName
        : null,
      Remark: dj.Remark,
      ...masterData,
      //
      Animal: {
        ...(await data.Animal.EventLatest()),
        AIID: undefined,
        AnimalSecretStatus: undefined,
        TransferEmbryoID: undefined,
        PAR: undefined,
        TimeNo: undefined,
        AIDate: undefined,
        ThaiAIDate: undefined,
        ThaiEventLatest: undefined,
        EmbryoDate: undefined,
        PregnancyStatus: undefined,
        PregnancyTimeNo: undefined,
      },
      DiseaseActivity: {
        DiseaseActivityID: dj.DiseaseActivityID,
        ThaiDiseaseActivityDate: dj.DiseaseActivity.ThaiDiseaseActivityDate,
        DiseaseActivityDate: dj.DiseaseActivity.DiseaseActivityDate,
        ThaiDiseaseNextDate: dj.DiseaseActivity.ThaiDiseaseNextDate,
        DiseaseNextDate: dj.DiseaseActivity.DiseaseNextDate,
        FarmID: dj.DiseaseActivity.FarmID,
        FarmName: dj.DiseaseActivity.Farm.FarmName,
        DiseaseID: dj.DiseaseActivity.DiseaseID,
        DiseaseName: dj.DiseaseActivity.Disease.DiseaseName,
        DiseaseMethodID: dj.DiseaseActivity.DiseaseMethodID,
        DiseaseMethodName: dj.DiseaseActivity.DiseaseMethod.DiseaseMethodName,
        DiseaseMethodOther: dj.DiseaseActivity.DiseaseMethodOther,
        OrganizationID: dj.DiseaseActivity.OrganizationID,
        OrganizationName: dj.DiseaseActivity.Organization
          ? dj.DiseaseActivity.Organization.OrganizationName
          : "",
        ResponsibilityStaffID: dj.DiseaseActivity.ResponsibilityStaffID,
        ResponsibilityStaffName: dj.DiseaseActivity.Staff
          ? `${dj.DiseaseActivity.Staff.StaffNumber} ${dj.DiseaseActivity.Staff.StaffGivenName}  ${dj.DiseaseActivity.Staff.StaffSurname}`
          : null,
      },
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
        console.log(id);
        const obj = await db.findByPk(id, {
          include: [
            { all: true, required: false },
            {
              model: DiseaseActivity,
              as: "DiseaseActivity",
              include: [
                { model: Organization, as: "Organization" },
                { model: Staff, as: "Staff" },
                { model: Disease, as: "Disease" },
                { model: DiseaseMethod, as: "DiseaseMethod" },
                { model: Farm, as: "Farm" },
              ],
            },
            {
              model: Animal,
              as: "Animal",
              include: [
                { model: Farm, as: "AnimalFarm" },
                { model: AnimalSex, as: "AnimalSex" },
                { model: AnimalStatus, as: "AnimalStatus" },
              ],
            },
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
        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.DiseaseActivityAnimalID);

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
        data.DiseaseActivityAnimalID = parseInt(id);

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { DiseaseActivityAnimalID: id } });

        let res = methods.findById(data.DiseaseActivityAnimalID);

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error));
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
          { where: { DiseaseActivityAnimalID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
