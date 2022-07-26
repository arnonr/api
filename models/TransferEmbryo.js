const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");
const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class TransferEmbryo extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
    this.belongsTo(models.TransferMethod, {
      foreignKey: "TransferMethodID",
    });
    this.belongsTo(models.BCS, {
      foreignKey: "BCSID",
      as: "BCS",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

TransferEmbryo.init(
  {
    TransferEmbryoID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง รหัสอ้างอิง",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    TransferDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่ย้ายฝาก",
    },
    BCSID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงคะแนนร่างกาย",
    },
    CLType: {
      type: DataTypes.ENUM("NO", "WITH"),
      allowNull: true,
      comment:
        "เฉพาะโคเนื้อและกระบือ มีให้เลือก ขนาด CL ตัวเลือกมี CL (no cavity) และ CL (with cavity)",
    },
    CLSize: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะโคเนื้อและกระบือ ขนาด CL ระบุกรณีเลือก CL (with cavity)",
    },
    CavitySize: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment:
        "เฉพาะโคเนื้อและกระบือ ขนาด Cavity ระบุกรณีเลือก CL (with cavity)",
    },
    UterusSide: {
      type: DataTypes.ENUM("L", "R"),
      allowNull: true,
      comment: "ปีกมดลูกข้างที่ย้ายฝาก ตัวเลือกมี ข้างซ้าย และ ข้างขวา",
    },
    EmbryoNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "หมายเลขตัวอ่อน",
    },
    TransferMethodID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "วิธีการย้ายฝาก",
    },
    StandingHeatDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "วันที่เป็นสัด",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ที่ดำเนินการ",
    },
    EstimateBirthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "ประมาณการวันคลอด",
    },
    BirthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันคลอด",
    },
    LeftOvaryAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะแพะ จำนวนรังไข่ข้างซ้าย",
    },
    RightOvaryAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "เฉพาะแพะ จำนวนรังไข่ข้างขวา",
    },
    LeftOvaryGrade: {
      type: DataTypes.ENUM("A", "B", "C"),
      allowNull: true,
      comment: "เฉพาะแพะ เกรดรังไข่ข้างซ้าย",
    },
    RightOvaryGrade: {
      type: DataTypes.ENUM("A", "B", "C"),
      allowNull: true,
      comment: "เฉพาะแพะ เกรดรังไข่ข้างขวา",
    },
    PAR: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ท้องที่",
    },
    TimeNo: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "ครั้งที่ผสม",
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
    ThaiTransferDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.TransferDate
          ? dayjs(this.TransferDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "TransferEmbryo",
  }
);

module.exports = TransferEmbryo;
