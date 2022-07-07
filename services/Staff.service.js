const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Staff"),
  { Op } = require("sequelize");

const Title = require("../models/Title");
const Gender = require("../models/Gender");
const MarriedStatus = require("../models/MarriedStatus");
const Organization = require("../models/Organization");
const PositionType = require("../models/PositionType");
const Position = require("../models/Position");
const Province = require("../models/Province");
const Amphur = require("../models/Amphur");
const Tumbol = require("../models/Tumbol");
const Education = require("../models/Education");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.StaffID) $where["StaffID"] = req.query.StaffID;
    if (req.query.StaffNumber) $where["StaffNumber"] = req.query.StaffNumber;
    if (req.query.StaffIdentificationNumber)
      $where["StaffIdentificationNumber"] = req.query.StaffIdentificationNumber;
    if (req.query.StaffTitleID) $where["StaffTitleID"] = req.query.StaffTitleID;

    if (req.query.StaffGivenName)
      $where["StaffGivenName"] = {
        [Op.like]: "%" + req.query.StaffGivenName + "%",
      };
    if (req.query.StaffSurname)
      $where["StaffSurname"] = {
        [Op.like]: "%" + req.query.StaffSurname + "%",
      };

    if (req.query.GenderID) $where["StaffGenderID"] = req.query.StaffGenderID;
    if (req.query.StaffMarriedStatusID)
      $where["StaffMarriedStatusID"] = req.query.StaffMarriedStatusID;
    if (req.query.StaffOrganizationID)
      $where["StaffOrganizationID"] = req.query.StaffOrganizationID;
    if (req.query.StaffPositionTypeID)
      $where["StaffPositionTypeID"] = req.query.StaffPositionTypeID;
    if (req.query.StaffPositionID)
      $where["StaffPositionID"] = req.query.StaffPositionID;
    if (req.query.StaffTumbolID)
      $where["StaffTumbolID"] = req.query.StaffTumbolID;
    if (req.query.StaffAmphurID)
      $where["StaffAmphurID"] = req.query.StaffAmphurID;
    if (req.query.StaffProvinceID)
      $where["StaffProvinceID"] = req.query.StaffProvinceID;

    if (req.query.StaffEmail)
      $where["StaffEmail"] = {
        [Op.like]: "%" + req.query.StaffEmail + "%",
      };

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["StaffID", "ASC"]];
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

    query["include"] = { all: true };
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
            const rows = result[0],
              count = result[1];
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
          include: { all: true },
        });

        if (!obj) reject(ErrorNotFound("id: not found"));
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้
        const obj = new db(data);
        const inserted = await obj.save();

        const res = await db.findByPk(inserted.StaffID, {
          include: { all: true },
        });

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

        //check เงื่อนไขตรงนี้ได้

        // Update
        data.StaffID = parseInt(id);
        data.UpdatedUserID = 1;

        await db.update(data, { where: { StaffID: id } });

        const res = await db.findByPk(id, {
          include: { all: true },
        });

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
          { where: { StaffID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
