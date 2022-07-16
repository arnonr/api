const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Embryo"),
  { Op } = require("sequelize");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.EmbryoID) $where["EmbryoID"] = req.query.EmbryoID;

    if (req.query.EmbryoNumber)
      $where["EmbryoNumber"] = {
        [Op.like]: "%" + req.query.EmbryoNumber + "%",
      };

    if (req.query.SemenID)
      $where["SemenID"] = {
        [Op.like]: "%" + req.query.SemenID + "%",
      };

    if (req.query.MaleBreederID)
      $where["MaleBreederID"] = {
        [Op.like]: "%" + req.query.MaleBreederID + "%",
      };

    if (req.query.FemaleBreederID)
      $where["FemaleBreederID"] = {
        [Op.like]: "%" + req.query.FemaleBreederID + "%",
      };

    if (req.query.AnimalTypeID) $where["AnimalTypeID"] = req.query.AnimalTypeID;

    if (req.query.SourceTypeID) $where["SourceTypeID"] = req.query.SourceTypeID;
    if (req.query.CountryID) $where["CountryID"] = req.query.CountryID;
    if (req.query.SourceOrganizationID)
      $where["SourceOrganizationID"] = req.query.SourceOrganizationID;

    if (req.query.ProduceDate) $where["ProduceDate"] = req.query.ProduceDate;

    if (req.query.ProduceType) $where["ProduceType"] = req.query.ProduceType;
    if (req.query.EmbryoStageID)
      $where["EmbryoStageID"] = req.query.EmbryoStageID;
    if (req.query.EmbryoSex) $where["EmbryoSex"] = req.query.EmbryoSex;

    if (req.query.StrawColor)
      $where["StrawColor"] = {
        [Op.like]: "%" + req.query.StrawColor + "%",
      };
    if (req.query.PlugColor)
      $where["PlugColor"] = {
        [Op.like]: "%" + req.query.PlugColor + "%",
      };
    if (req.query.Trypsinization)
      $where["Trypsinization"] = {
        [Op.like]: "%" + req.query.Trypsinization + "%",
      };
    if (req.query.ZonaIntact)
      $where["ZonaIntact"] = {
        [Op.like]: "%" + req.query.ZonaIntact + "%",
      };
    if (req.query.EmbryoManipulated)
      $where["EmbryoManipulated"] = {
        [Op.like]: "%" + req.query.EmbryoManipulated + "%",
      };
    if (req.query.EmbryoStatus)
      $where["EmbryoStatus"] = {
        [Op.like]: "%" + req.query.EmbryoStatus + "%",
      };

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["EmbryoID", "ASC"]];
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

        let res = methods.findById(inserted.EmbryoID);

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
        data.EmbryoID = parseInt(id);

        await db.update(data, { where: { EmbryoID: id } });

        let res = methods.findById(data.EmbryoID);

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
          { where: { EmbryoID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
