const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class AnnualGoal extends Model {
  static associate(models) {
    this.belongsToMany(models.AnimalType, {
      through: models.AnnualGoalToAnimalType,
      foreignKey: "AnnualGoalID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

AnnualGoal.init(
  {
    AnnualGoalID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ลักษณะการแท้ง",
    },
    
    OrganizationID:{
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "รหัสอ้างอิงหน่วยงาน",
    },
    ProjectID:{
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "รหัสอ้างอิงโครงการ",
    },
    AnimalTypeID:{
        type: DataTypes.STRING,
        allowNull: false,
        comment: "รหัสอ้างอิงชนิดสัตว์",
    },
    TotalAIGoal:{
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เป้าหมายการผสมเทียม (ตัว)",
    },
    TotalPregnant:{
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เป้าหมายการตั้งท้อง (ตัว)",
    },
    TotalBirth:{
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "เป้าหมายลูกเกิด (ตัว)",
    },
    BudgetYear:{
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "ปีงบประมาณ",
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
    modelName: "AnnualGoal",
  }
);

module.exports = AnnualGoal;
