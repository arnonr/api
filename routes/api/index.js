const router = require('express').Router()
const auth = require('../auth')

router.use('/production-status', auth.required, require('./productionStatus'))
router.use('/animal-source', auth.required, require('./animalSource'))
router.use('/distribution-status', auth.required, require('./distributionStatus'))
router.use('/distribution-cause', auth.required, require('./distributionCause'))
router.use('/work-on', auth.required, require('./workOn'))
router.use('/embryo-stage', auth.required, require('./embryoStage'))
router.use('/hormone', auth.required, require('./hormone'))
router.use('/give-birth-type', auth.required, require('./giveBirthType'))
router.use('/color', auth.required, require('./color'))
router.use('/semen', auth.required, require('./semen'))


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

module.exports = router