const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/CureActivity"),
  { Op } = require("sequelize");
const CAToVC = require("../models/CAToVC");
const CureActivity = require("../models/CureActivity");
const Vaccine = require("../models/Vaccine");
const Animal = require("../models/Animal");
const AnimalStatus = require("../models/AnimalStatus");
const AnimalSex = require("../models/AnimalSex");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.CureActivityID)
      $where["CureActivityID"] = req.query.CureActivityID;
    if (req.query.CureActivityDate)
      $where["CureActivityDate"] = req.query.CureActivityDate;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.DiseaseID) $where["DiseaseID"] = req.query.DiseaseID;

    if (req.query.CureMethodID) $where["CureMethodID"] = req.query.CureMethodID;

    if (req.query.CureNextDateOption)
      $where["CureNextDateOption"] = req.query.CureNextDateOption;

    if (req.query.CureNextDate) $where["CureNextDate"] = req.query.CureNextDate;

    if (req.query.OrganizationId)
      $where["OrganizationId"] = req.query.OrganizationId;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};
    whereFarmID = {}
    if (req.query.FarmID) { 
      whereFarmID = {FarmID: req.query.FarmID}
      // $whereFarmID = req.query.FarmID;
      // $where["$Animal.FarmID$"] = JSON.parse(req.query.FarmID);
    }

    // Order
    $order = [["CureActivityID", "ASC"]];
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
      {
        model: Vaccine,
        as: "Vaccines",
        through: { attributes: ["Amount"] },
      },
      {
        model: Animal,
        as: "Animal",
        where: whereFarmID,
      },
    ];

    return { query: query };
  },

  getData(data) {
    let dataJson = data.toJSON();

    let vaccineArray = [];
    dataJson.Vaccines.forEach((element) => {
      vaccineArray.push([
        element.VaccineID,
        element.VaccineName,
        element.CAToVC.Amount,
      ]);
    });

    data = {
      Vaccine: vaccineArray,
      DiseaseName: dataJson.Disease ? dataJson.Disease.DiseaseName : null,
      CureMethodName: dataJson.CureMethod
        ? dataJson.CureMethod.CureMethodName
        : null,
      Remark: dataJson.Remark,
      ...dataJson,
      VaccineID: JSON.parse(dataJson.VaccineID),
      OrganizationName: dataJson.Organization
        ? dataJson.Organization.OrganizationName
        : null,
      ResponsibilityStaffName: dataJson.Staff
        ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
        : null,
    };
    return data;
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch(req, limit, offset);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([db.findAll(_q.query), db.count(_q.query)])
          .then((result) => {
            let rows = result[0],
              count = result[1];

            rows = rows.map((data) => {
              data = this.getData(data);
              return data;
            });
            //
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
          include: [
            { all: true, required: false },
            {
              model: Vaccine,
              as: "Vaccines",
              through: { attributes: ["Amount"] },
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let data = this.getData(obj);

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
        let VaccineIDList = [];
        if (data.VaccineID) {
          if (!Array.isArray(data.VaccineID)) {
            reject(ErrorBadRequest("Vaccine ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }

          VaccineIDList = [...data.VaccineID];
          data.VaccineID = JSON.stringify(data.VaccineID);
        }

        var date = new Date().toISOString();
        data.createdAt = date;

        const obj = new db(data);
        // console.log(obj.CureNextDate);
        // obj.CureNextDate = dayjs(obj.CureNextDate).format("YYYY-MM-DD")
        const inserted = await obj.save();

        const res = await db.findByPk(inserted.CureActivityID);

  
   

        for (let index = 0; index < VaccineIDList.length; index++) {
          let vc = await Vaccine.findByPk(VaccineIDList[index][0]);
          await res.addVaccine(vc, {
            through: { Amount: VaccineIDList[index][1] },
          });
        }

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error));
      }
    });
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check ID
        const obj = await db.findByPk(id);
        if (!obj) reject(ErrorNotFound("id: not found"));

        let VaccineIDList = [];
        if (data.VaccineID) {
          if (!Array.isArray(data.VaccineID)) {
            reject(ErrorBadRequest("Vaccine ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          VaccineIDList = [...data.VaccineID];
          data.VaccineID = JSON.stringify(data.VaccineID);
        }

        // Update
        data.CureActivityID = parseInt(id);

         var date = new Date().toISOString();
        data.updatedAt = date;

        await db.update(data, { where: { CureActivityID: id } });

        const res = await db.findByPk(id);

        if (data.VaccineID === null) {
          let vc = await Vaccine.findAll();
          await res.removeVaccine(vc);
        }
        if (data.VaccineID) {
          let vc = await Vaccine.findAll();

          await res.removeVaccine(vc);

          for (let index = 0; index < VaccineIDList.length; index++) {
            let vc = await Vaccine.findByPk(VaccineIDList[index][0]);
            await res.addVaccine(vc, {
              through: { Amount: VaccineIDList[index][1] },
            });
          }
        }

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
          { where: { CureActivityID: id } }
        );

        const obj1 = CAToVC.destroy({
          where: { CureActivityID: id },
          // truncate: true,
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
