const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class PresetDetail extends Model {
  static associate(models) {
    this.belongsTo(models.Preset, {
      foreignKey: "PresetID",
    });
    this.belongsTo(models.PresetActivity, {
      foreignKey: "PresetActivityID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

PresetDetail.init(
  {
    PresetDetailID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    PresetID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงโปรแกรมเหนี่ยวนำการเป็นสัด",
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
    PresetActivityID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสกิจกรรม",
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รายละเอียดกิจกรรม",
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
    modelName: "PresetDetail",
  }
);

module.exports = PresetDetail;
