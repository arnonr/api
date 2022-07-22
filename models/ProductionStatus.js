const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class ProductionStatus extends Model {
  static associate(models) {}

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

ProductionStatus.init(
  {
    ProductionStatusID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง สถานภาพการผลิต",
    },
    ProductionStatusCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสวิธีสถานภาพการผลิต",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          ProductionStatusStatus.findOne({
            where: { ProductionStatusCode: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.ProductionStatusID !== data.ProductionStatusID) {
                throw new Error(" ProductionStatus Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    ProductionStatusName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายสถานภาพการผลิต",
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
    modelName: "ProductionStatus",
  }
);

module.exports = ProductionStatus;
