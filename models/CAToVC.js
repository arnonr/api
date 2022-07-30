const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class CAToVC extends Model {
  static associate(models) {
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

CAToVC.init(
  {
    CAToVCID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    Amount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
        comment: "ปริมาณ",
    },
    createdAt: {
      field: "CreatedDatetime",
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่เพิ่มข้อมูล",
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
    modelName: "CAToVC",
  }
);

module.exports = CAToVC;

