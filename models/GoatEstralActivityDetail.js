const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class GoatEstralActivityDetail extends Model {
  static associate(models) {
    this.belongsTo(models.PresetActivity, {
      foreignKey: "PresetActivityID",
      as: "PresetActivity",
    });
    this.belongsTo(models.GoatEstralActivity, {
      foreignKey: "GoatEstralActivityID",
      as: "GoatEstralActivity",
    });
  }
  
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

GoatEstralActivityDetail.init(
  {
    GoatEstralActivityDetailID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    GoatEstralActivityID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงโปรแกรม",
    },
    Day: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "วัน",
    },
    Time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: "เวลา",
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รายละเอียดกิจกรรม",
    },
    PresetActivityID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "กิจกรรม",
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
    modelName: "GoatEstralActivityDetail",
  }
);

module.exports = GoatEstralActivityDetail;
