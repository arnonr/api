const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Province extends Model {
  static associate(models) {
    this.belongsTo(models.Region, { foreignKey: "RegionID", as: "Region" });
    this.belongsTo(models.AIZone, { foreignKey: "AIZoneID", as: "AIZone" });
    this.belongsTo(models.OrganizationZone, { foreignKey: "OrganizationZoneID", as: "OrganizationZone" });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      Region: this.get().Region
        ? {
            RegionID: this.get().Region.RegionID,
            RegionCode: this.get().Region.RegionCode,
            RegionName: this.get().Region.RegionName,
            RegionNameEN: this.get().Region.RegionNamEN,
          }
        : "",
      AIZone: this.get().AIZone
        ? {
            AIZoneID: this.get().AIZone.AIZoneID,
            AIZoneCode: this.get().AIZone.AIZoneCode,
            AIZoneName: this.get().AIZone.AIZoneName,
            AIZoneENCode: this.get().AIZone.AIZoneENCode,
          }
        : "",
      OrganizationZone: this.get().OrganizationZone
        ? {
            OrganizationZoneID: this.get().OrganizationZone.OrganizationZoneID,
            OrganizationZoneCode:
              this.get().OrganizationZone.OrganizationZoneCode,
            OrganizationZoneName:
              this.get().OrganizationZone.OrganizationZoneName,
          }
        : "",
    };
  }
}

Province.init(
  {
    ProvinceID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง จังหวัด",
    },
    ProvinceCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสจังหวัด",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Province.findOne({ where: { ProvinceCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.ProvinceID !== data.ProvinceID) {
                throw new Error("Province Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    ProvinceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อจังหวัด (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Province.findOne({ where: { ProvinceName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.ProvinceID !== data.ProvinceID) {
                throw new Error("Province Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    ProvinceNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อจังหวัด (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Province.findOne({ where: { ProvinceNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.ProvinceID !== data.ProvinceID) {
                throw new Error("Province Name EN already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    RegionID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงภาค",
    },
    OrganizationZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงเขตพื้นที่",
    },
    AIZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงศูนย์วิจัย",
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
    modelName: "Province",
  }
);

module.exports = Province;
