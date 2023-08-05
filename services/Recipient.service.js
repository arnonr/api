const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Recipient"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");
const RecipientActivity = require("../models/RecipientActivity");
const Animal = require("../models/Animal");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.RecipientID) $where["RecipientID"] = req.query.RecipientID;

    if (req.query.StartDate) $where["StartDate"] = req.query.StartDate;
    if (req.query.PresetID) $where["PresetID"] = req.query.PresetID;
    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.IsExclude) $where["IsExclude"] = req.query.IsExclude;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["RecipientID", "ASC"]];
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
        const obj = await db.findByPk(id, {
          include: { all: true, required: false },
        });

        let recipientAnimal = [];
        let recipientActivity = RecipientActivity.findAll({
          where: { RecipientID: id },
          attributes: ["RecipientActivity.AnimalID"],
          group: "RecipientActivity.AnimalID",
          include: [
            {
              model: Animal,
            },
          ],
        });

        (await recipientActivity).forEach((ra) => {
          recipientAnimal.push(ra.Animal);
        });

        let obj1 = obj.toJSON();
        obj1.Animals = recipientAnimal;

        if (!obj1) reject(ErrorNotFound("id: not found"));
        resolve(obj1);
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้
        var date = new Date(); // Or the date you'd like converted.
        var isoDateTime = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        ).toISOString();

data.createdAt = isoDateTime;

        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.RecipientID);

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
        data.RecipientID = parseInt(id);

         var date = new Date();
        var isoDateTime = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        ).toISOString();

        data.updatedAt = isoDateTime;

        await db.update(data, { where: { RecipientID: id } });

        let res = methods.findById(data.RecipientID);

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
          { where: { RecipientID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
