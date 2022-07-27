const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");

class Project extends Model {
  static associate(models) {
    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
      as: "Organization",
    });
    this.belongsToMany(models.AnimalType, {
      through: models.ProjectToAnimalType,
      foreignKey: "ProjectID",
    });
    this.belongsToMany(models.Animal, {
      through: models.AnimalToProject,
      foreignKey: "ProjectID",
    });

    // this.belongsToMany(models.AI, {
    //   through: models.AI,
    //   foreignKey: "ProjectID",
    // });


    this.belongsToMany(models.Farm, {
      through: models.FarmToProject,
      foreignKey: "ProjectID",
    });
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      AnimalType: this.get().AnimalType,
      ProjectToAnimalType: undefined
    };
  }
}

Project.init(
  {
    ProjectID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิง โครงการ",
    },
    ProjectCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสโครงการ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Project.findOne({ where: { ProjectCode: value, isRemove: 0 } })
            .then(function (data) {
              console.log(self);
              if (data && self.ProjectID !== data.ProjectID) {
                throw new Error("Project Code already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    ProjectName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อโครงการ (ภาษาไทย)",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Project.findOne({ where: { ProjectName: value, isRemove: 0 } })
            .then(function (data) {
              if (data && self.ProjectID !== data.ProjectID) {
                throw new Error("Project Name already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },
    ProjectNameEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อโครงการ (ภาษาอังกฤษ)",
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่เริ่มโครงการ",
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่สิ้นสุดโครงการ",
    },
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสหน่วยงานเจ้าภาพ",
    },
    AnimalTypeID: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "รหัสชนิดสัตว์ (Array)",
    },
    IsExtend: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: "โครงการต่อเนื่อง 1=ขยาย,0=ไม่ขยาย",
    },
    ProjectLevel: {
      type: DataTypes.ENUM("ANIMAL", "AI", "FARM"),
      allowNull: false,
      comment: "รหัสชนิดสัตว์ (Array)",
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
    modelName: "Project",
  }
);

module.exports = Project;
