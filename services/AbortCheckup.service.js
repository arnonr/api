const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/AbortCheckup"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.AbortCheckupID)
      $where["AbortCheckupID"] = req.query.AbortCheckupID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.AIID) $where["AIID"] = req.query.AIID;
    if (req.query.TransferEmbryoID)
      $where["TransferEmbryoID"] = req.query.TransferEmbryoID;
    if (req.query.NormalBreedingID)
      $where["NormalBreedingID"] = req.query.NormalBreedingID;

    if (req.query.AbortDate) $where["AbortDate"] = req.query.AbortDate;
    if (req.query.AbortResultID)
      $where["AbortResultID"] = req.query.AbortResultID;

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
    $order = [["AbortCheckupID", "ASC"]];
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

  getData(data) {
    let dataJson = data.toJSON();
    if (dataJson.AI) {
      data = {
        AbortCheckupID: dataJson.AbortCheckupID,
        AnimalID: dataJson.AnimalID,
        AIID: dataJson.AI.AIID,
        PAR: dataJson.AI.PAR,
        TimeNo: dataJson.AI.TimeNo,
        ThaiAIDate: dataJson.AI.ThaiAIDate,
        // Type
        Type: "AI",

        ThaiAbortDate: dataJson.ThaiAbortDate,

        AbortResultName: dataJson.AbortResult
          ? dataJson.AbortResult.AbortResultName
          : null,
        AbortDay: dataJson.AbortDay,
        BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
        ResponsibilityStaffName: dataJson.Staff
          ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
          : null,

        ...dataJson,
      };
    } else if (dataJson.TransferEmbryo) {
      data = {
        AbortCheckupID: dataJson.AbortCheckupID,
        AnimalID: dataJson.AnimalID,
        TransferEmbryoID: dataJson.TransferEmbryo.TransferEmbryoID,
        PAR: dataJson.TransferEmbryo.PAR,
        // TimeNo: dataJson.TransferEmbryo.TimeNo,
        ThaiTransferDate: dataJson.TransferEmbryo.ThaiTransferDate,
        Type: "Embryo",
        ThaiAbortDate: dataJson.ThaiAbortDate,

        AbortResultName: dataJson.AbortResult
          ? dataJson.AbortResult.AbortResultName
          : null,
        AbortDay: dataJson.AbortDay,
        BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
        ResponsibilityStaffName: dataJson.Staff
          ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
          : null,

        ...dataJson,
      };
    } else {
      data = {
        AbortCheckupID: dataJson.AbortCheckupID,
        AnimalID: dataJson.AnimalID,
        AIID: null,
        // PAR: dataJson.PAR,
        Type: "NI",
        ThaiAbortDate: dataJson.ThaiAbortDate,
        AbortResultName: dataJson.AbortResult
          ? dataJson.AbortResult.AbortResultName
          : null,
        AbortDay: dataJson.AbortDay,
        BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
        ResponsibilityStaffName: dataJson.Staff
          ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
          : null,

        ...dataJson,
      };
    }

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
          .then((result) => {
            let rows = result[0],
              count = result[2];

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
        const obj = new db(data);
        const inserted = await obj.save();

        await Animal.update(
          { ProductionStatusID: 1 },
          { where: { AnimalID: inserted.AnimalID } }
        );

        let res = methods.findById(inserted.AbortCheckupID);

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
        data.AbortCheckupID = parseInt(id);

        await db.update(data, { where: { AbortCheckupID: id } });

        let res = methods.findById(data.AbortCheckupID);

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
          { where: { AbortCheckupID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
