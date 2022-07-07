const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Title extends Model {
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Title.init(
  {
    TitleID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง คำนำหน้าชื่อ",
    },
    TitleCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสคำนำหน้าชื่อ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Title.findOne({ where: { TitleCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.TitleID !== data.TitleID) {
                throw new Error("Title Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    TitleName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำนำหน้าชื่อ (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Title.findOne({ where: { TitleName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.TitleID !== data.TitleID) {
                throw new Error("Title Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    TitleShortName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำนำหน้าชื่อย่อ (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Title.findOne({ where: { TitleShortName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.TitleID !== data.TitleID) {
                throw new Error("Title Short Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    TitleNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "คำนำหน้าชื่อ (ภาษาอังกฤษ)",
    },
    TitleShortNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "คำนำหน้าชื่อย่อ (ภาษาอังกฤษ)",
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
    modelName: "Title",
  }
);

module.exports = Title;
