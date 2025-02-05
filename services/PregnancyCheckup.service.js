const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models/PregnancyCheckup"),
    { Op, fn } = require("sequelize");
const dayjs = require("dayjs");

const Staff = require("../models/Staff");
const AbortCheckup = require("../models/AbortCheckup");
const GiveBirth = require("../models/GiveBirth");
const Animal = require("../models/Animal");
const AI = require("../models/AI");
const IBeef_PAR = require("../models/IBeef_PAR");
const TransferEmbryo = require("../models/TransferEmbryo");
const axios = require("axios");

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

    getData(data) {
        let dataJson = data.toJSON();
        if (dataJson.AI) {
            data = {
                ...dataJson,
                PregnancyCheckupID: dataJson.PregnancyCheckupID,
                AnimalID: dataJson.AnimalID,
                AIID: dataJson.AI.AIID,
                PAR: dataJson.AI.PAR,
                TimeNo: dataJson.AI.TimeNo,
                ThaiDate: dataJson.AI.ThaiAIDate,
                ThaiAIDate: dataJson.AI.ThaiAIDate,
                // Type
                Type: "AI",

                ThaiCheckupDate: dataJson.ThaiCheckupDate,
                CheckupDate: dataJson.CheckupDate,
                PregnancyCheckupTimeNo: dataJson.TimeNo,
                PregnancyCheckStatusName: dataJson.PregnancyCheckStatus
                    ? dataJson.PregnancyCheckStatus.PregnancyCheckStatusName
                    : null,
                BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
                ResponsibilityStaffName: dataJson.Staff
                    ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                    : null,
            };
        } else if (dataJson.TransferEmbryo) {
            data = {
                ...dataJson,
                PregnancyCheckupID: dataJson.PregnancyCheckupID,
                AnimalID: dataJson.AnimalID,
                TransferEmbryoID: dataJson.TransferEmbryo.TransferEmbryoID,
                PAR: dataJson.TransferEmbryo.PAR,
                TimeNo: dataJson.TransferEmbryo.TimeNo,
                ThaiTransferDate: dataJson.TransferEmbryo.ThaiTransferDate,
                ThaiDate: dataJson.TransferEmbryo.ThaiTransferDate,
                Type: "Embryo",
                ThaiCheckupDate: dataJson.ThaiCheckupDate,
                PregnancyCheckupTimeNo: dataJson.TimeNo,
                PregnancyCheckStatusName: dataJson.PregnancyCheckStatus
                    ? dataJson.PregnancyCheckStatus.PregnancyCheckStatusName
                    : null,
                BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
                ResponsibilityStaffName: dataJson.Staff
                    ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                    : null,
            };
        } else {
            data = {
                ...dataJson,
                PregnancyCheckupID: dataJson.PregnancyCheckupID,
                AnimalID: dataJson.AnimalID,
                AIID: null,
                // PAR: dataJson.PAR,
                Type: "NI",
                ThaiCheckupDate: dataJson.ThaiCheckupDate,
                ThaiDate: dataJson.ThaiCheckupDate,
                PregnancyCheckupTimeNo: dataJson.TimeNo,
                PregnancyCheckStatusName: dataJson.PregnancyCheckStatus
                    ? dataJson.PregnancyCheckStatus.PregnancyCheckStatusName
                    : null,
                BCSName: dataJson.BCS ? dataJson.BCS.BCSName : null,
                ResponsibilityStaffName: dataJson.Staff
                    ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                    : null,
            };
        }

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
                reject(ErrorNotFound(error));
            }
        });
    },

    insert(data) {
        return new Promise(async (resolve, reject) => {
            try {
                //check เงื่อนไขตรงนี้ได้
                data.createdAt = fn("GETDATE");

                const obj = new db(data);

                const checkDuplicate = await db.findOne({
                    where: {
                        AnimalID: data.AnimalID,
                        isRemove: 0,
                        AIID: data.AIID,
                        TimeNo: data.TimeNo,
                    },
                });

                if (checkDuplicate) {
                    throw new Error("Duplicate!");
                }

                const inserted = await obj.save();

                let productionStatusID = null;
                let embTransStatusId = null;
                if (obj.PregnancyCheckStatusID == 1) {
                    productionStatusID = 6;
                    embTransStatusId = 1;
                    embBirthStatusId = 2;
                } else if (obj.PregnancyCheckStatusID == 2) {
                    productionStatusID = 5;
                    embTransStatusId = 2;
                    embBirthStatusId = 1;
                } else {
                    productionStatusID = 3;
                    embTransStatusId = 99;
                    embBirthStatusId = 2;
                }

                await Animal.update(
                    { ProductionStatusID: productionStatusID },
                    { where: { AnimalID: obj.AnimalID } }
                );

                const ai = await AI.findByPk(data.AIID, {});

                const existingRecord = await IBeef_PAR.findOne({
                    where: {
                        PAR: ai.PAR,
                        AnimalID: data.AnimalID,
                    },
                });

                if (existingRecord) {
                    // Update existing record
                    await IBeef_PAR.update(
                        {
                            ProductionStatusID: productionStatusID,
                            LasActivityDate: fn("GETDATE"),
                            update_by: "SYSTEM",
                        },
                        {
                            where: {
                                PAR: ai.PAR,
                                AnimalID: data.AnimalID,
                            },
                        }
                    );
                } else {
                    // Create new record
                    await IBeef_PAR.create({
                        PAR: ai.PAR,
                        ProductionStatusID: productionStatusID,
                        AnimalID: data.AnimalID,
                        LasActivityDate: fn("GETDATE"),
                        create_by: "SYSTEM",
                        create_date: fn("GETDATE"),
                    });
                }

                let res = methods.findById(inserted.PregnancyCheckupID);

                if (inserted.TransferEmbryoID != null) {
                    // EmbryoID
                    let Temb = await TransferEmbryo.findByPk(
                        inserted.TransferEmbryoID,
                        {
                            include: { all: true, required: false },
                        }
                    );

                    await axios.post(
                        "https://biotech.ztidev.com/ex-serviceapi/api/v1/Embryo/updateStatusEmbryo",
                        {
                            birthDate: null,
                            embBirthStatusId: embBirthStatusId,
                            embTransStatusId: embTransStatusId,
                            embryoId: Temb.Embryo.EmbryoNumber,
                        }
                    );
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
                data.PregnancyCheckupID = parseInt(id);

                data.updatedAt = fn("GETDATE");

                data.createdAt = undefined;
                await db.update(data, { where: { PregnancyCheckupID: id } });

                let productionStatusID = null;
                let embTransStatusId = null;
                if (obj.PregnancyCheckStatusID == 1) {
                    productionStatusID = 6;
                    embTransStatusId = 1;
                    embBirthStatusId = 2;
                } else if (obj.PregnancyCheckStatusID == 2) {
                    productionStatusID = 5;
                    embTransStatusId = 2;
                    embBirthStatusId = 1;
                } else {
                    productionStatusID = 3;
                    embTransStatusId = 99;
                    embBirthStatusId = 2;
                }

                await Animal.update(
                    {
                        ProductionStatusID: productionStatusID,
                        updatedAt: fn("GETDATE"),
                    },
                    { where: { AnimalID: obj.AnimalID } }
                );

                let res = methods.findById(data.PregnancyCheckupID);

                resolve(res);
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },

    delete(id, UpdatedUserID) {
        return new Promise(async (resolve, reject) => {
            try {
                const obj = await db.findByPk(id);
                if (!obj) reject(ErrorNotFound("id: not found"));

                if (obj) {
                    const gb = await GiveBirth.findOne({
                        where: { AIID: obj.AIID, isRemove: 0 },
                    });

                    const abort = await AbortCheckup.findOne({
                        where: { AIID: obj.AIID, isRemove: 0 },
                    });

                    if (gb || abort) {
                        reject(
                            ErrorNotFound(
                                "ไม่สามารถลบการตรวจท้องได้ เนื่องจากมีกิจกรรมภายใต้การตรวจท้อง"
                            )
                        );
                        return;
                    }
                }

                await db.update(
                    {
                        isRemove: 1,
                        isActive: 0,
                        updatedAt: fn("GETDATE"),
                        UpdatedUserID: Number(UpdatedUserID),
                    },
                    {
                        where: {
                            AIID: obj.AIID,
                            AnimalID: obj.AnimalID,
                            TimeNo: obj.TimeNo,
                        },
                    }
                    //   { where: { PregnancyCheckupID: id } }
                );

                if (obj.TimeNo == 1) {
                    await Animal.update(
                        {
                            ProductionStatusID: 4,
                            updatedAt: fn("GETDATE"),
                            UpdatedUserID: Number(UpdatedUserID),
                        },
                        {
                            where: {
                                AnimalID: obj.AnimalID,
                            },
                        }
                    );
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
};

module.exports = { ...methods };
