const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class ChangeStaffInfoLog extends Model {
  static associate(models) {
    this.belongsTo(models.Staff, {
      foreignKey: "StaffID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ApproveByStaffID",
      as: "ApproveByStaff",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

ChangeStaffInfoLog.init(
  {
    ChangeStaffInfoLogID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    StaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงผู้ใช้งาน",
    },
    InfomationChange: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "รายละเอียดแก้ไข",
    },
    ChangeDatetime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่แก้ไข",
    },
    IsApprove: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "สถานะการอนุมัติใช้งาน, 0=รออนุมัติ, 1=อนุมัติ, 2=ไม่อนุมัติ",
    },
    ApproveDatetime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่อนุมัติ",
    },
    Remark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    ApproveByStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ผู้อนุมัติ",
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
    ThaiChangeDatetime: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.ChangeDatetime
          ? dayjs(this.ChangeDatetime).locale("th").format("DD/MM/BBBB")
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
    ApproveByStaffName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.ApproveByStaff.StaffNumber} ${this.ApproveByStaff.StaffGivenName} ${this.ApproveByStaff.StaffSurname}`;
      },
    },
    StaffName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.Staff.StaffNumber} ${this.Staff.StaffGivenName} ${this.Staff.StaffSurname}`;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "ChangeStaffInfoLog",
  }
);

module.exports = ChangeStaffInfoLog;
