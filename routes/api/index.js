const router = require("express").Router();
const auth = require("../auth");

router.use("/country", auth.required, require("./Country"));
router.use("/region", auth.required, require("./Region"));
router.use("/province", auth.required, require("./Province"));
router.use("/amphur", auth.required, require("./Amphur"));
router.use("/tumbol", auth.required, require("./Tumbol"));

router.use("/occupation", auth.required, require("./Occupation"));
router.use("/education", auth.required, require("./Education"));
router.use("/title", auth.required, require("./Title"));
router.use("/gender", auth.required, require("./Gender"));

router.use("/ai-zone", auth.required, require("./AIZone"));
router.use("/organization-type", auth.required, require("./OrganizationType"));
router.use("/organization-zone", auth.required, require("./OrganizationZone"));
router.use("/organization", auth.required, require("./Organization"));

router.use("/position", auth.required, require("./Position"));
router.use("/position-type", auth.required, require("./PositionType"));
router.use("/married-status", auth.required, require("./MarriedStatus"));
router.use("/major", auth.required, require("./Major"));
router.use(
  "/change-staff-info-log",
  auth.required,
  require("./ChangeStaffInfoLog")
);
router.use("/login-log", auth.required, require("./LoginLog"));
router.use("/card-request-log", auth.required, require("./CardRequestLog"));

router.use("/user", require("./User"));
router.use("/staff", require("./Staff"));

router.use("/menu", auth.required, require("./Menu"));
router.use("/group", auth.required, require("./Group"));
router.use("/group-authorize", auth.required, require("./GroupAuthorize"));

router.use("/project", auth.required, require("./Project"));

router.use("/farm-status", auth.required, require("./FarmStatus"));
router.use("/farm", auth.required, require("./Farm"));
router.use("/farmer", auth.required, require("./Farmer"));

router.use("/animal-genre", auth.required, require("./AnimalGenre"));
router.use("/animal-sex", auth.required, require("./AnimalSex"));
router.use("/animal-group-type", auth.required, require("./AnimalGroupType"));
router.use("/animal-type", auth.required, require("./AnimalType"));
router.use("/animal-breed", auth.required, require("./AnimalBreed"));
router.use("/animal-status", auth.required, require("./AnimalStatus"));
router.use("/animal", auth.required, require("./Animal"));

//
router.use("/bcs", auth.required, require("./BCS"));
router.use("/gun-depth", auth.required, require("./GunDepth"));
router.use(
  "/goat-estral-activity",
  auth.required,
  require("./GoatEstralActivity")
);
router.use("/source-type", auth.required, require("./SourceType"));
router.use("/abort-result", auth.required, require("./AbortResult"));
router.use("/embryo-stage", auth.required, require("./EmbryoStage"));
router.use("/give-birth-help", auth.required, require("./GiveBirthHelp"));
router.use(
  "/pregnancy-check-method",
  auth.required,
  require("./PregnancyCheckMethod")
);
router.use(
  "/pregnancy-check-status",
  auth.required,
  require("./PregnancyCheckStatus")
);
router.use("/preset-activity", auth.required, require("./PresetActivity"));
router.use("/transfer-method", auth.required, require("./TransferMethod"));
// router.use('/', auth.required, require('./'))

//
router.use("/ai", auth.required, require("./AI"));
router.use(
  "/goat-estral-activity-detail",
  auth.required,
  require("./GoatEstralActivityDetail")
);
router.use("/pregnancy-checkup", auth.required, require("./PregnancyCheckup"));
router.use("/abort-checkup", auth.required, require("./AbortCheckup"));
router.use("/give-birth", auth.required, require("./GiveBirth"));
router.use("/yearling", auth.required, require("./Yearling"));
router.use("/bcs-checkup", auth.required, require("./BCSCheckup"));
router.use("/progress-checkup", auth.required, require("./ProgressCheckup"));
router.use("/wean-milk", auth.required, require("./WeanMilk"));
router.use("/preset", auth.required, require("./Preset"));
router.use("/preset-detail", auth.required, require("./PresetDetail"));
router.use("/donor", auth.required, require("./Donor"));
router.use("/donor-activity", auth.required, require("./DonorActivity"));
router.use(
  "/donor-collect-embryo",
  auth.required,
  require("./DonorCollectEmbryo")
);
router.use(
  "/donor-collect-embryo-detail",
  auth.required,
  require("./DonorCollectEmbryoDetail")
);
router.use("/recipient", auth.required, require("./Recipient"));
router.use(
  "/recipient-activity",
  auth.required,
  require("./RecipientActivity")
);
router.use("/transfer-embryo", auth.required, require("./TransferEmbryo"));

router.use(
  "/distribution-reason",
  auth.required,
  require("./DistributionReason")
);
router.use("/distribution", auth.required, require("./Distribution"));
router.use("/annual-goal", auth.required, require("./AnnualGoal"));
router.use("/concentrate", auth.required, require("./Concentrate"));
router.use("/roughages", auth.required, require("./Roughages"));
router.use("/tmr-formula", auth.required, require("./TMRFormula"));
router.use("/feed-program", auth.required, require("./FeedProgram"));
router.use(
  "/feed-program-detail",
  auth.required,
  require("./FeedProgramDetail")
);
router.use(
  "/feed-program-progress",
  auth.required,
  require("./FeedProgramProgress")
);
router.use("/semen", auth.required, require("./Semen"));
router.use("/embryo", auth.required, require("./Embryo"));
router.use("/deworm-medicine", auth.required, require("./DewormMedicine"));
router.use("/vaccine", auth.required, require("./Vaccine"));
router.use("/disease", auth.required, require("./Disease"));
router.use("/vaccine-objective", auth.required, require("./VaccineObjective"));
router.use("/disease-result", auth.required, require("./DiseaseResult"));
router.use("/disease-method", auth.required, require("./DiseaseMethod"));
router.use("/disease-activity", auth.required, require("./DiseaseActivity"));
router.use(
  "/disease-activity-animal",
  auth.required,
  require("./DiseaseActivityAnimal")
);

router.use("/vaccine-activity", auth.required, require("./VaccineActivity"));
router.use("/deworm-activity", auth.required, require("./DewormActivity"));
router.use(
  "/reproduce-suggestion",
  auth.required,
  require("./ReproduceSuggestion")
);
router.use("/heat-type", auth.required, require("./HeatType"));
router.use("/heat-circle", auth.required, require("./HeatCircle"));
router.use("/ovary-symptom", auth.required, require("./OvarySymptom"));
router.use("/vagina-symptom", auth.required, require("./VaginaSymptom"));
router.use("/other-symptom", auth.required, require("./OtherSymptom"));
router.use("/cure-vitamin", auth.required, require("./CureVitamin"));
router.use("/cure-antibiotic", auth.required, require("./CureAntibiotic"));
router.use("/cure-hormone", auth.required, require("./CureHormone"));
router.use("/cause-health", auth.required, require("./CauseHealth"));
router.use("/cause-feeder", auth.required, require("./CauseFeeder"));
router.use("/cause-environment", auth.required, require("./CauseEnvironment"));
router.use("/cause-animal", auth.required, require("./CauseAnimal"));
router.use("/reproduce", auth.required, require("./Reproduce"));
router.use("/red-goat", auth.required, require("./RedGoat"));
router.use("/thaiblack", auth.required, require("./Thaiblack"));

router.use("/report", auth.required, require("./Report"));
router.use("/cure-activity", auth.required, require("./CureActivity"));
router.use("/cure-method", auth.required, require("./CureMethod"));
router.use("/cart", auth.required, require("./Cart"));

module.exports = router;
