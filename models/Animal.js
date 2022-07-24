const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");
const AI = require("./AI");
const TransferEmbryo = require("./TransferEmbryo");
const PregnancyCheckup = require("./PregnancyCheckup");
const GiveBirth = require("./GiveBirth");
const Yearling = require("./Yearling");
const Reproduce = require("./Reproduce");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class Animal extends Model {
  static associate(models) {
    this.belongsTo(models.AnimalSex, {
      foreignKey: "AnimalSexID",
      as: "AnimalSex",
    });
    this.belongsTo(models.Farm, {
      foreignKey: "FarmID",
      as: "AnimalFarm",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalFatherID",
      as: "AnimalFather",
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalMotherID",
      as: "AnimalMother",
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

    // this.belongsTo(models.BornType, {
    //   foreignKey: "AnimalBornTypeID",
    //   as: "BornType",
    // });

    this.belongsTo(models.Farm, {
      foreignKey: "SourceFarmID",
      as: "SourceFarm",
    });

    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
      as: "Organization",
    });

    this.belongsTo(models.OrganizationZone, {
      foreignKey: "OrganizationZoneID",
      as: "OrganizationZone",
    });

    // Project
    this.belongsToMany(models.Project, {
      through: models.AnimalToProject,
      foreignKey: "AnimalID",
    });

    this.belongsTo(models.AnimalStatus, {
      foreignKey: "AnimalStatusID",
      as: "AnimalStatus",
    });

    this.belongsTo(models.AnimalType, {
      foreignKey: "AnimalTypeID",
      as: "AnimalType",
    });
  }

  async Notification() {
    let noti = [];
    if (this.ProductionStatusID == 6) {
      let day = null;

      let pregnancyCheckup = await PregnancyCheckup.findOne({
        order: [["PregnancyCheckupID", "DESC"]],
        where: {
          AnimalID: this.AnimalID,
        },
      });

      // let giveBirth = await GiveBirth.findOne({
      //   where: {
      //     AnimalID: this.AnimalID,
      //     PAR: this.AnimalPar,
      //   },
      // });

      if (pregnancyCheckup.AIID != null) {
        let ai = await AI.findByPk(pregnancyCheckup.AIID);
        day = ai.AIDate;
      } else if (pregnancyCheckup.TransferEmbryoID != null) {
        let te = await TransferEmbryo.findByPk(
          pregnancyCheckup.TransferEmbryoID
        );
        day = te.TransferDate;
      } else {
        day = CheckupDate;
      }

      if (day) {
        day = dayjs().diff(dayjs(day), "day");
        if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
          if (day >= 287) {
            noti.push(`เลยกําหนดคลอด ${day - 280} วัน`);
          } else if (day >= 280) {
            noti.push("ครบกำหนดคลอด");
          } else {
          }
        } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
          if (day >= 317) {
            noti.push(`เลยกําหนดคลอด ${day - 310} วัน`);
          } else if (day >= 310) {
            noti.push("ครบกำหนดคลอด");
          } else {
          }
        } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
          if (day >= 157) {
            noti.push(`เลยกําหนดคลอด ${day - 157} วัน`);
          } else if (day >= 150) {
            noti.push("ครบกำหนดคลอด");
          } else {
          }
        } else {
        }
      }
    }

    // ครบกำหนดตรวจท้อง
    if (this.ProductionStatusID == 4) {
      let day = null;

      let ai = await AI.findOne({
        order: [["AIID", "DESC"]],
        where: {
          AnimalID: this.AnimalID,
        },
      });

      let embryo = await TransferEmbryo.findOne({
        order: [["TransferEmbryoID", "DESC"]],
        where: {
          AnimalID: this.AnimalID,
        },
      });
      let method = null;
      if (ai && embryo) {
        if (dayjs(embryo.TransferDate).isAfter(dayjs(ai.AIDate)) == true) {
          // embryo.TransferEmbryoID,
          method = "embryo";
        } else {
          // ai
          method = "ai";
        }
      } else if (ai) {
        method = "ai";
      } else {
        method = "embryo";
      }

      // if (method == "ai") {
      //   var pregnancyCheckup2 = await PregnancyCheckup.findOne({
      //     order: [["TimeNo", "DESC"]],
      //     where: {
      //       AIID: ai.AIID,
      //       AnimalID: this.AnimalID,
      //     },
      //   });
      // } else {
      //   var pregnancyCheckup2 = await PregnancyCheckup.findOne({
      //     order: [["TimeNo", "DESC"]],
      //     where: {
      //       TransferEmbryoID: embryo.TransferEmbryoID,
      //       AnimalID: this.AnimalID,
      //     },
      //   });
      // }

      if (method == "ai") {
        day = ai.AIDate;
      } else if (method == "embryo") {
        day = embryo.TransferDate;
      } else {
        day = 1;
      }

      if (day) {
        day = dayjs().diff(dayjs(day), "day");
        if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
          if (day >= 60) {
            noti.push(`ครบกําหนดตรวจท้อง`);
          } else {
          }
        } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
          if (day >= 60) {
            noti.push(`ครบกําหนดตรวจท้อง`);
          } else {
          }
        } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
          if (day >= 45) {
            noti.push(`ครบกําหนดตรวจท้อง`);
          } else {
          }
        } else {
        }
      }
    }

    // ครบกำหนดติดตามลูกโคหลังคลอด
    // if (this.ProductionStatusID == 2) {
    //   let day = null;

    //   let giveBirth = await GiveBirth.findOne({
    //     where: {
    //       AnimalID: this.AnimalID,
    //       PAR: this.AnimalPar - 1,
    //     },
    //   });

    //   day = giveBirth.GiveBirthDate;

    //   // yearling
    //   let yearling = Yearling.findOne({
    //     where: {
    //       MotherAnimalID: this.AnimalID,
    //       FollowDate: {
    //         $gte: giveBirth.GiveBirthDate,
    //       },
    //     },
    //   });

    //   // GiveBirthDate
    //   if (yearling) {
    //     day = null;
    //   }

    //   if (day) {
    //     day = dayjs().diff(dayjs(day), "day");
    //     if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
    //       if (day >= 30) {
    //         noti.push(`ครบกําหนดติดตามลูกเกิดหลังคลอด`);
    //       } else {
    //       }
    //     } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
    //       if (day >= 30) {
    //         noti.push(`ครบกําหนดติดตามลูกเกิดหลังคลอด`);
    //       } else {
    //       }
    //     } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
    //       if (day >= 30) {
    //         noti.push(`ครบกําหนดติดตามลูกเกิดหลังคลอด`);
    //       } else {
    //       }
    //     } else {
    //     }
    //   }
    // }

    // ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด
    // if (this.ProductionStatusID == 2) {
    //   let day = null;

    //   let giveBirth = await GiveBirth.findOne({
    //     where: {
    //       AnimalID: this.AnimalID,
    //       PAR: this.AnimalPar - 1,
    //     },
    //   });

    //   day = giveBirth.GiveBirthDate;

    //   // Reproduce
    //   let reproduce = Reproduce.findOne({
    //     where: {
    //       AnimalID: this.AnimalID,
    //       StandingHeatDate: {
    //         $gte: giveBirth.GiveBirthDate,
    //       },
    //     },
    //   });

    //   // GiveBirthDate
    //   if (reproduce) {
    //     day = null;
    //   }

    //   if (day) {
    //     day = dayjs().diff(dayjs(day), "day");
    //     if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
    //       if (day >= 30) {
    //         noti.push(`ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด`);
    //       } else {
    //       }
    //     } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
    //       if (day >= 30) {
    //         noti.push(`ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด`);
    //       } else {
    //       }
    //     } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
    //       if (day >= 30) {
    //         noti.push(`ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด`);
    //       } else {
    //       }
    //     } else {
    //     }
    //   }
    // }

    // อายุมากกว่ากําหนดแล้วยังไม่ได้ผสม
    if (
      this.ProductionStatusID == null &&
      this.AnimalPar == 0 &&
      [3, 8, 13].includes(this.AnimalStatusID)
    ) {
      if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
        const age = this.AnimalAge.split("-");
        let month = parseInt(age[1]);

        if (age[0] != 0) {
          month = parseInt(age[0]) / 12;
          month = month + parseInt(age[1]);
        }

        if (month >= 18) {
          noti.push(`อายุมากกว่ากําหนด`);
        } else {
        }
      } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
        if (month >= 30) {
          noti.push(`อายุมากกว่ากําหนด`);
        } else {
        }
      } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
        if (month >= 12) {
          noti.push(`อายุมากกว่ากําหนด`);
        } else {
        }
      } else {
      }
    }

    // this.AnimalPar
    // find AI max ถ้า Timeno มากกว่า 3 ให้แจ้งเตือนได้เลย
    if (
      this.ProductionStatusID == 4 ||
      this.ProductionStatusID == 2 ||
      this.ProductionStatusID == 5
    ) {
      let ai = await AI.findOne({
        order: [["AIID", "DESC"]],
        where: {
          AnimalID: this.AnimalID,
          PAR: this.AnimalPar,
        },
      });

      if (ai) {
        if (ai.TimeNo > 3) {
          noti.push(`ผสมซ้ําเกิน 3 ครั้ง`);
        }
      }
    }

    return noti;
  }
  // Custom JSON Response
  toJSON() {
    return {
      ...this.get(),
      AnimalToProject: undefined,
    };
  }
}

