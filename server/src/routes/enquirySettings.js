const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/enquirySettingsController')

// GET is public — the frontend popup reads this before deciding whether/when to show.
router.get('/', ctrl.get)
router.put('/', protect, ctrl.update)

module.exports = router
