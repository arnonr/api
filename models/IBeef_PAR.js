const { Model, DataTypes } = require("sequelize"),
    { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class IBeef_PAR extends Model {
    // Custom JSON Response
    toJSON() {
        return {
            ...this.get(),
        };
    }
}

IBeef_PAR.init(
    {
        PAR_ID: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        AnimalID: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "รหัสอ้างอิงสัตว์",
        },
        PAR: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            comment: "ท้องที่",
        },
        ProductionStatusID: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            comment: "รหัสผลการผลิต",
        },
        create_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "วัน-เวลาที่เพิ่มข้อมูล",
        },
        create_by: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "ผู้เพิ่มข้อมูล",
        },
        update_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "วัน-เวลาที่แก้ไขข้อมูล",
        },
        update_by: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "ผู้แก้ไขข้อมูล",
        },
        LastActivityDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "วันที่ทำกิจกรรมล่าสุด",
        },
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        modelName: "iBeef_PAR",
    }
);

module.exports = IBeef_PAR;
