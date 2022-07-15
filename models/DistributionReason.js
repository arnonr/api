const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class DistributionReason extends Model {
  static associate(models) {
    this.belongsToMany(models.AnimalType, {
      through: models.DistributionReasonToAnimalType,
      foreignKey: "DistributionReasonID",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

DistributionReason.init(
  {
    DistributionReasonID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "รหัสอ้างอิง",
    },
    DistributionReasonName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "สาเหตุการคัดจำหน่าย",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          DistributionReason.findOne({
            where: { DistributionReasonName: value, isRemove: 0 },
          })
            .then(function (data) {
              if (
                data &&
                self.DistributionReasonID !== data.DistributionReasonID
              ) {
                throw new Error("DistributionReason Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AnimalTypeID: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "รหัสชนิดสัตว์ (Array)",
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
    modelName: "DistributionReason",
  }
);

module.exports = DistributionReason;