const config = require("../configs/app"),
  db = require("../models/UserFarmer"),
  jwt = require("jsonwebtoken"),
  {
    ErrorBadRequest,
    ErrorNotFound,
    ErrorUnauthorized,
  } = require("../configs/errorMethods"),
  { Op, fn } = require("sequelize");
const nodemailer = require("nodemailer");

const Sequelize = require("sequelize"),
  { sequelize } = require("../configs/databases");

const GroupAuthorize = require("../models/GroupAuthorize");
const Farmer = require("../models/Farmer");

const methods = {
  async scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    let $WhereFarmer = {};

    if (req.query.UserID) $where["UserFarmerID"] = req.query.UserFarmerID;
    if (req.query.Username)
      $where["Username"] = {
        [Op.like]: "%" + req.query.Username + "%",
      };
    if (req.query.FarmerID) $where["StaffID"] = req.query.FarmerID;
    if (req.query.GroupID) $where["GroupID"] = req.query.GroupID;

    if (req.query.IsApprove) $where["IsApprove"] = req.query.IsApprove;
    if (req.query.ApproveByStaffID)
      $where["ApproveByStaffID"] = req.query.ApproveByStaffID;

    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["UserFarmerID", "ASC"]];
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
        model: Farmer,
        as: "Farmer",
        where: $WhereFarmer,
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
              data = {
                ...data.toJSON(),
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
          include: [{ all: true, required: false }],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        const obj1 = await GroupAuthorize.findAll({
          where: {
            GroupID: obj.GroupID,
          },
          include: { all: true, required: false },
        });

        obj = {
          ...obj.toJSON(),
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
        data.createdAt = fn("GETDATE");

        const obj = new db(data);
        obj.Password = obj.passwordHash(obj.Password);
        const inserted = await obj.save();

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
        // console.log(inserted);
        let res = methods.findById(inserted.UserFarmerID);

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
        data.UserFarmerID = parseInt(id);

        if (data.Password) {
          data.Password = obj.passwordHash(data.Password);
        }

        data.updatedAt = fn("GETDATE");

        await db.update(data, { where: { UserFarmerID: id } });

        let res = methods.findById(obj.UserFarmerID);

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
          { where: { UserFarmerID: id } }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  //   login(data, ip, device) {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         let obj = null;
  //         obj = await db.findOne({
  //           where: { Username: data.Username, isRemove: 0, isActive: 1 },
  //           include: [
  //             { all: true },
  //             {
  //               model: Staff,
  //               as: "Staff",
  //               include: {
  //                 model: Organization,
  //                 as: "Organization",
  //                 required: true,
  //                 include: [{ model: Province, as: "Province" }],
  //               },
  //             },
  //           ],
  //         });

  //         // ตรวจสอบว่ามี username
  //         if (!obj) {
  //           let staff = await Staff.findOne({
  //             where: {
  //               StaffMobilePhone: data.Username,
  //               isRemove: 0,
  //               isActive: 1,
  //             },
  //           });
  //           if (staff) {
  //             obj = await db.findOne({
  //               where: { StaffID: staff.StaffID },
  //               include: [
  //                 { all: true },
  //                 {
  //                   model: Staff,
  //                   as: "Staff",
  //                   include: {
  //                     model: Organization,
  //                     as: "Organization",
  //                     required: true,
  //                     include: [{ model: Province, as: "Province" }],
  //                   },
  //                 },
  //               ],
  //             });
  //             console.log(obj);
  //           } else {
  //             reject(ErrorUnauthorized("Username not found"));
  //           }
  //         }

  //         // ตรวจสอบ Password
  //         if (!obj.validPassword(data.Password)) {
  //           reject(ErrorUnauthorized("Password is invalid."));
  //         }

  //         if (obj.IsApprove === 0) {
  //           reject(ErrorUnauthorized("รออนุมัติ"));
  //         }

  //         if (obj.IsApprove === 2) {
  //           reject(ErrorUnauthorized("ไม่อนุมัติ"));
  //         }

  //         // ip ::ffff:

  //         let loginLog = new LoginLog({
  //           UserID: obj.UserID,
  //           IPAddress: ip.substring(7),
  //           LoginDatetime: Date.now(),
  //           Device: JSON.stringify(device),
  //           CreatedUserID: obj.UserID,
  //         });

  //         loginLog.save();

  //         let animalTypeArray = [];
  //         obj.toJSON().AnimalTypes.forEach((element) => {
  //           animalTypeArray.push(element.AnimalTypeName);
  //         });

  //         obj.LastLogin = Date.now();
  //         obj.save();

  //         res = {
  //           ...obj.toJSON(),
  //           AnimalTypes: animalTypeArray,
  //           AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
  //         };

  //         resolve({ accessToken: obj.generateJWT(obj), userData: res });
  //       } catch (error) {
  //         reject(error);
  //       }
  //     });
  //   },

  //   register(data) {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         //check เงื่อนไขตรงนี้ได้
  //         if (!Array.isArray(data.AnimalTypeID)) {
  //           reject(ErrorBadRequest("Animal Type ID ต้องอยู่ในรูปแบบ Array"));
  //           return;
  //         }

  //         let AnimalTypeIDList = [...data.AnimalTypeID];
  //         data.AnimalTypeID = JSON.stringify(data.AnimalTypeID);

  //         var date = new Date(); // Or the date you'd like converted.
  //         obj.Password = obj.passwordHash(obj.Password);
  //         const inserted = await obj.save();

  //         // const staff = Staff.findOne()
  //         // StaffEmail
  //         // StaffMobilePhone

  //         // insert ProjectToAnimalType
  //         AnimalTypeIDList.forEach((AnimalTypeID) => {
  //           const obj1 = UserToAnimalType.create({
  //             UserID: inserted.UserID,
  //             AnimalTypeID: AnimalTypeID,
  //             CreatedUserID: data.CreatedUserID,
  //           });
  //         });

  //         // Send mail
  //         // let transporter = nodemailer.createTransport({
  //         //   host: "smtp.gmail.com",
  //         //   port: 587,
  //         //   secure: false,
  //         //   auth: {
  //         //     // ข้อมูลการเข้าสู่ระบบ
  //         //     user: "arnon.r@tgde.kmutnb.ac.th", // email user ของเรา
  //         //     pass: "edoc2565", // email password
  //         //   },
  //         // });

  //         // let info = await transporter.sendMail({
  //         //   from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
  //         //   to: inserted.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
  //         //   subject: "ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ", // หัวข้ออีเมล
  //         //   // text: "d", // plain text body
  //         //   html: "<b>ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ ได้รับข้อมูลของท่านเรียบร้อยแล้ว อยู่ระหว่างรอการอนุมัติ", // html body
  //         // });

  //         let res = methods.findById(inserted.UserID);

  //         resolve(res);
  //       } catch (error) {
  //         reject(ErrorBadRequest(error.message));
  //       }
  //     });

  //     // return new Promise(async (resolve, reject) => {
  //     //   try {
  //     //     //   validate Data
  //     //     var date = new Date(); // Or the date you'd like converted.
  //     //     obj.password = obj.passwordHash(obj.password);
  //     //     const inserted = await obj.save();

  //     //     resolve(inserted);
  //     //   } catch (error) {
  //     //     reject(ErrorBadRequest(error.message));
  //     //   }
  //     // });
  //   },

  //   refreshToken(accessToken) {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         const decoded = jwt.decode(accessToken);
  //         const obj = await db.findOne({
  //           where: { Username: decoded.Username },
  //           include: [
  //             { all: true, nested: true },
  //             {
  //               model: AnimalType,
  //             },
  //           ],
  //         });

  //         if (!obj) {
  //           reject(ErrorUnauthorized("Username not found"));
  //         }
  //         resolve({ accessToken: obj.generateJWT(obj), userData: obj });
  //       } catch (error) {
  //         reject(error);
  //       }
  //     });
  //   },

  //   authorize(id) {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         let user = await db.findByPk(id);

  //         const obj = await GroupAuthorize.findAll({
  //           where: {
  //             GroupID: user.GroupID,
  //           },
  //           include: { all: true, required: false },
  //         });
  //         if (!obj) reject(ErrorNotFound("id: not found"));
  //         resolve({
  //           total: obj.length,
  //           rows: obj,
  //         });
  //       } catch (error) {
  //         reject(ErrorNotFound("id: not found1"));
  //       }
  //     });
  //   },

  //   CheckPermission(id, menuID, Action) {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         let user = await db.findByPk(id);

  //         let $where = {
  //           GroupID: user.GroupID,
  //           MenuID: parseInt(menuID),
  //         };

  //         if (Action == "IsAdd") {
  //           $where = { ...$where, IsAdd: 1 };
  //         }

  //         if (Action == "IsUpdate") {
  //           $where = { ...$where, IsUpdate: 1 };
  //         }

  //         if (Action == "IsDelete") {
  //           $where = { ...$where, IsDelete: 1 };
  //         }

  //         if (Action == "IsPreview") {
  //           $where = { ...$where, IsPreview: 1 };
  //         }

  //         const obj = await GroupAuthorize.findOne({
  //           where: $where,
  //         });

  //         if (!obj)
  //           resolve({
  //             GroupID: user.GroupID,
  //             MenuID: parseInt(menuID),
  //             permission: false,
  //           });

  //         resolve({
  //           GroupID: user.GroupID,
  //           MenuID: parseInt(menuID),
  //           permission: true,
  //         });
  //       } catch (error) {
  //         reject(ErrorNotFound("id: not found1"));
  //       }
  //     });
  //   },

  //   findByStaffID(StaffID) {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         let obj = await db.findOne({
  //           where: {
  //             StaffID: StaffID,
  //             isRemove: 0,
  //           },
  //           include: [
  //             { all: true, required: false },
  //             {
  //               model: AnimalType,
  //               required: false,
  //             },
  //           ],
  //         });

  //         if (!obj) resolve(false);

  //         let animalTypeArray = [];
  //         obj.toJSON().AnimalTypes.forEach((element) => {
  //           animalTypeArray.push(element.AnimalTypeName);
  //         });

  //         obj = {
  //           ...obj.toJSON(),
  //           AnimalTypes: animalTypeArray,
  //           AnimalTypeID: JSON.parse(obj.toJSON().AnimalTypeID),
  //         };

  //         resolve(obj);
  //       } catch (error) {
  //         reject(ErrorNotFound(error));
  //       }
  //     });
  //   },
};

module.exports = { ...methods };
