const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class GiveBirth extends Model {
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
    this.belongsTo(models.GiveBirthHelp, {
      foreignKey: "GiveBirthHelpID",
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

GiveBirth.init(
  {
    GiveBirthID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การคลอด",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    AIID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
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
    GiveBirthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่คลอด",
    },
    Amount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "จำนวนที่คลอด (ตัว)",
    },
    GiveBirthState: {
      type: DataTypes.ENUM("NORMAL","DIFFICULT ","SLINK"),
      // type: DataTypes.ENUM("NORMAL","DIFFICULT ","SLINK"),
      allowNull: true,
      comment:
        "ภาวะการคลอด NORMAL - คลอดปกติ DIFFICULT - คลอดยาก SLINK - คลอดก่อนกำหนด",
    },
    GiveBirthHelpID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสวิธีการช่วยคลอด",
    },
    PregnancyDay: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "ระยะการตั้งท้อง (วัน)",
    },
    PAR: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "ท้องที่",
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
      comment: "ระยะการคลอด (วัน)",
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
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "GiveBirth",
  }
);

module.exports = GiveBirth;
