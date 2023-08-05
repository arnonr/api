const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");
const Province = require("./Province");
class Amphur extends Model {
  static associate(models) {
    this.belongsTo(models.Province, {
      foreignKey: "ProvinceID",
      as: "Province",
    });
  }

  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      Province: this.get().Province
        ? 
        {
            ProvinceID: this.get().Province.ProvinceID,
            ProvinceCode: this.get().Province.ProvinceCode,
            ProvinceName: this.get().Province.ProvinceName,
            ProvinceNameEN: this.get().Province.ProvinceNamEN,
            Region: this.get().Province.Region
              ? {
                  RegionID: this.get().Province.Region.RegionID,
                //   RegionCode: this.get().Region.RegionCode,
                //   RegionName: this.get().Region.RegionName,
                //   RegionNameEN: this.get().Region.RegionNameEN,
                }
              : "",
          }
        : "",
    };
  }
}

Amphur.init(
  {
    AmphurID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง อำเภอ",
    },
    AmphurCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสอำเภอ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Amphur.findOne({ where: { AmphurCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.AmphurID !== data.AmphurID) {
                throw new Error("Amphur Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AmphurName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่ออำเภอ (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Amphur.findOne({ where: { AmphurName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.AmphurID !== data.AmphurID) {
                throw new Error("Amphur Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    AmphurNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่ออำเภอ (ภาษาอังกฤษ)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Amphur.findOne({ where: { AmphurNameEN: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.AmphurID !== data.AmphurID) {
                throw new Error("Amphur Name EN already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
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
    modelName: "Amphur",
  }
);

module.exports = Amphur;
