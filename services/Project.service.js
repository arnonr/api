const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Project"),
  { Op } = require("sequelize");

const ProjectToAnimalType = require("../models/ProjectToAnimalType");

const AnimalType = require("../models/AnimalType");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.ProjectID) $where["ProjectID"] = req.query.ProjectID;
    if (req.query.ProjectCode) $where["ProjectCode"] = req.query.ProjectCode;
    if (req.query.ProjectName)
      $where["ProjectName"] = {
        [Op.like]: "%" + req.query.ProjectName + "%",
      };
    if (req.query.ProjectNameEN)
      $where["ProjectNameEN"] = {
        [Op.like]: "%" + req.query.ProjectNameEN + "%",
      };

    if (req.query.IsExtend) $where["IsExtend"] = req.query.IsExtend;
    if (req.query.ProjectLevel) $where["ProjectLevel"] = req.query.ProjectLevel;
    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;

    // AnimalTypeID
    let WhereAnimalType = null;
    if (req.query.AnimalTypeID) {
      var AnimalTypeIDList = req.query.AnimalTypeID.split(",");
      WhereAnimalType = {
        AnimalTypeID: {
          [Op.in]: AnimalTypeIDList,
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
    $order = [["ProjectID", "ASC"]];
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
        model: AnimalType,
        where: WhereAnimalType,
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
        Promise.all([db.findAll(_q.query),delete _q.query.include, db.count(_q.query)])
          .then((result) => {
            let rows = result[0],
              count = result[2];

            // 
            rows = rows.map((data) => {
              let animalTypeArray = [];
              data.AnimalTypes.forEach((element) => {
                animalTypeArray.push(element.AnimalTypeName)
                // if (animalTypeArray == "") {
                //   animalTypeArray = element.AnimalTypeName;
                // } else {
                //   animalTypeArray =
                //     animalTypeArray + "," + element.AnimalTypeName;
                // }
              });
              data = { ...data.toJSON(), AnimalTypes: animalTypeArray };

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
        console.log("Freedom")
        let obj = await db.findByPk(id, {
          include: [{ all: true }],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        
        let animalTypeArray = [];
        obj.toJSON().AnimalTypes.forEach((element) => {
          animalTypeArray.push(element.AnimalTypeName)
        });
        
        obj = { ...obj.toJSON(), AnimalTypes: animalTypeArray };

        resolve(obj);
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้

        let AnimalTypeID = data.AnimalTypeID;
        data.AnimalTypeID = data.AnimalTypeID.toString();
        
        const obj = new db(data);
        const inserted = await obj.save();

        // insert ProjectToAnimalType
        await AnimalTypeID.forEach((id) => {
          const obj1 = ProjectToAnimalType.create({
            ProjectID: inserted.ProjectID,
            AnimalTypeID: id,
            CreatedUserID: data.CreatedUserID,
          });
        });

        const res = await db.findByPk(inserted.ProjectID, {
          include: [{ all: true }],
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
        data.ProjectID = parseInt(id);
        data.UpdatedUserID = 1;

        let AnimalTypeID = data.AnimalTypeID;
        data.AnimalTypeID = data.AnimalTypeID.toString();

        await db.update(data, { where: { ProjectID: id } });

        const res = await db.findByPk(id, {
          include: [{ all: true }],
        });

        // insert ProjectToAnimalType
        let AnimalTypeIDList = AnimalTypeID.split(",");

        const searchPTA = await ProjectToAnimalType.findAll({
          where: { ProjectID: res.ProjectID },
        });
        // loop pta ของโครงการนี้ทั้งหมดที่มาจาก DB
        searchPTA.forEach((pta) => {
          // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
          if (!AnimalTypeIDList.includes(pta.AnimalTypeID)) {
            ProjectToAnimalType.destroy({
              where: { ProjectToAnimalTypeID: pta.ProjectToAnimalTypeID },
            });
          }
        });

        AnimalTypeIDList.forEach(async (id) => {
          const searchPTAOne = await ProjectToAnimalType.findOne({
            where: {
              ProjectID: res.ProjectID,
              AnimalTypeID: id,
            },
          });

          if (!searchPTAOne) {
            const obj1 = ProjectToAnimalType.create({
              ProjectID: res.ProjectID,
              AnimalTypeID: id,
              CreatedUserID: data.UpdatedUserID,
            });
          }
        });

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
          { where: { ProjectID: id } }
        );

        // delete ProjectToAnimalType
        const obj1 = ProjectToAnimalType.update(
          { isRemove: 1, isActive: 0 },
          { where: { ProjectID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
