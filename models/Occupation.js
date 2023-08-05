const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Occupation extends Model {

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Occupation.init(
  {
    OccupationID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง อาชีพ",
    },
    OccupationCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสอาชีพ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Occupation.findOne({ where: { OccupationCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.OccupationID !== data.OccupationID) {
                throw new Error("Occupation Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OccupationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่ออาชีพ (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Occupation.findOne({ where: { OccupationName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.OccupationID !== data.OccupationID) {
                throw new Error("Occupation Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OccupationNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่ออาชีพ (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Occupation.findOne({ where: { OccupationNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.OccupationID !== data.OccupationID) {
                throw new Error("Occupation Name EN already in use!");
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
    modelName: "Occupation",
  }
);

module.exports = Occupation;
