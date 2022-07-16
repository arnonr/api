const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Vaccine extends Model {
  static associate(models) {
    this.belongsToMany(models.AnimalType, {
      through: models.VcToAnimalType,
      foreignKey: "VaccineID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Vaccine.init(
  {
    VaccineID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    VaccineCode: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "รหัสวัคซีน",
        validate: {
          isUnique: function (value, next) {
            let self = this;
            Vaccine.findOne({
              where: { VaccineCode: value, isRemove: 0 },
            })
              .then(function (data) {
                if (
                  data &&
                  self.VaccineID !== data.VaccineID
                ) {
                  throw new Error("Vaccine Code already in use!");
                }
                return next();
              })
              .catch(function (err) {
                return next(err);
              });
          },
        },
      },
    VaccineName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อวัคซีน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Vaccine.findOne({
            where: { VaccineName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (
                data &&
                self.VaccineID !== data.VaccineID
              ) {
                throw new Error("Vaccine Name already in use!");
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
      comment: "รหัสชนิดสัตว์ (Array)",
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
    modelName: "Vaccine",
  }
);

module.exports = Vaccine;
