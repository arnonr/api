const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Preset extends Model {
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

Preset.init(
  {
    PresetID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง โปรแกรมเหนี่ยวนำการเป็นสัด",
    },
    PresetCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสโปรแกรมเหนี่ยวนำการเป็นสัด",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Preset.findOne({
            where: { PresetCode: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.PresetID !== data.PresetID) {
                throw new Error("Preset Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    PresetName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อโปรแกรมเหนี่ยวนำการเป็นสัด",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Preset.findOne({
            where: { PresetName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (data && self.PresetID !== data.PresetID) {
                throw new Error("Preset Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    PresetFor: {
      type: DataTypes.ENUM("D", "R", "D,R"),
      allowNull: false,
      comment: "โปรแกรมเหนี่ยวนำการเป็นสัดสำหรับตัวให้หรือตัวรับ",
    },
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "หน่วยงานที่กำหนดโปรแกรม",
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
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Preset",
  }
);

module.exports = Preset;
