const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Group extends Model {
  static associate(models) {
    this.hasMany(models.User, {
      foreignKey: "GroupID",
      as: "User",
    });
    this.hasMany(models.GroupAuthorize, {
      foreignKey: "GroupID",
      as: "GroupAuthorize",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Group.init(
  {
    GroupID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง กลุ่มผู้ใช้งาน",
    },
    GroupCode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "รหัสกลุ่มผู้้ใช้งาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Group.findOne({ where: { GroupCode: value, isRemove: 0 } })
            .then(function (group) {
              if (group && self.GroupID !== group.GroupID) {
                throw new Error("Group Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    GroupName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อกลุ่มผู้ใช้งาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Group.findOne({ where: { GroupName: value, isRemove: 0 } })
            .then(function (group) {
              if (group && self.GroupID !== group.GroupID) {
                throw new Error("Group Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    GroupDescription: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "คำอธิบายกลุ่มผู้ใช้งาน",
    },
    DataAccessLevelID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ระดับการเข้าถึงข้อมูล",
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
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Group",
  }
);

module.exports = Group;
