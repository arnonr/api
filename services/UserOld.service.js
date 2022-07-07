const db = require("../models"),
  config = require("../configs/app"),
  jwt = require("jsonwebtoken"),
  {
    ErrorBadRequest,
    ErrorNotFound,
    ErrorUnauthorized,
  } = require("../configs/errorMethods");

const { Op } = require("sequelize");
const User = require("../models/User");
const PersonalData = require("../models/PersonalData");
const Group = require("../models/Group");
const GroupAuthorize = require("../models/GroupAuthorize");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};
    if (req.query.username)
      $where["username"] = { [Op.like]: "%" + req.query.username + "%" };

    // Active
    $where["is_active"] = 1;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["username", "ASC"]];
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

    query["include"] = [{ model: PersonalData, as: "PersonalData" }];

    return {
      query: query,
    };
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch(req, limit, offset);

    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([User.findAll(_q.query), User.count(_q.query)])
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
        const obj = await User.findByPk(id, {
          include: [{ model: PersonalData, as: "PersonalData" }],
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
        //   validate Data

        const obj = new User(data);
        obj.password = obj.passwordHash(obj.password);
        const inserted = await obj.save();

        // check if status = "A" แปลว่าเจ้าหน้าที่สร้างและอนุมัติให้ส่ง email ให้ user reset password

        resolve(inserted);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check ID
        const obj = await User.findByPk(id);
        if (!obj) reject(ErrorNotFound("id: not found"));

        // Update
        data.id = parseInt(id);

        data.password = obj.passwordHash(data.password);

        await User.update(data, { where: { id: id } });

        // await User.update(data, { where: { id: id }, individualHooks: true });

        // check if status เปล่ี่ยนจาก "W"เป็น "A" ให้ส่ง email แจ้งว่าได้รับการอนุมัติ
        // check if status เปล่ี่ยนจาก "W"เป็น "R" ให้ส่ง email แจ้งว่าไม่ได้รับการอนุมัติ
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await User.findByPk(id);
        if (!obj) reject(ErrorNotFound("id: not found"));
        await User.update({ active: 0 }, { where: { id: id } });
        // await User.deleteOne({ _id: id })
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  login(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await User.findOne({
          where: { username: data.username },
          include: [
            { model: PersonalData, as: "PersonalData" },
            {
              model: Group,
              as: "Group",
              include: [
                {
                  model: GroupAuthorize,
                  as: "GroupAuthorize",
                },
              ],
            },
          ],
        });

        // ตรวจสอบว่ามี username
        if (!obj) {
          reject(ErrorUnauthorized("username not found"));
        } else {
          // ตรวจสอบ Password
          if (!obj.validPassword(data.password)) {
            reject(ErrorUnauthorized("password is invalid."));
          }

          if (obj.status === "W") {
            reject(ErrorUnauthorized("รออนุมัติ"));
          }

          if (obj.status === "R") {
            reject(ErrorUnauthorized("ไม่อนุมัติ"));
          }
        }
        // let userData = {
        //   id: obj.id,
        //   username: obj.username,
        //   //   firstname: obj.firstname,
        //   //   lastname: obj.lastname,
        //   //   role: obj.role,
        //   //   email: obj.email,
        //   photoURL:
        //     "https://icons-for-free.com/iconfiles/png/512/business+costume+male+man+office+user+icon-1320196264882354682.png",
        //   createdDatetime: obj.created_datetime,
        //   updatedDatetime: obj.updated_datetime,
        // };

        resolve({ accessToken: obj.generateJWT(obj), userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },

  register(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //   validate Data
        const obj = new User(data);
        obj.password = obj.passwordHash(obj.password);
        const inserted = await obj.save();

        // check if status = "A" แปลว่าเจ้าหน้าที่สร้างและอนุมัติให้ส่ง email ให้ user reset password
        resolve(inserted);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  refreshToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const decoded = jwt.decode(accessToken);
        const obj = await User.findOne({
          where: { username: decoded.username },
          include: [
            { model: PersonalData, as: "PersonalData" },
            {
              model: Group,
              as: "Group",
              include: [
                {
                  model: GroupAuthorize,
                  as: "GroupAuthorize",
                },
              ],
            },
          ],
        });
        if (!obj) {
          reject(ErrorUnauthorized("username not found"));
        }
        resolve({ accessToken: obj.generateJWT(obj), userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
