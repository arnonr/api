const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class DewormActivity extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });

    this.belongsTo(models.DewormMedicine, {
      foreignKey: "DewormMedicineID",
    });

    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
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

DewormActivity.init(
  {
    DewormActivityID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },

    DewormActivityDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่ถ่ายพยาธิ",
    },

    AnimalID: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "รหัสสัตว์",
    },
    FarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสฟาร์ม",
    },

    DewormMedicineID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงยาถ่ายพยาธิ",
    },

    DewormNextDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่ถ่ายพยาธิครั้งถัดไป",
    },

    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "หน่วยงานที่ตรวจ",
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
    ThaiDewormActivityDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.DewormActivityDate
          ? dayjs(this.DewormActivityDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiDewormNextDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.DewormNextDate
          ? dayjs(this.DewormNextDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "DewormActivity",
  }
);

module.exports = DewormActivity;
