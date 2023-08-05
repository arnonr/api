const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class FeedPPToRoughages extends Model {
  // Custom JSON Response
  static associate(models) {}
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

FeedPPToRoughages.init(
  {
    FeedPPToRoughagesID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    FeedProgramProgressID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีตรวจการขุน",
    },
    RoughagesID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิง อาหารหยาบ",
    },
    Amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "จำนวน",
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
    timestamps: false,
    freezeTableName: true,
    modelName: "FeedPPToRoughages",
  }
);

module.exports = FeedPPToRoughages;
