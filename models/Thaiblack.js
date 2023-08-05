const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class Thaiblack extends Model {
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

Thaiblack.init(
  {
    ThaiblackID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การบันทีกโครงการ Thaiblack",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    ThaiblackRound: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      comment: "รอบการบันทึก , 1 = 210 วัน,2= 400 วัน, 3= 600 วัน,4= 800 วัน",
    },
    ThaiblackDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่บันทึก",
    },
    Section: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "พื้นที่หน้าตัด(นิ้ว)",
    },
    FatThick: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความหนาไขมัน(T12-13)นิ้ว",
    },
    FatInserted: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ไขมันแทรกเนื้อ(%)",
    },
    FatThickHip: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความหนาไขมันสะโพก(นิ้ว)",
    },
    Height: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความสูง(ซ.ม.)",
    },
    Length: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ความยาว(ซ.ม.)",
    },
    Width: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "รอบอก(ซ.ม.)",
    },
    Weigth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ประมาณน้ำหนัก(กก.)",
    },
    Remark: {
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
    ThaiThaiblackDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.ThaiblackDate
          ? dayjs(this.ThaiblackDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "Thaiblack",
  }
);

module.exports = Thaiblack;
