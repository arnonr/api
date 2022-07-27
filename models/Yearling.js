const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class Yearling extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "MotherAnimalID",
      as: "MotherAnimal",
    });
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

Yearling.init(
  {
    YearlingID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ติดตามลูกโคหลังคลอด",
    },
    MotherAnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงสัตว์ตัวแม่",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสัตว์",
    },
    FollowDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ติดตาม",
    },
    Weight: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "น้ำหนัก",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    ThaiFollowDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.FollowDate
          ? dayjs(this.FollowDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Yearling",
  }
);

module.exports = Yearling;
