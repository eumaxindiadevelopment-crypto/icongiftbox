const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/ordersController')

router.post('/guest', ctrl.guestCheckout)
router.get('/', protect, ctrl.list)
router.get('/:id', protect, ctrl.getOne)
router.post('/', protect, ctrl.create)
router.put('/:id', protect, ctrl.update)
router.post('/:id/status', protect, ctrl.updateStatus)
router.post('/:id/notes', protect, ctrl.addNote)
router.post('/bulk/status', protect, ctrl.bulkStatus)
router.post('/:id/refund', protect, ctrl.refund)

module.exports = router
