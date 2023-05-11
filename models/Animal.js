const { Model, DataTypes } = require("sequelize"),
  { sequelize } = require("../configs/databases");
const AI = require("./AI");
const TransferEmbryo = require("./TransferEmbryo");
const PregnancyCheckup = require("./PregnancyCheckup");
const PregnancyCheckStatus = require("./PregnancyCheckStatus");
const GiveBirth = require("./GiveBirth");
const Yearling = require("./Yearling");
const Reproduce = require("./Reproduce");
const Thaiblack = require("./Thaiblack");
const RedGoat = require("./RedGoat");

const dayjs = require("dayjs");
const locale = require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

class Animal extends Model {
  static associate(models) {
    this.belongsTo(models.AnimalSex, {
      foreignKey: "AnimalSexID",
      as: "AnimalSex",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Farm, {
      foreignKey: "FarmID",
      as: "AnimalFarm",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalFatherID",
      as: "AnimalFather",
      foreignKeyConstraint: true,
    });
    this.belongsTo(models.Animal, {
      foreignKey: "AnimalMotherID",
      as: "AnimalMother",
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

    // this.belongsTo(models.BornType, {
    //   foreignKey: "AnimalBornTypeID",
    //   as: "BornType",
    // });

    this.belongsTo(models.Farm, {
      foreignKey: "SourceFarmID",
      as: "SourceFarm",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.Organization, {
      foreignKey: "OrganizationID",
      as: "Organization",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.OrganizationZone, {
      foreignKey: "OrganizationZoneID",
      as: "OrganizationZone",
      foreignKeyConstraint: true,
    });

    // Project
    this.belongsToMany(models.Project, {
      // as: "Project",
      through: models.AnimalToProject,
      foreignKey: "AnimalID",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.AnimalStatus, {
      foreignKey: "AnimalStatusID",
      as: "AnimalStatus",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.AnimalType, {
      foreignKey: "AnimalTypeID",
      as: "AnimalType",
      foreignKeyConstraint: true,
    });

    this.belongsTo(models.ProductionStatus, {
      foreignKey: "ProductionStatusID",
      as: "ProductionStatus",
      foreignKeyConstraint: true,
    });

    // this.belongsTo(models.GiveBirth, {
    //   foreignKey: "GiveBirthSelfID",
    //   as: "GiveBirthSelf",
    // });
  }

  async Notification() {
    let noti = [];
    // ท้อง PG แต่ยังไม่คลอด
    let eventLatest = await this.EventLatest();

    let day = dayjs();
    if (eventLatest.AIID != null) {
      day = dayjs(eventLatest.AIDate);
    } else if (eventLatest.TransferEmbryoID != null) {
      day = dayjs(eventLatest.EmbryoDate);
    } else {
      day = dayjs();
    }

    day = dayjs().diff(day, "day");

    // ครบกำหนดคลอด และเลยกำหนดคลอด
    if (this.ProductionStatusID == 6) {
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

    // ครบกำหนดตรวจท้อง
    if (this.ProductionStatusID == 4) {
      if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
        if (day >= 60) {
          noti.push(`ครบกําหนดตรวจท้อง`);
        }
      } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
        if (day >= 60) {
          noti.push(`ครบกําหนดตรวจท้อง`);
        }
      } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
        if (day >= 45) {
          noti.push(`ครบกําหนดตรวจท้อง`);
        }
      } else {
      }
    }

    // ครบกำหนดติดตามลูกโคหลังคลอด
    if (this.ProductionStatusID == 2) {
      let day = dayjs();

      let giveBirth = await GiveBirth.findOne({
        where: {
          AnimalID: this.AnimalID,
          PAR: this.AnimalPar - 1,
        },
      });

      if (giveBirth) {
        day = dayjs(giveBirth.GiveBirthDate);

        // yearling
        let yearling = await Yearling.findOne({
          where: {
            MotherAnimalID: this.AnimalID,
            FollowDate: {
              $gte: giveBirth.GiveBirthDate,
            },
          },
        });

        // GiveBirthDate
        if (!yearling) {
          day = dayjs().diff(day, "day");
          if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
            if (day >= 30) {
              noti.push(`ครบกําหนดติดตามลูกเกิดหลังคลอด`);
            }
          } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
            if (day >= 30) {
              noti.push(`ครบกําหนดติดตามลูกเกิดหลังคลอด`);
            }
          } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
            if (day >= 30) {
              noti.push(`ครบกําหนดติดตามลูกเกิดหลังคลอด`);
            }
          } else {
            // noti.push(`ครบกําหนดติดตามลูกเกิดหลังคลอด`);
          }
        }
      }
    }

    // ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด
    if (this.ProductionStatusID == 2) {
      let day = null;

      let giveBirth = await GiveBirth.findOne({
        where: {
          AnimalID: this.AnimalID,
          PAR: this.AnimalPar - 1,
        },
      });

      if (giveBirth) {
        day = dayjs(giveBirth.GiveBirthDate);

        // Reproduce
        let reproduce = Reproduce.findOne({
          where: {
            AnimalID: this.AnimalID,
            ReproduceDate: {
              $gte: giveBirth.GiveBirthDate,
            },
            // StandingHeatDate: {
            //   $gte: giveBirth.GiveBirthDate,
            // },
          },
        });

        if (!reproduce) {
          day = dayjs().diff(day, "day");

          if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
            if (day >= 30) {
              noti.push(`ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด`);
            } else {
            }
          } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
            if (day >= 30) {
              noti.push(`ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด`);
            } else {
            }
          } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
            if (day >= 30) {
              noti.push(`ครบกําหนดตรวจระบบสืบพันธุ์หลังคลอด`);
            } else {
            }
          } else {
          }
        }
      }
    }

