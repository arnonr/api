const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class DiseaseResult extends Model {
  static associate(models) {
    
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

DiseaseResult.init(
  {
    DiseaseResultID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    DiseaseResultCode: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "รหัสผลการตรวจ",
        validate: {
          isUnique: function (value, next) {
            let self = this;
            DiseaseResult.findOne({
              where: { DiseaseResultCode: value, isRemove: 0 },
            })
              .then(function (data) {
                if (
                  data &&
                  self.DiseaseResultID !== data.DiseaseResultID
                ) {
                  throw new Error("DiseaseResult Code already in use!");
                }
                return next();
              })
              .catch(function (err) {
                return next(err);
              });
          },
        },
      },
    DiseaseResultName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายผลการตรวจ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          DiseaseResult.findOne({
            where: { DiseaseResultName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (
                data &&
                self.DiseaseResultID !== data.DiseaseResultID
              ) {
                throw new Error("DiseaseResult Name already in use!");
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
    modelName: "DiseaseResult",
  }
);

module.exports = DiseaseResult;
