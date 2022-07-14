// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../configs/databases")
// const db = require("../configs/databases");
// // db
// db.Users.associate();
const Sequelize = require("sequelize"),
  { sequelize } = require("../configs/databases");

// // ห้าม force เป็น true เด็ดขาด ข้อมูลจะถูกรีเซต
// db.sequelize.sync({force: false}).then(() => {
//     console.log('yes re-sync done!')
// })

const Province = require("./Province");
const Amphur = require("./Amphur");
const Tumbol = require("./Tumbol");
const Region = require("./Region");
const AIZone = require("./AIZone");
const OrganizationType = require("./OrganizationType");
const OrganizationZone = require("./OrganizationZone");
const Organization = require("./Organization");

const Staff = require("./Staff");
const Title = require("./Title");
const Gender = require("./Gender");
const MarriedStatus = require("./MarriedStatus");
const PositionType = require("./PositionType");
const Position = require("./Position");
const Major = require("./Major");
const Education = require("./Education");
const Occupation = require("./Occupation");

const User = require("./User");
const Menu = require("./Menu");
const Group = require("./Group");
const GroupAuthorize = require("./GroupAuthorize");

const Project = require("./Project");
const ProjectToAnimalType = require("./ProjectToAnimalType");
const UserToAnimalType = require("./UserToAnimalType");

const FarmStatus = require("./FarmStatus");
const Farm = require("./Farm");
const FarmToProject = require("./FarmToProject");
const Farmer = require("./Farmer");
//
const AnimalGenre = require("./AnimalGenre");
const AnimalSex = require("./AnimalSex");
const AnimalGroupType = require("./AnimalGroupType");
const AnimalType = require("./AnimalType");
const AnimalBreed = require("./AnimalBreed");
const AnimalStatus = require("./AnimalStatus");
const AnimalStatusToAnimalType = require("./AnimalStatusToAnimalType");
const AnimalStatusToAnimalSex = require("./AnimalStatusToAnimalSex");
const Animal = require("./Animal");
const AnimalToProject = require("./AnimalToProject");
//
const BCS = require("./BCS");
const GoatEstralActivity = require("./GoatEstralActivity");
const GunDepth = require("./GunDepth");
const SourceType = require("./SourceType");
//
const AbortResult = require("./AbortResult");
const EmbryoStage = require("./EmbryoStage");
const GiveBirthHelp = require("./GiveBirthHelp");
const PregnancyCheckMethod = require("./PregnancyCheckMethod");
const PregnancyCheckStatus = require("./PregnancyCheckStatus");
const PresetActivity = require("./PresetActivity");
const PresetActivityToAnimalType = require("./PresetActivityToAnimalType");
const TransferMethod = require("./TransferMethod");
//
const AI = require("./AI");
const GoatEstralActivityDetail = require("./GoatEstralActivityDetail");
const PregnancyCheckup = require("./PregnancyCheckup");
const AbortCheckup = require("./AbortCheckup");
const GiveBirth = require("./GiveBirth");
const Yearling = require("./Yearling");
const BCSCheckup = require("./BCSCheckup");
const ProgressCheckup = require("./ProgressCheckup");
const WeanMilk = require("./WeanMilk");
// Embryo
const Preset = require("./Preset");
const PresetDetail = require("./PresetDetail");
const Donor = require("./Donor");
const DonorActivity = require("./DonorActivity");
const DonorCollectEmbryo = require("./DonorCollectEmbryo");
const DonorCollectEmbryoDetail = require("./DonorCollectEmbryoDetail");
const Recipient = require("./Recipient");
const RecipientActivity = require("./RecipientActivity");
const TransferEmbryo = require("./TransferEmbryo");
//
const DistributionReason = require("./DistributionReason");
const DistributionReasonToAnimalType = require("./DistributionReasonToAnimalType");
const Distribution = require("./Distribution");

const AnnualGoal = require("./AnnualGoal");
const AnnualGoalToAnimalType = require("./AnnualGoalToAnimalType");

// Associate
Province.associate({ Region, AIZone, OrganizationZone });
Tumbol.associate({ Amphur, Province });
Amphur.associate({ Province });

Organization.associate({
  OrganizationType,
  OrganizationZone,
  Amphur,
  Province,
  Tumbol,
});

