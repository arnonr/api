const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Organization extends Model {
  static associate(models) {
    this.belongsTo(models.OrganizationType, {
      foreignKey: "OrganizationTypeID",
      as: "OrganizationType",
    });
    this.belongsTo(models.OrganizationZone, {
      foreignKey: "OrganizationZoneID",
      as: "OrganizationZone",
    });
    this.belongsTo(models.Province, {
      foreignKey: "OrganizationProvinceID",
      as: "Province",
    });
    this.belongsTo(models.Amphur, {
      foreignKey: "OrganizationAmphurID",
      as: "Amphur",
    });
    this.belongsTo(models.Tumbol, {
      foreignKey: "OrganizationTumbolID",
      as: "Tumbol",
    });
    // ParentOrganizationID
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),

      OrganizationType: this.get().OrganizationType
        ? {
            OrganizationTypeID: this.get().OrganizationType.OrganizationTypeID,
            OrganizationTypeCode:
              this.get().OrganizationType.OrganizationTypeCode,
            OrganizationTypeName:
              this.get().OrganizationType.OrganizationTypeName,
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
      Province: this.get().Province
        ? {
            ProvinceID: this.get().Province.ProvinceID,
            ProvinceCode: this.get().Province.ProvinceCode,
            ProvinceName: this.get().Province.ProvinceName,
            ProvinceNameEN: this.get().Province.ProvinceNameEN,
          }
        : "",
      Amphur: this.get().Amphur
        ? {
            AmphurID: this.get().Amphur.AmphurID,
            AmphurCode: this.get().Amphur.AmphurCode,
            AmphurName: this.get().Amphur.AmphurName,
            AmphurNameEN: this.get().Amphur.AmphurNameEN,
          }
        : "",
      Tumbol: this.get().Tumbol
        ? {
            TumbolID: this.get().Tumbol.TumbolID,
            TumbolCode: this.get().Tumbol.TumbolCode,
            TumbolName: this.get().Tumbol.TumbolName,
            TumbolNameEN: this.get().Tumbol.TumbolNameEN,
          }
        : "",
    };
  }
}

Organization.init(
  {
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง หน่วยงาน",
    },
    ParentOrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงหน่วยงานหลัก",
    },
    OrganizationCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสหน่วยงาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Organization.findOne({
            where: { OrganizationCode: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.OrganizationID !== data.OrganizationID) {
                throw new Error("Organization Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OrganizationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อหน่วยงาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Organization.findOne({
            where: { OrganizationName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.OrganizationID !== data.OrganizationID) {
                throw new Error("Organization Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OrganizationExecutive: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อผู้บริหาร",
    },
    OrganizationExecutivePosition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ตำแหน่งผู้บริหาร",
    },
    OrganizationTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงประเภทหน่วยงาน",
    },
    OrganizationRegisterDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่ขึ้นทะเบียนหน่วยงาน",
    },
    OrganizationZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง เขตปศุสัตว์",
    },
    OrganizationAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ที่อยู่หน่วยงาน",
    },
    OrganizationProvinceID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง จังหวัด",
    },
    OrganizationAmphurID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง อำเภอ",
    },
    OrganizationTumbolID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง ตำบล",
    },
    OrganizationZipCode: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "รหัสไปรษณีย์",
    },
    OrganizationTelNo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์",
    },
    OrganizationFaxNo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรสาร",
    },
    OrganizationMobileNo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์มือถือ",
    },
    OrganizationWebsite: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "เว็บไซต์หน่วยงาน",
    },
    OrganizationEmailAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "อีเมลหน่วยงาน",
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
    OrganizationAiZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    }
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Organization",
  }
);

module.exports = Organization;
