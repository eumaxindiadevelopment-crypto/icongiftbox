const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/notificationsController')

router.get('/', protect, ctrl.list)

module.exports = router
