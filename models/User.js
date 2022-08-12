const { Model, DataTypes } = require("sequelize"),
  crypto = require("crypto"),
  jwt = require("jsonwebtoken"),
  config = require("../configs/app"),
  { sequelize } = require("../configs/databases");

class User extends Model {
  // Custom JSON Response
  static associate(models) {
    this.belongsTo(models.Staff, { foreignKey: "StaffID", as: "Staff" });
    this.belongsTo(models.Group, { foreignKey: "GroupID", as: "Group" });

    this.belongsToMany(models.AnimalType, {
      through: models.UserToAnimalType,
      foreignKey: "UserID",
    });
  }

  generateJWT(obj) {
    let today = new Date(),
      exp = new Date(today);
      exp.setDate(today.getDate() + 10 || 1);

    // exp.setMinutes(today.getMinutes() + 60);

    // find group ID หริือ join
    return jwt.sign(
      {
        id: this.UserID,
        UserID: this.UserID,
        Username: this.Username,
        // role: this.Group.code,
        exp: parseInt(exp.getTime() / 1000),
      },
      config.secret
    );
  }

  toJSON() {
    return {
      ...this.get(),
      Password: undefined,
      Group: this.get().Group
        ? {
            GroupCode: this.get().Group.GroupCode,
            GroupName: this.get().Group.GroupName,
            GroupDescription: this.get().Group.GroupDescription,
            DataAccessLevelID: this.get().Group.DataAccessLevelID,
            GroupAuthorize: this.get().Group.GroupAuthorize,
          }
        : "",
    };
  }

  // Hash Password
  passwordHash(Password) {
    return crypto.createHash("sha1").update(Password).digest("hex");
  }

  // Verify Password
  validPassword(Password) {
    return this.passwordHash(Password) === this.Password;
  }
}

User.init(
  {
    UserID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง อาชีพ",
    },

    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "ชื่อผู้ใช้งาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          User.findOne({ where: { Username: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.UserID !== data.UserID) {
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
      allowNull: false,
      comment: "รหัสผ่าน",
    },
    StaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสบุคลากร",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          User.findOne({ where: { StaffID: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.UserID !== data.UserID) {
                throw new Error("Staff already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
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
    AnimalTypeID: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ชนิดสัตว์",
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
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "User",
  }
);

module.exports = User;
