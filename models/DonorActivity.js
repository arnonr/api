const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class DonorActivity extends Model {
  static associate(models) {
    this.belongsTo(models.Donor, {
      foreignKey: "DonorID",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });
    this.belongsTo(models.PresetActivity, {
      foreignKey: "PresetActivityID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
    
    this.belongsTo(models.Staff, {
      foreignKey: "ExcludeResponsibilityStaffID",
      as: "ExcludeResponsibility",
    });

    this.belongsTo(models.Animal, {
      foreignKey: "BreederAnimalID",
      as: "BreederAnimal",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

DonorActivity.init(
  {
    DonorActivityID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    DonorID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงโปรแกรมตัวให้",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    ActivityDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่",
    },
    Day: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "วัน",
    },
    Time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: "เวลา",
    },
    PresetActivityID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "กิจกรรม",
    },
    WorkActivityDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ปฏิบัติงานจริง",
    },
    WorkTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "เวลาปฏิบัติงานจริง",
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รายละเอียดกิจกรรม",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ที่ดำเนินการ",
    },
    IsDone: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "0=ยังไม่ดำเนินการ, 1=ดำเนินการแล้ว",
    },
    SemenID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงน้ำเชื้อ",
    },
    IsExclude: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "0=อยู่ในโปรแกรม, 1=คัดออก",
    },
    ExcludeRemark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "เหตุผลที่คัดออก (ถ้ามี)",
    },
    ExcludeDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่คัดออก",
    },
    ExcludeResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสเจ้าหน้าที่ที่ดำเนินการคัดออก",
    },
    GoatAIMethodID: {
      type: DataTypes.ENUM("NI", "Buck", "VAI", "LAI"),
      allowNull: true,
      comment: "วิธีการผสม NI, Buck, V-AI, L-AI",
    },
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
    //
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
    ThaiActivityDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.ActivityDate
          ? dayjs(this.ActivityDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiWorkActivityDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.WorkActivityDate
          ? dayjs(this.WorkActivityDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiExcludeDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.ExcludeDate
          ? dayjs(this.ExcludeDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "DonorActivity",
  }
);

module.exports = DonorActivity;
