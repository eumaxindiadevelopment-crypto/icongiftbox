const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/offerSectionController')

router.get('/', ctrl.get)
router.put('/', protect, ctrl.update)

module.exports = router
