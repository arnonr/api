const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/DonorActivity"),
  { Op } = require("sequelize");

const Animal = require("../models/Animal");
const Donor = require("../models/Donor");
const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");
const Staff = require("../models/Staff");
const Farm = require("../models/Farm");
dayjs.extend(buddhistEra);

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.DonorActivityID)
      $where["DonorActivityID"] = req.query.DonorActivityID;

    if (req.query.DonorID) $where["DonorID"] = req.query.DonorID;
    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;
    if (req.query.ActivityDate) $where["ActivityDate"] = req.query.ActivityDate;
    if (req.query.Day) $where["Day"] = req.query.Day;
    if (req.query.Time) $where["Time"] = req.query.Time;
    if (req.query.PresetActivityID)
      $where["PresetActivityID"] = req.query.PresetActivityID;
    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;
    if (req.query.SemenID) $where["SemenID"] = req.query.SemenID;
    if (req.query.IsExclude) $where["IsExclude"] = req.query.IsExclude;
    if (req.query.ExcludeDate) $where["ExcludeDate"] = req.query.ExcludeDate;
    if (req.query.ExcludeResponsibilityStaffID)
      $where["ExcludeResponsibilityStaffID"] =
        req.query.ExcludeResponsibilityStaffID;
    if (req.query.GoatAIMethodID)
      $where["GoatAIMethodID"] = req.query.GoatAIMethodID;
    if (req.query.BreederAnimalID)
      $where["BreederAnimalID"] = req.query.BreederAnimalID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["DonorID", "ASC"]];
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

            // Rows จะแมพตรงนี้

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

        const res = await db.findByPk(inserted.DonorActivityID);

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
        data.DonorActivityID = parseInt(id);

        await db.update(data, { where: { DonorActivityID: id } });

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
          { where: { DonorActivityID: id } }
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

    if (req.query.DonorActivityID)
      $where["DonorActivityID"] = req.query.DonorActivityID;

    if (req.query.DonorID) $where["DonorID"] = req.query.DonorID;
    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.ActivityDate) $where["ActivityDate"] = req.query.ActivityDate;
    if (req.query.Day) $where["Day"] = req.query.Day;
    if (req.query.Time) $where["Time"] = req.query.Time;
    if (req.query.PresetActivityID)
      $where["PresetActivityID"] = req.query.PresetActivityID;
    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;
    if (req.query.SemenID) $where["SemenID"] = req.query.SemenID;
    if (req.query.IsExclude) $where["IsExclude"] = req.query.IsExclude;
    if (req.query.ExcludeDate) $where["ExcludeDate"] = req.query.ExcludeDate;
    if (req.query.ExcludeResponsibilityStaffID)
      $where["ExcludeResponsibilityStaffID"] =
        req.query.ExcludeResponsibilityStaffID;
    if (req.query.GoatAIMethodID)
      $where["GoatAIMethodID"] = req.query.GoatAIMethodID;
    if (req.query.BreederAnimalID)
      $where["BreederAnimalID"] = req.query.BreederAnimalID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["DonorID", "ASC"]];
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

    let $whereAnimalTypeID = {};
    if (req.query.AnimalTypeID) {
      $whereAnimalTypeID = {
        AnimalTypeID: { [Op.in]: JSON.parse(req.query.AnimalTypeID) },
      };
    }

    query["include"] = [
      {
        model: Animal,
        // as: "Animal",
        where: $whereAnimalTypeID,
        include: [
          {
            model: Farm,
            as: "AnimalFarm",
          },
        ],
      },
    ];
    query["attributes"] = ["DonorID", "AnimalID"];
    query["group"] = ["DonorID", "AnimalID"];

    return { query: query };
  },

  findDonor(req) {
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
                      DonorID: d.DonorID,
                      AnimalID: d.AnimalID,
                    },
                  });

                  // get Donor
                  let FindDonor = await Donor.findByPk(d.DonorID, {
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

                  let PresetActivity6 = da
                    .filter((d) => d.PresetActivityID == 6)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time
                      );
                    });

                  let PresetActivity7 = da
                    .filter((d) => d.PresetActivityID == 7)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time
                      );
                    });

                  let PresetActivity8 = da
                    .filter((d) => d.PresetActivityID == 8)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time
                      );
                    });

                  let PresetActivity9 = da
                    .filter((d) => d.PresetActivityID == 9)
                    .map((d) => {
                      return (
                        dayjs(d.ActivityDate).locale("th").format("DD MMM BB") +
                        " " +
                        d.Time
                      );
                    });

                  let sf = null;
                  if (da[0].ExcludeResponsibilityStaffID) {
                    sf = await Staff.findByPk(1);
                  }

                  console.log(d.Animal);

                  let dn = {
                    AnimalID: d.AnimalID,
                    AnimalEarID: d.Animal.AnimalEarID,
                    AnimalName: d.Animal.AnimalName,
                    FarmName: d.Animal.AnimalFarm.FarmName,
                    
                    DonorID: FindDonor.DonorID,
                    Staff:
                      FindDonor.Staff.StaffGivenName +
                      " " +
                      FindDonor.Staff.StaffSurname,
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
                    PresetActivity6:
                      PresetActivity6 != 0 ? PresetActivity6 : null,
                    PresetActivity7:
                      PresetActivity7 != 0 ? PresetActivity7 : null,
                    PresetActivity8:
                      PresetActivity8 != 0 ? PresetActivity8 : null,
                    PresetActivity9:
                      PresetActivity9 != 0 ? PresetActivity9 : null,
                    IsExclude: da[0].IsExclude,
                    IsExcludeName: da[0].IsExclude ? "คัดออก" : "อยู่ในโปรแกรม",
                    ExcludeRemark: da[0].ExcludeRemark,
                    ExcludeDate: da[0].ExcludeDate,
                    ThaiExcludeDate: da[0].ExcludeDate
                      ? dayjs(da[0].ExcludeDate)
                          .locale("th")
                          .format("DD/MM/BBBB")
                      : null,
                    ExcludeResponsibilityStaffID: sf
                      ? `${sf.StaffNumber} ${sf.StaffGivenName}  ${sf.StaffSurname}`
                      : null,
                  };

                  return dn;
                })
              );

              return data;
            };

            let donor = await getWithPromiseAll();

            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: donor,
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

  excludeDonor(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Update
        data.AnimalID = parseInt(data.AnimalID);
        // data.IsExclude = data.IsExclude;
        // data.ExcludeRemark = data.ExcludeRemark;
        // data.ExcludeDate = data.ExcludeDate;
        // data.ExcludeResponsibilityStaffID = data.ExcludeResponsibilityStaffID;
        // console.log(data)
        let data1 = {
          IsExclude: data.IsExclude,
          ExcludeRemark: data.ExcludeRemark,
          ExcludeDate: data.ExcludeDate,
          ExcludeResponsibilityStaffID: data.ExcludeResponsibilityStaffID,
          UpdatedUserID: data.UpdatedUserID,
        };

        const obj = await db.update(data1, {
          where: { DonorID: id, AnimalID: data.AnimalID },
        });

        // this.findDonor(data)

        resolve({ data: "success" });
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  //
};

module.exports = { ...methods };
