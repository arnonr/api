const { Model, DataTypes } = require("sequelize"),
    { sequelize } = require("../configs/databases");

class AnimalType extends Model {
    static associate(models) {
        this.belongsTo(models.AnimalGenre, {
            foreignKey: "AnimalGenreID",
            // as: "AnimalGenre",
        });
        this.belongsTo(models.AnimalGroupType, {
            foreignKey: "AnimalGroupTypeID",
            // as: "AnimalGroupTypes",
        });

        this.belongsToMany(models.Project, {
            through: models.ProjectToAnimalType,
            foreignKey: "AnimalTypeID",
            // as: "Project",
        });

        this.belongsToMany(models.User, {
            through: models.UserToAnimalType,
            foreignKey: "AnimalTypeID",
            as: "Users",
        });

        this.belongsToMany(models.AnimalStatus, {
            through: models.AnimalStatusToAnimalType,
            foreignKey: "AnimalTypeID",
            as: "AnimalStatuses",
        });

        this.belongsToMany(models.PresetActivity, {
            through: models.PresetActivityToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.DistributionReason, {
            through: models.DistributionReasonToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.DewormMedicine, {
            through: models.DMToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.Vaccine, {
            through: models.VcToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.Disease, {
            through: models.DsToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.AnnualGoal, {
            through: models.AnnualGoalToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CureVitamin, {
            through: models.CureVitaminToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CureAntibiotic, {
            through: models.CureAntibioticToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CureHormone, {
            through: models.CureHormoneToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CauseHealth, {
            through: models.CauseHealthToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CauseFeeder, {
            through: models.CauseFeederToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CauseEnvironment, {
            through: models.CauseEnvToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CauseAnimal, {
            through: models.CauseAnimalToAnimalType,
            foreignKey: "AnimalTypeID",
        });

        this.belongsToMany(models.CureMethod, {
            through: models.CMToAT,
            foreignKey: "AnimalTypeID",
        });
    }

    // Custom JSON Response
    toJSON() {
        return {
            ...this.get(),
            ProjectToAnimalType: undefined,
            Projects: undefined,
            Users: undefined,
        };
    }
}

AnimalType.init(
    {
        AnimalTypeID: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            comment: "เลขไอดีอ้างอิง ชนิดสัตว์",
        },
        AnimalTypeCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "รหัสชนิดสัตว์",
            validate: {
                isUnique: function (value, next) {
                    let self = this;
                    AnimalType.findOne({
                        where: { AnimalTypeCode: value, isRemove: 0 },
                    })
                        .then(function (data) {
                            console.log(self);
                            if (
                                data &&
                                self.AnimalTypeID !== data.AnimalTypeID
                            ) {
                                throw new Error(
                                    "AnimalType Code already in use!"
                                );
                            }
                            return next();
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                },
            },
        },
        AnimalTypeName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "คำอธิบายชนิดสัตว์ (ภาษาไทย)",
            validate: {
                isUnique: function (value, next) {
                    let self = this;
                    AnimalType.findOne({
                        where: { AnimalTypeName: value, isRemove: 0 },
                    })
                        .then(function (data) {
                            if (
                                data &&
                                self.AnimalTypeID !== data.AnimalTypeID
                            ) {
                                throw new Error(
                                    "AnimalType Name already in use!"
                                );
                            }
                            return next();
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                },
            },
        },
        AnimalTypeNameEN: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "คำอธิบายชนิดสัตว์ (ภาษาอังกฤษ)",
        },

        AnimalGenreID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "รหัสประเภทสัตว์",
        },
        AnimalSubGroupTypeID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "รหัสชนิดสัตว์รอง",
        },

        AnimalGroupTypeID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "รหัสชนิดสัตว์หลัก",
        },
        InactiveYear: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 5,
            comment: "กำหนดจำนวนปีที่ปรับสถานะสัตว์เป็น Inactive",
        },

        isActive: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 1,
            comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
        },
        isRemove: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
            comment: "1 = ถูกลบ",
        },
        CreatedUserID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
        },
        createdAt: {
            field: "CreatedDatetime",
            type: DataTypes.DATE,
            allowNull: false,
            comment: "วัน-เวลาที่เพิ่มข้อมูล",
        },
        UpdatedUserID: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่แก้ไขข้อมูลล่าสุด",
        },
        updatedAt: {
            field: "UpdatedDatetime",
            type: DataTypes.DATE,
            allowNull: true,
            comment: "วัน-เวลาที่แก้ไขข้อมูลล่าสุด",
        },
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        modelName: "AnimalType",
    }
);

module.exports = AnimalType;
