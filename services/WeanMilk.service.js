const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/WeanMilk"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.WeanMilkID) $where["WeanMilkID"] = req.query.WeanMilkID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.WeanMilkDate) $where["WeanMilkDate"] = req.query.WeanMilkDate;
    if (req.query.PAR) $where["PAR"] = req.query.PAR;

    if (req.query.BCSID) $where["BCSID"] = req.query.BCSID;

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
    $order = [["WeanMilkID", "ASC"]];
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
      //   {
      //     model: Staff,
      //     attributes: ['StaffGivenName', 'StaffSurname']
      //   },
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
            let rows = result[0],
              count = result[2];

            rows = rows.map((data) => {
              let dataJson = data.toJSON();
              if (dataJson.AI) {
                data = {
                  WeanMilkID: dataJson.WeanMilkID,
                  AnimalID: dataJson.AnimalID,
                  AIID: dataJson.AI.AIID,
                  PAR: dataJson.AI.PAR,
                  TimeNo: dataJson.AI.TimeNo,
                  ThaiAIDate: dataJson.AI.ThaiAIDate,
                  // Type
                  Type: "AI",

                  ThaiWeanMilkDate: dataJson.ThaiWeanMilkDate,

                  BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
                  ResponsibilityStaffName: dataJson.Staff
                    ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                    : null,

                  ...dataJson,
                };
              } else if (dataJson.TransferEmbryo) {
                data = {
                  WeanMilkID: dataJson.WeanMilkID,
                  AnimalID: dataJson.AnimalID,
                  TransferEmbryoID: dataJson.TransferEmbryo.TransferEmbryoID,
                  PAR: dataJson.TransferEmbryo.PAR,
                  TimeNo: dataJson.TransferEmbryo.TimeNo,
                  ThaiTransferDate: dataJson.TransferEmbryo.ThaiTransferDate,
                  Type: "Embryo",
                  ThaiWeanMilkDate: dataJson.ThaiWeanMilkDate,

                  BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
                  ResponsibilityStaffName: dataJson.Staff
                    ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                    : null,

                  ...dataJson,
                };
              } else {
                data = {
                  WeanMilkID: dataJson.WeanMilkID,
                  AnimalID: dataJson.AnimalID,
                  AIID: null,
                  // PAR: dataJson.PAR,
                  Type: "NI",
                  ThaiWeanMilkDate: dataJson.ThaiWeanMilkDate,
                  BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
                  ResponsibilityStaffName: dataJson.Staff
                    ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                    : null,

                  ...dataJson,
                };
              }

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

        let res = methods.findById(inserted.WeanMilkID);

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
        data.WeanMilkID = parseInt(id);

        await db.update(data, { where: { WeanMilkID: id } });

        let res = methods.findById(data.WeanMilkID);

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
          { where: { WeanMilkID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
