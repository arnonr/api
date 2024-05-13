const router = require("express").Router();
const auth = require("../auth");

router.use("/country", require("./Country"));
router.use("/region", require("./Region"));
router.use("/province", require("./Province"));
router.use("/amphur", require("./Amphur"));
router.use("/tumbol", require("./Tumbol"));

router.use("/occupation", require("./Occupation"));
router.use("/education", require("./Education"));
router.use("/title", require("./Title"));
router.use("/gender", require("./Gender"));

router.use("/ai-zone", require("./AIZone"));
router.use("/organization-type", require("./OrganizationType"));
router.use("/organization-zone", require("./OrganizationZone"));
router.use("/organization", require("./Organization"));

router.use("/position", require("./Position"));
router.use("/position-type", require("./PositionType"));
router.use("/married-status", require("./MarriedStatus"));
router.use("/major", require("./Major"));
router.use("/news", require("./News"));
router.use("/user-farmer", require("./UserFarmer"));

router.use("/change-staff-info-log", require("./ChangeStaffInfoLog"));
router.use("/login-log", require("./LoginLog"));
router.use("/card-request-log", require("./CardRequestLog"));

router.use("/user", require("./User"));
router.use("/staff", require("./Staff"));

router.use("/menu", require("./Menu"));
router.use("/group", require("./Group"));
router.use("/group-authorize", require("./GroupAuthorize"));

router.use("/project", require("./Project"));

router.use("/farm-status", require("./FarmStatus"));
router.use("/farm", require("./Farm"));
router.use("/farmer", require("./Farmer"));

router.use("/animal-genre", require("./AnimalGenre"));
router.use("/animal-sex", require("./AnimalSex"));
router.use("/animal-group-type", require("./AnimalGroupType"));
router.use("/animal-type", require("./AnimalType"));
router.use("/animal-breed", require("./AnimalBreed"));
router.use("/animal-status", require("./AnimalStatus"));

router.use("/animal", require("./Animal"));

//
router.use("/bcs", require("./BCS"));
router.use("/gun-depth", require("./GunDepth"));
router.use("/goat-estral-activity", require("./GoatEstralActivity"));
router.use("/source-type", require("./SourceType"));
router.use("/abort-result", require("./AbortResult"));
router.use("/embryo-stage", require("./EmbryoStage"));
router.use("/give-birth-help", require("./GiveBirthHelp"));
router.use("/pregnancy-check-method", require("./PregnancyCheckMethod"));
router.use("/pregnancy-check-status", require("./PregnancyCheckStatus"));
router.use("/preset-activity", require("./PresetActivity"));
router.use("/transfer-method", require("./TransferMethod"));
// router.use('/', auth.required, require('./'))

//
router.use("/ai", require("./AI"));

router.use(
  "/goat-estral-activity-detail",
  require("./GoatEstralActivityDetail")
);
router.use("/pregnancy-checkup", require("./PregnancyCheckup"));
router.use("/abort-checkup", require("./AbortCheckup"));
router.use("/give-birth", require("./GiveBirth"));
router.use("/yearling", require("./Yearling"));
router.use("/bcs-checkup", require("./BCSCheckup"));
router.use("/progress-checkup", require("./ProgressCheckup"));
router.use("/wean-milk", require("./WeanMilk"));
router.use("/preset", require("./Preset"));
router.use("/preset-detail", require("./PresetDetail"));
router.use("/donor", require("./Donor"));
router.use("/donor-activity", require("./DonorActivity"));
router.use("/donor-collect-embryo", require("./DonorCollectEmbryo"));
router.use(
  "/donor-collect-embryo-detail",
  require("./DonorCollectEmbryoDetail")
);
router.use("/recipient", require("./Recipient"));
router.use("/recipient-activity", require("./RecipientActivity"));
router.use("/transfer-embryo", require("./TransferEmbryo"));

router.use("/distribution-reason", require("./DistributionReason"));
router.use("/distribution", require("./Distribution"));
router.use("/annual-goal", require("./AnnualGoal"));
router.use("/concentrate", require("./Concentrate"));
router.use("/roughages", require("./Roughages"));
router.use("/tmr-formula", require("./TMRFormula"));
router.use("/feed-program", require("./FeedProgram"));
router.use("/feed-program-animal", require("./FeedProgramAnimal"));
router.use("/feed-program-progress", require("./FeedProgramProgress"));
router.use("/feed-program-progress-food", require("./FeedProgramProgressFood"));
router.use(
  "/feed-program-progress-animal",
  require("./FeedProgramProgressAnimal")
);
router.use("/food", require("./Food"));
router.use("/semen", require("./Semen"));
router.use("/embryo", require("./Embryo"));
router.use("/deworm-medicine", require("./DewormMedicine"));
router.use("/vaccine", require("./Vaccine"));
router.use("/disease", require("./Disease"));
router.use("/vaccine-objective", require("./VaccineObjective"));
router.use("/disease-result", require("./DiseaseResult"));
router.use("/disease-method", require("./DiseaseMethod"));
router.use("/disease-activity", require("./DiseaseActivity"));
router.use("/disease-activity-animal", require("./DiseaseActivityAnimal"));

router.use("/vaccine-activity", require("./VaccineActivity"));
router.use("/deworm-activity", require("./DewormActivity"));
router.use("/reproduce-suggestion", require("./ReproduceSuggestion"));
router.use("/heat-type", require("./HeatType"));
router.use("/heat-circle", require("./HeatCircle"));
router.use("/ovary-symptom", require("./OvarySymptom"));
router.use("/vagina-symptom", require("./VaginaSymptom"));
router.use("/other-symptom", require("./OtherSymptom"));
router.use("/cure-vitamin", require("./CureVitamin"));
router.use("/cure-antibiotic", require("./CureAntibiotic"));
router.use("/cure-hormone", require("./CureHormone"));
router.use("/cause-health", require("./CauseHealth"));
router.use("/cause-feeder", require("./CauseFeeder"));
router.use("/cause-environment", require("./CauseEnvironment"));
router.use("/cause-animal", require("./CauseAnimal"));
router.use("/reproduce", require("./Reproduce"));
router.use("/red-goat", require("./RedGoat"));
router.use("/thaiblack", require("./Thaiblack"));

router.use("/report", require("./Report"));
router.use("/cure-activity", require("./CureActivity"));
router.use("/cure-method", require("./CureMethod"));
router.use("/cart", require("./Cart"));

module.exports = router;
