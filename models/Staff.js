const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");
const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

class Staff extends Model {
  static associate(models) {
    this.belongsTo(models.Title, {
      foreignKey: "StaffTitleID",
      as: "Title",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Gender, {
      foreignKey: "StaffGenderID",
      as: "Gender",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.MarriedStatus, {
      foreignKey: "StaffMarriedStatusID",
      as: "MarriedStatus",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Organization, {
      foreignKey: "StaffOrganizationID",
      as: "Organization",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.PositionType, {
      foreignKey: "StaffPositionTypeID",
      as: "PositionType",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Position, {
      foreignKey: "StaffPositionID",
      as: "Position",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.Tumbol, {
      foreignKey: "StaffTumbolID",
      as: "Tumbol",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.Amphur, {
      foreignKey: "StaffAmphurID",
      as: "Amphur",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.Province, {
      foreignKey: "StaffProvinceID",
      as: "Province",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.Education, {
      foreignKey: "StaffEducationID",
      as: "Education",
      foreignKeyConstraint: true,
    });

    this.hasMany(models.CardRequestLog, {
      foreignKey: "StaffID",
      as: "CardRequestLog",
      foreignKeyConstraint: true,
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
        : null,
      Gender: this.get().Gender
        ? {
            // GenderID: this.get().Gender.GenderID,
            GenderCode: this.get().Gender.GenderCode,
            GenderName: this.get().Gender.GenderName,
            GenderNameEN: this.get().Gender.GenderNameEN,
          }
        : undefined,
      MarriedStatus: this.get().MarriedStatus
        ? {
            // GenderID: this.get().Gender.GenderID,
            MarriedStatusCode: this.get().MarriedStatus.MarriedStatusCode,
            MarriedStatusName: this.get().MarriedStatus.MarriedStatusName,
          }
        : undefined,
      // Organization: this.get().Organization
      //   ? {
      //       OrganizationCode: this.get().Organization.OrganizationCode,
      //       OrganizationName: this.get().Organization.OrganizationName,
      //       // Parent: this.get().Organization.AIZoneID,
      //     }
      //   : undefined,
      PositionType: this.get().PositionType
        ? {
            PositionTypeCode: this.get().PositionType.PositionTypeCode,
            PositionTypeName: this.get().PositionType.PositionTypeName,
          }
        : undefined,
      Position: this.get().Position
        ? {
            PositionCode: this.get().Position.PositionCode,
            PositionName: this.get().Position.PositionName,
          }
        : undefined,
      Tumbol: this.get().Tumbol
        ? {
            TumbolCode: this.get().Tumbol.TumbolCode,
            TumbolName: this.get().Tumbol.TumbolName,
          }
        : undefined,

      Amphur: this.get().Amphur
        ? {
            AmphurCode: this.get().Amphur.AmphurCode,
            AmphurName: this.get().Amphur.AmphurName,
          }
        : undefined,
      Province: this.get().Province
        ? {
            ProvinceCode: this.get().Province.ProvinceCode,
            ProvinceName: this.get().Province.ProvinceName,
          }
        : undefined,

      Education: this.get().Education
        ? {
            EducationCode: this.get().Education.EducationCode,
            EducationName: this.get().Education.EducationName,
            EducationNameEN: this.get().Education.EducationNameEN,
          }
        : undefined,
      Major: this.get().Major
        ? {
            MajorCode: this.get().Major.MajorCode,
            MajorName: this.get().Major.MajorName,
          }
        : undefined,
    };
  }
}

Staff.init(
  {
    StaffID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: true,
      comment: "เลขไอดีอ้างอิง",
    },
    StaffNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสบุคลากร",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Staff.findOne({ where: { StaffNumber: value, isRemove: 0 } })
            .then(function (data) {
              if (
                data &&
                self.StaffID != null &&
                data &&
                self.StaffID !== data.StaffID
              ) {
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
      allowNull: true,
      comment: "หมายเลขประจำตัวประชาชน",
      // validate: {
      //   isUnique: function (value, next) {
      //     let self = this;
      //     Staff.findOne({
      //       where: { StaffIdentificationNumber: value, isRemove: 0 },
      //     })
      //       .then(function (data) {
      //         if (data && self.StaffID !== data.StaffID) {
      //           throw new Error("Staff IdentificationNumber already in use!");
      //         }
      //         return next();
      //       })
      //       .catch(function (err) {
      //         return next(err);
      //       });
      //   },
      // },
    },
    StaffTitleID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "คำนำหน้าชื่อ",
    },
    StaffGivenName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อ",
    },
    StaffSurname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "นามสกุล",
    },
    StaffGenderID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
      allowNull: true,
      comment: "รหัสหน่วยงานที่สังกัด",
    },
    StaffPositionTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ประเภทบุคลากร",
    },
    StaffPositionID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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

    CardStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่ออกบัตร",
    },
    CardExpireDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่หมดอายุบัตร",
    },
    CardStatus: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment:
        "0 = ยกเลิกใช้งาน , 1 = ใช้งานอยู่, 2 = เจ้าหน้าที่ใหม่รอยื่นเรื่อง, 3 = หมดอายุ",
      get() {
        let text = [
          "ยกเลิกใช้งาน",
          "ใช้งานอยู่",
          "เจ้าหน้าที่ใหม่รอยื่นเรื่อง",
          "หมดอายุ",
        ];

        if (this.getDataValue("CardStatus") == null) {
          return text[1];
        }

        return text[this.getDataValue("CardStatus")];
      },
      // set() {

      // },
    },
    StaffStatus: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "สถานะบุคลากร",
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
      allowNull: true,
      comment: "อีเมล",
    },
    StaffTelephone: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์",
    },
    StaffMobilePhone: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์มือถือ",
      // validate: {
      //   isUnique: function (value, next) {
      //     let self = this;
      //     Staff.findOne({ where: { StaffMobilePhone: value, isRemove: 0 } })
      //       .then(function (data) {
      //         if (data && self.StaffID !== data.StaffID) {
      //           throw new Error("StaffMobilePhone Number already in use!");
      //         }
      //         return next();
      //       })
      //       .catch(function (err) {
      //         return next(err);
      //       });
      //   },
      // },
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
      allowNull: true,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
    isRemove: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
      comment: "1 = ถูกลบ",
    },
    CreatedUserID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
    },
    createdAt: {
      field: "CreatedDatetime",
      type: DataTypes.DATE,
      allowNull: true,
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
    isCard: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "1 = เจ้าหน้าที่ทั่วไป / 2 = เจ้าหน้าที่มีบัตร",
    },
    StaffFullName: {
      type: DataTypes.VIRTUAL(DataTypes.STRING),
      get() {
        let StaffNumber = "";
        if (this.StaffNumber != null) {
          StaffNumber = this.StaffNumber;
        }

        let fullname =
          StaffNumber + " " + this.StaffGivenName + " " + this.StaffSurname;
        return fullname.trim();
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Staff",
  }
);

Staff.addHook("beforeUpdate", (staff, options) => {
  let status = staff.CardStatus;
  if (staff.StaffStatus == "ลาออก") {
    status = 0;
  } else if (staff.CardStartDate == null || staff.CardExpireDate == null) {
    status = 2;
  } else if (dayjs(staff.CardExpireDate).isBefore(dayjs()) == true) {
    status = 3;
  } else {
    console.log(dayjs(staff.CardExpireDate).isBefore(dayjs()));
    status = 1;
  }
  staff.CardStatus = status;
});

Staff.addHook("beforeCreate", (staff, options) => {
  let status = staff.CardStatus;
  if (staff.StaffStatus == "ลาออก") {
    status = 0;
  } else if (staff.CardStartDate == null || staff.CardExpireDate == null) {
    status = 2;
  } else if (dayjs(staff.CardExpireDate).isBefore(dayjs()) == true) {
    status = 3;
  } else {
    console.log(dayjs(staff.CardExpireDate).isBefore(dayjs()));
    status = 1;
  }
  staff.CardStatus = status;
});

module.exports = Staff;
