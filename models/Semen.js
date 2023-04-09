const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Semen extends Model {
  static associate(models) {
    this.belongsTo(models.Animal, {
      foreignKey: "BreederID",
      as: "Animal",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.AnimalType, {
      foreignKey: "AnimalTypeID",
      as: "AnimalType",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID1",
      as: "AnimalBreed1",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID2",
      as: "AnimalBreed2",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID3",
      as: "AnimalBreed3",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID4",
      as: "AnimalBreed4",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID5",
      as: "AnimalBreed5",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.SourceType, {
      foreignKey: "SourceTypeID",
      as: "SourceType",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Country, {
      foreignKey: "CountryID",
      as: "Country",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Organization, {
      foreignKey: "SourceOrganizationID",
      as: "Organization",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
      as: "Staff",
      foreignKeyConstraint: true,
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Semen.init(
  {
    SemenID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง น้ำเชื้อ",
    },
    SemenNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "หมายเลขน้ำเชื้อ",
    },
    SemenCode: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ชุดน้ำเชื้อ",
    },
    BreederID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "หมายเลขพ่อพันธุ์",
    },
    AnimalTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสชนิดสัตว์",
    },
    AnimalBreedID1: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 1",
    },
    AnimalBreedPercent1: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    AnimalBreedID2: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 1",
    },
    AnimalBreedPercent2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    AnimalBreedID3: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 1",
    },
    AnimalBreedPercent3: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    AnimalBreedID4: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 1",
    },
    AnimalBreedPercent4: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    AnimalBreedID5: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 1",
    },
    AnimalBreedPercent5: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    SourceTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสแหล่งที่มา",
    },
    CountryID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสประเทศ (กรณีแหล่งที่มาต่างประเทศ)",
    },
    SourceName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "แหล่งที่มา (กรณีเป็นอื่น ๆ)",
    },
    SourceOrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "แหล่งที่มา (กรณีเป็นหน่วยงาน)",
    },
    SemenSexing: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "1 - น้ำเชื้อแยกเพศ, 2 - น้ำเชื้อคละเพศ",
    },
    ProduceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่ผลิต",
    },
    SemenType: {
      type: DataTypes.ENUM("FRESH", "FREEZE"),
      allowNull: false,
      comment: "ชนิดน้ำเชื้อ FRESH - สด FREEZE - แช่แข็งa",
    },
    Capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "ขนาดหลอด",
    },
    ProduceQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "จำนวนหลอดผลิต",
    },
    AfterThawingPercent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "%การเคลื่อนที่หลังแช่แข็ง",
    },
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเจ้าหน้าที่ผู้ตรวจ",
    },
    FatherAnimalNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเลขพ่อ",
    },
    FatherAnimalName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชื่อพ่อ",
    },
    FatherAnimalBreed: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สายพันธุ์พ่อ",
    },
    MotherAnimalNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเลขแม่",
    },
    MotherAnimalName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชื่อแม่",
    },
    MotherAnimalBreed: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สายพันธุ์แม่",
    },
    GrandfatherAnimalNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเลขปู่",
    },
    GrandfatherAnimalName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเลขปู่",
    },
    GrandfatherAnimalBreed: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สายพันธุ์ปู่",
    },
    //
    GrandmotherAnimalNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเลขย่า",
    },
    GrandmotherAnimalName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชื่อย่า",
    },
    GrandmotherAnimalBreed: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สายพันธุ์ย่า",
    },
    GrandpaAnimalNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเลขตา",
    },
    GrandpaAnimalName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชื่อตา",
    },
    GrandpaAnimalBreed: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สายพันธุ์ตา",
    },
    //
    GrandmaAnimalNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "หมายเลขยาย",
    },
    GrandmaAnimalName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ชื่อยาย",
    },
    GrandmaAnimalBreed: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สายพันธุ์ยาย",
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
    AnimalBreedAll: {
      type: DataTypes.VIRTUAL,
      get() {
        let animalBreed = "";

        if (this.AnimalBreedID1 != null && this.AnimalBreed1 != undefined) {
          let breed = this.AnimalBreed1.toJSON();

          animalBreed =
            animalBreed +
            this.AnimalBreedPercent1 +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID2 != null && this.AnimalBreed2 != undefined) {
          let breed = this.AnimalBreed2.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent2 +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID3 != null && this.AnimalBreed3 != undefined) {
          let breed = this.AnimalBreed3.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent3 +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID4 != null && this.AnimalBreed4 != undefined) {
          let breed = this.AnimalBreed4.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent4 +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID5 != null && this.AnimalBreed5 != undefined) {
          let breed = this.AnimalBreed5.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent5 +
            breed.AnimalBreedShortName +
            " ";
        }

        return animalBreed.trim();
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Semen",
  }
);

module.exports = Semen;