    // อายุมากกว่ากําหนดแล้วยังไม่ได้ผสม
    if (
      this.ProductionStatusID == null &&
      this.AnimalPar == 0 &&
      [3, 8, 13].includes(this.AnimalStatusID)
    ) {
      let day = null;
      if (this.AnimalBirthDate) {
        day = dayjs().diff(dayjs(this.AnimalBirthDate), "day");

        if (this.AnimalStatusID == 3 || this.AnimalStatusID == 5) {
          if (day >= 540) {
            //540
            noti.push(`อายุมากกว่ากําหนด`);
          }
        } else if (this.AnimalStatusID == 8 || this.AnimalStatusID == 10) {
          if (day >= 900) {
            noti.push(`อายุมากกว่ากําหนด`);
          }
        } else if (this.AnimalStatusID == 13 || this.AnimalStatusID == 15) {
          if (day >= 360) {
            noti.push(`อายุมากกว่ากําหนด`);
          }
        } else {
        }
      }
    }

    // ไม่กลับสัด
    if (this.ProductionStatusID == 4) {
      if (
        eventLatest.PregnancyStatus == "DU" ||
        eventLatest.PregnancyStatus == ""
      ) {
        if (day > 90) {
          noti.push(`ไม่กลับสัดหลังผสม`);
        }
      }
    }

    // ผสมซ้ำเกิน 3 ครั้ง
    if (this.ProductionStatusID == 4) {
      if (eventLatest.TimeNo > 3) {
        noti.push(`ผสมซ้ำเกิน 3 ครั้ง`);
      }
    }

    if (this.ProjectID) {
      // Thai black
      if (JSON.parse(this.ProjectID).includes(3)) {
        let day = dayjs().diff(dayjs(this.AnimalBirthDate), "day");

        if (day >= 800) {
          let checkThaiblack = await Thaiblack.findOne({
            where: { AnimalID: this.AnimalID, ThaiblackRound: 4 },
          });
          if (!checkThaiblack) {
            noti.push(`ครบกำหนดบันทึก Thaiblack รอบ 800 วัน`);
          }
        } else if (day >= 600) {
          let checkThaiblack = await Thaiblack.findOne({
            where: { AnimalID: this.AnimalID, ThaiblackRound: 3 },
          });
          if (!checkThaiblack) {
            noti.push(`ครบกำหนดบันทึก Thaiblack รอบ 600 วัน`);
          }
        } else if (day >= 400) {
          let checkThaiblack = await Thaiblack.findOne({
            where: { AnimalID: this.AnimalID, ThaiblackRound: 2 },
          });
          if (!checkThaiblack) {
            noti.push(`ครบกำหนดบันทึก Thaiblack รอบ 400 วัน`);
          }
        } else if (day >= 210) {
          let checkThaiblack = await Thaiblack.findOne({
            where: { AnimalID: this.AnimalID, ThaiblackRound: 1 },
          });
          if (!checkThaiblack) {
            noti.push(`ครบกำหนดบันทึก Thaiblack รอบ 210 วัน`);
          }
        } else {
        }
      }

      // Red Goat
      if (JSON.parse(this.ProjectID).includes(8)) {
        let day = dayjs().diff(dayjs(this.AnimalBirthDate), "day");

        if (day >= 360) {
          let checkRedGoat = await RedGoat.findOne({
            where: { AnimalID: this.AnimalID, RedGoatRound: 2 },
          });
          if (!checkRedGoat) {
            noti.push(`ครบกำหนดบันทึก แดงสุราษฏร์ รอบ 1 ปี`);
          }
        } else if (day >= 30) {
          let checkRedGoat = await RedGoat.findOne({
            where: { AnimalID: this.AnimalID, RedGoatRound: 1 },
          });
          if (!checkRedGoat) {
            noti.push(`ครบกำหนดบันทึก แดงสุราษฏร์ รอบ 30 วัน`);
          }
        } else {
        }
      }
    }

