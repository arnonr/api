const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class CureAntibiotic extends Model {
  static associate(models) {
    this.belongsToMany(models.AnimalType, {
      through: models.CureAntibioticToAnimalType,
      foreignKey: "CureAntibioticID",
    });

    this.belongsToMany(models.Reproduce, {
      through: models.RpToCureAntibiotic,
      foreignKey: "CureAntibioticID",
    });

    this.belongsToMany(models.CureActivity, {
      through: "CAToCB",
      // foreignKey: "VaccineID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

CureAntibiotic.init(
  {
    CureAntibioticID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    CureAntibioticCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสอ้างอิงยาปฏิชีวนะที่ใช้รักษา",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          CureAntibiotic.findOne({
            where: { CureAntibioticCode: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.CureAntibioticID !== data.CureAntibioticID) {
                throw new Error("CureAntibiotic Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    CureAntibioticName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบาย",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          CureAntibiotic.findOne({
            where: { CureAntibioticName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.CureAntibioticID !== data.CureAntibioticID) {
                throw new Error("CureAntibiotic Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalTypeID: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ชนิดสัตว์ (Array)",
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
    modelName: "CureAntibiotic",
  }
);

module.exports = CureAntibiotic;
