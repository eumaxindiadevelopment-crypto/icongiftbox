const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/attributesController')

router.get('/', ctrl.list)
router.get('/:id', ctrl.getOne)
router.post('/', protect, ctrl.create)
router.put('/:id', protect, ctrl.update)
router.delete('/:id', protect, ctrl.remove)

router.post('/:id/terms', protect, ctrl.addTerm)
router.put('/:id/terms/:termId', protect, ctrl.updateTerm)
router.delete('/:id/terms/:termId', protect, ctrl.removeTerm)

module.exports = router