    return noti;
  }

  async EventLatest() {
    let event = {
      EventType: null,
      Date: null,
      ID: null,
      PAR: null,
      TimeNo: null,
      Status: null,
      PregnancyStatus: null,
      AIStatus: null,
    };

    let ai = await AI.findOne({
      order: [
        ["PAR", "DESC"],
        ["TimeNo", "DESC"],
      ],
      where: {
        AnimalID: this.AnimalID,
        isRemove: 0,
      },
    });

    let embryo = await TransferEmbryo.findOne({
      order: [
        ["PAR", "DESC"],
        ["TimeNo", "DESC"],
      ],
      where: {
        AnimalID: this.AnimalID,
        isRemove: 0,
      },
    });

    let animalJson = this.toJSON();
    let age = animalJson.AnimalAge;

    let statusText = this.AnimalStatus
      ? this.AnimalStatus.AnimalStatusName
      : null;

    if (this.ProductionStatusID == 1) {
      statusText = statusText + " แท้ง";
    } else if (this.ProductionStatusID == 2) {
      statusText = statusText + " คลอด";
    } else if (this.ProductionStatusID == 3) {
      statusText = statusText + " รอตรวจซ้ำ";
    } else if (this.ProductionStatusID == 4) {
      statusText = statusText + " ผสม";
    } else if (this.ProductionStatusID == 5) {
      statusText = statusText + " ไม่ท้อง";
    } else if (this.ProductionStatusID == 6) {
      statusText = statusText + " ท้อง";
    } else {
    }

    var data = {
      AnimalID: animalJson.AnimalID,
      AnimalEarID: animalJson.AnimalEarID,
      AnimalName: animalJson.AnimalName,
      AnimalTypeID: animalJson.AnimalTypeID,
      AnimalSecretStatus: animalJson.AnimalSecretStatus,
      AnimalAge: age,
      AnimalBreedAll: animalJson.AnimalBreedAll,
      AnimalStatus: statusText,
      AnimalStatusText: statusText,
      FarmName: this.AnimalFarm ? this.AnimalFarm.FarmName : null,
      AnimalSex: this.AnimalSex ? this.AnimalSex.AnimalSexName : null,
    };

    if (ai && embryo) {
      if (embryo.TimeNo > ai.TimeNo) {
        let preg = await PregnancyCheckup.findOne({
          order: [["TimeNo", "DESC"]],
          where: {
            AnimalID: animalJson.AnimalID,
            TransferEmbryoID: embryo.TransferEmbryoID,
            isRemove: 0,
          },
          include: {
            model: PregnancyCheckStatus,
          },
        });

        let pregResult = "";
        let pregnancyTimeNo = "";
        if (preg) {
          pregResult = preg.PregnancyCheckStatus.PregnancyCheckStatusCode;
          pregnancyTimeNo = preg.TimeNo;
        }

        data = {
          ...data,
          AIID: null,
          TransferEmbryoID: embryo.TransferEmbryoID,
          PAR: animalJson.AnimalPar,
          // PAR: embryo.PAR,
          TimeNo: embryo.TimeNo,
          AIDate: null,
          EmbryoDate: embryo.TransferDate,
          ThaiEmbryoDate: dayjs(embryo.TransferDate)
            .locale("th")
            .format("DD/MM/BBBB"),
          ThaiEventLatest: dayjs(embryo.TransferDate)
            .locale("th")
            .format("DD/MM/BBBB"),
          PregnancyStatus: pregResult,
          PregnancyTimeNo: pregnancyTimeNo,
        };
      } else {
        let preg = await PregnancyCheckup.findOne({
          order: [["TimeNo", "DESC"]],
          where: {
            AnimalID: animalJson.AnimalID,
            AIID: ai.AIID,
            isRemove: 0,
          },
          include: {
            model: PregnancyCheckStatus,
          },
        });
        let pregResult = "";
        let pregnancyTimeNo = "";
        if (preg) {
          pregResult = preg.PregnancyCheckStatus.PregnancyCheckStatusCode;
          pregnancyTimeNo = preg.TimeNo;
        }
        var data = {
          ...data,
          AIID: ai.AIID,
          TransferEmbryoID: null,

          PAR: animalJson.AnimalPar,
          // PAR: ai.PAR,
          TimeNo: ai.TimeNo,
          AIDate: ai.AIDate,
          ThaiAIDate: dayjs(ai.AIDate).locale("th").format("DD/MM/BBBB"),
          ThaiEventLatest: dayjs(ai.AIDate).locale("th").format("DD/MM/BBBB"),
          EmbryoDate: null,
          PregnancyStatus: pregResult,
          PregnancyTimeNo: pregnancyTimeNo,
        };
      }
      // CheckDate เอาอันล่าสุด
    } else if (ai) {
      let preg = await PregnancyCheckup.findOne({
        order: [["TimeNo", "DESC"]],
        where: {
          AnimalID: animalJson.AnimalID,
          AIID: ai.AIID,
          isRemove: 0,
        },
        include: {
          model: PregnancyCheckStatus,
        },
      });
      let pregResult = "";
      let pregnancyTimeNo = "";
      if (preg) {
        pregResult = preg.PregnancyCheckStatus.PregnancyCheckStatusCode;
        pregnancyTimeNo = preg.TimeNo;
      }

      var data = {
        ...data,
        AIID: ai.AIID,
        TransferEmbryoID: null,
        // PAR: ai.PAR,

        PAR: animalJson.AnimalPar,
        TimeNo: this.ProductionStatusID == 2 ? 0 : ai.TimeNo,
        AIDate: ai.AIDate,
        ThaiAIDate: dayjs(ai.AIDate).locale("th").format("DD/MM/BBBB"),
        ThaiEventLatest: dayjs(ai.AIDate).locale("th").format("DD/MM/BBBB"),
        ThaiAIDateDiff: dayjs().diff(dayjs(ai.AIDate), "day"),

        EmbryoDate: null,
        PregnancyStatus: pregResult,
        PregnancyTimeNo: pregnancyTimeNo,
      };
    } else if (embryo) {
      let preg = await PregnancyCheckup.findOne({
        order: [["TimeNo", "DESC"]],
        where: {
          AnimalID: animalJson.AnimalID,
          TransferEmbryoID: embryo.TransferEmbryoID,
          isRemove: 0,
        },
        include: {
          model: PregnancyCheckStatus,
        },
      });
      let pregResult = "";
      let pregnancyTimeNo = "";
      if (preg) {
        pregResult = preg.PregnancyCheckStatus.PregnancyCheckStatusCode;
        pregnancyTimeNo = preg.TimeNo;
      }

      var data = {
        ...data,
        AIID: null,
        TransferEmbryoID: embryo.TransferEmbryoID,
        // PAR: embryo.PAR,

        PAR: animalJson.AnimalPar,
        TimeNo: this.ProductionStatusID == 2 ? 0 : embryo.TimeNo,
        AIDate: null,
        EmbryoDate: embryo.TransferDate,
        ThaiEmbryoDate: dayjs(embryo.TransferDate)
          .locale("th")
          .format("DD/MM/BBBB"),
        ThaiEventLatest: dayjs(embryo.TransferDate)
          .locale("th")
          .format("DD/MM/BBBB"),
        PregnancyStatus: pregResult,
        PregnancyTimeNo: pregnancyTimeNo,
      };
    } else {
      var data = {
        ...data,
        AIID: null,
        TransferEmbryoID: null,
        PAR: animalJson.AnimalPar,
        TimeNo: null,
        AIDate: null,
        EmbryoDate: null,
        PregnancyStatus: null,
        PregnancyTimeNo: null,
      };
    }

    return data;
  }

  // Custom JSON Response
  toJSON() {
    let animal = this.get();
    return {
      ...animal,
      AnimalEarIDAndName: animal.AnimalEarID + "," + animal.AnimalName,
      // AnimalToProject: undefined,
    };
  }
}

