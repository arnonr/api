const { Model, DataTypes } = require("sequelize"),
  crypto = require("crypto"),
  jwt = require("jsonwebtoken"),
  config = require("../configs/app"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

class UserFarmer extends Model {
  // Custom JSON Response
  static associate(models) {
    this.belongsTo(models.Farmer, { foreignKey: "FarmerID", as: "Farmer" });
    this.belongsTo(models.Group, { foreignKey: "GroupID", as: "Group" });
    // this.belongsToMany(models.AnimalType, {
    //   through: models.UserToAnimalType,
    //   foreignKey: "UserID",
    // });
  }

  // Hash Password
  passwordHash(Password) {
    return crypto.createHash("sha1").update(Password).digest("hex");
  }
}

UserFarmer.init(
  {
    UserFarmerID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง User เกษตรกร",
    },

    Username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ชื่อผู้ใช้งาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          UserFarmer.findOne({ where: { Username: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.UserFarmerID !== data.UserFarmerID) {
                throw new Error("Username already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสผ่าน",
    },
    FarmerID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสเกษตรกร",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          UserFarmer.findOne({ where: { FarmerID: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.UserFarmerID !== data.UserFarmerID) {
                throw new Error("User Farmer already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    Pin: {
      type: DataTypes.STRING(6),
      allowNull: true,
      comment: "รหัส PIN",
    },
    RegisterDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่สมัครใช้งานระบบ",
    },
    LastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาเข้าสู่ระบบครั้งล่าสุด",
    },
    GroupID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "กลุ่มผู้ใช้งาน",
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
      allowNull: true,
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
    ThaiRegisterDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.RegisterDate
          ? dayjs(this.RegisterDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiLastLogin: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.LastLogin
          ? dayjs(this.LastLogin).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "UserFarmer",
  }
);

module.exports = UserFarmer;
