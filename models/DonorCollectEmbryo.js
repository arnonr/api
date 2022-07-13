const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class DonorCollectEmbryo extends Model {
  static associate(models) {
    this.belongsTo(models.Donor, {
      foreignKey: "DonorID",
    });

    this.belongsTo(models.Animal, {
      foreignKey: "AnimalID",
    });

    this.belongsTo(models.BCS, {
      foreignKey: "BCSID",
      as: "BCS",
    });

    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

DonorCollectEmbryo.init(
  {
    DonorCollectEmbryoID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    DonorID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงโปรแกรมตัวให้",
    },
    AnimalID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสสัตว์",
    },
    CollectDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่เก็บตัวอ่อน",
    },
    BCSID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงคะแนนร่างกาย",
    },
    FollicleLeftAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวน follicle รังไข่ข้างซ้าย",
    },
    FollicleRightAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวน follicle รังไข่ข้างขวา",
    },
    CLLeftAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวน CL รังไข่ข้างซ้าย",
    },
    CLRightAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวน CL รังไข่ข้างซ้าย",
    },
    TransferableAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "จำนวนตัวอ่อนที่สามารถย้ายฝาก",
    },
    NonTransferableAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "จำนวนตัวอ่อนที่ไม่สามารถย้ายฝาก",
    },
    FreezeAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "จำนวนแช่แข็ง",
    },
    TransferAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "จำนวนย้ายฝาก",
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
    modelName: "DonorCollectEmbryo",
  }
);

module.exports = DonorCollectEmbryo;
