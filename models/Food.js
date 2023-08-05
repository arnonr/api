const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Food extends Model {
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Food.init(
  {
    FoodID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    FoodType: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสประเภทอาหาร (1 ข้น 2 หยาบ)",
    },
    FoodName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่ออาหาร",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Food.findOne({ where: { FoodName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.FoodID !== data.FoodID) {
                throw new Error("Food Name already in use!");
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
    deletedAt: {
      field: "DeletedDatetime",
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่ลบ",
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    paranoid: true,
    modelName: "Food",
  }
);

module.exports = Food;
