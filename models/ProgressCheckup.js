const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class ProgressCheckup extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
      as: "Animal",
    });
    this.belongsTo(models.BCS, {
      foreignKey: "BCSID",
      as: "BCS",
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

ProgressCheckup.init(
  {
    ProgressCheckupID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ติดตามบันทึกการเจริญเติบโต",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสัตว์",
    },
    CheckupDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่ติดตาม",
    },
    BCSID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสคะแนนร่างกาย",
    },
    Weight: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "น้ำหนัก(กก.)",
    },
    ChestWidth: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "ความกว้างอก(ซม.)",
    },
    PerimeterChest: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "รอบอก(ซม.)",
    },
    BodyLength: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "ความยาวลำตัว(ซม.)",
    },
    Height: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "ส่วนสูง(ซม.)",
    },
    PerimeterBall: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เส้นรอบวงอัณฑะ (ซม.) เฉพาะเพศผู้",
    },

    ShoulderHeight: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความสูงหัวไหล่ (ซม.)",
    },
    HipHeight: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความสูงสะโพก (ซม.)",
    },
    HeartGirth: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความยาวรอบอก (ซม.)",
    },
    BodyLength: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความยาวลำตัว (ซม.)",
    },
    ChestDepth: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความลึกช่วงอก (ซม.)",
    },
    ChestWidth: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความกว้างช่วงอก (ซม.)",
    },
    RumpLength: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความยาวสะโพก (ซม.)",
    },
    RumpWidth: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความกว้างช่วงเชิงกราน (ซม.)",
    },
    HipWidth: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความกว้างช่วงสะโพก (ซม.)",
    },
    ShoulderLength: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความยาวหัวไหล่ (ซม.)",
    },
    RearLegLength: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะกระบือ ความยาวโคนขาหลัง (ซม.)",
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
    ThaiCheckupDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.CheckupDate
          ? dayjs(this.CheckupDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "ProgressCheckup",
  }
);

module.exports = ProgressCheckup;
