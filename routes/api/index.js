const router = require('express').Router()
const auth = require('../auth')

router.use('/country', auth.required, require('./Country'))
router.use('/region', auth.required, require('./Region'))
router.use('/province', auth.required, require('./Province'))
router.use('/amphur', auth.required, require('./Amphur'))
router.use('/tumbol', auth.required, require('./Tumbol'))

router.use('/occupation', auth.required, require('./Occupation'))
router.use('/education', auth.required, require('./Education'))
router.use('/title', auth.required, require('./Title'))
router.use('/gender', auth.required, require('./Gender'))

router.use('/ai-zone', auth.required, require('./AIZone'))
router.use('/organization-type', auth.required, require('./OrganizationType'))
router.use('/organization-zone', auth.required, require('./OrganizationZone'))
router.use('/organization', auth.required, require('./Organization'))


router.use('/position', auth.required, require('./Position'))
router.use('/position-type', auth.required, require('./PositionType'))
router.use('/married-status', auth.required, require('./MarriedStatus'))
router.use('/major', auth.required, require('./Major'))
router.use('/change-staff-info-log', auth.required, require('./ChangeStaffInfoLog'))
router.use('/login-log', auth.required, require('./LoginLog'))
router.use('/card-request-log', auth.required, require('./CardRequestLog'))

router.use('/user', require('./User'))
router.use('/staff', require('./Staff'))

router.use('/menu', auth.required, require('./Menu'))
router.use('/group', auth.required, require('./Group'))
router.use('/group-authorize', auth.required, require('./GroupAuthorize'))

router.use('/project', auth.required, require('./Project'))


router.use('/farm-status', auth.required, require('./FarmStatus'))
router.use('/farm', auth.required, require('./Farm'))
router.use('/farmer', auth.required, require('./Farmer'))

router.use('/animal-genre', auth.required, require('./AnimalGenre'))
router.use('/animal-sex', auth.required, require('./AnimalSex'))
router.use('/animal-group-type', auth.required, require('./AnimalGroupType'))
router.use('/animal-type', auth.required, require('./AnimalType'))
router.use('/animal-breed', auth.required, require('./AnimalBreed'))
router.use('/animal-status', auth.required, require('./AnimalStatus'))
router.use('/animal', auth.required, require('./Animal'))

// 
router.use('/bcs', auth.required, require('./BCS'))
router.use('/gun-depth', auth.required, require('./GunDepth'))
router.use('/goat-estral-activity', auth.required, require('./GoatEstralActivity'))
router.use('/source-type', auth.required, require('./SourceType'))
router.use('/abort-result', auth.required, require('./AbortResult'))
router.use('/embryo-stage', auth.required, require('./EmbryoStage'))
router.use('/give-birth-help', auth.required, require('./GiveBirthHelp'))
router.use('/pregnancy-check-method', auth.required, require('./PregnancyCheckMethod'))
router.use('/pregnancy-check-status', auth.required, require('./PregnancyCheckStatus'))
router.use('/preset-activity', auth.required, require('./PresetActivity'))
router.use('/transfer-method', auth.required, require('./TransferMethod'))
// router.use('/', auth.required, require('./'))

//
router.use('/ai', auth.required, require('./AI'))
router.use('/goat-estral-activity-detail', auth.required, require('./GoatEstralActivityDetail'))
router.use('/pregnancy-checkup', auth.required, require('./PregnancyCheckup'))
router.use('/abort-checkup', auth.required, require('./AbortCheckup'))
router.use('/give-birth', auth.required, require('./GiveBirth'))
router.use('/yearling', auth.required, require('./Yearling'))
router.use('/bcs-checkup', auth.required, require('./BCSCheckup'))
router.use('/progress-checkup', auth.required, require('./ProgressCheckup'))
router.use('/wean-milk', auth.required, require('./WeanMilk'))
router.use('/preset', auth.required, require('./Preset'))
router.use('/preset-detail', auth.required, require('./PresetDetail'))
router.use('/donor', auth.required, require('./Donor'))
router.use('/donor-activity', auth.required, require('./DonorActivity'))
router.use('/donor-collect-embryo', auth.required, require('./DonorCollectEmbryo'))
router.use('/donor-collect-embryo-detail', auth.required, require('./DonorCollectEmbryoDetail'))
router.use('/recipient', auth.required, require('./Recipient'))
router.use('/recipient-activity', auth.required, require('./RecipientActivity'))
router.use('/transfer-embryo', auth.required, require('./TransferEmbryo'))

router.use('/distribution-reason', auth.required, require('./DistributionReason'))

module.exports = router