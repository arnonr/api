const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Cart"),
  { Op } = require("sequelize");

const Animal = require("../models/Animal");
const Farm = require("../models/Farm");
const AnimalSex = require("../models/AnimalSex");
const AnimalStatus = require("../models/AnimalStatus");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.GetUserID) $where["UserID"] = req.query.GetUserID;

    if (req.query.CartID) $where["CartID"] = req.query.CartID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["CartID", "ASC"]];
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
          { model: Farm, as: "AnimalFarm" },
          { model: AnimalSex, as: "AnimalSex" },
          { model: AnimalStatus, as: "AnimalStatus" },
        ],
      },
    ];

    return { query: query };
  },

  async getData(data) {
    let dataJson = data.toJSON();
    let animal = dataJson.Animal.toJSON();
    data = {
      CartID: dataJson.CartID,
      ...await data.Animal.EventLatest(),
     Notification: await data.Animal.Notification()



      //       "AIID": 51,
      //       "TransferEmbryoID": null,
      //       "PAR": 12,
      //       "TimeNo": 17,
      //       "AIDate": "2022-07-28",
      //       "ThaiAIDate": "28/07/2565",
      //       "ThaiEventLatest": "28/07/2565",
      //       "EmbryoDate": null,
      //       "PregnancyStatus": "",
      //       "PregnancyTimeNo": "",
      // ...dataJson,
      // Animal: {
      //   ...dataJson.Animal.toJSON(),
      //   EventLatest: await data.Animal.EventLatest(),
      //   Notification: await data.Animal.Notification(),
      //   AnimalFarm: undefined,
      //   AnimalSex: undefined,
      //   AnimalStatus: undefined,
      // },
      // User: undefined,
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
                data = await this.getData(data);
                return data;
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
        const obj = await db.findByPk(id, {
          include: [
            { all: true, required: false },
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

        console.log(obj);

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
        //check เงื่อนไขตรงนี้ได้
        data.UserID = data.CreatedUserID;

        let checkCart = await db.findOne({
          where: {
            AnimalID: data.AnimalID,
            UserID: data.UserID,
          },
        });
        let res = null;

        if (!checkCart) {
          const obj = new db(data);
          const inserted = await obj.save();
          res = await methods.findById(inserted.CartID);
        } else {
          res = await methods.findById(checkCart.CartID);
        }

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
        data.CartID = parseInt(id);

        await db.update(data, { where: { CartID: id } });

        let res = methods.findById(data.CartID);

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  delete(data, UserID) {
    return new Promise(async (resolve, reject) => {
      try {

        const obj = await db.findOne({
          where: { AnimalID: data.AnimalID, UserID: UserID },
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        await db.destroy({ where: { AnimalID: data.AnimalID, UserID: UserID } });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
