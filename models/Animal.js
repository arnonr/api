const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Animal extends Model {
  static associate(models) {
    this.belongsTo(models.AnimalSex, {
      foreignKey: "AnimalSexID",
      as: "AnimalSex",
    });
    this.belongsTo(models.Farm, {
      foreignKey: "FarmID",
      as: "AnimalFarm",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalFatherID",
      as: "AnimalFather",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalMotherID",
      as: "AnimalMother",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID1",
      as: "AnimalBreed1",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID2",
      as: "AnimalBreed2",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID3",
      as: "AnimalBreed3",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID4",
      as: "AnimalBreed4",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID5",
      as: "AnimalBreed5",
    });

    // this.belongsTo(models.BornType, {
    //   foreignKey: "AnimalBornTypeID",
    //   as: "BornType",
    // });

    this.belongsTo(models.Farm, {
      foreignKey: "SourceFarmID",
      as: "SourceFarm",
    });

    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
      as: "Organization",
    });

    this.belongsTo(models.OrganizationZone, {
      foreignKey: "OrganizationZoneID",
      as: "OrganizationZone",
    });

    // Project
    this.belongsToMany(models.Project, {
      through: models.AnimalToProject,
      foreignKey: "AnimalID",
    });

    this.belongsTo(models.AnimalStatus, {
      foreignKey: "AnimalStatusID",
      as: "AnimalStatus",
    });

    this.belongsTo(models.AnimalType, {
      foreignKey: "AnimalTypeID",
      as: "AnimalType",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      AnimalToProject: undefined
    };
  }
}

Animal.init(
  {
    AnimalID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิงสัตว์",
    },
    AnimalIdentificationID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสสัตว์",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({
            where: { AnimalIdentificationID: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.AnimalID !== data.AnimalID) {
                throw new Error("Animal Identification already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalNationalID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสขึ้นทะเบียนสัตว์",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({ where: { AnimalNationalID: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.AnimalID !== data.AnimalID) {
                throw new Error("Animal National ID already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalEarID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสติดใบหู",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({ where: { AnimalEarID: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.AnimalID !== data.AnimalID) {
                throw new Error("Animal Ear ID already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalMicrochip: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสไมโครชิฟ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({ where: { AnimalMicrochip: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.AnimalID !== data.AnimalID) {
                throw new Error("Animal Microchip already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalSexID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเพศ",
    },

    AnimalName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อสัตว์",
    },
    FarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสฟาร์ม",
    },
    AnimalFirstBreed: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "ตั้งต้นสายเลือด",
    },
    AnimalFatherID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสพ่อพันธุ์",
    },
    AnimalMotherID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสแม่พันธุ์",
    },
    AnimalPar: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 1,
      comment: "ท้องที่",
    },
    AnimalBirthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันเดือนปีเกิด",
    },
    AnimalBreedID1: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 1",
    },
    AnimalBreedPercent1: {
      type: DataTypes.FLOAT(),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    AnimalBreedID2: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 2",
    },
    AnimalBreedPercent2: {
      type: DataTypes.FLOAT(),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 2",
    },
    AnimalBreedID3: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 3",
    },
    AnimalBreedPercent3: {
      type: DataTypes.FLOAT(),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 3",
    },
    AnimalBreedID4: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 4",
    },
    AnimalBreedPercent4: {
      type: DataTypes.FLOAT(),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 4",
    },
    AnimalBreedID5: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 5",
    },
    AnimalBreedPercent5: {
      type: DataTypes.FLOAT(),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 5",
    },
    AnimalImagePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "url ภาพประจำตัวสัตว์",
    },
    AnimalBornWeight: {
      type: DataTypes.FLOAT(),
      allowNull: true,
      comment: "น้ำหนักแรกเกิด",
    },
    AnimalBornType: {
      type: DataTypes.ENUM("NORMAL", "AI", "EMBRYO"),
      allowNull: true,
      comment:
        "รูปแบบการเกิด NORMAL - ผสมพันธุ์ปกติ, AI - การผสมเทียม, EMBRYO - ตัวอ่อน",
    },
    AnimalBornTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างกระบวนการเกิด",
    },
    AnimalSource: {
      type: DataTypes.ENUM("BORN", "BUY", "TRANSFER"),
      allowNull: true,
      comment:
        "แหล่งที่มาของสัตว BORN - เกิดในฟาร์ม, BUY - ซื้อมา, TRANSFER - ย้ายมา",
    },
    SourceFarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสฟาร์มต้นทาง",
    },
    SourceText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "แหล่งที่มา (ระบุ)",
    },
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงหน่วยงาน/สถานีที่ฟาร์มสังกัด",
    },
    OrganizationZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงเขตพื้นที่ที่ฟาร์มสังกัด",
    },
    ProjectID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสอ้างอิงโครงการ (Array)",
    },
    AnimalStatusID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "สถานะของสัตว์",
    },
    AnimalAlive: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      comment: "สถานะการมีชีวิต 1 = มีชีวิต 0 = เสียชีวิต",
    },
    AnimalTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสชนิดสัตว์",
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
    modelName: "Animal",
  }
);

module.exports = Animal;
