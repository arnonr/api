const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/AI"),
  { Op, fn } = require("sequelize");
const AI = require("../models/AI");

const Animal = require("../models/Animal");
const PregnancyCheckStatus = require("../models/PregnancyCheckStatus");
const PregnancyCheckup = require("../models/PregnancyCheckup");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.AIID) $where["AIID"] = req.query.AIID;

    if (req.query.AnimalID)
      $where["AnimalID"] = {
        [Op.like]: "%" + req.query.AnimalID + "%",
      };

    if (req.query.TimeNo) $where["TimeNo"] = req.query.TimeNo;

    if (req.query.AIDate) $where["AIDate"] = req.query.AIDate;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.ProjectID) $where["ProjectID"] = req.query.ProjectID;
    if (req.query.SemenID) $where["SemenID"] = req.query.SemenID;
    if (req.query.AIStatus) $where["AIStatus"] = req.query.AIStatus;

    if (req.query.BirthDate) $where["BirthDate"] = req.query.BirthDate;

    if (req.query.GoatAIMethodID)
      $where["GoatAIMethodID"] = req.query.GoatAIMethodID;
    if (req.query.GoatEstralActivityID)
      $where["GoatEstralActivityID"] = req.query.GoatEstralActivityID;

    if (req.query.BreederAnimalID)
      $where["BreederAnimalID"] = req.query.BreederAnimalID;

    if (req.query.PAR) $where["PAR"] = req.query.PAR;

    // BirthDate

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["AIID", "ASC"]];
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
        model: PregnancyCheckup,
        limit: 1,
        include: { model: PregnancyCheckStatus },
        order: [
          ["CheckupDate", "DESC"],
          ["PregnancyCheckupID", "DESC"],
        ],
      },
    ];

    return { query: query, required: false };
  },

  getData(data) {
    let dataJson = data.toJSON();
    data = {
      AnimalID: dataJson.AnimalID,
      AIID: dataJson.AIID,
      PAR: dataJson.PAR,
      TimeNo: dataJson.TimeNo,
      ThaiAIDate: dataJson.ThaiAIDate,
      BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
      SemenNumber: dataJson.Semen != null ? dataJson.Semen.SemenNumber : null,
      Dose: dataJson.Dose,
      AIStatusName: dataJson.AIStatusName,
      PregnancyCheckup: dataJson.PregnancyCheckups
        ? dataJson.PregnancyCheckups[0]
          ? dataJson.PregnancyCheckups[0].toJSON().PregnancyCheckStatus
              .PregnancyCheckStatusName
          : null
        : null,
      ThaiGiveBirthDate: dataJson.GiveBirth
        ? dataJson.GiveBirth.ThaiGiveBirthDate
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
          include: [
            { all: true, required: false },
            {
              model: PregnancyCheckup,
              limit: 1,
              include: { model: PregnancyCheckStatus },
              order: [
                ["CheckupDate", "DESC"],
                ["PregnancyCheckupID", "DESC"],
              ],
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
        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        await Animal.update(
          { ProductionStatusID: 4, updatedAt: fn("GETDATE") },
          { where: { AnimalID: inserted.AnimalID } }
        );

        let res = methods.findById(inserted.AIID);

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
        data.AIID = parseInt(id);

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { AIID: id } });

        let res = methods.findById(data.AIID);

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  delete(id, UpdatedUserID) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await db.findByPk(id);
        if (!obj) reject(ErrorNotFound("id: not found"));

        if (obj) {
          const preg = await PregnancyCheckup.findOne({
            where: { AIID: obj.AIID, isRemove: 0 },
          });
          if (preg) {
            console.log(preg);
            reject(
              ErrorNotFound(
                "ไม่สามารถลบการผสมเทียมได้ เนื่องจากมีกิจกรรมภายใต้การผสมเทียม"
              )
            );
            return;
          }
        }

        await db.update(
          {
            isRemove: 1,
            isActive: 0,
            updatedAt: fn("GETDATE"),
            UpdatedUserID: UpdatedUserID,
          },
          {
            where: {
              AnimalID: obj.AnimalID,
              PAR: obj.PAR,
              TimeNo: obj.TimeNo,
            },
          }
        );

        // Set AnimalPar และสถานะสัตว์

        resolve();
      } catch (error) {
        console.log("FREEDOM1");
        reject(error);
      }
    });
  },

  scopeSearchWithAnimal(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.AIID) $where["AIID"] = req.query.AIID;

    if (req.query.AnimalID)
      $where["AnimalID"] = {
        [Op.like]: "%" + req.query.AnimalID + "%",
      };

    if (req.query.TimeNo) $where["TimeNo"] = req.query.TimeNo;

    if (req.query.AIDate) $where["AIDate"] = req.query.AIDate;

    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.ProjectID) $where["ProjectID"] = req.query.ProjectID;
    if (req.query.SemenID) $where["SemenID"] = req.query.SemenID;
    if (req.query.AIStatus) $where["AIStatus"] = req.query.AIStatus;

    if (req.query.BirthDate) $where["BirthDate"] = req.query.BirthDate;

    if (req.query.GoatAIMethodID)
      $where["GoatAIMethodID"] = req.query.GoatAIMethodID;
    if (req.query.GoatEstralActivityID)
      $where["GoatEstralActivityID"] = req.query.GoatEstralActivityID;

    if (req.query.BreederAnimalID)
      $where["BreederAnimalID"] = req.query.BreederAnimalID;

    if (req.query.PAR) $where["PAR"] = req.query.PAR;

    // BirthDate

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["AIID", "ASC"]];
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
        model: PregnancyCheckup,
        limit: 1,
        include: { model: PregnancyCheckStatus },
        order: [
          ["CheckupDate", "DESC"],
          ["PregnancyCheckupID", "DESC"],
        ],
      },
    ];

    return { query: query, required: false };
  },

  findWithAnimal(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearchWithAnimal(req, limit, offset);
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
};

module.exports = { ...methods };
