const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class HeatCircle extends Model {

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

HeatCircle.init(
  {
    HeatCircleID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    HeatCircleName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "อาการเป็นสัด",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          HeatCircle.findOne({ where: { HeatCircleName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.HeatCircleID !== data.HeatCircleID) {
                throw new Error("HeatCircle Name already in use!");
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
    modelName: "HeatCircle",
  }
);

module.exports = HeatCircle;
