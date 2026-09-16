const router = require('express').Router()
const { protect, requireRole } = require('../middleware/auth')
const ctrl = require('../controllers/customersController')

const STAFF_ROLES = ['admin', 'shop_manager', 'customer_service']

router.post('/register', ctrl.register)
router.post('/login', ctrl.login)
router.get('/me', ctrl.protectCustomer, ctrl.me)
router.put('/me', ctrl.protectCustomer, ctrl.updateMe)
router.get('/me/orders', ctrl.protectCustomer, ctrl.myOrders)
router.get('/me/orders/:orderId', ctrl.protectCustomer, ctrl.myOrderDetail)

router.get('/', protect, requireRole(...STAFF_ROLES), ctrl.list)
router.post('/recompute-stats', protect, requireRole(...STAFF_ROLES), ctrl.recomputeStats)
router.get('/:id', protect, requireRole(...STAFF_ROLES), ctrl.getOne)
router.post('/', protect, requireRole(...STAFF_ROLES), ctrl.create)
router.put('/:id', protect, requireRole(...STAFF_ROLES), ctrl.update)
router.delete('/:id', protect, requireRole(...STAFF_ROLES), ctrl.remove)
router.get('/:id/orders', protect, requireRole(...STAFF_ROLES), ctrl.orders)

module.exports = router
