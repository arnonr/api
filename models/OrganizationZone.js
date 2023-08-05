const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class OrganizationZone extends Model {
  static associate(models) {
    // this.belongsTo(models.Region, { foreignKey: "AIZoneID", as: "AIZone" });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

OrganizationZone.init(
  {
    OrganizationZoneID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง เขตปศุสัตว์",
    },
    OrganizationZoneCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสเขตปศุสัตว์",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          OrganizationZone.findOne({ where: { OrganizationZoneCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.OrganizationZoneID !== data.OrganizationZoneID) {
                throw new Error("OrganizationZone Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    OrganizationZoneName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อเขตปศุสัตว์",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          OrganizationZone.findOne({ where: { OrganizationZoneName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.OrganizationZoneID !== data.OrganizationZoneID) {
                throw new Error("OrganizationZone Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
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
    timestamps: false,
    freezeTableName: true,
    modelName: "OrganizationZone",
  }
);

module.exports = OrganizationZone;
