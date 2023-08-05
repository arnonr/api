const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class TMRFormula extends Model {
  static associate(models) {
    this.belongsToMany(models.Concentrate, {
      through: models.TMRFormulaToConcentrate,
      foreignKey: "TMRFormulaID",
    });
    this.belongsToMany(models.Roughages, {
      through: models.TMRFormulaToRoughages,
      foreignKey: "TMRFormulaID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "RemoveByStaffID",
      as: "RemoveBy",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

TMRFormula.init(
  {
    TMRFormulaID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การแท้ง",
    },
    TMRFormulaCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสสูตร TMR",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          TMRFormula.findOne({ where: { TMRFormulaCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.TMRFormulaID !== data.TMRFormulaID) {
                throw new Error("TMRFormula Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    TMRFormulaName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อสูตร TMR",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          TMRFormula.findOne({ where: { TMRFormulaName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.TMRFormulaID !== data.TMRFormulaID) {
                throw new Error("TMRFormula Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    RoughagesID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงอาหารหยาบ",
    },
    ConcentrateID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงอาหารข้น",
    },
    TotalTMR: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "ปริมาณอาหาร TMR/วัน (กก.)",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ที่รับผิดชอบ",
    },
    ProteinPercentage: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: "โปรตีน (%)",
    },
    CaloriePercentage: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: "พลังงาน (%)",
    },
    Cost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "ต้นทุนต่อวัน",
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
    RemoveDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่ลบ",
    },
    RemoveByStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ผู้ลบ",
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
    modelName: "TMRFormula",
  }
);

module.exports = TMRFormula;
