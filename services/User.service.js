const config = require("../configs/app"),
  db = require("../models/User"),
  jwt = require("jsonwebtoken"),
  {
    ErrorBadRequest,
    ErrorNotFound,
    ErrorUnauthorized,
  } = require("../configs/errorMethods"),
  { Op, where, fn } = require("sequelize");
const nodemailer = require("nodemailer");

const Sequelize = require("sequelize"),
  { sequelize } = require("../configs/databases");

const UserToAnimalType = require("../models/UserToAnimalType");
const AnimalType = require("../models/AnimalType");
const GroupAuthorize = require("../models/GroupAuthorize");
var requestIp = require("request-ip");
const LoginLog = require("../models/LoginLog");
const Staff = require("../models/Staff");
const Organization = require("../models/Organization");
const Province = require("../models/Province");

const methods = {
  async scopeSearch(req, limit, offset) {
    // Where
    let $where = {};

    let $WhereStaff = {};

    let user = await db.findByPk(req.query.GetedUserID, {
      include: [
        {
          model: Staff,
          as: "Staff",
        },
      ],
    });

    if (user.GroupID != 1) {
      let organization1 = `with recursive cte (OrganizationID, ParentOrganizationID) as (
            select     OrganizationID,
                       ParentOrganizationID
            from       Organization
            where      ParentOrganizationID = ${user.Staff.StaffOrganizationID} AND isRemove = 0
            union all
            select     o.OrganizationID,
                       o.ParentOrganizationID
            from       Organization o
            inner join cte
                    on o.ParentOrganizationID = cte.OrganizationID
          )
          select * from cte;`;

      const res1 = await sequelize.query(organization1);
      let orgArr1 = [user.Staff.StaffOrganizationID];
      res1[0].map((r) => {
        orgArr1.push(r.OrganizationID);
      });
      $WhereStaff = { StaffOrganizationID: { [Op.in]: orgArr1 } };
    }

    if (req.query.UserID) $where["UserID"] = req.query.UserID;
    // if (req.query.Username)
    //   $where["Username"] = {
    //     [Op.like]: "%" + req.query.Username + "%",
    //   };

    if (req.query.Username) {
      $where[Op.or] = [
        { Username: { [Op.like]: "%" + req.query.Username + "%" } },
        {
          "$Staff.StaffGivenName$": {
            [Op.like]: "%" + req.query.Username + "%",
          },
        },
        {
          "$Staff.StaffSurname$": { [Op.like]: "%" + req.query.Username + "%" },
        },
        {
          "$Staff.StaffNumber$": { [Op.like]: "%" + req.query.Username + "%" },
        },
      ];
      // $WhereStaff = { StaffOrganizationID: { [Op.in]: orgArr1 } };
    }

    if (req.query.StaffID) $where["StaffID"] = req.query.StaffID;
    if (req.query.GroupID) $where["GroupID"] = req.query.GroupID;

    // AnimalTypeID
    let WhereAnimalType = {};
    if (req.query.AnimalTypeID) {
      WhereAnimalType = {
        AnimalTypeID: {
          [Op.in]: JSON.parse(req.query.AnimalTypeID),
        },
      };
    }

    if (req.query.IsApprove) $where["IsApprove"] = req.query.IsApprove;
    if (req.query.ApproveByStaffID)
      $where["ApproveByStaffID"] = req.query.ApproveByStaffID;

    // if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    if (req.query.ResetPasswordToken)
      $where["ResetPasswordToken"] = req.query.ResetPasswordToken;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["UserID", "ASC"]];
    if (req.query.orderByField && req.query.orderBy)
      $order = [
        [
          req.query.orderByField,
          req.query.orderBy.toLowerCase() == "desc" ? "desc" : "asc",
        ],
      ];
    query["order"] = $order;

    query["include"] = [
      { all: true, required: false },
      {
        model: AnimalType,
        where: WhereAnimalType,
        required: false,
      },
      {
        model: Staff,
        as: "Staff",
        where: $WhereStaff,
        required: true,
      },
    ];

    if (!isNaN(limit)) query["limit"] = limit;

    if (!isNaN(offset)) query["offset"] = offset;

    return { query: query };
  },

  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = await methods.scopeSearch(req, limit, offset);
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
          include: [
            { all: true, required: false },
            {
              model: AnimalType,
              required: false,
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let animalTypeArray = [];
        obj.toJSON().AnimalTypes.forEach((element) => {
          animalTypeArray.push(element.AnimalTypeName);
        });

        const obj1 = await GroupAuthorize.findAll({
          where: {
            GroupID: obj.GroupID,
          },
          include: { all: true, required: false },
        });

        obj = {
          ...obj.toJSON(),
          AnimalTypes: animalTypeArray,
          AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
          GroupAuthorize: obj1,
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
        obj.Password = obj.passwordHash(obj.Password);
        const inserted = await obj.save();

        // insert ProjectToAnimalType
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = UserToAnimalType.create({
            UserID: inserted.UserID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

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
        //   to: obj.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
        //   subject: "ระบบฐานข้อมูล โคเนื้อ กระบิอ แพะ", // หัวข้ออีเมล
        //   // text: "d", // plain text body
        //   html: "<b>คุณได้รับการอนุมัติการเข้าใช้งานระบบฐานข้อมูล โคเนื้อ กระบือ แพะ สามารถเข้าใช้งานได้ที่ <a href='http://178.128.216.177/'>คลิก</a></b>", // html body
        // });

        let res = methods.findById(inserted.UserID);

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
        data.UserID = parseInt(id);

        if (data.Password) {
          data.Password = obj.passwordHash(data.Password);
        }

        if (data.AnimalTypeID) {
          if (!Array.isArray(data.AnimalTypeID)) {
            reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
            return;
          }

          var AnimalTypeIDList = [...data.AnimalTypeID];
          data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);
        }
        data.ResetPasswordToken = null;
        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { UserID: id } });

        if (data.AnimalTypeID === null) {
          UserToAnimalType.destroy({
            where: {
              UserID: id,
            },
            // truncate: true,
          });
        }

        if (data.AnimalTypeID) {
          // insert ProjectToAnimalType
          const searchPTA = await UserToAnimalType.findAll({
            where: { UserID: obj.UserID },
          });
          // loop pta ของโครงการนี้ทั้งหมดที่มาจาก DB
          searchPTA.forEach((pta) => {
            // ตรวจสอบ array ที่ส่งมา กับ pta DB แต่ละตัวถ้าไม่มี แปลว่าโดนลบ
            if (!AnimalTypeIDList.includes(pta.AnimalTypeID)) {
              UserToAnimalType.destroy({
                where: { UserToAnimalTypeID: pta.UserToAnimalTypeID },
              });
            }
          });

          AnimalTypeIDList.forEach(async (AnimalTypeID) => {
            const searchPTAOne = await UserToAnimalType.findOne({
              where: {
                UserID: obj.UserID,
                AnimalTypeID: AnimalTypeID,
              },
            });

            if (!searchPTAOne) {
              const obj1 = UserToAnimalType.create({
                UserID: obj.UserID,
                AnimalTypeID: AnimalTypeID,
                CreatedUserID: data.UpdatedUserID,
                createdAt: fn("GETDATE"),
              });
            }
          });
        }

        // if (obj.IsApprove == 0 && data.IsApprove == 1) {
        //   let transporter = nodemailer.createTransport({
        //     host: "smtp.gmail.com",
        //     port: 587,
        //     secure: false,
        //     auth: {
        //       // ข้อมูลการเข้าสู่ระบบ
        //       user: "edocument@fba.kmutnb.ac.th", // email user ของเรา
        //       pass: "edoc2565", // email password
        //     },
        //   });

        //   let info = await transporter.sendMail({
        //     from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
        //     to: obj.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
        //     subject: "ยินดีต่้อนรับสู่ระบบฐานข้อมูล โคเนื้อ กระบิอ แพะ", // หัวข้ออีเมล
        //     // text: "d", // plain text body
        //     html: "<b>คุณได้รับการอนุมัติการเข้าใช้งานระบบฐานข้อมูล โคเนื้อ กระบือ แพะ สามารถเข้าใช้งานได้ที่ <a href='http://178.128.216.177/'>คลิก</a></b>", // html body
        //   });
        // }

        if (obj.IsApprove == 0 && data.IsApprove == 1) {
          let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              // ข้อมูลการเข้าสู่ระบบ
              user: "cwie@kmutnb.ac.th", // email user ของเรา
              pass: "xhqqcypawtnyfnhl", // email password
              //user: "arnon.r@tgde.kmutnb.ac.th", // email user ของเรา
              //pass: "zsetdnqrizeqtvwu", // email password
            },
          });

          await transporter.sendMail({
            from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
            to: obj.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
            subject: "ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ", // หัวข้ออีเมล
            html: "<b>ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ </b><br> ระบบสมาชิกของท่านได้รับการอนุมัติ <br>ท่านสามารถเข้าใช้งานระบบ AIDM ได้ที่ URL : <a href='http://biotech-cbg.dld.go.th/'>http://biotech-cbg.dld.go.th/</a>", // html body
          });
        }

        let res = methods.findById(obj.UserID);

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
          { where: { UserID: id } }
        );

        const obj1 = UserToAnimalType.destroy({
          where: { UserID: id },
          // // truncate: true,
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  login(data, ip, device) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = null;
        obj = await db.findOne({
          where: {
            Username: data.Username,
            isRemove: 0,
            isActive: 1,
          },
          include: [
            { all: true },
            {
              model: Staff,
              as: "Staff",
              include: {
                model: Organization,
                as: "Organization",
                required: true,
                include: [{ model: Province, as: "Province" }],
              },
            },
          ],
        });

        // ตรวจสอบว่ามี username
        if (!obj) {
          let staff = await Staff.findOne({
            where: {
              StaffMobilePhone: data.Username,
              isRemove: 0,
              isActive: 1,
            },
          });

          if (staff) {
            obj = await db.findOne({
              where: { StaffID: staff.StaffID },
              include: [
                { all: true },
                {
                  model: Staff,
                  as: "Staff",
                  include: {
                    model: Organization,
                    as: "Organization",
                    required: true,
                    include: [{ model: Province, as: "Province" }],
                  },
                },
              ],
            });
          } else {
            reject(ErrorUnauthorized("Username not found"));
          }
        }

        // ตรวจสอบ Password
        if (!obj.validPassword(data.Password)) {
          reject(ErrorUnauthorized("Password is invalid."));
        }

        if (obj.IsApprove === 0) {
          reject(ErrorUnauthorized("รออนุมัติ"));
        }

        if (obj.IsApprove === 2) {
          reject(ErrorUnauthorized("ไม่อนุมัติ"));
        }

        // ip ::ffff:

        var date = new Date().toISOString();

        let loginLog = new LoginLog({
          UserID: obj.UserID,
          IPAddress: ip.substring(7),
          LoginDatetime: Date.now(),
          Device: JSON.stringify(device),
          CreatedUserID: obj.UserID,
          createdAt: date,
        });

        loginLog.save();

        let animalTypeArray = [];
        obj.toJSON().AnimalTypes.forEach((element) => {
          animalTypeArray.push(element.AnimalTypeName);
        });

        obj.LastLogin = Date.now();
        obj.save();

        res = {
          ...obj.toJSON(),
          AnimalTypes: animalTypeArray,
          AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
        };

        resolve({ accessToken: obj.generateJWT(obj), userData: res });
      } catch (error) {
        reject(error);
      }
    });
  },

  register(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้
        if (!Array.isArray(data.AnimalTypeID)) {
          reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
          return;
        }

        let AnimalTypeIDList = [...data.AnimalTypeID];
        data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);

        var date = new Date().toISOString();
        data.createdAt = date;

        const obj = new db(data);
        obj.Password = obj.passwordHash(obj.Password);
        const inserted = await obj.save();

        // const staff = Staff.findOne()
        // StaffEmail
        // StaffMobilePhone

        // insert ProjectToAnimalType
        AnimalTypeIDList.forEach((AnimalTypeID) => {
          const obj1 = UserToAnimalType.create({
            UserID: inserted.UserID,
            AnimalTypeID: AnimalTypeID,
            CreatedUserID: data.CreatedUserID,
            createdAt: fn("GETDATE"),
          });
        });

        // Send mail
        // let transporter = nodemailer.createTransport({
        //   host: "smtp.gmail.com",
        //   port: 587,
        //   secure: false,
        //   auth: {
        //     // ข้อมูลการเข้าสู่ระบบ
        //     user: "arnon.r@tgde.kmutnb.ac.th", // email user ของเรา
        //     pass: "edoc2565", // email password
        //   },
        // });

        // let info = await transporter.sendMail({
        //   from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
        //   to: inserted.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
        //   subject: "ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ", // หัวข้ออีเมล
        //   // text: "d", // plain text body
        //   html: "<b>ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ ได้รับข้อมูลของท่านเรียบร้อยแล้ว อยู่ระหว่างรอการอนุมัติ", // html body
        // });

        let res = methods.findById(inserted.UserID);

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });

    // return new Promise(async (resolve, reject) => {
    //   try {
    //     //   validate Data
    //     var date = new Date().toISOString();
    data.createdAt = fn("GETDATE");

    const obj = new db(data);
    //     obj.password = obj.passwordHash(obj.password);
    //     const inserted = await obj.save();

    //     resolve(inserted);
    //   } catch (error) {
    //     reject(ErrorBadRequest(error.message));
    //   }
    // });
  },

  refreshToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const decoded = jwt.decode(accessToken);
        const obj = await db.findOne({
          where: { Username: decoded.Username },
          include: [
            { all: true, nested: true },
            {
              model: AnimalType,
            },
          ],
        });

        if (!obj) {
          reject(ErrorUnauthorized("Username not found"));
        }

        let res = {
          ...obj.toJSON(),
          AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
        };

        resolve({ accessToken: obj.generateJWT(obj), userData: res });
      } catch (error) {
        reject(error);
      }
    });
  },

  authorize(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.findByPk(id);

        const obj = await GroupAuthorize.findAll({
          where: {
            GroupID: user.GroupID,
          },
          include: { all: true, required: false },
        });
        if (!obj) reject(ErrorNotFound("id: not found"));
        resolve({
          total: obj.length,
          rows: obj,
        });
      } catch (error) {
        reject(ErrorNotFound("id: not found1"));
      }
    });
  },

  CheckPermission(id, menuID, Action) {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.findByPk(id);

        let $where = {
          GroupID: user.GroupID,
          MenuID: parseInt(menuID),
        };

        if (Action == "IsAdd") {
          $where = { ...$where, IsAdd: 1 };
        }

        if (Action == "IsUpdate") {
          $where = { ...$where, IsUpdate: 1 };
        }

        if (Action == "IsDelete") {
          $where = { ...$where, IsDelete: 1 };
        }

        if (Action == "IsPreview") {
          $where = { ...$where, IsPreview: 1 };
        }

        const obj = await GroupAuthorize.findOne({
          where: $where,
        });

        if (!obj)
          resolve({
            GroupID: user.GroupID,
            MenuID: parseInt(menuID),
            permission: false,
          });

        resolve({
          GroupID: user.GroupID,
          MenuID: parseInt(menuID),
          permission: true,
        });
      } catch (error) {
        reject(ErrorNotFound("id: not found1"));
      }
    });
  },

  findByStaffID(StaffID) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = await db.findOne({
          where: {
            StaffID: StaffID,
            isRemove: 0,
          },
          include: [
            { all: true, required: false },
            {
              model: AnimalType,
              required: false,
            },
          ],
        });

        if (!obj) resolve(false);

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
        reject(ErrorNotFound(error));
      }
    });
  },

  forgotPassword(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await db.findOne({
          where: {
            Username: data.email,
          },
        });

        if (!obj) reject(ErrorNotFound("email: not found"));

        console.log("TEST");

        let chars =
          "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let passwordLength = 12;
        let password = "";

        for (let i = 0; i <= passwordLength; i++) {
          var randomNumber = Math.floor(Math.random() * chars.length);
          password += chars.substring(randomNumber, randomNumber + 1);
        }

        // obj.Password = obj.passwordHash(password);
        obj.ResetPasswordToken = password;

        await obj.save();

        // Send mail
        // let transporter = nodemailer.createTransport({
        //   host: "webmail.workd.go.th", //host: "smtp.gmail.com",
        //   port: 587,
        //   debug: true,
        //   logger: true,
        //   secure: false,
        //   auth: {
        //     // ข้อมูลการเข้าสู่ระบบ
        //     user: "bblp.datadev@dld.go.th", // user: "arnon.r@tgde.kmutnb.ac.th", // email user ของเรา
        //     pass: "Bio#113048", // pass: "zsetdnqrizeqtvwu", // email password
        //   },
        //   tls: {
        //     maxVersion: 'TLSv1.2',
        //     minVersion: 'TLSv1.2',
        //   },
        // });

        // Send mail
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            // ข้อมูลการเข้าสู่ระบบ
            // user: "bblp.datadev@gmail.com", // email user ของเรา
            // pass: "biotech6",
            //user: "tongfreedom@gmail.com", // email user ของเรา
            //pass: "gqmubppxipviaxzm",

            user: "cwie@kmutnb.ac.th", // email user ของเรา
            pass: "xhqqcypawtnyfnhl", // email password
          },
        });

        const info = await transporter.sendMail({
          from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
          to: data.email, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
          subject: "Password Reset", // หัวข้ออีเมล
          html:
            "<b>ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ </b><br> ท่านสามารถกำหนดรหัสผ่านในการเข้าใช้งานระบบ AIDM ได้ที่ URL : <a href='http://biotech-cbg.dld.go.th/new-password?token=" +
            obj.ResetPasswordToken +
            "'>http://biotech-cbg.dld.go.th/new-password?token=" +
            obj.ResetPasswordToken +
            "</a>", // html body
        });

        console.log("Email sent Successfully" + info.response);

        // let info = await transporter.sendMail({
        //   from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
        //   to: obj.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
        //   subject: "Password Reset", // หัวข้ออีเมล
        //   // text: "d", // plain text body
        //   html:
        //     "<b>ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ </b><br> รหัสผ่านใหม่ของท่านคือ : " +
        //     password + "<br> กรุณาเปลี่ยนรหัสผ่านหลังจากเข้าใช้งาน <br> Link : http://bblp-aidm.dld.go.th/", // html body
        // });

        // let res = methods.findById(inserted.UserID);

        let res = { data: obj };

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
};

module.exports = { ...methods };
