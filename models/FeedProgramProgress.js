const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class FeedProgramProgress extends Model {
  static associate(models) {
    this.belongsTo(models.FeedProgram, {
      foreignKey: "FeedProgramID",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });
    this.belongsToMany(models.Concentrate, {
      through: models.FeedPPToConcentrate,
      foreignKey: "FeedProgramProgressID",
    });
    this.belongsToMany(models.Roughages, {
      through: models.FeedPPToRoughages,
      foreignKey: "FeedProgramProgressID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

FeedProgramProgress.init(
  {
    FeedProgramProgressID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    FeedProgramID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงโปรแกรมเข้าขุน",
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
    TotalQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ปริมาณอาหาร/วัน (กก.)",
    },
    TMRFormulaID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงสูตร TMR",
    },
    TotalTMR: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ปริมาณอาหาร TMR/วัน (กก.)",
    },
    RoughagesID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงอาหารหยาบ",
    },
    TotalRoughages: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ปริมาณอาหารหยาบ/วัน (กก.)",
    },
    ConcentrateID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงอาหารข้น",
    },
    TotalConcentrate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ปริมาณอาหารข้น/วัน (กก.)",
    },
    ProgressRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "%ความสำเร็จ",
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
    modelName: "FeedProgramProgress",
  }
);

module.exports = FeedProgramProgress;
