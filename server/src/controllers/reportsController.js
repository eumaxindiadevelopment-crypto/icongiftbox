const { fn, col } = require('sequelize')
const { sequelize, Product, Customer } = require('../models')
const ordersRepo = require('../db/ordersRepository')

async function sales(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query
    const statuses = ['completed', 'processing']

    const [summary, byMonth] = await Promise.all([
      ordersRepo.getOrderSummary({ dateFrom, dateTo, statuses }),
      ordersRepo.getRevenueSeries({ dateFrom, dateTo, statuses, groupBy: 'month' }),
    ])
    res.json({ summary, byMonth })
  } catch (err) { next(err) }
}

async function products(req, res, next) {
  try {
    const stats = await Product.findAll({
      attributes: [[col('stockStatus'), '_id'], [fn('COUNT', col('id')), 'count']],
      group: ['stockStatus'],
      raw: true,
    })
    res.json({ stockStats: stats.map(s => ({ _id: s._id, count: Number(s.count) })) })
  } catch (err) { next(err) }
}

async function customers(req, res, next) {
  try {
    const total = await Customer.count()
    const topCustomers = await Customer.findAll({
      order: [['totalSpent', 'DESC']],
      limit: 10,
      attributes: ['firstName', 'lastName', 'email', 'totalOrders', 'totalSpent'],
    })
    res.json({ total, topCustomers })
  } catch (err) { next(err) }
}

async function revenue(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query
    const data = await ordersRepo.getRevenueSeries({ dateFrom, dateTo, statuses: ['completed', 'processing', 'pending'], groupBy: 'day', limit: 90 })
    res.json(data)
  } catch (err) { next(err) }
}

async function categoryBreakdown(req, res, next) {
  try {
    const data = await sequelize.query(
      `SELECT COALESCE(c.name, 'Uncategorised') AS name, COUNT(DISTINCT p.id) AS count
       FROM products p
       LEFT JOIN product_categories pc ON pc.productId = p.id
       LEFT JOIN categories c ON c.id = pc.categoryId
       GROUP BY c.name
       ORDER BY count DESC
       LIMIT 6`,
      { type: sequelize.QueryTypes.SELECT }
    )
    const total = data.reduce((s, d) => s + Number(d.count), 0) || 1
    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
    res.json(data.map((d, i) => ({ name: d.name, value: Math.round((Number(d.count) / total) * 100), fill: COLORS[i % COLORS.length] })))
  } catch (err) { next(err) }
}

async function customerGrowth(req, res, next) {
  try {
    const data = await Customer.findAll({
      attributes: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), '_id'], [fn('COUNT', col('id')), 'new']],
      group: ['_id'],
      order: [[col('_id'), 'ASC']],
      limit: 12,
      raw: true,
    })
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    res.json(data.map(d => ({ month: MONTHS[parseInt(d._id.split('-')[1]) - 1] || d._id, new: Number(d.new), returning: 0 })))
  } catch (err) { next(err) }
}

async function dashboardStats(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query
    const statuses = ['completed', 'processing', 'pending']

    let prevFrom, prevTo
    if (dateFrom && dateTo) {
      const msFrom = new Date(dateFrom).getTime()
      const msTo = new Date(dateTo).getTime()
      const duration = msTo - msFrom
      prevFrom = new Date(msFrom - duration).toISOString()
      prevTo = new Date(msTo - duration).toISOString()
    }

    const [curRevenue, curCustomers, prevRevenue] = await Promise.all([
      ordersRepo.getOrderSummary({ dateFrom, dateTo, statuses }),
      Customer.count(),
      prevFrom ? ordersRepo.getOrderSummary({ dateFrom: prevFrom, dateTo: prevTo, statuses }) : Promise.resolve(null),
    ])

    const curRev = curRevenue.total
    const prevRev = Number(prevRevenue?.total || 0)
    const curOrd = curRevenue.count
    const prevOrd = Number(prevRevenue?.count || 0)

    const pct = (cur, prev) => prev === 0 ? null : Math.round(((cur - prev) / prev) * 100 * 10) / 10

    res.json({
      totalRevenue: curRev,
      totalOrders: curOrd,
      totalCustomers: curCustomers,
      avgOrderValue: curOrd > 0 ? curRev / curOrd : 0,
      changes: {
        revenue: pct(curRev, prevRev),
        orders: pct(curOrd, prevOrd),
      },
    })
  } catch (err) { next(err) }
}

module.exports = { sales, products, customers, revenue, categoryBreakdown, customerGrowth, dashboardStats }
