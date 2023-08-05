const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class CureActivity extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
      as: "Animal"
    });
    this.belongsTo(models.Disease, {
      foreignKey: "DiseaseID",
    });

    this.belongsTo(models.CureMethod, {
      foreignKey: "CureMethodID",
    });

    this.belongsToMany(models.Vaccine, {
      through: models.CAToVC,
      // foreignKey: "CureActivityID",
    });

    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });

    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
    });

    // VaccineID
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

CureActivity.init(
  {
    CureActivityID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    CureActivityDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่บันทึกการรักษา",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงสัตว์",
    },
    DiseaseID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงโรคที่ตรวจ",
    },
    CureMethodID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงวิธีการรักษา",
    },
    CureMethodOther: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "วิธีรักษา (อื่น ๆ)",
    },
    CureNextDateOption: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "นัดตรวจครั้งถัดไป 1 เดือน 2 เดือน 3 เดือน 6 เดือน",
    },
    CureNextDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment:
        "สามารถระบุเอง ถ้าระบุ dropdown CureNextDateOption ให้คำนวณวันขึ้นมาให้",
    },
    VaccineID: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "รหัสอ้างอิงวัคซีน/ยารักษาโรค ARRAY",
    },
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "หน่วยงานที่ตรวจ",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ตรวจ",
    },
    Remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "หมายเหตุอาการ/ผลการตรวจ (ถ้ามี)",
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
    ThaiCureActivityDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.CureActivityDate
          ? dayjs(this.CureActivityDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
    ThaiCureNextDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.CureNextDate
          ? dayjs(this.CureNextDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "CureActivity",
  }
);

module.exports = CureActivity;
