const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Farm"),
  { Op, col, fn, where } = require("sequelize");
const Sequelize = require("sequelize");

const FarmToProject = require("../models/FarmToProject");
const Project = require("../models/Project");
const FarmStatus = require("../models/FarmStatus");
const Organization = require("../models/Organization");
const Farm = require("../models/Farm");
const Farmer = require("../models/Farmer");
const Tumbol = require("../models/Tumbol");
const User = require("../models/User");
const Staff = require("../models/Staff");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);
// const { findOne, findByPk } = require("../models/Project");

const nodemailer = require("nodemailer");

const methods = {
  async scopeSearch(req, limit, offset) {
    // Where
    var $where = {};

    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

    if (req.query.FarmerID) $where["FarmerID"] = req.query.FarmerID;

    if (req.query.FarmType) $where["FarmType"] = req.query.FarmType;

    if (req.query.FarmIdentificationNumber)
      $where["FarmIdentificationNumber"] = {
        [Op.like]: "%" + req.query.FarmIdentificationNumber + "%",
      };

    if (req.query.FarmAnimalType) {
      if (req.query.FarmAnimalType == 98) {
        $where["FarmAnimalType"] = {
          [Op.is]: null,
        };
      } else if (req.query.FarmAnimalType == 99) {
        $where["FarmAnimalType"] = {
          [Op.not]: null,
        };
      } else {
        $where["FarmAnimalType"] = {
          [Op.like]: "%" + req.query.FarmAnimalType + "%",
        };
      }
    }

    if (req.query.FarmName)
      $where["FarmName"] = {
        [Op.like]: "%" + req.query.FarmName + "%",
      };

    if (req.query.FarmTumbolID) $where["FarmTumbolID"] = req.query.FarmTumbolID;
    if (req.query.FarmAmphurID) $where["FarmAmphurID"] = req.query.FarmAmphurID;

    //  get_by_org_province = 1;
    if (req.query.GetByOrgProvince) {
      let ProvinceID = null;
      let user = await User.findByPk(req.body.UserID, {
        include: [
          {
            model: Staff,
            as: "Staff",
            include: {
              model: Organization,
              as: "Organization",
            },
          },
        ],
      });

      // ฟาร์ม
      $where["FarmProvinceID"] = user.Staff.Organization.OrganizationProvinceID;
    }

    if (req.query.FarmProvinceID)
      $where["FarmProvinceID"] = req.query.FarmProvinceID;

    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;

    if (req.query.OrganizationZoneID)
      $where["OrganizationZoneID"] = req.query.OrganizationZoneID;
    if (req.query.AIZoneID) $where["AiZoneID"] = req.query.AIZoneID;
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
      if (JSON.parse(req.query.ProjectID).length != 0) {
        WhereProject = {
          ProjectID: {
            [Op.in]: JSON.parse(req.query.ProjectID),
          },
        };
      }
    }

    let WhereFullName = null;

    if (req.query.FullName) {
      WhereFullName = Sequelize.where(
        Sequelize.fn(
          "concat",
          Sequelize.col("GivenName"),
          " ",
          Sequelize.col("Surname")
        ),
        {
          [Op.like]: "%" + req.query.FullName.trim() + "%",
        }
      );
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

    // if (!isNaN(limit)) query["limit"] = limit;

    // if (!isNaN(offset)) query["offset"] = offset;

    let include = [
      {
        model: Project,
        where: WhereProject,
      },
      {
        model: Farmer,
        as: "Farmer",
        where: WhereFullName,
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

    if (req.query.includeFarmStatus) {
      include.unshift({ model: FarmStatus, as: "FarmStatus" });
    }

    query["include"] = include;

    return { query: query };
  },

  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = await methods.scopeSearch(req, limit, offset);

    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([
          db.findAll({ ..._q.query, limit: limit, offset: offset }),
          db.findAll({ ..._q.query }),
        ])
          .then(async (result) => {
            let rows = result[0],
              count = result[1].length;

            rows = await Promise.all(
              rows.map(async (data) => {
                let projectArray = [];

                for (let i = 0; i < data.Projects.length; i++) {
                  projectArray.push(data.Projects[i].ProjectName);
                }

                data = {
                  ...data.toJSON(),
                  Projects: projectArray,
                  ProjectID: JSON.parse(data.toJSON().ProjectID),
                };

                return data;
              })
            );

            resolve({
              rows: rows,
              totalPage: Math.ceil(count / limit),
              totalData: count,
              currPage: +req.query.page || 1,
              total: count,
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
        //
        if (data.ProjectID) {
          if (!Array.isArray(data.ProjectID)) {
            reject(ErrorBadRequest("Project ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          var ProjectIDList = [...data.ProjectID];
          data.ProjectID = JSON.stringify(data.ProjectID);
        }

        if (data.FarmAnimalType) {
          if (!Array.isArray(data.FarmAnimalType)) {
            reject(ErrorBadRequest("ชนิดสัตว์ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          data.FarmAnimalType = JSON.stringify(data.FarmAnimalType);
        }

        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        obj.FarmIdentificationNumber = obj.FarmIdentificationNumber.toString();
        console.log();
        const inserted = await obj.save();

        // insert ProjectToAnimalType
        if (data.ProjectID) {
          ProjectIDList.forEach((ProjectID) => {
            const obj1 = FarmToProject.create({
              FarmID: inserted.FarmID,
              ProjectID: ProjectID,
              CreatedUserID: data.CreatedUserID,
              createdAt: fn("GETDATE"),
            });
          });
        }

        let res = methods.findById(inserted.FarmID);

        let farmer = Farmer.findByPk(inserted.FarmerID);

        if (farmer.Email) {
          // let transporter = nodemailer.createTransport({
          //   host: "smtp.gmail.com",
          //   port: 587,
          //   secure: false,
          //   auth: {
          //     // ข้อมูลการเข้าสู่ระบบ
          //     user: "edocument@fba.kmutnb.ac.th", // email user ของเรา
          //     pass: "edoc2565", // email password
          //   },
          // });
          // let info = await transporter.sendMail({
          //   from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
          //   to: farmer.Email, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
          //   subject: "ระบบฐานข้อมูล โคเนื้อ กระบิอ แพะ", // หัวข้ออีเมล
          //   html: "<b>ฟาร์ม "+inserted.FarmName+"ของคุณได้รับการบันทึกเข้าสู่ระบบฐานข้อมูล โคเนื้อ กระบิอ แพะ</b>", // html body
          // });
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
        data.FarmID = parseInt(id);

        if (data.ProjectID) {
          if (!Array.isArray(data.ProjectID)) {
            reject(ErrorBadRequest("Project ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }

          var ProjectIDList = [...data.ProjectID];
          data.ProjectID = JSON.stringify(data.ProjectID);
        }

        if (data.FarmAnimalType) {
          if (!Array.isArray(data.FarmAnimalType)) {
            reject(ErrorBadRequest("ชนิดสัตว์ต้องอยู่ในรูปแบบ Array"));
            return;
          }
          data.FarmAnimalType = JSON.stringify(data.FarmAnimalType);
        }

        data.updatedAt = fn("GETDATE");

        // data
        await db.update(data, { where: { FarmID: id } });

        // console.log(data.UpdatedUserID + "FREEDOM20");

        if (data.ProjectID === null) {
          FarmToProject.destroy({
            where: {
              FarmID: id,
            },
            // truncate: true,
          });
        }

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
              var date1 = new Date();

              const obj1 = FarmToProject.create({
                FarmID: obj.FarmID,
                ProjectID: ProjectID,
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
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

        const obj1 = FarmToProject.destroy({
          where: { FarmID: id },
          // truncate: true,
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  GenerateNumber(req) {
    // รหัสหน่วยงาน + running number 4 หลัก เช่น 1902000001
    return new Promise(async (resolve, reject) => {
      try {
        // let farm1 = await db.max("FarmIdentificationNumber", {
        //   where: { OrganizationID: OrganizationID },
        // });

        let farm = await db.max("FarmIdentificationNumber", {
          //   where: {
          //     FarmProvinceID: req.query.ProvinceID,
          //     FarmAmphurID: req.query.AmphurID,
          //     FarmTumbolID: req.query.TumbolID,
          //   },
          where: {
            FarmIdentificationNumber: {
              // LIKE: req.query.ProvinceID+req.query.AmphurID+req.query.TumbolID+'%'
              [Op.like]: req.query.TumbolID + "%",
            },
            // FarmAmphurID: req.query.AmphurID,
            // FarmTumbolID: req.query.TumbolID,
          },
        });
        // console.log(farm)

        // จากจังหวัด อำเภอ ตำบล1

        if (farm) {
          var FarmNumberGenerate = parseInt(farm) + 1;
          console.log(FarmNumberGenerate);
          //   tumbol.TumbolCode.substring(0, 6) + "0001"
        } else {
          // let organization = await Organization.findByPk(OrganizationID);
          // if (!organization) {
          //   reject(ErrorNotFound("Organization ID: not found"));
          // } else {
          let tumbol = await Tumbol.findByPk(req.query.TumbolID);
          console.log(tumbol);
          FarmNumberGenerate = parseInt(
            tumbol.TumbolCode.substring(0, 6) + "0001"
            // req.query.TumbolID + "0001"
          );
          // }
        }

        resolve({ FarmNumberGenerate: FarmNumberGenerate });
      } catch (error) {
        reject(error);
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

  Notification(id) {
    // รหัสหน่วยงาน + running number 4 หลัก เช่น 1902000001
    return new Promise(async (resolve, reject) => {
      try {
        // let farm = await db.max("FarmIdentificationNumber", {
        //   where: { OrganizationID: OrganizationID },
        // });

        // if (farm) {
        //   var FarmNumberGenerate = parseInt(farm) + 1;
        // } else {
        //   let organization = await Organization.findByPk(OrganizationID);
        //   if (!organization) {
        //     reject(ErrorNotFound("Organization ID: not found"));
        //   } else {
        //     FarmNumberGenerate = parseInt(
        //       organization.OrganizationCode + "0001"
        //     );
        //   }
        // }

        resolve({ FarmNumberGenerate: FarmNumberGenerate });
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  //   selection
  async scopeSearchSelection(req, limit, offset) {
    // Where
    var $where = {};

    if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;

    if (req.query.FarmerID) $where["FarmerID"] = req.query.FarmerID;

    if (req.query.FarmType) $where["FarmType"] = req.query.FarmType;

    if (req.query.FarmIdentificationNumber)
      $where["FarmIdentificationNumber"] = {
        [Op.like]: "%" + req.query.FarmIdentificationNumber + "%",
      };

    if (req.query.FarmAnimalType) {
      if (req.query.FarmAnimalType == 98) {
        $where["FarmAnimalType"] = {
          [Op.is]: null,
        };
      } else if (req.query.FarmAnimalType == 99) {
        $where["FarmAnimalType"] = {
          [Op.not]: null,
        };
      } else {
        $where["FarmAnimalType"] = {
          [Op.like]: "%" + req.query.FarmAnimalType + "%",
        };
      }
    }

    if (req.query.FarmName)
      $where["FarmName"] = {
        [Op.like]: "%" + req.query.FarmName + "%",
      };

    if (req.query.FarmTumbolID) $where["FarmTumbolID"] = req.query.FarmTumbolID;
    if (req.query.FarmAmphurID) $where["FarmAmphurID"] = req.query.FarmAmphurID;

    //  get_by_org_province = 1;
    if (req.query.GetByOrgProvince) {
      let ProvinceID = null;
      let user = await User.findByPk(req.body.UserID, {
        include: [
          {
            model: Staff,
            as: "Staff",
            include: {
              model: Organization,
              as: "Organization",
            },
          },
        ],
      });

      // ฟาร์ม
      $where["FarmProvinceID"] = user.Staff.Organization.OrganizationProvinceID;
    }

    if (req.query.FarmProvinceID)
      $where["FarmProvinceID"] = req.query.FarmProvinceID;

    if (req.query.OrganizationID)
      $where["OrganizationID"] = req.query.OrganizationID;

    if (req.query.OrganizationZoneID)
      $where["OrganizationZoneID"] = req.query.OrganizationZoneID;
    if (req.query.AIZoneID) $where["AIZoneID"] = req.query.AIZoneID;
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
      if (JSON.parse(req.query.ProjectID).length != 0) {
        WhereProject = {
          ProjectID: {
            [Op.in]: JSON.parse(req.query.ProjectID),
          },
        };
      }
    }

    let WhereFullName = null;

    if (req.query.FullName) {
      WhereFullName = Sequelize.where(
        Sequelize.fn(
          "concat",
          Sequelize.col("GivenName"),
          " ",
          Sequelize.col("Surname")
        ),
        {
          [Op.like]: "%" + req.query.FullName.trim() + "%",
        }
      );
    }

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

    let include = [
      {
        model: Farmer,
        as: "Farmer",
        where: WhereFullName,
      },
      //   {
      //     model: Province,
      //     as: "Farmer",
      //     where: WhereFullName,
      //   },
    ];

    query["include"] = include;

    return { query: query };
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

            rows = rows.map((data) => {
              let number = data.FarmIdentificationNumber
                ? data.FarmIdentificationNumber
                : "- ";
              let name = data.Farmer ? data.Farmer.FullName : "- ";

              let d = {
                FarmID: data.FarmID,
                FarmName: data.FarmName,
                FarmIdentificationNumber: data.FarmIdentificationNumber,
                Fullname:
                  "ฟาร์ม " +
                  data.FarmName +
                  " (" +
                  number +
                  ")" +
                  " | เจ้าของฟาร์ม " +
                  name,
                OrganizationID: data.OrganizationID,
                AIZoneID: data.AIZoneID,
                OrganizationZoneID: data.OrganizationZoneID,
                FarmStatusName: data.FarmStatus?.FarmStatusName,
              };
              return d;
            });

            // rows = await Promise.all(
            //   rows.map(async (data) => {
            //     let projectArray = [];

            //     for (let i = 0; i < data.Projects.length; i++) {
            //       projectArray.push(data.Projects[i].ProjectName);
            //     }

            //     data = {
            //       ...data.toJSON(),
            //       Projects: projectArray,
            //       ProjectID: JSON.parse(data.toJSON().ProjectID),
            //     };

            //     return data;
            //   })
            // );

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

  async exportExcel(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = await methods.scopeSearch(req, limit, offset);

    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([db.findAll({ ..._q.query })])
          .then(async (result) => {
            let rows = result[0].map((e) => {
              return {
                หมายเลขฟาร์ม: e.FarmIdentificationNumber,
                ชื่อฟาร์ม: e.FarmName,
                ชื่อนามสกุลเกษตรกร: e.Farmer ? e.Farmer.FullName : "-",
                จังหวัด: e.Province.ProvinceName,
                อำเภอ: e.Amphur.AmphurName,
                ตำบล: e.Tumbol.TumbolName,
                หน่วยงาน: e.Organization
                  ? e.Organization.OrganizationName
                  : "-",
                วันที่ขึ้นทะเบียน: e.FarmRegisterDate
                  ? dayjs(e.FarmRegisterDate)
                      .locale(locale)
                      .format("DD/MM/YYYY")
                  : "",
              };
            });

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
