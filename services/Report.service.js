const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models"),
    { Op, literal, fn, DataTypes, col } = require("sequelize"),
    sequelize = require("sequelize");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

const Organization = require("../models/Organization");
const OrganizationType = require("../models/OrganizationType");
const Staff = require("../models/Staff");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");
const AnimalStatus = require("../models/AnimalStatus");
const AnimalSex = require("../models/AnimalSex");
const User = require("../models/User");
const AnimalType = require("../models/AnimalType");
const ProductionStatus = require("../models/ProductionStatus");
const AI = require("../models/AI");
const AIZone = require("../models/AIZone");
const Province = require("../models/Province");
const Amphur = require("../models/Amphur");
const Tumbol = require("../models/Tumbol");
const Semen = require("../models/Semen");
const Project = require("../models/Project");
const ProjectToAnimalType = require("../models/ProjectToAnimalType");
const PregnancyCheckup = require("../models/PregnancyCheckup");
const PregnancyCheckStatus = require("../models/PregnancyCheckStatus");
const GiveBirth = require("../models/GiveBirth");
const AbortCheckup = require("../models/AbortCheckup");
const AnimalBreed = require("../models/AnimalBreed");
const ProgressCheckup = require("../models/ProgressCheckup");
const TransferEmbryo = require("../models/TransferEmbryo");
const Embryo = require("../models/Embryo");
const e = require("cors");
const GiveBirthHelp = require("../models/GiveBirthHelp");
const Reproduce = require("../models/Reproduce");
const _ = require("lodash");

