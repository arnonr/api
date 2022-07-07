const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Region extends Model {
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Region.init(
  {
    RegionID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง ภาค",
    },
    RegionCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสภาค",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Region.findOne({ where: { RegionCode: value, isRemove: 0 } })
            .then(function (data) {
                console.log(self)
              if (data && self.RegionID !== data.RegionID) {
                throw new Error("Region Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    RegionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อภาค (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Region.findOne({ where: { RegionName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.RegionID !== data.RegionID) {
                throw new Error("Region Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    RegionNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อภาค (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Region.findOne({ where: { RegionNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.RegionID !== data.RegionID) {
                throw new Error("Region Name EN already in use!");
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
    modelName: "Region",
  }
);

module.exports = Region;
