const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class UserToAnimalType extends Model {
  // Custom JSON Response
  static associate(models) {
    // this.belongsTo(models.AnimalType, {
    //   foreignKey: "AnimalTypeID",
    //   // as: "AnimalType",
    // });
    // this.belongsTo(models.Project, {
    //   foreignKey: "ProjectID",
    //   as: "Project",
    // });
  }
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

UserToAnimalType.init(
  {
    UserToAnimalTypeID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    UserID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสผู้ใช้งาน",
    },
    AnimalTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสชนิดสัตว์",
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
      allowNull: true,
      comment: "เลขไอดีอ้างอิง ผู้ใช้งานที่เพิ่มข้อมูล",
    },
    createdAt: {
      field: "CreatedDatetime",
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: "UserToAnimalType",
  }
);

module.exports = UserToAnimalType;
