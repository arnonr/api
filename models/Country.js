const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Country extends Model {
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Country.init(
  {
    CountryID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ประเทศ",
    },
    CountryCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสประเทศ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Country.findOne({ where: { CountryCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.CountryID !== data.CountryID) {
                throw new Error("Country Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    CountryName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อประเทศ (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Country.findOne({ where: { CountryName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.CountryID !== data.CountryID) {
                throw new Error("Country Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    CountryNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อประเทศ (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Country.findOne({ where: { CountryNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.CountryID !== data.CountryID) {
                throw new Error("Country Name EN already in use!");
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
    timestamps: false,
    freezeTableName: true,
    modelName: "Country",
  }
);

module.exports = Country;
