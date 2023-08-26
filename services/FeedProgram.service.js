const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/FeedProgram"),
  { Op, col, fn } = require("sequelize");

let AnimalType = require("../models/AnimalType");
const FeedProgramAnimal = require("../models/FeedProgramAnimal");
let Staff = require("../models/Staff");
let Farm = require("../models/Farm");

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

    // AnimalTypeID
    // let WhereAnimalType = null;
    if (req.query.AnimalTypeID) {
      // WhereAnimalType = {
      //   AnimalTypeID: {
      //     [Op.in]: JSON.parse(req.query.AnimalTypeID),
      //   },
      // };

      $where["$AnimalTypes.AnimalTypeID$"] = {
        [Op.in]: JSON.parse(req.query.AnimalTypeID),
      };
    }

    query["include"] = [
      // { all: true, required: false },
      {
        model: AnimalType,
        // where: WhereAnimalType,
        attributes: ["AnimalTypeID", "AnimalTypeCode", "AnimalTypeName"],
        through: {
          attributes: [],
        },
        required: true,
      },
      {
        model: FeedProgramAnimal,
        as: "FeedProgramAnimals",
        // where: WhereAnimalType,
        attributes: [
          "FeedProgramAnimalID",
          "AnimalID",
          "StartWeight",
          "EndWeight",
        ],
        required: false,
      },
      {
        model: Staff,
        as: "Staff",
        required: false,
        attributes: [
          "StaffID",
          "StaffNumber",
          "StaffGivenName",
          "StaffSurname",
          "StaffFullName",
          // [col("StaffGivenName"), "task"],
          // [
          //   fn(
          //     "CONCAT",
          //     col("Staff.StaffGivenName"),
          //     " ",
          //     col("Staff.StaffSurName")
          //   ),
          //   "countTask",
          // ],
        ],
      },
      {
        model: Farm,
        as: "Farm",
        required: false,
        attributes: ["FarmID", "FarmIdentificationNumber", "FarmName"],
      },
    ];

    // query["attributes"] = ["FeedProgramID",[col("Staff.StaffGivenName"),'task']];

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
          delete _q.query.attributes,
          (_q.query["distinct"] = true),
          db.count(_q.query),
        ])
          .then((result) => {
            const rows = result[0],
              count = result[3];
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
        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        //check เงื่อนไขตรงนี้ได้
        if (!Array.isArray(data.AnimalTypeID)) {
          reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }

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
        data.FeedProgramID = parseInt(id);

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { FeedProgramID: id } });

        if (data.AnimalTypeID) {
          if (!Array.isArray(data.AnimalTypeID)) {
            reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }

          const animalTypes = await obj.getAnimalTypes();
          await obj.removeAnimalTypes(animalTypes);
          obj.addAnimalTypes(data.AnimalTypeID);
        }

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

        const animalTypes = await obj.getAnimalTypes();
        await obj.removeAnimalTypes(animalTypes);

        await db.update(
          { isRemove: 1, isActive: 0, updatedAt: fn("GETDATE") },
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
