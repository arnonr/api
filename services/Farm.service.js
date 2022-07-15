const e = require("express");
const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Farm"),
  { Op } = require("sequelize");

const FarmToProject = require("../models/FarmToProject");
const Project = require("../models/Project");
const Farmer = require("../models/Farmer");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

    if (req.query.FarmIdentificationNumber)
      $where["FarmIdentificationNumber"] = {
        [Op.like]: "%" + req.query.FarmIdentificationNumber + "%",
      };

    if (req.query.FarmName)
      $where["FarmName"] = {
        [Op.like]: "%" + req.query.FarmName + "%",
      };

    if (req.query.FarmTumbolID) $where["FarmTumbolID"] = req.query.FarmTumbolID;
    if (req.query.FarmAmphurID) $where["FarmAmphurID"] = req.query.FarmAmphurID;
    if (req.query.FarmProvinceID)
      $where["FarmProvinceID"] = req.query.FarmProvinceID;

    // if (req.query.FarmProvinceID) $where["ResidenceLatitude"] = req.query.ResidenceLatitude;
    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;
    if (req.query.OrganizationZoneID)
      $where["OrganizationZoneID"] = req.query.OrganizationZoneID;
    if (req.query.AIZoneID) $where["FarmProvinceID"] = req.query.AIZoneID;
    if (req.query.FarmStatusID) $where["FarmStatusID"] = req.query.FarmStatusID;

    if (req.query.FarmRegisterStartDate) {
      $where["FarmRegisterDate"] = {
        [Op.between]: [
          req.query.FarmRegisterStartDate,
          req.query.FarmRegisterEndDate,
        ],
      };
    }

    // ProjectID
    let WhereProject = null;

    if (req.query.ProjectID) {
      WhereProject = {
        ProjectID: {
          [Op.in]: JSON.parse(req.query.ProjectID),
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
    $order = [["FarmID", "ASC"]];
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
        model: Project,
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
          .then(async (result) => {
            let rows = result[0],
              count = rows.length;
            //
            rows = await Promise.all(
              rows.map(async (data) => {
                let projectArray = [];
                data.Projects.forEach((element) => {
                  projectArray.push(element.ProjectName);
                });
                data = {
                  ...data.toJSON(),
                  Projects: projectArray,
                  ProjectID: JSON.parse(data.toJSON().ProjectID),
                };

                data.Farmer = await Farmer.findOne({
                  where: {
                    FarmID: 2,
                  },
                });

                return data;
              })
            );
            //

            // rows = rows.map((data) => {
            //   let farmer = Farmer.findOne({
            //     where: {
            //       FarmID: 2,
            //     },
            //   });

            //   data.Farmer = farmer;
            //   return data;
            // });

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
          include: { all: true, required: false },
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let projectArray = [];
        obj.toJSON().Projects.forEach((element) => {
          projectArray.push(element.ProjectName);
        });

        let farmer = await Farmer.findOne({
          where: {
            FarmID: obj.FarmID,
          },
        });

        obj = {
          ...obj.toJSON(),
          Projects: projectArray,
          Farmer: farmer,
          ProjectID: JSON.parse(obj.toJSON().ProjectID),
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
        if (!Array.isArray(data.ProjectID)) {
          reject(ErrorBadRequest("Project ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }

        let ProjectIDList = [...data.ProjectID];
        data.ProjectID = JSON.stringify(data.ProjectID);

        const obj = new db(data);
        const inserted = await obj.save();

        // insert ProjectToAnimalType
        ProjectIDList.forEach((ProjectID) => {
          const obj1 = FarmToProject.create({
            FarmID: inserted.FarmID,
            ProjectID: ProjectID,
            CreatedUserID: data.CreatedUserID,
          });
        });

        let res = methods.findById(inserted.FarmID);

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
        data.FarmID = parseInt(id);
        console.log("Freedom");

        if (data.ProjectID) {
          if (!Array.isArray(data.ProjectID)) {
            reject(ErrorBadRequest("Project ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }

          var ProjectIDList = [...data.ProjectID];
          data.ProjectID = JSON.stringify(data.ProjectID);
        }
        await db.update(data, { where: { FarmID: id } });
        if (data.ProjectID) {
          // insert FarmToProject
          const searchFTP = await FarmToProject.findAll({
            where: { FarmID: obj.FarmID },
          });

          // loop pta ของทั้งหมดที่มาจาก DB
          searchFTP.forEach((ftp) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!ProjectIDList.includes(String(ftp.ProjectID))) {
              FarmToProject.destroy({
                where: { FarmToProjectID: ftp.FarmToProjectID },
              });
            }
          });

          ProjectIDList.forEach(async (ProjectID) => {
            const searchFTPOne = await FarmToProject.findOne({
              where: {
                FarmID: obj.FarmID,
                ProjectID: ProjectID,
              },
            });

            if (!searchFTPOne) {
              const obj1 = FarmToProject.create({
                FarmID: obj.FarmID,
                ProjectID: ProjectID,
                CreatedUserID: data.UpdatedUserID,
              });
            }
          });
        }

        let res = methods.findById(data.FarmID);

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
          { where: { FarmID: id } }
        );

        // delete ProjectToAnimalType
        const obj1 = FarmToProject.update(
          { isRemove: 1, isActive: 0 },
          { where: { FarmID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  GenerateNumber(OrganizationID) {
    // รหัสหน่วยงาน + running number 4 หลัก เช่น 1902000001
    return new Promise(async (resolve, reject) => {
      try {
        let farm = await db.max("FarmIdentificationNumber", {
          where: { OrganizationID: OrganizationID },
        });

        if (farm) {
          var FarmNumberGenerate = parseInt(farm) + 1;
        } else {
          let organization = await Organization.findByPk(OrganizationID);
          if (!organization) {
            reject(ErrorNotFound("Organization ID: not found"));
          } else {
            FarmNumberGenerate = parseInt(
              organization.OrganizationCode + "0001"
            );
          }
        }

        resolve({ FarmNumberGenerate: FarmNumberGenerate });
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },
  photo(id, filename) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check ID
        const obj = await db.findByPk(id);
        if (!obj) reject(ErrorNotFound("id: not found"));

        // Update
        var os = require("os");
        var hostname = os.hostname();
        console.log(hostname);

        obj.FarmImagePath = config.UploadPath + "/images/farm/" + filename;
        obj.save();

        resolve();
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
};

module.exports = { ...methods };
