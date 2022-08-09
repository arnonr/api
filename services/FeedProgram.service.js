const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/FeedProgram"),
  { Op } = require("sequelize");

let AnimalType = require("../models/AnimalType");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.FeedProgramID)
      $where["FeedProgramID"] = req.query.FeedProgramID;

    //   StartDate EndDate

    if (req.query.FeedProgramName)
      $where["FeedProgramName"] = req.query.FeedProgramName;

    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

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
    $order = [["FeedProgramID", "ASC"]];
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
        inserted.addAnimalTypes(data.AnimalTypeID);

        let res = methods.findById(inserted.FeedProgramID);

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
        const animalTypes = await obj.getAnimalTypes()
        await obj.removeAnimalTypes(animalTypes);

        data.FeedProgramID = parseInt(id);

        const updated = await db.update(data, { where: { FeedProgramID: id } });

        obj.addAnimalTypes(data.AnimalTypeID);

        let res = methods.findById(data.FeedProgramID);

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

        const animalTypes = await obj.getAnimalTypes()
        await obj.removeAnimalTypes(animalTypes);

        await db.update(
          { isRemove: 1, isActive: 0 },
          { where: { FeedProgramID: id } }
        );

        await db.destroy({
          where: { FeedProgramID: id },
        });

        // await db.restore({
        //   where: { FeedProgramID: id }
        // });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
