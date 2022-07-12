const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Animal"),
  { Op } = require("sequelize");
const { count } = require("../models/Animal");

const AnimalToProject = require("../models/AnimalToProject");
const Project = require("../models/Project");

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
    if (req.query.AnimalFirstBreed)
      $where["AnimalFirstBreed"] = req.query.AnimalFirstBreed;
    if (req.query.AnimalFatherID)
      $where["AnimalFatherID"] = req.query.AnimalFatherID;
    if (req.query.AnimalMotherID)
      $where["AnimalMotherID"] = req.query.AnimalMotherID;

    if (req.query.AnimalBornType)
      $where["AnimalBornType"] = req.query.AnimalBornType;
    if (req.query.AnimalBornTypeID)
      $where["AnimalBornTypeID"] = req.query.AnimalBornTypeID;
    if (req.query.AnimalSource)
      $where["AnimalBornTypeID"] = req.query.AnimalSource;
    if (req.query.SourceFarmID) $where["SourceFarmID"] = req.query.SourceFarmID;
    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;
    if (req.query.OrganizationZoneID)
      $where["OrganizationZoneID"] = req.query.OrganizationZoneID;

    // Breed

    // ช่วงวันเกิด
    if (req.query.AnimalBirthDateStart) {
      $where["AnimalBirthDate"] = {
        [Op.between]: [
          req.query.AnimalBirthDateStart,
          req.query.AnimalBirthDateEnd,
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
          .then((result) => {
            let rows = result[0],
              count = rows.length;

            //
            rows = rows.map((data) => {
              let projectArray = [];
              data.Projects.forEach((element) => {
                projectArray.push(element.ProjectName);
              });
              data = {
                ...data.toJSON(),
                Projects: projectArray,
                ProjectID: JSON.parse(data.toJSON().ProjectID),
              };

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
        let obj = await db.findByPk(id, {
          include: { all: true, required: false },
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let projectArray = [];
        obj.toJSON().Projects.forEach((element) => {
          projectArray.push(element.ProjectName);
        });

        obj = {
          ...obj.toJSON(),
          Projects: projectArray,
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
        let ProjectIDList = [...data.ProjectID];
        data.ProjectID = JSON.stringify(data.ProjectID);

        const obj = new db(data);
        const inserted = await obj.save();

        // insert AnimalToAnimalType
        ProjectIDList.forEach((ProjectID) => {
          const obj1 = AnimalToProject.create({
            AnimalID: inserted.AnimalID,
            ProjectID: ProjectID,
            CreatedUserID: data.CreatedUserID,
          });
        });

        let res = methods.findById(inserted.AnimalID);

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
        data.AnimalID = parseInt(id);

        let ProjectIDList = [...data.ProjectID];
        data.ProjectID = JSON.stringify(data.ProjectID);

        await db.update(data, { where: { AnimalID: id } });

        // insert AnimalToProject
        const searchATP = await AnimalToProject.findAll({
          where: { AnimalID: obj.AnimalID },
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
              AnimalID: obj.AnimalID,
              ProjectID: ProjectID,
            },
          });

          if (!searchATPOne) {
            const obj1 = AnimalToProject.create({
              AnimalID: obj.AnimalID,
              ProjectID: ProjectID,
              CreatedUserID: data.UpdatedUserID,
            });
          }
        });

        let res = methods.findById(data.AnimalID);

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

  GenerateNumber(FarmID, BirthDate) {
    // หมายเลขประจำตัวสัตว์ ระบบ auto generate ให้ มี FORMAT ตามปีเกิด + เลขทะเบียนฟาร์ม + running number 5 หลัก เช่น ปีเกิดคือ 2022 เลขทะเบียนฟาร์มคือ 101010-0001 เลขที่ได้จะเป็น 1022101010-0001-00001 กรณีที่ไม่ทราบปีเกิดให้ใช้ปีที่บันทึกข้อมูล
    return new Promise(async (resolve, reject) => {
      try {
        let date = new Date();
        if (BirthDate) {
          date = new Date(BirthDate);
        }

        year = date.getFullYear();

        let farm = await Farm.findByPk(FarmID);
        if (farm) {
          let animal = await db.max("AnimalIdentificationID", {
            where: {
              FarmID: FarmID,
              AnimalIdentificationID: {
                [Op.startsWith]: year,
              },
            },
          });

          if (animal) {
            let codeLastest = animal.substr(-5);
            codeLastest = parseInt(codeLastest) + 1;
            let number = 5 - parseInt(String(codeLastest).length);

            if (number != 0) {
              console.log(number);
              codeLastest = String(codeLastest);
              for (let i = 1; i <= number; i++) {
                codeLastest = "0" + codeLastest;
              }
            }

            AnimalNumberGenerate =
              year + farm.FarmIdentificationNumber + codeLastest;
          } else {
            AnimalNumberGenerate =
              year + farm.FarmIdentificationNumber + "00001";
          }
        } else {
          reject(ErrorNotFound("Farm ID: not found"));
        }

        resolve({ AnimalNumberGenerate: AnimalNumberGenerate });
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

        obj.AnimalImagePath = config.UploadPath + "/images/animal/" + filename;
        obj.save();

        resolve();
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
};

module.exports = { ...methods };
