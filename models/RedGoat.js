const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class RedGoat extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
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

RedGoat.init(
  {
    RedGoatID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การบันทีกโครงการแพะแดง",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    RedGoatRound: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      comment: "รอบการบันทึก , 1 = รอบ 1 เดือน, 2 = รอบ 1 ปี",
    },
    RedGoatDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่บันทึก",
    },
    ShoulderHeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความสูงหัวไหล่(ซม.)",
    },
    ShoulderWidth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความกว้างหัวไหล่(ซม.)",
    },
    BodyLength: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความยาวลำตัว(ซม.)",
    },
    WaistScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความแข็งแรงของหลัง(ส่วนเอว)(คะแนน)",
    },
    PelvisWidth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความกว้างเชิงกราน(ซม.)",
    },
    HipCurve: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "มุมสะโพกมุมเฉียง(ซม.)",
    },
    HipLength: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความยาวสะโพก(ซม.)",
    },
    TestisLength: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "เส้นรอบวงอัณฑะ(ซม.) เฉพาะเพศผู้",
    },
    LegHindScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ลักษณะขาหลังด้านหลัง(คะแนน)",
    },
    LegSideScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ลักษณะขาหลังด้านข้าง(คะแนน)",
    },
    WalkingScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ลักษณะการเดิน(คะแนน)",
    },
    ChestWidth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความกว้างช่องอก(ซม.)",
    },
    BodyDeep: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความลึกลำตัว(ซม.)",
    },
    RibWidth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความกางของกระดูกซี่โครง(คะแนน)",
    },
    BreastFrontScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "การยึดเกาะของเต้านมด้านหน้า(คะแนน) เฉพาะเพศเมีย",
    },
    BreastHeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความสูงของเนื้อเยื่อเต้านมด้านหลัง(ซม.) เฉพาะเพศเมีย",
    },
    BreastWidth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความกว้างของเต้านมด้านหลัง(ซม.) เฉพาะเพศเมีย",
    },
    BreastLigament: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความแข็งแรงของเอ็นยึดเต้านม(ซม.) เฉพาะเพศเมีย",
    },
    BreastDeep: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความลึกของเต้านม(ซม.) เฉพาะเพศเมีย",
    },
    BreastHindScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ตำแหน่งของหัวนมด้านหลัง(คะแนน) เฉพาะเพศเมีย",
    },
    BreastSideScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ตำแหน่งของหัวนมด้านข้าง(คะแนน) เฉพาะเพศเมีย",
    },
    BreastLength: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความยาวของหัวนม(ซม.) เฉพาะเพศเมีย",
    },
    TitsScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ลักษณะของหัวนม(คะแนน) เฉพาะเพศเมีย",
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
    ThaiRedGoatDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.RedGoatDate
          ? dayjs(this.RedGoatDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "RedGoat",
  }
);

module.exports = RedGoat;
