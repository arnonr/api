const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class CardRequestLog extends Model {
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
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "CardRequestLog",
  }
);

module.exports = CardRequestLog;
