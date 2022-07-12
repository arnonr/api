const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class AnimalStatus extends Model {
  static associate(models) {
    this.belongsToMany(models.AnimalType, {
      through: models.AnimalStatusToAnimalType,
      foreignKey: "AnimalStatusID",
    });
    this.belongsToMany(models.AnimalSex, {
      through: models.AnimalStatusToAnimalSex,
      foreignKey: "AnimalStatusID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      AnimalStatusToAnimalSex: undefined,
      AnimalStatusToAnimalType: undefined
    };
  }
}

AnimalStatus.init(
  {
    AnimalStatusID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง สถานะ",
    },
    AnimalStatusCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ตัวย่อสถานะ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          AnimalStatus.findOne({
            where: { AnimalStatusCode: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.AnimalStatusID !== data.AnimalStatusID) {
                throw new Error("AnimalStatus Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AnimalStatusName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายสถานะ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          AnimalStatus.findOne({
            where: { AnimalStatusName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.AnimalStatusID !== data.AnimalStatusID) {
                throw new Error("AnimalStatus Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AnimalStatusStartAgeAmount: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "อายุเริ่มต้น",
    },
    AnimalStatusStartAgeUnit: {
      type: DataTypes.ENUM('DAY', 'MONTH', 'YEAR'),
      allowNull: true,
      comment: "หน่วยอายุเริ่มต้น",
    },

    AnimalTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสชนิดสัตว์(Array)",
    },

    AnimalSexID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเพศสัตว์(Array)",
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
    modelName: "AnimalStatus",
  }
);

module.exports = AnimalStatus;
