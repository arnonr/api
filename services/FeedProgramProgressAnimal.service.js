const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/FeedProgramProgressAnimal"),
  { Op, fn } = require("sequelize");

// const FeedPPToConcentrate = require("../models/FeedPPToConcentrate");
// const Concentrate = require("../models/Concentrate");
// const FeedPPToRoughages = require("../models/FeedPPToRoughages");
// const Roughages = require("../models/Roughages");
const FeedProgramProgress = require("../models/FeedProgramProgress");
const FeedProgramAnimal = require("../models/FeedProgramAnimal");
const Animal = require("../models/Animal");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.FeedProgramProgressAnimalID)
      $where["FeedProgramProgressAnimalID"] =
        req.query.FeedProgramProgressAnimalID;

    if (req.query.FeedProgramProgressID)
      $where["FeedProgramProgressID"] = req.query.FeedProgramProgressID;

    if (req.query.FeedProgramAnimalID)
      $where["FeedProgramAnimalID"] = req.query.FeedProgramAnimalID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["FeedProgramProgressAnimalID", "ASC"]];
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
            let rows = result[0],
              count = result[1];
            //
            rows = rows.map((data) => {
              data = {
                ...data.toJSON(),
              };

              return data;
            });
            //

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
          include: [{ all: true, required: false }],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        resolve(obj.toJSON());
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

        let res = methods.findById(inserted.FeedProgramProgressAnimalID);

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
        data.FeedProgramProgressAnimalID = parseInt(id);

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { FeedProgramProgressAnimalID: id } });

        let res = methods.findById(data.FeedProgramProgressAnimalID);

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
          { where: { FeedProgramProgressAnimalID: id } }
        );

        await db.destroy({
          where: { FeedProgramProgressAnimalID: id },
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
