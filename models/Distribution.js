const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Distribution extends Model {
  static associate(models) {
    this.belongsTo(models.Farm, {
      foreignKey: "FarmID",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });
    this.belongsTo(models.DistributionReason, {
      foreignKey: "DistributionReasonID",
    });
    this.belongsTo(models.Farm, {
      foreignKey: "DestinationFarmID",
      as: "DestinationFarm",
    });
    this.belongsTo(models.Organization, {
      foreignKey: "DestinationOrganizationID",
      as: "Organization",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Distribution.init(
  {
    DistributionID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การคัดตำหน่าย",
    },
    DistributionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่คัดจำหน่าย",
    },
    FarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ฟาร์มที่คัดจำหน่าย",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงสัตว์",
    },
    DistributionType: {
      type: DataTypes.ENUM("DEATH", "SALE", "DROP", "TRANSFER"),
      allowNull: false,
      comment:
        "ประเภทการคัดจำหน่าย DEATH - ตาย, SALE - ขาย, DROP - คัดทิ้ง,TRANSFER - ย้าย",
    },
    DistributionReasonID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงสาเหตุที่คัดจำหน่าย",
    },
    DestinationFarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ฟาร์มที่คัดจำหน่าย",
    },
    DestinationOrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "หน่วยงานปลายทางที่คัดจำหน่าย",
    },
    DestinationPlace: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สถานที่ปลายทางที่คัดจำหน่าย",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ที่รับผิดชอบ",
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
    modelName: "Distribution",
  }
);

module.exports = Distribution;
