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
const Country = require("./Country");
const OrganizationType = require("./OrganizationType");
const OrganizationZone = require("./OrganizationZone");
const Organization = require("./Organization");

const Staff = require("./Staff");
const CardRequestLog = require("./CardRequestLog");
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

// ขุน
const Concentrate = require("./Concentrate");
const Roughages = require("./Roughages");
const TMRFormula = require("./TMRFormula");
const TMRFormulaToRoughages = require("./TMRFormulaToRoughages");
const TMRFormulaToConcentrate = require("./TMRFormulaToConcentrate");
const FeedProgram = require("./FeedProgram");
const FeedProgramDetail = require("./FeedProgramDetail");
const FeedProgramProgress = require("./FeedProgramProgress");
const FeedPPToRoughages = require("./FeedPPToRoughages");
const FeedPPToConcentrate = require("./FeedPPToConcentrate");

const Semen = require("./Semen");
const Embryo = require("./Embryo");

const DMToAnimalType = require("./DMToAnimalType");
const DewormMedicine = require("./DewormMedicine");
const VcToAnimalType = require("./VcToAnimalType");
const Vaccine = require("./Vaccine");
const DsToAnimalType = require("./DsToAnimalType");
const Disease = require("./Disease");
const VaccineObjective = require("./VaccineObjective");
const DiseaseResult = require("./DiseaseResult");
const DiseaseMethod = require("./DiseaseMethod");
const DiseaseActivity = require("./DiseaseActivity");
const VaccineActivity = require("./VaccineActivity");
const DewormActivity = require("./DewormActivity");
const ReproduceSuggestion = require("./ReproduceSuggestion");
const HeatType = require("./HeatType");
const HeatCircle = require("./HeatCircle");
const VaginaSymptom = require("./VaginaSymptom");
const OvarySymptom = require("./OvarySymptom");
const OtherSymptom = require("./OtherSymptom");
//
const CureVitaminToAnimalType = require("./CureVitaminToAnimalType");
const CureVitamin = require("./CureVitamin");
const CureAntibioticToAnimalType = require("./CureAntibioticToAnimalType");
const CureAntibiotic = require("./CureAntibiotic");
const CureHormoneToAnimalType = require("./CureHormoneToAnimalType");
const CureHormone = require("./CureHormone");
const CauseHealthToAnimalType = require("./CauseHealthToAnimalType");
const CauseHealth = require("./CauseHealth");
const CauseFeederToAnimalType = require("./CauseFeederToAnimalType");
const CauseFeeder = require("./CauseFeeder");
const CauseEnvToAnimalType = require("./CauseEnvToAnimalType");
const CauseEnvironment = require("./CauseEnvironment");
const CauseAnimalToAnimalType = require("./CauseAnimalToAnimalType");
const CauseAnimal = require("./CauseAnimal");
const Reproduce = require("./Reproduce");
const RpToCauseAnimal = require("./RpToCauseAnimal");
const RpToCauseEnvironment = require("./RpToCauseEnvironment");
const RpToCauseFeeder = require("./RpToCauseFeeder");
const RpToCauseHealth = require("./RpToCauseHealth");
const RpToCureAntibiotic = require("./RpToCureAntibiotic");
const RpToCureHormone = require("./RpToCureHormone");
const RpToCureVitamin = require("./RpToCureVitamin");
const RpToOtherSymptom = require("./RpToOtherSymptom");
const RpToRpSuggestion = require("./RpToRpSuggestion");
const RpToVaginaSymptom = require("./RpToVaginaSymptom");
const RpToLeftOvarySymptom = require("./RpToLeftOvarySymptom");
const RpToRightOvarySymptom = require("./RpToRightOvarySymptom");

const RedGoat = require("./RedGoat");
const Thaiblack = require("./Thaiblack");
const ProductionStatus = require("./ProductionStatus");

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
  CardRequestLog
});

CardRequestLog.associate({
  Staff
})

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
  Farmer,
});

Farmer.associate({
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
  DMToAnimalType,
  DewormMedicine,
  VcToAnimalType,
  Vaccine,
  DsToAnimalType,
  Disease,
  CureVitaminToAnimalType,
  CureVitamin,
  CureAntibioticToAnimalType,
  CureAntibiotic,
  CureHormoneToAnimalType,
  CureHormone,
  CauseHealthToAnimalType,
  CauseHealth,
  CauseFeederToAnimalType,
  CauseFeeder,
  CauseEnvToAnimalType,
  CauseEnvironment,
  CauseAnimalToAnimalType,
  CauseAnimal,
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
  ProductionStatus,
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
  AnimalType,
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
  DonorCollectEmbryo,
});

