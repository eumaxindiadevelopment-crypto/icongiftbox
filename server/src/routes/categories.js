const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/categoriesController')

router.get('/', ctrl.list)
router.get('/:idOrSlug', ctrl.getOne)
router.post('/', protect, ctrl.create)
router.put('/:id', protect, ctrl.update)
router.delete('/:id', protect, ctrl.remove)

module.exports = router
