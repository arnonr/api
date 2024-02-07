const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/VaccineActivity"),
  { Op, fn } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.VaccineActivityID)
      $where["VaccineActivityID"] = req.query.VaccineActivityID;

    if (req.query.VaccineActivityDate)
      $where["VaccineActivityDate"] = req.query.VaccineActivityDate;

    // if (req.query.AnimalID) {
    //   $where["AnimalID"] = {
    //     [Op.or]: [
    //       { [Op.like]: "%," + req.query.AnimalID + ",%" },
    //       { [Op.like]: "[" + req.query.AnimalID + ",%" },
    //       { [Op.like]: "%," + req.query.AnimalID + "]" },
    //       { [Op.like]: "[" + req.query.AnimalID + "]" },
    //     ],
    //   };
    // }

    if (req.query.AnimalID) {
      //   let con1 = "%," + req.query.AnimalID + ",%";
      // [10909,10910]
      $where["AnimalID"] = {
        [Op.or]: [
          { [Op.like]: "%," + req.query.AnimalID + ",%" },
          { [Op.like]: "[[]" + req.query.AnimalID + ",%" },
          { [Op.like]: "%," + req.query.AnimalID + "]" },
          { [Op.like]: "[[]" + req.query.AnimalID + "[]]" },
          //   { [Op.like]: "%,10909]" },
          //   { [Op.like]: "[10909]" },
        ],
      };
    }

    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

    if (req.query.VaccineID) $where["VaccineID"] = req.query.VaccineID;

    if (req.query.VaccineObjectiveID)
      $where["VaccineObjectiveID"] = req.query.VaccineObjectiveID;

    if (req.query.VaccineNextDate)
      $where["VaccineNextDate"] = req.query.VaccineNextDate;

    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;

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
    $order = [["VaccineActivityID", "ASC"]];
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

  async getData(data) {
    let dataJson = data.toJSON();
    dataJson.AnimalID = JSON.parse(dataJson.AnimalID);
    let animal = await Animal.findAll({
      where: { AnimalID: dataJson.AnimalID },
    });
    dataJson.Animal = animal;

    data = {
      VaccineActivityID: dataJson.VaccineActivityID,
      ThaiVaccineActivityDate: dataJson.ThaiVaccineActivityDate,
      VaccineName: dataJson.Vaccine ? dataJson.Vaccine.VaccineName : null,
      Lot: dataJson.Lot,
      VaccineObjectiveName: dataJson.VaccineObjective
        ? dataJson.VaccineObjective.VaccineObjectiveName
        : null,
      ThaiVaccineNextDate: dataJson.ThaiVaccineNextDate,
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
          delete _q.query.include,
          db.count(_q.query),
        ])
          .then(async (result) => {
            let rows = result[0],
              count = result[2];

            rows = await Promise.all(
              rows.map(async (data) => {
                data = this.getData(data);
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
          include: { all: true, required: false },
        });

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
        if (!Array.isArray(data.AnimalID)) {
          reject(ErrorBadRequest("Animal ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        data.AnimalID = JSON.stringify(data.AnimalID);
        // data.AnimalID = "[1]";

        data.createdAt = fn("GETDATE");

        // let data1 = {
        //   VaccineActivityDate: data.VaccineActivityDate,
        //   FarmID: data.FarmID,
        //   FarmIdentificationNumber: data.FarmIdentificationNumber,
        //   Lot: data.Lot,
        //   OrganizationID: data.OrganizationID,
        //   ResponsibilityStaffID: data.ResponsibilityStaffID,
        //   VaccineActivityDate: data.VaccineActivityDate,
        //   VaccineID: data.VaccineID,
        //   VaccineNextDate: data.VaccineNextDate,
        //   VaccineNextMonth: data.VaccineNextMonth,
        //   VaccineObjectiveID: data.VaccineObjectiveID,
        //   AnimalID: JSON.stringify(data.AnimalID),
        //   Remark: data.Remark,
        //   createdAt: fn("GETDATE")
        // };

        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.VaccineActivityID);

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
        data.VaccineActivityID = parseInt(id);

        if (data.AnimalID) {
          if (!Array.isArray(data.AnimalID)) {
            reject(ErrorBadRequest("Animal ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          data.AnimalID = JSON.stringify(data.AnimalID);
        }

        let data1 = {
          VaccineActivityDate: data.VaccineActivityDate,
          FarmID: data.FarmID,
          FarmIdentificationNumber: data.FarmIdentificationNumber,
          Lot: data.Lot,
          OrganizationID: data.OrganizationID,
          ResponsibilityStaffID: data.ResponsibilityStaffID,
          VaccineActivityDate: data.VaccineActivityDate,
          VaccineID: data.VaccineID,
          VaccineNextDate: data.VaccineNextDate,
          VaccineNextMonth: data.VaccineNextMonth,
          VaccineObjectiveID: data.VaccineObjectiveID,
          AnimalID: data.AnimalID,
          Remark: data.Remark,
          updatedAt: fn("GETDATE"),
        };

        await db.update(data1, { where: { VaccineActivityID: id } });

        let res = methods.findById(data.VaccineActivityID);

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
          { where: { VaccineActivityID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
