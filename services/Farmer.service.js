const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models/Farmer"),
    { Op, fn } = require("sequelize");
var FormData = require("form-data");

const Farmer = require("../models/Farmer");
const Province = require("../models/Province");
const Amphur = require("../models/Amphur");
const Tumbol = require("../models/Tumbol");

const fs = require("fs");
const axios = require("axios").default;
const https = require("https");
const starCert = fs.readFileSync("cert/star_dld_go_th.crt");
const caCert = fs.readFileSync("cert/DigiCertCA.crt");
const agent = new https.Agent({
    ca: [starCert, caCert], // ใช้ CA หลายไฟล์
    rejectUnauthorized: false, // เปิดการตรวจสอบ SSL Certificate
});

const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.FarmerID) $where["FarmerID"] = req.query.FarmerID;

        if (req.query.IdentificationNumber)
            $where["IdentificationNumber"] = req.query.IdentificationNumber;

        if (req.query.FarmerNumber)
            $where["FarmerNumber"] = {
                [Op.like]: "%" + req.query.FarmerNumber + "%",
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
        if (req.query.EducationID)
            $where["EducationID"] = req.query.EducationID;

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
                    .then(async (result) => {
                        let rows = result[0],
                            count = result[2];

                        if (req.query.IdentificationNumber) {
                            let farmerPID = req.query.IdentificationNumber;

                            if (rows.length == 0) {
                                let fetchAPIFarmer = await this.fetchAPIFarmer(
                                    farmerPID
                                );

                                if (fetchAPIFarmer) {
                                    rows = fetchAPIFarmer;
                                    count = 1;
                                } else {
                                    reject(
                                        ErrorNotFound(
                                            "IdentificationNumber Not Found"
                                        )
                                    );
                                }
                            }
                        }

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
                data.createdAt = fn("GETDATE");

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

                data.updatedAt = fn("GETDATE");

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
                    { isRemove: 1, isActive: 0, updatedAt: fn("GETDATE") },
                    { where: { FarmerID: id } }
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    async getToken() {
        var bodyFormData = new FormData();
        bodyFormData.append("username", "biotech");
        bodyFormData.append("password", "!Q@WeRegist");
        bodyFormData.append("grant_type", "password");

        let data = await axios.post(
            "https://service-eregist.dld.go.th/regislives_authen/oauth/token",
            bodyFormData,
            {
                httpsAgent: agent,
                auth: {
                    username: "zealtech",
                    password: "zeal1tech",
                },
            }
        );
        return data;
    },

    fetchAPIFarmer(farmerPID) {
        return new Promise(async (resolve, reject) => {
            try {
                let token = await this.getToken();
                let tokenAccess = token.data.access_token;

                let data1 = await axios.post(
                    "https://service-eregist.dld.go.th/regislives-openapi/api/v1/searchFarm/page/0/limit/10/asc/true/sortBy/1",
                    {
                        farmerPID: farmerPID,
                    },
                    {
                        httpsAgent: agent,
                        headers: { Authorization: `Bearer ${tokenAccess}` },
                    }
                );

                if (data1.data.code == "200") {
                    if (data1.data.result.length != 0) {
                        let dataFarmer =
                            data1.data.result[data1.data.result.length - 1];

                        let province = Province.findOne({
                            where: {
                                ProvinceCode:
                                    dataFarmer.farmerProvinceId.toString(),
                            },
                        });
                        let amphur = Amphur.findOne({
                            where: {
                                AmphurCode:
                                    dataFarmer.farmerAmphurId.toString(),
                            },
                        });
                        let tumbol = Tumbol.findOne({
                            where: {
                                TumbolCode:
                                    dataFarmer.farmerTambolId.toString(),
                            },
                        });

                        console.log(dataFarmer);
                        let data = {
                            //   FarmerNumber: dataFarmer.farmerId,
                            FarmerNumber: dataFarmer.farmCode,
                            IdentificationNumber: dataFarmer.pid,
                            GivenName: dataFarmer.firstName,
                            Surname: dataFarmer.lastName,
                            FarmerTypeID:
                                dataFarmer.farmerTypeName == "เกษตรกรทั่วไป"
                                    ? 1
                                    : dataFarmer.farmerTypeName == "นิติบุคคล"
                                    ? 2
                                    : dataFarmer.farmerTypeName == "หน่วยงาน"
                                    ? 3
                                    : null,
                            HouseBuildingNumber: dataFarmer.farmerHomeNo,
                            HouseProvinceID: province
                                ? province.ProvinceID
                                : null,
                            HouseAmphurID: amphur ? amphur.AmphurID : null,
                            HouseTumbolID: tumbol ? tumbol.TumbolID : null,
                            HouseZipCode: tumbol ? tumbol.Zipcode : null,
                            HouseVillageName: dataFarmer.farmerVillageName,
                            CreatedUserID: 1,
                            FarmerRegisterStatus: 2,
                        };

                        data.createdAt = fn("GETDATE");

                        const obj = new db(data);
                        const inserted = await obj.save();
                        let res = await methods.findById(inserted.FarmerID);
                        //
                        console.log(data1.data);
                        resolve({
                            res: res,
                            dataFromAPI: data1.data.result,
                            farmer: dataFarmer,
                        });
                    } else {
                        reject(ErrorNotFound("IdentificationNumber Not Found"));
                    }
                } else {
                    reject(ErrorNotFound("API Error"));
                }

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    fetchAPIFarmerUpdate() {
        return new Promise(async (resolve, reject) => {
            try {
                let token = await this.getToken();
                let tokenAccess = token.data.access_token;

                let data1 = await axios.post(
                    "https://service-eregist.dld.go.th/regislives-openapi/api/v1/searchFarm/page/0/limit/10/asc/true/sortBy/1",
                    {
                        farmerTypeId: farmerTypeId,
                    },
                    {
                        httpsAgent: agent,
                        headers: { Authorization: `Bearer ${tokenAccess}` },
                    }
                );

                if (data1.data.code == "200") {
                    if (data1.data.result.length != 0) {
                        let i = 0;

                        for (let i = 0; i < data1.data.result.length; i++) {
                            let dataFarmer = data1.data.result[i];

                            let farmer = Farmer.findOne({
                                where: { IdentificationNumber: dataFarmer.pid },
                            });

                            let province = Province.findOne({
                                where: {
                                    ProvinceCode:
                                        dataFarmer.farmerProvinceId.toString(),
                                },
                            });
                            let amphur = Amphur.findOne({
                                where: {
                                    AmphurCode:
                                        dataFarmer.farmerAmphurId.toString(),
                                },
                            });
                            let tumbol = Tumbol.findOne({
                                where: {
                                    TumbolCode:
                                        dataFarmer.farmerTambolId.toString(),
                                },
                            });

                            let data = {
                                // FarmerNumber: dataFarmer.farmerId,
                                FarmerNumber: dataFarmer.farmCode,
                                IdentificationNumber: dataFarmer.pid,
                                GivenName: dataFarmer.firstName,
                                Surname: dataFarmer.lastName,
                                FarmerTypeID:
                                    dataFarmer.farmerTypeName == "เกษตรกรทั่วไป"
                                        ? 1
                                        : dataFarmer.farmerTypeName ==
                                          "นิติบุคคล"
                                        ? 2
                                        : dataFarmer.farmerTypeName ==
                                          "หน่วยงาน"
                                        ? 3
                                        : null,
                                HouseBuildingNumber: dataFarmer.farmerHomeNo,
                                HouseProvinceID: province
                                    ? province.ProvinceID
                                    : null,
                                HouseAmphurID: amphur ? amphur.AmphurID : null,
                                HouseTumbolID: tumbol ? tumbol.TumbolID : null,
                                HouseZipCode: tumbol ? tumbol.Zipcode : null,
                                HouseVillageName: dataFarmer.farmerVillageName,
                                CreatedUserID: 1,
                                FarmerRegisterStatus: 2,
                            };

                            if (farmer) {
                                data.updatedAt = fn("GETDATE");
                                await Farmer.update(data, {
                                    where: { FarmerID: farmer.FarmerID },
                                });
                            } else {
                                data.createdAt = fn("GETDATE");

                                const obj = new db(data);
                                const inserted = await obj.save();
                            }
                        }

                        resolve({ status: "success" });
                    } else {
                        reject(ErrorNotFound("IdentificationNumber Not Found"));
                    }
                } else {
                    reject(ErrorNotFound("API Error"));
                }

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    fetchAPIFarmer1(farmerPID) {
        return new Promise(async (resolve, reject) => {
            try {
                let token = await this.getToken();
                let tokenAccess = token.data.access_token;

                let data1 = await axios.post(
                    "https://service-eregist.dld.go.th/regislives-openapi/api/v1/searchFarm/page/0/limit/10/asc/true/sortBy/1",
                    {
                        farmerPID: farmerPID,
                    },
                    {
                        httpsAgent: agent,
                        headers: { Authorization: `Bearer ${tokenAccess}` },
                    }
                );

                if (data1.data.code == "200") {
                    if (data1.data.result.length != 0) {
                        let dataFarmer =
                            data1.data.result[data1.data.result.length - 1];

                        let province = Province.findOne({
                            where: {
                                ProvinceCode:
                                    dataFarmer.farmerProvinceId.toString(),
                            },
                        });
                        let amphur = Amphur.findOne({
                            where: {
                                AmphurCode:
                                    dataFarmer.farmerAmphurId.toString(),
                            },
                        });
                        let tumbol = Tumbol.findOne({
                            where: {
                                TumbolCode:
                                    dataFarmer.farmerTambolId.toString(),
                            },
                        });

                        let data = {
                            FarmerNumber: dataFarmer.farmerId,
                            IdentificationNumber: dataFarmer.pid,
                            GivenName: dataFarmer.firstName,
                            Surname: dataFarmer.lastName,
                            FarmerTypeID:
                                dataFarmer.farmerTypeName == "เกษตรกรทั่วไป"
                                    ? 1
                                    : dataFarmer.farmerTypeName == "นิติบุคคล"
                                    ? 2
                                    : dataFarmer.farmerTypeName == "หน่วยงาน"
                                    ? 3
                                    : null,
                            HouseBuildingNumber: dataFarmer.farmerHomeNo,
                            HouseProvinceID: province
                                ? province.ProvinceID
                                : null,
                            HouseAmphurID: amphur ? amphur.AmphurID : null,
                            HouseTumbolID: tumbol ? tumbol.TumbolID : null,
                            HouseZipCode: tumbol ? tumbol.Zipcode : null,
                            HouseVillageName: dataFarmer.farmerVillageName,
                            CreatedUserID: 1,
                            FarmerRegisterStatus: 2,
                        };

                        data.createdAt = fn("GETDATE");

                        const farmer = await Farmer.findOne({
                            where: {
                                IdentificationNumber: data.IdentificationNumber,
                            },
                        });

                        let res = {};
                        if (farmer) {
                            res = await Farmer.update(
                                { ...data, IdentificationNumber: undefined },
                                {
                                    where: { FarmerID: farmer.FarmerID },
                                }
                            );
                        } else {
                            let obj = new db(data);
                            const inserted = await obj.save();
                            res = methods.findById(inserted.FarmerID);
                        }

                        resolve({
                            res: res,
                            dataFromAPI: data1,
                            status: "have",
                        });
                    } else {
                        resolve({
                            text: "IdentificationNumber Not Found",
                            status: "not_found",
                        });
                        // reject(ErrorNotFound("IdentificationNumber Not Found"));
                    }
                } else {
                    resolve({
                        text: "API Error",
                        status: "api_error",
                    });
                    //   reject(ErrorNotFound("API Error"));
                }

                resolve(res);
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    findBeforeAddFarm(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        const _q = methods.scopeSearch(req, limit, offset);
        return new Promise(async (resolve, reject) => {
            try {
                Promise.all([db.findAll(_q.query)])
                    .then(async (result) => {
                        let rows = result[0];

                        if (req.query.IdentificationNumber) {
                            let farmerPID = req.query.IdentificationNumber;
                            if (rows.length == 0) {
                                let fetchAPIFarmer = await this.fetchAPIFarmer(
                                    farmerPID
                                );
                                if (fetchAPIFarmer) {
                                    rows = fetchAPIFarmer;
                                    count = 1;
                                } else {
                                    reject(
                                        ErrorNotFound(
                                            "IdentificationNumber Not Found"
                                        )
                                    );
                                }
                            } else {
                                if (rows[0].FarmerRegisterStatus == 0) {
                                    let checkAPI = await this.fetchAPIFarmer1(
                                        req.query.IdentificationNumber
                                    );
                                    if (checkAPI.status == "have") {
                                        rows[0].FarmerRegisterStatus = 2;
                                    }
                                }
                            }
                        }

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
};

module.exports = { ...methods };
