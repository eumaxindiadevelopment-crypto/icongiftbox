const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/settingsController')

router.get('/public/currency', ctrl.getPublicCurrency)
router.get('/exchange-rates', protect, ctrl.getExchangeRates)
router.post('/exchange-rates/refresh', protect, ctrl.refreshExchangeRates)
router.get('/:key', protect, ctrl.get)
router.put('/:key', protect, ctrl.update)

module.exports = router
