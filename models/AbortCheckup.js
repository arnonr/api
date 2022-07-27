const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class AbortCheckup extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
    this.belongsTo(models.AI, {
      foreignKey: "AIID",
    });
    this.belongsTo(models.TransferEmbryo, {
      foreignKey: "TransferEmbryoID",
    });
    this.belongsTo(models.AbortResult, {
      foreignKey: "AbortResultID",
    });
    this.belongsTo(models.Staff, {
      foreignKey: "RemoveByStaffID",
      as: "RemoveBy",
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

AbortCheckup.init(
  {
    AbortCheckupID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การแท้ง",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    AIID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงการผสมเทียม",
    },
    TransferEmbryoID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงการย้ายฝากตัวอ่อน",
    },
    NormalBreedingID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงกรณีผสมพันธุ์ตามธรรมชาติ",
    },

    AbortDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่แท้ง",
    },

    AbortResultID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสลักษณะการแท้ง",
    },
    BCSID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงคะแนนร่างกาย",
    },  
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ผู้ตรวจ",
    },
    Remark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ (ถ้ามี)",
    },
    AbortDay: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ระยะการแท้ง (วัน)",
    },
    PAR: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    ThaiAbortDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.AbortDate
          ? dayjs(this.AbortDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "AbortCheckup",
  }
);

module.exports = AbortCheckup;
