const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class AnimalGroupType extends Model {

  static associate(models) {
    this.belongsTo(models.AnimalGenre, {
      foreignKey: "AnimalGenreID",
      as: "AnimalGenre",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

AnimalGroupType.init(
  {
    AnimalGroupTypeID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ชนิดสัตว์หลัก",
    },
    AnimalGroupTypeCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสชนิดสัตว์หลัก",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          AnimalGroupType.findOne({
            where: { AnimalGroupTypeCode: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.AnimalGroupTypeID !== data.AnimalGroupTypeID) {
                throw new Error("AnimalGroupType Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AnimalGroupTypeName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายสายพันธุ์ ชนิดสัตว์หลัก",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          AnimalGroupType.findOne({
            where: { AnimalGroupTypeName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.AnimalGroupTypeID !== data.AnimalGroupTypeID) {
                throw new Error("AnimalGroupType Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalGenreID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสประเภทสัตว์",
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
    modelName: "AnimalGroupType",
  }
);

module.exports = AnimalGroupType;
