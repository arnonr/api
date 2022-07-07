const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Menu extends Model {
  static associate(models) {
    this.hasMany(models.User, {
      foreignKey: "MenuID",
      as: "User",
    });
    this.hasMany(models.GroupAuthorize, {
      foreignKey: "MenuID",
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

Menu.init(
  {
    MenuID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง เมนู",
    },
    MenuCode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "รหัสเมนู",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Menu.findOne({ where: { MenuCode: value, IsActive: 1 } })
            .then(function (menu) {
              if (menu && self.MenuID !== menu.MenuID) {
                throw new Error("Menu already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    MenuName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อเมนู",
    },
    MenuSequence: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "การเรียงลำดับ",
    },
    IsActive: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    modelName: "Menu",
  }
);

module.exports = Menu;
