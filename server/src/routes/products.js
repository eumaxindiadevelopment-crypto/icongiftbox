const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/productsController')

router.get('/', ctrl.list)
router.get('/meta/tags', ctrl.metaTags)
router.get('/meta/price-range', ctrl.metaPriceRange)
router.get('/meta/attributes', ctrl.metaAttributes)
router.get('/meta/brands', ctrl.metaBrands)
router.get('/:id', ctrl.getOne)
router.post('/', protect, ctrl.create)
router.put('/:id', protect, ctrl.update)
router.delete('/:id', protect, ctrl.remove)
router.post('/bulk/delete', protect, ctrl.bulkDelete)
router.post('/bulk/update', protect, ctrl.bulkUpdate)

module.exports = router
