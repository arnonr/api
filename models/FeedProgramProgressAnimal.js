const { Model, DataTypes, DOUBLE } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class FeedProgramProgressAnimal extends Model {
  static associate(models) {
    this.belongsTo(models.FeedProgramProgress, {
      foreignKey: "FeedProgramProgressID",
      as: "FeedProgramProgress",
    });
    this.belongsTo(models.FeedProgramAnimal, {
      foreignKey: "FeedProgramAnimalID",
      as: "FeedProgramAnimal",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
      as: "Animal",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

FeedProgramProgressAnimal.init(
  {
    FeedProgramProgressAnimalID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    FeedProgramProgressID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงการบันทึก",
    },
    FeedProgramAnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงสัตว์",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงสัตว์",
    },
    WeightDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่ชั่งน้ำหนัก",
    },
    Weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "น้ำหนัก (กก.)",
    },
    Height: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ส่วนสูง (ซม.)",
    },
    Length: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความยาวลำตัว (ซม.)",
    },
    CrossSectionalArea: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "พื้นที่หน้าตัดสันหลัง (ซม.)",
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
    deletedAt: {
      field: "DeletedDatetime",
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่ลบ",
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    paranoid: true,
    modelName: "FeedProgramProgressAnimal",
  }
);

module.exports = FeedProgramProgressAnimal;
