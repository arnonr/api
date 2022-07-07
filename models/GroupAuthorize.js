const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class GroupAuthorize extends Model {
  static associate(models) {
    this.belongsTo(models.Group, {
      foreignKey: "GroupID",
      as: "Group",
    });
    
    this.belongsTo(models.Menu, {
      foreignKey: "MenuID",
      as: "Menu",
    });
    // this.hasMany(models.GroupAuthorize, {
    //   foreignKey: "GroupID",
    //   as: "GroupAuthorize",
    // });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

GroupAuthorize.init(
  {
    GroupAuthorizeID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง สิทธิ์การใช้งาน",
    },
    GroupID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีอ้างอิง กลุ่มผู้ใช้งาน",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          GroupAuthorize.findOne({
            where: { GroupID: value, MenuID: self.MenuID, IsRemove: 0 },
          })
            .then(function (groupAuthorize) {
              if (
                groupAuthorize &&
                self.GroupAuthorizeID !== groupAuthorize.GroupAuthorizeID
              ) {
                throw new Error("Group & Menu already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    MenuID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "เลขไอดีอ้างอิง เมนู",
    },
    IsAdd: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
    IsUpdate: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
    IsDelete: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
    IsPreview: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
    IsRemove: {
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
    modelName: "GroupAuthorize",
  }
);

module.exports = GroupAuthorize;
