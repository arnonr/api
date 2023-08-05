const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Tumbol extends Model {
  static associate(models) {
    this.belongsTo(models.Province, {
      foreignKey: "ProvinceID",
      as: "Province",
    });
    this.belongsTo(models.Amphur, {
      foreignKey: "AmphurID",
      as: "Amphur",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      Province: this.get().Province
        ? {
            ProvinceID: this.get().Province.ProvinceID,
            ProvinceCode: this.get().Province.ProvinceCode,
            ProvinceName: this.get().Province.ProvinceName,
            ProvinceNameEN: this.get().Province.ProvinceNamEN,
          }
        : "",
      Amphur: this.get().Amphur
        ? {
            AmphurID: this.get().Amphur.AmphurID,
            AmphurCode: this.get().Amphur.AmphurCode,
            AmphurName: this.get().Amphur.AmphurName,
            AmphurNameEN: this.get().Amphur.AmphurNamEN,
          }
        : "",
    };
  }
}

Tumbol.init(
  {
    TumbolID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง ตำบล",
    },
    TumbolCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสตำบล",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Tumbol.findOne({ where: { TumbolCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.TumbolID !== data.TumbolID) {
                throw new Error("Tumbol Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    TumbolName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อตำบล (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Tumbol.findOne({ where: { TumbolName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.TumbolID !== data.TumbolID) {
                throw new Error("Tumbol Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    TumbolNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อตำบล (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Tumbol.findOne({ where: { TumbolNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.TumbolID !== data.TumbolID) {
                throw new Error("Tumbol Name EN already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    Zipcode: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "รหัสไปรษณีย์",
    },
    AmphurID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงอำเภอ",
    },
    ProvinceID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงจังหวัด",
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
    modelName: "Tumbol",
  }
);

module.exports = Tumbol;
