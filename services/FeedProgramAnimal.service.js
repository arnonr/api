const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/FeedProgramAnimal"),
  { Op, fn } = require("sequelize");

const Animal = require("../models/Animal");
const AnimalBreed = require("../models/AnimalBreed");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.FeedProgramAnimalID)
      $where["FeedProgramAnimalID"] = req.query.FeedProgramAnimalID;

    if (req.query.FeedProgramID)
      $where["FeedProgramID"] = req.query.FeedProgramID;
    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["FeedProgramAnimalID", "ASC"]];
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

    query["include"] = [
      { all: true, required: false },
      {
        model: Animal,
        as: "Animal",
        include: [
          {
            model: AnimalBreed,
            as: "AnimalBreed1",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed2",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed3",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed4",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed5",
          },
        ],
      },
    ];

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
          include: [
            { all: true, required: false },
            {
              model: Animal,
              as: "Animal",
              include: [
                {
                  model: AnimalBreed,
                  as: "AnimalBreed1",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed2",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed3",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed4",
                },
                {
                  model: AnimalBreed,
                  as: "AnimalBreed5",
                },
              ],
            },
          ],
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
        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.FeedProgramAnimalID);

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
        data.FeedProgramAnimalID = parseInt(id);

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { FeedProgramAnimalID: id } });

        let res = methods.findById(data.FeedProgramAnimalID);

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
          { where: { FeedProgramAnimalID: id } }
        );

        await db.destroy({
          where: { FeedProgramAnimalID: id },
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
