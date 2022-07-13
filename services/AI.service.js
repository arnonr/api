const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/AI"),
  { Op } = require("sequelize");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.AIID) $where["AIID"] = req.query.AIID;

    if (req.query.AnimalID)
      $where["AnimalID"] = {
        [Op.like]: "%" + req.query.AnimalID + "%",
      };

    if (req.query.TimeNo) $where["TimeNo"] = req.query.TimeNo;

    if (req.query.AIDate) $where["AIDate"] = req.query.AIDate;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.ProjectID) $where["ProjectID"] = req.query.ProjectID;
    if (req.query.SemenID) $where["SemenID"] = req.query.SemenID;
    if (req.query.AIStatus) $where["AIStatus"] = req.query.AIStatus;

    if (req.query.BirthDate) $where["BirthDate"] = req.query.BirthDate;

    if (req.query.GoatAIMethodID)
      $where["GoatAIMethodID"] = req.query.GoatAIMethodID;
    if (req.query.GoatEstralActivityID)
      $where["GoatEstralActivityID"] = req.query.GoatEstralActivityID;

    if (req.query.BreederAnimalID)
      $where["BreederAnimalID"] = req.query.BreederAnimalID;

    if (req.query.PAR) $where["PAR"] = req.query.PAR;

    // BirthDate

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["AIID", "ASC"]];
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

    query["include"] = { all: true, required: false };

    return { query: query, required: false };
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
          .then((result) => {
            const rows = result[0],
              count = result[2];
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

        let res = methods.findById(inserted.AIID);

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
        data.AIID = parseInt(id);

        await db.update(data, { where: { AIID: id } });

        let res = methods.findById(data.AIID);

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

        await db.update({ isRemove: 1, isActive: 0 }, { where: { AIID: id } });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };