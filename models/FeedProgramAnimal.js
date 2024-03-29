const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class FeedProgramAnimal extends Model {
  static associate(models) {
    this.belongsTo(models.FeedProgram, {
      foreignKey: "FeedProgramID",
      as: "FeedProgram",
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
      FeedProgram: this.FeedProgram ? this.FeedProgram : undefined,
      Animal: this.Animal ? this.Animal : undefined

    };
  }
}

FeedProgramAnimal.init(
  {
    FeedProgramAnimalID: {
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
    StartWeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "น้ำหนักเริ่มต้น",
    },
    EndWeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "น้ำหนักสิ้นสุด",
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
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ["FeedProgramID", "AnimalID"],
    //   },
    // ],
    modelName: "FeedProgramAnimal",
  }
);

module.exports = FeedProgramAnimal;
