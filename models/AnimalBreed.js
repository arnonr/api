const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class AnimalBreed extends Model {
  static associate(models) {
    this.belongsTo(models.AnimalType, {
      foreignKey: "AnimalTypeID",
      as: "AnimalType",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

AnimalBreed.init(
  {
    AnimalBreedID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง สายพันธุ์",
    },
    AnimalBreedCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสสายพันธุ์",
      // validate: {
      //   isUnique: function (value, next) {
      //     let self = this;
      //     AnimalBreed.findOne({ where: { AnimalBreedCode: value, isRemove: 0 } })
      //       .then(function (data) {
      //         console.log(self);
      //         if (data && self.AnimalBreedID !== data.AnimalBreedID) {
      //           throw new Error("AnimalBreed Code already in use!");
      //         }
      //         return next();
      //       })
      //       .catch(function (err) {
      //         return next(err);
      //       });
      //   },
      // },
    },
    AnimalBreedShortName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อย่อสายพันธุ์",
      // validate: {
      //   isUnique: function (value, next) {
      //     let self = this;
      //     AnimalBreed.findOne({ where: { AnimalBreedShortName: value, isRemove: 0 } })
      //       .then(function (data) {
      //         if (data && self.AnimalBreedID !== data.AnimalBreedID) {
      //           throw new Error("AnimalBreed Short Name already in use!");
      //         }
      //         return next();
      //       })
      //       .catch(function (err) {
      //         return next(err);
      //       });
      //   },
      // },
    },
    AnimalBreedName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "คำอธิบายสายพันธุ์ (ภาษาไทย)",
      // validate: {
      //   isUnique: function (value, next) {
      //     let self = this;
      //     AnimalBreed.findOne({ where: { AnimalBreedName: value, isRemove: 0 } })
      //       .then(function (data) {
      //         if (data && self.AnimalBreedID !== data.AnimalBreedID) {
      //           throw new Error("AnimalBreed Name already in use!");
      //         }
      //         return next();
      //       })
      //       .catch(function (err) {
      //         return next(err);
      //       });
      //   },
      // },
    },

    AnimalBreedNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "คำอธิบายสายพันธุ์ (ภาษาอังกฤษ)",
      // validate: {
      //   isUnique: function (value, next) {
      //     let self = this;
      //     AnimalBreed.findOne({ where: { AnimalBreedNameEN: value, isRemove: 0 } })
      //       .then(function (data) {
      //         if (data && self.AnimalBreedID !== data.AnimalBreedID) {
      //           throw new Error("AnimalBreed Name EN already in use!");
      //         }
      //         return next();
      //       })
      //       .catch(function (err) {
      //         return next(err);
      //       });
      //   },
      // },
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
    modelName: "AnimalBreed",
  }
);

module.exports = AnimalBreed;
