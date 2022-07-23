const config = require("../configs/app"),
  { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
  db = require("../models/PregnancyCheckup"),
  { Op } = require("sequelize");

  const Staff = require("../models/Staff");
  const Animal = require("../models/Animal");

const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.PregnancyCheckupID)
      $where["PregnancyCheckupID"] = req.query.PregnancyCheckupID;

    if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

    if (req.query.AIID) $where["AIID"] = req.query.AIID;
    if (req.query.TransferEmbryoID)
      $where["TransferEmbryoID"] = req.query.TransferEmbryoID;
    if (req.query.NormalBreedingID)
      $where["NormalBreedingID"] = req.query.NormalBreedingID;
    if (req.query.TimeNo) $where["NormalBreedingID"] = req.query.TimeNo;
    if (req.query.CheckupDate)
      $where["CheckupDate"] = req.query.CheckupDate;
    if (req.query.PregnancyCheckMethodID)
      $where["PregnancyCheckMethodID"] = req.query.PregnancyCheckMethodID;
    if (req.query.PregnancyCheckStatusID)
      $where["PregnancyCheckStatusID"] = req.query.PregnancyCheckStatusID;
    if (req.query.ResponsibilityStaffID)
      $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

    if (req.query.isActive) $where["isActive"] = req.query.isActive;
    if (req.query.CreatedUserID)
      $where["CreatedUserID"] = req.query.CreatedUserID;
    if (req.query.UpdatedUserID)
      $where["UpdatedUserID"] = req.query.UpdatedUserID;

    $where["isRemove"] = 0;
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["PregnancyCheckupID", "ASC"]];
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
    //   {
    //     model: Staff,
    //     attributes: ['StaffGivenName', 'StaffSurname']
    //   },
    ];

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
        
        let productionStatusID = null;
        if(inserted.PregnancyCheckStatusID == 1){
          productionStatusID = 6;
        }else if(inserted.PregnancyCheckStatusID == 2){
          productionStatusID = 5;
        }else{
          productionStatusID = 3;
        }
      
        await Animal.update({ProductionStatusID: productionStatusID}, { where: { AnimalID: inserted.AnimalID } });

        let res = methods.findById(inserted.PregnancyCheckupID);

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
        data.PregnancyCheckupID = parseInt(id);

        await db.update(data, { where: { PregnancyCheckupID: id } });

        let res = methods.findById(data.PregnancyCheckupID);

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
          { where: { PregnancyCheckupID: id } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
