const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/enquiriesController')

router.post('/', ctrl.create)
router.get('/', protect, ctrl.list)
router.patch('/:id', protect, ctrl.updateStatus)
router.delete('/:id', protect, ctrl.remove)

module.exports = router
