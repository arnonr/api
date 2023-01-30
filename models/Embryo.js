const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Embryo extends Model {
  static associate(models) {
    this.belongsTo(models.Semen, {
      foreignKey: "SemenID",
      as: "Semen",
    });

    // this.belongsTo(models.Animal, {
    //   foreignKey: "MaleBreederID",
    //   as: "MaleBreeder",
    // });

    // this.belongsTo(models.Animal, {
    //   foreignKey: "FemaleBreederID",
    //   as: "FemaleBreeder",
    // });
    this.belongsTo(models.AnimalType, {
      foreignKey: "AnimalTypeID",
      as: "AnimalType",
    });

    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID1",
      as: "AnimalBreed1",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID2",
      as: "AnimalBreed2",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID3",
      as: "AnimalBreed3",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID4",
      as: "AnimalBreed4",
    });
    this.belongsTo(models.AnimalBreed, {
      foreignKey: "AnimalBreedID5",
      as: "AnimalBreed5",
    });
    this.belongsTo(models.SourceType, {
      foreignKey: "SourceTypeID",
      as: "SourceType",
    });

    this.belongsTo(models.Organization, {
      foreignKey: "SourceOrganizationID",
      as: "Organization",
    });

    this.belongsTo(models.Country, {
      foreignKey: "CountryID",
      as: "Country",
    });
    this.belongsTo(models.EmbryoStage, {
      foreignKey: "EmbryoStageID",
      as: "EmbryoStage",
    });

    this.belongsTo(models.Staff, {
      foreignKey: "ResponsibilityStaffID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
    };
  }
}

Embryo.init(
  {
    EmbryoID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง",
    },
    EmbryoNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "หมายเลขตัวอ่อน",
    },
    SemenID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างอิงน้ำเชื้อ",
    },
    MaleBreederID: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "หมายเลขพ่อพันธุ์",
    },
    FemaleBreederID: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
      allowNull: true,
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
    ProduceType: {
      type: DataTypes.ENUM("INVIVO", "INVITRO"),
      allowNull: true,
      comment: "วิธีการผลิต INVIVO - ในร่างกายสัตว INVITRO - สิ่งแวดล้อมเทียม",
    },
    ProduceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ผลิต",
    },
    EmbryoStageID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้้างอิงระยะตัวอ่อน",
    },
    EmbryoSex: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "เพศ",
    },
    StrawColor: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สีหลอด Straw color",
    },
    PlugColor: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Plug color",
    },
    Trypsinization: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Trypsinization",
    },

    ZonaIntact: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Zona Intact",
    },

    EmbryoManipulated: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Embryo Manipulated",
    },
    EmbryoStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "สถานะตัวอ่อน",
    },
    Amount: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "จำนวนตัวในหลอด",
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
    ResponsibilityStaffID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสเจ้าหน้าที่",
    },
    MaleBreeder: {
      type: DataTypes.VIRTUAL,
      get() {
        return {
          EmbryoNumber: this.MaleBreederID
        };
      },
    }
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Embryo",
  }
);

module.exports = Embryo;
