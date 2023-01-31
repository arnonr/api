const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Staff"),
  { Op, query } = require("sequelize");

const Sequelize = require("sequelize"),
  { sequelize } = require("../configs/databases");

const User = require("../models/User");
const Organization = require("../models/Organization");
const Province = require("../models/Province");
const AIZone = require("../models/AIZone");

const CardRequestLog = require("../models/CardRequestLog");
const Staff = require("../models/Staff");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

const methods = {
  async scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.StaffID) $where["StaffID"] = req.query.StaffID;

    //
    let user = await User.findByPk(req.query.GetedUserID, {
      include: [
        {
          model: Staff,
          as: "Staff",
          include: [{ model: Organization, as: "Organization" }],
        },
      ],
    });

    if (user.Staff.StaffOrganizationID != 1) {
      let organization = `WITH cte AS (
          select     OrganizationID,
                     ParentOrganizationID
          from       aidm.aidm.Organization
          where      ParentOrganizationID = ${user.Staff.StaffOrganizationID}
          UNION ALL
          select     o.OrganizationID,
                     o.ParentOrganizationID
          from       aidm.aidm.Organization o
          INNER JOIN cte e
                  on o.ParentOrganizationID = e.OrganizationID
        )
        SELECT * FROM cte;`;

      const res = await sequelize.query(organization);

      let orgArr = [user.Staff.StaffOrganizationID];
      res[0].map((r) => {
        orgArr.push(r.OrganizationID);
      });

      $where["StaffOrganizationID"] = { [Op.in]: orgArr };

      // // if (req.query.StaffOrganizationID) {
      // //   $where["StaffOrganizationID"] = {
      // //     [Op.and]: {
      // //       StaffOrganizationID: req.query.StaffOrganizationID,
      // //       // StaffOrganizationID: { [Op.in]: orgArr },
      // //     },
      // //   };
      // //   //
      // // }
    }

    if (req.query.StaffOrganizationID) {
      $where["StaffOrganizationID"] = req.query.StaffOrganizationID;

      if (req.query.OrganizationAllChild == 1) {
        let organization1 = `WITH cte AS (
          select     OrganizationID,
                     ParentOrganizationID
          from       aidm.aidm.Organization
          where      ParentOrganizationID = ${req.query.StaffOrganizationID} AND isRemove = 0
          union all
          select     o.OrganizationID,
                     o.ParentOrganizationID
          from       aidm.aidm.Organization o
          inner join cte e
                  on o.ParentOrganizationID = e.OrganizationID
        )
        SELECT * FROM cte;`;
        const res1 = await sequelize.query(organization1);
        let orgArr1 = [req.query.StaffOrganizationID];
        res1[0].map((r) => {
          orgArr1.push(r.OrganizationID);
        });
        $where["StaffOrganizationID"] = {
          [Op.in]: orgArr1,
        };
      }
    }

    //

    if (req.query.StaffNumber)
      $where["StaffNumber"] = {
        [Op.like]: "%" + req.query.StaffNumber + "%",
      };

    if (req.query.StaffIdentificationNumber)
      $where["StaffIdentificationNumber"] = {
        [Op.like]: "%" + req.query.StaffIdentificationNumber + "%",
      };

    if (req.query.StaffTitleID) $where["StaffTitleID"] = req.query.StaffTitleID;

    if (req.query.StaffGivenName)
      $where["StaffGivenName"] = {
        [Op.like]: "%" + req.query.StaffGivenName + "%",
      };
    if (req.query.StaffSurname)
      $where["StaffSurname"] = {
        [Op.like]: "%" + req.query.StaffSurname + "%",
      };

    if (req.query.GenderID) $where["StaffGenderID"] = req.query.StaffGenderID;
    if (req.query.StaffMarriedStatusID)
      $where["StaffMarriedStatusID"] = req.query.StaffMarriedStatusID;
    // if (req.query.StaffOrganizationID)
    //   $where["StaffOrganizationID"] = req.query.StaffOrganizationID;
    if (req.query.StaffPositionTypeID)
      $where["StaffPositionTypeID"] = req.query.StaffPositionTypeID;
    if (req.query.StaffPositionID)
      $where["StaffPositionID"] = req.query.StaffPositionID;
    if (req.query.StaffTumbolID)
      $where["StaffTumbolID"] = req.query.StaffTumbolID;
    if (req.query.StaffAmphurID)
      $where["StaffAmphurID"] = req.query.StaffAmphurID;
    if (req.query.StaffProvinceID)
      $where["StaffProvinceID"] = req.query.StaffProvinceID;

    if (req.query.StaffEmail)
      $where["StaffEmail"] = {
        [Op.like]: "%" + req.query.StaffEmail + "%",
      };

    if (req.query.StaffStartDate) {
      $where[Op.or] = [
        {
          StaffStartDate: {
            [Op.between]: [req.query.StaffStartDate, req.query.StaffEndDate],
          },
        },
        {
          StaffEndDate: {
            [Op.between]: [req.query.StaffStartDate, req.query.StaffEndDate],
          },
        },
      ];
    }

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["StaffID", "ASC"]];
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
        model: CardRequestLog,
        as: "CardRequestLog",
        limit: 1,
        order: [
          ["RequestDate", "DESC"],
          ["CardRequestID", "DESC"],
        ],
      },
      {
        model: Organization,
        as: "Organization",
      },
    ];
    return { query: query };
  },

  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = await methods.scopeSearch(req, limit, offset);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([
          db.findAll(_q.query),
          delete _q.query.include,
          (_q.query["distinct"] = true),
          1,
        ])
          .then((result) => {
            let rows = result[0],
              count = rows.length;

            let rows1 = rows.map((data) => {
              data = {
                ...data.toJSON(),
                CardRequestLog: data.toJSON().CardRequestLog[0],
              };

              return data;
            });

            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: rows1,
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
          include: [
            { all: true, required: false },
            {
              model: CardRequestLog,
              as: "CardRequestLog",
              limit: 1,
              order: [
                ["RequestDate", "DESC"],
                ["CardRequestID", "DESC"],
              ],
            },
          ],
        });

        if (!obj) reject(ErrorNotFound("id: not found"));

        let res = { ...obj.toJSON() };
        if (res.CardRequestLog.length != 0) {
          res.CardRequestLog = { ...res.CardRequestLog[0].toJSON() };
        }

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //check เงื่อนไขตรงนี้ได้

        if (data.hasOwnProperty("isFlag")) {
          if (data.isFlag == "NewRegister") {
            // Generate StaffNumber
            let org = await Organization.findOne({
              where: { OrganizationID: data.StaffOrganizationID },
            });

            let province = await Province.findOne({
              where: { ProvinceID: org.OrganizationProvinceID },
              include: { model: AIZone, as: "AIZone" },
            });
            
            let text1 = province.AIZone.AIZoneENCode;
            let text2 = dayjs().locale("th").format("BB");
            let text3 = data.StaffPositionTypeID;
            let prefix = text1 + text2 + text3;

            let staffCheck = await Staff.max("StaffNumber", {
              where: {
                StaffNumber: {
                  [Op.startsWith]: prefix,
                },
              },
            });

            let codeLastest = null;
            if (staffCheck) {
              codeLastest = staffCheck.substr(-4);
              codeLastest = parseInt(codeLastest) + 1;
              let number = 4 - parseInt(String(codeLastest).length);

              if (number != 0) {
                codeLastest = String(codeLastest);
                for (let i = 1; i <= number; i++) {
                  codeLastest = "0" + codeLastest;
                }
              }
            } else {
              codeLastest = "0001";
            }

            data.StaffNumber = prefix + codeLastest;
          }
        }

        const obj = new db(data);

        const inserted = await obj.save({ individualHooks: true });

        let res = methods.findById(inserted.StaffID);

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
        data.StaffID = parseInt(id);

        await db.update(data, {
          where: { StaffID: id },
          individualHooks: true,
        });

        let res = methods.findById(data.StaffID);

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
          { where: { StaffID: id } }
        );
        resolve();
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

        obj.StaffImage = config.UploadPath + "/images/staff/" + filename;
        obj.save();

        resolve();
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  findByStaffNumber(StaffNumber) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await db.findOne({
          where: {
            StaffNumber: StaffNumber.toString(),
            isRemove: 0,
          },
          include: [
            { all: true, required: false },
            {
              model: CardRequestLog,
              as: "CardRequestLog",
              limit: 1,
              order: [
                ["RequestDate", "DESC"],
                ["CardRequestID", "DESC"],
              ],
            },
          ],
        });

        if (!obj) resolve(false);

        let res = { ...obj.toJSON() };
        if (res.CardRequestLog.length != 0) {
          res.CardRequestLog = { ...res.CardRequestLog[0].toJSON() };
        }

        resolve(res);
      } catch (error) {
        reject(ErrorNotFound(error));
      }
    });
  },

  updateMobilePhone(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check ID
        const obj = await db.findByPk(id);
        if (!obj) resolve(false);

        // Update
        await db.update(
          { StaffMobilePhone: data.StaffMobilePhone },
          {
            where: { StaffID: id },
            individualHooks: true,
          }
        );

        let res = methods.findById(data.StaffID);

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
};

module.exports = { ...methods };
