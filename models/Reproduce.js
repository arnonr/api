const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Reproduce extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });
    this.belongsTo(models.HeatType, {
      foreignKey: "HeatTypeID",
    });
    this.belongsTo(models.HeatCircle, {
      foreignKey: "HeatCircleID",
    });

    this.belongsToMany(models.OvarySymptom, {
      through: models.RpToRightOvarySymptom,
      foreignKey: "ReproduceID",
      as: "RightOvarySymptom",
    });

    this.belongsToMany(models.OvarySymptom, {
      through: models.RpToLeftOvarySymptom,
      foreignKey: "ReproduceID",
      as: "LeftOvarySymptom",
    });
    
    this.belongsToMany(models.VaginaSymptom, {
      through: models.RpToVaginaSymptom,
      foreignKey: "ReproduceID",
      as: "VaginaSymptom",
    });
    this.belongsToMany(models.OtherSymptom, {
      through: models.RpToOtherSymptom,
      foreignKey: "ReproduceID",
      as: "OtherSymptom",
    });

    this.belongsToMany(models.CauseAnimal, {
      through: models.RpToCauseAnimal,
      foreignKey: "ReproduceID",
      as: "CauseAnimal",
    });

    this.belongsToMany(models.CauseEnvironment, {
      through: models.RpToCauseEnvironment,
      foreignKey: "ReproduceID",
      as: "CauseEnvironment",
    });

    this.belongsToMany(models.CauseFeeder, {
      through: models.RpToCauseFeeder,
      foreignKey: "ReproduceID",
      as: "CauseFeeder",
    });

    this.belongsToMany(models.CauseHealth, {
      through: models.RpToCauseHealth,
      foreignKey: "ReproduceID",
      as: "CauseHealth",
    });

    this.belongsToMany(models.CureHormone, {
      through: models.RpToCureHormone,
      foreignKey: "ReproduceID",
      as: "CureHormone",
    });

    this.belongsToMany(models.CureAntibiotic, {
      through: models.RpToCureAntibiotic,
      foreignKey: "ReproduceID",
      as: "CureAntibiotic",
    });

    this.belongsToMany(models.CureVitamin, {
      through: models.RpToCureVitamin,
      foreignKey: "ReproduceID",
      as: "CureVitamin",
    });

    this.belongsToMany(models.ReproduceSuggestion, {
      through: models.RpToRpSuggestion,
      foreignKey: "ReproduceID",
      as: "ReproduceSuggestion",
    });

    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });

    this.belongsTo(models.Staff, {
      foreignKey: "RemoveByStaffID",
      as: "RemoveBy",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Reproduce.init(
  {
    ReproduceID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    StandingHeatDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่เป็นสัด (ในรอบปัจจุบัน)",
    },
    HeatTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "อาการเป็นสัด",
    },
    HeatCircleID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "วงรอบการเป็นสัด",
    },
    FarmerRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "อาการอื่น ๆ ที่เกษตรกรตรวจพบ",
    },
    DiagnoseVulva: {
      type: DataTypes.ENUM("INTUMESCE", "NORMAL"),
      allowNull: true,
      comment: "การวินิจฉัยปากช่องคลอด ตัวเลือกมี บวม และ ไม่บวม",
    },
    DiagnoseVagina: {
      type: DataTypes.ENUM("INTUMESCE", "NORMAL"),
      allowNull: true,
      comment: "การวินิจฉัยช่องคลอด ตัวเลือกมี บวม และ ไม่บวม",
    },
    DiagnoseVaginaMucilage: {
      type: DataTypes.ENUM("YES", "NO"),
      allowNull: true,
      comment:
        "การวินิจฉัยลักษณะเมือกช่องคลอด ตัวเลือกมี มีเมือก และ ไม่มีเมือก",
    },
    CervixSize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "การวินิจฉัยคอมดลูก ขนาด (ซม.)",
    },
    CervixLength: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "การวินิจฉัยคอมดลูก ความยาว (ซม.)",
    },
    CervixType: {
      type: DataTypes.ENUM("CURVE", "NORMAL"),
      allowNull: true,
      comment: "การวินิจฉัยลักษณะคอมดลูก ตัวเลือกมี คด และไม่คด",
    },
    Cervical: {
      type: DataTypes.ENUM("CLOSE", "OPEN"),
      allowNull: true,
      comment: "การวินิจฉัยลักษณะปากมดลูก ตัวเลือกมี ปิด และ เปิด",
    },
    AdnexaSize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "การวินิจฉัยปีกมดลูก ขนาด (ซม.)",
    },
    AdnexaType: {
      type: DataTypes.ENUM("EQUAL", "UNEQUAL"),
      allowNull: true,
      comment: "การวินิจฉัยลักษณะปีกมดลูก ตัวเลือกมี เท่ากัน และ ไม่เท่ากัน",
    },
    AdnexaTone: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "1 = +, 2 = ++, 3 = +++, 4 = ++++",
    },
    LeftOvarySymptomID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงปัญหาที่พบของรังไข่ข้างซ้าย (Array)",
    },
    LeftOvarySymptomRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    //
    RightOvarySymptomID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงปัญหาที่พบของรังไข่ข้างขวา (Array)",
    },
    RightOvarySymptomRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    //
    VaginaSymptomID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงปัญหาที่พบของมดลูก/ช่องคลอด (Array)",
    },
    VaginaSymptomRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    //
    OtherSymptomID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงปัญหาที่พบอื่น ๆ (Array)",
    },
    OtherSymptomRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    //
    CauseAnimalID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สาเหตุโน้มนำด้านตัวสัตว์ (Array)",
    },
    CauseAnimalRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    //
    CauseEnvironmentID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สาเหตุโน้มนำด้านสิ่งแวดล้อม (Array)",
    },
    CauseEnvironmentRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    //
    CauseFeederID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สาเหตุโน้มนำด้านการเลี้ยงและการจัดการ (Array)",
    },
    CauseFeederRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    //
    CauseHealthID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สาเหตุโน้มนำด้านสุขภาพ (Array)",
    },
    CauseHealthRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },

    //
    CureByHormone: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "รักษาโดยฮอร์โมน 1 = checked , 0 = unchecked",
    },
    CureHormoneID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงฮอร์โมน (Array)",
    },
    //
    CureByAntibiotic: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "รักษาโดยยาปฏิชีวนะ 1 = checked , 0 = unchecked",
    },
    CureAntibioticID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงยาปฏิชีวนะ (Array)",
    },
    //
    CureByVitamin: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "รักษาโดยวิตามิน1 = checked , 0 = unchecked",
    },
    CureVitaminID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสอ้างอิงวิตามิน (Array)",
    },
    CureByCleanUterus: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "รักษาโดยชะล้างมดลูก 1 = checked , 0 = unchecked",
    },
    CureCleanUterusRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ ชะล้างมดลูก (ถ้ามี)",
    },
    CureByOther: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "รักษาโดยวิธีอื่น ๆ 1 = checked , 0 = unchecked",
    },
    CureByOtherRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ วิธีอื่น ๆ",
    },
    ReproduceSuggestionID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "คำแนะนำ (Array)",
    },
    ReproduceSuggestionRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },

    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ผู้ตรวจ",
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
    RemoveDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่ลบ",
    },
    RemoveByStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ผู้ลบ",
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
    modelName: "Reproduce",
  }
);

module.exports = Reproduce;
