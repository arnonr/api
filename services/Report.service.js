const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models"),
  { Op } = require("sequelize");
const Organization = require("../models/Organization");

const Staff = require("../models/Staff");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.RegionID) $where["RegionID"] = req.query.RegionID;
    if (req.query.RegionCode)
      $where["RegionCode"] = {
        [Op.like]: "%" + req.query.RegionCode + "%",
      };
    if (req.query.RegionName)
      $where["RegionName"] = {
        [Op.like]: "%" + req.query.RegionName + "%",
      };

    if (req.query.RegionNameEN)
      $where["RegionNameEN"] = {
        [Op.like]: "%" + req.query.RegionNameEN + "%",
      };

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["RegionID", "ASC"]];
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

    return { query: query };
  },

  //   find(req) {
  //     const limit = +(req.query.size || config.pageLimit);
  //     const offset = +(limit * ((req.query.page || 1) - 1));
  //     const _q = methods.scopeSearch(req, limit, offset);
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         Promise.all([db.findAll(_q.query), db.count(_q.query)])
  //           .then((result) => {
  //             const rows = result[0],
  //               count = result[1];
  //             resolve({
  //               total: count,
  //               lastPage: Math.ceil(count / limit),
  //               currPage: +req.query.page || 1,
  //               rows: rows,
  //             });
  //           })
  //           .catch((error) => {
  //             reject(error);
  //           });
  //       } catch (error) {
  //         reject(error);
  //       }
  //     });
  //   },

  //   findById(id) {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         const obj = await db.findByPk(id);

  //         if (!obj) reject(ErrorNotFound("id: not found"));
  //         resolve(obj.toJSON());
  //       } catch (error) {
  //         reject(ErrorNotFound("id: not found"));
  //       }
  //     });
  //   },

  report1() {
    return new Promise(async (resolve, reject) => {
      try {
        let staff = await Staff.findAll({
          attributes: [
            "StaffID",
            "StaffNumber",
            "StaffGivenName",
            "StaffSurname",
          ],
          where: {
            isRemove: 0,
            isActive: 1,
          },
        });

        staff = staff.map((s) => {
          s = s.toJSON();
          s.Title = undefined;
          s.gender = undefined;
          s.MarriedStatus = undefined;
          s.Gender = undefined;
          s.Organization = undefined;
          s.PositionType = undefined;
          s.Position = undefined;
          s.Tumbol = undefined;
          s.Amphur = undefined;
          s.Province = undefined;
          s.Education = undefined;
          s.Major = undefined;
          s.ai = [
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.random() * 100 + "%",
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
          ];
          return s;
        });

        resolve({total: staff.length , staff: staff});
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้
        const obj = new db(data);
        const inserted = await obj.save();

        const res = await db.findByPk(inserted.RegionID);

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
        data.RegionID = parseInt(id);

        await db.update(data, { where: { RegionID: id } });

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
          { where: { RegionID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
