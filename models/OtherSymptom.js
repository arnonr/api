const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class OtherSymptom extends Model {
  static associate(models) {
    this.belongsToMany(models.Reproduce, {
      through: models.RpToOtherSymptom,
      foreignKey: "OtherSymptomID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

OtherSymptom.init(
  {
    OtherSymptomID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    OtherSymptomCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสปัญหาอื่น ๆ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          OtherSymptom.findOne({
            where: { OtherSymptomCode: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.OtherSymptomID !== data.OtherSymptomID) {
                throw new Error("OtherSymptom Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OtherSymptomName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบาย",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          OtherSymptom.findOne({
            where: { OtherSymptomName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.OtherSymptomID !== data.OtherSymptomID) {
                throw new Error("OtherSymptom Name already in use!");
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
    timestamps: false,
    freezeTableName: true,
    modelName: "OtherSymptom",
  }
);

module.exports = OtherSymptom;
