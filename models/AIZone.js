const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class AIZone extends Model {
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

AIZone.init(
  {
    AIZoneID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ศูนย์วิจัยผสมเทียมและเทคโนโลยีชีวภาพ",
    },
    AIZoneCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสศูนย์วิจัยผสมเทียมและเทคโนโลยีชีวภาพ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          AIZone.findOne({ where: { AIZoneCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.AIZoneID !== data.AIZoneID) {
                throw new Error("AIZone Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AIZoneName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อศูนย์วิจัยผสมเทียมและเทคโนโลยีชีวภาพ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          AIZone.findOne({ where: { AIZoneName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.AIZoneID !== data.AIZoneID) {
                throw new Error("AIZone Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AIZoneENCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสออกบัตรเจ้าหน้าที่ผสมเทียม",
    //   validate: {
    //     isUnique: function (value, next) {
    //       let self = this;
    //       AIZone.findOne({ where: { AIZoneENCode: value, isRemove: 0 } })
    //         .then(function (data) {
    //           if (data && self.AIZoneENCode !== data.AIZoneENCode) {
    //             throw new Error("AIZoneENCode already in use!");
    //           }
    //           return next();
    //         })
    //         .catch(function (err) {
    //           return next(err);
    //         });
    //     },
    //   },
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
    modelName: "AIZone",
  }
);

module.exports = AIZone;