Donor.associate({
  Preset,
  Farm,
  Staff,
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

Concentrate.associate({
  TMRFormulaToConcentrate,
  TMRFormula,
  FeedPPToConcentrate,
  FeedProgramProgress,
});

Roughages.associate({
  TMRFormulaToRoughages,
  TMRFormula,
  FeedPPToRoughages,
  FeedProgramProgress,
});

TMRFormula.associate({
  TMRFormulaToRoughages,
  Roughages,
  TMRFormulaToConcentrate,
  Concentrate,
  Staff,
});

FeedProgram.associate({
  Farm,
  Staff,
});

FeedProgramDetail.associate({
  FeedProgram,
  Animal,
});

FeedProgramProgress.associate({
  FeedProgram,
  Animal,
  Staff,
  FeedPPToRoughages,
  Roughages,
  FeedPPToConcentrate,
  Concentrate,
});

Semen.associate({
  Animal,
  Staff,
  Country,
  SourceType,
  AnimalBreed,
  AnimalType,
  Organization,
});

Embryo.associate({
  Animal,
  Staff,
  Country,
  SourceType,
  AnimalBreed,
  AnimalType,
  Organization,
  EmbryoStage,
  Semen,
});

DewormMedicine.associate({
  DMToAnimalType,
  AnimalType,
});

Vaccine.associate({
  VcToAnimalType,
  AnimalType,
});

Disease.associate({
  DsToAnimalType,
  AnimalType,
});

DiseaseActivity.associate({
  Animal,
  Disease,
  DiseaseMethod,
  DiseaseResult,
  Organization,
  Staff,
});

VaccineActivity.associate({
  Animal,
  Vaccine,
  VaccineObjective,
  Organization,
  Staff,
});

CureVitamin.associate({
  CureVitaminToAnimalType,
  AnimalType,
  RpToCureVitamin,
  Reproduce,
});

DewormActivity.associate({
  Animal,
  DewormMedicine,
  Organization,
  Staff,
});

CureAntibiotic.associate({
  CureAntibioticToAnimalType,
  AnimalType,
  RpToCureAntibiotic,
  Reproduce,
});

CureHormone.associate({
  CureHormoneToAnimalType,
  AnimalType,
  RpToCureHormone,
  Reproduce,
});

CauseHealth.associate({
  CauseHealthToAnimalType,
  AnimalType,
  RpToCauseHealth,
  Reproduce,
});

CauseFeeder.associate({
  CauseFeederToAnimalType,
  AnimalType,
  RpToCauseFeeder,
  Reproduce,
});

CauseEnvironment.associate({
  CauseEnvToAnimalType,
  AnimalType,
  RpToCauseEnvironment,
  Reproduce,
});

CauseAnimal.associate({
  CauseAnimalToAnimalType,
  AnimalType,
  RpToCauseAnimal,
  Reproduce,
});

VaginaSymptom.associate({
  RpToVaginaSymptom,
  Reproduce,
});

Reproduce.associate({
  Animal,
  HeatType,
  HeatCircle,
  Staff,
  RpToCauseAnimal,
  CauseAnimal,
  RpToCauseEnvironment,
  CauseEnvironment,
  RpToCauseFeeder,
  CauseFeeder,
  RpToCauseHealth,
  CauseHealth,
  RpToCureAntibiotic,
  CureAntibiotic,
  RpToCureHormone,
  CureHormone,
  RpToCureVitamin,
  CureVitamin,
  RpToOtherSymptom,
  OtherSymptom,
  RpToVaginaSymptom,
  VaginaSymptom,
  OvarySymptom,
  RpToLeftOvarySymptom,
  RpToRightOvarySymptom,
  RpToRpSuggestion,
  ReproduceSuggestion,
});

OvarySymptom.associate({
  Reproduce,
  RpToLeftOvarySymptom,
  RpToRightOvarySymptom,
});

OtherSymptom.associate({
  RpToOtherSymptom,
  Reproduce,
});

ReproduceSuggestion.associate({
  RpToRpSuggestion,
  Reproduce,
});

RedGoat.associate({
  Animal,
  Staff,
});

Thaiblack.associate({
  Animal,
  Staff,
});

PresetActivity.associate({
  PresetActivityToAnimalType,
  AnimalType,
});

// เคย error เรื่องของลำดับด้วย

(async () => {
  await sequelize.sync();
  // Code here
})();

// module.exports = db
