const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/RecipientActivity"),
  { Op } = require("sequelize");

const Animal = require("../models/Animal");
const Recipient = require("../models/Recipient");
const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.RecipientActivityID)
      $where["RecipientActivityID"] = req.query.RecipientActivityID;

    if (req.query.RecipientID) $where["RecipientID"] = req.query.RecipientID;
    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;
    if (req.query.ActivityDate) $where["ActivityDate"] = req.query.ActivityDate;
    if (req.query.Day) $where["Day"] = req.query.Day;
    if (req.query.Time) $where["Time"] = req.query.Time;
    if (req.query.PresetActivityID)
      $where["PresetActivityID"] = req.query.PresetActivityID;
    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.IsDone) $where["IsDone"] = req.query.IsDone;

    if (req.query.IsExclude) $where["IsExclude"] = req.query.IsExclude;
    if (req.query.ExcludeDate) $where["ExcludeDate"] = req.query.ExcludeDate;
    if (req.query.ExcludeResponsibilityStaffID)
      $where["ExcludeResponsibilityStaffID"] =
        req.query.ExcludeResponsibilityStaffID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["RecipientActivityID", "ASC"]];
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

        const res = await db.findByPk(inserted.RecipientActivityID);

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
        data.RecipientActivityID = parseInt(id);

        await db.update(data, { where: { RecipientActivityID: id } });

        const res = await db.findByPk(id);

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
          { where: { RecipientActivityID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  scopeSearch1(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.RecipientActivityID)
      $where["RecipientActivityID"] = req.query.RecipientActivityID;

    if (req.query.RecipientID) $where["RecipientID"] = req.query.RecipientID;
    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;
    if (req.query.ActivityDate) $where["ActivityDate"] = req.query.ActivityDate;
    if (req.query.Day) $where["Day"] = req.query.Day;
    if (req.query.Time) $where["Time"] = req.query.Time;
    if (req.query.PresetActivityID)
      $where["PresetActivityID"] = req.query.PresetActivityID;
    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.IsDone) $where["IsDone"] = req.query.IsDone;

    if (req.query.IsExclude) $where["IsExclude"] = req.query.IsExclude;
    if (req.query.ExcludeDate) $where["ExcludeDate"] = req.query.ExcludeDate;
    if (req.query.ExcludeResponsibilityStaffID)
      $where["ExcludeResponsibilityStaffID"] =
        req.query.ExcludeResponsibilityStaffID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["RecipientID", "ASC"]];
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
      {
        model: Animal,
      },
    ];
    query["attributes"] = ["RecipientID", "AnimalID"];
    query["group"] = ["RecipientID", "AnimalID"];

    return { query: query };
  },

  findRecipient(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch1(req, limit, offset);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([
          db.findAll(_q.query),
          delete _q.query.include,
          db.count(_q.query),
        ])
          .then(async (result) => {
            const rows = result[0],
              count = rows.length;

            const getWithPromiseAll = async () => {
              let data = await Promise.all(
                rows.map(async (d) => {
                  let da = await db.findAll({
                    where: {
                      RecipientID: d.RecipientID,
                      AnimalID: d.AnimalID,
                    },
                  });

                  let FindRecipient = await Recipient.findByPk(d.RecipientID, {
                    include: { all: true, required: false },
                  });

                  let PresetActivity1 = da
                    .filter((d) => d.PresetActivityID == 1)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time
                      );
                    });

                  let PresetActivity2 = da
                    .filter((d) => d.PresetActivityID == 2)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time +
                        " (" +
                        d.Description +
                        ")"
                      );
                    });

                  let PresetActivity3 = da
                    .filter((d) => d.PresetActivityID == 3)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time +
                        " (" +
                        d.Description +
                        ")"
                      );
                    });

                  let PresetActivity4 = da
                    .filter((d) => d.PresetActivityID == 5)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time
                      );
                    });

                  let PresetActivity5 = da
                    .filter((d) => d.PresetActivityID == 4)
                    .map((d) => {
                      return dayjs(d.ActivityDate)
                        .locale("th")
                        .format("DD MMM BB");
                    });

                  let dn = {
                    AnimalID: d.AnimalID,
                    AnimalEarID: d.Animal.AnimalEarID,
                    RecipientID: FindRecipient.RecipientID,
                    Staff:
                      FindRecipient.Staff.StaffGivenName +
                      " " +
                      FindRecipient.Staff.StaffSurname,
                    PresetActivity1:
                      PresetActivity1.length != 0 ? PresetActivity1 : null,
                    PresetActivity2:
                      PresetActivity2 != 0 ? PresetActivity2 : null,
                    PresetActivity3:
                      PresetActivity3 != 0 ? PresetActivity3 : null,
                    PresetActivity4:
                      PresetActivity4 != 0 ? PresetActivity4 : null,
                    PresetActivity5:
                      PresetActivity5 != 0 ? PresetActivity5 : null,
                  };

                  return dn;
                })
              );

              return data;
            };

            let recipient = await getWithPromiseAll();

            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: recipient,
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
};

module.exports = { ...methods };
