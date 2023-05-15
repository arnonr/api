const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/GiveBirth"),
  { Op } = require("sequelize");

const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const AnimalBreed = require("../models/AnimalBreed");
const { count, beforeDestroy } = require("../models/GiveBirth");
const AI = require("../models/AI");
const Semen = require("../models/Semen");
const TransferEmbryo = require("../models/TransferEmbryo");
const Embryo = require("../models/Embryo");
const axios = require("axios");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.GiveBirthID) $where["GiveBirthID"] = req.query.GiveBirthID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.AIID) $where["AIID"] = req.query.AIID;
    if (req.query.TransferEmbryoID)
      $where["TransferEmbryoID"] = req.query.TransferEmbryoID;
    if (req.query.NormalBreedingID)
      $where["NormalBreedingID"] = req.query.NormalBreedingID;

    if (req.query.GiveBirthDate)
      $where["GiveBirthDate"] = req.query.GiveBirthDate;

    if (req.query.GiveBirthState)
      $where["GiveBirthState"] = req.query.GiveBirthState;

    if (req.query.GiveBirthHelpID)
      $where["GiveBirthHelpID"] = req.query.GiveBirthHelpID;

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
    $order = [["GiveBirthID", "ASC"]];
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
        include: [
          {
            model: AnimalBreed,
            as: "AnimalBreed1",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed2",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed3",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed4",
          },
          {
            model: AnimalBreed,
            as: "AnimalBreed5",
          },
        ],
      },
      {
        model: AI,
        as: "AI",
        include: [
          {
            model: Semen,
            attributes: ["SemenID", "SemenNumber", "BreederID"],
            as: "Semen",
          },
        ],
      },
      {
        model: TransferEmbryo,
        as: "TransferEmbryo",
        include: [
          {
            model: Embryo,
            attributes: [
              "EmbryoID",
              "EmbryoNumber",
              "MaleBreederID",
              "FemaleBreederID",
            ],
            as: "Embryo",
          },
        ],
      },
    ];

    return { query: query };
  },

  async getData(data) {
    let dataJson = data.toJSON();
    if (dataJson.AI) {
      data = {
        GiveBirthID: dataJson.GiveBirthID,
        AnimalID: dataJson.AnimalID,
        AIID: dataJson.AI.AIID,
        PAR: dataJson.AI.PAR,
        TimeNo: dataJson.AI.TimeNo,
        ThaiAIDate: dataJson.AI.ThaiAIDate,
        ThaiDate: dataJson.AI.ThaiAIDate,
        // Type
        Type: "AI",
        ThaiGiveBirthDate: dataJson.ThaiGiveBirthDate,
        Amount: dataJson.Amount,
        ThaiGiveBirthState: dataJson.ThaiGiveBirthState,
        PregnancyDay: dataJson.PregnancyDay,
        BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
        ResponsibilityStaffName: dataJson.Staff
          ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
          : null,

        ...dataJson,
      };
    } else if (dataJson.TransferEmbryo) {
      data = {
        GiveBirthID: dataJson.GiveBirthID,
        AnimalID: dataJson.AnimalID,
        TransferEmbryoID: dataJson.TransferEmbryo.TransferEmbryoID,
        PAR: dataJson.TransferEmbryo.PAR,
        TimeNo: dataJson.TransferEmbryo.TimeNo,
        ThaiTransferDate: dataJson.TransferEmbryo.ThaiTransferDate,
        ThaiDate: dataJson.TransferEmbryo.ThaiTransferDate,
        Type: "Embryo",
        ThaiGiveBirthDate: dataJson.ThaiGiveBirthDate,
        Amount: dataJson.Amount,
        ThaiGiveBirthState: dataJson.ThaiGiveBirthState,
        PregnancyDay: dataJson.PregnancyDay,
        BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
        ResponsibilityStaffName: dataJson.Staff
          ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
          : null,

        ...dataJson,
      };
    } else {
      data = {
        GiveBirthID: dataJson.GiveBirthID,
        AnimalID: dataJson.AnimalID,
        AIID: null,
        // PAR: dataJson.PAR,
        Type: "NI",
        ThaiGiveBirthDate: dataJson.ThaiGiveBirthDate,
        Amount: dataJson.Amount,
        ThaiGiveBirthState: dataJson.ThaiGiveBirthState,
        PregnancyDay: dataJson.PregnancyDay,
        BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
        ResponsibilityStaffName: dataJson.Staff
          ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
          : null,

        ...dataJson,
      };
    }

    let ChildAnimal = await Animal.findAll({
      where: {
        GiveBirthSelfID: dataJson.GiveBirthID,
      },
    });

    data.ChildAnimal = ChildAnimal;
    data.CountChildAnimal = ChildAnimal.length;
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
        reject(ErrorNotFound(error));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้
        const obj = new db(data);
        const inserted = await obj.save();

        // 5 10 15

        let animalStatusID = "";
        let animal = await Animal.findByPk(inserted.AnimalI);
        if (animal.AnimalTypeID == 1) {
          animalStatusID = 5;
        }

        if ((animal.AnimalTypeID == 3) || (animal.AnimalTypeID == 42)) {
          animalStatusID = 10;
        }

        if (animal.AnimalTypeID == 17) {
          animalStatusID = 15;
        }

        await Animal.update(
          {
            ProductionStatusID: 2,
            AnimalPar: inserted.PAR + 1,
            AnimalStatusID: animalStatusID,
          },
          { where: { AnimalID: inserted.AnimalID } }
        );

        let res = methods.findById(inserted.GiveBirthID);

        if (inserted.TransferEmbryoID != null) {
          // EmbryoID
          let Temb = await TransferEmbryo.findByPk(inserted.TransferEmbryoID, {
            include: { all: true, required: false },
          });

          await axios.post(
            "https://biotech.ztidev.com/ex-serviceapi/api/v1/Embryo/updateStatusEmbryo",
            {
              birthDate: res.AbortDate,
              embBirthStatusId: 3,
              // embTransStatusId: 1,
              embryoId: Temb.Embryo.EmbryoNumber,
            }
          );
        }

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
        data.GiveBirthID = parseInt(id);

        await db.update(data, { where: { GiveBirthID: id } });

        let res = methods.findById(data.GiveBirthID);

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
          { where: { GiveBirthID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
