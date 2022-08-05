const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/AnimalType"),
  { Op } = require("sequelize");
const AnimalGenre = require("../models/AnimalGenre");
const AnimalGroupType = require("../models/AnimalGroupType");
const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.AnimalTypeID) $where["AnimalTypeID"] = req.query.AnimalTypeID;

    if (req.query.AnimalTypeCode)
      $where["AnimalTypeCode"] = {
        [Op.like]: "%" + req.query.AnimalTypeCode + "%",
      };

    if (req.query.AnimalTypeName)
      $where["AnimalTypeName"] = {
        [Op.like]: "%" + req.query.AnimalTypeName + "%",
      };

    if (req.query.AnimalGenreID)
      $where["AnimalGenreID"] = req.query.AnimalGenreID;
    if (req.query.AnimalGroupTypeID)
      $where["AnimalGroupTypeID"] = req.query.AnimalGroupTypeID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["AnimalTypeID", "ASC"]];
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

    query["include"] = [{ model: AnimalGenre }, { model: AnimalGroupType }];

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
          .then((result) => {
            let rows = result[0],
              count = result[2];

            rows = rows.map((obj) => {
              obj = obj.toJSON();
              obj.AnimalGenreName = obj.AnimalGenre.AnimalGenreName;
              obj.AnimalGroupTypeName = obj.AnimalGroupType.AnimalGroupTypeName;
              obj.AnimalGenre = undefined;
              obj.AnimalGroupType = undefined;
              return obj;
            });

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
          include: [{ model: AnimalGenre }, { model: AnimalGroupType }],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));
        obj = obj.toJSON();
        obj.AnimalGenreName = obj.AnimalGenre.AnimalGenreName;
        obj.AnimalGroupTypeName = obj.AnimalGroupType.AnimalGroupTypeName;
        obj.AnimalGenre = undefined;
        obj.AnimalGroupType = undefined;

        resolve(obj);
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

        let res = methods.findById(inserted.AnimalTypeID);

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
        data.AnimalTypeID = parseInt(id);

        await db.update(data, { where: { AnimalTypeID: id } });

        let res = methods.findById(data.AnimalTypeID);

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
          { where: { AnimalTypeID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
