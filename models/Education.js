const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Education extends Model {

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Education.init(
  {
    EducationID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ระดับการศึกษา",
    },
    EducationCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสอาชีพ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Education.findOne({ where: { EducationCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.EducationID !== data.EducationID) {
                throw new Error("Education Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    EducationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อระดับการศึกษา (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Education.findOne({ where: { EducationName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.EducationID !== data.EducationID) {
                throw new Error("Education Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    EducationNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อระดับการศึกษา (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Education.findOne({ where: { EducationNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.EducationID !== data.EducationID) {
                throw new Error("Education Name EN already in use!");
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
    modelName: "Education",
  }
);

module.exports = Education;
