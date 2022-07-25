const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/CardRequestLog"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff"),
  Organization = require("../models/Organization"),
  Position = require("../models/Position"),
  PositionType = require("../models/PositionType");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.CardRequestID)
      $where["CardRequestID"] = req.query.CardRequestID;

    if (req.query.StaffID) $where["StaffID"] = req.query.StaffID;
    if (req.query.IsApprove) $where["IsApprove"] = req.query.IsApprove;
    if (req.query.ApproveByStaffID)
      $where["IsApprove"] = req.query.ApproveByStaffID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["CardRequestID", "ASC"]];
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
        let obj = await db.findByPk(id, {
          include: [
            { all: true, required: false },
            {
              model: Staff,
              as: "Staff",
              include: [
                {
                  model: Position,
                  as: "Position",
                },
                {
                  model: PositionType,
                  as: "PositionType",
                },
                {
                  model: Organization,
                  as: "Organization"
                }
              ],
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        // let obj1 = { ...obj.toJSON() };
        // console.log(obj1.Staff)
        // obj1.StaffFullName =
        //   obj1.Staff.StaffGivenName + " " + obj1.Staff.StaffSurname;
        // obj1.PositionName = obj1.Staff.Position.PositionName;

        // obj1.PositionTypeName = obj1.Staff.PositionType.PositionTypeName;

        // obj1.Position = undefined;
        // obj1.PositionType = undefined;
        // obj1.Staff = undefined;

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
        const obj = new db(data);
        const inserted = await obj.save();

        const res = await db.findByPk(inserted.CardRequestID);

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
        data.CardRequestID = parseInt(id);

        await db.update(data, { where: { CardRequestID: id } });

        const res = await db.findByPk(id);

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
          { where: { CardRequestID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
