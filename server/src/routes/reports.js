const router = require('express').Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/reportsController')

router.get('/sales', protect, ctrl.sales)
router.get('/products', protect, ctrl.products)
router.get('/customers', protect, ctrl.customers)
router.get('/revenue', protect, ctrl.revenue)
router.get('/category-breakdown', protect, ctrl.categoryBreakdown)
router.get('/customer-growth', protect, ctrl.customerGrowth)
router.get('/dashboard/stats', protect, ctrl.dashboardStats)

module.exports = router
