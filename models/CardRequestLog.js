const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

class CardRequestLog extends Model {
  static associate(models) {
    this.belongsTo(models.Staff, {
      foreignKey: "StaffID",
      as: "Staff",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

CardRequestLog.init(
  {
    CardRequestID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    RequestDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "วันที่ขอบัตร",
    },
    StaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ผู้ขอบัตร",
    },
    CardStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่ออกบัตร",
    },
    CardExpireDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่หมดอายุบัตร",
    },
    IsApprove: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "สถานะการอนุมัติใช้งาน 0=รออนุมัติ 1=อนุมัติ 2=ไม่อนุมัติ",
      get() {
        let text = ["รออนุมัติ", "อนุมัติ", "ไม่อนุมัติ"];
        return text[this.getDataValue("IsApprove")];
      },
    },
    ApproveDatetime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่อนุมัติ",
    },
    ApproveByStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ผู้อนุมัติ",
    },
    Remark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
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
    ThaiRequestDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.RequestDate
          ? dayjs(this.RequestDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiCardStartDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.CardStartDate
          ? dayjs(this.CardStartDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiCardExpireDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.CardExpireDate
          ? dayjs(this.CardExpireDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiApproveDatetime: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.ApproveDatetime
          ? dayjs(this.ApproveDatetime).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "CardRequestLog",
  }
);

module.exports = CardRequestLog;
