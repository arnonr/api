const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Animal"),
  { Op } = require("sequelize");

const AnimalToProject = require("../models/AnimalToProject");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.AnimalIdentificationID)
      $where["AnimalIdentificationID"] = {
        [Op.like]: "%" + req.query.AnimalIdentificationID + "%",
      };

    if (req.query.AnimalNationalID)
      $where["AnimalNationalID"] = {
        [Op.like]: "%" + req.query.AnimalNationalID + "%",
      };

    if (req.query.AnimalEarID)
      $where["AnimalEarID"] = {
        [Op.like]: "%" + req.query.AnimalEarID + "%",
      };

    if (req.query.AnimalMicrochip)
      $where["AnimalMicrochip"] = {
        [Op.like]: "%" + req.query.AnimalMicrochip + "%",
      };

    if (req.query.AnimalSexID) $where["AnimalSexID"] = req.query.AnimalSexID;

    if (req.query.AnimalName)
      $where["AnimalName"] = {
        [Op.like]: "%" + req.query.AnimalName + "%",
      };

    if (req.query.FarmID) $where["AnimalSexID"] = req.query.FarmID;
    if (req.query.AnimalFirstBreed) $where["AnimalFirstBreed"] = req.query.AnimalFirstBreed;
    if (req.query.AnimalFatherID) $where["AnimalFatherID"] = req.query.AnimalFatherID;
    if (req.query.AnimalMotherID) $where["AnimalMotherID"] = req.query.AnimalMotherID;

    if (req.query.AnimalBornType) $where["AnimalBornType"] = req.query.AnimalBornType;
    if (req.query.AnimalBornTypeID) $where["AnimalBornTypeID"] = req.query.AnimalBornTypeID;
    if (req.query.AnimalSource) $where["AnimalBornTypeID"] = req.query.	AnimalSource;
    if (req.query.SourceFarmID) $where["SourceFarmID"] = req.query.SourceFarmID;
    if (req.query.OrganizationID) $where["OrganizationID"] = req.query.OrganizationID;
    if (req.query.OrganizationZoneID) $where["OrganizationZoneID"] = req.query.OrganizationZoneID;
    
    // Breed
    
    // ProjectID
    let WhereProject = null;
    if (req.query.ProjectID) {
      var ProjectIDList = req.query.ProjectID.split(",");
      WhereProject = {
        ProjectID: {
          [Op.in]: ProjectIDList,
        },
      };
    }

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["AnimalID", "ASC"]];
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
      { all: true },
      {
        model: AnimalToProject,
        as: "AnimalToProject",
        where: WhereProject,
      },
    ];

    return { query: query };
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch(req, limit, offset);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([db.findAll(_q.query), db.count(_q.query)])
          .then((result) => {
            const rows = result[0],
              count = result[1];
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
          include: { all: true },
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

        // insert AnimalToAnimalType
        let ProjectIDList = data.ProjectID.split(",");
        ProjectIDList.forEach((ProjectID) => {
          const obj1 = AnimalToProject.create({
            AnimalID: inserted.AnimalID,
            ProjectID: ProjectID,
            CreatedUserID: data.CreatedUserID,
          });
        });

        const res = await db.findByPk(inserted.AnimalID, {
          include: { all: true },
        });

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

        //check เงื่อนไขตรงนี้ได้

        // Update
        data.AnimalID = parseInt(id);
        data.UpdatedUserID = 1;

        await db.update(data, { where: { AnimalID: id } });

        const res = await db.findByPk(id, {
          include: { all: true },
        });

        // insert AnimalToProject
        let ProjectIDList = res.ProjectID.split(",");

        const searchATP = await AnimalToProject.findAll({
          where: { AnimalID: res.AnimalID },
        });

        // loop ATP ของทั้งหมดที่มาจาก DB
        searchATP.forEach((atp) => {
          // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
          if (!ProjectIDList.includes(atp.ProjectID)) {
            AnimalToProject.destroy({
              where: {
                AnimalToProjectID: atp.AnimalToProjectID,
              },
            });
          }
        });

        ProjectIDList.forEach(async (ProjectID) => {
          const searchATPOne = await AnimalToProject.findOne({
            where: {
              AnimalID: res.AnimalID,
              ProjectID: ProjectID,
            },
          });

          if (!searchATPOne) {
            const obj1 = AnimalToProject.create({
              AnimalID: res.AnimalID,
              ProjectID: ProjectID,
              CreatedUserID: data.UpdatedUserID,
            });
          }
        });
        //
        // await User.update(data, { where: { id: id }, individualHooks: true });
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
          { where: { AnimalID: id } }
        );

        // delete ProjectToAnimalType
        const obj1 = AnimalToProject.update(
          { isRemove: 1, isActive: 0 },
          { where: { AnimalID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
