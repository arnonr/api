const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Yearling"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const GiveBirth = require("../models/GiveBirth");
const AnimalSex = require("../models/AnimalSex");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.YearlingID) $where["YearlingID"] = req.query.YearlingID;

    if (req.query.MotherAnimalID)
      $where["MotherAnimalID"] = req.query.MotherAnimalID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.FollowDate) $where["FollowDate"] = req.query.FollowDate;

    if (req.query.Weight) $where["Weight"] = req.query.Weight;

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
    $order = [["YearlingID", "ASC"]];
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
        model: Animal,
        as: "ChildAnimal",
        include: [
          { model: AnimalSex, as: "AnimalSex" },
          { model: Animal, as: "AnimalFather" },
          { model: Animal, as: "AnimalMother" },
        ],
      },
    ];

    return { query: query };
  },

  getData(data) {
    let dataJson = data.toJSON();

    // ;วันที่คลอด
    // ท้องที่ givebirth
    // ชื่อลูก animal
    // เพศ
    // หมาเลขพ่อ

    data = {
      YearlingID: dataJson.YearlingID,
      AnimalID: dataJson.AnimalID,
      MotherAnimalID: dataJson.MotherAnimalID,

      MotherAnimalEarID: dataJson.ChildAnimal.AnimalMotherID
        ? dataJson.ChildAnimal.AnimalMother.AnimalEarID
        : null,
      FatherAnimalEarID: dataJson.ChildAnimal.AnimalFatherID
        ? dataJson.ChildAnimal.AnimalFather.AnimalEarID
        : null,
      AnimalEarID: dataJson.ChildAnimal.AnimalEarID,

      ThaiGiveBirthDate: dataJson.ThaiGiveBirthDate,
      PAR: dataJson.ChildAnimal.GiveBirth
        ? dataJson.ChildAnimal.GiveBirth.PAR
        : null,
      AnimalName: dataJson.ChildAnimal.AnimalName,
      AnimalSexName: dataJson.ChildAnimal.AnimalSex
        ? dataJson.ChildAnimal.AnimalSex.AnimalSexName
        : null,

      Weight: dataJson.Weight,
      ThaiFollowDate: dataJson.ThaiFollowDate,
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
                data = await this.getData(data);

                if (data.ChildAnimal.GiveBirthSelfID) {
                  let giveBirth = await GiveBirth.findByPk(
                    data.ChildAnimal.GiveBirthSelfID
                  );
        
                  data.ThaiGiveBirthDate = giveBirth.ThaiGiveBirthDate;
                  data.PAR = giveBirth.PAR;
                }

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
          include: [
            { all: true, required: false },
            {
              model: Animal,
              as: "ChildAnimal",
              include: [
                { model: AnimalSex, as: "AnimalSex" },
                { model: Animal, as: "AnimalFather" },
                { model: Animal, as: "AnimalMother" },
              ],
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let data = this.getData(obj);

        if (data.ChildAnimal.GiveBirthSelfID) {
          let giveBirth = await GiveBirth.findByPk(
            data.ChildAnimal.GiveBirthSelfID
          );

          data.ThaiGiveBirthDate = giveBirth.ThaiGiveBirthDate;
          data.PAR = giveBirth.PAR;
        }

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
        var date = new Date().toISOString();
        data.createdAt = date;

        const obj = new db(data);
        const inserted = await obj.save();

        let res = methods.findById(inserted.YearlingID);

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
        data.YearlingID = parseInt(id);

         var date = new Date().toISOString();
        data.updatedAt = date;

        await db.update(data, { where: { YearlingID: id } });

        // Update AnimalBornWeight
        await Animal.update({AnimalBornWeight: data.Weight}, { where: { AnimalID: obj.AnimalID } });

        let res = methods.findById(data.YearlingID);

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
          { where: { YearlingID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
