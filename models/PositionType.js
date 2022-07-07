const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class PositionType extends Model {

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

PositionType.init(
  {
    PositionTypeID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ประเภทบุคลากร",
    },
    PositionTypeCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสประเภทบุคลากร",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          PositionType.findOne({ where: { PositionTypeCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.PositionTypeID !== data.PositionTypeID) {
                throw new Error("Position Type Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    PositionTypeName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ประเภทบุคลากร",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          PositionType.findOne({ where: { PositionTypeName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.PositionTypeID !== data.PositionTypeID) {
                throw new Error("Position Type Name already in use!");
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
    modelName: "PositionType",
  }
);

module.exports = PositionType;
