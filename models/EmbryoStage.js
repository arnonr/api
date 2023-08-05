const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class EmbryoStage extends Model {
  static associate(models) {}

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

EmbryoStage.init(
  {
    EmbryoStageID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ระยะตัวอ่อน",
    },
    EmbryoStageCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสระยะตัวอ่อน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          EmbryoStage.findOne({
            where: { EmbryoStageCode: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.EmbryoStageID !== data.EmbryoStageID) {
                throw new Error("EmbryoStage Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    EmbryoStageName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อระยะ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          EmbryoStage.findOne({
            where: { EmbryoStageName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.EmbryoStageID !== data.EmbryoStageID) {
                throw new Error("EmbryoStage Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    EmbryoStageGrade: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: true,
      comment: "เกรด",
    },
    IsTransfer: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1=สามารถย้ายฝาก, 0= ไม่สามารถย้ายฝาก",
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
    modelName: "EmbryoStage",
  }
);

module.exports = EmbryoStage;
