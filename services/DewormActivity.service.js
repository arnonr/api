const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/DewormActivity"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.DewormActivityID)
      $where["DewormActivityID"] = req.query.DewormActivityID;

    if (req.query.DewormActivityDate)
      $where["DewormActivityDate"] = req.query.DewormActivityDate;

    if (req.query.AnimalID) {
      $where["AnimalID"] = {
        [Op.or]: [
          { [Op.like]: "%," + req.query.AnimalID + ",%" },
          { [Op.like]: "[" + req.query.AnimalID + ",%" },
          { [Op.like]: "%," + req.query.AnimalID + "]" },
          { [Op.like]: "[" + req.query.AnimalID + "]" },
        ],
      };
    }

    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

    if (req.query.DewormMedicineID)
      $where["DewormMedicineID"] = req.query.DewormMedicineID;

    if (req.query.DewormNextDate)
      $where["DewormNextDate"] = req.query.DewormNextDate;

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
    $order = [["DewormActivityID", "ASC"]];
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
      DewormActivityID: dataJson.DewormActivityID,
      ThaiDewormActivityDate: dataJson.ThaiDewormActivityDate,

      DewormMedicineName: dataJson.DewormMedicine
        ? dataJson.DewormMedicine.DewormMedicineName
        : null,

      ThaiDewormNextDate: dataJson.ThaiDewormNextDate,
      OrganizationName: dataJson.Organization
        ? dataJson.Organization.OrganizationName
        : null,
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
                return await this.getData(data);
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
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้

        if (!Array.isArray(data.AnimalID)) {
          reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        data.AnimalID = JSON.stringify(data.AnimalID);

        var date = new Date().toISOString();
        data.createdAt = date;

        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.DewormActivityID);

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
        data.DewormActivityID = parseInt(id);

        if (data.AnimalID) {
          if (!Array.isArray(data.AnimalID)) {
            reject(ErrorBadRequest("Animal ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          data.AnimalID = JSON.stringify(data.AnimalID);
        }

         var date = new Date().toISOString();
        data.updatedAt = date;

        await db.update(data, { where: { DewormActivityID: id } });

        let res = methods.findById(data.DewormActivityID);

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
          { where: { DewormActivityID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
