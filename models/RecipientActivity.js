const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class RecipientActivity extends Model {
  static associate(models) {
    this.belongsTo(models.Recipient, {
      foreignKey: "RecipientID",
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
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

RecipientActivity.init(
  {
    RecipientActivityID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    RecipientID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงโปรแกรมตัวรับ",
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
    modelName: "RecipientActivity",
  }
);

module.exports = RecipientActivity;
