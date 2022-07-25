const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/Farmer"),
  { Op } = require("sequelize");
const axios = require("axios").default;

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.FarmerID) $where["FarmerID"] = req.query.FarmerID;

    if (req.query.IdentificationNumber)
      $where["IdentificationNumber"] = {
        [Op.like]: "%" + req.query.IdentificationNumber + "%",
      };

    if (req.query.TitleID) $where["TitleID"] = req.query.TitleID;

    if (req.query.GivenName)
      $where["GivenName"] = {
        [Op.like]: "%" + req.query.GivenName + "%",
      };

    if (req.query.MiddleName)
      $where["MiddleName"] = {
        [Op.like]: "%" + req.query.MiddleName + "%",
      };

    if (req.query.Surname)
      $where["Surname"] = {
        [Op.like]: "%" + req.query.Surname + "%",
      };

    if (req.query.GenderID) $where["GenderID"] = req.query.GenderID;
    if (req.query.EducationID) $where["EducationID"] = req.query.EducationID;

    if (req.query.HouseTumbolID)
      $where["HouseTumbolID"] = req.query.HouseTumbolID;
    if (req.query.HouseAmphurID)
      $where["HouseAmphurID"] = req.query.HouseAmphurID;
    if (req.query.HouseProvinceID)
      $where["HouseProvinceID"] = req.query.HouseProvinceID;

    if (req.query.HouseZipCode)
      $where["HouseZipCode"] = {
        [Op.like]: "%" + req.query.HouseZipCode + "%",
      };

    if (req.query.ResidenceTumbolID)
      $where["ResidenceTumbolID"] = req.query.ResidenceTumbolID;
    if (req.query.ResidenceAmphurID)
      $where["ResidenceAmphurID"] = req.query.ResidenceAmphurID;
    if (req.query.ResidenceProvinceID)
      $where["ResidenceProviceID"] = req.query.ResidenceProvinceID;
    if (req.query.ResidenceZipCode)
      $where["ResidenceZipCode"] = {
        [Op.like]: "%" + req.query.ResidenceZipCode + "%",
      };

    if (req.query.FarmerRegisterStatus)
      $where["FarmerRegisterStatus"] = req.query.FarmerRegisterStatus;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["FarmerID", "ASC"]];
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

    query["include"] = [{ all: true, required: false }];

    return { query: query };
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch(req, limit, offset);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([
          db.findAll(_q.query),
          delete _q.query.include,
          db.count(_q.query),
        ])
          .then((result) => {
            const rows = result[0],
              count = result[2];
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
          include: { all: true, required: false },
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

        let res = methods.findById(inserted.FarmerID);

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
        data.FarmerID = parseInt(id);

        await db.update(data, { where: { FarmerID: id } });

        let res = methods.findById(data.FarmerID);

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
          { where: { FarmerID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  fetchAPIFarmer() {
    return new Promise(async (resolve, reject) => {
      try {
        // axios
        let AccessToken = null;
        var username = "zealtech";
        var password = "zeal1tech";
        var credentials = btoa(username + ":" + password);
        var basicAuth = "Basic " + credentials;
        axios
          .post(
            "https://service-eregist.dld.go.th/regislives_authen/oauth/token", {
              auth: {
                username: 'zealtech',
                password: 'zeal1tech'
              },
              username: 'biotech',
              password: '!Q@WeRegist',
              grant_type: 'password'
            }
          )
          .then(function (response) {
            console.log(response);
            AccessToken = response.access_token;
          });

        resolve({});
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },
};

module.exports = { ...methods };
