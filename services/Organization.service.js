const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models/Organization"),
    Province = require("../models/Province"),
    { Op, fn } = require("sequelize");

const Sequelize = require("sequelize"),
    { sequelize } = require("../configs/databases");

const methods = {
    async scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.OrganizationID)
            $where["OrganizationID"] = req.query.OrganizationID;

        if (req.query.ParentOrganizationID) {
            // $where["ParentOrganizationID"] = req.query.ParentOrganizationID;
            let organization = `with recursive cte (OrganizationID, ParentOrganizationID) as (
        select     OrganizationID,
                   ParentOrganizationID
        from       Organization
        where      ParentOrganizationID = ${req.query.ParentOrganizationID}
        union all
        select     o.OrganizationID,
                   o.ParentOrganizationID
        from       Organization o
        inner join cte
                on o.ParentOrganizationID = cte.OrganizationID
      )
      select * from cte;`;

            const res = await sequelize.query(organization);

            let orgArr = [req.query.ParentOrganizationID];
            res[0].map((r) => {
                orgArr.push(r.OrganizationID);
            });

            // $where["OrganizationID"] = { [Op.in]: orgArr };
            $where["OrganizationID"] = {
                [Op.and]: [{ [Op.in]: orgArr }, { [Op.not]: 2 }],
            };
        }

        if (req.query.OrganizationCode)
            $where["OrganizationCode"] = {
                [Op.like]: "%" + req.query.OrganizationCode + "%",
            };

        if (req.query.OrganizationName)
            $where["OrganizationName"] = {
                [Op.like]: "%" + req.query.OrganizationName + "%",
            };

        if (req.query.OrganizationExecutive)
            $where["OrganizationExecutive"] = {
                [Op.like]: "%" + req.query.OrganizationExecutive + "%",
            };

        // if (req.query.OrganizationExecutivePosition)
        //   $where["OrganizationExecutivePosition"] = {
        //     [Op.like]: "%" + req.query.OrganizationExecutivePosition + "%",
        //   };

        if (req.query.OrganizationTypeID)
            $where["OrganizationTypeID"] = req.query.OrganizationTypeID;

        // if (req.query.OrganizationZoneID)
        //   $where["OrganizationZoneID"] = req.query.OrganizationZoneID;

        if (req.query.OrganizationAiZoneID) {
            let province1 = await Province.findAll({
                where: {
                    AiZoneID: req.query.OrganizationAiZoneID,
                },
            });

            let province_id_arr = province1.map((x) => {
                return x.ProvinceID;
            });

            $where["OrganizationProvinceID"] = {
                [Op.in]: province_id_arr,
            };
        }

        if (req.query.OrganizationZoneID) {
            console.log(100);
            console.log($where);

            let province_5 = await Province.findAll({
                where: {
                    OrganizationZoneID: Number(req.query.OrganizationZoneID),
                },
            });
            console.log(
                "✅ Province Query Result:",
                province_5.map((p) => p.ProvinceID)
            );
            console.log(106);
            console.log($where);

            let province_id_arr = province_5.map((x) => {
                return x.ProvinceID;
            });
            console.log(
                "🔍 Before updating OrganizationProvinceID - $where:",
                JSON.stringify($where, null, 2)
            );

            console.log(107);
            console.log($where);

            $where["OrganizationProvinceID"] = {
                [Op.in]: province_id_arr,
            };
            console.log(
                "✅ After updating OrganizationProvinceID - $where:",
                JSON.stringify($where, null, 2)
            );

            console.log(112);
            console.log($where);
        }

        if (req.query.OrganizationProvinceID)
            $where["OrganizationProvinceID"] = req.query.OrganizationProvinceID;

        if (req.query.OrganizationAmphurID)
            $where["OrganizationAmphurID"] = req.query.OrganizationAmphurID;

        if (req.query.OrganizationTumbolID)
            $where["OrganizationTumbolID"] = req.query.OrganizationTumbolID;

        if (req.query.OrganizationZipCode)
            $where["OrganizationZipCode"] = req.query.OrganizationZipCode;

        if (req.query.isActive) $where["isActive"] = req.query.isActive;
        if (req.query.CreatedUserID)
            $where["CreatedUserID"] = req.query.CreatedUserID;
        if (req.query.UpdatedUserID)
            $where["UpdatedUserID"] = req.query.UpdatedUserID;

        if ($where.hasOwnProperty("ProvinceID")) {
            delete $where["ProvinceID"];
        }

        $where["isRemove"] = 0;
        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // Order
        $order = [["OrganizationID", "ASC"]];
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

        let include = [];

        if (req.query.includeAll) {
            if (req.query.includeAll == "false") {
                if (req.query.includeProvince == "true") {
                    include.push({
                        association: "Province",
                        required: false,
                    });
                }
            } else {
                include.unshift({ all: true, required: false });
            }
        } else {
            include.unshift({ all: true, required: false });
        }

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
                    delete _q.query.include,
                    db.count(_q.query),
                ])
                    .then((result) => {
                        const rows = result[0],
                            count = result[2];
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

                let res = methods.findById(inserted.OrganizationID);

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
                data.OrganizationID = parseInt(id);

                data.updatedAt = fn("GETDATE");

                await db.update(data, { where: { OrganizationID: id } });

                let res = methods.findById(data.OrganizationID);

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
                    { where: { OrganizationID: id } }
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
                                OrganizationID: data.OrganizationID,
                                ParentOrganizationID: data.ParentOrganizationID,
                                OrganizationCode: data.OrganizationCode,
                                OrganizationName: data.OrganizationName,
                                ProvinceName: data.Province?.ProvinceName,
                                OrganizationTypeID: data.OrganizationTypeID,
                                OrganizationZoneID: data.OrganizationZoneID,
                                OrganizationProvinceID:
                                    data.OrganizationProvinceID,
                                OrganizationAmphurID: data.OrganizationAmphurID,
                                OrganizationTumbolID: data.OrganizationTumbolID,
                                OrganizationAiZoneID: data.OrganizationAiZoneID,
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
