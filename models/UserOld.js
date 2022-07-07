const { Model, DataTypes } = require("sequelize"),
  crypto = require("crypto"),
  jwt = require("jsonwebtoken"),
  config = require("../configs/app"),
  { sequelize } = require("../configs/databases");

class UserOld extends Model {
  static associate(models) {
    // this.hasOne(models.PersonalData, {
    //   foreignKey: "id",
    //   as: "PersonalData",
    // });
    // this.belongsTo(models.Group, { foreignKey: "group_id", as: "Group" });
  }

  // Generate JWT
  generateJWT(obj) {
    let today = new Date(),
      exp = new Date(today);
    exp.setDate(today.getDate() + config.token_exp_days || 1);
    // exp.setMinutes(today.getMinutes() + 60);

    // find group ID หริือ join
    return jwt.sign(
      {
        id: this.id,
        username: this.username,
        // role: this.Group.code,
        exp: parseInt(exp.getTime() / 1000),
      },
      config.secret
    );
  }

  getFullname() {
    return [this.name, this.surname].join(" ");
  }

  // Custom JSON Response
  toJSON() {
    // ถ้าฟิลด์ไหนไม่เอาก็ undefined
    return {
      ...this.get(),
      password: undefined
    };
  }

  // Hash Password
  passwordHash(password) {
    return crypto.createHash("sha1").update(password).digest("hex");
  }

  // Verify Password
  validPassword(password) {
    return this.passwordHash(password) === this.password;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ผู้ใช้งาน",
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "ชื่อบัญชีผู้ใช้งาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          User.findOne({ where: { username: value, is_remove: 0 } })
            .then(function (user) {
              if (user && self.id !== user.id) {
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
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสผ่านผู้ใช้งาน",
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "เบอร์โทรศัพท์",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          User.findOne({ where: { phone: value, is_remove: 0 } })
            .then(function (user) {
              if (user && self.id !== user.id) {
                throw new Error("Phone already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    group_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีอ้างอิงกลุ่มผู้ใช้งาน",
    },
    animal_type_id_lists: {
      type: DataTypes.STRING(30), // 1,2,3
      allowNull: false,
      comment: "เลขไอดีอ้างอิงชนิดสัตว์ที่รับผิดชอบ",
    },
    status: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      comment:
        "W = รออนุมัติ (wait) / A = อนุมัติ (approved) / R = ไม่อนุมัติ (rejected)",
    },
    checked_datetime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่ตรวจสอบข้อมูลผู้ใช้งาน",
    },
    checked_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิงผู้ใช้งาน ที่ตรวจสอบอนุมัติ/ไม่อนุมัติ",
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "เหตุผล (ถ้ามี)",
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
    is_remove: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "1 = ถูกลบ",
    },
    created_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
    },
    createdAt: {
      field: "created_datetime",
      type: DataTypes.DATE,
      allowNull: false,
      comment: "วัน-เวลาที่เพิ่มข้อมูล",
    },
    updated_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่แก้ไขข้อมูลล่าสุด",
    },
    updatedAt: {
      field: "updated_datetime",
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่แก้ไขข้อมูลล่าสุด",
    },
    // fullName: {
    //   type: DataTypes.VIRTUAL,
    //   get() {
    //     return `${this.firstName} ${this.lastName}`;
    //   },
    //   set(value) {
    //     throw new Error("Do not try to set the `fullName` value!");
    //   },
    // },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "users",
    // hooks: {
    //   beforeSave: (user) => {
    //     //  user
    //   },
    // },
  }
);

// (async () => {
//   await sequelize.sync();
//   // Code here
// })();

module.exports = User;
