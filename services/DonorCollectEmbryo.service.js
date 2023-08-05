const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/DonorCollectEmbryo"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");

const Donor = require("../models/Donor");
const Animal = require("../models/Animal");
const DonorCollectEmbryoDetail = require("../models/DonorCollectEmbryoDetail");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.DonorCollectEmbryoID)
      $where["DonorCollectEmbryoID"] = req.query.DonorCollectEmbryoID;

    if (req.query.DonorID) $where["DonorID"] = req.query.DonorID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.CollectDate) $where["CollectDate"] = req.query.CollectDate;

    if (req.query.BCSID) $where["BCSID"] = req.query.BCSID;

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
    $order = [["DonorCollectEmbryoID", "ASC"]];
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

    let WhereAnimalType = null;
    if (req.query.AnimalTypeID) {
      WhereAnimalType = {
        AnimalTypeID: {
          [Op.in]: JSON.parse(req.query.AnimalTypeID),
        },
      };
    }

    query["include"] = [
      { all: true, required: false },
      {
        model: Donor,
        include: { all: true, required: false },
      },
      {
        model: Animal,
        where: WhereAnimalType,
        as: "Animal",
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
              total: rows.length,
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
              model: Donor,
              include: { all: true, required: false },
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
        var date = new Date(); // Or the date you'd like converted.
        var isoDateTime = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        ).toISOString();

data.createdAt = isoDateTime;

        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.DonorCollectEmbryoID);

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
        data.DonorCollectEmbryoID = parseInt(id);

         var date = new Date();
        var isoDateTime = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        ).toISOString();

        data.updatedAt = isoDateTime;

        await db.update(data, { where: { DonorCollectEmbryoID: id } });

        let res = methods.findById(data.DonorCollectEmbryoID);

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
          { where: { DonorCollectEmbryoID: id } }
        );

        // await DonorCollectEmbryoDetail.destroy(
        //   { where: { DonorCollectEmbryoID: id } }
        // );

        await DonorCollectEmbryoDetail.update(
          { isRemove: 1, isActive: 0 },
          { where: { DonorCollectEmbryoID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
