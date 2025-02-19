const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models/Staff"),
    { Op, query, fn } = require("sequelize");

const Sequelize = require("sequelize"),
    { sequelize } = require("../configs/databases");

const User = require("../models/User");
const Organization = require("../models/Organization");
const Province = require("../models/Province");
const AIZone = require("../models/AIZone");
// const fetch = require("node-fetch");

const CardRequestLog = require("../models/CardRequestLog");
const Staff = require("../models/Staff");
const Position = require("../models/Position");
const axios = require("axios");

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
        let user = null;
        // if (req.query.GetedUserID) {
        //   user = await User.findByPk(req.query.GetedUserID, {
        //     include: [
        //       {
        //         model: Staff,
        //         as: "Staff",
        //         include: [{ model: Organization, as: "Organization" }],
        //       },
        //     ],
        //   });
        // }

        if (req.query.StaffOrganizationID) {
            let org = await Organization.findByPk(
                req.query.StaffOrganizationID,
                {
                    include: [
                        {
                            model: Province,
                            as: "Province",
                        },
                    ],
                }
            );

            let province = await Province.findAll({
                where: { AIZoneID: org.Province.AIZoneID },
            });

            let res5 = [];
            province.map((p) => {
                res5.push(p.ProvinceID);
            });

            let org1 = await Organization.findAll({
                where: { OrganizationProvinceID: { [Op.in]: res5 } },
            });

            let res6 = [];
            org1.map((r) => {
                res6.push(r.OrganizationID);
            });

            $where["StaffOrganizationID"] = {
                [Op.in]: res6,
            };
        }

        if (req.query.OrganizationID) {
            $where["StaffOrganizationID"] = req.query.OrganizationID;
        }

        if (req.query.StaffNumber) {
            $where["StaffNumber"] = {
                [Op.like]: "%" + req.query.StaffNumber + "%",
            };
        }

        if (req.query.StaffStatus) {
            $where["StaffStatus"] = {
                [Op.like]: "%" + req.query.StaffStatus + "%",
            };
        }

        if (req.query.StaffIdentificationNumber)
            $where["StaffIdentificationNumber"] = {
                [Op.like]:
                    "%" +
                    req.query.StaffIdentificationNumber.replaceAll("-", "") +
                    "%",
            };

        if (req.query.StaffTitleID)
            $where["StaffTitleID"] = req.query.StaffTitleID;

        if (req.query.StaffGivenName)
            $where["StaffGivenName"] = {
                [Op.like]: "%" + req.query.StaffGivenName + "%",
            };

        if (req.query.StaffSurname)
            $where["StaffSurname"] = {
                [Op.like]: "%" + req.query.StaffSurname + "%",
            };

        if (req.query.GenderID)
            $where["StaffGenderID"] = req.query.StaffGenderID;
        if (req.query.StaffMarriedStatusID)
            $where["StaffMarriedStatusID"] = req.query.StaffMarriedStatusID;
        if (req.query.StaffPositionTypeID)
            $where["StaffPositionTypeID"] = req.query.StaffPositionTypeID;
        if (req.query.StaffPositionID)
            $where["StaffPositionID"] = Number(req.query.StaffPositionID);

        //   ที่ตั้งของหน่วยงาน
        let $whereOrganization = {};
        if (req.query.StaffProvinceID) {
            $whereOrganization["OrganizationProvinceID"] = Number(
                req.query.StaffProvinceID
            );
        }

        if (req.query.OrganizationAiZoneID) {
            $whereOrganization["OrganizationAiZoneID"] = Number(
                req.query.OrganizationAiZoneID
            );
        }

        if (req.query.OrganizationZoneID) {
            $whereOrganization["OrganizationZoneID"] = Number(
                req.query.OrganizationZoneID
            );
        }

        if (req.query.StaffAmphurID) {
            $whereOrganization["OrganizationAmphurID"] = Number(
                req.query.StaffAmphurID
            );
        }

        if (req.query.StaffTumbolID) {
            $whereOrganization["OrganizationTumbolID"] = Number(
                req.query.StaffTumbolID
            );
        }

        if (req.query.StaffEmail)
            $where["StaffEmail"] = {
                [Op.like]: "%" + req.query.StaffEmail + "%",
            };

        if (req.query.StaffStartDate) {
            $where[Op.or] = [
                {
                    StaffStartDate: {
                        [Op.between]: [
                            req.query.StaffStartDate,
                            req.query.StaffEndDate,
                        ],
                    },
                },
                {
                    StaffEndDate: {
                        [Op.between]: [
                            req.query.StaffStartDate,
                            req.query.StaffEndDate,
                        ],
                    },
                },
            ];
        }

        if (req.query.isActive) $where["isActive"] = req.query.isActive;
        $where["isActive"] = 1;
        if (req.query.CreatedUserID)
            $where["CreatedUserID"] = req.query.CreatedUserID;
        if (req.query.UpdatedUserID)
            $where["UpdatedUserID"] = req.query.UpdatedUserID;

        $where["isRemove"] = 0;
        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        const queryOrganization =
            Object.keys($whereOrganization).length > 0
                ? { where: $whereOrganization }
                : {};

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

        let include = [
            {
                association: "Title",
                attributes: ["TitleID", "TitleName"],
                required: false,
            },
            {
                association: "Gender",
                attributes: ["GenderID", "GenderName"],
                required: false,
            },
            {
                association: "MarriedStatus",
                attributes: ["MarriedStatusID", "MarriedStatusName"],
                required: false,
            },
            {
                association: "PositionType",
                attributes: ["PositionTypeID", "PositionTypeName"],
                required: false,
            },
            {
                association: "Position",
                attributes: ["PositionID", "PositionName"],
                required: false,
            },
            {
                association: "Tumbol",
                attributes: ["TumbolID", "TumbolName"],
                required: false,
            },
            {
                association: "Amphur",
                attributes: ["AmphurID", "AmphurName"],
                required: false,
            },
            {
                association: "Province",
                attributes: ["ProvinceID", "ProvinceName"],
                required: false,
            },
            {
                association: "Education",
                attributes: ["EducationID", "EducationName"],
                required: false,
            },
            {
                association: "Organization",
                attributes: [
                    "OrganizationID",
                    "OrganizationCode",
                    "OrganizationName",
                ],
                ...queryOrganization,
                required: true,
            },
        ];

        if (req.query.includeAll) {
            if (req.query.includeAll == "false") {
                include = [
                    {
                        association: "Title",
                        attributes: ["TitleID", "TitleName"],
                        required: false,
                    },
                ];

                if (req.query.includeOrganization == "true") {
                    include = [
                        {
                            association: "Title",
                            attributes: ["TitleID", "TitleName"],
                            required: false,
                        },
                        {
                            association: "Organization",
                            attributes: [
                                "OrganizationID",
                                "OrganizationCode",
                                "OrganizationName",
                            ],
                            ...queryOrganization,
                            // where:{
                            //     OrganizationProvinceID: 92
                            // },
                            required: true,

                            //   association: "Organization",
                            //   attributes: [
                            //     "OrganizationID",
                            //     "OrganizationCode",
                            //     "OrganizationName",
                            //     "OrganizationProvinceID",
                            //   ],
                            //   ...queryOrganization,
                            //   required: true,
                        },
                    ];
                }
            } else {
            }
        } else {
        }

        console.log(include);
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
                    db.findAll(_q.query),
                    //   Staff.findAll({ model: Organization, as: "Organization" }),
                    delete _q.query.include,
                    (_q.query["distinct"] = true),
                    1,
                ])
                    .then((result) => {
                        let rows = result[0];
                        let count = rows.length;

                        resolve({
                            total: count,
                            lastPage: Math.ceil(count / limit),
                            currPage: req.query.page ? +req.query.page : 1,
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

    async findCount(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        const _q = await methods.scopeSearch(req, limit, offset);
        return new Promise(async (resolve, reject) => {
            try {
                Promise.all([
                    db.findAll({ ..._q.query, limit: limit, offset: offset }),
                    db.count({ ..._q.query }),
                ])
                    .then((result) => {
                        let rows = result[0];
                        let count = result[1];

                        resolve({
                            rows: rows,
                            totalPage: Math.ceil(count / limit),
                            totalData: count,
                            currPage: +req.query.page || 1,
                            total: count,
                            lastPage: Math.ceil(result[1].length / limit),
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

                if (data.StaffNumber == undefined) {
                    console.log(data.StaffNumber);
                    data.StaffNumber = null;
                }

                let checkStaff = await Staff.findOne({
                    where: {
                        staffOrganizationID: data.StaffOrganizationID,
                        StaffNumber: data.StaffNumber,
                        StaffIdentificationNumber:
                            data.StaffIdentificationNumber,
                        isRemove: 0,
                    },
                });

                if (checkStaff) {
                    throw new Error("Duplicate Staff");
                }

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
                            let number =
                                4 - parseInt(String(codeLastest).length);

                            if (number != 0) {
                                codeLastest = String(codeLastest);
                                for (let i = 1; i <= number; i++) {
                                    codeLastest = "0" + codeLastest;
                                }
                            }
                        } else {
                            codeLastest = "0001";
                        }
                        if (data.StaffNumber == "undefined") {
                            data.StaffNumber = null;
                        }

                        // data.StaffNumber = prefix + codeLastest;
                    }
                }

                data.createdAt = fn("GETDATE");

                function cleanMobileNumber(input) {
                    return input.replace(/[^0-9]/g, "");
                }

                if (data.StaffMobilePhone != null) {
                    data.StaffMobilePhone = cleanMobileNumber(
                        data.StaffMobilePhone
                    );
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

                data.updatedAt = fn("GETDATE");
                // data.UpdatedUserID = req.user.id;

                // StaffStatus
                // if (data.StaffStatus == "ลาออก") {
                //   data.CardStatus = 0;
                // }
                // if (data.StaffStatus == "เกษียณ") {
                //   data.CardStatus = 0;
                // } else if (data.CardStartDate == null || data.CardExpireDate == null) {
                //   data.CardStatus = 2;
                // } else if (dayjs(data.CardExpireDate).isBefore(dayjs()) == true) {
                //   data.CardStatus = 3;
                // } else {
                //   console.log(dayjs(data.CardExpireDate).isBefore(dayjs()));
                //   data.CardStatus = 1;

                function cleanMobileNumber(input) {
                    return input.replace(/[^0-9]/g, "");
                }

                if (data.StaffMobilePhone != null) {
                    data.StaffMobilePhone = cleanMobileNumber(
                        data.StaffMobilePhone
                    );
                }
                // }

                if (
                    data.StaffStatus == "ลาออก" ||
                    data.StaffStatus == "เกษียณ"
                ) {
                    data.isActive = 0;
                }

                await db.update(data, {
                    where: { StaffID: id },
                    individualHooks: true,
                });

                if (
                    data.StaffStatus == "ลาออก" ||
                    data.StaffStatus == "เกษียณ"
                ) {
                    const objUser = await db.findOne({
                        where: { StaffID: data.StaffID },
                    });

                    console.log(objUser);

                    if (objUser) {
                        await User.update(
                            {
                                isActive: 0,
                            },
                            {
                                where: { StaffID: objUser.StaffID },
                            }
                        );
                    }
                }

                let res = methods.findById(data.StaffID);

                // await User.update(data, { where: { id: id }, individualHooks: true });
                resolve(res);
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },

    generateStaffNumber(StaffID, isCard) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await Staff.findOne({ where: { StaffID: StaffID } });
                // Generate StaffNumber
                let org = await Organization.findOne({
                    where: { OrganizationID: data.StaffOrganizationID },
                });

                let province = await Province.findOne({
                    //   where: { ProvinceID: org.OrganizationProvinceID },
                    include: { model: AIZone, as: "AIZone" },
                });

                let text1 = province.AIZone.AIZoneENCode;
                if (isCard == 1) {
                    text1 = "F";
                }
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

                let StaffNumber = prefix + codeLastest;

                resolve({
                    StaffNumber: StaffNumber,
                });
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

                await db.update(
                    {
                        isRemove: 1,
                        isActive: 0,
                        updatedAt: fn("GETDATE"),
                        UpdatedUserID: Number(UpdatedUserID),
                    },
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

                obj.StaffImage =
                    config.UploadPath + "/images/staff/" + filename;
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
                let obj = await db.findOne({
                    where: {
                        StaffNumber: StaffNumber.toString(),
                        isRemove: 0,
                        isActive: 1,
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


                if (!obj) {
                    await axios
                        .get(
                            //   "hhttps://bblp-dairy.dld.go.th/api2/staff/listAllStaff?text_search=" +
                            "https://bblp-dairy.dld.go.th/api2/staff/listAllStaff?text_search=" +
                                StaffNumber.toString() +
                                "&limit=1&page=1"
                        )
                        .then(async (response) => {
                            let { items } = response.data;

                            console.log(StaffNumber.toString())

                            console.log(items);

                            if (items.length > 0) {
                                let staffNew = new Staff();

                                if (items[0].staffStatus == 1) {
                                    staffNew.StaffNumber = items[0].staffId;
                                    staffNew.StaffIdentificationNumber =
                                        items[0].staffIdCard;

                                    let dep = await Organization.findOne({
                                        where: {
                                            OrganizationCode:
                                                items[0].staffOrgId,
                                        },
                                    });
                                    if (dep) {
                                        staffNew.StaffOrganizationID =
                                            dep.OrganizationID;
                                    }

                                    staffNew.StaffTitleID =
                                        items[0].TitleName == "นางสาว"
                                            ? 4
                                            : items[0].TitleName == "นาย"
                                            ? 3
                                            : 5;
                                    staffNew.StaffGivenName =
                                        items[0].staffFName;
                                    staffNew.StaffSurname = items[0].staffLName;
                                    staffNew.StaffGenderID = items[0].staffSex;
                                    staffNew.StaffBirthdate =
                                        items[0].staffBirthdate;
                                    staffNew.StaffStatus =
                                        items[0].staff_status_name;
                                    staffNew.StaffAddress =
                                        items[0].staffAddress;
                                    staffNew.StaffMoo = items[0].staffMoo;
                                    staffNew.StaffVillageName =
                                        items[0].staffVillageName;
                                    staffNew.StaffFloor = items[0].staffFloor;
                                    staffNew.StaffStreet = items[0].staffStreet;
                                    staffNew.StaffSubLane =
                                        items[0].staffSubLane;
                                    staffNew.StaffLane = items[0].staffLane;
                                    staffNew.StaffTumbolID =
                                        items[0].staffTumbolCode;
                                    staffNew.StaffAmphurID =
                                        items[0].staffAmphurCode;
                                    staffNew.StaffProvinceID =
                                        items[0].staffProvinceCode;
                                    staffNew.StaffZipCode =
                                        items[0].staffZipCode;
                                    staffNew.StaffEmail =
                                        items[0].staffEmailAddress;
                                    staffNew.StaffTelephone =
                                        items[0].staffTelNo;
                                    staffNew.StaffMobilePhone =
                                        items[0].staffMobileNo;
                                    staffNew.StaffEducationID =
                                        items[0].staffEducation;
                                    staffNew.StaffGraduateYear =
                                        items[0].staffGraduateYear;
                                    staffNew.StaffPositionTypeID =
                                        items[0].staffPositionLevel;
                                    staffNew.StaffMarriedStatusID = 6;

                                    let position = null;

                                    if (
                                        items[0].emStaffPosition != "" &&
                                        items[0].emStaffPosition != " " &&
                                        items[0].emStaffPosition != null
                                    ) {
                                        position = await Position.findOne({
                                            where: {
                                                PositionCode:
                                                    items[0].emStaffPosition,
                                            },
                                        });
                                    }

                                    if (position != null) {
                                        staffNew.StaffPositionID =
                                            position.PositionID;
                                    } else {
                                        staffNew.StaffPositionID = 5;
                                    }
                                    staffNew.CreatedUserID = 1;
                                    staffNew.createdAt = Date.now();
                                    await staffNew.save();

                                    let res = await this.findById(
                                        staffNew.StaffID
                                    );

                                    resolve(res);
                                } else {
                                    // items[0].staff_status_name
                                    resolve({
                                        data: null,
                                        message:
                                            "สถานะเจ้าหน้าที่ ลาออกหรือเกษียณ",
                                    });
                                }
                            } else {
                                resolve(false);
                            }
                        })
                        .catch((err) => {
                            resolve(false);
                            console.log(err);
                        });
                } else {
                    let res = { ...obj.toJSON() };
                    if (obj.StaffPositionID == null) {
                        await axios
                            .get(
                                "https://bblp-dairy.dld.go.th/api2/staff/listAllStaff?text_search=" +
                                    StaffNumber.toString() +
                                    "&limit=1&page=1"
                            )
                            .then(async (response) => {
                                let { items } = response.data;

                                if (items.length > 0) {
                                    let staffEdit = await db.findByPk(
                                        obj.StaffID
                                    );

                                    //   let position = await Position.findOne({
                                    //     where: { PositionCode: items[0].emStaffPosition },
                                    //   });

                                    //   if (Position) {
                                    //     staffEdit.StaffPositionID = position.PositionID;
                                    //   }
                                    let position = null;
                                    if (
                                        items[0].emStaffPosition != "" &&
                                        items[0].emStaffPosition != " " &&
                                        items[0].emStaffPosition != null
                                    ) {
                                        position = await Position.findOne({
                                            where: {
                                                PositionCode:
                                                    items[0].emStaffPosition,
                                            },
                                        });
                                    }

                                    if (position != null) {
                                        staffEdit.StaffPositionID =
                                            position.PositionID;
                                    } else {
                                        staffEdit.StaffPositionID = 5;
                                    }

                                    let dep = await Organization.findOne({
                                        where: {
                                            OrganizationCode:
                                                items[0].staffOrgId,
                                        },
                                    });
                                    if (dep) {
                                        staffEdit.StaffOrganizationID =
                                            dep.OrganizationID;
                                    }

                                    await staffEdit.save();

                                    let res1 = await this.findById(
                                        staffNew.StaffID
                                    );
                                    res = { ...res1.toJSON() };
                                } else {
                                    resolve(res);
                                }
                            })
                            .catch((err) => {
                                resolve(res);
                                console.log(err);
                            });
                    }

                    if (res.CardRequestLog.length != 0) {
                        res.CardRequestLog = {
                            ...res.CardRequestLog[0].toJSON(),
                        };
                    }

                    resolve(res);
                }
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    findByStaffNumber2(StaffNumber) {
        return new Promise(async (resolve, reject) => {
            try {
                let obj = await db.findOne({
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

                if (!obj) {
                    await axios
                        .get(
                            //   "http://164.115.24.111/api2/staff/listAllStaff?text_search=" +
                            "https://bblp-dairy.dld.go.th/api2/staff/listAllStaff?text_search=" +
                                StaffNumber.toString() +
                                "&limit=1&page=1"
                        )
                        .then(async (response) => {
                            let { items } = response.data;

                            if (items.length > 0) {
                                let staffNew = new Staff();

                                staffNew.StaffNumber = items[0].staffId;
                                staffNew.StaffIdentificationNumber =
                                    items[0].staffIdCard;

                                let dep = await Organization.findOne({
                                    where: {
                                        OrganizationCode: items[0].staffOrgId,
                                    },
                                });
                                if (dep) {
                                    staffNew.StaffOrganizationID =
                                        dep.OrganizationID;
                                }

                                staffNew.StaffTitleID =
                                    items[0].TitleName == "นางสาว"
                                        ? 4
                                        : items[0].TitleName == "นาย"
                                        ? 3
                                        : 5;
                                staffNew.StaffGivenName = items[0].staffFName;
                                staffNew.StaffSurname = items[0].staffLName;
                                staffNew.StaffGenderID = items[0].staffSex;
                                staffNew.StaffBirthdate =
                                    items[0].staffBirthdate;
                                staffNew.StaffStatus =
                                    items[0].staff_status_name;
                                staffNew.StaffAddress = items[0].staffAddress;
                                staffNew.StaffMoo = items[0].staffMoo;
                                staffNew.StaffVillageName =
                                    items[0].staffVillageName;
                                staffNew.StaffFloor = items[0].staffFloor;
                                staffNew.StaffStreet = items[0].staffStreet;
                                staffNew.StaffSubLane = items[0].staffSubLane;
                                staffNew.StaffLane = items[0].staffLane;
                                staffNew.StaffTumbolID =
                                    items[0].staffTumbolCode;
                                staffNew.StaffAmphurID =
                                    items[0].staffAmphurCode;
                                staffNew.StaffProvinceID =
                                    items[0].staffProvinceCode;
                                staffNew.StaffZipCode = items[0].staffZipCode;
                                staffNew.StaffEmail =
                                    items[0].staffEmailAddress;
                                staffNew.StaffTelephone = items[0].staffTelNo;
                                staffNew.StaffMobilePhone =
                                    items[0].staffMobileNo;
                                staffNew.StaffEducationID =
                                    items[0].staffEducation;
                                staffNew.StaffGraduateYear =
                                    items[0].staffGraduateYear;
                                staffNew.StaffPositionTypeID =
                                    items[0].staffPositionLevel;
                                staffNew.StaffMarriedStatusID = 6;

                                let position = null;

                                if (
                                    items[0].emStaffPosition != "" &&
                                    items[0].emStaffPosition != " " &&
                                    items[0].emStaffPosition != null
                                ) {
                                    position = await Position.findOne({
                                        where: {
                                            PositionCode:
                                                items[0].emStaffPosition,
                                        },
                                    });
                                }

                                if (position != null) {
                                    staffNew.StaffPositionID =
                                        position.PositionID;
                                } else {
                                    staffNew.StaffPositionID = 5;
                                }
                                staffNew.CreatedUserID = 1;
                                staffNew.createdAt = Date.now();
                                await staffNew.save();

                                let res = await this.findById(staffNew.StaffID);

                                resolve(res);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch((err) => {
                            resolve(false);
                            console.log(err);
                        });
                } else {
                    let res = { ...obj.toJSON() };
                    if (obj.StaffPositionID == null) {
                        await axios
                            .get(
                                "https://bblp-dairy.dld.go.th/api2/staff/listAllStaff?text_search=" +
                                    StaffNumber.toString() +
                                    "&limit=1&page=1"
                            )
                            .then(async (response) => {
                                let { items } = response.data;

                                if (items.length > 0) {
                                    let staffEdit = await db.findByPk(
                                        obj.StaffID
                                    );

                                    //   let position = await Position.findOne({
                                    //     where: { PositionCode: items[0].emStaffPosition },
                                    //   });

                                    //   if (Position) {
                                    //     staffEdit.StaffPositionID = position.PositionID;
                                    //   }
                                    let position = null;
                                    if (
                                        items[0].emStaffPosition != "" &&
                                        items[0].emStaffPosition != " " &&
                                        items[0].emStaffPosition != null
                                    ) {
                                        position = await Position.findOne({
                                            where: {
                                                PositionCode:
                                                    items[0].emStaffPosition,
                                            },
                                        });
                                    }

                                    if (position != null) {
                                        staffEdit.StaffPositionID =
                                            position.PositionID;
                                    } else {
                                        staffEdit.StaffPositionID = 5;
                                    }

                                    let dep = await Organization.findOne({
                                        where: {
                                            OrganizationCode:
                                                items[0].staffOrgId,
                                        },
                                    });
                                    if (dep) {
                                        staffEdit.StaffOrganizationID =
                                            dep.OrganizationID;
                                    }

                                    await staffEdit.save();

                                    let res1 = await this.findById(
                                        staffNew.StaffID
                                    );
                                    res = { ...res1.toJSON() };
                                } else {
                                    resolve(false);
                                }
                            })
                            .catch((err) => {
                                resolve(false);
                                console.log(err);
                            });
                    }

                    if (res.CardRequestLog.length != 0) {
                        res.CardRequestLog = {
                            ...res.CardRequestLog[0].toJSON(),
                        };
                    }

                    resolve(res);
                }
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

                function cleanMobileNumber(input) {
                    return input.replace(/[^0-9]/g, "");
                }

                if (data.StaffMobilePhone != null) {
                    data.StaffMobilePhone = cleanMobileNumber(
                        data.StaffMobilePhone
                    );
                }

                await db.update(
                    {
                        StaffMobilePhone: data.StaffMobilePhone,
                        updatedAt: fn("GETDATE"),
                    },
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

    async selection(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        const _q = await methods.scopeSearch(req, limit, offset);

        return new Promise(async (resolve, reject) => {
            try {
                Promise.all([
                    db.findAll({ ..._q.query, limit: limit, offset: offset }),
                ])
                    .then(async (result) => {
                        let rows = result[0];

                        rows = rows.map((data) => {
                            return {
                                StaffID: data.StaffID,
                                StaffNumber: data.StaffNumber,
                                StaffGivenName: data.StaffGivenName,
                                StaffSurname: data.StaffSurname,
                                StaffFullName:
                                    data.StaffNumber +
                                    ", " +
                                    data.StaffGivenName +
                                    " " +
                                    data.StaffSurname,
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

    async exportExcel(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        const _q = await methods.scopeSearch(req, limit, offset);
        return new Promise(async (resolve, reject) => {
            try {
                Promise.all([db.findAll({ ..._q.query })])
                    .then((result) => {
                        let rows = result[0].map((x) => {
                            return {
                                รหัสบุคลากร: x.StaffNumber,
                                ชื่อ: x.StaffGivenName,
                                นามสกุล: x.StaffSurname,
                                หน่วยงานที่สังกัด:
                                    x.Organization.OrganizationName,
                                ประเภทบุคลากร: x.PositionType?.PositionTypeName,
                                ตำแหน่งงาน: x.Position?.PositionName,
                                อีเมล: x.StaffEmail,
                                วันที่เริ่มทำงาน: x.StaffStartDate
                                    ? dayjs(x.StaffStartDate)
                                          .locale("th")
                                          .format("DD/MM/BBBB")
                                    : "",
                                วันสิ้นสุดการทำงาน: x.StaffEndDate
                                    ? dayjs(x.StaffEndDate)
                                          .locale("th")
                                          .format("DD/MM/BBBB")
                                    : "",
                            };
                        });

                        resolve({
                            rows: rows,
                            count: rows.length,
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
