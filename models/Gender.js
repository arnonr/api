const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Gender extends Model {

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Gender.init(
  {
    GenderID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง เพศ",
    },
    GenderCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสเพศ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Gender.findOne({ where: { GenderCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.GenderID !== data.GenderID) {
                throw new Error("Gender Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    GenderName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อเพศ (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Gender.findOne({ where: { GenderName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.GenderID !== data.GenderID) {
                throw new Error("Gender Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    GenderNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อเพศ (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Gender.findOne({ where: { GenderNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.GenderID !== data.GenderID) {
                throw new Error("Gender Name EN already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
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
    modelName: "Gender",
  }
);

module.exports = Gender;
