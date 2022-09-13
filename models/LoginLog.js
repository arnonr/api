const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class LoginLog extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "UserID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

LoginLog.init(
  {
    LoginLogID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การเข้าใช้งาน",
    },
    UserID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงผู้ใช้งาน",
    },
    LoginDatetime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "วัน-เวลาที่เข้าสู่ระบบ",
    },
    Device: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "อุปกรณ์",
    },
    IPAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "IP Address",
    },
    LogoutDatetime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่ออกจากระบบ",
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
    ThaiLoginDatetime: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.LoginDatetime
          ? dayjs(this.LoginDatetime).locale("th").format("DD/MM/BBBB HH:mm:ss")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "LoginLog",
  }
);

module.exports = LoginLog;
