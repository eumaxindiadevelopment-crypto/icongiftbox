const pool = require('../config/mysqlPool')
const { Customer } = require('../models')

// Applies a single new order's totals onto its customer's running stats,
// called right after checkout instead of a full recompute (which would mean
// scanning every order on every purchase).
async function applyOrderToCustomer(customerId, { total, billingAddress }) {
  if (!customerId) return
  const customer = await Customer.findByPk(customerId)
  if (!customer) return
  const totalOrders = customer.totalOrders + 1
  const totalSpent = Number(customer.totalSpent) + Number(total)
  await customer.update({
    totalOrders,
    totalSpent,
    averageOrderValue: totalSpent / totalOrders,
    lastOrderDate: new Date(),
    billingAddress: billingAddress || customer.billingAddress,
  })
}

// Recomputes totalOrders/totalSpent/averageOrderValue/lastOrderDate for every
// customer from the actual wc_order_stats table (source of truth) — corrects
// any drift, e.g. from a status change or refund applied after checkout.
async function recomputeAllCustomerStats() {
  const [rows] = await pool.query(
    `SELECT customer_id, COUNT(*) AS orders, SUM(total_sales) AS spent, MAX(date_created) AS lastOrder
     FROM wc_order_stats WHERE customer_id IS NOT NULL GROUP BY customer_id`
  )
  const byCustomer = new Map(rows.map((r) => [r.customer_id, r]))
  const customers = await Customer.findAll({ attributes: ['id'] })
  await Promise.all(customers.map((c) => {
    const stats = byCustomer.get(c.id)
    const totalOrders = stats ? Number(stats.orders) : 0
    const totalSpent = stats ? Number(stats.spent) : 0
    return Customer.update({
      totalOrders,
      totalSpent,
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      lastOrderDate: stats?.lastOrder || null,
    }, { where: { id: c.id } })
  }))
}

module.exports = { applyOrderToCustomer, recomputeAllCustomerStats }
