const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class BCS extends Model {
  static associate(models) {}

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

BCS.init(
  {
    BCSID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง เลขคะแนนร่างกาย",
    },
    BCSNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "เลขคะแนนร่างกาย",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          BCS.findOne({
            where: { BCSNumber: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.BCSID !== data.BCSID) {
                throw new Error("BCS Number already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    BCSName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายคะแนนร่างกาย",
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
    modelName: "BCS",
  }
);

module.exports = BCS;
