const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class Farm extends Model {
  static associate(models) {
    this.belongsTo(models.FarmStatus, {
      foreignKey: "FarmStatusID",
      as: "FarmStatus",
    });
    this.belongsTo(models.Tumbol, {
      foreignKey: "FarmTumbolID",
      as: "Tumbol",
    });
    this.belongsTo(models.Amphur, {
      foreignKey: "FarmAmphurID",
      as: "Amphur",
    });
    this.belongsTo(models.Province, {
      foreignKey: "FarmProvinceID",
      as: "Province",
    });
    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
      as: "Organization",
    });
    this.belongsTo(models.OrganizationZone, {
      foreignKey: "OrganizationZoneID",
      as: "OrganizationZone",
    });

    this.belongsTo(models.AIZone, {
      foreignKey: "AIZoneID",
      as: "AIZone",
    });

    this.belongsTo(models.Farmer, {
      foreignKey: "FarmerID",
      as: "Farmer",
    });

    // Project
    this.belongsToMany(models.Project, {
      through: models.FarmToProject,
      foreignKey: "FarmID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      FarmToProject: undefined,
    };
  }
}

Farm.init(
  {
    FarmID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ฟาร์ม",
    },
    FarmIdentificationNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสฟาร์ม",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Farm.findOne({
            where: { FarmIdentificationNumber: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.FarmID !== data.FarmID) {
                throw new Error(
                  "FarmIdentificationNumber Code already in use!"
                );
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    FarmName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อฟาร์ม",
    //   validate: {
    //     isUnique: function (value, next) {
    //       let self = this;
    //       Farm.findOne({ where: { FarmName: value, isRemove: 0 } })
    //         .then(function (data) {
    //           if (data && self.FarmID !== data.FarmID) {
    //             throw new Error("Farm Name already in use!");
    //           }
    //           return next();
    //         })
    //         .catch(function (err) {
    //           return next(err);
    //         });
    //     },
    //   },
    },
    FarmAddress: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ที่ตั้ง",
    },
    FarmerID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เกษตรกร",
    },
    FarmMoo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมู่ที่",
    },
    FarmStreet: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ถนน",
    },
    FarmTumbolID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ตำบล/แขวง",
    },
    FarmAmphurID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "อำเภอ/เขต",
    },
    FarmProvinceID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จังหวัด",
    },
    FarmZipCode: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสไปรษณีย์",
    },
    FarmLinkGoogleMap: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Link Google Map",
    },
    ResidenceLatitude: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ละติจูด",
    },
    ResidenceLongitude: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ลองจิจูด",
    },
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสหน่วยงาน",
    },
    OrganizationZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสเขตปศุสัตว์",
    },
    AIZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสศูนย์วิจัย",
    },
    FarmStatusID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสถานะฟาร์ม",
    },
    FarmAnimalType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชนิดสัตว์",
    },
    FarmTelephoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์",
    },
    FarmMobilePhoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์มือถือ",
    },
    FarmRegisterDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่ขึ้นทะเบียนฟาร์ม",
    },
    FarmImagePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "url ภาพประจำฟาร์ม",
    },
    ProjectID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงโครงการ (Array)",
    },
    FarmType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ประเภทโครงการ",
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
    ThaiFarmRegisterDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.FarmRegisterDate
          ? dayjs(this.FarmRegisterDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "Farm",
  }
);

module.exports = Farm;
