const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Farmer extends Model {
  static associate(models) {
    this.belongsTo(models.Title, {
      foreignKey: "TitleID",
      as: "Title",
    });
    this.belongsTo(models.Gender, {
      foreignKey: "GenderID",
      as: "Gender",
    });

    this.belongsTo(models.Occupation, {
      foreignKey: "MainOccupationID",
      as: "Occupation",
    });

    this.belongsTo(models.Occupation, {
      foreignKey: "SecondOccupationID",
      as: "SecondOccupation",
    });

    this.belongsTo(models.Tumbol, {
      foreignKey: "HouseTumbolID",
      as: "Tumbol",
    });
    this.belongsTo(models.Amphur, {
      foreignKey: "HouseAmphurID",
      as: "Amphur",
    });
    this.belongsTo(models.Province, {
      foreignKey: "HouseProvinceID",
      as: "Province",
    });

    this.belongsTo(models.Tumbol, {
      foreignKey: "ResidenceTumbolID",
      as: "ResidenceTumbol",
    });
    this.belongsTo(models.Amphur, {
      foreignKey: "ResidenceAmphurID",
      as: "ResidenceAmphur",
    });
    this.belongsTo(models.Province, {
      foreignKey: "ResidenceProvinceID",
      as: "ResidenceProvince",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Farmer.init(
  {
    FarmerID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ฟาร์ม",
    },
    FarmerNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "เลขทะเบียนเกษตรกร",
      // validate: {
      //   isUnique: function (value, next) {
      //     let self = this;
      //     Farmer.findOne({
      //       where: { FarmerNumber: value, isRemove: 0 },
      //     })
      //       .then(function (data) {
      //         if (data && self.FarmerID !== data.FarmerID) {
      //           throw new Error("FarmerNumber Code already in use!");
      //         }
      //         return next();
      //       })
      //       .catch(function (err) {
      //         return next(err);
      //       });
      //   },
      // },
    },
    IdentificationNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "เลขประจำตัวบุคคล",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Farmer.findOne({
            where: { IdentificationNumber: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.FarmerID !== data.FarmerID) {
                throw new Error("IdentificationNumber Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    FarmerTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "1 = เกษตกรทั่วไป, 2 = นิติบุคคล, 3 = หน่วยงาน",
    },
    TitleID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "คำนำหน้าชื่อ",
    },
    GivenName: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "ชื่อ",
    },
    MiddleName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ชื่อกลาง",
    },
    Surname: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "นามสกุล",
    },
    GenderID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เพศ",
    },
    BirthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันเกิด",
    },
    TelephoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์",
    },
    MobilePhoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "หมายเลขโทรศัพท์มือถือ",
    },
    EducationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ระดับการศึกษา",
    },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "อีเมล",
    },
    IDLine: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ID Line",
    },
    MainOccupationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "อาชีพหลัก",
    },

    SecondOccupationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "อาชีพรอง",
    },

    HouseBuildingNumber: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "เลขที่บ้าน (ที่อยู่ตามทะเบียนบ้าน)",
    },

    HouseMoo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "หมู่ที่",
    },
    HouseVillageName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ชื่อหมู่บ้าน/อาคาร",
    },

    HouseFloor: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ชั้น",
    },

    HouseStreet: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ถนน",
    },
    HouseSubLane: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ตรอก",
    },

    HouseLane: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ซอย",
    },

    HouseTumbolID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ตำบล/แขวง",
    },
    HouseAmphurID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "อำเภอ/เขต",
    },
    HouseProvinceID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จังหวัด",
    },
    HouseZipCode: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสไปรษณีย์",
    },
    HouseAddressIdentification: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "เลขรหัสประจำบ้าน",
    },
    HouseLatitude: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ละติจูด",
    },
    HouseLongitude: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ลองจิจูด",
    },

    //
    ResidenceBuildingNumber: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "เลขที่บ้าน (ที่อยู่ตามทะเบียนบ้าน)",
    },

    ResidenceMoo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "หมู่ที่",
    },
    ResidenceVillageName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ชื่อหมู่บ้าน/อาคาร",
    },

    ResidenceFloor: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ชั้น",
    },

    ResidenceStreet: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ถนน",
    },
    ResidenceSubLane: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ตรอก",
    },

    ResidenceLane: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "ซอย",
    },

    ResidenceTumbolID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ตำบล/แขวง",
    },
    ResidenceAmphurID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "อำเภอ/เขต",
    },
    ResidenceProvinceID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จังหวัด",
    },
    ResidenceZipCode: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสไปรษณีย์",
    },
    ResidenceAddressIdentification: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "เลขรหัสประจำบ้าน",
    },
    //
    FarmerRegisterStatus: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment:
        "สถานะการขึ้นทะเบียนเกษตรกร 0=ยังไม่ขึ้นทะเบียน, 2=ขึ้นทะเบียนแล้ว",
    },
    FarmerRegisterDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่ขึ้นทะเบียน",
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
    FullName: {
      type: DataTypes.VIRTUAL,
      get() {
        let fullname = this.GivenName + " " + this.Surname;
        return fullname.trim();
      },
    },
    FarmerPIDType: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "เลขไอดีอ้างอิงประเทบัตร 1= เลขบัตรประชาชน, 2= เลขหนังสือเดินทาง,3 = เลขประจำตัวคนต่างด้าว",
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "Farmer",
  }
);

module.exports = Farmer;
