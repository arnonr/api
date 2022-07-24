const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class OvarySymptom extends Model {
  static associate(models) {
    this.belongsToMany(models.Reproduce, {
      through: models.RpToLeftOvarySymptom,
      foreignKey: "OvarySymptomID",
    });
    
    this.belongsToMany(models.Reproduce, {
      through: models.RpToRightOvarySymptom,
      foreignKey: "OvarySymptomID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

OvarySymptom.init(
  {
    OvarySymptomID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    OvarySymptomCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสลักษณะรังไข่",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          OvarySymptom.findOne({
            where: { OvarySymptomCode: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.OvarySymptomID !== data.OvarySymptomID) {
                throw new Error("OvarySymptom Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OvarySymptomName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ลักษณะรังไข่",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          OvarySymptom.findOne({
            where: { OvarySymptomName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.OvarySymptomID !== data.OvarySymptomID) {
                throw new Error("OvarySymptom Name already in use!");
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
    modelName: "OvarySymptom",
  }
);

module.exports = OvarySymptom;
