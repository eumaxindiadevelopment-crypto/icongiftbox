const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/blockbusterController')

router.get('/', ctrl.get)
router.put('/', protect, ctrl.update)

module.exports = router
