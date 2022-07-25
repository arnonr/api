const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class AI extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
    this.belongsTo(models.Project, {
      foreignKey: "ProjectID",
    });
    this.belongsTo(models.Semen, {
      foreignKey: "SemenID",
    });
    this.belongsTo(models.GoatEstralActivity, {
      foreignKey: "GoatEstralActivityID",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "BreederAnimalID",
      as: "BreederAnimal",
    });
    this.belongsTo(models.GunDepth, {
      foreignKey: "GunDepthID1",
      as: "GunDepth1",
    });
    this.belongsTo(models.GunDepth, {
      foreignKey: "GunDepthID2",
      as: "GunDepth2",
    });
    this.belongsTo(models.GunDepth, {
      foreignKey: "GunDepthID3",
      as: "GunDepth3",
    });
    this.belongsTo(models.GunDepth, {
      foreignKey: "GunDepthID4",
      as: "GunDepth4",
    });
    this.belongsTo(models.GunDepth, {
      foreignKey: "GunDepthID5",
      as: "GunDepth5",
    });
    this.belongsTo(models.BCS, {
      foreignKey: "BCSID",
      as: "BCS",
    });

    this.hasMany(models.PregnancyCheckup, {
      foreignKey: "AIID",
    });

    this.hasOne(models.GiveBirth, {
      foreignKey: "AIID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

AI.init(
  {
    AIID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การผสมเทียม",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงสัตว์",
    },
    TimeNo: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ครั้งที่ผสม",
    },
    AIDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ผสม (เฉพาะโค กระบือ)",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ผสมเทียม",
    },
    ProjectID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสโครงการ",
    },
    SemenID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสน้ำเชื้อ",
    },
    EstimateBirthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ประมาณการวันคลอด",
    },
    AIStatus: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "สถานะของการผสมเทียม,0 = รอผล,1 = สำเร็จ,2 = ไม่สำเร็จ",
    },
    Dose: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "โด๊ส",
    },
    BirthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันคลอด",
    },
    GoatAIMethodID: {
      type: DataTypes.ENUM("NI", "Buck", "V-AI", "L-AI"),
      allowNull: true,
      comment: "วิธีการผสม (แพะ)",
    },
    GoatEstralActivityID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "โปรแกรมการเป็นสัด (เฉพาะแพะ)",
    },
    // PresetActivityID: {
    //   type: DataTypes.INTEGER(11),
    //   allowNull: true,
    //   comment: "โปรแกรมการเป็นสัด (เฉพาะแพะ)",
    // },
    BreederAnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงพ่อพันธุ์",
    },
    InseminationTime: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวนครั้งที่ผสม (ครั้ง)",
    },
    AIDate1: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ผสมครั้งที่ 1 (เฉพาะแพะ)",
    },
    AITime1: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "เวลาที่ผสมครั้งที่ 1 (เฉพาะแพะ)",
    },
    SemenLot1: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชุดน้ำเชื้อ 1 (เฉพาะแพะ)",
    },
    MucilageQuantity1: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "ปริมาณเมือก 1 (เฉพาะแพะ)1 = มาก, 2 = น้อย",
    },
    MucilageQuality1: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "สีของเมือก 1 (เฉพาะแพะ) 1 = ขุ่น 2 = ใส",
    },
    GunDepthID1: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ปืนสอดลึก 1 (เฉพาะแพะ)",
    },
    SemenEnter1: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "น้ำเชื้อเข้า 1 (เฉพาะแพะ) 1 = 100% 2 = ย้อนกลับ",
    },
    // 2
    AIDate2: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ผสมครั้งที่ 2 (เฉพาะแพะ)",
    },
    AITime2: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "เวลาที่ผสมครั้งที่ 2 (เฉพาะแพะ)",
    },
    SemenLot2: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชุดน้ำเชื้อ 2 (เฉพาะแพะ)",
    },
    MucilageQuantity2: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "ปริมาณเมือก 2 (เฉพาะแพะ)1 = มาก, 2 = น้อย",
    },
    MucilageQuality2: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "สีของเมือก 2 (เฉพาะแพะ) 1 = ขุ่น 2 = ใส",
    },
    GunDepthID2: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ปืนสอดลึก 2 (เฉพาะแพะ)",
    },
    SemenEnter2: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "น้ำเชื้อเข้า 2 (เฉพาะแพะ) 1 = 100% 2 = ย้อนกลับ",
    },
    //3
    AIDate3: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ผสมครั้งที่ 3 (เฉพาะแพะ)",
    },
    AITime3: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "เวลาที่ผสมครั้งที่ 3 (เฉพาะแพะ)",
    },
    SemenLot3: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชุดน้ำเชื้อ 3 (เฉพาะแพะ)",
    },
    MucilageQuantity3: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "ปริมาณเมือก 3 (เฉพาะแพะ)1 = มาก, 2 = น้อย",
    },
    MucilageQuality3: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "สีของเมือก 3 (เฉพาะแพะ) 1 = ขุ่น 2 = ใส",
    },
    GunDepthID3: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ปืนสอดลึก 3 (เฉพาะแพะ)",
    },
    SemenEnter3: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "น้ำเชื้อเข้า 3 (เฉพาะแพะ) 1 = 100% 2 = ย้อนกลับ",
    },
    //4
    AIDate4: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ผสมครั้งที่ 4 (เฉพาะแพะ)",
    },
    AITime4: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "เวลาที่ผสมครั้งที่ 4 (เฉพาะแพะ)",
    },
    SemenLot4: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชุดน้ำเชื้อ 4 (เฉพาะแพะ)",
    },
    MucilageQuantity4: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "ปริมาณเมือก 4 (เฉพาะแพะ)1 = มาก, 2 = น้อย",
    },
    MucilageQuality4: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "สีของเมือก 4 (เฉพาะแพะ) 1 = ขุ่น 2 = ใส",
    },
    GunDepthID4: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ปืนสอดลึก 4 (เฉพาะแพะ)",
    },
    SemenEnter4: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "น้ำเชื้อเข้า 4 (เฉพาะแพะ) 1 = 100% 2 = ย้อนกลับ",
    },

    //5
    AIDate5: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ผสมครั้งที่ 5 (เฉพาะแพะ)",
    },
    AITime5: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "เวลาที่ผสมครั้งที่ 5 (เฉพาะแพะ)",
    },
    SemenLot5: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชุดน้ำเชื้อ 5 (เฉพาะแพะ)",
    },
    MucilageQuantity5: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "ปริมาณเมือก 5 (เฉพาะแพะ)1 = มาก, 2 = น้อย",
    },
    MucilageQuality5: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "สีของเมือก 5 (เฉพาะแพะ) 1 = ขุ่น 2 = ใส",
    },
    GunDepthID5: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ปืนสอดลึก 5 (เฉพาะแพะ)",
    },
    SemenEnter5: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      comment: "น้ำเชื้อเข้า 5 (เฉพาะแพะ) 1 = 100% 2 = ย้อนกลับ",
    },

    BCSID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "คะแนนร่างกาย",
    },
    PAR: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ท้องที่",
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
    ThaiAIDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return dayjs(this.AIDate).locale("th").format("DD/MM/BBBB");
      },
    },
    AIStatusName: {
      type: DataTypes.VIRTUAL,
      get() {
        let text = ["รอผล", "สำเร็จ", "ไม่สำเร็จ"];
        return text[this.AIStatus]
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "AI",
  }
);

module.exports = AI;
