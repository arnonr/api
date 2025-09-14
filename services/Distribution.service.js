const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models/Distribution"),
    Animal = require("../models/Animal"),
    Farm = require("../models/Farm"),
    { Op, fn } = require("sequelize");

const Staff = require("../models/Staff");

const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.DistributionID)
            $where["DistributionID"] = req.query.DistributionID;

        if (req.query.DistributionDate)
            $where["DistributionDate"] = req.query.DistributionDate;

        if (req.query.FarmID) $where["FarmID"] = req.query.FarmID;
        if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

        if (req.query.DistributionType)
            $where["DistributionType"] = req.query.DistributionType;

        if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

        if (req.query.DistributionReasonID)
            $where["DistributionReasonID"] = req.query.DistributionReasonID;

        if (req.query.DestinationFarmID)
            $where["DestinationFarmID"] = req.query.DestinationFarmID;

        if (req.query.DestinationOrganizationID)
            $where["DestinationOrganizationID"] =
                req.query.DestinationOrganizationID;

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
        $order = [["DistributionID", "ASC"]];
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
    getData(data) {
        let dataJson = data.toJSON();
        data = {
            AnimalID: dataJson.AnimalID,
            FarmID: dataJson.FarmID,
            ThaiDistributionDate: dataJson.ThaiDistributionDate,
            DistributionTypeName: !dataJson.DistributionType
                ? null
                : dataJson.DistributionType == "DEATH"
                ? "ตาย"
                : dataJson.DistributionType == "SALE"
                ? "ขาย"
                : dataJson.DistributionType == "DROP"
                ? "คัดทิ้ง"
                : dataJson.DistributionType == "TRANSFER"
                ? "ย้าย"
                : null,

            DistributionReasonName: dataJson.DistributionReason
                ? dataJson.DistributionReason.DistributionReasonName
                : null,

            DistributionReasonName: dataJson.DistributionReason
                ? dataJson.DistributionReason.DistributionReasonName
                : null,

            SourceFarmName: dataJson.Farm
                ? `[${dataJson.Farm.FarmIdentificationNumber}] ${dataJson.Farm.FarmName}`
                : null,

            DestinationFarmName: dataJson.DestinationFarm
                ? `[${dataJson.DestinationFarm.FarmIdentificationNumber}] ${dataJson.DestinationFarm.FarmName}`
                : null,

            DestinationOrganizationName: dataJson.Organization
                ? dataJson.Organization.OrganizationName
                : null,

            DestinationPlace: dataJson.DestinationPlace,

            ResponsibilityStaffName: dataJson.Staff
                ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                : null,

            ...dataJson,
        };
        return data;
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
                        let rows = result[0],
                            count = result[2];

                        rows = rows.map((data) => {
                            data = this.getData(data);
                            return data;
                        });

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

                let data = this.getData(obj);

                resolve(data);
            } catch (error) {
                reject(ErrorNotFound("id: not found"));
            }
        });
    },

    insert(data) {
        return new Promise(async (resolve, reject) => {
            try {
                //check เงื่อนไขตรงนี้ได้
                data.createdAt = fn("GETDATE");

                const checkDuplicate = await db.findOne({
                    where: {
                        AnimalID: data.AnimalID,
                        isRemove: 0,
                        DistributionDate: data.DistributionDate,
                    },
                });

                if (checkDuplicate) {
                    throw new Error("Duplicate!");
                }

                const obj = new db(data);
                const inserted = await obj.save();

                if (inserted.DistributionType == "DROP") {
                    let animal = await Animal.findByPk(inserted.AnimalID);
                    animal.isActive = 0;
                    animal.AnimalAlive = 3;
                    animal.isRemove = 0;
                    animal.save();
                } else if (inserted.DistributionType == "DEATH") {
                    let animal = await Animal.findByPk(inserted.AnimalID);
                    animal.isActive = 0;
                    animal.AnimalAlive = 0;
                    animal.isRemove = 0;
                    animal.save();
                } else if (
                    inserted.DistributionType == "SALE" ||
                    inserted.DistributionType == "TRANSFER"
                ) {
                    let farm = await Farm.findByPk(inserted.DestinationFarmID);

                    let animal = await Animal.findByPk(inserted.AnimalID);
                    animal.FarmID = inserted.DestinationFarmID;

                    animal.OrganizationID = farm.OrganizationID;
                    animal.OrganizationZoneID = farm.OrganizationZoneID;
                    animal.isActive = 1;
                    animal.save();
                } else {
                }

                let res = methods.findById(inserted.DistributionID);

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
                data.DistributionID = parseInt(id);

                data.updatedAt = fn("GETDATE");

                let datasort = {
                    ...data,
                    createdAt: undefined,
                    //   DistributionDate
                };

                await db.update(datasort, { where: { DistributionID: id } });

                let res = methods.findById(data.DistributionID);

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
                    { where: { DistributionID: id } }
                );

                if (obj.DistributionType == "DROP" || obj.DistributionType == "DEATH") {
                    let animal1 = await Animal.findByPk(obj.AnimalID);
                    animal1.isActive = 1;
                    animal1.AnimalAlive = 1;
                    animal1.save();
                }

                let animal = await Animal.findByPk(obj.AnimalID);
                animal.FarmID = obj.FarmID;
                animal.save();

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    insertAll(data) {
        return new Promise(async (resolve, reject) => {
            try {
                //check เงื่อนไขตรงนี้ได้
                data.createdAt = fn("GETDATE");
                console.log(data.AnimalID);

                for (let i = 0; i < data.AnimalID.length; i++) {
                    const new_data = { ...data };
                    new_data.AnimalID = data.AnimalID[i];

                    const obj = new db(new_data);

                    const inserted = await obj.save();

                    if (
                        inserted.DistributionType == "DROP"
                    ) {
                        let animal = await Animal.findByPk(inserted.AnimalID);
                        animal.isActive = 0;
                        animal.AnimalAlive = 3;
                        animal.isRemove = 0;
                        animal.save();
                    }
                    else if  (inserted.DistributionType == "DEATH"){
                        let animal = await Animal.findByPk(inserted.AnimalID);
                        animal.isActive = 0;
                        animal.AnimalAlive = 0;
                        animal.isRemove = 0;
                        animal.save();
                    } 
                    
                    else if (
                        inserted.DistributionType == "SALE" ||
                        inserted.DistributionType == "TRANSFER"
                    ) {
                        let farm = await Farm.findByPk(
                            inserted.DestinationFarmID
                        );

                        let animal = await Animal.findByPk(inserted.AnimalID);
                        animal.FarmID = inserted.DestinationFarmID;

                        animal.OrganizationID = farm.OrganizationID;
                        animal.OrganizationZoneID = farm.OrganizationZoneID;
                        animal.isActive = 1;
                        animal.save();
                    } else {
                    }
                }

                // let res = methods.findById(inserted.DistributionID);

                resolve({});
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },
};

module.exports = { ...methods };
