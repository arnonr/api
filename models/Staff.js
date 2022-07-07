const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Staff extends Model {
  static associate(models) {
    this.belongsTo(models.Title, {
      foreignKey: "StaffTitleID",
      as: "Title",
    });
    this.belongsTo(models.Gender, {
      foreignKey: "StaffGenderID",
      as: "Gender",
    });
    this.belongsTo(models.MarriedStatus, {
      foreignKey: "StaffMarriedStatusID",
      as: "MarriedStatus",
    });
    this.belongsTo(models.Organization, {
      foreignKey: "StaffOrganizationID",
      as: "Organization",
    });
    this.belongsTo(models.PositionType, {
      foreignKey: "StaffPositionTypeID",
      as: "PositionType",
    });
    this.belongsTo(models.Position, {
      foreignKey: "StaffPositionID",
      as: "Position",
    });

    this.belongsTo(models.Tumbol, {
      foreignKey: "StaffTumbolID",
      as: "Tumbol",
    });

    this.belongsTo(models.Amphur, {
      foreignKey: "StaffAmphurID",
      as: "Amphur",
    });

    this.belongsTo(models.Province, {
      foreignKey: "StaffProvinceID",
      as: "Province",
    });

    this.belongsTo(models.Education, {
      foreignKey: "StaffEducationID",
      as: "Education",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      Title: this.get().Title
        ? {
            // TitleID: this.get().Title.TitleID,
            TitleCode: this.get().Title.TitleCode,
            TitleName: this.get().Title.TitleName,
            TitleShortName: this.get().Title.TitleShortName,
            TitleNameEN: this.get().Title.TitleNameEN,
            TitleShortNameEN: this.get().Title.TitleShortNameEN,
          }
        : "",
      Gender: this.get().Gender
        ? {
            // GenderID: this.get().Gender.GenderID,
            GenderCode: this.get().Gender.GenderCode,
            GenderName: this.get().Gender.GenderName,
            GenderNameEN: this.get().Gender.GenderNameEN,
          }
        : "",
      MarriedStatus: this.get().MarriedStatus
        ? {
            // GenderID: this.get().Gender.GenderID,
            MarriedStatusCode: this.get().MarriedStatus.MarriedStatusCode,
            MarriedStatusName: this.get().MarriedStatus.MarriedStatusName,
          }
        : "",
      Organization: this.get().Organization
        ? {
            OrganizationCode: this.get().Organization.OrganizationCode,
            OrganizationName: this.get().Organization.OrganizationName,
          }
        : "",
      PositionType: this.get().PositionType
        ? {
            PositionTypeCode: this.get().PositionType.PositionTypeCode,
            PositionTypeName: this.get().PositionType.PositionTypeName,
          }
        : "",
      Position: this.get().Position
        ? {
            PositionCode: this.get().Position.PositionCode,
            PositionName: this.get().Position.PositionName,
          }
        : "",
      Tumbol: this.get().Tumbol
        ? {
            TumbolCode: this.get().Tumbol.TumbolCode,
            TumbolName: this.get().Tumbol.TumbolName,
          }
        : "",

      Amphur: this.get().Amphur
        ? {
            AmphurCode: this.get().Amphur.AmphurCode,
            AmphurName: this.get().Amphur.AmphurName,
          }
        : "",
      Province: this.get().Province
        ? {
            ProvinceCode: this.get().Province.ProvinceCode,
            ProvinceName: this.get().Province.ProvinceName,
          }
        : "",

      Education: this.get().Education
        ? {
            EducationCode: this.get().Education.EducationCode,
            EducationName: this.get().Education.EducationName,
            EducationNameEN: this.get().Education.EducationNameEN,
          }
        : "",
    };
  }
}

Staff.init(
  {
    StaffID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    StaffNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสบุคลากร",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Staff.findOne({ where: { StaffNumber: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.StaffID !== data.StaffID) {
                throw new Error("Staff Number already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    StaffIdentificationNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "หมายเลขประจำตัวประชาชน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Staff.findOne({
            where: { StaffIdentificationNumber: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.StaffID !== data.StaffID) {
                throw new Error("Staff IdentificationNumber already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    StaffTitleID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "คำนำหน้าชื่อ",
    },
    StaffGivenName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อ",
    },
    StaffSurname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "นามสกุล",
    },
    StaffGenderID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เพศ",
    },
    StaffBirthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันเกิด",
    },
    StaffMarriedStatusID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "สถานะการสมรส",
    },
    StaffOrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสหน่วยงานที่สังกัด",
    },
    StaffPositionTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ประเภทบุคลากร",
    },
    StaffPositionID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ตำแหน่งงาน",
    },
    StaffResponsible: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หน้าที่ความรับผิดชอบ",
    },
    StaffStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่เริ่มงาน",
    },
    StaffEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่สิ้นสุดการทำงาน",
    },
    StaffAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "เลขที่บ้าน",
    },
    StaffMoo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมู่ที่",
    },
    StaffVillageName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อหมู่บ้าน/อาคาร",
    },
    StaffFloor: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชั้น",
    },
    StaffStreet: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ถนน",
    },
    StaffSubLane: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ตรอก",
    },
    StaffLane: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ซอย",
    },
    StaffTumbolID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ตำบล/แขวง",
    },
    StaffAmphurID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "อำเภอ/เขต",
    },
    StaffProvinceID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จังหวัด",
    },
    StaffZipCode: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "รหัสไปรษณีย์",
    },
    StaffEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "อีเมล",
    },
    StaffTelephone: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์",
    },
    StaffMobilePhone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "หมายเลขโทรศัพท์มือถือ",
    },
    StaffFax: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรสาร",
    },
    StaffIDLine: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ไอดีไลน์",
    },
    StaffEducationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสระดับการศึกษา",
    },
    StaffMajorID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสาขาวิชา",
    },
    StaffGraduatedYear: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ปีที่สำเร็จการศึกษา",
    },
    StaffImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "URL รูปภาพ",
    },
    RemoveDatetime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่ลบ",
    },
    RemoveByStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ลบโดย",
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
    modelName: "Staff",
  }
);

module.exports = Staff;
