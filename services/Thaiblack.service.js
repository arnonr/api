const config = require("../configs/app"),
    { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods"),
    db = require("../models/Thaiblack"),
    { Op, fn } = require("sequelize");
const Animal = require("../models/Animal");
const Farm = require("../models/Farm");

const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};
        $whereAnimal = {};

        if (req.query.ThaiblackID)
            $where["ThaiblackID"] = req.query.ThaiblackID;

        if (req.query.AnimalID) $where["AnimalID"] = req.query.AnimalID;

        if (req.query.ThaiblackRound)
            $where["ThaiblackRound"] = req.query.ThaiblackRound;

        if (req.query.ThaiblackDate)
            $where["ThaiblackDate"] = req.query.ThaiblackDate;

        if (req.query.ResponsibilityStaffID)
            $where["ResponsibilityStaffID"] = req.query.ResponsibilityStaffID;

        if (req.query.isActive) $where["isActive"] = req.query.isActive;
        if (req.query.CreatedUserID)
            $where["CreatedUserID"] = req.query.CreatedUserID;
        if (req.query.UpdatedUserID)
            $where["UpdatedUserID"] = req.query.UpdatedUserID;

        if (req.query.FarmID) {
            $whereAnimal["FarmID"] = req.query.FarmID;
        }

        $where["isRemove"] = 0;
        const query = Object.keys($where).length > 0 ? { where: $where } : {};
        const queryAnimal =
            Object.keys($whereAnimal).length > 0 ? { where: $whereAnimal } : {};

        // Order
        $order = [["ThaiblackID", "ASC"]];
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
                ...queryAnimal,
                model: Animal,
                include: {
                    model: Farm,
                    as: "AnimalFarm",
                },
            },
        ];

        return { query: query };
    },
    getData(data) {
        let dataJson = data.toJSON();
        data = {
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
                    .then(async (result) => {
                        let rows = result[0],
                            count = result[2];

                        rows = await Promise.all(
                            rows.map(async (data) => {
                                return this.getData(data);
                            })
                        );

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

                const obj = new db(data);
                const inserted = await obj.save();

                let res = methods.findById(inserted.ThaiblackID);

                resolve(res);
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },

    insertMulti(data) {
        return new Promise(async (resolve, reject) => {
            try {
                // ตรวจสอบว่าข้อมูลที่รับมาคือ array หรือไม่

                // สมมุติว่ามีฟังก์ชัน saveAnimalData ที่บันทึกข้อมูลสัตว์แต่ละตัว
                const { animals } = data;

                console.log(animals)

                animals.forEach(data => {
                    data.createdAt = fn("GETDATE");
                });
    

                // animals.forEach((animal) => {
                //     saveAnimalData({
                //         AnimalID: animal.AnimalID,
                //         ThaiblackDate,
                //         ResponsibilityStaffID,
                //         ThaiblackRound,
                //         Remark: animal.Remark, // สมมติว่ามี Remark ในแต่ละสัตว์
                //         isActive,
                //     });
                // });

                // บันทึกข้อมูลหลายรายการพร้อมกัน
                const inserted = await db.bulkCreate(animals); // ใช้ bulkCreate สำหรับ multi-insert

                // ดึงข้อมูลที่เพิ่งถูกสร้างเพื่อส่งกลับ
                // let res = await methods.findByIds(
                //     inserted.map((item) => item.ThaiblackID)
                // );

                resolve();
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
                data.ThaiblackID = parseInt(id);

                data.updatedAt = fn("GETDATE");

                await db.update(data, { where: { ThaiblackID: id } });

                let res = methods.findById(data.ThaiblackID);

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
                    { where: { ThaiblackID: id } }
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
};

module.exports = { ...methods };
