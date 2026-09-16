const router = require('express').Router()
const { protect, requireRole } = require('../middleware/auth')
const { protectCustomer } = require('../controllers/customersController')
const ctrl = require('../controllers/reviewsController')

const STAFF_ROLES = ['admin', 'shop_manager', 'customer_service']

router.get('/', ctrl.list)
router.post('/', protectCustomer, ctrl.create)
router.post('/:id/status', protect, requireRole(...STAFF_ROLES), ctrl.updateStatus)
router.delete('/:id', protect, requireRole(...STAFF_ROLES), ctrl.remove)

module.exports = router
