const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Embryo"),
  Organization = require("../models/Organization"),
  Embryo = require("../models/Embryo"),
  AnimalBreed = require("../models/AnimalBreed"),
  { Op } = require("sequelize");
const axios = require("axios");
const { forEach } = require("lodash");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.EmbryoID) $where["EmbryoID"] = req.query.EmbryoID;

    if (req.query.EmbryoNumber)
      $where["EmbryoNumber"] = {
        [Op.like]: "%" + req.query.EmbryoNumber + "%",
      };

    if (req.query.SemenID)
      $where["SemenID"] = {
        [Op.like]: "%" + req.query.SemenID + "%",
      };

    if (req.query.MaleBreederID)
      $where["MaleBreederID"] = {
        [Op.like]: "%" + req.query.MaleBreederID + "%",
      };

    if (req.query.FemaleBreederID)
      $where["FemaleBreederID"] = {
        [Op.like]: "%" + req.query.FemaleBreederID + "%",
      };

    if (req.query.AnimalTypeID) $where["AnimalTypeID"] = req.query.AnimalTypeID;

    if (req.query.SourceTypeID) $where["SourceTypeID"] = req.query.SourceTypeID;
    if (req.query.CountryID) $where["CountryID"] = req.query.CountryID;
    if (req.query.SourceOrganizationID)
      $where["SourceOrganizationID"] = req.query.SourceOrganizationID;

    if (req.query.ProduceDate) $where["ProduceDate"] = req.query.ProduceDate;

    if (req.query.ProduceType) $where["ProduceType"] = req.query.ProduceType;
    if (req.query.EmbryoStageID)
      $where["EmbryoStageID"] = req.query.EmbryoStageID;
    if (req.query.EmbryoSex) $where["EmbryoSex"] = req.query.EmbryoSex;

    if (req.query.StrawColor)
      $where["StrawColor"] = {
        [Op.like]: "%" + req.query.StrawColor + "%",
      };
    if (req.query.PlugColor)
      $where["PlugColor"] = {
        [Op.like]: "%" + req.query.PlugColor + "%",
      };
    if (req.query.Trypsinization)
      $where["Trypsinization"] = {
        [Op.like]: "%" + req.query.Trypsinization + "%",
      };
    if (req.query.ZonaIntact)
      $where["ZonaIntact"] = {
        [Op.like]: "%" + req.query.ZonaIntact + "%",
      };
    if (req.query.EmbryoManipulated)
      $where["EmbryoManipulated"] = {
        [Op.like]: "%" + req.query.EmbryoManipulated + "%",
      };
    if (req.query.EmbryoStatus)
      $where["EmbryoStatus"] = {
        [Op.like]: "%" + req.query.EmbryoStatus + "%",
      };

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
    $order = [["EmbryoID", "ASC"]];
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

        let res = methods.findById(inserted.EmbryoID);

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
        data.EmbryoID = parseInt(id);

        await db.update(data, { where: { EmbryoID: id } });

        let res = methods.findById(data.EmbryoID);

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
          { where: { EmbryoID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  fetchApi(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // axios
        await axios
          .get(
            "https://biotech.ztidev.com/ex-serviceapi/api/v1/Embryo/getEmbryoDetail",
            {
              params: {
                aniGenreCode: 1,
                aniType1: "01",
                aniType2: 2,
              },
            }
          )
          .then(async (response) => {
            let { data } = response.data;
            for (i = 0; i < data.length; i++) {
              // console.log(data[i].embryoId);
              let addEmbryo = await Embryo.findOne({
                where: { EmbryoNumber: data[i].embryoId },
              });
              if (!addEmbryo) {
                addEmbryo = new Embryo();
              }

              addEmbryo.EmbryoNumber = data[i].embryoId;

              //
                addEmbryo.MaleBreederID = data[i].fatEmbDetailDto.fatAniNo;
                addEmbryo.FemaleBreederID = data[i].motEmbDetailDto.motAniNo;
              // 

              addEmbryo.AnimalTypeID = 2;

              let sortValue = data[i].embLotBrdDtoList.reverse((a, b) => {
                console.log(typeof a.percBreed);
                return a.percBreed - b.percBreed;
              });

              for (j = 0; j < sortValue.length; j++) {
                let BreedID = await AnimalBreed.findOne({
                  where: { AnimalBreedShortName: sortValue[j].brdCode },
                });

                if (!BreedID) {
                  BreedID = new AnimalBreed();
                  BreedID.AnimalBreedCode = sortValue[j].brdAnild;
                  BreedID.AnimalBreedShortName = sortValue[j].brdCode;
                  BreedID.AnimalBreedName = sortValue[j].brdAniNameTh;
                  BreedID.AnimalBreedNameEN = sortValue[j].brdAniNameEn;
                  BreedID.AnimalTypeID = 1;
                  BreedID.isActive = 1;
                  BreedID.isRemove = 0;
                  BreedID.CreatedUserID = 1;
                  BreedID.CreatedAt = Date.now();
                  await BreedID.save();
                }

                // sort array
                let k = j + 1;
                let text1 = "AnimalBreedID" + k;
                let text2 = "AnimalBreedPercent" + k;
                addEmbryo[text1] = BreedID.AnimalBreedID;
                addEmbryo[text2] = sortValue[j].percBreed;
              }

              let dep = await Organization.findOne({
                where: { OrganizationCode: data[i].deptCode },
              });
              if (dep) {
                addEmbryo.SourceOrganizationID = dep.OrganizationID;
              }

              addEmbryo.SourceTypeID = data[i].embOriginId;
              addEmbryo.ProduceType = data[i].creationSh;
              addEmbryo.ProduceDate = data[i].collectedDate;
              addEmbryo.isActive = 1;
              addEmbryo.EmbryoSex = data[i].aniSexCode == "01" ? 1 : 2;
              addEmbryo.StrawColor = data[i].strawColorName;
              addEmbryo.PlugColor = data[i].plugColorName;
              addEmbryo.Trypsinization = data[i].embTrypsSh;
              addEmbryo.ZonaIntact = data[i].embZonaSh;
              addEmbryo.EmbryoManipulated = data[i].embManipulateSh;
              addEmbryo.EmbryoStatus = data[i].embStatusName;

              addEmbryo.CreatedUserID = 1;
              addEmbryo.createdAt = Date.now();
              // addEmbryo.Amount = data[i].;
              // addEmbryo.EmbryoStageID = data[i].;
              addEmbryo.save();
            }
            resolve(response.data);
          })
          .catch((err) => console.log(err));
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