Animal.init(
  {
    AnimalID: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "เลขไอดีอ้างอิงสัตว์",
    },
    AnimalIdentificationID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "รหัสสัตว์",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({
            where: { AnimalIdentificationID: value, isRemove: 0 },
          })
            .then(function (data) {
              console.log(self);
              if (data && self.AnimalID !== data.AnimalID) {
                throw new Error("Animal Identification already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalNationalID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสขึ้นทะเบียนสัตว์",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({ where: { AnimalNationalID: value, isRemove: 0 } })
            .then(function (data) {
              if (
                data &&
                self.AnimalNationalID != null &&
                self.AnimalID !== data.AnimalID
              ) {
                throw new Error("Animal National ID already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalEarID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสติดใบหู",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({ where: { AnimalEarID: value, isRemove: 0 } })
            .then(function (data) {
              if (
                data &&
                self.AnimalEarID != null &&
                self.AnimalID !== data.AnimalID
              ) {
                throw new Error("Animal Ear ID already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalMicrochip: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสไมโครชิฟ",
      validate: {
        isUnique: function (value, next) {
          let self = this;
          Animal.findOne({ where: { AnimalMicrochip: value, isRemove: 0 } })
            .then(function (data) {
              if (
                data &&
                self.AnimalMicrochip != null &&
                self.AnimalID !== data.AnimalID
              ) {
                throw new Error("Animal Microchip already in use!");
              }
              return next();
            })
            .catch(function (err) {
              return next(err);
            });
        },
      },
    },

    AnimalSexID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสเพศ",
    },

    AnimalName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อสัตว์",
    },
    FarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสฟาร์ม",
    },
    AnimalFirstBreed: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: "ตั้งต้นสายเลือด",
    },
    AnimalFatherID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสพ่อพันธุ์",
    },
    AnimalMotherID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสแม่พันธุ์",
    },
    AnimalPar: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 1,
      comment: "ท้องที่",
    },
    AnimalBirthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันเดือนปีเกิด",
    },
    AnimalBreedID1: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 1",
    },
    AnimalBreedPercent1: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    AnimalBreedID2: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 2",
    },
    AnimalBreedPercent2: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 2",
    },
    AnimalBreedID3: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 3",
    },
    AnimalBreedPercent3: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 3",
    },
    AnimalBreedID4: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 4",
    },
    AnimalBreedPercent4: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 4",
    },
    AnimalBreedID5: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 5",
    },
    AnimalBreedPercent5: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 5",
    },
    AnimalImagePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "url ภาพประจำตัวสัตว์",
    },
    AnimalBornWeight: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: "น้ำหนักแรกเกิด",
    },
    AnimalBornType: {
      type: DataTypes.ENUM("NORMAL", "AI", "EMBRYO"),
      allowNull: true,
      comment:
        "รูปแบบการเกิด NORMAL - ผสมพันธุ์ปกติ, AI - การผสมเทียม, EMBRYO - ตัวอ่อน",
    },
    AnimalBornTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสอ้างกระบวนการเกิด",
    },
    AnimalSource: {
      type: DataTypes.ENUM("BORN", "BUY", "TRANSFER"),
      allowNull: true,
      comment:
        "แหล่งที่มาของสัตว BORN - เกิดในฟาร์ม, BUY - ซื้อมา, TRANSFER - ย้ายมา",
    },
    SourceFarmID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสฟาร์มต้นทาง",
    },
    SourceText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "แหล่งที่มา (ระบุ)",
    },
    OrganizationID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงหน่วยงาน/สถานีที่ฟาร์มสังกัด",
    },
    OrganizationZoneID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "รหัสอ้างอิงเขตพื้นที่ที่ฟาร์มสังกัด",
    },
    ProjectID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสอ้างอิงโครงการ (Array)",
    },
    AnimalStatusID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "สถานะของสัตว์",
    },
    AnimalAlive: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      comment: "สถานะการมีชีวิต 1 = มีชีวิต 0 = เสียชีวิต",
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
    ProductionStatusID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "สถานภาพการผลิต",
    },
    AnimalSecretStatus: {
      type: DataTypes.VIRTUAL,
      get() {
        let status = null;

        const status1 = [1, 2, 4, 6, 7, 9, 11, 12, 14];

        // 1 คัดจำหน่าย
        // 2 ผสมเทียม
        // 3 ย้ายฝากตัวอ่อน
        // 4 ตรวจการตั้งท้อง
        // 5 แท้ง
        // 6 คลอด
        // 7 ตรวจระบบสืบพันธุ์
        // 8 ติดตามลูกโคหลังคลอด
        // 9 หย่านม

        if (status1.includes(this.AnimalStatusID)) {
          status = [1];
        } else if (
          this.ProductionStatusID == 4 ||
          this.ProductionStatusID == 3
        ) {
          status = [1, 2, 3, 4, 5, 6, 7];
        } else if (this.ProductionStatusID == 6) {
          status = [1, 4, 5, 6];
        } else if (this.ProductionStatusID == 1) {
          status = [1, 2, 3, 4, 6, 7];
        } else if (this.ProductionStatusID == 2) {
          status = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        } else if (this.ProductionStatusID == 5) {
          status = [1, 2, 3, 4, 7];
        } else {
          status = [1, 2, 3, 4, 5, 6, 7];
        }
        return status;
      },
    },
    AnimalAge: {
      type: DataTypes.VIRTUAL,
      get() {
        let age = null;

        if (this.AnimalBirthDate) {
          let ageMonth = dayjs().diff(this.AnimalBirthDate, "month");
          const year = ageMonth / 12;
          const month = ageMonth % 12;
          age = Math.floor(year) + "-" + month;
        }

        return age;
      },
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
    modelName: "Animal",
  }
);

module.exports = Animal;
