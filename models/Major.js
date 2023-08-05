const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Major extends Model {

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Major.init(
  {
    MajorID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง สาขาวิชาเรียน",
    },
    MajorCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสสาขาวิชาเรียน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Major.findOne({ where: { MajorCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.MajorID !== data.MajorID) {
                throw new Error("Major Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    MajorName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "สาขาวิชาเรียน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Major.findOne({ where: { MajorName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.MajorID !== data.MajorID) {
                throw new Error("Major Name already in use!");
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
    modelName: "Major",
  }
);

module.exports = Major;