Staff.associate({
  Title,
  Gender,
  MarriedStatus,
  Organization,
  PositionType,
  Position,
  Amphur,
  Province,
  Tumbol,
  Education,
  Major,
});

User.associate({ Staff, Group, UserToAnimalType, AnimalType });
Group.associate({ User, GroupAuthorize });
GroupAuthorize.associate({ Group, Menu });
Project.associate({
  Organization,
  ProjectToAnimalType,
  AnimalType,
  AnimalToProject,
  Animal,
  FarmToProject,
  Farm,
});
ProjectToAnimalType.associate({ AnimalType, Project });
UserToAnimalType.associate({ AnimalType, User });

Farm.associate({
  FarmStatus,
  Amphur,
  Province,
  Tumbol,
  OrganizationZone,
  Organization,
  AIZone,
  FarmToProject,
  Project,
});

Farmer.associate({
  Farm,
  Amphur,
  Province,
  Tumbol,
  Title,
  Gender,
  Occupation,
});

//

AnimalGroupType.associate({ AnimalGenre });

AnimalType.associate({
  AnimalGenre,
  AnimalGroupType,
  ProjectToAnimalType,
  Project,
  UserToAnimalType,
  User,
  AnimalStatusToAnimalType,
  AnimalStatus,
  PresetActivityToAnimalType,
  PresetActivity,
  DistributionReasonToAnimalType,
  DistributionReason,
  AnnualGoalToAnimalType,
  AnnualGoal,
});

AnimalBreed.associate({ AnimalType });
AnimalSex.associate({ AnimalStatusToAnimalSex, AnimalStatus });
AnimalStatus.associate({
  AnimalStatusToAnimalType,
  AnimalType,
  AnimalStatusToAnimalSex,
  AnimalSex,
});

Animal.associate({
  AnimalSex,
  Farm,
  Animal,
  AnimalBreed,
  Organization,
  OrganizationZone,
  AnimalToProject,
  AnimalStatus,
  AnimalType,
  Project,
});

GoatEstralActivityDetail.associate({
  PresetActivity,
  GoatEstralActivity,
});

AI.associate({
  Animal,
  Staff,
  Project,
  GunDepth,
  BCS,
  GoatEstralActivity,
});

PregnancyCheckup.associate({
  Animal,
  Staff,
  AI,
  PregnancyCheckMethod,
  PregnancyCheckStatus,
});

AbortCheckup.associate({
  Animal,
  Staff,
  AI,
  AbortResult,
});

GiveBirth.associate({
  Animal,
  Staff,
  AI,
  GiveBirthHelp,
});

Yearling.associate({
  Animal,
  Staff,
});

BCSCheckup.associate({
  Animal,
  Staff,
  BCS,
});
ProgressCheckup.associate({
  Animal,
  Staff,
  BCS,
});

WeanMilk.associate({
  Animal,
  Staff,
  BCS,
});

Preset.associate({
  Organization,
  Staff,
});

PresetDetail.associate({
  Preset,
  PresetActivity,
});

DonorActivity.associate({
  Donor,
  Animal,
  PresetActivity,
  Staff,
});

DonorCollectEmbryo.associate({
  Donor,
  Animal,
  BCS,
  Staff,
});

DonorCollectEmbryoDetail.associate({
  Donor,
  Animal,
  EmbryoStage,
});

Recipient.associate({
  Preset,
  Farm,
  Staff,
});

RecipientActivity.associate({
  Recipient,
  Animal,
  PresetActivity,
  Staff,
});

TransferEmbryo.associate({
  Animal,
  BCS,
  Staff,
});

DistributionReason.associate({
  DistributionReasonToAnimalType,
  AnimalType,
});

Distribution.associate({
  Farm,
  Animal,
  DistributionReason,
  Staff,
  Organization,
});

AnnualGoal.associate({
  AnnualGoalToAnimalType,
  AnimalType,
  Organization,
  Project,
});

PresetActivity.associate({
  PresetActivityToAnimalType,
  AnimalType,
});

//

// เคย error เรื่องของลำดับด้วย

(async () => {
  await sequelize.sync();
  // Code here
})();

// module.exports = db
