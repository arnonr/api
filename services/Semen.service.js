const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models/Semen"),
    { Op, fn } = require("sequelize");

const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.SemenID) $where["SemenID"] = req.query.SemenID;

        $where["BreederID"] = {
            [Op.not]: null,
        };

        if (req.query.BreederIDWantNull) {
            $where["BreederID"] = undefined;
        }

        if (req.query.SemenNumber)
            $where["SemenNumber"] = {
                [Op.like]: "%" + req.query.SemenNumber + "%",
            };

        if (req.query.SemenCode)
            $where["SemenCode"] = {
                [Op.like]: "%" + req.query.SemenCode + "%",
            };

        if (req.query.BreederID)
            $where["BreederID"] = {
                [Op.like]: "%" + req.query.BreederID + "%",
            };

        // if (req.query.AnimalTypeID) $where["AnimalTypeID"] = req.query.AnimalTypeID;

        if (req.query.AnimalTypeID) {
            let animaltype = JSON.parse(req.query.AnimalTypeID);

            let test = animaltype.find((x) => {
                return x == 3 || x == 4;
            });

            if (test) {
                animaltype.push(42);
            }

            $where["AnimalTypeID"] = {
                [Op.in]: animaltype,
            };
        }

        if (req.query.SourceTypeID)
            $where["SourceTypeID"] = req.query.SourceTypeID;
        if (req.query.CountryID) $where["CountryID"] = req.query.CountryID;
        if (req.query.SourceOrganizationID)
            $where["SourceOrganizationID"] = req.query.SourceOrganizationID;
        if (req.query.SemenSexing)
            $where["SemenSexing"] = req.query.SemenSexing;

        if (req.query.ProduceDate)
            $where["ProduceDate"] = req.query.ProduceDate;

        if (req.query.SemenType) $where["SemenType"] = req.query.SemenType;

        if (req.query.ResponsibilityStaffID)
            $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

        if (req.query.isActive) $where["isActive"] = req.query.isActive;
        if (req.query.CreatedUserID)
            $where["CreatedUserID"] = req.query.CreatedUserID;
        if (req.query.UpdatedUserID)
            $where["UpdatedUserID"] = req.query.UpdatedUserID;

        $where["isRemove"] = 0;

        let AnimalBreedArr = [];

        if (req.query.AnimalBreedID1) {
            AnimalBreedArr.push(req.query.AnimalBreedID1);
        }

        if (req.query.AnimalBreedID2) {
            AnimalBreedArr.push(req.query.AnimalBreedID2);
        }

        if (req.query.AnimalBreedID3) {
            AnimalBreedArr.push(req.query.AnimalBreedID3);
        }

        if (req.query.AnimalBreedID4) {
            AnimalBreedArr.push(req.query.AnimalBreedID4);
        }

        if (req.query.AnimalBreedID5) {
            AnimalBreedArr.push(req.query.AnimalBreedID5);
        }

        $where[Op.and] = [];

        AnimalBreedArr.forEach((value) => {
            $where[Op.and].push({
                [Op.or]: {
                    AnimalBreedID1: value,
                    AnimalBreedID2: value,
                    AnimalBreedID3: value,
                    AnimalBreedID4: value,
                    AnimalBreedID5: value,
                },
            });
        });

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // Order
        $order = [["SemenID", "ASC"]];
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

        let $whereAnimal = {};
        if (req.query.AnimalName) {
            $whereAnimal["AnimalName"] = {
                [Op.like]: "%" + req.query.AnimalName + "%",
            };
        }

        if (req.query.AnimalEarID) {
            $whereAnimal["AnimalEarID"] = {
                [Op.like]: "%" + req.query.AnimalEarID + "%",
            };
        }

        let include = [
            {
                association: "Animal",
                required:
                    req.query.AnimalName || req.query.AnimalEarID
                        ? true
                        : false,
                where: $whereAnimal,
            },
            {
                association: "AnimalType",
                attributes: ["AnimalTypeID", "AnimalTypeName"],
                required: false,
            },
            {
                association: "AnimalBreed1",
                attributes: [
                    "AnimalBreedID",
                    "AnimalBreedCode",
                    "AnimalBreedShortName",
                    "AnimalBreedName",
                    "AnimalBreedNameEN",
                ],
                required: false,
            },
            {
                association: "AnimalBreed2",
                attributes: [
                    "AnimalBreedID",
                    "AnimalBreedCode",
                    "AnimalBreedShortName",
                    "AnimalBreedName",
                    "AnimalBreedNameEN",
                ],
                required: false,
            },
            {
                association: "AnimalBreed3",
                attributes: [
                    "AnimalBreedID",
                    "AnimalBreedCode",
                    "AnimalBreedShortName",
                    "AnimalBreedName",
                    "AnimalBreedNameEN",
                ],
                required: false,
            },
            {
                association: "AnimalBreed4",
                attributes: [
                    "AnimalBreedID",
                    "AnimalBreedCode",
                    "AnimalBreedShortName",
                    "AnimalBreedName",
                    "AnimalBreedNameEN",
                ],
                required: false,
            },
            {
                association: "AnimalBreed5",
                attributes: [
                    "AnimalBreedID",
                    "AnimalBreedCode",
                    "AnimalBreedShortName",
                    "AnimalBreedName",
                    "AnimalBreedNameEN",
                ],
                required: false,
            },

            {
                association: "SourceType",
                attributes: [
                    "SourceTypeID",
                    "SourceTypeCode",
                    "SourceTypeName",
                ],
                required: false,
            },

            {
                association: "Country",
                attributes: ["CountryID", "CountryCode", "CountryName"],
                required: false,
            },
            {
                association: "Organization",
                attributes: [
                    "OrganizationID",
                    "OrganizationCode",
                    "OrganizationName",
                ],
                required: false,
            },
            {
                association: "Staff",
                attributes: [
                    "StaffID",
                    "StaffNumber",
                    "StaffGivenName",
                    "StaffSurname",
                ],
                required: false,
            },
            // { all: true, required: false }
        ];

        if (req.query.includeAll) {
            if (req.query.includeAll == "false") {
                include = [];
            } else {
            }
        } else {
            // include.unshift({ all: true, required: false });
        }

        query["include"] = include;

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
                data.createdAt = fn("GETDATE");

                const obj = new db(data);
                const inserted = await obj.save();

                let res = methods.findById(inserted.SemenID);

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
                data.SemenID = parseInt(id);

                data.updatedAt = fn("GETDATE");

                await db.update(data, { where: { SemenID: id } });

                let res = methods.findById(data.SemenID);

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
                    { where: { SemenID: id } }
                );
                resolve();
            } catch (error) {
                reject(error);
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
                            let d = {
                                SemenID: data.SemenID,
                                SemenCode: data.SemenCode,
                                SemenNumber: data.SemenNumber,
                                BreederID: data.BreederID,
                                AnimalTypeID: data.AnimalTypeID,
                            };

                            return d;
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
};

module.exports = { ...methods };
