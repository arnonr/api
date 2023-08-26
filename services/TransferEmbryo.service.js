const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/TransferEmbryo"),
  { Op, fn } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const AnimalType = require("../models/AnimalType");
const axios = require("axios");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.TransferEmbryoID)
      $where["TransferEmbryoID"] = req.query.TransferEmbryoID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    // if (req.query.AnimalTypeID) $where["AnimalTypeID"] = req.query.AnimalTypeID;

    if (req.query.TransferDate) $where["TransferDate"] = req.query.TransferDate;

    if (req.query.EmbryoNumber) $where["EmbryoNumber"] = req.query.EmbryoNumber;
    if (req.query.TransferMethodID)
      $where["TransferMethodID"] = req.query.TransferMethodID;
    if (req.query.StandingHeatDate)
      $where["StandingHeatDate"] = req.query.StandingHeatDate;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.PAR) $where["PAR"] = req.query.PAR;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["TransferEmbryoID", "ASC"]];
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
        model: Animal,
        where: WhereAnimalType,
      },
    ];

    return { query: query };
  },

  getData(data) {
    let dataJson = data.toJSON();
    data = {
      AnimalID: dataJson.AnimalID,
      TransferEmbryoID: dataJson.TransferEmbryoID,
      PAR: dataJson.PAR,
      TimeNo: dataJson.TimeNo,
      ThaiTransferDate: dataJson.ThaiTransferDate,
      EmbryoNumber:
        dataJson.EmbryoNumber != null ? dataJson.EmbryoNumber : null,
      TransferMethodName:
        dataJson.TransferMethod != null
          ? dataJson.TransferMethod.TransferMethodName == "Direct Transfer"
            ? "ย้ายฝากสด"
            : "ย้ายฝากแช่แข็ง"
          : null,
      BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,

      ResponsibilityStaffName: dataJson.Staff
        ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
        : null,

      ...dataJson,
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
          // delete _q.query.include,
          db.count(_q.query),
        ])
          .then((result) => {
            let rows = result[0],
              count = rows.length;

            rows = rows.map((data) => {
              data = this.getData(data);
              return data;
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
        const obj = await db.findByPk(id, {
          include: { all: true, required: false },
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let data = this.getData(obj);

        resolve(data);
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

        await Animal.update(
          { ProductionStatusID: 4, updatedAt: fn("GETDATE") },
          { where: { AnimalID: inserted.AnimalID } }
        );

        let res = methods.findById(inserted.TransferEmbryoID);

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
        data.TransferEmbryoID = parseInt(id);

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { TransferEmbryoID: id } });

        let res = methods.findById(data.TransferEmbryoID);

        await axios.post(
          "https://biotech.ztidev.com/ex-serviceapi/api/v1/Embryo/trfEmbryo",
          {
            earMother: res.Animal.AnimalIdentificationID,
            embryoId: res.EmbryoNumber,
            transferDate: res.TransferDate,
          }
        );

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
          { isRemove: 1, isActive: 0, updatedAt: fn("GETDATE") },
          { where: { TransferEmbryoID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
