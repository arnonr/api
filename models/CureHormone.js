const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class CureHormone extends Model {
  static associate(models) {
    this.belongsToMany(models.AnimalType, {
      through: models.CureHormoneToAnimalType,
      foreignKey: "CureHormoneID",
    });

    this.belongsToMany(models.Reproduce, {
      through: models.RpToCureHormone,
      foreignKey: "CureHormoneID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

CureHormone.init(
  {
    CureHormoneID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    CureHormoneCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสอ้างอิงฮอร์โมนที่ใช้รักษา",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          CureHormone.findOne({
            where: { CureHormoneCode: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.CureHormoneID !== data.CureHormoneID) {
                throw new Error("CureHormone Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    CureHormoneName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบาย",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          CureHormone.findOne({
            where: { CureHormoneName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.CureHormoneID !== data.CureHormoneID) {
                throw new Error("CureHormone Name already in use!");
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
    modelName: "CureHormone",
  }
);

module.exports = CureHormone;
