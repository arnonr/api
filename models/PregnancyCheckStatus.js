const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class PregnancyCheckStatus extends Model {
  static associate(models) {}

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

PregnancyCheckStatus.init(
  {
    PregnancyCheckStatusID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง วิธีการตรวจการตั้งท้อง",
    },
    PregnancyCheckStatusCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสวิธีการตรวจการตั้งท้อง",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          PregnancyCheckStatus.findOne({
            where: { PregnancyCheckStatusCode: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.PregnancyCheckStatusID !== data.PregnancyCheckStatusID) {
                throw new Error("PregnancyCheckStatus Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    PregnancyCheckStatusName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายการตรวจการตั้งท้อง",
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
    modelName: "PregnancyCheckStatus",
  }
);

module.exports = PregnancyCheckStatus;
