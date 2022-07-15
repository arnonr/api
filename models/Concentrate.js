const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Concentrate extends Model {
  static associate(models) {
    this.belongsToMany(models.TMRFormula, {
      through: models.TMRFormulaToConcentrate,
      foreignKey: "ConcentrateID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Concentrate.init(
  {
    ConcentrateID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    ConcentrateName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่ออาหารข้น",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Concentrate.findOne({
            where: { ConcentrateName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.ConcentrateID !== data.ConcentrateID) {
                throw new Error("Concentrate Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
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
    modelName: "Concentrate",
  }
);

module.exports = Concentrate;
