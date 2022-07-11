const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class GoatEstralActivity extends Model {
  static associate(models) {}

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

GoatEstralActivity.init(
  {
    GoatEstralActivityID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง การเป็นสัดของแพะ",
    },
    GoatEstralActivityCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสการเป็นสัดของแพะ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          GoatEstralActivity.findOne({
            where: { GoatEstralActivityCode: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.GoatEstralActivityID !== data.GoatEstralActivityID) {
                throw new Error("GoatEstralActivity Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    GoatEstralActivityName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายการเป็นสัด",
    },
    Remark: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเหตุ",
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
    modelName: "GoatEstralActivity",
  }
);

module.exports = GoatEstralActivity;
