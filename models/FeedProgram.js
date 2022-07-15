const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class FeedProgram extends Model {
  static associate(models) {
    this.belongsTo(models.Farm, {
      foreignKey: "FarmID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

FeedProgram.init(
  {
    FeedProgramID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    StartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่เริ่มขุน",
    },
    EndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่สิ้นสุด",
    },
    WeightGoal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "น้ำหนักเป้าหมาย (กก.)",
    },
    TotalAnimal: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวนสัตว์ที่เข้าขุน",
    },
    SuccessAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวนสัตว์ที่เป็นไปตามเป้าหมาย",
    },
    UnsuccessAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวนสัตว์ที่ไม่เป็นไปตามเป้าหมาย",
    },

    FarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงฟาร์ม",
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
    modelName: "FeedProgram",
  }
);

module.exports = FeedProgram;