const methods = {
    report1(req) {
        return new Promise(async (resolve, reject) => {
            try {
                // Search
                let $where = {};

                // ZoneID อ้างจากจังหวัด

                if (req.query.ProvinceID)
                    $where["FarmProvinceID"] = req.query.ProvinceID;

                if (req.query.AmphurID)
                    $where["FarmAmphurID"] = req.query.AmphurID;

                if (req.query.TumbolID)
                    $where["FarmTumbolID"] = req.query.TumbolID;

                $whereProvince = {};
                if (req.query.ZoneID)
                    $whereProvince["OrganizationZoneID"] =
                        req.query.OrganizationZoneID;

                if (req.query.AIZoneID)
                    $whereProvince["AIZoneID"] = req.query.AIZoneID;

                if (req.query.OrganizationID)
                    $where["OrganizationID"] = req.query.OrganizationID;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryProvince =
                    Object.keys($whereProvince).length > 0
                        ? { where: $whereProvince }
                        : {};

                // รายงาน จำนวนตาม animal_status แม่โค โคสาว ลูกโค (เพศเมียทั้งหมด)
                // และตารางเป็นรายการฟาร์ม จำนวนตาม animal_status แม่โค โคสาว ลูกโค (เพศเมียทั้งหมด) และรวม

                let AnimalTypeID = JSON.parse(req.query.AnimalTypeID);
                let AnimalStatusID = [];

                if (AnimalTypeID.includes(1) || AnimalTypeID.includes(2)) {
                    AnimalStatusID = [5, 3, 2, 1];
                } else if (
                    AnimalTypeID.includes(3) ||
                    AnimalTypeID.includes(4)
                ) {
                    AnimalStatusID = [10, 8, 7, 6];
                } else if (
                    AnimalTypeID.includes(17) ||
                    AnimalTypeID.includes(18)
                ) {
                    AnimalStatusID = [15, 13, 12, 11];
                } else {
                }

                let mom = 0;
                let young = 0;
                let child2 = 0;
                let child = 0;
                let total = 0;

                let farms = await Farm.findAll({
                    ...query,
                    FarmAnimalType: 1,
                    include: { model: Province, as: "Province", queryProvince },
                });

                let animal = await Animal.findAll({
                    where: {
                        AnimalSexID: 2,
                        AnimalTypeID: { [Op.in]: AnimalTypeID },
                    },
                });

                farms = await Promise.all(
                    farms.map(async (e) => {
                        let f = {
                            FarmIdentificationNumber:
                                e.FarmIdentificationNumber,
                            FarmName: e.FarmName,
                            mom: 0,
                            young: 0,
                            child2: 0,
                            child: 0,
                            total: 0,
                        };

                        // แม่พันธุ์

                        let animalFarm = animal.filter((x) => {
                            return x.FarmID == e.FarmID;
                        });

                        let animalStatus1 = [];
                        let animalStatus2 = [];
                        let animalStatus3 = [];
                        let animalStatus4 = [];

                        if (animalFarm.length != 0) {
                            animalStatus1 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[0];
                            });

                            animalStatus2 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[1];
                            });

                            animalStatus3 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[2];
                            });

                            animalStatus4 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[3];
                            });
                        }

                        f.mom = animalStatus1.length;
                        f.young = animalStatus2.length;
                        f.child2 = animalStatus3.length;
                        f.child = animalStatus4.length;

                        f.total = f.mom + f.young + f.child2 + f.child;

                        mom += f.mom;
                        young += f.young;
                        child2 += f.child2;
                        child += f.child;
                        total += f.total;

                        return f;
                    })
                );

                let data = {
                    Mom: mom,
                    Young: young,
                    Child2: child2,
                    Child: child,
                    Total: total,
                    Farms: farms,
                    FarmCount: farms.length,
                };
                resolve(data);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report11(req) {
        // report ทะเบียนประวัติโคเพศเมีย
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                // ตาราง animal
                const animal = await Animal.findAll({
                    attributes: {
                        include: [
                            [
                                literal(`(
              SELECT Weight
              FROM ProgressCheckup
              WHERE
                ProgressCheckup.AnimalID = Animal.AnimalID
              ORDER BY ProgressCheckupID DESC
              LIMIT 1
          )`),
                                "Weight",
                            ],
                            [
                                literal(`(
              SELECT Height
              FROM ProgressCheckup
              WHERE
                ProgressCheckup.AnimalID = Animal.AnimalID
              ORDER BY ProgressCheckupID DESC
              LIMIT 1
          )`),
                                "Height",
                            ],
                            [
                                literal(`(
              SELECT SemenNumber
              FROM Semen
              WHERE
                Semen.BreederID = Animal.AnimalID
              ORDER BY SemenID DESC
              LIMIT 1
          )`),
                                "SemenNumber",
                            ],
                        ],
                    },
                    where: { animalSexID: 2 },
                    include: [
                        {
                            model: Farm,
                            as: "AnimalFarm",
                            ...query,
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed1",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed2",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed3",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed4",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed5",
                        },
                        {
                            model: Animal,
                            as: "AnimalFather",
                        },
                        {
                            model: Animal,
                            as: "AnimalMother",
                        },
                        {
                            model: AnimalStatus,
                            as: "AnimalStatus",
                        },
                    ],
                });
                let res = [];
                animal.forEach((el) => {
                    res.push({
                        AnimalID: el.AnimalID,
                        AnimalEarID: el.AnimalEarID,
                        SemenNumber: el.dataValues.SemenNumber,
                        AnimalName: el.AnimalName,
                        AnimalBreedAll: el.AnimalBreedAll,
                        ThaiAnimalBirthDate: el.ThaiAnimalBirthDate,
                        AnimalWeight: el.dataValues.Weight
                            ? el.dataValues.Weight
                            : "-",
                        AnimalHeight: el.dataValues.Height
                            ? el.dataValues.Height
                            : "-",
                        AnimalFather: el.AnimalFather
                            ? el.AnimalFather.AnimalEarID
                            : "-",
                        AnimalMother: el.AnimalMother
                            ? el.AnimalMother.AnimalEarID
                            : "-",
                        AnimalStatusName: el.AnimalStatus?.AnimalStatusName,
                        AnimalSource:
                            el.AnimalSource == "BORN"
                                ? "เกิดในฟาร์ม"
                                : el.AnimalSource == "BUY"
                                ? "ซื้อมา"
                                : el.AnimalSource == "TRANSFER"
                                ? "ย้ายมา"
                                : "-",
                    });
                });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report2(req) {
        return new Promise(async (resolve, reject) => {
            try {
                // Search
                // ZoneID อ้างจากจังหวัด
                let $where = {};
                // if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;
                if (req.query.AnimalEarID)
                    $where["AnimalEarID"] = req.query.AnimalEarID;

                if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                query["include"] = [{ all: true, required: false }];

                let animal = await Animal.findOne({
                    ...query,
                });

                // animal = await Promise.all(
                //   animal.map(async (e) => {

                //   })
                // );
                let animalFather = {
                    AnimalEarID: "-",
                    AnimalBreedAll: "-",
                };

                if (animal.AnimalFatherID) {
                    animalFather = await Animal.findOne({
                        where: { AnimalID: animal.AnimalFatherID },
                        include: {
                            all: true,
                            required: false,
                        },
                    });
                }

                let animalMother = {
                    AnimalEarID: "-",
                    AnimalBreedAll: "-",
                };

                if (animal.AnimalMotherID) {
                    animalMother = await Animal.findOne({
                        where: { AnimalID: animal.AnimalMotherID },
                        include: {
                            all: true,
                            required: false,
                        },
                    });
                }

                //
                let ai = await AI.findAll({
                    where: { AnimalID: animal.AnimalID },
                    include: [
                        { model: Semen },
                        { model: GiveBirth },
                        { model: Staff },
                        {
                            model: PregnancyCheckup,
                            include: {
                                model: PregnancyCheckStatus,
                            },
                        },
                    ],
                });

                let AIrows = ai.map((data) => {
                    let dataJson = data.toJSON();
                    data = {
                        PAR: dataJson.PAR,
                        TimeNo: dataJson.TimeNo,
                        ThaiAIDate: dataJson.ThaiAIDate,
                        SemenNumber:
                            dataJson.Semen != null
                                ? dataJson.Semen?.SemenNumber
                                : null,
                        Dose: dataJson.Dose,
                        AIStatusName: dataJson.AIStatusName,
                        PregnancyCheckup: dataJson.PregnancyCheckups
                            ? dataJson.PregnancyCheckups[0]
                                ? dataJson.PregnancyCheckups[0].toJSON()
                                      .PregnancyCheckStatus
                                      .PregnancyCheckStatusName
                                : null
                            : null,
                        ThaiGiveBirthDate: dataJson.GiveBirth
                            ? dataJson.GiveBirth.ThaiGiveBirthDate
                            : null,
                        ChildGender: dataJson.GiveBirth
                            ? dataJson.GiveBirth.ChildGender
                            : null,
                        ResponsibilityStaffName: dataJson.Staff
                            ? `${dataJson.Staff.StaffNumber} ${dataJson.Staff.StaffGivenName}  ${dataJson.Staff.StaffSurname}`
                            : null,
                    };
                    return data;
                });

                let data = {
                    AnimalID: animal.AnimalID,
                    AnimalEarID: animal.AnimalEarID,
                    AnimalMicrochip: animal.AnimalMicrochip,
                    AnimalName: animal.AnimalName,
                    ThaiAnimalBirthDate: animal.ThaiAnimalBirthDate,
                    AnimalStatus: animal.AnimalStatus?.AnimalStatusName,
                    ProductionStatus: animal.ProductionStatus
                        ? animal.ProductionStatus.ProductionStatusName
                        : "-",
                    AnimalPar: animal.AnimalPar,
                    AnimalSource: animal.AnimalSource,
                    FarmName: animal.AnimalFarm.FarmName,
                    FarmIdentificationNumber:
                        animal.AnimalFarm.FarmIdentificationNumber,
                    AnimalBreedAll: animal.AnimalBreedAll,
                    AnimalFatherEarID: animalFather.AnimalEarID,
                    AnimalFatherBreedAll: animalFather.AnimalBreedAll,
                    AnimalMotherEarID: animalMother.AnimalEarID,
                    AnimalMotherBreedAll: animalMother.AnimalBreedAll,
                    ai: AIrows,

                    // ข้อมูลการผสม
                };
                resolve(data);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report3old(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};

                let provinceIDArr = [];
                const province = await Province.findAll({
                    where: { AIZoneID: req.query.AIZoneID },
                });

                province.forEach((p) => {
                    provinceIDArr.push(p.ProvinceID);
                });

                let organizationIDArr = [];
                const organization = await Organization.findAll({
                    where: {
                        OrganizationProvinceID: { [Op.in]: provinceIDArr },
                    },
                });

                organization.forEach((o) => {
                    organizationIDArr.push(o.OrganizationID);
                });

                // ตาราง staff,
                const staff = await Staff.findAll({
                    where: {
                        StaffOrganizationID: { [Op.in]: organizationIDArr },
                    },
                });

                let res = [];

                // if(){

                // }
                // date: {
                //   [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
                //  },

                // await Promise.all(

                let AIDate = {
                    [Op.ne]: null,
                };

                let AnimalCreatedDatetime = {
                    [Op.ne]: null,
                };

                let CheckupDate = {
                    [Op.ne]: null,
                };

                let GiveBirthDate = {
                    [Op.ne]: null,
                };

                if (req.query.StartDate) {
                    AIDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    AnimalCreatedDatetime = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    CheckupDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    GiveBirthDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                for (let s of staff) {
                    let AIWhere = {
                        ResponsibilityStaffID: s.StaffID,
                        AIDate: AIDate,
                    };

                    const ai = await AI.findAll({
                        where: AIWhere,
                    });

                    let AnimalWhere = {
                        CreatedUserID: s.StaffID,
                        CreatedDatetime: AnimalCreatedDatetime,
                    };

                    const animal = await Animal.findAll({
                        where: AnimalWhere,
                    });

                    let PregnancyCheckupWhere = {
                        ResponsibilityStaffID: s.StaffID,
                        CheckupDate: CheckupDate,
                    };

                    const pregnancyCheckup = await PregnancyCheckup.findAll({
                        where: PregnancyCheckupWhere,
                    });

                    let pregnancyStatus1 = pregnancyCheckup.filter(
                        (el, index) => {
                            return el.PregnancyCheckStatusID == 1;
                        }
                    );

                    const seen = new Set();
                    let uniqueAIs = ai.filter((el, index) => {
                        const duplicate = seen.has(el.AnimalID);
                        seen.add(el.AnimalID);
                        return !duplicate;
                    });

                    let percent = parseFloat(
                        (
                            (pregnancyStatus1.length * 100) /
                            pregnancyCheckup.length
                        ).toFixed(2)
                    );

                    let giveBirthWhere = {
                        ResponsibilityStaffID: s.StaffID,
                        GiveBirthDate: GiveBirthDate,
                    };

                    let giveBirth = await GiveBirth.findAll({
                        where: giveBirthWhere,
                    });

                    let childM = 0;
                    let childF = 0;

                    if (giveBirth) {
                        giveBirth.filter((el, index) => {
                            // ChildGender
                            if (el.ChildGender != null) {
                                let ChildGender = el.ChildGender.split(",");
                                for (let cg of ChildGender) {
                                    if (cg == "M") {
                                        childM = childM + 1;
                                    } else if (cg == "F") {
                                        childF = childF + 1;
                                    } else {
                                    }
                                }
                            }
                        });
                    }

                    res.push({
                        StaffNumber: s.StaffNumber,
                        StaffFullName: `${s.StaffGivenName} ${s.StaffSurname}`,
                        r1: uniqueAIs.length,
                        r2: ai.length,
                        r3: animal.length,
                        r4: pregnancyCheckup.length,
                        r5: pregnancyStatus1.length,
                        percent: percent,
                        childM: childM,
                        childF: childF,
                        childT: childM + childF,
                    });
                }

                // );

                // // ขึ้นข้อมูล จำนวนที่ผสม

                // // ZoneID อ้างจากจังหวัด
                // if (req.query.AnimalEarID)
                //   $where["AnimalEarID"] = req.query.AnimalEarID;

                // const query = Object.keys($where).length > 0 ? { where: $where } : {};

                // query["include"] = [
                //   {
                //     model: AnimalStatus,
                //   },
                //   {
                //     model: ProductionStatus,
                //   },
                //   {
                //     model: Farm,
                //   },
                // ];

                // let animal = await Animal.findOne({
                //   ...query,
                // });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report3old2(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let staff = [];

                if (req.query.StaffID) {
                    staff = await Staff.findAll({
                        where: {
                            StaffID: Number(req.query.StaffID),
                            isRemove: 0,
                            StaffStatus: {
                                [Op.and]: [
                                    {
                                        [Op.not]: "ลาออก",
                                    },
                                    {
                                        [Op.not]: "ตาย",
                                    },
                                ],
                            },
                        },
                        include: {
                            model: Organization,
                            as: "Organization",
                            required: true,
                        },
                    });
                } else {
                    let organizationIDArr = [];
                    let organization = [];
                    let $where = {};

                    if (req.query.OrganizationID) {
                        $where = {
                            OrganizationID: Number(req.query.OrganizationID),
                            isRemove: 0,
                        };
                    } else if (req.query.TumbolID) {
                        $where = {
                            OrganizationTumbolID: Number(req.query.TumbolID),
                            isRemove: 0,
                        };
                    } else if (req.query.AmphurID) {
                        $where = {
                            OrganizationAmphurID: Number(req.query.AmphurID),
                            isRemove: 0,
                        };
                    } else if (req.query.ProvinceID) {
                        $where = {
                            OrganizationProvinceID: Number(
                                req.query.ProvinceID
                            ),
                            isRemove: 0,
                        };

                        // console.log($where);
                    } else {
                        let provinceIDArr = [];
                        let $whereProvice = {};

                        if (req.query.AIZoneID) {
                            $whereProvice = { AIZoneID: req.query.AIZoneID };
                        } else {
                            $whereProvice = {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            };
                        }

                        const province = await Province.findAll({
                            where: $whereProvice,
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });

                        $where = {
                            OrganizationProvinceID: { [Op.in]: provinceIDArr },
                        };
                    }

                    if (req.query.OrganizationTypeID) {
                        $where["OrganizationTypeID"] = Number(
                            req.query.OrganizationTypeID
                        );
                    }

                    organization = await Organization.findAll({
                        where: $where,
                    });

                    organization.forEach((o) => {
                        organizationIDArr.push(o.OrganizationID);
                    });
                    staff = await Staff.findAll({
                        where: {
                            StaffOrganizationID: { [Op.in]: organizationIDArr },
                            isRemove: 0,
                        },
                        include: {
                            model: Organization,
                            as: "Organization",
                            required: true,
                        },
                    });
                }

                let res = [];

                // Date
                let AIDate = {
                    [Op.ne]: null,
                };

                let AnimalCreatedDatetime = {
                    [Op.ne]: null,
                };

                let CheckupDate = {
                    [Op.ne]: null,
                };

                let GiveBirthDate = {
                    [Op.ne]: null,
                };

                if (req.query.StartDate) {
                    AIDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    AnimalCreatedDatetime = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    CheckupDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    GiveBirthDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                let staffIDArr = [];

                for (let s of staff) {
                    staffIDArr.push(s.StaffID);
                }

                const ai = await AI.findAll({
                    where: {
                        ResponsibilityStaffID: { [Op.in]: staffIDArr },
                        AIDate: AIDate,
                        isRemove: 0,
                    },
                    include: {
                        model: Animal,
                        as: "Animal",
                        required: true,
                        where: {
                            isActive: 1,
                            AnimalTypeID: {
                                [Op.in]: JSON.parse(req.query.AnimalTypeID),
                            },
                        },
                    },
                });

                const animal = await Animal.findAll({
                    where: {
                        CreatedUserID: { [Op.in]: staffIDArr },
                        CreatedDatetime: AnimalCreatedDatetime,
                        isRemove: 0,
                        AnimalTypeID: {
                            [Op.in]: JSON.parse(req.query.AnimalTypeID),
                        },
                    },
                });

                const pregnancyCheckup = await PregnancyCheckup.findAll({
                    where: {
                        ResponsibilityStaffID: { [Op.in]: staffIDArr },
                        CheckupDate: CheckupDate,
                        isRemove: 0,
                    },
                    include: {
                        model: Animal,
                        as: "Animal",
                        required: true,
                        where: {
                            isActive: 1,
                            AnimalTypeID: {
                                [Op.in]: JSON.parse(req.query.AnimalTypeID),
                            },
                        },
                    },
                });

                let giveBirth = await GiveBirth.findAll({
                    where: {
                        ResponsibilityStaffID: { [Op.in]: staffIDArr },
                        GiveBirthDate: GiveBirthDate,
                        isRemove: 0,
                    },
                    include: {
                        model: Animal,
                        as: "Animal",
                        required: true,
                        where: {
                            isActive: 1,
                            AnimalTypeID: {
                                [Op.in]: JSON.parse(req.query.AnimalTypeID),
                            },
                        },
                    },
                });

                for (let s of staff) {
                    let s_animal = [];
                    let s_ai = [];
                    let s_pregnancyCheckup = [];
                    let pregnancyStatus1 = [];
                    let uniqueAIs = [];
                    let percent = null;
                    let s_giveBirth = [];

                    s_animal = animal.filter((el) => {
                        return el.CreatedUserID == s.StaffID;
                    });

                    s_ai = ai.filter((el) => {
                        return el.ResponsibilityStaffID == s.StaffID;
                    });

                    s_pregnancyCheckup = pregnancyCheckup.filter((el) => {
                        return el.ResponsibilityStaffID == s.StaffID;
                    });

                    pregnancyStatus1 = s_pregnancyCheckup.filter((el, idx) => {
                        return el.PregnancyCheckStatusID == 1;
                    });

                    const seen = new Set();
                    uniqueAIs = s_ai.filter((el, index) => {
                        const duplicate = seen.has(el.AnimalID);
                        seen.add(el.AnimalID);
                        return !duplicate;
                    });

                    percent = parseFloat(
                        (
                            (pregnancyStatus1.length * 100) /
                            s_pregnancyCheckup.length
                        ).toFixed(2)
                    );

                    if (s_pregnancyCheckup.length == 0) {
                        percent = "-";
                    } else {
                        if (pregnancyStatus1.length == 0) {
                            percent = 0 + "%";
                        } else {
                            percent = percent + "%";
                        }
                    }

                    let childM = 0;
                    let childF = 0;

                    s_giveBirth = giveBirth.filter((el) => {
                        return el.ResponsibilityStaffID == s.StaffID;
                    });

                    if (giveBirth) {
                        s_giveBirth.forEach((el, index) => {
                            // ChildGender
                            if (el.ChildGender != null) {
                                let ChildGender = el.ChildGender.split(",");
                                for (let cg of ChildGender) {
                                    if (cg == "M") {
                                        childM = childM + 1;
                                    } else if (cg == "F") {
                                        childF = childF + 1;
                                    } else {
                                    }
                                }
                            }
                        });
                    }

                    res.push({
                        StaffNumber: s.StaffNumber,
                        StaffFullName: `${s.StaffGivenName} ${s.StaffSurname}`,
                        StaffOrganization: s.Organization.OrganizationName,
                        r1: uniqueAIs.length,
                        r2: s_ai.length,
                        r3: s_animal.length,
                        r4: s_pregnancyCheckup.length,
                        r5: pregnancyStatus1.length,
                        percent: percent,
                        childM: childM,
                        childF: childF,
                        childT: childM + childF,
                    });
                }

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report3(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $whereOrganization = {};
                let $where = {};
                let $whereStaff = {};
                let $whereAnimal = {};

                // Org
                if (req.query.StaffID) {
                    $whereStaff["StaffID"] = req.query.StaffID;
                } else if (req.query.OrganizationID) {
                    $whereOrganization["OrganizationID"] =
                        req.query.OrganizationID;
                } else if (req.query.TumbolID) {
                    $whereOrganization["OrganizationTumbolID"] =
                        req.query.TumbolID;
                } else if (req.query.AmphurID) {
                    $whereOrganization["StaffAmphurID"] = req.query.AmphurID;
                } else if (req.query.ProvinceID) {
                    $whereOrganization["OrganizationProvinceID"] = Number(
                        req.query.ProvinceID
                    );
                } else {
                    if (req.query.OrganizationAiZoneID) {
                        $whereOrganization["OrganizationAiZoneID"] =
                            req.query.OrganizationAiZoneID;
                    } else {
                        $whereOrganization["OrganizationZoneID"] =
                            req.query.OrganizationZoneID;
                    }
                }

                if (!req.query.StaffID) {
                    $whereOrganization["isActive"] = 1;
                    $whereOrganization["isRemove"] = 0;

                    const queryOrganization =
                        Object.keys($whereOrganization).length > 0
                            ? { where: $whereOrganization }
                            : {};

                    let organization = await Organization.findAll({
                        ...queryOrganization,
                    });

                    let organizationIds = organization.map(
                        (org) => org.OrganizationID
                    );

                    $whereStaff["StaffOrganizationID"] = {
                        [Op.in]: organizationIds,
                    };
                }

                // Query Staff
                $whereStaff["isRemove"] = 0;

                if (req.query.StaffIsActive) {
                    $whereStaff["isActive"] = req.query.StaffIsActive;
                } else {
                    $whereStaff["isActive"] = 1;
                }

                if (req.query.StaffStatus) {
                    $whereStaff["StaffStatus"] = req.query.StaffStatus;
                }

                $whereStaff["StaffNumber"] = {
                    [Op.not]: null,
                };
                // $whereStaff["StaffStatus"] = {
                //     [Op.notIn]: ["ลาออก", "ตาย"],
                // };

                const queryStaff =
                    Object.keys($whereStaff).length > 0
                        ? { where: $whereStaff }
                        : {};

                let staff = await Staff.findAll({
                    attributes: [
                        "StaffID",
                        "StaffNumber",
                        "StaffGivenName",
                        "StaffSurname",
                    ],
                    ...queryStaff,
                    include: {
                        attributes: ["OrganizationName"],
                        model: Organization,
                        as: "Organization",
                        required: true,
                    },
                });

                let staffIds = staff.map((s) => s.StaffID);

                $where["ResponsibilityStaffID"] = {
                    [Op.in]: staffIds,
                };

                let res = [];

                // Date
                let AIDate = {
                    [Op.ne]: null,
                };

                let AnimalCreatedDatetime = {
                    [Op.ne]: null,
                };

                let CheckupDate = {
                    [Op.ne]: null,
                };

                let GiveBirthDate = {
                    [Op.ne]: null,
                };

                // Date
                if (req.query.StartDate) {
                    AIDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    AnimalCreatedDatetime = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    CheckupDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };

                    GiveBirthDate = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                // Animal Type
                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };
                $whereAnimal["isRemove"] = 0;
                // $whereAnimal["isActive"] = 1;

                $where["AIDate"] = AIDate != null ? AIDate : undefined;
                $where["isRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryAnimal =
                    Object.keys($whereAnimal).length > 0
                        ? { where: $whereAnimal }
                        : {};

                const ai = await AI.findAll({
                    attributes: [
                        "ResponsibilityStaffID",
                        "AIID",
                        "AnimalID",
                        "AIDate",
                    ],
                    ...query,

                    include: {
                        // attributes: ["AnimalID"],
                        model: Animal,
                        as: "Animal",
                        required: true,
                        ...queryAnimal,
                    },
                });

                // console.log(ai)

                // staffIds
                const users = await User.findAll({
                    where: {
                        StaffID: {
                            [Op.in]: staffIds,
                        },
                    },
                });
                let userIds = users.map((s) => s.UserID);

                const userStaffIds = users.map((s) => {
                    return { userID: s.UserID, StaffID: s.StaffID };
                });

                const animal1 = await Animal.findAll({
                    attributes: ["AnimalID", "CreatedUserID"],
                    where: {
                        CreatedUserID: { [Op.in]: userIds },
                        // userIds
                        CreatedDatetime: AnimalCreatedDatetime,
                        isRemove: 0,
                        // isActive: 1,
                        AnimalTypeID: {
                            [Op.in]: JSON.parse(req.query.AnimalTypeID),
                        },
                    },
                });

                const animal = animal1.map((a) => {
                    let staff = userStaffIds.find((s) => {
                        return s.userID == a.CreatedUserID;
                    });
                    a.StaffID = staff.StaffID;
                    return a;
                });

                //                 PregnancyCheckup.ResponsibilityStaffID,
                //   COUNT ( DISTINCT PregnancyCheckup.AnimalID ) CountPregnancyCheckupAnimal

                let pregnancyCheckup = await PregnancyCheckup.findAll({
                    attributes: [
                        "AnimalID",
                        "ResponsibilityStaffID",
                        "PregnancyCheckStatusID",
                        "TimeNo",
                        [col("AI.PAR"), "PAR"],
                    ],
                    where: {
                        ResponsibilityStaffID: { [Op.in]: staffIds },
                        CheckupDate: CheckupDate,
                        isRemove: 0,
                        TimeNo: {
                            [Op.in]: literal(`(
                                SELECT MAX(pc.TimeNo) 
                                FROM PregnancyCheckup AS pc 
                                INNER JOIN AI AS ai ON pc.AnimalID = ai.AnimalID 
                                WHERE pc.AnimalID = PregnancyCheckup.AnimalID 
                                AND ai.Par = AI.Par  AND pc.ResponsibilityStaffID  IN (${staffIds})
                            )`),
                        },
                    },
                    include: [
                        {
                            attributes: ["AnimalID"],
                            model: Animal,
                            as: "Animal",
                            required: true,
                            where: {
                                // isActive: 1,
                                isRemove: 0,
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                        },
                        {
                            attributes: [],
                            model: AI,
                            as: "AI",
                            required: true,
                        },
                    ],
                    // group: ['PregnancyCheckup.AnimalID'], // Add this line to group by AnimalID
                });

                //    pregnancyCheckup
                // Remove duplicates based on AnimalID
                const uniquePregnancyCheckup = [];
                const seenAnimalIDs = new Set();

                pregnancyCheckup.forEach((item) => {
                    if (!seenAnimalIDs.has(item.AnimalID)) {
                        seenAnimalIDs.add(item.AnimalID);
                        uniquePregnancyCheckup.push(item);
                    }
                });

                pregnancyCheckup = uniquePregnancyCheckup;

                let giveBirth = await GiveBirth.findAll({
                    attributes: [
                        "AnimalID",
                        "ResponsibilityStaffID",
                        "ChildGender",
                    ],
                    where: {
                        ResponsibilityStaffID: { [Op.in]: staffIds },
                        GiveBirthDate: GiveBirthDate,
                        isRemove: 0,
                    },
                    include: {
                        attributes: ["AnimalID"],
                        model: Animal,
                        as: "Animal",
                        required: true,
                        where: {
                            isRemove: 0,
                            AnimalTypeID: {
                                [Op.in]: JSON.parse(req.query.AnimalTypeID),
                            },
                        },
                    },
                });

                const animalMap = new Map();
                animal.forEach((el) => {
                    if (!animalMap.has(el.CreatedUserID)) {
                        animalMap.set(el.CreatedUserID, []);
                    }
                    animalMap.get(el.CreatedUserID).push(el);
                });

                const aiMap = new Map();
                ai.forEach((el) => {
                    if (!aiMap.has(el.ResponsibilityStaffID)) {
                        aiMap.set(el.ResponsibilityStaffID, []);
                    }
                    aiMap.get(el.ResponsibilityStaffID).push(el);
                });

                const pregnancyCheckupMap = new Map();
                pregnancyCheckup.forEach((el) => {
                    if (!pregnancyCheckupMap.has(el.ResponsibilityStaffID)) {
                        pregnancyCheckupMap.set(el.ResponsibilityStaffID, []);
                    }
                    pregnancyCheckupMap.get(el.ResponsibilityStaffID).push(el);
                });

                const giveBirthMap = new Map();
                giveBirth.forEach((el) => {
                    if (!giveBirthMap.has(el.ResponsibilityStaffID)) {
                        giveBirthMap.set(el.ResponsibilityStaffID, []);
                    }
                    giveBirthMap.get(el.ResponsibilityStaffID).push(el);
                });

                for (let s of staff) {
                    let s_ai = aiMap.get(s.StaffID) || [];
                    let s_pregnancyCheckup = [];
                    let pregnancyStatus1 = [];
                    let percent = null;
                    let s_giveBirth = [];

                    let uniqueAIs = [...new Set(s_ai.map((el) => el.AnimalID))];

                    let s_animal = animalMap.get(s.StaffID) || [];

                    s_animal = animal.filter((el) => {
                        return el.StaffID == s.StaffID;
                    });

                    let s_animal_1 = s_animal.map((el) => {
                        return el.AnimalID;
                    });

                    // const seenAnimalIDs = new Set();

                    // s_animal = s_animal.filter((el) => {
                    //     if (seenAnimalIDs.has(el.AnimalID)) {
                    //         return false;
                    //     } else {
                    //         seenAnimalIDs.add(el.AnimalID);
                    //         return true;
                    //     }
                    // });

                    s_ai = ai.filter((el) => {
                        return el.ResponsibilityStaffID == s.StaffID;
                    });

                    s_pregnancyCheckup = pregnancyCheckup.filter((el) => {
                        return el.ResponsibilityStaffID == s.StaffID;
                    });

                    pregnancyStatus1 = s_pregnancyCheckup.filter((el, idx) => {
                        return el.PregnancyCheckStatusID == 1;
                    });

                    const seen = new Set();
                    uniqueAIs = s_ai.filter((el, index) => {
                        const duplicate = seen.has(el.AnimalID);
                        seen.add(el.AnimalID);
                        return !duplicate;
                    });

                    percent = parseFloat(
                        (
                            (pregnancyStatus1.length * 100) /
                            s_pregnancyCheckup.length
                        ).toFixed(2)
                    );

                    if (s_pregnancyCheckup.length == 0) {
                        percent = "-";
                    } else {
                        if (pregnancyStatus1.length == 0) {
                            percent = 0 + "%";
                        } else {
                            percent = percent + "%";
                        }
                    }

                    let childM = 0;
                    let childF = 0;

                    s_giveBirth = giveBirth.filter((el) => {
                        return el.ResponsibilityStaffID == s.StaffID;
                    });

                    if (giveBirth) {
                        s_giveBirth.forEach((el, index) => {
                            // ChildGender
                            if (el.ChildGender != null) {
                                let ChildGender = el.ChildGender.split(",");
                                for (let cg of ChildGender) {
                                    if (cg == "M") {
                                        childM = childM + 1;
                                    } else if (cg == "F") {
                                        childF = childF + 1;
                                    } else {
                                    }
                                }
                            }
                        });
                    }

                    res.push({
                        StaffNumber: s.StaffNumber,
                        StaffFullName: `${s.StaffGivenName} ${s.StaffSurname}`,
                        StaffOrganization: s.Organization.OrganizationName,
                        r1: uniqueAIs.length,
                        r2: s_ai.length,
                        r3_animal: s_animal_1,
                        r3: s_animal.length,
                        r4: s_pregnancyCheckup.length,
                        r5: pregnancyStatus1.length,
                        percent: percent,
                        childM: childM,
                        childF: childF,
                        childT: childM + childF,
                    });
                }

                // const animalMap = new Map();
                // animal.forEach((el) => {
                //     if (!animalMap.has(el.CreatedUserID)) {
                //         animalMap.set(el.CreatedUserID, []);
                //     }
                //     animalMap.get(el.CreatedUserID).push(el);
                // });

                // const aiMap = new Map();
                // ai.forEach((el) => {
                //     if (!aiMap.has(el.ResponsibilityStaffID)) {
                //         aiMap.set(el.ResponsibilityStaffID, []);
                //     }
                //     aiMap.get(el.ResponsibilityStaffID).push(el);
                // });

                // const pregnancyCheckupMap = new Map();
                // pregnancyCheckup.forEach((el) => {
                //     if (!pregnancyCheckupMap.has(el.ResponsibilityStaffID)) {
                //         pregnancyCheckupMap.set(el.ResponsibilityStaffID, []);
                //     }
                //     pregnancyCheckupMap.get(el.ResponsibilityStaffID).push(el);
                // });

                // const giveBirthMap = new Map();
                // giveBirth.forEach((el) => {
                //     if (!giveBirthMap.has(el.ResponsibilityStaffID)) {
                //         giveBirthMap.set(el.ResponsibilityStaffID, []);
                //     }
                //     giveBirthMap.get(el.ResponsibilityStaffID).push(el);
                // });

                // for (let s of staff1) {
                //     const s_animal = animalMap.get(s.StaffID) || [];
                //     const s_ai = aiMap.get(s.StaffID) || [];
                //     const s_pregnancyCheckup =
                //         pregnancyCheckupMap.get(s.StaffID) || [];
                //     const pregnancyStatus1 = s_pregnancyCheckup.filter(
                //         (el) => el.PregnancyCheckStatusID == 1
                //     );

                //     const uniqueAIs = [
                //         ...new Set(s_ai.map((el) => el.AnimalID)),
                //     ];

                //     let percent = "-";
                //     if (s_pregnancyCheckup.length > 0) {
                //         percent =
                //             pregnancyStatus1.length > 0
                //                 ? `${(
                //                       (pregnancyStatus1.length * 100) /
                //                       s_pregnancyCheckup.length
                //                   ).toFixed(2)}%`
                //                 : "0%";
                //     }

                //     let childM = 0;
                //     let childF = 0;

                //     const s_giveBirth = giveBirthMap.get(s.StaffID) || [];
                //     s_giveBirth.forEach((el) => {
                //         if (el.ChildGender != null) {
                //             const ChildGender = el.ChildGender.split(",");
                //             ChildGender.forEach((cg) => {
                //                 if (cg == "M") childM++;
                //                 else if (cg == "F") childF++;
                //             });
                //         }
                //     });

                //     res.push({
                //         StaffNumber: s.StaffNumber,
                //         StaffFullName: `${s.StaffGivenName} ${s.StaffSurname}`,
                //         StaffOrganization: s.Organization.OrganizationName,
                //         r1: uniqueAIs.length,
                //         r2: s_ai.length,
                //         r3: s_animal.length,
                //         r4: s_pregnancyCheckup.length,
                //         r5: pregnancyStatus1.length,
                //         percent: percent,
                //         childM: childM,
                //         childF: childF,
                //         childT: childM + childF,
                //     });
                // }
                // console.log("FREEDOM60");

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report4(req) {
        // report พ่อพันธุ์
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};

                $whereFarm["isRemove"] = 0;

                // เราจะค้นหาฟาร์ม จาก
                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                // ตาราง animal
                let animalStatusID = null;
                if (
                    req.query.AnimalTypeID.includes(1) ||
                    req.query.AnimalTypeID.includes(2) ||
                    req.query.AnimalTypeID.includes(41) ||
                    req.query.AnimalTypeID.includes(42)
                ) {
                    animalStatusID = 4;
                }

                if (
                    req.query.AnimalTypeID.includes(3) ||
                    req.query.AnimalTypeID.includes(4) ||
                    req.query.AnimalTypeID.includes(43) ||
                    req.query.AnimalTypeID.includes(44)
                ) {
                    animalStatusID = 9;
                }

                if (
                    req.query.AnimalTypeID.includes(17) ||
                    req.query.AnimalTypeID.includes(18) ||
                    req.query.AnimalTypeID.includes(45) ||
                    req.query.AnimalTypeID.includes(46)
                ) {
                    animalStatusID = 14;
                }

                // const animal = await Animal.findAll({
                //   attributes: {
                //     include: [
                //       [
                //         literal(`(
                //         SELECT Weight
                //         FROM ProgressCheckup
                //         WHERE
                //           ProgressCheckup.AnimalID = Animal.AnimalID
                //         ORDER BY ProgressCheckupID DESC
                //         LIMIT 1
                //     )`),
                //         "Weight",
                //       ],
                //       [
                //         literal(`(
                //         SELECT Height
                //         FROM ProgressCheckup
                //         WHERE
                //           ProgressCheckup.AnimalID = Animal.AnimalID
                //         ORDER BY ProgressCheckupID DESC
                //         LIMIT 1
                //     )`),
                //         "Height",
                //       ],
                //       [
                //         literal(`(
                //         SELECT SemenNumber
                //         FROM Semen
                //         WHERE
                //           Semen.BreederID = Animal.AnimalID
                //         ORDER BY SemenID DESC
                //         LIMIT 1
                //     )`),
                //         "SemenNumber",
                //       ],
                //     ],
                //   },
                //   where: { AnimalStatusID: animalStatusID },
                //   include: [
                //     {
                //       model: Farm,
                //       as: "AnimalFarm",
                //       ...query,
                //     },
                //     {
                //       model: AnimalBreed,
                //       as: "AnimalBreed1",
                //     },
                //     {
                //       model: AnimalBreed,
                //       as: "AnimalBreed2",
                //     },
                //     {
                //       model: AnimalBreed,
                //       as: "AnimalBreed3",
                //     },
                //     {
                //       model: AnimalBreed,
                //       as: "AnimalBreed4",
                //     },
                //     {
                //       model: AnimalBreed,
                //       as: "AnimalBreed5",
                //     },
                //     {
                //       model: Animal,
                //       as: "AnimalFather",
                //     },
                //     {
                //       model: Animal,
                //       as: "AnimalMother",
                //     },
                //     {
                //       model: AnimalStatus,
                //       as: "AnimalStatus",
                //     },
                //   ],
                // });

                const animal = await Animal.findAll({
                    attributes: {
                        include: [
                            [
                                // Note the wrapping parentheses in the call below!
                                literal(`(
                            SELECT TOP (1) Weight
                            FROM ProgressCheckup
                            WHERE
                                ProgressCheckup.AnimalID = Animal.AnimalID
                            ORDER BY ProgressCheckupID DESC
                        )`),
                                "Weight",
                            ],
                            [
                                literal(`(
                                SELECT TOP (1) Height
                                FROM ProgressCheckup
                                WHERE
                                  ProgressCheckup.AnimalID = Animal.AnimalID
                                ORDER BY ProgressCheckupID DESC
                            )`),
                                "Height",
                            ],
                            [
                                literal(`(
                        SELECT TOP (1) SemenNumber
                        FROM Semen
                        WHERE
                          Semen.BreederID = Animal.AnimalID
                        ORDER BY SemenID DESC
                    )`),
                                "SemenNumber",
                            ],
                        ],
                    },
                    //   attributes: {
                    //     include: [
                    //       [
                    //         literal(`(
                    //         SELECT Weight
                    //         FROM ProgressCheckup
                    //         WHERE
                    //           ProgressCheckup.AnimalID = Animal.AnimalID
                    //         ORDER BY ProgressCheckupID DESC
                    //         LIMIT 1
                    //     )`),
                    //         "Weight",
                    //       ],
                    //       [
                    //         literal(`(
                    //         SELECT Height
                    //         FROM ProgressCheckup
                    //         WHERE
                    //           ProgressCheckup.AnimalID = Animal.AnimalID
                    //         ORDER BY ProgressCheckupID DESC
                    //         LIMIT 1
                    //     )`),
                    //         "Height",
                    //       ],
                    //     //   [
                    //     //     literal(`(
                    //     //     SELECT SemenNumber
                    //     //     FROM Semen
                    //     //     WHERE
                    //     //       Semen.BreederID = Animal.AnimalID
                    //     //     ORDER BY SemenID DESC
                    //     //     LIMIT 1
                    //     // )`),
                    //     //     "SemenNumber",
                    //     //   ],
                    //     ],
                    //   },
                    where: { AnimalStatusID: animalStatusID, isActive: 1 },
                    include: [
                        // น้ำเชื้อ
                        // น้ำหนัก ส่วนสูง
                        {
                            model: Farm,
                            as: "AnimalFarm",
                            ...query,
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed1",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed2",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed3",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed4",
                        },
                        {
                            model: AnimalBreed,
                            as: "AnimalBreed5",
                        },
                        {
                            model: Animal,
                            as: "AnimalFather",
                        },
                        {
                            model: Animal,
                            as: "AnimalMother",
                        },
                        {
                            model: AnimalStatus,
                            as: "AnimalStatus",
                        },
                    ],
                });
                let res = [];
                animal.forEach((el) => {
                    res.push({
                        AnimalID: el.AnimalID,
                        AnimalEarID: el.AnimalEarID,
                        SemenNumber: el.dataValues.SemenNumber,
                        AnimalName: el.AnimalName,
                        AnimalBreedAll: el.AnimalBreedAll,
                        ThaiAnimalBirthDate: el.ThaiAnimalBirthDate,
                        AnimalWeight: el.dataValues.Weight
                            ? el.dataValues.Weight
                            : "-",
                        AnimalHeight: el.dataValues.Height
                            ? el.dataValues.Height
                            : "-",
                        AnimalFather: el.AnimalFather
                            ? el.AnimalFather.AnimalEarID
                            : "-",
                        AnimalMother: el.AnimalMother
                            ? el.AnimalMother.AnimalEarID
                            : "-",
                        AnimalStatusName: el.AnimalStatus?.AnimalStatusName,
                        AnimalSource:
                            el.AnimalSource == "BORN"
                                ? "เกิดในฟาร์ม"
                                : el.AnimalSource == "BUY"
                                ? "ซื้อมา"
                                : el.AnimalSource == "TRANSFER"
                                ? "ย้ายมา"
                                : "-",
                    });
                });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report5(req) {
        // report รายงานการใช้น้ำเชื้อ
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereAI = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                let $whereSemen = {};
                if (req.query.SemenNumber) {
                    $whereSemen["SemenNumber"] = {
                        [Op.like]: "%" + req.query.SemenNumber + "%",
                    };
                }

                let AIDate = {};
                if (req.query.StartDate) {
                    $whereAI["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $whereAI["SemenID"] = { [Op.ne]: null };

                const queryAI =
                    Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const querySemen =
                    Object.keys($whereSemen).length > 0
                        ? { where: $whereSemen }
                        : {};

                const ai = await AI.findAll({
                    ...queryAI,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                isActive: 1,
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed1",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed2",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed3",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed4",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed5",
                                },
                                {
                                    model: Animal,
                                    as: "AnimalFather",
                                },
                                {
                                    model: Animal,
                                    as: "AnimalMother",
                                },
                                {
                                    model: AnimalStatus,
                                    as: "AnimalStatus",
                                },
                            ],
                            // ...query,
                        },
                        {
                            model: Semen,
                            as: "Semen",
                            ...querySemen,
                        },
                    ],
                });

                let res = [];

                ai.forEach((el) => {
                    res.push({
                        AnimalID: el.AnimalID,
                        SemenNumber: el.Semen ? el.Semen?.SemenNumber : "-",
                        AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
                        AnimalBreedAll: el.Animal
                            ? el.Animal.AnimalBreedAll
                            : "-",
                        ThaiAnimalBirthDate: el.Animal
                            ? el.Animal.ThaiAnimalBirthDate
                            : "-",
                        AnimalStatusName: el.Animal
                            ? el.Animal.AnimalStatus?.AnimalStatusName
                            : "-",
                        AnimalFather: !el.Animal
                            ? "-"
                            : el.Animal.AnimalFather
                            ? el.Animal.AnimalFather.AnimalEarID
                            : "-",
                        AnimalMother: !el.Animal
                            ? "-"
                            : el.Animal.AnimalMother
                            ? el.Animal.AnimalMother.AnimalEarID
                            : "-",
                        Par: el.PAR,
                        TimeNo: el.TimeNo,
                        ThaiAIDate: el.ThaiAIDate,
                        Dose: el.Dose,
                        //
                        AIStatus:
                            el.AIStatus == 0
                                ? "รอผล"
                                : el.AIStatus == 1
                                ? "สำเร็จ"
                                : "ไม่สำเร็จ",
                        // Farm
                        FarmName: el.Animal.AnimalFarm.FarmName,
                    });
                });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report6(req) {
        // report รายงานการใช้น้ำเชื้อ
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereTransferEmbryo = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                let $whereEmbryo = {};
                if (req.query.EmbryoNumber) {
                    $whereEmbryo["EmbryoNumber"] = {
                        [Op.like]: "%" + req.query.EmbryoNumber + "%",
                    };
                }

                let TransferEmbryoDate = {};
                if (req.query.StartDate) {
                    $whereTransferEmbryo["TransferDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $whereEmbryo["EmbryoID"] = { [Op.ne]: null };

                const queryTransferEmbryo =
                    Object.keys($whereTransferEmbryo).length > 0
                        ? { where: $whereTransferEmbryo }
                        : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const queryEmbryo =
                    Object.keys($whereEmbryo).length > 0
                        ? { where: $whereEmbryo }
                        : {};

                // const ai = await TransferEmbryo.findAll({
                //   ...queryTransferEmbryo,
                //   include: [
                //     {
                //       model: Animal,
                //       as: "Animal",
                //       where: {
                //         AnimalTypeID: {
                //           [Op.in]: JSON.parse(req.query.AnimalTypeID),
                //         },
                //       },
                //       include: [
                //         {
                //           model: Farm,
                //           as: "AnimalFarm",
                //           ...query,
                //         },
                //         {
                //           model: AnimalBreed,
                //           as: "AnimalBreed1",
                //         },
                //         {
                //           model: AnimalBreed,
                //           as: "AnimalBreed2",
                //         },
                //         {
                //           model: AnimalBreed,
                //           as: "AnimalBreed3",
                //         },
                //         {
                //           model: AnimalBreed,
                //           as: "AnimalBreed4",
                //         },
                //         {
                //           model: AnimalBreed,
                //           as: "AnimalBreed5",
                //         },
                //         {
                //           model: Animal,
                //           as: "AnimalFather",
                //         },
                //         {
                //           model: Animal,
                //           as: "AnimalMother",
                //         },
                //         {
                //           model: AnimalStatus,
                //           as: "AnimalStatus",
                //         },
                //       ],
                //       // ...query,
                //     },
                //     {
                //       model: Embryo,
                //       as: "Embryo",
                //       ...queryEmbryo,
                //     },
                //   ],
                // });

                const ai1 = await TransferEmbryo.findAll({
                    ...queryTransferEmbryo,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed1",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed2",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed3",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed4",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed5",
                                },
                                {
                                    model: Animal,
                                    as: "AnimalFather",
                                },
                                {
                                    model: Animal,
                                    as: "AnimalMother",
                                },
                                {
                                    model: AnimalStatus,
                                    as: "AnimalStatus",
                                },
                            ],
                            // ...query,
                        },
                        {
                            model: Embryo,
                            as: "Embryo",
                            ...queryEmbryo,
                        },
                    ],
                });

                // const loadAIs = async (filter) => {
                //   const ais = await AI.findAll(filter);
                //   return Promise.all(ais.map(lazyLoad));
                // };

                // const lazyLoad = async (ai) => {
                //   const [animal] = await Promise.all([ai.getAnimal()]);
                //   // some data manipulation here to build a complexObject with all the data - not relevant
                //   return {};
                // };

                let res = [];
                ai1.forEach((el) => {
                    res.push({
                        AnimalID: el.AnimalID,
                        EmbryoNumber: el.Embryo ? el.Embryo.EmbryoNumber : "-",
                        AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
                        AnimalBreedAll: el.Animal
                            ? el.Animal.AnimalBreedAll
                            : "-",
                        ThaiAnimalBirthDate: el.Animal
                            ? el.Animal.ThaiAnimalBirthDate
                            : "-",
                        AnimalStatusName: el.Animal
                            ? el.Animal.AnimalStatus?.AnimalStatusName
                            : "-",
                        AnimalFather: !el.Animal
                            ? "-"
                            : el.Animal.AnimalFather
                            ? el.Animal.AnimalFather.AnimalEarID
                            : "-",
                        AnimalMother: !el.Animal
                            ? "-"
                            : el.Animal.AnimalMother
                            ? el.Animal.AnimalMother.AnimalEarID
                            : "-",
                        Par: el.PAR,
                        TimeNo: el.TimeNo,
                        ThaiTransferDate: el.ThaiTransferDate,
                        FarmName: el.Animal.AnimalFarm.FarmName,
                    });
                });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report7(req) {
        // report การเจริญเติบโต
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereAnimal = {};
                $whereFarm["isRemove"] = 0;

                let provinceIDArr = [];

                if (req.query.AIZoneID) {
                    provinceIDArr = [];
                    const province = await Province.findAll({
                        where: { AIZoneID: req.query.AIZoneID },
                    });

                    province.forEach((p) => {
                        provinceIDArr.push(p.ProvinceID);
                    });
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (req.query.AnimalSexID) {
                    $whereAnimal["AnimalSexID"] = req.query.AnimalSexID;
                }

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const queryAnimal =
                    Object.keys($whereAnimal).length > 0
                        ? { where: $whereAnimal }
                        : {};

                const pc = await ProgressCheckup.findAll({
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed1",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed2",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed3",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed4",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed5",
                                },
                                // {
                                //   model: Animal,
                                //   as: "AnimalFather",
                                // },
                                // {
                                //   model: Animal,
                                //   as: "AnimalMother",
                                // },
                                {
                                    model: AnimalStatus,
                                    as: "AnimalStatus",
                                },
                                {
                                    model: AnimalSex,
                                    as: "AnimalSex",
                                    ...queryAnimal,
                                },
                            ],
                            // ...query,
                        },
                    ],
                });

                let res = [];
                pc.forEach((el) => {
                    res.push({
                        AnimalID: el.AnimalID,
                        // EmbryoNumber: el.Embryo ? el.Embryo.EmbryoNumber : "-",
                        AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
                        AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                        AnimalSex: el.Animal
                            ? el.Animal.AnimalSex.AnimalSexName
                            : "-",
                        AnimalAge: el.Animal ? el.Animal.AnimalAge : "-",
                        AnimalBreedAll: el.Animal
                            ? el.Animal.AnimalBreedAll
                            : "-",
                        AnimalStatusName: el.Animal
                            ? el.Animal.AnimalStatus?.AnimalStatusName
                            : "-",
                        FarmName: el.Animal.AnimalFarm.FarmName,
                        ThaiCheckupDate: el.ThaiCheckupDate,
                        Weight: el.Weight,
                        Height: el.Height,
                        PerimeterChest: el.PerimeterChest,
                        PerimeterBall: el.PerimeterBall,
                    });
                });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report8(req) {
        // report ครบกำหนดคลอด
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereAI = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                let AIDate = {};
                if (req.query.StartDate) {
                    $whereAI["EstimateBirthDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                const queryAI =
                    Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let order = [];
                if (req.query.Type == "FARM") {
                    order = [[Animal, "FarmID", "ASC"]];
                }
                if (req.query.Type == "STAFF") {
                    order = [["ResponsibilityStaffID", "ASC"]];
                }

                const ai = await AI.findAll({
                    ...queryAI,
                    order: order,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        { model: Staff },
                        {
                            model: GiveBirth,
                            as: "GiveBirth",
                            include: [
                                { model: GiveBirthHelp },
                                { model: Staff },
                            ],
                        },
                    ],
                });

                let res = [];
                // res = [{ FarmID: 1, FarmName: 2, AI: [{},{}] }];

                if (req.query.Type == "FARM") {
                    const sortAI = (el) => {
                        let resSort = {
                            AnimalID: el.AnimalID,
                            AnimalEarID: el.Animal
                                ? el.Animal.AnimalEarID
                                : "-",
                            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                            Par: el.PAR,
                            TimeNo: el.TimeNo,
                            ThaiAIDate: el.ThaiAIDate,
                            SemenNumber: el.Semen ? el.Semen?.SemenNumber : "-",
                            ThaiEstimateBirthDate: el.ThaiEstimateBirthDate,
                            ThaiGiveBirthDate: el.GiveBirth
                                ? el.GiveBirth.ThaiGiveBirthDate
                                : "-",
                            GiveBirthState: el.GiveBirth
                                ? el.GiveBirth.GiveBirthState == "NORMAL"
                                    ? "คลอดปกติ"
                                    : el.GiveBirth.GiveBirthState == "DIFFICULT"
                                    ? "คลอดยาก"
                                    : "คลอดก่อน"
                                : "-",
                            GiveBirthState: el.GiveBirth
                                ? el.GiveBirth.GiveBirthState == "NORMAL"
                                    ? "คลอดปกติ"
                                    : el.GiveBirth.GiveBirthState == "DIFFICULT"
                                    ? "คลอดยาก"
                                    : "คลอดก่อน"
                                : "-",
                            GiveBirthHelp: el.GiveBirth
                                ? el.GiveBirth.GiveBirthHelp.GiveBirthHelpName
                                : "-",
                            ResponsibilityStaffName: el.GiveBirth
                                ? el.GiveBirth.Staff.StaffFullName
                                : "-",
                            ChildGender: el.GiveBirth
                                ? el.GiveBirth.ChildGender
                                : "-",
                        };

                        return resSort;
                    };

                    ai.forEach((el) => {
                        let latestArr = res[res.length - 1];

                        if (latestArr) {
                            if (el.Animal.FarmID == latestArr.FarmID) {
                                latestArr.AI.push(sortAI(el));
                            } else {
                                res.push({
                                    FarmID: el.Animal.FarmID,
                                    FarmName: el.Animal.AnimalFarm.FarmName,
                                    AI: [sortAI(el)],
                                });
                            }
                        } else {
                            res.push({
                                FarmID: el.Animal.FarmID,
                                FarmName: el.Animal.AnimalFarm.FarmName,
                                AI: [sortAI(el)],
                            });
                        }
                    });
                }

                if (req.query.Type == "STAFF") {
                    const sortAI = (el) => {
                        let resSort = {
                            AnimalID: el.AnimalID,
                            AnimalEarID: el.Animal
                                ? el.Animal.AnimalEarID
                                : "-",
                            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                            Par: el.PAR,
                            TimeNo: el.TimeNo,
                            ThaiAIDate: el.ThaiAIDate,
                            SemenNumber: el.Semen ? el.Semen?.SemenNumber : "-",
                            ThaiEstimateBirthDate: el.ThaiEstimateBirthDate,
                            ThaiGiveBirthDate: el.GiveBirth
                                ? el.GiveBirth.ThaiGiveBirthDate
                                : "-",
                            GiveBirthState: el.GiveBirth
                                ? el.GiveBirth.GiveBirthState == "NORMAL"
                                    ? "คลอดปกติ"
                                    : el.GiveBirth.GiveBirthState == "DIFFICULT"
                                    ? "คลอดยาก"
                                    : "คลอดก่อน"
                                : "-",
                            GiveBirthState: el.GiveBirth
                                ? el.GiveBirth.GiveBirthState == "NORMAL"
                                    ? "คลอดปกติ"
                                    : el.GiveBirth.GiveBirthState == "DIFFICULT"
                                    ? "คลอดยาก"
                                    : "คลอดก่อน"
                                : "-",
                            GiveBirthHelp: el.GiveBirth
                                ? el.GiveBirth.GiveBirthHelp.GiveBirthHelpName
                                : "-",
                            ResponsibilityStaffName: el.GiveBirth
                                ? el.GiveBirth.Staff.StaffFullName
                                : "-",
                            ChildGender: el.GiveBirth
                                ? el.GiveBirth.ChildGender
                                : "-",
                        };

                        return resSort;
                    };

                    ai.forEach((el) => {
                        let latestArr = res[res.length - 1];

                        if (latestArr) {
                            if (
                                el.ResponsibilityStaffID ==
                                latestArr.ResponsibilityStaffID
                            ) {
                                latestArr.AI.push(sortAI(el));
                            } else {
                                res.push({
                                    StaffID: el.ResponsibilityStaffID,
                                    StaffName: el.Staff
                                        ? el.Staff.StaffFullName
                                        : "-",
                                    AI: [sortAI(el)],
                                });
                            }
                        } else {
                            res.push({
                                StaffID: el.ResponsibilityStaffID,
                                StaffName: el.Staff
                                    ? el.Staff.StaffFullName
                                    : "-",
                                AI: [sortAI(el)],
                            });
                        }
                    });
                }

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report9(req) {
        // report รายงานตรวจท้อง
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereAI = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                if (req.query.ProjectID) {
                    $whereFarm["ProjectID"] = req.query.ProjectID;
                }

                if (req.query.ProjectID) {
                    $whereAI["ProjectID"] = req.query.ProjectID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                let AIDate = {};
                if (req.query.StartDate) {
                    $whereAI["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                const queryAI =
                    Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let order = [[Animal, "FarmID", "ASC"]];

                const ai = await AI.findAll({
                    ...queryAI,
                    order: order,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                    include: [
                                        { model: Amphur, as: "Amphur" },
                                        { model: Province, as: "Province" },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        { model: Staff },
                        { model: Project },
                        {
                            model: PregnancyCheckup,
                            include: [{ model: PregnancyCheckStatus }],
                        },
                    ],
                });

                let res = [];

                let aiTotal = ai.length;

                const sortAI = (el) => {
                    let pregnancyCheckup = "";
                    let pregnancyCheckupDate = "";
                    if (el.PregnancyCheckups.length != 0) {
                        let pc =
                            el.PregnancyCheckups[
                                el.PregnancyCheckups.length - 1
                            ];
                        pregnancyCheckup =
                            pc.PregnancyCheckStatus.PregnancyCheckStatusName;
                        pregnancyCheckupDate = pc.ThaiCheckupDate;
                    }

                    let day = dayjs().diff(dayjs(el.AIDate), "day");

                    let resSort = {};
                    if (day >= req.query.day) {
                        resSort = {
                            AnimalID: el.AnimalID,
                            AnimalEarID: el.Animal
                                ? el.Animal.AnimalEarID
                                : "-",
                            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                            Par: el.PAR,
                            TimeNo: el.TimeNo,
                            SemenNumber: el.Semen ? el.Semen?.SemenNumber : "-",
                            ThaiAIDate: el.ThaiAIDate,
                            Day: day,
                            ProjectName: el.Project
                                ? el.Project.ProjectName
                                : "-",
                            ThaipregnancyCheckupDate: pregnancyCheckupDate,
                            pregnancyCheckup: pregnancyCheckup,
                            ResponsibilityStaffName: el.Staff
                                ? el.Staff.StaffFullName
                                : "-",
                        };
                    }

                    return resSort;
                };

                ai.forEach((el) => {
                    let latestArr = res[res.length - 1];

                    if (latestArr) {
                        if (el.Animal.FarmID == latestArr.FarmID) {
                            let aiItem = sortAI(el);
                            if (!_.isEmpty(aiItem)) {
                                latestArr.AI.push(aiItem);
                            }
                        } else {
                            let aiItem = sortAI(el);
                            if (!_.isEmpty(aiItem)) {
                                res.push({
                                    FarmID: el.Animal.FarmID,
                                    FarmName: el.Animal.AnimalFarm.FarmName,
                                    AmphurName:
                                        el.Animal.AnimalFarm.Amphur.AmphurName,
                                    ProvinceName:
                                        el.Animal.AnimalFarm.Province
                                            .ProvinceName,
                                    AI: [aiItem],
                                });
                            }
                        }
                    } else {
                        let aiItem = sortAI(el);
                        if (!_.isEmpty(aiItem)) {
                            res.push({
                                FarmID: el.Animal.FarmID,
                                FarmName: el.Animal.AnimalFarm.FarmName,
                                AmphurName:
                                    el.Animal.AnimalFarm.Amphur.AmphurName,
                                ProvinceName:
                                    el.Animal.AnimalFarm.Province.ProvinceName,
                                AI: [aiItem],
                            });
                        }
                    }
                });

                resolve({
                    Total: aiTotal,
                    Farm: res,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    //   report10(req) {
    //     // report โคสาวยังไม่ได้รับการผสม ยังไม่เสร็จเอาข้อมูลมาแสดงเฉยๆ
    //     return new Promise(async (resolve, reject) => {
    //       try {
    //         // let $where = {};
    //         let $whereFarm = {};
    //         if (req.query.OrganizationID) {
    //           $whereFarm["OrganizationID"] = req.query.OrganizationID;
    //         }

    //         let provinceIDArr = [];
    //         if (!req.query.ProvinceID) {
    //           if (req.query.OrganizationZoneID) {
    //             const province = await Province.findAll({
    //               where: { OrganizationZoneID: req.query.OrganizationZoneID },
    //             });

    //             province.forEach((p) => {
    //               provinceIDArr.push(p.ProvinceID);
    //             });
    //           }

    //           if (req.query.AIZoneID) {
    //             provinceIDArr = [];
    //             const province = await Province.findAll({
    //               where: { AIZoneID: req.query.AIZoneID },
    //             });

    //             province.forEach((p) => {
    //               provinceIDArr.push(p.ProvinceID);
    //             });
    //           }
    //         }

    //         if (req.query.TumbolID) {
    //           $whereFarm["FarmTumbolID"] = req.query.TumbolID;
    //         }

    //         if (req.query.AmphurID) {
    //           $whereFarm["FarmAmphurID"] = req.query.AmphurID;
    //         }

    //         if (req.query.ProvinceID) {
    //           provinceIDArr = [req.query.ProvinceID];
    //         }

    //         if (provinceIDArr.length != 0) {
    //           $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
    //         }

    //         if (req.query.FarmID) {
    //           $whereFarm["FarmID"] = req.query.FarmID;
    //         }

    //         const query =
    //           Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

    //         const animal = await Animal.findAll({
    //           where: {
    //             AnimalTypeID: {
    //               [Op.in]: JSON.parse(req.query.AnimalTypeID),
    //             },
    //             // BirthDate: {

    //             // }
    //           },
    //           include: [
    //             {
    //               model: Farm,
    //               as: "AnimalFarm",
    //               // ...query,
    //             },
    //           ],
    //         });

    //         let res = [];

    //         animal.forEach((el) => {
    //           res.push({
    //             AnimalID: el.AnimalID,
    //             AnimalEarID: el.AnimalEarID,
    //             AnimalName: el.AnimalName,
    //             ThaiBirthDate: el.ThaiBirthDate,
    //             AnimalAge: el.AnimalAge,
    //             Weight: "",
    //             FarmIdentificationNumber: el.AnimalFarm.FarmIdentificationNumber,
    //             FarmName: el.AnimalFarm.FarmName,
    //           });
    //         });

    //         resolve(res);
    //       } catch (error) {
    //         reject(ErrorNotFound(error));
    //       }
    //     });
    //   },

    report10(req) {
        // report โคสาวยังไม่ได้รับการผสม ยังไม่เสร็จเอาข้อมูลมาแสดงเฉยๆ
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $where["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };

                $where["isRemove"] = 0;
                $where["AnimalAlive"] = 1;

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                // AnimalSexID
                // AnimalPar
                // AnimalStatusID
                // AnimalAlive = 1
                // ProductionStatusID
                $where["AnimalSexID"] = 2;
                $where["AnimalPar"] = 0;

                if (req.query.AnimalTypeID == "[1,2,41,42]") {
                    $where["AnimalStatusID"] = 3;
                }

                // กระบือ
                if (req.query.AnimalTypeID == "[3,4,43,44]") {
                    $where["AnimalStatusID"] = 8;
                }

                // แพะ
                if (req.query.AnimalTypeID == "[17,18,45,46]") {
                    $where["AnimalStatusID"] = 13;
                }

                // ProductionStatusID
                $where["ProductionStatusID"] = null;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let animal = [];

                const item = await Animal.findAll({
                    ...query,
                    include: [
                        {
                            model: Farm,
                            as: "AnimalFarm",
                            ...queryFarm,
                            include: [
                                {
                                    model: Project,
                                    where: WhereProject,
                                },
                                {
                                    model: Province,
                                    as: "Province",
                                },
                                {
                                    model: Amphur,
                                    as: "Amphur",
                                },
                                {
                                    model: Tumbol,
                                    as: "Tumbol",
                                },
                            ],
                        },
                        {
                            model: Animal,
                            as: "AnimalFather",
                        },
                        {
                            model: Animal,
                            as: "AnimalMother",
                        },
                        { model: AnimalStatus, as: "AnimalStatus" },
                    ],
                });

                const item_all = item.filter((x) => {
                    return true;
                });

                item_all.forEach((x) => {
                    animal.push({
                        AnimalID: x.AnimalID,
                        AnimalSecretStatus: x.AnimalSecretStatus,
                        FarmIdentificationNumber:
                            x.AnimalFarm.FarmIdentificationNumber,
                        FarmName: x.AnimalFarm.FarmName,
                        FarmAddress: x.AnimalFarm?.FarmAddress,
                        FarmProvince: x.AnimalFarm?.Province?.ProvinceName,
                        FarmAmphur: x.AnimalFarm?.Amphur?.AmphurName,
                        FarmTumbol: x.AnimalFarm?.Tumbol?.TumbolName,
                        AnimalEarID: x.AnimalEarID,
                        AnimalName: x.AnimalName,
                        AnimalStatusName: x.AnimalStatus?.AnimalStatusName,
                        AnimalAge: x.AnimalAge,
                        AnimalFatherEarID: x.AnimalFather?.AnimalEarID,
                        AnimalMotherEarID: x.AnimalMother?.AnimalEarID,
                        AnimalFather: x.AnimalFather?.AnimalName,
                        AnimalMother: x.AnimalMother?.AnimalName,
                        // AIDate: x.AIDate
                        //   ? dayjs(x.AIDate).locale("th").format("DD MMM BB")
                        //   : "",
                        // Day: x.AIDate ? dayjs().diff(dayjs(x.AIDate), "day") : "",
                        SemenNumber: "",
                        AIDate: "",
                        ResponsibilityStaffName: "",
                    });
                    //   let checkAnimal = animal.find((a) => {
                    //     return x.Animal.AnimalID == a.AnimalID;
                    //   });

                    //   if (x.PregnancyCheckups.length != 0) {
                    //     let preg = {};
                    //     let checkBirth = 0;

                    //     for (let index = 0; index < x.PregnancyCheckups.length; index++) {
                    //       if (
                    //         x.PregnancyCheckups[index].PregnancyCheckStatusID == 1 ||
                    //         x.PregnancyCheckups[index].PregnancyCheckStatusID == 2
                    //       ) {
                    //         checkBirth = 1;
                    //       } else {
                    //         preg["CheckUpdate"] = x.PregnancyCheckups[index].CheckupDate;
                    //         preg["CheckUpStatus"] =
                    //           x.PregnancyCheckups[index].PregnancyCheckStatusID;
                    //       }
                    //     }

                    //     if (checkBirth == 0) {
                    //       animal.push({
                    //         AIID: x.AIID,
                    //         AnimalID: x.Animal.AnimalID,
                    //         AnimalSecretStatus: x.Animal.AnimalSecretStatus,
                    //         FarmIdentificationNumber:
                    //           x.Animal.AnimalFarm.FarmIdentificationNumber,
                    //         FarmName: x.Animal.AnimalFarm.FarmName,
                    //         FarmAddress: x.Animal.AnimalFarm?.FarmAddress,
                    //         FarmProvince: x.Animal.AnimalFarm?.Province?.ProvinceName,
                    //         FarmAmphur: x.Animal.AnimalFarm?.Amphur?.AmphurName,
                    //         FarmTumbol: x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                    //         AnimalEarID: x.Animal.AnimalEarID,
                    //         AnimalName: x.Animal.AnimalName,
                    //         AnimalStatusName: x.Animal.AnimalStatus.AnimalStatusName,
                    //         AnimalPar: x.PAR,
                    //         SemenNumber: x.Semen.SemenNumber,
                    //         TimeNo: x.TimeNo,
                    //         AIDate: x.AIDate
                    //           ? dayjs(x.AIDate).locale("th").format("DD MMM BB")
                    //           : "",
                    //         Day: x.AIDate ? dayjs().diff(dayjs(x.AIDate), "day") : "",
                    //         PregnancyCheckup: preg,
                    //         ResponsibilityStaffName:
                    //           x.Staff?.StaffGivenName + " " + x.Staff?.StaffSurname,
                    //         PregnancyCheckupDate: "",
                    //         PregnancyCheckupStatus: "",
                    //       });
                    //     }
                    //   } else {
                    //     let preg = {};
                    //     preg["CheckUpdate"] = "";
                    //     preg["CheckUpStatus"] = "";

                    //     animal.push({
                    //       AIID: x.AIID,
                    //       AnimalID: x.Animal.AnimalID,
                    //       AnimalSecretStatus: x.Animal.AnimalSecretStatus,
                    //       FarmIdentificationNumber:
                    //         x.Animal.AnimalFarm.FarmIdentificationNumber,
                    //       FarmName: x.Animal.AnimalFarm.FarmName,
                    //       FarmAddress: x.Animal.AnimalFarm?.FarmAddress,
                    //       FarmProvince: x.Animal.AnimalFarm?.Province?.ProvinceName,
                    //       FarmAmphur: x.Animal.AnimalFarm?.Amphur?.AmphurName,
                    //       FarmTumbol: x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                    //       AnimalEarID: x.Animal.AnimalEarID,
                    //       AnimalName: x.Animal.AnimalName,
                    //       AnimalStatusName: x.Animal.AnimalStatus.AnimalStatusName,
                    //       AnimalPar: x.PAR,
                    //       SemenNumber: x.Semen.SemenNumber,
                    //       TimeNo: x.TimeNo,
                    //       AIDate: x.AIDate
                    //         ? dayjs(x.AIDate).locale("th").format("DD MMM BB")
                    //         : "",
                    //       Day: x.AIDate ? dayjs().diff(dayjs(x.AIDate), "day") : "",
                    //       PregnancyCheckup: preg,
                    //       ResponsibilityStaffName:
                    //         x.Staff?.StaffGivenName + " " + x.Staff?.StaffSurname,
                    //       PregnancyCheckupDate: "",
                    //       PregnancyCheckupStatus: "",
                    //     });
                    //   }
                });

                // if (req.query.Day) {
                //   animal = animal.filter((x) => {
                //     return x.Day < Number(req.query.Day) + 1;
                //   });
                // }

                resolve({
                    data: animal,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report11(req) {
        // report ตรวจระบบสืบพันธุ์หลังคลอด 30 วัน
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereGiveBirth = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (req.query.StartDate) {
                    $whereGiveBirth["GiveBirthDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                const queryGiveBirth =
                    Object.keys($whereGiveBirth).length > 0
                        ? { where: $whereGiveBirth }
                        : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let order = [[Animal, "FarmID", "ASC"]];

                const gb = await GiveBirth.findAll({
                    ...queryGiveBirth,
                    order: order,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                    include: [
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: AI,
                            as: "AI",
                        },
                    ],
                });

                let res = [];

                const sortAI = (el) => {
                    let resSort = {
                        AnimalID: el.AnimalID,
                        AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
                        AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                        PAR: el.PAR,
                        ThaiGiveBirthDate: el.GiveBirth
                            ? el.GiveBirth.ThaiGiveBirthDate
                            : "-",
                        TimeNo: el.AI ? el.AI.TimeNo : "-",
                        ThaiAIDate: el.AI ? el.AI.ThaiAIDate : "-",
                        ThaiReproduceDate: "-",
                        Symptom: "-",
                        Cure: "-",
                        BCS: "-",
                        ResponsibilityStaff: "-",
                    };

                    return resSort;
                };

                gb.forEach((el) => {
                    let latestArr = res[res.length - 1];

                    if (latestArr) {
                        if (el.Animal.FarmID == latestArr.FarmID) {
                            latestArr.GiveBirth.push(sortAI(el));
                        } else {
                            res.push({
                                FarmID: el.Animal.FarmID,
                                FarmName: el.Animal.AnimalFarm.FarmName,
                                AmphurName:
                                    el.Animal.AnimalFarm.Amphur.AmphurName,
                                ProvinceName:
                                    el.Animal.AnimalFarm.Province.ProvinceName,
                                GiveBirth: [sortAI(el)],
                            });
                        }
                    } else {
                        res.push({
                            FarmID: el.Animal.FarmID,
                            FarmName: el.Animal.AnimalFarm.FarmName,
                            AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                            ProvinceName:
                                el.Animal.AnimalFarm.Province.ProvinceName,
                            GiveBirth: [sortAI(el)],
                        });
                    }
                });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report12(req) {
        // report แก้ไขปัญหาทางระบบสืบพันธุ์
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereAnimal = {};
                let $whereReproduce = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.AnimalID) {
                    $whereAnimal["AnimalID"] = req.query.AnimalID;
                }

                if (req.query.ResponsibilityStaffID) {
                    $whereReproduce["ResponsibilityStaffID"] =
                        req.query.ResponsibilityStaffID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (req.query.StartDate) {
                    $whereReproduce["ReproduceDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                const queryReproduce =
                    Object.keys($whereReproduce).length > 0
                        ? { where: $whereReproduce }
                        : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const queryAnimal =
                    Object.keys($whereAnimal).length > 0
                        ? { where: $whereAnimal }
                        : {};

                let order = [[Animal, "FarmID", "ASC"]];

                const gb = await Reproduce.findAll({
                    ...queryReproduce,
                    order: order,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            ...queryAnimal,
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                },
                            ],
                        },
                        { model: Staff },
                    ],
                });

                let res = [];

                const sortAI = (el) => {
                    let resSort = {
                        AnimalID: el.AnimalID,
                        AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
                        AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                        FarmIdentificationNumber: el.Animal
                            ? el.Animal.AnimalFarm.FarmIdentificationNumber
                            : "-",
                        FarmName: el.Animal
                            ? el.Animal.AnimalFarm.FarmName
                            : "-",
                        PAR: 0,
                        ThaiReproduceDate: el.ThaiReproduceDate,
                        FarmerRemark: el.FarmerRemark,
                        Symptom: "-",
                        Cure: "-",
                        result: "-",
                        BCS: el.BCSID,
                        ResponsibilityStaff: el.Staff
                            ? el.Staff.StaffFullName
                            : "-",
                    };

                    return resSort;
                };

                gb.forEach((el) => {
                    res.push(sortAI(el));
                });

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    //
    report13_1(req) {
        // report รายงาน ผท6
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereAI = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                if (req.query.AIStartDate) {
                    $whereAI["AIDate"] = {
                        [Op.between]: [
                            req.query.AIStartDate,
                            req.query.AIEndDate,
                        ],
                    };
                }

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                let AIDate = {};
                if (req.query.StartDate) {
                    $whereAI["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                const queryAI =
                    Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let order = [[Animal, "FarmID", "ASC"]];

                const ai = await AI.findAll({
                    ...queryAI,
                    order: order,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                isRemove: 0,
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                    include: [
                                        { model: Amphur, as: "Amphur" },
                                        { model: Province, as: "Province" },
                                    ],
                                },
                                {
                                    model: Project,
                                    where: WhereProject,
                                },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        { model: Staff },
                        { model: Project },
                        {
                            model: PregnancyCheckup,
                            include: [{ model: PregnancyCheckStatus }],
                        },
                    ],
                });

                let res = [];

                let aiTotal = ai.length;
                let pregTotal = [0, 0, 0, 0];

                const sortAI = ai.map((el) => {
                    let pregnancyCheckup = "-";
                    if (el.PregnancyCheckups.length != 0) {
                        let pc =
                            el.PregnancyCheckups[
                                el.PregnancyCheckups.length - 1
                            ];
                        pregnancyCheckup =
                            pc.PregnancyCheckStatus.PregnancyCheckStatusName;
                    }

                    if (pregnancyCheckup == "ท้อง") {
                        pregTotal[0] = pregTotal[0] + 1;
                    } else if (pregnancyCheckup == "ไม่ท้อง") {
                        pregTotal[1] = pregTotal[1] + 1;
                    } else if (pregnancyCheckup == "รอตรวจซ้ำ") {
                        pregTotal[2] = pregTotal[2] + 1;
                    } else {
                        pregTotal[3] = pregTotal[3] + 1;
                    }

                    let resSort = {
                        FarmID: el.Animal.FarmID,
                        FarmName: el.Animal.AnimalFarm.FarmName,
                        AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                        ProvinceName:
                            el.Animal.AnimalFarm.Province.ProvinceName,
                        AnimalID: el.AnimalID,
                        AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
                        AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                        Par: el.PAR,
                        TimeNo: el.TimeNo,
                        SemenNumber: el.Semen ? el.Semen?.SemenNumber : "-",
                        ThaiAIDate: el.ThaiAIDate,
                        ResponsibilityStaffName: el.Staff
                            ? el.Staff.StaffFullName
                            : "-",
                        ProjectName: el.Project ? el.Project.ProjectName : "-",
                        pregnancyCheckup: pregnancyCheckup,
                    };

                    return resSort;
                });

                // ai.forEach((el) => {
                //   let latestArr = res[res.length - 1];

                //   if (latestArr) {
                //     if (el.Animal.FarmID == latestArr.FarmID) {
                //       latestArr.AI.push(sortAI(el));
                //     } else {
                //       res.push({
                //         FarmID: el.Animal.FarmID,
                //         FarmName: el.Animal.AnimalFarm.FarmName,
                //         AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                //         ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
                //         AI: [sortAI(el)],
                //       });
                //     }
                //   } else {
                //     res.push({
                //       FarmID: el.Animal.FarmID,
                //       FarmName: el.Animal.AnimalFarm.FarmName,
                //       AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
                //       ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
                //       AI: [sortAI(el)],
                //     });
                //   }
                // });

                resolve({
                    Total: aiTotal,
                    preg1: pregTotal[0],
                    preg2: pregTotal[1],
                    preg3: pregTotal[2],
                    preg4: pregTotal[3],
                    sd: "dsadasd",
                    //   Farm: res,
                    ai: sortAI,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report13(req) {
        // report รายงานครบกำหนดตรวจท้อง
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };

                $whereAnimal["isRemove"] = 0;
                $whereAnimal["AnimalAlive"] = 1;

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                $where["AIDate"] = {
                    [Op.between]: [
                        dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                        dayjs().format("YYYY-MM-DD"),
                    ],
                };

                $where["isRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                //

                // const preg = await PregnancyCheckup.findAll({
                //   ...query,
                //   //   where:where(fn('date', col('CreatedDatetime')), '<=', '2016-10-10'),
                //   //   where: where(
                //   //     col("CreatedDatetime"),
                //   //     '>',
                //   //     "2016-10-10"
                //   //   ),
                //   include: [
                //     {
                //       model: Animal,
                //       as: "Animal",
                //       where: {
                //         AnimalTypeID: {
                //           [Op.in]: JSON.parse(req.query.AnimalTypeID),
                //         },
                //       },
                //       include: [
                //         {
                //           model: Farm,
                //           as: "AnimalFarm",
                //           ...queryFarm,
                //           include: [
                //             {
                //               model: Project,
                //               where: WhereProject,
                //             },
                //           ],
                //           //   ...queryFarm,
                //         },
                //         { model: AnimalStatus, as: "AnimalStatus" },
                //       ],
                //     },
                //     {
                //       model: AI,
                //       as: "AI",
                //       include: [
                //         {
                //           model: Semen,
                //           as: "Semen",
                //         },
                //       ],
                //     },
                //     {
                //       model: Staff,
                //     },
                //     {
                //       model: PregnancyCheckStatus,
                //     },
                //   ],
                // });
                let animal = [];

                const ai = await AI.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: $whereAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        {
                            model: Staff,
                        },
                        {
                            model: PregnancyCheckup,
                            required: false,
                        },
                        {
                            model: GiveBirth,
                            required: false,
                        },
                    ],
                });

                const ai_all = ai.filter((x) => {
                    return true;
                });

                let animal_duplicate = [];

                ai_all.forEach((x) => {
                    let check = animal_duplicate.findIndex((e) => {
                        return e.AnimalID == x.AnimalID && e.PAR == x.PAR;
                    });

                    if (check >= 0) {
                        if (x.TimeNo > animal_duplicate[check].TimeNo) {
                            animal_duplicate.splice(check, 1);
                            //   delete animal_duplicate[check];
                            animal_duplicate.push({
                                AnimalID: x.AnimalID,
                                AIID: x.AIID,
                                PAR: x.PAR,
                                TimeNo: x.TimeNo,
                            });
                        }
                    } else {
                        animal_duplicate.push({
                            AnimalID: x.AnimalID,
                            AIID: x.AIID,
                            PAR: x.PAR,
                            TimeNo: x.TimeNo,
                        });
                    }
                });

                ai_all.forEach((x) => {
                    //   let checkAnimal = animal.find((a) => {
                    //     return x.Animal.AnimalID == a.AnimalID;
                    //   });

                    if (x.GiveBirth == null) {
                        let check1 = animal_duplicate.find((e) => {
                            return e.AIID == x.AIID;
                        });

                        if (check1) {
                            // console.log(x);
                            if (x.Animal.AnimalName == "บานชื่น") {
                                console.log(x.AIID);
                                console.log("<br>");
                                console.log(x.TimeNo);
                                console.log("<br>");
                                console.log(x.PAR);
                                console.log("<br>");
                                console.log(x.Animal.AnimalName);
                                console.log("<br>");
                                console.log(x.PregnancyCheckups.length);
                            }

                            if (x.PregnancyCheckups.length != 0) {
                                let preg = {};
                                let checkBirth = 0;

                                for (
                                    let index = 0;
                                    index < x.PregnancyCheckups.length;
                                    index++
                                ) {
                                    if (
                                        x.PregnancyCheckups[index]
                                            .PregnancyCheckStatusID == 1 ||
                                        x.PregnancyCheckups[index]
                                            .PregnancyCheckStatusID == 2
                                    ) {
                                        checkBirth = 1;
                                    } else {
                                        preg["CheckUpdate"] =
                                            x.PregnancyCheckups[
                                                index
                                            ].CheckupDate;
                                        preg["CheckUpStatus"] =
                                            x.PregnancyCheckups[
                                                index
                                            ].PregnancyCheckStatusID;
                                    }
                                }

                                if (checkBirth == 0) {
                                    animal.push({
                                        AIID: x.AIID,
                                        AnimalID: x.Animal.AnimalID,
                                        AnimalSecretStatus:
                                            x.Animal.AnimalSecretStatus,
                                        FarmIdentificationNumber:
                                            x.Animal.AnimalFarm
                                                .FarmIdentificationNumber,
                                        FarmName: x.Animal.AnimalFarm.FarmName,
                                        FarmAddress:
                                            x.Animal.AnimalFarm?.FarmAddress,
                                        FarmProvince:
                                            x.Animal.AnimalFarm?.Province
                                                ?.ProvinceName,
                                        FarmAmphur:
                                            x.Animal.AnimalFarm?.Amphur
                                                ?.AmphurName,
                                        FarmTumbol:
                                            x.Animal.AnimalFarm?.Tumbol
                                                ?.TumbolName,
                                        AnimalEarID: x.Animal.AnimalEarID,
                                        AnimalName: x.Animal.AnimalName,
                                        AnimalStatusName:
                                            x.Animal.AnimalStatus
                                                ?.AnimalStatusName,
                                        AnimalPar: x.PAR,
                                        SemenNumber: x.Semen?.SemenNumber,
                                        TimeNo: x.TimeNo,
                                        AIDate: x.AIDate
                                            ? dayjs(x.AIDate)
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : "",
                                        Day: x.AIDate
                                            ? dayjs().diff(
                                                  dayjs(x.AIDate),
                                                  "day"
                                              )
                                            : "",
                                        PregnancyCheckup: preg,
                                        ResponsibilityStaffName:
                                            x.Staff?.StaffGivenName +
                                            " " +
                                            x.Staff?.StaffSurname,
                                        PregnancyCheckupDate: "",
                                        PregnancyCheckupStatus: "",
                                    });
                                }
                            } else {
                                let preg = {};
                                preg["CheckUpdate"] = "";
                                preg["CheckUpStatus"] = "";

                                animal.push({
                                    AIID: x.AIID,
                                    AnimalID: x.Animal.AnimalID,
                                    AnimalSecretStatus:
                                        x.Animal.AnimalSecretStatus,
                                    FarmIdentificationNumber:
                                        x.Animal.AnimalFarm
                                            .FarmIdentificationNumber,
                                    FarmName: x.Animal.AnimalFarm.FarmName,
                                    FarmAddress:
                                        x.Animal.AnimalFarm?.FarmAddress,
                                    FarmProvince:
                                        x.Animal.AnimalFarm?.Province
                                            ?.ProvinceName,
                                    FarmAmphur:
                                        x.Animal.AnimalFarm?.Amphur?.AmphurName,
                                    FarmTumbol:
                                        x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                                    AnimalEarID: x.Animal.AnimalEarID,
                                    AnimalName: x.Animal.AnimalName,
                                    AnimalStatusName:
                                        x.Animal.AnimalStatus?.AnimalStatusName,
                                    AnimalPar: x.PAR,
                                    SemenNumber: x.Semen?.SemenNumber,
                                    TimeNo: x.TimeNo,
                                    AIDate: x.AIDate
                                        ? dayjs(x.AIDate)
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "",
                                    Day: x.AIDate
                                        ? dayjs().diff(dayjs(x.AIDate), "day")
                                        : "",
                                    PregnancyCheckup: preg,
                                    ResponsibilityStaffName:
                                        x.Staff?.StaffGivenName +
                                        " " +
                                        x.Staff?.StaffSurname,
                                    PregnancyCheckupDate: "",
                                    PregnancyCheckupStatus: "",
                                    // isActive: x.Animal.isActive,
                                });
                            }
                        }
                    }
                });

                if (req.query.Day) {
                    animal = animal.filter((x) => {
                        return x.Day < Number(req.query.Day) + 1;
                    });
                }

                resolve({
                    data: animal,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    //   report13(req) {
    //     // report รายงาน ผท6
    //     return new Promise(async (resolve, reject) => {
    //       try {
    //         // let $where = {};
    //         let $whereFarm = {};
    //         let $whereAI = {};

    //         if (req.query.OrganizationID) {
    //           $whereFarm["OrganizationID"] = req.query.OrganizationID;
    //         }

    //         if (req.query.ProjectID) {
    //           $whereAI["ProjectID"] = req.query.ProjectID;
    //         }

    //         let provinceIDArr = [];
    //         if (!req.query.ProvinceID) {
    //           if (req.query.OrganizationZoneID) {
    //             const province = await Province.findAll({
    //               where: { OrganizationZoneID: req.query.OrganizationZoneID },
    //             });

    //             province.forEach((p) => {
    //               provinceIDArr.push(p.ProvinceID);
    //             });
    //           }

    //           if (req.query.AIZoneID) {
    //             provinceIDArr = [];
    //             const province = await Province.findAll({
    //               where: { AIZoneID: req.query.AIZoneID },
    //             });

    //             province.forEach((p) => {
    //               provinceIDArr.push(p.ProvinceID);
    //             });
    //           }
    //         }

    //         if (req.query.TumbolID) {
    //           $whereFarm["FarmTumbolID"] = req.query.TumbolID;
    //         }

    //         if (req.query.AmphurID) {
    //           $whereFarm["FarmAmphurID"] = req.query.AmphurID;
    //         }

    //         if (req.query.ProvinceID) {
    //           provinceIDArr = [req.query.ProvinceID];
    //         }

    //         if (provinceIDArr.length != 0) {
    //           $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
    //         }

    //         if (req.query.FarmID) {
    //           $whereFarm["FarmID"] = req.query.FarmID;
    //         }

    //         let AIDate = {};
    //         if (req.query.StartDate) {
    //           $whereAI["AIDate"] = {
    //             [Op.between]: [
    //               dayjs(req.query.StartDate).format("YYYY-MM-DD"),
    //               dayjs(req.query.EndDate).format("YYYY-MM-DD"),
    //             ],
    //           };
    //         }

    //         const queryAI =
    //           Object.keys($whereAI).length > 0 ? { where: $whereAI } : {};

    //         const query =
    //           Object.keys($whereFarm).length > 0 ? { where: $whereFarm } : {};

    //         let order = [[Animal, "FarmID", "ASC"]];

    //         const ai = await AI.findAll({
    //           ...queryAI,
    //           order: order,
    //           include: [
    //             {
    //               model: Animal,
    //               as: "Animal",
    //               where: {
    //                 AnimalTypeID: {
    //                   [Op.in]: JSON.parse(req.query.AnimalTypeID),
    //                 },
    //               },
    //               include: [
    //                 {
    //                   model: Farm,
    //                   as: "AnimalFarm",
    //                   ...query,
    //                   include: [
    //                     { model: Amphur, as: "Amphur" },
    //                     { model: Province, as: "Province" },
    //                   ],
    //                 },
    //               ],
    //             },
    //             {
    //               model: Semen,
    //               as: "Semen",
    //             },
    //             { model: Staff },
    //             { model: Project },
    //             {
    //               model: PregnancyCheckup,
    //               include: [{ model: PregnancyCheckStatus }],
    //             },
    //           ],
    //         });

    //         let res = [];

    //         let aiTotal = ai.length;
    //         let pregTotal = [0, 0, 0, 0];

    //         const sortAI = (el) => {
    //           let pregnancyCheckup = "-";
    //           if (el.PregnancyCheckups.length != 0) {
    //             let pc = el.PregnancyCheckups[el.PregnancyCheckups.length - 1];
    //             pregnancyCheckup = pc.PregnancyCheckStatus.PregnancyCheckStatusName;
    //           }

    //           if (pregnancyCheckup == "ท้อง") {
    //             pregTotal[0] = pregTotal[0] + 1;
    //           } else if (pregnancyCheckup == "ไม่ท้อง") {
    //             pregTotal[1] = pregTotal[1] + 1;
    //           } else if (pregnancyCheckup == "รอตรวจซ้ำ") {
    //             pregTotal[2] = pregTotal[2] + 1;
    //           } else {
    //             pregTotal[3] = pregTotal[3] + 1;
    //           }

    //           let resSort = {
    //             AnimalID: el.AnimalID,
    //             AnimalEarID: el.Animal ? el.Animal.AnimalEarID : "-",
    //             AnimalName: el.Animal ? el.Animal.AnimalName : "-",
    //             Par: el.PAR,
    //             TimeNo: el.TimeNo,
    //             SemenNumber: el.Semen ? el.Semen.SemenNumber : "-",
    //             ThaiAIDate: el.ThaiAIDate,
    //             ResponsibilityStaffName: el.Staff ? el.Staff.StaffFullName : "-",
    //             ProjectName: el.Project ? el.Project.ProjectName : "-",
    //             pregnancyCheckup: pregnancyCheckup,
    //           };

    //           return resSort;
    //         };

    //         ai.forEach((el) => {
    //           let latestArr = res[res.length - 1];

    //           if (latestArr) {
    //             if (el.Animal.FarmID == latestArr.FarmID) {
    //               latestArr.AI.push(sortAI(el));
    //             } else {
    //               res.push({
    //                 FarmID: el.Animal.FarmID,
    //                 FarmName: el.Animal.AnimalFarm.FarmName,
    //                 AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
    //                 ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
    //                 AI: [sortAI(el)],
    //               });
    //             }
    //           } else {
    //             res.push({
    //               FarmID: el.Animal.FarmID,
    //               FarmName: el.Animal.AnimalFarm.FarmName,
    //               AmphurName: el.Animal.AnimalFarm.Amphur.AmphurName,
    //               ProvinceName: el.Animal.AnimalFarm.Province.ProvinceName,
    //               AI: [sortAI(el)],
    //             });
    //           }
    //         });

    //         resolve({
    //           Total: aiTotal,
    //           preg1: pregTotal[0],
    //           preg2: pregTotal[1],
    //           preg3: pregTotal[2],
    //           preg4: pregTotal[3],
    //           Farm: res,
    //         });
    //       } catch (error) {
    //         reject(ErrorNotFound(error));
    //       }
    //     });
    //   },

    //   รายงายที่ 14 รายงานหน้าแรก
    report14(req) {
        return new Promise(async (resolve, reject) => {
            try {
                // resolve(null);
                // Search
                let $where = {};
                let FarmAnimalType = null;
                // ZoneID อ้างจากจังหวัด

                if (req.query.ProvinceID)
                    $where["FarmProvinceID"] = req.query.ProvinceID;

                if (req.query.AmphurID)
                    $where["FarmAmphurID"] = req.query.AmphurID;

                if (req.query.TumbolID)
                    $where["FarmTumbolID"] = req.query.TumbolID;

                $whereProvince = {};
                if (req.query.ZoneID)
                    $whereProvince["OrganizationZoneID"] =
                        req.query.OrganizationZoneID;

                if (req.query.AIZoneID)
                    $whereProvince["AIZoneID"] = req.query.AIZoneID;

                if (req.query.OrganizationID)
                    $where["OrganizationID"] = req.query.OrganizationID;

                let AnimalTypeID = JSON.parse(req.query.AnimalTypeID);
                let AnimalStatusID = [];

                if (AnimalTypeID.includes(1) || AnimalTypeID.includes(2)) {
                    $where["FarmAnimalType"] = {
                        [Op.like]: "%1%",
                    };
                    AnimalStatusID = [5, 3, 2, 1];
                } else if (
                    AnimalTypeID.includes(3) ||
                    AnimalTypeID.includes(4)
                ) {
                    $where["FarmAnimalType"] = {
                        [Op.like]: "%2%",
                    };
                    AnimalStatusID = [10, 8, 7, 6];
                } else if (
                    AnimalTypeID.includes(17) ||
                    AnimalTypeID.includes(18)
                ) {
                    $where["FarmAnimalType"] = {
                        [Op.like]: "%3%",
                    };
                    AnimalStatusID = [15, 13, 12, 11];
                } else {
                }

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryProvince =
                    Object.keys($whereProvince).length > 0
                        ? { where: $whereProvince }
                        : {};

                let mom = 0;
                let young = 0;
                let child2 = 0;
                let child = 0;
                let total = 0;

                let AiZone = await AIZone.findAll({
                    where: { isActive: 1 },
                    raw: true,
                });

                let farms = await Farm.findAll({
                    ...query,
                    include: { model: Province, as: "Province", queryProvince },
                    raw: true,
                });

                let animal = await Animal.findAll({
                    where: {
                        AnimalSexID: 2,
                        AnimalTypeID: { [Op.in]: AnimalTypeID },
                    },
                    raw: true,
                });

                let ai = await AI.findAll({
                    where: { isActive: 1 },
                });

                let transferEmbryo = await TransferEmbryo.findAll({
                    where: { isActive: 1 },
                });

                let pregnancyCheckup = await PregnancyCheckup.findAll({
                    where: { isActive: 1, PregnancyCheckStatusID: 1 },
                });

                let giveBirth = await GiveBirth.findAll({
                    where: { isActive: 1 },
                });

                let abort = await AbortCheckup.findAll({
                    where: { isActive: 1 },
                });

                farms = await Promise.all(
                    farms.map(async (e) => {
                        let f = {
                            FarmIdentificationNumber:
                                e.FarmIdentificationNumber,
                            FarmName: e.FarmName,
                            mom: 0,
                            young: 0,
                            child2: 0,
                            child: 0,
                            total: 0,
                            countAI: 0,
                            countTransferEmbryo: 0,
                            countPregnancy: 0,
                            countGiveBirth: 0,
                            countAbort: 0,
                            countGiveBirthAmount: 0,
                        };

                        // แม่พันธุ์
                        let animalFarm = animal.filter((x) => {
                            return x.FarmID == e.FarmID;
                        });

                        animalFarm.map((x) => {
                            let aiCheck = ai.filter((e) => {
                                return x.AnimalID == e.AnimalID;
                            });

                            let transferEmbryoCheck = transferEmbryo.filter(
                                (e) => {
                                    return x.AnimalID == e.AnimalID;
                                }
                            );

                            let pregnancyCheckupCheck = pregnancyCheckup.filter(
                                (e) => {
                                    return x.AnimalID == e.AnimalID;
                                }
                            );

                            let giveBirthCheck = giveBirth.filter((e) => {
                                return x.AnimalID == e.AnimalID;
                            });

                            giveBirthCheck.forEach((e) => {
                                f.countGiveBirthAmount =
                                    e.Amount + f.countGiveBirthAmount;
                            });

                            let abortCheck = abort.filter((e) => {
                                return x.AnimalID == e.AnimalID;
                            });

                            f.countAI = f.countAI + aiCheck.length;
                            f.countTransferEmbryo =
                                f.countTransferEmbryo +
                                transferEmbryoCheck.length;
                            f.countPregnancy =
                                f.countPregnancy + pregnancyCheckupCheck.length;
                            f.countGiveBirth =
                                f.countGiveBirth + giveBirthCheck.length;
                            f.countGiveBirthAmount = f.countGiveBirthAmount;
                            f.countAbort = f.countAbort + abortCheck.length;
                        });

                        AiZone = AiZone.map((a) => {
                            if (e.AIZoneID == a.AIZoneID) {
                                if (a.hasOwnProperty("countFarm")) {
                                    a.countFarm = a.countFarm + 1;
                                } else {
                                    a.countFarm = 1;
                                }

                                if (a.hasOwnProperty("countAI")) {
                                    a.countAI = a.countAI + f.countAI;
                                } else {
                                    a.countAI = f.countAI;
                                }

                                if (a.hasOwnProperty("countTransferEmbryo")) {
                                    a.countTransferEmbryo =
                                        a.countTransferEmbryo +
                                        f.countTransferEmbryo;
                                } else {
                                    a.countTransferEmbryo =
                                        f.countTransferEmbryo;
                                }

                                if (a.hasOwnProperty("countPregnancy")) {
                                    a.countPregnancy =
                                        a.countPregnancy + f.countPregnancy;
                                } else {
                                    a.countPregnancy = f.countPregnancy;
                                }

                                if (a.hasOwnProperty("countGiveBirth")) {
                                    a.countGiveBirth =
                                        a.countGiveBirth + f.countGiveBirth;
                                } else {
                                    a.countGiveBirth = f.countGiveBirth;
                                }

                                if (a.hasOwnProperty("countGiveBirthAmount")) {
                                    a.countGiveBirthAmount =
                                        a.countGiveBirthAmount +
                                        f.countGiveBirthAmount;
                                } else {
                                    a.countGiveBirthAmount =
                                        f.countGiveBirthAmount;
                                }

                                if (a.hasOwnProperty("countAbort")) {
                                    a.countAbort = a.countAbort + f.countAbort;
                                } else {
                                    a.countAbort = f.countAbort;
                                }
                            }
                            return a;
                        });

                        let animalStatus1 = [];
                        let animalStatus2 = [];
                        let animalStatus3 = [];
                        let animalStatus4 = [];

                        if (animalFarm.length != 0) {
                            animalStatus1 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[0];
                            });

                            animalStatus2 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[1];
                            });

                            animalStatus3 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[2];
                            });

                            animalStatus4 = animalFarm.filter((x) => {
                                return x.AnimalStatusID == AnimalStatusID[3];
                            });
                        }

                        f.mom = animalStatus1.length;
                        f.young = animalStatus2.length;
                        f.child2 = animalStatus3.length;
                        f.child = animalStatus4.length;

                        f.total = f.mom + f.young + f.child2 + f.child;

                        mom += f.mom;
                        young += f.young;
                        child2 += f.child2;
                        child += f.child;
                        total += f.total;

                        return f;
                    })
                );

                let data = {
                    Mom: mom,
                    Young: young,
                    Child2: child2,
                    Child: child,
                    Total: total,
                    Farms: farms,
                    FarmCount: farms.length,
                    AiZone: AiZone,
                };
                resolve(data);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report15mother(req) {
        // report รายงาน สรุปตรวจท้อง - Optimized version
        return new Promise(async (resolve, reject) => {
            try {
                // Pre-format dates to avoid repeated dayjs calls
                const startDate = req.query.StartDate ? dayjs(req.query.StartDate).format("YYYY-MM-DD") : null;
                const endDate = req.query.EndDate ? dayjs(req.query.EndDate).format("YYYY-MM-DD") : null;
                const startDateCreated = req.query.StartDate_Created ? dayjs(req.query.StartDate_Created).format("YYYY-MM-DD") : null;
                const endDateCreated = req.query.EndDate_Created ?  dayjs(req.query.EndDate_Created).endOf('day').format("YYYY-MM-DD HH:mm:ss") : null;

                // Build where conditions
                let $where = {};
                let $whereAnimal = {};
                let $whereStaff = {};
                let $whereOrganization = {};

                // Date filters
                if (startDate && endDate) {
                    $where["CheckupDate"] = { [Op.between]: [startDate, endDate] };
                }

                if (startDateCreated && endDateCreated) {
                    $where["Createddatetime"] = { [Op.between]: [startDateCreated, endDateCreated] };
                }

                // Organization filters
                if (req.query.StaffID) {
                    $whereStaff["StaffID"] = req.query.StaffID;
                } else if (req.query.OrganizationID) {
                    $whereOrganization["OrganizationID"] = req.query.OrganizationID;
                } else if (req.query.TumbolID) {
                    $whereOrganization["OrganizationTumbolID"] = req.query.TumbolID;
                } else if (req.query.AmphurID) {
                    $whereOrganization["StaffAmphurID"] = req.query.AmphurID;
                } else if (req.query.ProvinceID) {
                    $whereOrganization["OrganizationProvinceID"] = req.query.ProvinceID;
                } else {
                    if (req.query.OrganizationAiZoneID) {
                        $whereOrganization["OrganizationAiZoneID"] = req.query.OrganizationAiZoneID;
                    } else {
                        $whereOrganization["OrganizationZoneID"] = req.query.OrganizationZoneID;
                    }
                }

                // Get staff IDs based on organization filters
                let staffIds = [];
                if (!req.query.StaffID) {
                    $whereOrganization["isActive"] = 1;
                    $whereOrganization["isRemove"] = 0;

                    const organizations = await Organization.findAll({
                        where: Object.keys($whereOrganization).length > 0 ? $whereOrganization : {},
                        attributes: ['OrganizationID']
                    });

                    const organizationIds = organizations.map(org => org.OrganizationID);
                    
                    $whereStaff["StaffOrganizationID"] = { [Op.in]: organizationIds };
                }

                // Staff filters
                $whereStaff["isRemove"] = 0;
                $whereStaff["isActive"] = req.query.StaffIsActive || 1;
                $whereStaff["StaffStatus"] = { [Op.notIn]: ["ลาออก", "ตาย"] };

                const staff = await Staff.findAll({
                    where: $whereStaff,
                    attributes: ['StaffID']
                });

                staffIds = staff.map(s => s.StaffID);
                $where["ResponsibilityStaffID"] = { [Op.in]: staffIds };

                // Animal filters
                $whereAnimal["AnimalTypeID"] = { [Op.in]: JSON.parse(req.query.AnimalTypeID) };
                $whereAnimal["isRemove"] = 0;
                $whereAnimal["isActive"] = 1;
                $whereAnimal["AnimalAlive"] = 1;

                $where["isActive"] = 1;
                $where["isRemove"] = 0;

                // Project filter
                let whereProject = null;
                if (req.query.Projects && req.query.Projects !== "[]") {
                    whereProject = {
                        ProjectID: { [Op.in]: JSON.parse(req.query.Projects) }
                    };
                }

                // Single optimized query with all includes
                const preg = await PregnancyCheckup.findAll({
                    where: $where,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: $whereAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    where: { isRemove: 0 },
                                    include: whereProject ? [{ model: Project, where: whereProject }] : []
                                },
                                { 
                                    model: AnimalStatus, 
                                    as: "AnimalStatus",
                                    attributes: ['AnimalStatusName']
                                }
                            ],
                            attributes: [
                                'AnimalID', 'AnimalEarID', 'AnimalName', 'AnimalBreedID1', 
                                'FarmID', 'AnimalTypeID'
                            ]
                        },
                        {
                            model: AI,
                            as: "AI",
                            where: { isActive: 1, isRemove: 0 },
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                    attributes: ['SemenNumber', 'AnimalBreedAll'],
                                    include: [
                                        { model: AnimalBreed, as: "AnimalBreed1", attributes: ['AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed2", attributes: ['AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed3", attributes: ['AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed4", attributes: ['AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed5", attributes: ['AnimalBreedName', 'AnimalBreedShortName'] }
                                    ]
                                }
                            ],
                            attributes: ['AIDate', 'PAR', 'SemenID']
                        },
                        {
                            model: Staff,
                            attributes: ['StaffGivenName', 'StaffSurname']
                        },
                        {
                            model: PregnancyCheckStatus,
                            attributes: ['PregnancyCheckStatusName']
                        }
                    ],
                    attributes: ['CheckupDate', 'Createddatetime', 'ResponsibilityStaffID']
                });

                // Pre-load all breeds for faster lookup
                const breedMap = new Map();
                const allBreeds = await AnimalBreed.findAll({
                    attributes: ['AnimalBreedID', 'AnimalBreedName', 'AnimalBreedShortName'],
                    raw: true
                });
                allBreeds.forEach(breed => {
                    breedMap.set(breed.AnimalBreedID, breed);
                });

                // Filter and process data efficiently
                const validRecords = preg.filter(x => x.AI && x.Animal && x.Animal.AnimalBreedID1 && x.AI.SemenID);
                
                // Use Map for O(1) breed lookup instead of O(n) find operations
                const breedGroups = new Map();

                validRecords.forEach(record => {
                    const breedId = record.Animal.AnimalBreedID1;
                    
                    if (!breedGroups.has(breedId)) {
                        breedGroups.set(breedId, {
                            AnimalBreedID: breedId,
                            AnimalID: [],
                            AnimalIDSet: new Set(), // ใช้ Set เพื่อนับสัตว์ไม่ซ้ำ
                            FarmID: new Set(),
                            PregnancyCheckupCount: 0
                        });
                    }

                    const breedGroup = breedGroups.get(breedId);
                    
                    // นับจำนวนครั้งตรวจท้อง
                    breedGroup.PregnancyCheckupCount++;
                    
                    // นับสัตว์ไม่ซ้ำ
                    breedGroup.AnimalIDSet.add(record.Animal.AnimalID);
                    
                    // Format dates once per record
                    const aiDate = record.AI.AIDate ? dayjs(record.AI.AIDate).locale("th").format("DD MMM BB") : null;
                    const checkupDate = record.CheckupDate ? dayjs(record.CheckupDate).locale("th").format("DD MMM BB") : null;
                    const betweenDate = record.CheckupDate && record.AI.AIDate ? 
                        dayjs(record.CheckupDate).diff(dayjs(record.AI.AIDate), "day") : null;

                    breedGroup.AnimalID.push({
                        AnimalID: record.Animal.AnimalID,
                        FarmIdentificationNumber: record.Animal.AnimalFarm?.FarmIdentificationNumber,
                        FarmName: record.Animal.AnimalFarm?.FarmName,
                        AnimalEarID: record.Animal.AnimalEarID,
                        AnimalName: record.Animal.AnimalName,
                        AnimalStatusName: record.Animal.AnimalStatus?.AnimalStatusName,
                        SemenNumber: record.AI.Semen?.SemenNumber,
                        SemenBreedAll: record.AI.Semen?.AnimalBreedAll,
                        AnimalPar: record.AI.PAR,
                        AIDate: aiDate,
                        CheckupDateReal: record.CheckupDate,
                        CheckupDate: checkupDate,
                        PregnancyCheckStatusName: record.PregnancyCheckStatus?.PregnancyCheckStatusName,
                        BetweenDate: betweenDate,
                        ResponsibilityStaffName: `${record.Staff?.StaffGivenName || ''} ${record.Staff?.StaffSurname || ''}`.trim()
                    });

                    breedGroup.FarmID.add(record.Animal.FarmID);
                });

                // Convert Map to array and add breed information
                const breed = Array.from(breedGroups.values()).map(breedGroup => {
                    const breedInfo = breedMap.get(breedGroup.AnimalBreedID);
                    
                    // Sort animals by checkup date (newest first)
                    breedGroup.AnimalID.sort((a, b) => {
                        if (!a.CheckupDateReal || !b.CheckupDateReal) return 0;
                        return new Date(b.CheckupDateReal) - new Date(a.CheckupDateReal);
                    });

                    return {
                        AnimalBreedID: breedGroup.AnimalBreedID,
                        AnimalBreedName: breedInfo ? 
                            `${breedInfo.AnimalBreedName} (${breedInfo.AnimalBreedShortName})` : 
                            'Unknown Breed',
                        AnimalID: breedGroup.AnimalID,
                        AnimalRealCount: breedGroup.AnimalIDSet.size, // ใช้ Set size เพื่อนับสัตว์ไม่ซ้ำ
                        AnimalCount: breedGroup.AnimalIDSet.size, // ใช้ Set size เพื่อนับสัตว์ไม่ซ้ำ
                        FarmCount: breedGroup.FarmID.size,
                        PregnancyCheckupCount: breedGroup.PregnancyCheckupCount
                    };
                });

                // Sort breeds by animal count (descending)
                breed.sort((a, b) => b.AnimalRealCount - a.AnimalRealCount);

                resolve({ data: breed });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report15(req) {
        // report รายงาน สรุปตรวจท้อง - Optimized version
        return new Promise(async (resolve, reject) => {
            try {
                // Pre-format dates to avoid repeated dayjs calls
                const startDate = req.query.StartDate ? dayjs(req.query.StartDate).format("YYYY-MM-DD") : null;
                const endDate = req.query.EndDate ? dayjs(req.query.EndDate).format("YYYY-MM-DD") : null;
                const startDateCreated = req.query.StartDate_Created ? dayjs(req.query.StartDate_Created).format("YYYY-MM-DD") : null;
                const endDateCreated = req.query.EndDate_Created ?  dayjs(req.query.EndDate_Created).endOf('day').format("YYYY-MM-DD HH:mm:ss") : null;

                // Build where conditions
                let $where = {};
                let $whereAnimal = {};
                let $whereStaff = {};
                let $whereOrganization = {};

                // Date filters
                if (startDate && endDate) {
                    $where["CheckupDate"] = { [Op.between]: [startDate, endDate] };
                }

                if (startDateCreated && endDateCreated) {
                    $where["Createddatetime"] = { [Op.between]: [startDateCreated, endDateCreated] };
                }

                // Organization filters
                if (req.query.StaffID) {
                    $whereStaff["StaffID"] = req.query.StaffID;
                } else if (req.query.OrganizationID) {
                    $whereOrganization["OrganizationID"] = req.query.OrganizationID;
                } else if (req.query.TumbolID) {
                    $whereOrganization["OrganizationTumbolID"] = req.query.TumbolID;
                } else if (req.query.AmphurID) {
                    $whereOrganization["StaffAmphurID"] = req.query.AmphurID;
                } else if (req.query.ProvinceID) {
                    $whereOrganization["OrganizationProvinceID"] = req.query.ProvinceID;
                } else {
                    if (req.query.OrganizationAiZoneID) {
                        $whereOrganization["OrganizationAiZoneID"] = req.query.OrganizationAiZoneID;
                    } else {
                        $whereOrganization["OrganizationZoneID"] = req.query.OrganizationZoneID;
                    }
                }

                // Get staff IDs based on organization filters
                let staffIds = [];
                if (!req.query.StaffID) {
                    $whereOrganization["isActive"] = 1;
                    $whereOrganization["isRemove"] = 0;

                    const organizations = await Organization.findAll({
                        where: Object.keys($whereOrganization).length > 0 ? $whereOrganization : {},
                        attributes: ['OrganizationID']
                    });

                    const organizationIds = organizations.map(org => org.OrganizationID);
                    
                    $whereStaff["StaffOrganizationID"] = { [Op.in]: organizationIds };
                }

                // Staff filters
                $whereStaff["isRemove"] = 0;
                $whereStaff["isActive"] = req.query.StaffIsActive || 1;
                $whereStaff["StaffStatus"] = { [Op.notIn]: ["ลาออก", "ตาย"] };

                const staff = await Staff.findAll({
                    where: $whereStaff,
                    attributes: ['StaffID']
                });

                staffIds = staff.map(s => s.StaffID);
                $where["ResponsibilityStaffID"] = { [Op.in]: staffIds };

                // Animal filters
                $whereAnimal["AnimalTypeID"] = { [Op.in]: JSON.parse(req.query.AnimalTypeID) };
                $whereAnimal["isRemove"] = 0;
                $whereAnimal["isActive"] = 1;
                $whereAnimal["AnimalAlive"] = 1;

                $where["isActive"] = 1;
                $where["isRemove"] = 0;

                // Project filter
                let whereProject = null;
                if (req.query.Projects && req.query.Projects !== "[]") {
                    whereProject = {
                        ProjectID: { [Op.in]: JSON.parse(req.query.Projects) }
                    };
                }

                // Single optimized query with all includes
                const preg = await PregnancyCheckup.findAll({
                    where: $where,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: $whereAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    where: { isRemove: 0 },
                                    include: whereProject ? [{ model: Project, where: whereProject }] : []
                                },
                                { 
                                    model: AnimalStatus, 
                                    as: "AnimalStatus",
                                    attributes: ['AnimalStatusName']
                                }
                            ],
                            attributes: [
                                'AnimalID', 'AnimalEarID', 'AnimalName', 'AnimalBreedID1', 
                                'FarmID', 'AnimalTypeID'
                            ]
                        },
                        {
                            model: AI,
                            as: "AI",
                            where: { isActive: 1, isRemove: 0 },
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                    attributes: ['SemenNumber', 'AnimalBreedAll'],
                                    include: [
                                        { model: AnimalBreed, as: "AnimalBreed1", attributes: ['AnimalBreedID','AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed2", attributes: ['AnimalBreedID','AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed3", attributes: ['AnimalBreedID','AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed4", attributes: ['AnimalBreedID','AnimalBreedName', 'AnimalBreedShortName'] },
                                        { model: AnimalBreed, as: "AnimalBreed5", attributes: ['AnimalBreedID','AnimalBreedName', 'AnimalBreedShortName'] }
                                    ]
                                }
                            ],
                            attributes: ['AIDate', 'PAR', 'SemenID']
                        },
                        {
                            model: Staff,
                            attributes: ['StaffGivenName', 'StaffSurname']
                        },
                        {
                            model: PregnancyCheckStatus,
                            attributes: ['PregnancyCheckStatusName']
                        }
                    ],
                    attributes: ['CheckupDate', 'Createddatetime', 'ResponsibilityStaffID']
                });

                // Pre-load all breeds for faster lookup
                const breedMap = new Map();
                const allBreeds = await AnimalBreed.findAll({
                    attributes: ['AnimalBreedID', 'AnimalBreedName', 'AnimalBreedShortName'],
                    raw: true
                });
                allBreeds.forEach(breed => {
                    breedMap.set(breed.AnimalBreedID, breed);
                });

                // Filter and process data efficiently
                const validRecords = preg.filter(x => x.AI && x.Animal && x.AI.Semen && x.AI.Semen.AnimalBreed1 && x.AI.SemenID);
                
                // Use Map for O(1) breed lookup instead of O(n) find operations
                const breedGroups = new Map();

                validRecords.forEach(record => {
                    // ใช้ AnimalBreed1 จากตาราง Semen แทน
                    console.log("FREEDOM")
                    console.log(record.AI.Semen.AnimalBreed1)

                    const breedId = record.AI.Semen.AnimalBreed1.AnimalBreedID;
                    
                    if (!breedGroups.has(breedId)) {
                        breedGroups.set(breedId, {
                            AnimalBreedID: breedId,
                            AnimalID: [],
                            AnimalIDSet: new Set(), // ใช้ Set เพื่อนับสัตว์ไม่ซ้ำ
                            FarmID: new Set(),
                            PregnancyCheckupCount: 0
                        });
                    }

                    const breedGroup = breedGroups.get(breedId);
                    
                    // นับจำนวนครั้งตรวจท้อง
                    breedGroup.PregnancyCheckupCount++;
                    
                    // นับสัตว์ไม่ซ้ำ
                    breedGroup.AnimalIDSet.add(record.Animal.AnimalID);
                    
                    // Format dates once per record
                    const aiDate = record.AI.AIDate ? dayjs(record.AI.AIDate).locale("th").format("DD MMM BB") : null;
                    const checkupDate = record.CheckupDate ? dayjs(record.CheckupDate).locale("th").format("DD MMM BB") : null;
                    const betweenDate = record.CheckupDate && record.AI.AIDate ? 
                        dayjs(record.CheckupDate).diff(dayjs(record.AI.AIDate), "day") : null;

                    breedGroup.AnimalID.push({
                        AnimalID: record.Animal.AnimalID,
                        FarmIdentificationNumber: record.Animal.AnimalFarm?.FarmIdentificationNumber,
                        FarmName: record.Animal.AnimalFarm?.FarmName,
                        AnimalEarID: record.Animal.AnimalEarID,
                        AnimalName: record.Animal.AnimalName,
                        AnimalStatusName: record.Animal.AnimalStatus?.AnimalStatusName,
                        SemenNumber: record.AI.Semen?.SemenNumber,
                        SemenBreedAll: record.AI.Semen?.AnimalBreedAll,
                        AnimalPar: record.AI.PAR,
                        AIDate: aiDate,
                        CheckupDateReal: record.CheckupDate,
                        CheckupDate: checkupDate,
                        PregnancyCheckStatusName: record.PregnancyCheckStatus?.PregnancyCheckStatusName,
                        BetweenDate: betweenDate,
                        ResponsibilityStaffName: `${record.Staff?.StaffGivenName || ''} ${record.Staff?.StaffSurname || ''}`.trim()
                    });

                    breedGroup.FarmID.add(record.Animal.FarmID);
                });

                // Convert Map to array and add breed information
                const breed = Array.from(breedGroups.values()).map(breedGroup => {
                    const breedInfo = breedMap.get(breedGroup.AnimalBreedID);
                    
                    // Debug logs เพื่อตรวจสอบปัญหา
                    console.log('breedGroup.AnimalBreedID:', breedGroup.AnimalBreedID);
                    console.log('breedMap keys:', Array.from(breedMap.keys()));
                    console.log('breedInfo:', breedInfo);
                    
                    // Sort animals by checkup date (newest first)
                    breedGroup.AnimalID.sort((a, b) => {
                        if (!a.CheckupDateReal || !b.CheckupDateReal) return 0;
                        return new Date(b.CheckupDateReal) - new Date(a.CheckupDateReal);
                    });

                    return {
                        AnimalBreedID: breedGroup.AnimalBreedID,
                        AnimalBreedName: breedInfo ? 
                            `${breedInfo.AnimalBreedName} (${breedInfo.AnimalBreedShortName})` : 
                            'Unknown Breed',
                        AnimalID: breedGroup.AnimalID,
                        AnimalRealCount: breedGroup.AnimalIDSet.size,
                        AnimalCount: breedGroup.AnimalIDSet.size,
                        FarmCount: breedGroup.FarmID.size,
                        PregnancyCheckupCount: breedGroup.PregnancyCheckupCount
                    };
                });

                // Sort breeds by animal count (descending)
                breed.sort((a, b) => b.AnimalRealCount - a.AnimalRealCount);

                resolve({ data: breed });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    // report15(req) {
    //     // report รายงาน สรุปตรวจท้อง
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let $whereOrganization = {};
    //             let $where = {};
    //             let $whereAnimal = {};
    //             let $whereStaff = {};
    //             let $whereFarm = {};

    //             $whereFarm["isRemove"] = 0;

    //             if (req.query.StartDate) {
    //                 $where["CheckupDate"] = {
    //                     [Op.between]: [
    //                         dayjs(req.query.StartDate).format("YYYY-MM-DD"),
    //                         dayjs(req.query.EndDate).format("YYYY-MM-DD"),
    //                     ],
    //                 };
    //             }

    //             if (req.query.StartDate_Created) {
    //                 $where["Createddatetime"] = {
    //                     [Op.between]: [
    //                         dayjs(req.query.StartDate_Created).format(
    //                             "YYYY-MM-DD"
    //                         ),
    //                         dayjs(req.query.EndDate_Created).format(
    //                             "YYYY-MM-DD"
    //                         ),
    //                     ],
    //                 };
    //             }

    //             // Org
    //             if (req.query.StaffID) {
    //                 $whereStaff["StaffID"] = req.query.StaffID;
    //             } else if (req.query.OrganizationID) {
    //                 $whereOrganization["OrganizationID"] =
    //                     req.query.OrganizationID;
    //             } else if (req.query.TumbolID) {
    //                 $whereOrganization["OrganizationTumbolID"] =
    //                     req.query.TumbolID;
    //             } else if (req.query.AmphurID) {
    //                 $whereOrganization["StaffAmphurID"] = req.query.AmphurID;
    //             } else if (req.query.ProvinceID) {
    //                 $whereOrganization["OrganizationProvinceID"] =
    //                     req.query.ProvinceID;
    //             } else {
    //                 if (req.query.OrganizationAiZoneID) {
    //                     $whereOrganization["OrganizationAiZoneID"] =
    //                         req.query.OrganizationAiZoneID;
    //                 } else {
    //                     $whereOrganization["OrganizationZoneID"] =
    //                         req.query.OrganizationZoneID;
    //                 }
    //             }

    //             if (!req.query.StaffID) {
    //                 $whereOrganization["isActive"] = 1;
    //                 $whereOrganization["isRemove"] = 0;

    //                 const queryOrganization =
    //                     Object.keys($whereOrganization).length > 0
    //                         ? { where: $whereOrganization }
    //                         : {};

    //                 let organization = await Organization.findAll({
    //                     ...queryOrganization,
    //                 });

    //                 let organizationIds = organization.map(
    //                     (org) => org.OrganizationID
    //                 );

    //                 $whereStaff["StaffOrganizationID"] = {
    //                     [Op.in]: organizationIds,
    //                 };
    //             }

    //             // Query Staff
    //             $whereStaff["isRemove"] = 0;

    //             if (req.query.StaffIsActive) {
    //                 $whereStaff["isActive"] = req.query.StaffIsActive;
    //             } else {
    //                 $whereStaff["isActive"] = 1;
    //             }

    //             $whereStaff["StaffStatus"] = {
    //                 [Op.notIn]: ["ลาออก", "ตาย"],
    //             };
    //             const queryStaff =
    //                 Object.keys($whereStaff).length > 0
    //                     ? { where: $whereStaff }
    //                     : {};

    //             let staff = await Staff.findAll({
    //                 ...queryStaff,
    //             });

    //             let staffIds = staff.map((s) => s.StaffID);
    //             $where["ResponsibilityStaffID"] = {
    //                 [Op.in]: staffIds,
    //             };

    //             // Animal Type
    //             $whereAnimal["AnimalTypeID"] = {
    //                 [Op.in]: JSON.parse(req.query.AnimalTypeID),
    //             };
    //             $whereAnimal["isRemove"] = 0;
    //             $whereAnimal["isActive"] = 1;
    //             $whereAnimal["AnimalAlive"] = 1;

    //             $where["isActive"] = 1;
    //             $where["isRemove"] = 0;

    //             // Project
    //             let WhereProject = null;
    //             if (req.query.Projects) {
    //                 if (req.query.Projects != "[]") {
    //                     WhereProject = {
    //                         ProjectID: {
    //                             [Op.in]: JSON.parse(req.query.Projects),
    //                         },
    //                     };
    //                 }
    //             }

    //             // Query
    //             $whereFarm["isRemove"] = 0;

    //             const query =
    //                 Object.keys($where).length > 0 ? { where: $where } : {};
    //             const queryFarm =
    //                 Object.keys($whereFarm).length > 0
    //                     ? { where: $whereFarm }
    //                     : {};
    //             const queryAnimal =
    //                 Object.keys($whereAnimal).length > 0
    //                     ? { where: $whereAnimal }
    //                     : {};

    //             const preg = await PregnancyCheckup.findAll({
    //                 ...query,
    //                 include: [
    //                     {
    //                         model: Animal,
    //                         as: "Animal",
    //                         ...queryAnimal,
    //                         include: [
    //                             {
    //                                 model: Farm,
    //                                 as: "AnimalFarm",
    //                                 ...queryFarm,
    //                                 include: [
    //                                     {
    //                                         model: Project,
    //                                         where: WhereProject,
    //                                     },
    //                                 ],
    //                                 //   ...queryFarm,
    //                             },
    //                             { model: AnimalStatus, as: "AnimalStatus" },
    //                         ],
    //                     },
    //                     {
    //                         model: AI,
    //                         as: "AI",
    //                         where: { isActive: 1, isRemove: 0 },
    //                         include: [
    //                             {
    //                                 model: Semen,
    //                                 as: "Semen",
    //                                 include: [
    //                                     {
    //                                         model: AnimalBreed,
    //                                         as: "AnimalBreed1",
    //                                     },
    //                                     {
    //                                         model: AnimalBreed,
    //                                         as: "AnimalBreed2",
    //                                     },
    //                                     {
    //                                         model: AnimalBreed,
    //                                         as: "AnimalBreed3",
    //                                     },
    //                                     {
    //                                         model: AnimalBreed,
    //                                         as: "AnimalBreed4",
    //                                     },
    //                                     {
    //                                         model: AnimalBreed,
    //                                         as: "AnimalBreed5",
    //                                     },
    //                                 ],
    //                             },
    //                         ],
    //                     },
    //                     {
    //                         model: Staff,
    //                     },
    //                     {
    //                         model: PregnancyCheckStatus,
    //                     },
    //                 ],
    //             });

    //             console.log(preg.length);

    //             let animal = preg
    //                 .filter((x) => {
    //                     return x.AI != null && x.Animal != null;
    //                 })
    //                 .map((x) => {
    //                     return x;
    //                 });

    //             let breed = [];

    //             animal.forEach((x) => {
    //                 if (
    //                     x.Animal.AnimalBreedID1 != null &&
    //                     x.AI.SemenID != null
    //                 ) {
    //                     let checkBreed = breed.find((b) => {
    //                         return x.Animal.AnimalBreedID1 == b.AnimalBreedID;
    //                     });

    //                     if (checkBreed) {
    //                         checkBreed.AnimalID.push({
    //                             AnimalID: x.Animal.AnimalID,
    //                             FarmIdentificationNumber:
    //                                 x.Animal.AnimalFarm
    //                                     ?.FarmIdentificationNumber,
    //                             FarmName: x.Animal.AnimalFarm?.FarmName,
    //                             AnimalEarID: x.Animal.AnimalEarID,
    //                             AnimalName: x.Animal.AnimalName,
    //                             AnimalStatusName:
    //                                 x.Animal.AnimalStatus?.AnimalStatusName,
    //                             SemenNumber: x.AI?.Semen?.SemenNumber,
    //                             SemenBreedAll: x.AI?.Semen?.AnimalBreedAll,
    //                             AnimalPar: x.AI?.PAR,
    //                             AIDate: dayjs(x.AI?.AIDate)
    //                                 .locale("th")
    //                                 .format("DD MMM BB"),
    //                             CheckupDateReal: x.CheckupDate,
    //                             CheckupDate: x.CheckupDate
    //                                 ? dayjs(x.CheckupDate)
    //                                       .locale("th")
    //                                       .format("DD MMM BB")
    //                                 : null,
    //                             PregnancyCheckStatusName:
    //                                 x.PregnancyCheckStatus
    //                                     ?.PregnancyCheckStatusName,
    //                             BetweenDate:
    //                                 x.CheckupDate && x.AI
    //                                     ? dayjs(x.CheckupDate).diff(
    //                                           dayjs(x.AI?.AIDate),
    //                                           "day"
    //                                       )
    //                                     : null,
    //                             ResponsibilityStaffName:
    //                                 x.Staff?.StaffGivenName +
    //                                 " " +
    //                                 x.Staff?.StaffSurname,
    //                         });
    //                         checkBreed.FarmID.push(x.Animal.FarmID);
    //                     } else {
    //                         breed.push({
    //                             AnimalBreedID: x.Animal.AnimalBreedID1,
    //                             AnimalID: [
    //                                 {
    //                                     AnimalID: x.Animal.AnimalID,
    //                                     FarmIdentificationNumber:
    //                                         x.Animal.AnimalFarm
    //                                             .FarmIdentificationNumber,
    //                                     FarmName: x.Animal.AnimalFarm.FarmName,
    //                                     AnimalEarID: x.Animal.AnimalEarID,
    //                                     AnimalName: x.Animal.AnimalName,
    //                                     AnimalStatusName:
    //                                         x.Animal.AnimalStatus
    //                                             ?.AnimalStatusName,
    //                                     SemenNumber: x.AI?.Semen?.SemenNumber,
    //                                     SemenBreedAll:
    //                                         x.AI?.Semen?.AnimalBreedAll,
    //                                     AnimalPar: x.AI?.PAR,
    //                                     AIDate: dayjs(x.AI?.AIDate)
    //                                         .locale("th")
    //                                         .format("DD MMM BB"),
    //                                     Semen: x.AI?.SemenNumber,
    //                                     CheckupDateReal: x.CheckupDate,
    //                                     CheckupDate: x.CheckupDate
    //                                         ? dayjs(x.CheckupDate)
    //                                               .locale("th")
    //                                               .format("DD MMM BB")
    //                                         : null,
    //                                     PregnancyCheckStatusName:
    //                                         x.PregnancyCheckStatus
    //                                             ?.PregnancyCheckStatusName,
    //                                     BetweenDate:
    //                                         x.CheckupDate && x.AI
    //                                             ? dayjs(x.CheckupDate).diff(
    //                                                   dayjs(x.AI?.AIDate),
    //                                                   "day"
    //                                               )
    //                                             : null,
    //                                     ResponsibilityStaffName:
    //                                         x.Staff?.StaffGivenName +
    //                                         " " +
    //                                         x.Staff?.StaffSurname,
    //                                 },
    //                             ],
    //                             FarmID: [x.Animal.FarmID],
    //                         });
    //                     }
    //                 }
    //             });

    //             let breedAll = await AnimalBreed.findAll({
    //                 raw: true,
    //             });

    //             breed = breed.map((x) => {
    //                 let AnimalBreed = breedAll.find((ba) => {
    //                     return x.AnimalBreedID == ba.AnimalBreedID;
    //                 });

    //                 x.AnimalRealCount = x.AnimalID.length;

    //                 let i = [];
    //                 x.AnimalID.filter((v, idx) => {
    //                     if (i.includes(v.AnimalID)) {
    //                         return false;
    //                     }
    //                     i.push(v.AnimalID);
    //                     return true;
    //                 });

    //                 //   x.AnimalCount = i.length;
    //                 x.AnimalCount = x.AnimalRealCount; //i.length;

    //                 let uniqFarm = [...new Set(x.FarmID)];
    //                 x.FarmID = uniqFarm;
    //                 x.FarmCount = x.FarmID.length;
    //                 x.FarmID = undefined;

    //                 if (AnimalBreed) {
    //                     x.AnimalBreedName =
    //                         AnimalBreed.AnimalBreedName +
    //                         " (" +
    //                         AnimalBreed.AnimalBreedShortName +
    //                         ")";
    //                 }

    //                 x.AnimalID.sort((a, b) => {
    //                     if (a.CheckupDateReal > b.CheckupDateReal) {
    //                         return -1;
    //                     }
    //                     if (a.CheckupDateReal < b.CheckupDateReal) {
    //                         return 1;
    //                     }

    //                     // names must be equal
    //                     return 0;
    //                 });

    //                 return x;
    //             });

    //             breed.sort((a, b) => {
    //                 if (a.AnimalRealCount > b.AnimalRealCount) {
    //                     return -1;
    //                 }
    //                 if (a.AnimalRealCount < b.AnimalRealCount) {
    //                     return 1;
    //                 }

    //                 // names must be equal
    //                 return 0;
    //             });

    //             resolve({
    //                 data: breed,
    //             });
    //         } catch (error) {
    //             reject(ErrorNotFound(error));
    //         }
    //     });
    // },

    report15Old(req) {
        // report รายงาน สรุปตรวจท้อง
        return new Promise(async (resolve, reject) => {
            try {
                let $whereOrganization = {};
                let $where = {};
                let $whereAnimal = {};
                let $whereStaff = {};
                let $whereFarm = {};

                $whereFarm["isRemove"] = 0;

                if (req.query.StartDate) {
                    $where["CheckupDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                if (req.query.StartDate_Created) {
                    $where["CreateAt"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate_Created).format(
                                "YYYY-MM-DD"
                            ),
                            dayjs(req.query.EndDate_Created).format(
                                "YYYY-MM-DD"
                            ),
                        ],
                    };
                }

                // Org
                if (req.query.StaffID) {
                    $whereStaff["StaffID"] = req.query.StaffID;
                } else if (req.query.OrganizationID) {
                    $whereOrganization["OrganizationID"] =
                        req.query.OrganizationID;
                } else if (req.query.TumbolID) {
                    $whereOrganization["OrganizationTumbolID"] =
                        req.query.TumbolID;
                } else if (req.query.AmphurID) {
                    $whereOrganization["StaffAmphurID"] = req.query.AmphurID;
                } else if (req.query.ProvinceID) {
                    $whereOrganization["OrganizationProvinceID"] =
                        req.query.ProvinceID;
                } else {
                    if (req.query.OrganizationAiZoneID) {
                        $whereOrganization["OrganizationAiZoneID"] =
                            req.query.OrganizationAiZoneID;
                    } else {
                        $whereOrganization["OrganizationZoneID"] =
                            req.query.OrganizationZoneID;
                    }
                }

                if (!req.query.StaffID) {
                    $whereOrganization["isActive"] = 1;
                    $whereOrganization["isRemove"] = 0;

                    const queryOrganization =
                        Object.keys($whereOrganization).length > 0
                            ? { where: $whereOrganization }
                            : {};

                    let organization = await Organization.findAll({
                        ...queryOrganization,
                    });

                    let organizationIds = organization.map(
                        (org) => org.OrganizationID
                    );

                    $whereStaff["StaffOrganizationID"] = {
                        [Op.in]: organizationIds,
                    };
                }

                // Query Staff
                $whereStaff["isRemove"] = 0;
                $whereStaff["StaffStatus"] = {
                    [Op.notIn]: ["ลาออก", "ตาย"],
                };
                const queryStaff =
                    Object.keys($whereStaff).length > 0
                        ? { where: $whereStaff }
                        : {};

                let staff = await Staff.findAll({
                    ...queryStaff,
                });

                let staffIds = staff.map((s) => s.StaffID);
                $where["ResponsibilityStaffID"] = {
                    [Op.in]: staffIds,
                };

                // Animal Type
                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };
                $whereAnimal["isRemove"] = 0;
                $whereAnimal["isActive"] = 1;

                $where["isActive"] = 1;
                $where["isRemove"] = 0;

                // Project
                let WhereProject = null;
                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                // Query
                $whereFarm["isRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};
                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};
                const queryAnimal =
                    Object.keys($whereAnimal).length > 0
                        ? { where: $whereAnimal }
                        : {};

                const preg = await PregnancyCheckup.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            ...queryAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: AI,
                            as: "AI",
                            where: { isActive: 1, isRemove: 0 },
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                    include: [
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed1",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed2",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed3",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed4",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed5",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Staff,
                        },
                        {
                            model: PregnancyCheckStatus,
                        },
                    ],
                });

                console.log(preg.length);

                resolve({
                    data: preg,
                });

                let animal = preg
                    .filter((x) => {
                        return x.AI != null && x.Animal != null;
                    })
                    .map((x) => {
                        return x;
                    });

                let breed = [];

                animal.forEach((x) => {
                    if (
                        x.Animal.AnimalBreedID1 != null &&
                        x.AI.SemenID != null
                    ) {
                        let checkBreed = breed.find((b) => {
                            return x.AI.Semen.AnimalBreedID1 == b.AnimalBreedID;
                        });

                        if (checkBreed) {
                            checkBreed.AnimalID.push({
                                AnimalID: x.Animal.AnimalID,
                                FarmIdentificationNumber:
                                    x.Animal.AnimalFarm
                                        ?.FarmIdentificationNumber,
                                FarmName: x.Animal.AnimalFarm?.FarmName,
                                AnimalEarID: x.Animal.AnimalEarID,
                                AnimalName: x.Animal.AnimalName,
                                AnimalStatusName:
                                    x.Animal.AnimalStatus?.AnimalStatusName,
                                SemenNumber: x.AI?.Semen?.SemenNumber,
                                SemenBreedAll: x.AI?.Semen?.AnimalBreedAll,
                                AnimalPar: x.AI?.PAR,
                                AIDate: dayjs(x.AI?.AIDate)
                                    .locale("th")
                                    .format("DD MMM BB"),
                                CheckupDateReal: x.CheckupDate,
                                CheckupDate: x.CheckupDate
                                    ? dayjs(x.CheckupDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : null,
                                PregnancyCheckStatusName:
                                    x.PregnancyCheckStatus
                                        ?.PregnancyCheckStatusName,
                                BetweenDate:
                                    x.CheckupDate && x.AI
                                        ? dayjs(x.CheckupDate).diff(
                                              dayjs(x.AI?.AIDate),
                                              "day"
                                          )
                                        : null,
                                ResponsibilityStaffName:
                                    x.Staff?.StaffGivenName +
                                    " " +
                                    x.Staff?.StaffSurname,
                            });
                            checkBreed.FarmID.push(x.Animal.FarmID);
                        } else {
                            breed.push({
                                AnimalBreedID: x.AI.Semen.AnimalBreedID1,
                                AnimalID: [
                                    {
                                        AnimalID: x.Animal.AnimalID,
                                        FarmIdentificationNumber:
                                            x.Animal.AnimalFarm
                                                .FarmIdentificationNumber,
                                        FarmName: x.Animal.AnimalFarm.FarmName,
                                        AnimalEarID: x.Animal.AnimalEarID,
                                        AnimalName: x.Animal.AnimalName,
                                        AnimalStatusName:
                                            x.Animal.AnimalStatus
                                                ?.AnimalStatusName,
                                        SemenNumber: x.AI?.Semen?.SemenNumber,
                                        SemenBreedAll:
                                            x.AI?.Semen?.AnimalBreedAll,
                                        AnimalPar: x.AI?.PAR,
                                        AIDate: dayjs(x.AI?.AIDate)
                                            .locale("th")
                                            .format("DD MMM BB"),
                                        Semen: x.AI?.SemenNumber,
                                        CheckupDateReal: x.CheckupDate,
                                        CheckupDate: x.CheckupDate
                                            ? dayjs(x.CheckupDate)
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : null,
                                        PregnancyCheckStatusName:
                                            x.PregnancyCheckStatus
                                                ?.PregnancyCheckStatusName,
                                        BetweenDate:
                                            x.CheckupDate && x.AI
                                                ? dayjs(x.CheckupDate).diff(
                                                      dayjs(x.AI?.AIDate),
                                                      "day"
                                                  )
                                                : null,
                                        ResponsibilityStaffName:
                                            x.Staff?.StaffGivenName +
                                            " " +
                                            x.Staff?.StaffSurname,
                                    },
                                ],
                                FarmID: [x.Animal.FarmID],
                            });
                        }
                    }
                });

                let breedAll = await AnimalBreed.findAll({
                    raw: true,
                });

                breed = breed.map((x) => {
                    let AnimalBreed = breedAll.find((ba) => {
                        return x.AnimalBreedID == ba.AnimalBreedID;
                    });

                    x.AnimalRealCount = x.AnimalID.length;

                    let i = [];
                    x.AnimalID.filter((v, idx) => {
                        if (i.includes(v.AnimalID)) {
                            return false;
                        }
                        i.push(v.AnimalID);
                        return true;
                    });

                    //   x.AnimalCount = i.length;
                    x.AnimalCount = x.AnimalRealCount; //i.length;

                    let uniqFarm = [...new Set(x.FarmID)];
                    x.FarmID = uniqFarm;
                    x.FarmCount = x.FarmID.length;
                    x.FarmID = undefined;

                    if (AnimalBreed) {
                        x.AnimalBreedName =
                            AnimalBreed.AnimalBreedName +
                            " (" +
                            AnimalBreed.AnimalBreedShortName +
                            ")";
                    }

                    x.AnimalID.sort((a, b) => {
                        if (a.CheckupDateReal > b.CheckupDateReal) {
                            return -1;
                        }
                        if (a.CheckupDateReal < b.CheckupDateReal) {
                            return 1;
                        }

                        // names must be equal
                        return 0;
                    });

                    return x;
                });

                breed.sort((a, b) => {
                    if (a.AnimalRealCount > b.AnimalRealCount) {
                        return -1;
                    }
                    if (a.AnimalRealCount < b.AnimalRealCount) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });

                resolve({
                    data: breed,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report91(req) {
        // report รายงานตรวจท้อง
        return new Promise(async (resolve, reject) => {
            try {
                const [results, metadata] = await sequelize.query(
                    "UPDATE users SET y = 42 WHERE x = 12"
                );

                resolve({
                    //
                    Farm: "FREEDOM",
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report16(req) {
        // report รายงานตรวจท้อง
        return new Promise(async (resolve, reject) => {
            try {
                // let $where = {};
                let $whereFarm = {};
                let $whereAI = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                if (req.query.ProjectID) {
                    $whereFarm["ProjectID"] = req.query.ProjectID;
                }

                let provinceIDArr = [];
                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                const queryPG =
                    Object.keys($wherePG).length > 0 ? { where: $wherePG } : {};

                const query =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let order = [[Animal, "FarmID", "ASC"]];

                if (req.query.StartDate) {
                    $whereAI["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                let pg = PregnancyCheckup.findAll({
                    ...queryPG,
                    order: order,
                });

                let AIDate = {};

                const ai = await AI.findAll({
                    ...queryAI,
                    order: order,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...query,
                                    include: [
                                        { model: Amphur, as: "Amphur" },
                                        { model: Province, as: "Province" },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        { model: Staff },
                        { model: Project },
                        {
                            model: PregnancyCheckup,
                            include: [{ model: PregnancyCheckStatus }],
                        },
                    ],
                });

                let res = [];

                let aiTotal = ai.length;

                const sortAI = (el) => {
                    let pregnancyCheckup = "";
                    let pregnancyCheckupDate = "";
                    if (el.PregnancyCheckups.length != 0) {
                        let pc =
                            el.PregnancyCheckups[
                                el.PregnancyCheckups.length - 1
                            ];
                        pregnancyCheckup =
                            pc.PregnancyCheckStatus.PregnancyCheckStatusName;
                        pregnancyCheckupDate = pc.ThaiCheckupDate;
                    }

                    let day = dayjs().diff(dayjs(el.AIDate), "day");

                    let resSort = {};
                    if (day >= req.query.day) {
                        resSort = {
                            AnimalID: el.AnimalID,
                            AnimalEarID: el.Animal
                                ? el.Animal.AnimalEarID
                                : "-",
                            AnimalName: el.Animal ? el.Animal.AnimalName : "-",
                            Par: el.PAR,
                            TimeNo: el.TimeNo,
                            SemenNumber: el.Semen ? el.Semen?.SemenNumber : "-",
                            ThaiAIDate: el.ThaiAIDate,
                            Day: day,
                            ProjectName: el.Project
                                ? el.Project.ProjectName
                                : "-",
                            ThaipregnancyCheckupDate: pregnancyCheckupDate,
                            pregnancyCheckup: pregnancyCheckup,
                            ResponsibilityStaffName: el.Staff
                                ? el.Staff.StaffFullName
                                : "-",
                        };
                    }

                    return resSort;
                };

                ai.forEach((el) => {
                    let latestArr = res[res.length - 1];

                    if (latestArr) {
                        if (el.Animal.FarmID == latestArr.FarmID) {
                            let aiItem = sortAI(el);
                            if (!_.isEmpty(aiItem)) {
                                latestArr.AI.push(aiItem);
                            }
                        } else {
                            let aiItem = sortAI(el);
                            if (!_.isEmpty(aiItem)) {
                                res.push({
                                    FarmID: el.Animal.FarmID,
                                    FarmName: el.Animal.AnimalFarm.FarmName,
                                    AmphurName:
                                        el.Animal.AnimalFarm.Amphur.AmphurName,
                                    ProvinceName:
                                        el.Animal.AnimalFarm.Province
                                            .ProvinceName,
                                    AI: [aiItem],
                                });
                            }
                        }
                    } else {
                        let aiItem = sortAI(el);
                        if (!_.isEmpty(aiItem)) {
                            res.push({
                                FarmID: el.Animal.FarmID,
                                FarmName: el.Animal.AnimalFarm.FarmName,
                                AmphurName:
                                    el.Animal.AnimalFarm.Amphur.AmphurName,
                                ProvinceName:
                                    el.Animal.AnimalFarm.Province.ProvinceName,
                                AI: [aiItem],
                            });
                        }
                    }
                });

                resolve({
                    Total: aiTotal,
                    Farm: res,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report17(req) {
        // report รายงาน สรุปลูกเกิด
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };

                $whereAnimal["isRemove"] = 0;
                $whereAnimal["AnimalAlive"] = 1;

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }
                let $whereStaff = {};
                if (req.query.StaffIsActive) {
                    $whereStaff["isActive"] = req.query.StaffIsActive;
                } else {
                    $whereStaff["isActive"] = 1;
                }

                $where["isActive"] = 1;
                $where["isRemove"] = 0;

                if (req.query.StartDate) {
                    $where["GiveBirthDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const preg = await GiveBirth.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: $whereAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: AI,
                            as: "AI",
                            where: { isActive: 1, isRemove: 0 },
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                    include: [
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed1",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed2",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed3",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed4",
                                        },
                                        {
                                            model: AnimalBreed,
                                            as: "AnimalBreed5",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Staff,
                            where: $whereStaff,
                        },
                    ],
                });

                let animal = preg
                    .filter((x) => {
                        return x.AI != null;
                    })
                    .map((x) => {
                        return x;
                    });

                let breed = [];

                animal.forEach((x) => {
                    if (x.Animal?.AnimalBreedID1 != null) {
                        let checkBreed = breed.find((b) => {
                            return (
                                x.AI.Semen?.AnimalBreedID1 == b.AnimalBreedID
                            );
                        });

                        if (checkBreed) {
                            checkBreed.AnimalID.push({
                                AnimalID: x.Animal.AnimalID,
                                FarmIdentificationNumber:
                                    x.Animal.AnimalFarm
                                        .FarmIdentificationNumber,
                                FarmName: x.Animal.AnimalFarm.FarmName,
                                AnimalEarID: x.Animal.AnimalEarID,
                                AnimalName: x.Animal.AnimalName,
                                AnimalStatusName:
                                    x.Animal.AnimalStatus?.AnimalStatusName,
                                SemenNumber: x.AI?.Semen?.SemenNumber,
                                SemenBreedAll: x.AI?.Semen?.AnimalBreedAll,
                                AnimalPar: x.PAR,
                                AIDate: x.AI?.AIDate
                                    ? dayjs(x.AI?.AIDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "",
                                GiveBirthDateReal: x.GiveBirthDate,
                                GiveBirthDate: dayjs(x.GiveBirthDate)
                                    .locale("th")
                                    .format("DD MMM BB"),
                                Amount: x.Amount,
                                ChildGender: x.ChildGender,
                                BetweenDate: x.PregnancyDay,
                                // PregnancyCheckStatusName:
                                //   x.PregnancyCheckStatus.PregnancyCheckStatusName,
                                BetweenDate1: x.AI?.AIDate
                                    ? dayjs(x.GiveBirthDate).diff(
                                          dayjs(x.AI?.AIDate),
                                          "day"
                                      )
                                    : "",
                                ResponsibilityStaffName:
                                    x.Staff?.StaffGivenName +
                                    " " +
                                    x.Staff?.StaffSurname,
                            });
                            checkBreed.FarmID.push(x.Animal.FarmID);
                        } else {
                            breed.push({
                                // AnimalBreedID: x.Animal.AnimalBreedID1,

                                AnimalBreedID: x.AI?.Semen?.AnimalBreedID1,
                                AnimalID: [
                                    {
                                        AnimalID: x.Animal.AnimalID,
                                        FarmIdentificationNumber:
                                            x.Animal.AnimalFarm
                                                .FarmIdentificationNumber,
                                        FarmName: x.Animal.AnimalFarm.FarmName,
                                        AnimalEarID: x.Animal.AnimalEarID,
                                        AnimalName: x.Animal.AnimalName,
                                        AnimalStatusName:
                                            x.Animal.AnimalStatus
                                                ?.AnimalStatusName,
                                        SemenNumber: x.AI?.Semen?.SemenNumber,
                                        SemenBreedAll:
                                            x.AI?.Semen?.AnimalBreedAll,
                                        AnimalPar: x.PAR,
                                        AIDate: x.AI?.AIDate
                                            ? dayjs(x.AI?.AIDate)
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : "",
                                        GiveBirthDateReal: x.GiveBirthDate,
                                        GiveBirthDate: dayjs(x.GiveBirthDate)
                                            .locale("th")
                                            .format("DD MMM BB"),
                                        Amount: x.Amount,
                                        ChildGender: x.ChildGender,
                                        //   .format("DD MMM BB")
                                        BetweenDate: x.PregnancyDay,
                                        BetweenDate1: x.AI?.AIDate
                                            ? dayjs(x.GiveBirthDate).diff(
                                                  dayjs(x.AI?.AIDate),
                                                  "day"
                                              )
                                            : "",
                                        // ,
                                        ResponsibilityStaffName:
                                            x.Staff?.StaffGivenName +
                                            " " +
                                            x.Staff?.StaffSurname,
                                    },
                                ],
                                FarmID: [x.Animal.FarmID],
                            });
                        }
                    }
                });

                let breedAll = await AnimalBreed.findAll({
                    raw: true,
                });

                breed = breed.map((x) => {
                    let AnimalBreed = breedAll.find((ba) => {
                        return x.AnimalBreedID == ba.AnimalBreedID;
                    });

                    x.AnimalRealCount = x.AnimalID.length;

                    let i = [];
                    x.AnimalID.filter((v, idx) => {
                        if (i.includes(v.AnimalID)) {
                            return false;
                        }
                        i.push(v.AnimalID);
                        return true;
                    });

                    x.AnimalCount = x.AnimalRealCount; //i.length;

                    let uniqFarm = [...new Set(x.FarmID)];
                    x.FarmID = uniqFarm;
                    x.FarmCount = x.FarmID.length;
                    x.FarmID = undefined;

                    if (AnimalBreed) {
                        x.AnimalBreedName =
                            AnimalBreed.AnimalBreedName +
                            " (" +
                            AnimalBreed.AnimalBreedShortName +
                            ")";
                    }

                    x.AnimalID.sort((a, b) => {
                        if (a.GiveBirthDateReal > b.GiveBirthDateReal) {
                            return -1;
                        }
                        if (a.GiveBirthDateReal < b.GiveBirthDateReal) {
                            return 1;
                        }

                        // names must be equal
                        return 0;
                    });

                    return x;
                });

                breed.sort((a, b) => {
                    if (a.AnimalRealCount > b.AnimalRealCount) {
                        return -1;
                    }
                    if (a.AnimalRealCount < b.AnimalRealCount) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });
                console.log(breed);
                breed = breed.map((x) => {
                    if (x.AnimalBreedName == null) {
                        x.AnimalBreedName = "ไม่ระบุ";
                    }
                    return x;
                });

                resolve({
                    data: breed,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report18(req) {
        // report รายงาน สรุปประชากรสัตว์
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate) {
                    // createdAt
                    // updateAt
                    // AnimalDatejoin
                    //   $where["AnimalBirthDate"] = {
                    //     [Op.between]: [
                    //       dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                    //       dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                    //     ],
                    //   };
                    //   $where[Op.or] = [
                    //     {
                    //         CreatedAt: [Op.between]: [
                    //             dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                    //             dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                    //           ],
                    //     }
                    //   ]
                    //   $where[Op.or] = {
                    //     ["createdAt"]: {
                    //       [Op.between]: [
                    //         dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                    //         dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                    //       ],
                    //     },
                    //   };
                }

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const animal = await Animal.findAll({
                    ...query,
                    where: {
                        AnimalTypeID: {
                            [Op.in]: JSON.parse(req.query.AnimalTypeID),
                        },
                    },
                    include: [
                        {
                            model: Farm,
                            as: "AnimalFarm",
                            ...queryFarm,
                            include: [
                                {
                                    model: Project,
                                    where: WhereProject,
                                },
                                {
                                    model: Province,
                                    as: "Province",
                                },
                                {
                                    model: Amphur,
                                    as: "Amphur",
                                },
                                {
                                    model: Tumbol,
                                    as: "Tumbol",
                                },
                                {
                                    model: Staff,
                                    as: "Staff",
                                },
                            ],
                        },
                        { model: AnimalStatus, as: "AnimalStatus" },
                    ],
                });

                resolve({
                    data: animal,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report19(req) {
        // report รายงานครบกำหนดคลอด
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };

                $whereAnimal["isRemove"] = 0;
                $whereAnimal["AnimalAlive"] = 1;

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let animal = [];

                $where["AIDate"] = {
                    [Op.between]: [
                        dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                        dayjs().format("YYYY-MM-DD"),
                    ],
                };

                // TimeNo ล่าสุด

                const ai = await AI.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: $whereAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        {
                            model: Staff,
                        },
                        {
                            model: PregnancyCheckup,
                            required: false,
                        },
                        {
                            model: GiveBirth,
                            required: false,
                        },
                    ],
                });

                const ai_all = ai.filter((x) => {
                    // check duplicate Animal แล้วเลือก TimeNo ที่มากที่สุด
                    return true;
                });

                let animal_duplicate = [];

                ai_all.forEach((x) => {
                    let check = animal_duplicate.findIndex((e) => {
                        return e.AnimalID == x.AnimalID && e.PAR == x.PAR;
                    });

                    if (check >= 0) {
                        if (x.TimeNo > animal_duplicate[check].TimeNo) {
                            animal_duplicate.splice(check, 1);
                            //   delete animal_duplicate[check];
                            animal_duplicate.push({
                                AnimalID: x.AnimalID,
                                AIID: x.AIID,
                                PAR: x.PAR,
                                TimeNo: x.TimeNo,
                            });
                        }
                    } else {
                        animal_duplicate.push({
                            AnimalID: x.AnimalID,
                            AIID: x.AIID,
                            PAR: x.PAR,
                            TimeNo: x.TimeNo,
                        });
                    }
                });

                ai_all.forEach((x) => {
                    if (x.GiveBirth == null) {
                        let check1 = animal_duplicate.find((e) => {
                            return e.AIID == x.AIID;
                        });

                        if (check1) {
                            let GiveBirthDay = 0;
                            if (req.query.AnimalTypeID == "[1,2,41,42]") {
                                GiveBirthDay = 260;
                            }

                            // กระบือ
                            if (req.query.AnimalTypeID == "[3,4,43,44]") {
                                GiveBirthDay = 320;
                            }

                            // แพะ
                            if (req.query.AnimalTypeID == "[17,18,45,46]") {
                                GiveBirthDay = 180;
                            }

                            if (x.PregnancyCheckups.length != 0) {
                                let preg = {};
                                let checkBirth = 0;

                                for (
                                    let index = 0;
                                    index < x.PregnancyCheckups.length;
                                    index++
                                ) {
                                    if (
                                        x.PregnancyCheckups[index]
                                            .PregnancyCheckStatusID == 2
                                    ) {
                                        checkBirth = 1;
                                    } else {
                                        preg["CheckUpdate"] =
                                            x.PregnancyCheckups[
                                                index
                                            ].CheckupDate;

                                        preg["CheckUpdateThai"] = dayjs(
                                            x.PregnancyCheckups[index]
                                                .CheckupDate
                                        )
                                            .locale("th")
                                            .format("DD MMM BB");

                                        preg["CheckUpStatus"] =
                                            x.PregnancyCheckups[
                                                index
                                            ].PregnancyCheckStatusID;
                                        if (
                                            x.PregnancyCheckups[index]
                                                .PregnancyCheckStatusID == 1
                                        ) {
                                            preg["CheckUpStatusText"] = "ท้อง";
                                        }

                                        if (
                                            x.PregnancyCheckups[index]
                                                .PregnancyCheckStatusID == 2
                                        ) {
                                            preg["CheckUpStatusText"] =
                                                "ไม่ท้อง";
                                        }

                                        if (
                                            x.PregnancyCheckups[index]
                                                .PregnancyCheckStatusID == 3
                                        ) {
                                            preg["CheckUpStatusText"] =
                                                "รอตรวจซ้ำ";
                                        }
                                    }
                                }

                                if (checkBirth == 0) {
                                    animal.push({
                                        AIID: x.AIID,
                                        AnimalID: x.Animal.AnimalID,
                                        AnimalSecretStatus:
                                            x.Animal.AnimalSecretStatus,
                                        FarmIdentificationNumber:
                                            x.Animal.AnimalFarm
                                                .FarmIdentificationNumber,
                                        FarmName: x.Animal.AnimalFarm.FarmName,
                                        FarmAddress:
                                            x.Animal.AnimalFarm?.FarmAddress,
                                        FarmProvince:
                                            x.Animal.AnimalFarm?.Province
                                                ?.ProvinceName,
                                        FarmAmphur:
                                            x.Animal.AnimalFarm?.Amphur
                                                ?.AmphurName,
                                        FarmTumbol:
                                            x.Animal.AnimalFarm?.Tumbol
                                                ?.TumbolName,
                                        AnimalEarID: x.Animal.AnimalEarID,
                                        AnimalName: x.Animal.AnimalName,
                                        AnimalStatusName:
                                            x.Animal.AnimalStatus
                                                ?.AnimalStatusName,
                                        AnimalPar: x.PAR,
                                        SemenNumber: x.Semen?.SemenNumber,
                                        TimeNo: x.TimeNo,
                                        AIDate: x.AIDate
                                            ? dayjs(x.AIDate)
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : "",
                                        Day: x.AIDate
                                            ? dayjs().diff(
                                                  dayjs(x.AIDate),
                                                  "day"
                                              )
                                            : "",
                                        GiveBirthDay: x.AIDate
                                            ? dayjs(
                                                  dayjs(x.AIDate).add(
                                                      GiveBirthDay,
                                                      "day"
                                                  )
                                              )
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : "",
                                        PregnancyCheckup: preg,
                                        ResponsibilityStaffName:
                                            x.Staff?.StaffGivenName +
                                            " " +
                                            x.Staff?.StaffSurname,
                                        Birthdate: "",
                                        ChildGender: "",
                                    });
                                }
                            } else {
                                let preg = {};
                                preg["CheckUpdate"] = "";
                                preg["CheckUpStatus"] = "";
                                preg["CheckUpdateThai"] = "";

                                animal.push({
                                    AIID: x.AIID,
                                    AnimalID: x.Animal.AnimalID,
                                    AnimalSecretStatus:
                                        x.Animal.AnimalSecretStatus,
                                    FarmIdentificationNumber:
                                        x.Animal.AnimalFarm
                                            .FarmIdentificationNumber,
                                    FarmName: x.Animal.AnimalFarm.FarmName,
                                    FarmAddress:
                                        x.Animal.AnimalFarm?.FarmAddress,
                                    FarmProvince:
                                        x.Animal.AnimalFarm?.Province
                                            ?.ProvinceName,
                                    FarmAmphur:
                                        x.Animal.AnimalFarm?.Amphur?.AmphurName,
                                    FarmTumbol:
                                        x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                                    AnimalEarID: x.Animal.AnimalEarID,
                                    AnimalName: x.Animal.AnimalName,
                                    AnimalStatusName:
                                        x.Animal.AnimalStatus.AnimalStatusName,
                                    AnimalPar: x.PAR,
                                    SemenNumber: x.Semen?.SemenNumber,
                                    TimeNo: x.TimeNo,
                                    AIDate: x.AIDate
                                        ? dayjs(x.AIDate)
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "",
                                    Day: x.AIDate
                                        ? dayjs().diff(dayjs(x.AIDate), "day")
                                        : "",
                                    GiveBirthDay: x.AIDate
                                        ? dayjs(
                                              dayjs(x.AIDate).add(
                                                  GiveBirthDay,
                                                  "day"
                                              )
                                          )
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "",
                                    PregnancyCheckup: preg,
                                    ResponsibilityStaffName:
                                        x.Staff?.StaffGivenName +
                                        " " +
                                        x.Staff?.StaffSurname,
                                    Birthdate: "",
                                    ChildGender: "",
                                });
                            }
                        }
                    }
                });

                // if (req.query.Day) {
                //   animal = animal.filter((x) => {
                //     return x.Day < Number(req.query.Day) + 1;
                //   });
                // }

                let set_day = 0;
                // โค
                if (req.query.AnimalTypeID == "[1,2,41,42]") {
                    set_day = 229; //260
                }

                // กระบือ
                if (req.query.AnimalTypeID == "[3,4,43,44]") {
                    set_day = 289; // 320
                }

                // แพะ
                if (req.query.AnimalTypeID == "[17,18,45,46]") {
                    set_day = 149; // 180
                }

                animal = animal.filter((x) => {
                    return x.Day > set_day;
                });

                resolve({
                    data: animal,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report20(req) {
        // report รายงานติดตามลูกเกิด
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };

                $whereAnimal["isRemove"] = 0;
                $whereAnimal["AnimalAlive"] = 1;

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                $where["AIDate"] = {
                    [Op.between]: [
                        dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                        dayjs().format("YYYY-MM-DD"),
                    ],
                };

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let animal = [];

                const ai = await AI.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: $whereAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        {
                            model: Staff,
                        },
                        {
                            model: GiveBirth,
                            required: true,
                        },
                    ],
                });

                const ai_all = ai.filter((x) => {
                    return true;
                });

                for (let x = 0; x < ai_all.length; x++) {
                    let GiveBirthSelf = null;

                    GiveBirthSelf = await Animal.findAll({
                        where: {
                            GiveBirthSelfID: ai_all[x].GiveBirth.GiveBirthID,
                        },
                    });

                    if (GiveBirthSelf.length == 0) {
                        animal.push({
                            AIID: ai_all[x].AIID,
                            AnimalID: ai_all[x].Animal.AnimalID,
                            AnimalSecretStatus:
                                ai_all[x].Animal.AnimalSecretStatus,
                            FarmIdentificationNumber:
                                ai_all[x].Animal.AnimalFarm
                                    .FarmIdentificationNumber,
                            FarmName: ai_all[x].Animal.AnimalFarm.FarmName,
                            FarmAddress:
                                ai_all[x].Animal.AnimalFarm?.FarmAddress,
                            FarmProvince:
                                ai_all[x].Animal.AnimalFarm?.Province
                                    ?.ProvinceName,
                            FarmAmphur:
                                ai_all[x].Animal.AnimalFarm?.Amphur?.AmphurName,
                            FarmTumbol:
                                ai_all[x].Animal.AnimalFarm?.Tumbol?.TumbolName,
                            AnimalEarID: ai_all[x].Animal.AnimalEarID,
                            AnimalName: ai_all[x].Animal.AnimalName,
                            AnimalStatusName:
                                ai_all[x].Animal.AnimalStatus?.AnimalStatusName,
                            AnimalPar: ai_all[x].PAR,
                            SemenNumber: ai_all[x].Semen?.SemenNumber,
                            TimeNo: ai_all[x].TimeNo,
                            AIDate: ai_all[x].AIDate
                                ? dayjs(ai_all[x].AIDate)
                                      .locale("th")
                                      .format("DD MMM BB")
                                : "",
                            Day: ai_all[x].AIDate
                                ? dayjs().diff(dayjs(ai_all[x].AIDate), "day")
                                : "",
                            GiveBirth: ai_all[x].GiveBirth,
                            GiveBirthDate:
                                ai_all[x].GiveBirth.ThaiGiveBirthDate,
                            GiveBirthAmount: ai_all[x].GiveBirth.Amount,
                            GiveBirthGender: ai_all[x].GiveBirth.ChildGender,
                            ResponsibilityStaffName:
                                ai_all[x].Staff?.StaffGivenName +
                                " " +
                                ai_all[x].Staff?.StaffSurname,
                        });
                    }
                }

                // ai_all.forEach(async (x) => {
                //   let GiveBirthSelf = null;

                //   GiveBirthSelf = await Animal.findAll({
                //     where: { GiveBirthSelfID: x.GiveBirth.GiveBirthID },
                //   });

                //   if (!GiveBirthSelf) {
                //     animal.push({
                //       AIID: x.AIID,
                //       AnimalID: x.Animal.AnimalID,
                //       AnimalSecretStatus: x.Animal.AnimalSecretStatus,
                //       FarmIdentificationNumber:
                //         x.Animal.AnimalFarm.FarmIdentificationNumber,
                //       FarmName: x.Animal.AnimalFarm.FarmName,
                //       FarmAddress: x.Animal.AnimalFarm?.FarmAddress,
                //       FarmProvince: x.Animal.AnimalFarm?.Province?.ProvinceName,
                //       FarmAmphur: x.Animal.AnimalFarm?.Amphur?.AmphurName,
                //       FarmTumbol: x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                //       AnimalEarID: x.Animal.AnimalEarID,
                //       AnimalName: x.Animal.AnimalName,
                //       AnimalStatusName: x.Animal.AnimalStatus.AnimalStatusName,
                //       AnimalPar: x.PAR,
                //       SemenNumber: x.Semen.SemenNumber,
                //       TimeNo: x.TimeNo,
                //       AIDate: x.AIDate
                //         ? dayjs(x.AIDate).locale("th").format("DD MMM BB")
                //         : "",
                //       Day: x.AIDate ? dayjs().diff(dayjs(x.AIDate), "day") : "",
                //       GiveBirth: x.GiveBirth,
                //       GiveBirthDate: x.GiveBirth.ThaiGiveBirthDate,
                //       GiveBirthAmount: x.GiveBirth.Amount,
                //       GiveBirthGender: x.GiveBirth.ChildGender,
                //       ResponsibilityStaffName:
                //         x.Staff?.StaffGivenName + " " + x.Staff?.StaffSurname,
                //       Birthdate: "",
                //       ChildGender: "",
                //     });
                //   }

                //   // ai ที่มีตาราง GiveBith
                //   // เอาข้อมูลมีการขึ้นทะเบียนมาแสดงไว้ก่อน

                //   //   if (x.GiveBirths.length != 0) {
                //   //     let preg = {};
                //   //     let checkBirth = 0;

                //   //     for (let index = 0; index < x.GiveBirth.length; index++) {
                //   //       if (x.PregnancyCheckups[index].PregnancyCheckStatusID == 2) {
                //   //         checkBirth = 1;
                //   //       } else {
                //   //         preg["CheckUpdate"] = x.PregnancyCheckups[index].CheckupDate;

                //   //         preg["CheckUpdateThai"] = dayjs(
                //   //           x.PregnancyCheckups[index].CheckupDate
                //   //         )
                //   //           .locale("th")
                //   //           .format("DD MMM BB");

                //   //         preg["CheckUpStatus"] =
                //   //           x.PregnancyCheckups[index].PregnancyCheckStatusID;
                //   //         if (x.PregnancyCheckups[index].PregnancyCheckStatusID == 1) {
                //   //           preg["CheckUpStatusText"] = "ท้อง";
                //   //         }

                //   //         if (x.PregnancyCheckups[index].PregnancyCheckStatusID == 2) {
                //   //           preg["CheckUpStatusText"] = "ไม่ท้อง";
                //   //         }

                //   //         if (x.PregnancyCheckups[index].PregnancyCheckStatusID == 3) {
                //   //           preg["CheckUpStatusText"] = "รอตรวจซ้ำ";
                //   //         }
                //   //       }
                //   //     }

                //   //     if (checkBirth == 0) {
                //   //       animal.push({
                //   //         AIID: x.AIID,
                //   //         AnimalID: x.Animal.AnimalID,
                //   //         AnimalSecretStatus: x.Animal.AnimalSecretStatus,
                //   //         FarmIdentificationNumber:
                //   //           x.Animal.AnimalFarm.FarmIdentificationNumber,
                //   //         FarmName: x.Animal.AnimalFarm.FarmName,
                //   //         FarmAddress: x.Animal.AnimalFarm?.FarmAddress,
                //   //         FarmProvince: x.Animal.AnimalFarm?.Province?.ProvinceName,
                //   //         FarmAmphur: x.Animal.AnimalFarm?.Amphur?.AmphurName,
                //   //         FarmTumbol: x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                //   //         AnimalEarID: x.Animal.AnimalEarID,
                //   //         AnimalName: x.Animal.AnimalName,
                //   //         AnimalStatusName: x.Animal.AnimalStatus.AnimalStatusName,
                //   //         AnimalPar: x.PAR,
                //   //         SemenNumber: x.Semen.SemenNumber,
                //   //         TimeNo: x.TimeNo,
                //   //         AIDate: x.AIDate
                //   //           ? dayjs(x.AIDate).locale("th").format("DD MMM BB")
                //   //           : "",
                //   //         Day: x.AIDate ? dayjs().diff(dayjs(x.AIDate), "day") : "",
                //   //         PregnancyCheckup: preg,
                //   //         ResponsibilityStaffName:
                //   //           x.Staff?.StaffGivenName + " " + x.Staff?.StaffSurname,
                //   //         Birthdate: "",
                //   //         ChildGender: "",
                //   //       });
                //   //     }
                //   //   } else {
                //   //     let preg = {};
                //   //     preg["CheckUpdate"] = "";
                //   //     preg["CheckUpStatus"] = "";
                //   //     preg["CheckUpdateThai"] = "";

                //   //     animal.push({
                //   //       AIID: x.AIID,
                //   //       AnimalID: x.Animal.AnimalID,
                //   //       AnimalSecretStatus: x.Animal.AnimalSecretStatus,
                //   //       FarmIdentificationNumber:
                //   //         x.Animal.AnimalFarm.FarmIdentificationNumber,
                //   //       FarmName: x.Animal.AnimalFarm.FarmName,
                //   //       FarmAddress: x.Animal.AnimalFarm?.FarmAddress,
                //   //       FarmProvince: x.Animal.AnimalFarm?.Province?.ProvinceName,
                //   //       FarmAmphur: x.Animal.AnimalFarm?.Amphur?.AmphurName,
                //   //       FarmTumbol: x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                //   //       AnimalEarID: x.Animal.AnimalEarID,
                //   //       AnimalName: x.Animal.AnimalName,
                //   //       AnimalStatusName: x.Animal.AnimalStatus.AnimalStatusName,
                //   //       AnimalPar: x.PAR,
                //   //       SemenNumber: x.Semen.SemenNumber,
                //   //       TimeNo: x.TimeNo,
                //   //       AIDate: x.AIDate
                //   //         ? dayjs(x.AIDate).locale("th").format("DD MMM BB")
                //   //         : "",
                //   //       Day: x.AIDate ? dayjs().diff(dayjs(x.AIDate), "day") : "",
                //   //       PregnancyCheckup: preg,
                //   //       ResponsibilityStaffName:
                //   //         x.Staff?.StaffGivenName + " " + x.Staff?.StaffSurname,
                //   //       Birthdate: "",
                //   //       ChildGender: "",
                //   //     });
                //   //   }
                // });

                // if (req.query.Day) {
                //   animal = animal.filter((x) => {
                //     return x.Day < Number(req.query.Day) + 1;
                //   });
                // }

                resolve({
                    data: animal,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report21Old(req) {
        // report รายงานการผสมเทียม ผท6
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                let $whereStaff = {};
                // $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                // if (req.query.StaffID) {
                //     $where["ResponsibilityStaffID"] = req.query.StaffID;
                // }

                $whereStaff["isRemove"] = 0;
                $whereStaff["StaffStatus"] = {
                    [Op.and]: [
                        {
                            [Op.not]: "ลาออก",
                        },
                        {
                            [Op.not]: "ตาย",
                        },
                    ],
                };

                $whereStaff["OrganizationProvinceID"] = Number(
                    req.query.ProvinceID
                );

                if (req.query.StaffID) {
                    let staff = await Staff.findOne({
                        where: {
                            StaffID: req.query.StaffID,
                            isRemove: 0,
                            StaffStatus: {
                                [Op.and]: [
                                    {
                                        [Op.not]: "ลาออก",
                                    },
                                    {
                                        [Op.not]: "ตาย",
                                    },
                                ],
                            },
                        },
                    });
                    $whereStaff["StaffNumber"] = staff.StaffNumber;
                } else {
                    if (!req.query.ProvinceID) {
                        if (req.query.OrganizationZoneID) {
                            const province = await Province.findAll({
                                where: {
                                    OrganizationZoneID:
                                        req.query.OrganizationZoneID,
                                },
                            });

                            province.forEach((p) => {
                                provinceIDArr.push(p.ProvinceID);
                            });
                        }

                        if (req.query.AIZoneID) {
                            provinceIDArr = [];
                            const province = await Province.findAll({
                                where: { AIZoneID: req.query.AIZoneID },
                            });

                            province.forEach((p) => {
                                provinceIDArr.push(p.ProvinceID);
                            });
                        }
                    }

                    if (req.query.TumbolID) {
                        $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                    }

                    if (req.query.AmphurID) {
                        $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                    }

                    if (req.query.ProvinceID) {
                        provinceIDArr = [req.query.ProvinceID];
                    }

                    if (provinceIDArr.length != 0) {
                        $whereFarm["FarmProvinceID"] = {
                            [Op.in]: provinceIDArr,
                        };
                    }
                }

                if (req.query.StartDate) {
                    $where["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $where["isRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                // $whereFarm["isRemove"] = 0;

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const queryStaff =
                    Object.keys($whereStaff).length > 0
                        ? { where: $whereStaff }
                        : {};

                let animal = [];
                let ai = null;

                ai = await AI.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                isRemove: 0,
                                isActive: 1,
                            },
                            include: [
                                {
                                    require: true,
                                    model: Farm,
                                    as: "AnimalFarm",
                                    // ...queryFarm,
                                    where: {
                                        FarmProvinceID: 63,
                                    },
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed1",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed2",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed3",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed4",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed5",
                                },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                            include: [
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed1",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed2",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed3",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed4",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed5",
                                },
                            ],
                        },
                        {
                            model: Staff,
                            ...queryStaff,
                            require: true,
                        },
                        {
                            model: PregnancyCheckup,
                            required: false,
                            include: [
                                {
                                    model: PregnancyCheckStatus,
                                    as: "PregnancyCheckStatus",
                                },
                            ],
                        },
                        {
                            model: GiveBirth,
                            required: false,
                        },
                    ],
                });

                console.log(queryFarm);
                console.log(ai.length);
                console.log("FREEDOM");

                let breed = [];

                // ai.forEach(async (x) => {
                //     let b1 = {};
                //     if (x.SemenID != null) {
                //         b1 = x.Semen;
                //     } else if (x.BreederAnimalID != null) {
                //         let father = await Animal.findOne({
                //             where: { AnimalID: x.BreederAnimalID },
                //         });
                //         b1["SemenBreedAll"] = father.AnimalBreedAll;
                //         b1["AnimalBreedID1"] = father.AnimalBreedID1;
                //         b1["SemenNumber"] = father.AnimalEarID;
                //     } else {
                //         b1 = null;
                //     }

                //     if (x.Animal.AnimalBreedID1 != null && b1 != null) {
                //         let checkBreed = breed.find((b) => {
                //             return b1.AnimalBreedID1 == b.AnimalBreedID;
                //         });

                //         if (checkBreed) {
                //             let pregName = "";
                //             if (x.PregnancyCheckups.length != 0) {
                //                 let pc =
                //                     x.PregnancyCheckups[
                //                         x.PregnancyCheckups.length - 1
                //                     ];
                //                 pregName =
                //                     pc.PregnancyCheckStatus
                //                         .PregnancyCheckStatusName;
                //             }

                //             checkBreed.AnimalID.push({
                //                 AnimalID: x.Animal.AnimalID,
                //                 FarmIdentificationNumber:
                //                     x.Animal.AnimalFarm
                //                         .FarmIdentificationNumber,
                //                 FarmName: x.Animal.AnimalFarm.FarmName,
                //                 AnimalEarID: x.Animal.AnimalEarID,
                //                 AnimalName: x.Animal.AnimalName,
                //                 AnimalBreedAll:
                //                     x.Animal.toJSON().AnimalBreedAll,
                //                 AnimalStatusName:
                //                     x.Animal.AnimalStatus?.AnimalStatusName,
                //                 SemenNumber: b1.SemenNumber,
                //                 SemenBreedAll: b1.AnimalBreedAll,
                //                 AnimalPar: x.PAR > 0 ? x.PAR : 0,
                //                 AIDate: x.AIDate
                //                     ? dayjs(x.AIDate)
                //                           .locale("th")
                //                           .format("DD MMM BB")
                //                     : "",
                //                 AIDateReal: x.AIDate,
                //                 ResponsibilityStaffName:
                //                     x.Staff?.StaffGivenName +
                //                     " " +
                //                     x.Staff?.StaffSurname,
                //                 PregnancyCheckStatusName: pregName,
                //                 GiveBirthDate:
                //                     x.GiveBirth != null
                //                         ? dayjs(x.GiveBirth.GiveBirthDate)
                //                               .locale("th")
                //                               .format("DD MMM BB")
                //                         : "-",
                //                 ChildGender:
                //                     x.GiveBirth != null
                //                         ? x.GiveBirth.ChildGender
                //                         : "-",
                //             });
                //             checkBreed.FarmID.push(x.Animal.FarmID);
                //         } else {
                //             let pregName = "";
                //             if (x.PregnancyCheckups.length != 0) {
                //                 let pc =
                //                     x.PregnancyCheckups[
                //                         x.PregnancyCheckups.length - 1
                //                     ];
                //                 pregName =
                //                     pc.PregnancyCheckStatus
                //                         .PregnancyCheckStatusName;
                //             }

                //             breed.push({
                //                 // AnimalBreedID: x.Animal.AnimalBreedID1,
                //                 AnimalBreedID: b1.AnimalBreedID1,
                //                 AnimalID: [
                //                     {
                //                         AnimalID: x.Animal.AnimalID,
                //                         FarmIdentificationNumber:
                //                             x.Animal.AnimalFarm
                //                                 .FarmIdentificationNumber,
                //                         FarmName: x.Animal.AnimalFarm.FarmName,
                //                         AnimalEarID: x.Animal.AnimalEarID,
                //                         AnimalName: x.Animal.AnimalName,
                //                         AnimalBreedAll:
                //                             x.Animal.toJSON().AnimalBreedAll,
                //                         AnimalStatusName:
                //                             x.Animal.AnimalStatus
                //                                 ?.AnimalStatusName,
                //                         SemenNumber: b1?.SemenNumber,
                //                         SemenBreedAll: b1?.AnimalBreedAll,
                //                         AnimalPar: x.PAR > 0 ? x.PAR : 0,
                //                         AIDate: x.AIDate
                //                             ? dayjs(x.AIDate)
                //                                   .locale("th")
                //                                   .format("DD MMM BB")
                //                             : "",
                //                         AIDateReal: x.AIDate,
                //                         ResponsibilityStaffName:
                //                             x.Staff?.StaffGivenName +
                //                             " " +
                //                             x.Staff?.StaffSurname,
                //                         PregnancyCheckStatusName: pregName,
                //                         GiveBirthDate:
                //                             x.GiveBirth != null
                //                                 ? dayjs(
                //                                       x.GiveBirth.GiveBirthDate
                //                                   )
                //                                       .locale("th")
                //                                       .format("DD MMM BB")
                //                                 : "-",
                //                         ChildGender:
                //                             x.GiveBirth != null
                //                                 ? x.GiveBirth.ChildGender
                //                                 : "-",
                //                     },
                //                 ],
                //                 FarmID: [x.Animal.FarmID],
                //             });
                //         }

                //         console.log(checkBreed);
                //         console.log(breed);
                //     }
                //     // console.log(b1);
                //     // console.log("FREEDOM");
                // });

                for (let i = 0; i < ai.length; i++) {
                    let b1 = {};
                    if (ai[i].SemenID != null) {
                        b1 = ai[i].Semen;
                    } else if (ai[i].BreederAnimalID != null) {
                        let father = await Animal.findOne({
                            where: { AnimalID: ai[i].BreederAnimalID },
                        });
                        b1["SemenBreedAll"] = father.AnimalBreedAll;
                        b1["AnimalBreedID1"] = father.AnimalBreedID1;
                        b1["SemenNumber"] = father.AnimalEarID;
                    } else {
                        b1 = null;
                    }

                    if (ai[i].Animal.AnimalBreedID1 != null && b1 != null) {
                        let checkBreed = breed.find((b) => {
                            return b1.AnimalBreedID1 == b.AnimalBreedID;
                        });

                        if (checkBreed) {
                            let pregName = "";
                            if (ai[i].PregnancyCheckups.length != 0) {
                                let pc =
                                    ai[i].PregnancyCheckups[
                                        ai[i].PregnancyCheckups.length - 1
                                    ];
                                pregName =
                                    pc.PregnancyCheckStatus
                                        .PregnancyCheckStatusName;
                            }

                            checkBreed.AnimalID.push({
                                AnimalID: ai[i].Animal.AnimalID,
                                FarmIdentificationNumber:
                                    ai[i].Animal.AnimalFarm
                                        .FarmIdentificationNumber,
                                FarmName: ai[i].Animal.AnimalFarm.FarmName,
                                AnimalEarID: ai[i].Animal.AnimalEarID,
                                AnimalName: ai[i].Animal.AnimalName,
                                AnimalBreedAll:
                                    ai[i].Animal.toJSON().AnimalBreedAll,
                                AnimalStatusName:
                                    ai[i].Animal.AnimalStatus?.AnimalStatusName,
                                SemenNumber: b1.SemenNumber,
                                SemenBreedAll: b1.AnimalBreedAll,
                                AnimalPar: ai[i].PAR > 0 ? ai[i].PAR : 0,
                                AIDate: ai[i].AIDate
                                    ? dayjs(ai[i].AIDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "",
                                AIDateReal: ai[i].AIDate,
                                ResponsibilityStaffName:
                                    ai[i].Staff?.StaffGivenName +
                                    " " +
                                    ai[i].Staff?.StaffSurname,
                                PregnancyCheckStatusName: pregName,
                                GiveBirthDate:
                                    ai[i].GiveBirth != null
                                        ? dayjs(ai[i].GiveBirth.GiveBirthDate)
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "-",
                                ChildGender:
                                    ai[i].GiveBirth != null
                                        ? ai[i].GiveBirth.ChildGender
                                        : "-",
                            });
                            checkBreed.FarmID.push(ai[i].Animal.FarmID);
                        } else {
                            let pregName = "";
                            if (ai[i].PregnancyCheckups.length != 0) {
                                let pc =
                                    ai[i].PregnancyCheckups[
                                        ai[i].PregnancyCheckups.length - 1
                                    ];
                                pregName =
                                    pc.PregnancyCheckStatus
                                        .PregnancyCheckStatusName;
                            }

                            breed.push({
                                // AnimalBreedID: x.Animal.AnimalBreedID1,
                                AnimalBreedID: b1.AnimalBreedID1,
                                AnimalID: [
                                    {
                                        AnimalID: ai[i].Animal.AnimalID,
                                        FarmIdentificationNumber:
                                            ai[i].Animal.AnimalFarm
                                                .FarmIdentificationNumber,
                                        FarmName:
                                            ai[i].Animal.AnimalFarm.FarmName,
                                        AnimalEarID: ai[i].Animal.AnimalEarID,
                                        AnimalName: ai[i].Animal.AnimalName,
                                        AnimalBreedAll:
                                            ai[i].Animal.toJSON()
                                                .AnimalBreedAll,
                                        AnimalStatusName:
                                            ai[i].Animal.AnimalStatus
                                                ?.AnimalStatusName,
                                        SemenNumber: b1?.SemenNumber,
                                        SemenBreedAll: b1?.AnimalBreedAll,
                                        AnimalPar:
                                            ai[i].PAR > 0 ? ai[i].PAR : 0,
                                        AIDate: ai[i].AIDate
                                            ? dayjs(ai[i].AIDate)
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : "",
                                        AIDateReal: ai[i].AIDate,
                                        ResponsibilityStaffName:
                                            ai[i].Staff?.StaffGivenName +
                                            " " +
                                            ai[i].Staff?.StaffSurname,
                                        PregnancyCheckStatusName: pregName,
                                        GiveBirthDate:
                                            ai[i].GiveBirth != null
                                                ? dayjs(
                                                      ai[i].GiveBirth
                                                          .GiveBirthDate
                                                  )
                                                      .locale("th")
                                                      .format("DD MMM BB")
                                                : "-",
                                        ChildGender:
                                            ai[i].GiveBirth != null
                                                ? ai[i].GiveBirth.ChildGender
                                                : "-",
                                    },
                                ],
                                FarmID: [ai[i].Animal.FarmID],
                            });
                        }
                    }
                }

                //

                let breedAll = await AnimalBreed.findAll({
                    raw: true,
                });

                breed = breed.map((x) => {
                    let AnimalBreed = breedAll.find((ba) => {
                        return x.AnimalBreedID == ba.AnimalBreedID;
                        //
                    });

                    x.AnimalRealCount = x.AnimalID.length;

                    let i = [];
                    x.AnimalID.filter((v, idx) => {
                        if (i.includes(v.AnimalID)) {
                            return false;
                        }
                        i.push(v.AnimalID);
                        return true;
                    });

                    x.AnimalCount = i.length;

                    let uniqFarm = [...new Set(x.FarmID)];
                    x.FarmID = uniqFarm;
                    x.FarmCount = x.FarmID.length;
                    x.FarmID = undefined;

                    if (AnimalBreed) {
                        x.AnimalBreedName =
                            AnimalBreed.AnimalBreedName +
                            " (" +
                            AnimalBreed.AnimalBreedShortName +
                            ")";
                    }

                    x.AnimalID.sort((a, b) => {
                        if (a.AIDateReal < b.AIDateReal) {
                            return -1;
                        }
                        if (a.AIDateReal > b.AIDateReal) {
                            return 1;
                        }

                        // names must be equal
                        return 0;
                    });

                    return x;
                });

                breed.sort((a, b) => {
                    if (a.AnimalRealCount > b.AnimalRealCount) {
                        return -1;
                    }
                    if (a.AnimalRealCount < b.AnimalRealCount) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });

                resolve({
                    data: breed,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report21(req) {
        // report รายงานการผสมเทียม ผท6
        return new Promise(async (resolve, reject) => {
            try {
                let $whereOrganization = {};
                let $where = {};
                let $whereAnimal = {};
                let $whereStaff = {};
                let $whereFarm = {};
                //
                $where["isRemove"] = 0;

                if (req.query.StartDate) {
                    $where["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                if (req.query.StartDate_Created) {
                    $where["CreatedDatetime"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate_Created).format(
                                "YYYY-MM-DD"
                            ),
                            dayjs(req.query.EndDate_Created).format(
                                "YYYY-MM-DD"
                            ),
                        ],
                    };
                }

                // Org
                if (req.query.StaffID) {
                    $whereStaff["StaffID"] = Number(req.query.StaffID);
                } else if (req.query.OrganizationID) {
                    $whereOrganization["OrganizationID"] =
                        req.query.OrganizationID;
                } else if (req.query.TumbolID) {
                    $whereOrganization["OrganizationTumbolID"] =
                        req.query.TumbolID;
                } else if (req.query.AmphurID) {
                    $whereOrganization["OrganizationAmphurID"] =
                        req.query.AmphurID;
                } else if (req.query.ProvinceID) {
                    $whereOrganization["OrganizationProvinceID"] = Number(
                        req.query.ProvinceID
                    );
                } else {
                    if (req.query.OrganizationAiZoneID) {
                        $whereOrganization["OrganizationAiZoneID"] =
                            req.query.OrganizationAiZoneID;
                    } else {
                        $whereOrganization["OrganizationZoneID"] =
                            req.query.OrganizationZoneID;
                    }
                }

                if (!req.query.StaffID) {
                    $whereOrganization["isActive"] = 1;
                    $whereOrganization["isRemove"] = 0;

                    const queryOrganization =
                        Object.keys($whereOrganization).length > 0
                            ? { where: $whereOrganization }
                            : {};

                    let organization = await Organization.findAll({
                        ...queryOrganization,
                    });

                    let organizationIds = organization.map(
                        (org) => org.OrganizationID
                    );

                    $whereStaff["StaffOrganizationID"] = {
                        [Op.in]: organizationIds,
                    };
                }

                // Query Staff
                $whereStaff["isRemove"] = 0;
                $whereStaff["isActive"] = 1;
                $whereStaff["StaffNumber"] = {
                    [Op.not]: null,
                };
                // $whereStaff["StaffStatus"] = {
                //     [Op.notIn]: ["ลาออก", "ตาย"],
                // };
                const queryStaff =
                    Object.keys($whereStaff).length > 0
                        ? { where: $whereStaff }
                        : {};

                console.log(queryStaff);

                let staff = await Staff.findAll({
                    attributes: [
                        "StaffID",
                        "StaffNumber",
                        "StaffGivenName",
                        "StaffSurname",
                    ],
                    ...queryStaff,
                });

                let staffIds = staff.map((s) => s.StaffID);

                $where["ResponsibilityStaffID"] = {
                    [Op.in]: staffIds,
                };

                // Animal Type
                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };
                $whereAnimal["isRemove"] = 0;
                $whereAnimal["isActive"] = 1;
                $whereAnimal["AnimalAlive"] = 1;

                // Project
                let WhereProject = null;
                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                // Query
                $whereFarm["isRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};
                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};
                const queryAnimal =
                    Object.keys($whereAnimal).length > 0
                        ? { where: $whereAnimal }
                        : {};

                let ai = await AI.findAll({
                    // attributes: [
                    //     "ResponsibilityStaffID",
                    //     "AIID",
                    //     "AnimalID",
                    //     "AIDate",
                    // ],
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            ...queryAnimal,
                            include: [
                                {
                                    require: true,
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        { model: Project, where: WhereProject },
                                        { model: Province, as: "Province" },
                                        { model: Amphur, as: "Amphur" },
                                        { model: Tumbol, as: "Tumbol" },
                                    ],
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                                { model: AnimalBreed, as: "AnimalBreed1" },
                                { model: AnimalBreed, as: "AnimalBreed2" },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                            include: [
                                { model: AnimalBreed, as: "AnimalBreed1" },
                                { model: AnimalBreed, as: "AnimalBreed2" },
                            ],
                        },
                        {
                            model: PregnancyCheckup,
                            required: false,
                            include: [
                                {
                                    model: PregnancyCheckStatus,
                                    as: "PregnancyCheckStatus",
                                },
                            ],
                        },
                        {
                            model: GiveBirth,
                            required: false,
                        },
                        {
                            model: Staff,
                            require: true,
                        },
                    ],
                });

                let breed = [];

                for (let i = 0; i < ai.length; i++) {
                    let b1 = {};
                    if (ai[i].SemenID != null) {
                        b1 = ai[i].Semen;
                    } else if (ai[i].BreederAnimalID != null) {
                        let father = await Animal.findOne({
                            where: { AnimalID: ai[i].BreederAnimalID },
                            include: [
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed1",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed2",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed3",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed4",
                                },
                                {
                                    model: AnimalBreed,
                                    as: "AnimalBreed5",
                                },
                            ],
                        });
                        //
                        console.log(father.toJSON().AnimalBreedAll);
                        console.log(father.AnimalBreedID1);
                        //
                        b1["AnimalBreedAll"] = father.toJSON().AnimalBreedAll;
                        b1["AnimalBreedID1"] = father.AnimalBreedID1;
                        b1["SemenNumber"] = father.AnimalEarID;
                    } else {
                        b1 = null;
                    }

                    if (ai[i].Animal.AnimalBreedID1 != null && b1 != null) {
                        let checkBreed = breed.find(
                            (b) => b1.AnimalBreedID1 == b.AnimalBreedID
                        );

                        let pregName = "";
                        if (ai[i].PregnancyCheckups.length != 0) {
                            let pc =
                                ai[i].PregnancyCheckups[
                                    ai[i].PregnancyCheckups.length - 1
                                ];
                            pregName =
                                pc.PregnancyCheckStatus
                                    .PregnancyCheckStatusName;
                        }

                        if (checkBreed) {
                            checkBreed.AnimalID.push({
                                AnimalID: ai[i].Animal.AnimalID,
                                FarmIdentificationNumber:
                                    ai[i].Animal.AnimalFarm
                                        .FarmIdentificationNumber,
                                FarmName: ai[i].Animal.AnimalFarm.FarmName,
                                AnimalEarID: ai[i].Animal.AnimalEarID,
                                AnimalName: ai[i].Animal.AnimalName,
                                AnimalBreedAll:
                                    ai[i].Animal.toJSON().AnimalBreedAll,
                                AnimalStatusName:
                                    ai[i].Animal.AnimalStatus?.AnimalStatusName,
                                SemenNumber: b1.SemenNumber,
                                SemenBreedAll: b1?.AnimalBreedAll,
                                AnimalPar: ai[i].PAR > 0 ? ai[i].PAR : 0,
                                AIDate: ai[i].AIDate
                                    ? dayjs(ai[i].AIDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "",
                                AIDateReal: ai[i].AIDate,
                                ResponsibilityStaffName:
                                    ai[i].Staff?.StaffGivenName +
                                    " " +
                                    ai[i].Staff?.StaffSurname,
                                PregnancyCheckStatusName: pregName,
                                GiveBirthDate: ai[i].GiveBirth
                                    ? dayjs(ai[i].GiveBirth.GiveBirthDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "-",
                                ChildGender: ai[i].GiveBirth
                                    ? ai[i].GiveBirth.ChildGender
                                    : "-",
                            });
                            checkBreed.FarmID.push(ai[i].Animal.FarmID);
                        } else {
                            console.log(b1);
                            breed.push({
                                AnimalBreedID: b1.AnimalBreedID1,
                                AnimalID: [
                                    {
                                        AnimalID: ai[i].Animal.AnimalID,
                                        FarmIdentificationNumber:
                                            ai[i].Animal.AnimalFarm
                                                .FarmIdentificationNumber,
                                        FarmName:
                                            ai[i].Animal.AnimalFarm.FarmName,
                                        AnimalEarID: ai[i].Animal.AnimalEarID,
                                        AnimalName: ai[i].Animal.AnimalName,
                                        AnimalBreedAll:
                                            ai[i].Animal.toJSON()
                                                .AnimalBreedAll,
                                        AnimalStatusName:
                                            ai[i].Animal.AnimalStatus
                                                ?.AnimalStatusName,
                                        SemenNumber: b1?.SemenNumber,
                                        SemenBreedAll: b1?.AnimalBreedAll,
                                        AnimalPar:
                                            ai[i].PAR > 0 ? ai[i].PAR : 0,
                                        AIDate: ai[i].AIDate
                                            ? dayjs(ai[i].AIDate)
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : "",
                                        AIDateReal: ai[i].AIDate,
                                        ResponsibilityStaffName:
                                            ai[i].Staff?.StaffGivenName +
                                            " " +
                                            ai[i].Staff?.StaffSurname,
                                        PregnancyCheckStatusName: pregName,
                                        GiveBirthDate: ai[i].GiveBirth
                                            ? dayjs(
                                                  ai[i].GiveBirth.GiveBirthDate
                                              )
                                                  .locale("th")
                                                  .format("DD MMM BB")
                                            : "-",
                                        ChildGender: ai[i].GiveBirth
                                            ? ai[i].GiveBirth.ChildGender
                                            : "-",
                                    },
                                ],
                                FarmID: [ai[i].Animal.FarmID],
                            });
                        }
                    }
                }

                let breedAll = await AnimalBreed.findAll({
                    raw: true,
                });

                breed = breed.map((x) => {
                    let AnimalBreed = breedAll.find(
                        (ba) => x.AnimalBreedID == ba.AnimalBreedID
                    );

                    x.AnimalRealCount = x.AnimalID.length;

                    let i = [];
                    x.AnimalID = x.AnimalID.filter((v) => {
                        if (i.includes(v.AnimalID)) {
                            return false;
                        }
                        i.push(v.AnimalID);
                        return true;
                    });

                    x.AnimalCount = i.length;

                    let uniqFarm = [...new Set(x.FarmID)];
                    x.FarmID = uniqFarm;
                    x.FarmCount = x.FarmID.length;
                    x.FarmID = undefined;

                    if (AnimalBreed) {
                        x.AnimalBreedName =
                            AnimalBreed.AnimalBreedName +
                            " (" +
                            AnimalBreed.AnimalBreedShortName +
                            ")";
                    }

                    x.AnimalID.sort((a, b) => {
                        if (a.AIDateReal < b.AIDateReal) {
                            return -1;
                        }
                        if (a.AIDateReal > b.AIDateReal) {
                            return 1;
                        }

                        return 0;
                    });

                    return x;
                });

                breed.sort((a, b) => {
                    if (a.AnimalRealCount > b.AnimalRealCount) {
                        return -1;
                    }
                    if (a.AnimalRealCount < b.AnimalRealCount) {
                        return 1;
                    }

                    return 0;
                });

                // นับจำนวนการตรวจสถานะการตั้งท้อง
                breed.forEach((b) => {
                    b.PregnantCount = b.AnimalID.filter(
                        (a) => a.PregnancyCheckStatusName === "ท้อง"
                    ).length;
                    b.NotPregnantCount = b.AnimalID.filter(
                        (a) => a.PregnancyCheckStatusName === "ไม่ท้อง"
                    ).length;
                    b.WaitingForRetestCount = b.AnimalID.filter(
                        (a) => a.PregnancyCheckStatusName === "รอตรวจซ้ำ"
                    ).length;
                    b.NotCheckedCount = b.AnimalID.filter(
                        (a) => a.PregnancyCheckStatusName === ""
                    ).length;
                });

                resolve({
                    data: breed,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report22(req) {
        // report รายงานครบกำหนดคลอด
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                };

                $whereAnimal["isRemove"] = 0;
                $whereAnimal["AnimalAlive"] = 1;

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (req.query.FarmID) {
                    $whereFarm["FarmID"] = req.query.FarmID;
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                let animal = [];

                const ai = await AI.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: $whereAnimal,
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        {
                            model: Staff,
                        },
                        {
                            model: PregnancyCheckup,
                            required: false,
                        },
                    ],
                });

                const ai_all = ai.filter((x) => {
                    return true;
                });

                ai_all.forEach((x) => {
                    let GiveBirthDay = 0;
                    if (req.query.AnimalTypeID == "[1,2,41,42]") {
                        GiveBirthDay = 260;
                    }

                    // กระบือ
                    if (req.query.AnimalTypeID == "[3,4,43,44]") {
                        GiveBirthDay = 320;
                    }

                    // แพะ
                    if (req.query.AnimalTypeID == "[17,18,45,46]") {
                        GiveBirthDay = 180;
                    }

                    if (x.PregnancyCheckups.length != 0) {
                        let preg = {};
                        let checkBirth = 0;

                        for (
                            let index = 0;
                            index < x.PregnancyCheckups.length;
                            index++
                        ) {
                            if (
                                x.PregnancyCheckups[index]
                                    .PregnancyCheckStatusID == 2
                            ) {
                                checkBirth = 1;
                            } else {
                                preg["CheckUpdate"] =
                                    x.PregnancyCheckups[index].CheckupDate;

                                preg["CheckUpdateThai"] = dayjs(
                                    x.PregnancyCheckups[index].CheckupDate
                                )
                                    .locale("th")
                                    .format("DD MMM BB");

                                preg["CheckUpStatus"] =
                                    x.PregnancyCheckups[
                                        index
                                    ].PregnancyCheckStatusID;
                                if (
                                    x.PregnancyCheckups[index]
                                        .PregnancyCheckStatusID == 1
                                ) {
                                    preg["CheckUpStatusText"] = "ท้อง";
                                }

                                if (
                                    x.PregnancyCheckups[index]
                                        .PregnancyCheckStatusID == 2
                                ) {
                                    preg["CheckUpStatusText"] = "ไม่ท้อง";
                                }

                                if (
                                    x.PregnancyCheckups[index]
                                        .PregnancyCheckStatusID == 3
                                ) {
                                    preg["CheckUpStatusText"] = "รอตรวจซ้ำ";
                                }
                            }
                        }

                        if (preg["CheckUpStatusText"] == "ท้อง") {
                            animal.push({
                                AIID: x.AIID,
                                AnimalID: x.Animal.AnimalID,
                                AnimalSecretStatus: x.Animal.AnimalSecretStatus,
                                FarmIdentificationNumber:
                                    x.Animal.AnimalFarm
                                        .FarmIdentificationNumber,
                                FarmName: x.Animal.AnimalFarm.FarmName,
                                FarmAddress: x.Animal.AnimalFarm?.FarmAddress,
                                FarmProvince:
                                    x.Animal.AnimalFarm?.Province?.ProvinceName,
                                FarmAmphur:
                                    x.Animal.AnimalFarm?.Amphur?.AmphurName,
                                FarmTumbol:
                                    x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                                AnimalEarID: x.Animal.AnimalEarID,
                                AnimalName: x.Animal.AnimalName,
                                AnimalStatusName:
                                    x.Animal.AnimalStatus?.AnimalStatusName,
                                AnimalPar: x.PAR,
                                SemenNumber: x.Semen?.SemenNumber,
                                TimeNo: x.TimeNo,
                                AIDate: x.AIDate
                                    ? dayjs(x.AIDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "",
                                Day: x.AIDate
                                    ? dayjs().diff(dayjs(x.AIDate), "day")
                                    : "",
                                GiveBirthDay: x.AIDate
                                    ? dayjs(
                                          dayjs(x.AIDate).add(
                                              GiveBirthDay,
                                              "day"
                                          )
                                      )
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "",
                                PregnancyCheckup: preg,
                                ResponsibilityStaffName:
                                    x.Staff?.StaffGivenName +
                                    " " +
                                    x.Staff?.StaffSurname,
                                Birthdate: "",
                                ChildGender: "",
                            });
                        }
                    } else {
                        // let preg = {};
                        // preg["CheckUpdate"] = "";
                        // preg["CheckUpStatus"] = "";
                        // preg["CheckUpdateThai"] = "";
                        // animal.push({
                        //   AIID: x.AIID,
                        //   AnimalID: x.Animal.AnimalID,
                        //   AnimalSecretStatus: x.Animal.AnimalSecretStatus,
                        //   FarmIdentificationNumber:
                        //     x.Animal.AnimalFarm.FarmIdentificationNumber,
                        //   FarmName: x.Animal.AnimalFarm.FarmName,
                        //   FarmAddress: x.Animal.AnimalFarm?.FarmAddress,
                        //   FarmProvince: x.Animal.AnimalFarm?.Province?.ProvinceName,
                        //   FarmAmphur: x.Animal.AnimalFarm?.Amphur?.AmphurName,
                        //   FarmTumbol: x.Animal.AnimalFarm?.Tumbol?.TumbolName,
                        //   AnimalEarID: x.Animal.AnimalEarID,
                        //   AnimalName: x.Animal.AnimalName,
                        //   AnimalStatusName: x.Animal.AnimalStatus.AnimalStatusName,
                        //   AnimalPar: x.PAR,
                        //   SemenNumber: x.Semen.SemenNumber,
                        //   TimeNo: x.TimeNo,
                        //   AIDate: x.AIDate
                        //     ? dayjs(x.AIDate).locale("th").format("DD MMM BB")
                        //     : "",
                        //   Day: x.AIDate ? dayjs().diff(dayjs(x.AIDate), "day") : "",
                        //   GiveBirthDay: x.AIDate
                        //     ? dayjs(dayjs(x.AIDate).add(GiveBirthDay, "day"))
                        //         .locale("th")
                        //         .format("DD MMM BB")
                        //     : "",
                        //   PregnancyCheckup: preg,
                        //   ResponsibilityStaffName:
                        //     x.Staff?.StaffGivenName + " " + x.Staff?.StaffSurname,
                        //   Birthdate: "",
                        //   ChildGender: "",
                        // });
                    }
                });

                // if (req.query.Day) {
                //   animal = animal.filter((x) => {
                //     return x.Day < Number(req.query.Day) + 1;
                //   });
                // }

                let set_day = 0;
                // โค
                if (req.query.AnimalTypeID == "[1,2,41,42]") {
                    set_day = 229; //260
                }

                // กระบือ
                if (req.query.AnimalTypeID == "[3,4,43,44]") {
                    set_day = 289; // 320
                }

                // แพะ
                if (req.query.AnimalTypeID == "[17,18,45,46]") {
                    set_day = 149; // 180
                }

                animal = animal.filter((x) => {
                    return x.Day > set_day;
                });

                resolve({
                    data: animal,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report23(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                    $where["CheckupDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $where["PregnancyCheckStatusID"] = 1;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const preg = await PregnancyCheckup.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: AI,
                            as: "AI",
                            where: {
                                AIDate: {
                                    [Op.between]: [
                                        dayjs()
                                            .subtract(1, "year")
                                            .format("YYYY-MM-DD"),
                                        dayjs().format("YYYY-MM-DD"),
                                    ],
                                },
                            },
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                },
                            ],
                        },
                        {
                            model: Staff,
                        },
                        {
                            model: PregnancyCheckStatus,
                        },
                    ],
                });

                let preg_arr = [];
                let animal_id_arr = [];
                for (let i = 0; i < preg.length; i++) {
                    if (preg[i].AnimalID != null) {
                        animal_id_arr.push(preg[i].AnimalID);
                    }
                }

                let gb_all = await GiveBirth.findAll({
                    where: {
                        AnimalID: {
                            [Op.in]: animal_id_arr,
                        },
                    },
                    order: [["GiveBirthID", "DESC"]],
                    raw: true,
                });

                for (let i = 0; i < preg.length; i++) {
                    let gb = gb_all.find((j) => {
                        return (
                            j.AnimalID == preg[i].AnimalID &&
                            j.AIID != preg[i].AIID
                        );
                    });

                    if (preg[i].AnimalID != null) {
                        let check1 = preg_arr.findIndex((j) => {
                            return (
                                j != undefined &&
                                j.AnimalID == preg[i].Animal.AnimalID
                            );
                        });

                        if (check1 >= 0) {
                            if (preg[i].AI.TimeNo > preg_arr[check1].TimeNo) {
                                preg_arr.splice(check1, 1);
                                preg_arr[i] = {
                                    AIID: preg[i].AIID,
                                    AnimalID: preg[i].AnimalID,
                                    AnimalSecretStatus:
                                        preg[i].Animal.AnimalSecretStatus,
                                    FarmIdentificationNumber:
                                        preg[i].Animal.AnimalFarm
                                            .FarmIdentificationNumber,
                                    FarmName:
                                        preg[i].Animal.AnimalFarm.FarmName,
                                    FarmAddress:
                                        preg[i].Animal.AnimalFarm?.FarmAddress,
                                    FarmProvince:
                                        preg[i].Animal.AnimalFarm?.Province
                                            ?.ProvinceName,
                                    FarmAmphur:
                                        preg[i].Animal.AnimalFarm?.Amphur
                                            ?.AmphurName,
                                    FarmTumbol:
                                        preg[i].Animal.AnimalFarm?.Tumbol
                                            ?.TumbolName,
                                    AnimalEarID: preg[i].Animal.AnimalEarID,
                                    AnimalName: preg[i].Animal.AnimalName,
                                    AnimalStatusName:
                                        preg[i].Animal.AnimalStatus
                                            ?.AnimalStatusName,
                                    AnimalPar: preg[i].AI.AinalPar,
                                    SemenNumber: preg[i].AI.Semen?.SemenNumber,
                                    TimeNo: preg[i].AI.TimeNo,
                                    ThaiAIDate: preg[i].AI.AIDate
                                        ? dayjs(preg[i].AI.AIDate)
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "",
                                    AIDate: preg[i].AI.AIDate,
                                    ResponsibilityStaffName:
                                        preg[i].Staff?.StaffGivenName +
                                        " " +
                                        preg[i].Staff?.StaffSurname,
                                };
                                preg_arr[i]["GiveBirth"] = null;
                                if (gb) {
                                    preg_arr[i]["GiveBirth"] = gb.GiveBirthDate;
                                }
                            }
                        } else {
                            if (preg[i].Animal != null) {
                                preg_arr[i] = {
                                    AIID: preg[i].AIID,
                                    AnimalID: preg[i].Animal.AnimalID,
                                    AnimalSecretStatus:
                                        preg[i].Animal.AnimalSecretStatus,
                                    FarmIdentificationNumber:
                                        preg[i].Animal.AnimalFarm
                                            .FarmIdentificationNumber,
                                    FarmName:
                                        preg[i].Animal.AnimalFarm.FarmName,
                                    FarmAddress:
                                        preg[i].Animal.AnimalFarm?.FarmAddress,
                                    FarmProvince:
                                        preg[i].Animal.AnimalFarm?.Province
                                            ?.ProvinceName,
                                    FarmAmphur:
                                        preg[i].Animal.AnimalFarm?.Amphur
                                            ?.AmphurName,
                                    FarmTumbol:
                                        preg[i].Animal.AnimalFarm?.Tumbol
                                            ?.TumbolName,
                                    AnimalEarID: preg[i].Animal.AnimalEarID,
                                    AnimalName: preg[i].Animal.AnimalName,
                                    AnimalStatusName:
                                        preg[i].Animal.AnimalStatus
                                            ?.AnimalStatusName,
                                    AnimalPar: preg[i].AI.AinalPar,
                                    SemenNumber: preg[i].AI.Semen?.SemenNumber,
                                    TimeNo: preg[i].AI.TimeNo,
                                    ThaiAIDate: preg[i].AI.AIDate
                                        ? dayjs(preg[i].AI.AIDate)
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "",
                                    AIDate: preg[i].AI.AIDate,
                                    ResponsibilityStaffName:
                                        preg[i].Staff?.StaffGivenName +
                                        " " +
                                        preg[i].Staff?.StaffSurname,
                                };

                                preg_arr[i]["GiveBirth"] = null;
                                if (gb) {
                                    preg_arr[i]["GiveBirth"] = gb.GiveBirthDate;
                                }
                            }
                        }
                    }
                }

                let filter_preg = preg_arr
                    .filter((x) => {
                        return x.GiveBirth != null;
                    })
                    .map((x) => {
                        x.result_day1 = dayjs(x.AIDate).diff(
                            dayjs(x.GiveBirth),
                            "day"
                        );
                        return x;
                    })
                    .filter((x) => {
                        return x.result_day1 > 0;
                    });

                let sum_result_day1 = 0;
                let animal_more = [];
                let animal_less_more = [];
                let result_day1_all = [];

                filter_preg.forEach((x) => {
                    sum_result_day1 = x.result_day1 + sum_result_day1;
                    result_day1_all.push(x.result_day1);
                });
                sum_result_day1 = sum_result_day1 / filter_preg.length;

                // result_day1_all
                const median = (arr) => {
                    const { length } = arr;

                    arr.sort((a, b) => a - b);

                    if (length % 2 === 0) {
                        return (arr[length / 2 - 1] + arr[length / 2]) / 2;
                    }

                    return arr[(length - 1) / 2];
                };

                let animal_median = median(result_day1_all);

                animal_more = filter_preg.filter((x) => {
                    return x.result_day1 >= 130;
                });

                animal_less_more = filter_preg.filter((x) => {
                    return x.result_day1 < 130;
                });

                animal_all = animal_more.length + animal_less_more.length;

                // console.log(filter_preg);
                // console.log(sum_result_day1);
                // console.log(animal_more.length);
                // console.log(animal_less_more.length);
                // console.log(animal_all);
                // console.log(animal_median);

                resolve({
                    data: [
                        {
                            title: "ช่วงห่างการคลอดถึงวันผสมติด (วัน)",
                            AnimalID: filter_preg,
                            all: animal_all,
                            median: "130-150", //animal_median,
                            avg: parseFloat(sum_result_day1).toFixed(2),
                            animal_more: animal_more,
                            animal_less_more: animal_less_more,
                            animal_more_count: animal_more.length,
                            animal_less_more_count: animal_less_more.length,
                        },
                    ],
                });
                // resolve({ res: tru   e });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report24(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                  $where["AIDate"] = {
                    [Op.between]: [
                      dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                      dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                    ],
                  };
                }

                $where["TimeNo"] = 1;

                $where["AIDate"] = {
                    [Op.between]: [
                        dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                        dayjs().format("YYYY-MM-DD"),
                    ],
                };

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const ai = await AI.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                AnimalStatusID: {
                                    [Op.in]: [5, 10, 15],
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        {
                            model: Staff,
                        },
                    ],
                });

                let ai_arr = [];
                let animal_id_arr = [];
                for (let i = 0; i < ai.length; i++) {
                    if (ai[i].AnimalID != null) {
                        animal_id_arr.push(ai[i].AnimalID);
                    }
                }

                let gb_all = await GiveBirth.findAll({
                    where: {
                        AnimalID: {
                            [Op.in]: animal_id_arr,
                        },
                    },
                    order: [["GiveBirthID", "DESC"]],
                    raw: true,
                });

                for (let i = 0; i < ai.length; i++) {
                    ai[i].GiveBirth = null;
                    //   let gb = await GiveBirth.findOne({
                    //     where: {
                    //       AnimalID: ai[i].AnimalID,
                    //       AIID: {
                    //         [Op.ne]: ai[i].AIID,
                    //       },
                    //     },
                    //     order: [["GiveBirthID", "DESC"]],
                    //     raw: true,
                    //   });

                    let gb = gb_all.find((j) => {
                        return (
                            j.AnimalID == ai[i].AnimalID && j.AIID != ai[i].AIID
                        );
                    });

                    if (gb) {
                        let check = ai_arr.findIndex((j) => {
                            return (
                                j != undefined &&
                                j.AnimalID == ai[i].Animal.AnimalID
                            );
                        });

                        if (check == -1) {
                            ai_arr[i] = {
                                AIID: ai[i].AIID,
                                AnimalID: ai[i].AnimalID,
                                AnimalSecretStatus:
                                    ai[i].Animal.AnimalSecretStatus,
                                FarmIdentificationNumber:
                                    ai[i].Animal.AnimalFarm
                                        .FarmIdentificationNumber,
                                FarmName: ai[i].Animal.AnimalFarm.FarmName,
                                FarmAddress:
                                    ai[i].Animal.AnimalFarm?.FarmAddress,
                                FarmProvince:
                                    ai[i].Animal.AnimalFarm?.Province
                                        ?.ProvinceName,
                                FarmAmphur:
                                    ai[i].Animal.AnimalFarm?.Amphur?.AmphurName,
                                FarmTumbol:
                                    ai[i].Animal.AnimalFarm?.Tumbol?.TumbolName,
                                AnimalEarID: ai[i].Animal.AnimalEarID,
                                AnimalName: ai[i].Animal.AnimalName,
                                AnimalStatusName:
                                    ai[i].Animal.AnimalStatus?.AnimalStatusName,
                                AnimalPar: ai[i].PAR,
                                SemenNumber: ai[i].Semen?.SemenNumber,
                                TimeNo: ai[i].TimeNo,
                                ThaiAIDate: ai[i].AIDate
                                    ? dayjs(ai[i].AIDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "",
                                AIDate: ai[i].AIDate,
                                ResponsibilityStaffName:
                                    ai[i].Staff?.StaffGivenName +
                                    " " +
                                    ai[i].Staff?.StaffSurname,
                            };
                            ai_arr[i]["GiveBirthDateOld"] = gb.GiveBirthDate;
                        }
                    }
                }

                // console.log(ai_arr);

                let filter_ai = ai_arr
                    .filter((x) => {
                        return x.GiveBirthDateOld != null;
                    })
                    .map((x) => {
                        x.result_day1 = dayjs(x.AIDate).diff(
                            dayjs(x.GiveBirthDateOld),
                            "day"
                        );
                        return x;
                    })
                    .filter((x) => {
                        return x.result_day1 > 0;
                    });

                let sum_result_day1 = 0;
                let animal_more = [];
                let animal_less_more = [];
                let result_day1_all = [];

                filter_ai.forEach((x) => {
                    sum_result_day1 = x.result_day1 + sum_result_day1;
                    result_day1_all.push(x.result_day1);
                });
                sum_result_day1 = sum_result_day1 / filter_ai.length;

                // result_day1_all
                const median = (arr) => {
                    const { length } = arr;

                    arr.sort((a, b) => a - b);

                    if (length % 2 === 0) {
                        return (arr[length / 2 - 1] + arr[length / 2]) / 2;
                    }

                    return arr[(length - 1) / 2];
                };

                let animal_median = median(result_day1_all);

                animal_more = filter_ai.filter((x) => {
                    return x.result_day1 >= 65; //sum_result_day1;
                });

                animal_less_more = filter_ai.filter((x) => {
                    return x.result_day1 < 65; //sum_result_day1;
                });

                animal_all = animal_more.length + animal_less_more.length;

                // console.log(filter_ai);
                // console.log(sum_result_day1);
                // console.log(animal_more.length);
                // console.log(animal_less_more.length);
                // console.log(animal_all);
                // console.log(animal_median);

                resolve({
                    data: [
                        {
                            title: "ช่วงห่างการคลอดถึงวันผสมครั้งแรก (วัน)",
                            AnimalID: filter_ai,
                            all: animal_all,
                            median: "65-80", //animal_median,
                            avg: parseFloat(sum_result_day1).toFixed(2),
                            animal_more: animal_more,
                            animal_less_more: animal_less_more,
                            animal_more_count: animal_more.length,
                            animal_less_more_count: animal_less_more.length,
                        },
                    ],
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report25(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                    $where["CheckupDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $where["GiveBirthDate"] = {
                    [Op.between]: [
                        dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                        dayjs().format("YYYY-MM-DD"),
                    ],
                };

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const gbm = await GiveBirth.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                AnimalStatusID: {
                                    [Op.in]: [5, 10, 15],
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Staff,
                        },
                    ],
                });

                let gbm_arr = [];

                for (let i = 0; i < gbm.length; i++) {
                    gbm[i].GiveBirth = null;
                    let gb = await GiveBirth.findOne({
                        where: {
                            AnimalID: gbm[i].AnimalID,
                            GiveBirthID: {
                                [Op.ne]: gbm[i].GiveBirthID,
                            },
                        },
                        order: [["GiveBirthID", "DESC"]],
                        raw: true,
                    });

                    if (gb) {
                        let check = gbm_arr.findIndex((j) => {
                            return (
                                j != undefined &&
                                j.AnimalID == gbm[i].Animal.AnimalID
                            );
                        });

                        if (check == -1) {
                            gbm_arr[i] = {
                                AIID: gbm[i].AIID,
                                AnimalID: gbm[i].AnimalID,
                                AnimalSecretStatus:
                                    gbm[i].Animal.AnimalSecretStatus,
                                FarmIdentificationNumber:
                                    gbm[i].Animal.AnimalFarm
                                        .FarmIdentificationNumber,
                                FarmName: gbm[i].Animal.AnimalFarm.FarmName,
                                FarmAddress:
                                    gbm[i].Animal.AnimalFarm?.FarmAddress,
                                FarmProvince:
                                    gbm[i].Animal.AnimalFarm?.Province
                                        ?.ProvinceName,
                                FarmAmphur:
                                    gbm[i].Animal.AnimalFarm?.Amphur
                                        ?.AmphurName,
                                FarmTumbol:
                                    gbm[i].Animal.AnimalFarm?.Tumbol
                                        ?.TumbolName,
                                AnimalEarID: gbm[i].Animal.AnimalEarID,
                                AnimalName: gbm[i].Animal.AnimalName,
                                AnimalStatusName:
                                    gbm[i].Animal.AnimalStatus
                                        ?.AnimalStatusName,
                                AnimalPar: gbm[i].PAR,
                                SemenNumber: "",
                                TimeNo: gbm[i].TimeNo,
                                GiveBirthDate: gbm[i].GiveBirthDate
                                    ? dayjs(gbm[i].GiveBirthDate)
                                          .locale("th")
                                          .format("DD MMM BB")
                                    : "",
                                AIDate: "",
                                ResponsibilityStaffName:
                                    gbm[i].Staff?.StaffGivenName +
                                    " " +
                                    gbm[i].Staff?.StaffSurname,
                            };
                            gbm_arr[i]["GiveBirthDateOld"] = gb.GiveBirthDate;
                        }
                    }
                }

                let filter_gbm = gbm_arr
                    .filter((x) => {
                        return x.GiveBirthDateOld != null;
                    })
                    .map((x) => {
                        x.result_day1 = dayjs(x.GiveBirthDate).diff(
                            dayjs(x.GiveBirthDateOld),
                            "day"
                        );
                        return x;
                    })
                    .filter((x) => {
                        return x.result_day1 > 0;
                    });

                let sum_result_day1 = 0;
                let animal_more = [];
                let animal_less_more = [];
                let result_day1_all = [];

                filter_gbm.forEach((x) => {
                    sum_result_day1 = x.result_day1 + sum_result_day1;
                    result_day1_all.push(x.result_day1);
                });
                sum_result_day1 = sum_result_day1 / filter_gbm.length;

                // result_day1_all
                const median = (arr) => {
                    const { length } = arr;

                    arr.sort((a, b) => a - b);

                    if (length % 2 === 0) {
                        return (arr[length / 2 - 1] + arr[length / 2]) / 2;
                    }

                    return arr[(length - 1) / 2];
                };

                let animal_median = median(result_day1_all);

                animal_more = filter_gbm.filter((x) => {
                    return x.result_day1 >= sum_result_day1;
                });

                animal_less_more = filter_gbm.filter((x) => {
                    return x.result_day1 < sum_result_day1;
                });

                animal_all = animal_more.length + animal_less_more.length;

                // console.log(filter_ai);
                // console.log(sum_result_day1);
                // console.log(animal_more.length);
                // console.log(animal_less_more.length);
                // console.log(animal_all);
                // console.log(animal_median);

                resolve({
                    data: [
                        {
                            title: "ช่วงห่างการคลอดลูก (วัน)",
                            AnimalID: filter_gbm,
                            all: animal_all,
                            median: animal_median,
                            avg: parseFloat(sum_result_day1).toFixed(2),
                            animal_more: animal_more,
                            animal_less_more: animal_less_more,
                            animal_more_count: animal_more.length,
                            animal_less_more_count: animal_less_more.length,
                        },
                    ],
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report26(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                    $where["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $whereFarm["isRemove"] = 0;
                $where["isActive"] = 1;
                $where["IsRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const ai = await AI.findAll({
                    include: [
                        {
                            model: PregnancyCheckup,
                            required: true,
                            where: {
                                TimeNo: {
                                    [Op.eq]: sequelize.literal(`(
                              SELECT MAX("PregnancyCheckup"."TimeNo")
                              FROM "PregnancyCheckup"
                              WHERE "PregnancyCheckup"."AIID" = "AI"."AIID"
                            )`),
                                },
                            },
                        },
                        {
                            model: Animal,
                            as: "Animal",
                            required: true,
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                isRemove: 0,
                                // AnimalStatusID: {
                                //     [Op.in]: [5, 10, 15],
                                // },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    required: true,
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Staff,
                            required: true,
                        },
                    ],
                    ...query,
                });

                const ai_length = ai.length;

                let ai_success = [];
                let animal_id_arr = [];
                let farm = [];

                for (let i = 0; i < ai_length; i++) {
                    if (ai[i].AnimalID != null) {
                        // animal_id_arr.push(ai[i].AnimalID);

                        // อยากรู้ว่าฟาร์มนี้กี่เปอ
                        let checkDup = farm.find((x) => {
                            return x.FarmID == ai[i].Animal.FarmID;
                        });

                        if (!checkDup) {
                            farm.push({
                                FarmName: ai[i].Animal.AnimalFarm.FarmName,
                                FarmIdentificationNumber:
                                    ai[i].Animal.AnimalFarm
                                        .FarmIdentificationNumber,
                                FarmID: ai[i].Animal.FarmID,
                                ai: [ai[i]],
                                ai_success: 0,
                                ai_all: 0,
                                rate: 0,
                                level: i + 1,
                            });
                        } else {
                            checkDup.ai.push(ai[i]);
                        }
                    }
                }

                for (let index = 0; index < farm.length; index++) {
                    let ai_farm_success = farm[index].ai.filter((x) => {
                        return (
                            x.PregnancyCheckups[0].PregnancyCheckStatusID == 1
                        );
                    });

                    farm[index].ai_success = ai_farm_success.length;
                    farm[index].ai_all = farm[index].ai.length;
                    farm[index].rate =
                        (farm[index].ai_success / farm[index].ai_all) * 100;
                }

                let sum_rate = 0;
                let farm_more = [];
                let farm_less_more = [];
                let farm_all = [];

                farm.forEach((x) => {
                    sum_rate = x.rate + sum_rate;
                    farm_all.push(x);
                });
                sum_rate = sum_rate / farm.length;

                farm_more = farm.filter((x) => {
                    delete x.ai;
                    return x.rate >= 60;
                });

                farm_less_more = farm.filter((x) => {
                    delete x.ai;
                    return x.rate < 60;
                });

                // farm_all = farm_more.length + farm_less_more.length;

                // console.log(farm_more.splice)

                resolve({
                    data: [
                        {
                            title: "อัตราการผสมติด",
                            median: "60-70%",
                            all: farm_all.length,
                            // median: animal_median,
                            avg: parseFloat(sum_rate).toFixed(2),
                            farm_more: farm_more,
                            farm_less_more: farm_less_more,
                            animal_more_count: farm_more.length,
                            animal_less_more_count: farm_less_more.length,
                        },
                    ],
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report27(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                    $where["AIDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $whereFarm["isRemove"] = 0;
                $where["isActive"] = 1;
                $where["IsRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const ai = await AI.findAll({
                    include: [
                        {
                            model: PregnancyCheckup,
                            required: true,
                            where: {
                                TimeNo: {
                                    [Op.eq]: sequelize.literal(`(
                              SELECT MAX("PregnancyCheckup"."TimeNo")
                              FROM "PregnancyCheckup"
                              WHERE "PregnancyCheckup"."AIID" = "AI"."AIID"
                            )`),
                                },
                            },
                        },
                        {
                            model: Animal,
                            as: "Animal",
                            required: true,
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                isRemove: 0,
                                // AnimalStatusID: {
                                //     [Op.in]: [5, 10, 15],
                                // },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    required: true,
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: Semen,
                            as: "Semen",
                        },
                        {
                            model: Staff,
                            required: true,
                        },
                    ],
                    ...query,
                });

                let ai_success = [];

                // get  AI ที่มีผลตรวจทุดท้ายว่าท้อง

                // for (let index = 0; index < ai.length; index++) {
                //     if(ai[index].PregnancyCheckups[0].PregnancyCheckStatusID == 1){
                //         ai_success.push({...ai[index]})
                //     }
                // }
                ai_success = ai.filter((x) => {
                    return x.PregnancyCheckups[0].PregnancyCheckStatusID == 1;
                });

                const ai_success_length = ai_success.length;

                let animal_id_arr = [];
                let animal_more = [];
                let animal_less_more = [];
                let toal_rate = 0;
                let sum_rate = 0;

                for (let i = 0; i < ai_success_length; i++) {
                    if (ai_success[i].AnimalID != null) {
                        animal_id_arr.push(ai_success[i].AnimalID);

                        toal_rate = toal_rate + ai_success[i].TimeNo;

                        if (ai_success[i].TimeNo > 1) {
                            animal_more.push(ai_success[i]);
                        } else {
                            animal_less_more.push(ai_success[i]);
                        }
                    }
                }

                sum_rate = toal_rate / ai_success_length;

                // ai_success.forEach((x) => {
                //     delete x.PregnancyCheckups;
                //     delete x.Animal;
                // });

                // const ai_success1 = ai_success.map((instance) => instance.toJSON());
                // console.log(ai_success1.toJSON());
                // console.log(ai_success);

                const AnimalID = ai_success.map((instance) => {
                    return {
                        AIID: instance.AnimalID,
                        AnimalID: instance.Animal.AnimalName,
                        AnimalSecretStatus: instance.Animal.AnimalSecretStatus,
                        FarmIdentificationNumber:
                            instance.Animal.AnimalFarm.FarmIdentificationNumber,
                        FarmName: instance.Animal.AnimalFarm.FarmName,
                        // FarmAddress: instance.Animal.AnimalFarm?.FarmAddress,
                        // FarmProvince: instance.Animal.AnimalFarm?.Province?.ProvinceName,
                        // FarmAmphur: instance.Animal.AnimalFarm?.Amphur?.AmphurName,
                        // FarmTumbol: instance.Animal.AnimalFarm?.Tumbol?.TumbolName,
                        AnimalEarID: instance.Animal.AnimalEarID,
                        AnimalName: instance.Animal.AnimalName,
                        AnimalStatusName:
                            instance.Animal.AnimalStatus?.AnimalStatusName,
                        AnimalPar: instance.PAR,
                        SemenNumber: instance.Semen?.SemenNumber,
                        TimeNo: instance.TimeNo,
                        ThaiAIDate: instance.AIDate
                            ? dayjs(instance.AIDate)
                                  .locale("th")
                                  .format("DD MMM BB")
                            : "",
                        AIDate: instance.AIDate,
                        ResponsibilityStaffName:
                            instance.Staff?.StaffGivenName +
                            " " +
                            instance.Staff?.StaffSurname,
                        result_day1: instance.TimeNo,
                    };
                });

                animal_more = AnimalID.filter((x) => {
                    return x.TimeNo >= 2; //sum_result_day1;
                });

                animal_less_more = AnimalID.filter((x) => {
                    return x.TimeNo < 2; //sum_result_day1;
                });

                resolve({
                    data: [
                        {
                            title: "จำนวนครั้งที่ผสมต่อการผสมติด (ครั้ง)",
                            AnimalID: AnimalID,
                            all: animal_more.length + animal_less_more.length,
                            median: "2",
                            avg: parseFloat(sum_rate).toFixed(2),
                            animal_more: animal_more,
                            animal_less_more: animal_less_more,
                            animal_more_count: animal_more.length,
                            animal_less_more_count: animal_less_more.length,
                        },
                    ],
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report28(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                    $where["GiveBirthDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                // $where["GiveBirthDate"] = {
                //     [Op.between]: [
                //         dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                //         dayjs().format("YYYY-MM-DD"),
                //     ],
                // };
                $where["isRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const gbm = await GiveBirth.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                AnimalStatusID: {
                                    [Op.in]: [5, 10, 15],
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: AI,
                            as: "AI",
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                },
                            ],
                        },
                        {
                            model: Staff,
                        },
                    ],
                });

                let gbm_arr = [];

                for (let i = 0; i < gbm.length; i++) {
                    gbm[i].GiveBirth = null;
                    if (gbm[i].PAR > 0) {
                        let gb = await GiveBirth.findOne({
                            where: {
                                AnimalID: gbm[i].AnimalID,
                                Par: gbm[i].PAR - 1,
                            },
                            raw: true,
                        });

                        if (gb) {
                            let check = gbm_arr.findIndex((j) => {
                                return (
                                    j != undefined &&
                                    j.AnimalID == gbm[i].Animal.AnimalID
                                );
                            });

                            if (check == -1) {
                                gbm[i].day = dayjs(gbm[i].GiveBirthDate).diff(
                                    dayjs(gb.GiveBirthDate),
                                    "day"
                                );

                                gbm_arr[i] = {
                                    day: gbm[i].day,
                                    result_day1: gbm[i].day,
                                    AIID: gbm[i].AI?.AIID,
                                    AnimalID: gbm[i].AnimalID,
                                    AnimalSecretStatus:
                                        gbm[i].Animal.AnimalSecretStatus,
                                    FarmIdentificationNumber:
                                        gbm[i].Animal.AnimalFarm
                                            .FarmIdentificationNumber,
                                    FarmName: gbm[i].Animal.AnimalFarm.FarmName,
                                    FarmAddress:
                                        gbm[i].Animal.AnimalFarm?.FarmAddress,
                                    FarmProvince:
                                        gbm[i].Animal.AnimalFarm?.Province
                                            ?.ProvinceName,
                                    FarmAmphur:
                                        gbm[i].Animal.AnimalFarm?.Amphur
                                            ?.AmphurName,
                                    FarmTumbol:
                                        gbm[i].Animal.AnimalFarm?.Tumbol
                                            ?.TumbolName,
                                    AnimalEarID: gbm[i].Animal.AnimalEarID,
                                    AnimalName: gbm[i].Animal.AnimalName,
                                    AnimalStatusName:
                                        gbm[i].Animal.AnimalStatus
                                            ?.AnimalStatusName,
                                    AnimalPar: gbm[i].PAR,
                                    SemenNumber: "",
                                    TimeNo: gbm[i].TimeNo,
                                    GiveBirthDate: gbm[i].GiveBirthDate
                                        ? dayjs(gbm[i].GiveBirthDate)
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "",
                                    AIDate: "",
                                    ResponsibilityStaffName:
                                        gbm[i].Staff?.StaffGivenName +
                                        " " +
                                        gbm[i].Staff?.StaffSurname,
                                    AIDate: gbm[i].AI.AIDate,
                                    ThaiAIDate: gbm[i].AI.AIDate
                                        ? dayjs(gbm[i].AI.AIDate)
                                              .locale("th")
                                              .format("DD MMM BB")
                                        : "",
                                    SemenNumber: gbm[i].AI.Semen?.SemenNumber,
                                };
                            }
                        }
                    }
                }

                let filter_gbm = gbm_arr.filter((x) => {
                    return true;
                });

                let sum_result_day1 = 0;
                let animal_more = [];
                let animal_less_more = [];

                filter_gbm.forEach((x) => {
                    sum_result_day1 = x.day + sum_result_day1;
                });
                sum_result_day1 = sum_result_day1 / filter_gbm.length;

                animal_more = filter_gbm.filter((x) => {
                    return x.day >= 365;
                });

                animal_less_more = filter_gbm.filter((x) => {
                    return x.day < 365;
                });

                animal_all = animal_more.length + animal_less_more.length;

                resolve({
                    data: [
                        {
                            title: "ช่วงห่างการคลอดลูก (วัน)",
                            AnimalID: filter_gbm,
                            all: animal_all,
                            median: "365-385", //animal_median,
                            avg: parseFloat(sum_result_day1).toFixed(2),
                            animal_more: animal_more,
                            animal_less_more: animal_less_more,
                            animal_more_count: animal_more.length,
                            animal_less_more_count: animal_less_more.length,
                        },
                    ],
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
    report29(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                    $where["GiveBirthDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                // $where["GiveBirthDate"] = {
                //     [Op.between]: [
                //         dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                //         dayjs().format("YYYY-MM-DD"),
                //     ],
                // };
                $where["isRemove"] = 0;
                $where["PAR"] = 1;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const gbm = await GiveBirth.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                AnimalStatusID: {
                                    [Op.in]: [5, 10, 15],
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: AI,
                            as: "AI",
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                },
                            ],
                        },
                        {
                            model: Staff,
                        },
                    ],
                });

                let gbm_arr = [];

                for (let i = 0; i < gbm.length; i++) {
                    let month = dayjs(gbm[i].Animal.GiveBirthDate).diff(
                        dayjs(gbm[i].Animal.AnimalBirthDate),
                        "month"
                    );

                    gbm_arr[i] = {
                        day: month,
                        result_day1: month,
                        AIID: gbm[i].AI?.AIID,
                        AnimalID: gbm[i].AnimalID,
                        AnimalSecretStatus: gbm[i].Animal.AnimalSecretStatus,
                        FarmIdentificationNumber:
                            gbm[i].Animal.AnimalFarm.FarmIdentificationNumber,
                        FarmName: gbm[i].Animal.AnimalFarm.FarmName,
                        FarmAddress: gbm[i].Animal.AnimalFarm?.FarmAddress,
                        FarmProvince:
                            gbm[i].Animal.AnimalFarm?.Province?.ProvinceName,
                        FarmAmphur:
                            gbm[i].Animal.AnimalFarm?.Amphur?.AmphurName,
                        FarmTumbol:
                            gbm[i].Animal.AnimalFarm?.Tumbol?.TumbolName,
                        AnimalEarID: gbm[i].Animal.AnimalEarID,
                        AnimalName: gbm[i].Animal.AnimalName,
                        AnimalStatusName:
                            gbm[i].Animal.AnimalStatus?.AnimalStatusName,
                        AnimalPar: gbm[i].PAR,
                        SemenNumber: "",
                        TimeNo: gbm[i].TimeNo,
                        GiveBirthDate: gbm[i].GiveBirthDate
                            ? dayjs(gbm[i].GiveBirthDate)
                                  .locale("th")
                                  .format("DD MMM BB")
                            : "",
                        AIDate: "",
                        ResponsibilityStaffName:
                            gbm[i].Staff?.StaffGivenName +
                            " " +
                            gbm[i].Staff?.StaffSurname,
                        AIDate: gbm[i].AI?.AIDate,
                        ThaiAIDate: gbm[i].AI?.AIDate
                            ? dayjs(gbm[i].AI?.AIDate)
                                  .locale("th")
                                  .format("DD MMM BB")
                            : "",
                        SemenNumber: gbm[i].AI?.Semen?.SemenNumber,
                    };
                }

                let filter_gbm = gbm_arr.filter((x) => {
                    return true;
                });

                let sum_result_day1 = 0;
                let animal_more = [];
                let animal_less_more = [];

                filter_gbm.forEach((x) => {
                    sum_result_day1 = x.day + sum_result_day1;
                });
                sum_result_day1 = sum_result_day1 / filter_gbm.length;

                animal_more = filter_gbm.filter((x) => {
                    return x.day >= 24;
                });

                animal_less_more = filter_gbm.filter((x) => {
                    return x.day < 24;
                });

                animal_all = animal_more.length + animal_less_more.length;

                resolve({
                    data: [
                        {
                            title: "อายุเมื่อคลอดลูกตัวแรก (เดือน)",
                            AnimalID: filter_gbm,
                            all: animal_all,
                            median: "24-36 เดือน", //animal_median,
                            avg: parseFloat(sum_result_day1).toFixed(2),
                            animal_more: animal_more,
                            animal_less_more: animal_less_more,
                            animal_more_count: animal_more.length,
                            animal_less_more_count: animal_less_more.length,
                        },
                    ],
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report291(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let $where = {};
                let $whereAnimal = {};
                let $whereFarm = {};
                $whereFarm["isRemove"] = 0;

                if (req.query.OrganizationID) {
                    $whereFarm["OrganizationID"] = req.query.OrganizationID;
                }

                $whereAnimal["AnimalTypeID"] = {
                    [Op.in]: [1, 2, 41, 42],
                };

                let WhereProject = null;

                if (req.query.Projects) {
                    if (req.query.Projects != "[]") {
                        WhereProject = {
                            ProjectID: {
                                [Op.in]: JSON.parse(req.query.Projects),
                            },
                        };
                    }
                }

                let provinceIDArr = [];

                if (!req.query.ProvinceID) {
                    if (req.query.OrganizationZoneID) {
                        const province = await Province.findAll({
                            where: {
                                OrganizationZoneID:
                                    req.query.OrganizationZoneID,
                            },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }

                    if (req.query.AIZoneID) {
                        provinceIDArr = [];
                        const province = await Province.findAll({
                            where: { AIZoneID: req.query.AIZoneID },
                        });

                        province.forEach((p) => {
                            provinceIDArr.push(p.ProvinceID);
                        });
                    }
                }

                if (req.query.TumbolID) {
                    $whereFarm["FarmTumbolID"] = req.query.TumbolID;
                }

                if (req.query.AmphurID) {
                    $whereFarm["FarmAmphurID"] = req.query.AmphurID;
                }

                if (req.query.ProvinceID) {
                    provinceIDArr = [req.query.ProvinceID];
                }

                if (provinceIDArr.length != 0) {
                    $whereFarm["FarmProvinceID"] = { [Op.in]: provinceIDArr };
                }

                if (req.query.StaffID) {
                    $where["ResponsibilityStaffID"] = req.query.StaffID;
                }

                if (req.query.StartDate_Created) {
                }

                if (req.query.StartDate) {
                    $where["CheckupDate"] = {
                        [Op.between]: [
                            dayjs(req.query.StartDate).format("YYYY-MM-DD"),
                            dayjs(req.query.EndDate).format("YYYY-MM-DD"),
                        ],
                    };
                }

                $where["GiveBirthDate"] = {
                    [Op.between]: [
                        dayjs().subtract(1, "year").format("YYYY-MM-DD"),
                        dayjs().format("YYYY-MM-DD"),
                    ],
                };
                $where["isRemove"] = 0;

                const query =
                    Object.keys($where).length > 0 ? { where: $where } : {};

                const queryFarm =
                    Object.keys($whereFarm).length > 0
                        ? { where: $whereFarm }
                        : {};

                const gbm = await GiveBirth.findAll({
                    ...query,
                    include: [
                        {
                            model: Animal,
                            as: "Animal",
                            where: {
                                AnimalTypeID: {
                                    [Op.in]: JSON.parse(req.query.AnimalTypeID),
                                },
                                AnimalStatusID: {
                                    [Op.in]: [5, 10, 15],
                                },
                            },
                            include: [
                                {
                                    model: Farm,
                                    as: "AnimalFarm",
                                    ...queryFarm,
                                    include: [
                                        {
                                            model: Project,
                                            where: WhereProject,
                                        },
                                        {
                                            model: Province,
                                            as: "Province",
                                        },
                                        {
                                            model: Amphur,
                                            as: "Amphur",
                                        },
                                        {
                                            model: Tumbol,
                                            as: "Tumbol",
                                        },
                                    ],
                                    //   ...queryFarm,
                                },
                                { model: AnimalStatus, as: "AnimalStatus" },
                            ],
                        },
                        {
                            model: AI,
                            as: "AI",
                            include: [
                                {
                                    model: Semen,
                                    as: "Semen",
                                },
                            ],
                        },
                        {
                            model: Staff,
                        },
                    ],
                });

                let gbm_arr = [];

                for (let i = 0; i < gbm.length; i++) {
                    let month = dayjs(gbm[i].Animal.GiveBirthDate).diff(
                        dayjs(gbm[i].Animal.AnimalBirthDate),
                        "month"
                    );

                    console.log(gbm[i].AI.AIID);

                    gbm_arr[i] = {
                        month: month,
                        AIID: gbm[i].AI?.AIID,
                        AnimalID: gbm[i].AnimalID,
                        AnimalSecretStatus: gbm[i].Animal.AnimalSecretStatus,
                        FarmIdentificationNumber:
                            gbm[i].Animal.AnimalFarm.FarmIdentificationNumber,
                        FarmName: gbm[i].Animal.AnimalFarm.FarmName,
                        FarmAddress: gbm[i].Animal.AnimalFarm?.FarmAddress,
                        FarmProvince:
                            gbm[i].Animal.AnimalFarm?.Province?.ProvinceName,
                        FarmAmphur:
                            gbm[i].Animal.AnimalFarm?.Amphur?.AmphurName,
                        FarmTumbol:
                            gbm[i].Animal.AnimalFarm?.Tumbol?.TumbolName,
                        AnimalEarID: gbm[i].Animal.AnimalEarID,
                        AnimalName: gbm[i].Animal.AnimalName,
                        AnimalStatusName:
                            gbm[i].Animal.AnimalStatus?.AnimalStatusName,
                        AnimalPar: gbm[i].PAR,
                        SemenNumber: "",
                        TimeNo: gbm[i].TimeNo,
                        GiveBirthDate: gbm[i].GiveBirthDate
                            ? dayjs(gbm[i].GiveBirthDate)
                                  .locale("th")
                                  .format("DD MMM BB")
                            : "",
                        AIDate: "",
                        ResponsibilityStaffName:
                            gbm[i].Staff?.StaffGivenName +
                            " " +
                            gbm[i].Staff?.StaffSurname,
                    };
                }

                let filter_gbm = gbm_arr.filter((x) => {
                    return true;
                });

                let sum_result_day1 = 0;
                let animal_more = [];
                let animal_less_more = [];

                filter_gbm.forEach((x) => {
                    sum_result_day1 = x.month + sum_result_day1;
                });
                sum_result_day1 = sum_result_day1 / filter_gbm.length;

                animal_more = filter_gbm.filter((x) => {
                    return x.month >= 24;
                });

                animal_less_more = filter_gbm.filter((x) => {
                    return x.month < 24;
                });

                animal_all = animal_more.length + animal_less_more.length;

                resolve({
                    data: [
                        {
                            title: "อายุเมื่อคลอดลูกตัวแรก (เดือน)",
                            AnimalID: filter_gbm,
                            all: animal_all,
                            median: "24-36 เดือน", //animal_median,
                            avg: parseFloat(sum_result_day1).toFixed(2),
                            animal_more: animal_more,
                            animal_less_more: animal_less_more,
                            animal_more_count: animal_more.length,
                            animal_less_more_count: animal_less_more.length,
                        },
                    ],
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    GenerateNumber(FarmID, BirthDate, AnimalTypeID) {
        return new Promise(async (resolve, reject) => {
            try {
                let farm = await Farm.findByPk(FarmID, {
                    include: { all: true, required: false },
                });

                let AnimalEarGenerate = "";
                let AnimalNationalID = "";

                if (farm) {
                    let year = String(new Date().getFullYear()).slice(2);

                    let ProvinceAndAmphur = farm.Amphur.AmphurCode.slice(0, 4);

                    let AnimalTypeCode = await AnimalType.findByPk(
                        AnimalTypeID
                    );
                    AnimalTypeCode = AnimalTypeCode.AnimalTypeCode.slice(1);

                    // Running Number
                    let prefixID = year + ProvinceAndAmphur + AnimalTypeCode;

                    // Running Number
                    let animal = await Animal.max("AnimalEarID", {
                        where: {
                            AnimalEarID: {
                                [Op.startsWith]: prefixID,
                            },
                        },
                    });

                    if (animal) {
                        let codeLastest = animal.substr(-6);
                        codeLastest = parseInt(codeLastest) + 1;
                        let number = 6 - parseInt(String(codeLastest).length);

                        if (number != 0) {
                            codeLastest = String(codeLastest);
                            for (let i = 1; i <= number; i++) {
                                codeLastest = "0" + codeLastest;
                            }
                        }
                        AnimalEarGenerate = prefixID + codeLastest;
                    } else {
                        AnimalEarGenerate = prefixID + "000001";
                    }

                    //
                    // year
                    // ProvinceAndAmphur

                    // N,M
                    let type1 = "N";

                    // C,D,B,G animalType
                    let type2 = null;
                    if (AnimalTypeID == 1) {
                        type2 = "C";
                    } else if (AnimalTypeID == 3 || AnimalTypeID == 4) {
                        type2 = "B";
                    } else if (AnimalTypeID == 17 || AnimalTypeID == 18) {
                        type2 = "G";
                    } else {
                        type2 = "C";
                    }

                    let prefixID2 = year + ProvinceAndAmphur + type1 + type2;

                    let animal2 = await Animal.max("AnimalNationalID", {
                        where: {
                            AnimalNationalID: {
                                [Op.startsWith]: prefixID2,
                            },
                        },
                    });

                    if (animal2) {
                        let codeLastest = animal.substr(-5);
                        codeLastest = parseInt(codeLastest) + 1;
                        let number = 5 - parseInt(String(codeLastest).length);

                        if (number != 0) {
                            codeLastest = String(codeLastest);
                            for (let i = 1; i <= number; i++) {
                                codeLastest = "0" + codeLastest;
                            }
                        }

                        AnimalNationalID = prefixID2 + codeLastest;
                    } else {
                        AnimalNationalID = prefixID2 + "00001";
                    }
                } else {
                    reject(ErrorNotFound("Farm ID: not found"));
                }

                resolve({
                    AnimalNumberGenerate: AnimalEarGenerate,
                    AnimalEarGenerate: AnimalEarGenerate,
                    AnimalNationalID: AnimalNationalID,
                });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report99(req) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get All animal
                let animal = await Animal.findAll({
                    where: { AnimalIdentificationID: null },
                });

                for (let index = 0; index < animal.length; index++) {
                    const el = animal[index];

                    // let number = this.GenerateNumber(
                    //   el.FarmID,
                    //   el.BirthDate,
                    //   el.AnimalTypeID
                    // );
                    //

                    // Generate 15 หลัก
                    let AnimalIdentificationID = null;
                    let farm1 = await Farm.findByPk(el.FarmID);

                    let year1 = null;
                    if (el.AnimalDateJoin) {
                        year1 = dayjs(el.AnimalDateJoin).format("YY");
                    } else {
                        year1 = dayjs().format("YY");
                    }

                    let ProvinceAndAmphur1 = farm1.FarmAmphurID;

                    let AnimalTypeCode1 = await AnimalType.findByPk(
                        el.AnimalTypeID
                    );
                    AnimalTypeCode1 = AnimalTypeCode1.AnimalTypeCode.slice(1);

                    let prefixID1 =
                        String(year1) +
                        String(ProvinceAndAmphur1) +
                        String(AnimalTypeCode1);

                    let animal1 = await Animal.max("AnimalIdentificationID", {
                        where: {
                            AnimalIdentificationID: {
                                [Op.startsWith]: prefixID1,
                            },
                        },
                    });

                    if (animal1) {
                        let codeLastest1 = animal1.substr(-6);
                        codeLastest1 = parseInt(codeLastest1) + 1;
                        var number1 = 6 - parseInt(String(codeLastest1).length);

                        if (number1 != 0) {
                            codeLastest1 = String(codeLastest1);
                            for (let i = 1; i <= number1; i++) {
                                codeLastest1 = "0" + codeLastest1;
                            }
                        }

                        AnimalIdentificationID =
                            String(prefixID1) + String(codeLastest1);
                    } else {
                        AnimalIdentificationID =
                            String(prefixID1) + String("000001");
                    }

                    //

                    // let AnimalNationalID = null;
                    // let farm = await Farm.findByPk(el.FarmID);

                    // let year = dayjs().format('YY');
                    // let ProvinceAndAmphur = farm.FarmAmphurID;

                    // let AnimalTypeCode = await AnimalType.findByPk(el.AnimalTypeID);
                    // AnimalTypeCode = AnimalTypeCode.AnimalTypeCode.slice(1);

                    // // Running Number

                    // let type1 = "N";
                    // // C,D,B,G animalType
                    // let type2 = null;
                    // if (el.AnimalTypeID == 1) {
                    //   type2 = "C";
                    // } else if (el.AnimalTypeID == 3 || el.AnimalTypeID == 4) {
                    //   type2 = "B";
                    // } else if (el.AnimalTypeID == 17 || el.AnimalTypeID == 18) {
                    //   type2 = "G";
                    // } else {
                    //   type2 = "C";
                    // }

                    // let prefixID2 = String(year) + String(ProvinceAndAmphur) + type1 + type2;

                    // let animal2 = await Animal.max("AnimalNationalID", {
                    //   where: {
                    //     AnimalNationalID: {
                    //       [Op.startsWith]: prefixID2,
                    //     },
                    //   },
                    // });

                    // if (animal2) {
                    //   let codeLastest = animal2.substr(-5);
                    //   codeLastest = parseInt(codeLastest) + 1;
                    //   var number = 5 - parseInt(String(codeLastest).length);

                    //   if (number != 0) {
                    //     codeLastest = String(codeLastest);
                    //     for (let i = 1; i <= number; i++) {
                    //       codeLastest = "0" + codeLastest;
                    //     }
                    //   }

                    //   AnimalNationalID = prefixID2 + codeLastest;
                    // } else {
                    //   AnimalNationalID = prefixID2 + "00001";
                    // }

                    //

                    // el.AnimalNationalID = AnimalNationalID;
                    el.AnimalIdentificationID = AnimalIdentificationID;
                    await el.save();
                }

                // For Animal
                // Generate New Number
                // Save New Number

                resolve({ Animal: animal });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    report101(req) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get All animal
                let animal = await Animal.findAll({
                    where: {
                        isRemove: 0,
                        AnimalTypeID: {
                            [Op.in]: [17, 18, 45, 46],
                        },
                    },
                });

                // Distict Farm ซ้ำ
                let farmArr = [];
                animal.forEach((x) => {
                    if (farmArr.includes(x.FarmID) == false) {
                        farmArr.push(x.FarmID);
                    }
                });

                console.log(farmArr);

                for (let index = 0; index < farmArr.length; index++) {
                    let farm = await Farm.findOne({
                        where: { FarmID: farmArr[index] },
                    });

                    if (
                        farm.FarmAnimalType == null ||
                        farm.FarmAnimalType.includes("3") == false
                    ) {
                        let farmAnimalType = [3];
                        if (farm.farmAnimalType != null) {
                            farmAnimalType = JSON.parse(farm.FarmAnimalType);
                            farmAnimalType.push(3);
                        }
                        farm.FarmAnimalType = JSON.stringify(farmAnimalType);
                        await farm.save();
                    }
                }

                resolve({ farmAll: farmArr });
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },
};

// repot99(req){
//       return new Promise(async (resolve, reject) => {
//       try {

//         let staff = Staff.findAll({where: {CreatedDatetime: {[Op.like]: '%2023-10%'}}})

//         resolve({message: 'success'});
//       } catch (error) {
//         reject(ErrorNotFound(error));
//       }
//     });
//   },
// }

module.exports = { ...methods };