Animal.init(
  {
    GiveBirthSelfID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสการเกิดของตัวเอง",
    },
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
      defaultValue: 0,
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
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 1",
    },
    AnimalBreedID2: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 2",
    },
    AnimalBreedPercent2: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 2",
    },
    AnimalBreedID3: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 3",
    },
    AnimalBreedPercent3: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 3",
    },
    AnimalBreedID4: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 4",
    },
    AnimalBreedPercent4: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 4",
    },
    AnimalBreedID5: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "รหัสสายพันธุ์ที่ 5",
    },
    AnimalBreedPercent5: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: "สัดส่วนสายพันธุ์ที่ 5",
    },
    AnimalImagePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "url ภาพประจำตัวสัตว์",
    },
    AnimalBornWeight: {
      type: DataTypes.DECIMAL(10, 3),
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
    AnimalDateJoin: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันเข้่าฝูง",
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
        //
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
          status = [1, 2, 3, 4, 5, 6, 7];
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
            this.AnimalBreedPercent1.toString().substring(
              0,
              this.AnimalBreedPercent1.length - 1
            ) +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID2 != null && this.AnimalBreed2 != undefined) {
          let breed = this.AnimalBreed2.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent2.toString().substring(
              0,
              this.AnimalBreedPercent2.length - 1
            ) +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID3 != null && this.AnimalBreed3 != undefined) {
          let breed = this.AnimalBreed3.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent3.toString().substring(
              0,
              this.AnimalBreedPercent3.length - 1
            ) +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID4 != null && this.AnimalBreed4 != undefined) {
          let breed = this.AnimalBreed4.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent4.toString().substring(
              0,
              this.AnimalBreedPercent4.length - 1
            ) +
            breed.AnimalBreedShortName +
            " ";
        }

        if (this.AnimalBreedID5 != null && this.AnimalBreed5 != undefined) {
          let breed = this.AnimalBreed5.toJSON();
          animalBreed =
            animalBreed +
            this.AnimalBreedPercent5.toString().substring(
              0,
              this.AnimalBreedPercent5.length - 1
            ) +
            breed.AnimalBreedShortName +
            " ";
        }

        return animalBreed.trim();
      },
    },
    ThaiAnimalBirthDate: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.AnimalBirthDate
          ? dayjs(this.AnimalBirthDate).locale("th").format("DD/MM/BBBB")
          : null;
      },
    },

    // AnimalStatusText: {
    //   type: DataTypes.VIRTUAL,
    //   get() {
    //     let status = null;

    //     const status1 = [1, 2, 4, 6, 7, 9, 11, 12, 14];

    //     // 1 คัดจำหน่าย
    //     // 2 ผสมเทียม
    //     // 3 ย้ายฝากตัวอ่อน
    //     // 4 ตรวจการตั้งท้อง
    //     // 5 แท้ง
    //     // 6 คลอด
    //     // 7 ตรวจระบบสืบพันธุ์
    //     // 8 ติดตามลูกโคหลังคลอด
    //     // 9 หย่านม

    //     if (status1.includes(this.AnimalStatusID)) {
    //       status = [1];
    //     } else if (
    //       this.ProductionStatusID == 4 ||
    //       this.ProductionStatusID == 3
    //     ) {
    //       status = [1, 2, 3, 4, 5, 6, 7];
    //     } else if (this.ProductionStatusID == 6) {
    //       status = [1, 4, 5, 6];
    //     } else if (this.ProductionStatusID == 1) {
    //       status = [1, 2, 3, 4, 6, 7];
    //     } else if (this.ProductionStatusID == 2) {
    //       status = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    //     } else if (this.ProductionStatusID == 5) {
    //       status = [1, 2, 3, 4, 5, 6, 7];
    //     } else {
    //       status = [1, 2, 3, 4, 5, 6, 7];
    //     }
    //     return this.Animal;
    //     //
    //   },
    // },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    modelName: "Animal",
  }
);

module.exports = Animal;
