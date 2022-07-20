const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class PresetGoat extends Model {
  static associate(models) {
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
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

PresetGoat.init(
  {
    PresetGoatID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง โปรแกรม",
    },
    PresetGoatCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสโปรแกรม",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          PresetGoat.findOne({
            where: { PresetGoatCode: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.PresetGoatID !== data.PresetGoatID) {
                throw new Error("Preset Goat Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    PresetGoatName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อโปรแกรม",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          PresetGoat.findOne({
            where: { PresetGoatName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.PresetGoatID !== data.PresetGoatID) {
                throw new Error("Preset Goat Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "หน่วยงานที่กำหนดโปรแกรม",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้า",
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
    modelName: "PresetGoat",
  }
);

module.exports = PresetGoat;
