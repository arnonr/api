const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class EmbryoStage extends Model {
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

EmbryoStage.init(
  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง สถานะตัวอ่อน",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อสถานะตัวอ่อน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          EmbryoStage.findOne({ where: { name: value, is_remove: 0 } })
            .then(function (data) {
              if (data && self.id !== data.id) {
                throw new Error("Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    is_alive: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = สามารถย้ายฝากตัวอ่อนได้, 0 = ไม่สามารถย้ายฝากตัวอ่อนได้",
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
    is_remove: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "1 = ถูกลบ",
    },
    created_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
    },
    createdAt: {
      field: "created_datetime",
      type: DataTypes.DATE,
      allowNull: false,
      comment: "วัน-เวลาที่เพิ่มข้อมูล",
    },
    updated_user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่แก้ไขข้อมูลล่าสุด",
    },
    updatedAt: {
      field: "updated_datetime",
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วัน-เวลาที่แก้ไขข้อมูลล่าสุด",
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "embryo_stages",
  }
);

module.exports = EmbryoStage;
