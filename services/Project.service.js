const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Project"),
  { Op, fn } = require("sequelize");

const ProjectToAnimalType = require("../models/ProjectToAnimalType");
const AnimalType = require("../models/AnimalType");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.ProjectID) $where["ProjectID"] = req.query.ProjectID;
    if (req.query.ProjectCode)
      $where["ProjectCode"] = {
        [Op.like]: "%" + req.query.ProjectCode + "%",
      };
    if (req.query.ProjectName)
      $where["ProjectName"] = {
        [Op.like]: "%" + req.query.ProjectName + "%",
      };
    if (req.query.ProjectNameEN)
      $where["ProjectNameEN"] = {
        [Op.like]: "%" + req.query.ProjectNameEN + "%",
      };

    if (req.query.IsExtend) $where["IsExtend"] = req.query.IsExtend;
    if (req.query.ProjectLevel) {
      // $where["ProjectLevel"] = req.query.ProjectLevel;
      $where["ProjectLevel"] = {
        [Op.or]: [req.query.ProjectLevel, "ALL"],
      };

      //   $where["ProjectLevel"] = {
      //     [Op.or]: [req.query.ProjectLevel, "ALL"],
      //   };
    }
    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;

    // AnimalTypeID
    let WhereAnimalType = null;

    if (req.query.AnimalTypeID) {
      WhereAnimalType = {
        AnimalTypeID: {
          [Op.in]: JSON.parse(req.query.AnimalTypeID),
        },
      };
    }

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    if (req.query.StartDate) {
      $where[Op.or] = [
        {
          StartDate: {
            [Op.between]: [req.query.StartDate, req.query.EndDate],
          },
        },
        {
          EndDate: {
            [Op.between]: [req.query.StartDate, req.query.EndDate],
          },
        },
      ];
    }

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

    let include = [
      {
        model: AnimalType,
        where: WhereAnimalType,
      },
    ];

    if (req.query.includeAll) {
      if (req.query.includeAll == "false") {
      } else {
        include.unshift({ all: true, required: false });
      }
    } else {
      include.unshift({ all: true, required: false });
    }
    query["include"] = include;

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
            let rows = result[0],
              count = rows.length;
            //
            rows = rows.map((data) => {
              let animalTypeArray = [];
              data.AnimalTypes.forEach((element) => {
                animalTypeArray.push(element.AnimalTypeName);
              });
              data = {
                ...data.toJSON(),
                AnimalTypes: animalTypeArray,
                AnimalTypeID: JSON.parse(data.toJSON().AnimalTypeID),
              };

              return data;
            });
            // //

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
        let obj = await db.findByPk(id, {
          include: [{ all: true, required: false }],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let animalTypeArray = [];
        obj.toJSON().AnimalTypes.forEach((element) => {
          animalTypeArray.push(element.AnimalTypeName);
        });

        obj = {
          ...obj.toJSON(),
          AnimalTypes: animalTypeArray,
          AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
        };

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
        if (!Array.isArray(data.AnimalTypeID)) {
          reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }
        let AnimalTypeIDList = [...data.AnimalTypeID];
        data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);

        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        const inserted = await obj.save();

        // insert ProjectToAnimalType
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = ProjectToAnimalType.create({
            ProjectID: inserted.ProjectID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        let res = methods.findById(inserted.ProjectID);

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
        data.ProjectID = parseInt(id);

        if (data.AnimalTypeID) {
          if (!Array.isArray(data.AnimalTypeID)) {
            reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }

          var AnimalTypeIDList = [...data.AnimalTypeID];
          data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);
        }

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { ProjectID: id } });

        if (data.AnimalTypeID === null) {
          ProjectToAnimalType.destroy({
            where: {
              ProjectID: id,
            },
            // truncate: true,
          });
        }

        if (data.AnimalTypeID) {
          // insert ProjectToAnimalType
          const searchPTA = await ProjectToAnimalType.findAll({
            where: { ProjectID: obj.ProjectID },
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

          AnimalTypeIDList.forEach(async (AnimalTypeID) => {
            const searchPTAOne = await ProjectToAnimalType.findOne({
              where: {
                ProjectID: obj.ProjectID,
                AnimalTypeID: AnimalTypeID,
              },
            });

            if (!searchPTAOne) {
              const obj1 = ProjectToAnimalType.create({
                ProjectID: obj.ProjectID,
                AnimalTypeID: AnimalTypeID,
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            }
          });
        }
        let res = methods.findById(data.ProjectID);
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
          { where: { ProjectID: id } }
        );

        // delete ProjectToAnimalType
        const obj1 = ProjectToAnimalType.destroy({
          where: { ProjectID: id },
          // truncate: true,
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  async selection(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = await methods.scopeSearch(req, limit, offset);

    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([db.findAll({ ..._q.query, limit: limit, offset: offset })])
          .then(async (result) => {
            let rows = result[0];

            // let rows = result[0].map((data) => {
            //   let d = {
            //     "ProjectID": data.ProjectID,
            //     "ProjectCode": data.ProjectCode,
            //     "ProjectName": data.ProjectName,
            //     // "StartDate": data.StartDate,
            //     // "EndDate": data.EndDate,
            //     // "OrganizationID": data.OrganizationID,
            //     "AnimalTypeID": data.AnimalTypeID,
            //     // "ProjectLevel": data.ProjectLevel,
            //   };
            //   return d;
            // });

            resolve({
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
