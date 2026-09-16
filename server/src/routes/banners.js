const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/bannersController')

router.get('/', ctrl.list)
router.get('/:id', protect, ctrl.getOne)
router.post('/', protect, ctrl.create)
router.put('/:id', protect, ctrl.update)
router.delete('/:id', protect, ctrl.remove)

module.exports = router
