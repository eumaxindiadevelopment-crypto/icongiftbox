const jwt = require('jsonwebtoken')
const { Op, fn, col } = require('sequelize')
const { Customer } = require('../models')
const ordersRepo = require('../db/ordersRepository')
const { recomputeAllCustomerStats } = require('../utils/customerStats')
const { protect } = require('../middleware/auth')

const sign = (customer) => jwt.sign(
  { id: customer.id, email: customer.email, role: 'customer' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

const safeCustomer = (customer) => ({
  id: customer.id,
  firstName: customer.firstName,
  lastName: customer.lastName,
  email: customer.email,
  phone: customer.phone,
  billingAddress: customer.billingAddress,
  shippingAddress: customer.shippingAddress,
  totalOrders: customer.totalOrders,
  totalSpent: customer.totalSpent,
})

const protectCustomer = (req, res, next) => {
  protect(req, res, () => {
    if (req.user?.role !== 'customer') return res.status(403).json({ error: 'Customer access only' })
    next()
  })
}

async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, phone } = req.body
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'firstName, lastName, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    const existing = await Customer.findOne({ where: { email: email.toLowerCase() } })
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' })
    const customer = await Customer.create({ firstName, lastName, email, password, phone })
    res.status(201).json({ token: sign(customer), customer: safeCustomer(customer) })
  } catch (err) { next(err) }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const customer = await Customer.scope('withPassword').findOne({ where: { email: email?.toLowerCase() } })
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    res.json({ token: sign(customer), customer: safeCustomer(customer) })
  } catch (err) { next(err) }
}

async function me(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.user.id)
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    res.json(safeCustomer(customer))
  } catch (err) { next(err) }
}

const ME_EDITABLE_FIELDS = ['firstName', 'lastName', 'phone', 'billingAddress', 'shippingAddress']

async function updateMe(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.user.id)
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    const patch = {}
    ME_EDITABLE_FIELDS.forEach((f) => { if (req.body[f] !== undefined) patch[f] = req.body[f] })
    await customer.update(patch)
    res.json(safeCustomer(customer))
  } catch (err) { next(err) }
}

async function list(req, res, next) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const where = {}
    if (search) where[Op.or] = [{ firstName: { [Op.like]: `%${search}%` } }, { lastName: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
    if (status) where.status = status
    const [customers, total, summaryRow] = await Promise.all([
      Customer.findAll({ where, order: [['createdAt', 'DESC']], limit: +limit, offset: (+page - 1) * +limit }),
      Customer.count({ where }),
      Customer.findOne({
        where,
        attributes: [
          [fn('AVG', col('totalOrders')), 'avgOrders'],
          [fn('AVG', col('totalSpent')), 'avgLifetimeSpend'],
          [fn('AVG', col('averageOrderValue')), 'avgOrderValue'],
        ],
        raw: true,
      }),
    ])
    res.json({
      customers,
      total,
      page: +page,
      pages: Math.max(1, Math.ceil(total / +limit)),
      summary: {
        avgOrders: Number(summaryRow?.avgOrders || 0),
        avgLifetimeSpend: Number(summaryRow?.avgLifetimeSpend || 0),
        avgOrderValue: Number(summaryRow?.avgOrderValue || 0),
      },
    })
  } catch (err) { next(err) }
}

async function recomputeStats(req, res, next) {
  try {
    await recomputeAllCustomerStats()
    res.json({ message: 'Customer stats recomputed', updatedAt: new Date().toISOString() })
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.params.id)
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    res.json(customer)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const customer = await Customer.create(req.body)
    res.status(201).json(customer)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.params.id)
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    await customer.update(req.body)
    res.json(customer)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.params.id)
    if (customer) await customer.destroy()
    res.json({ message: 'Customer deleted' })
  } catch (err) { next(err) }
}

async function orders(req, res, next) {
  try {
    const items = await ordersRepo.getOrdersByCustomer(req.params.id)
    res.json(items)
  } catch (err) { next(err) }
}

// Customer-facing "my orders" — scoped to the logged-in customer via their JWT,
// not the staff-only :id routes above.
async function myOrders(req, res, next) {
  try {
    const items = await ordersRepo.getOrdersByCustomer(req.user.id)
    res.json(items)
  } catch (err) { next(err) }
}

async function myOrderDetail(req, res, next) {
  try {
    const order = await ordersRepo.getOrderById(req.params.orderId)
    if (!order || order.customerId !== String(req.user.id)) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json(order)
  } catch (err) { next(err) }
}

module.exports = { register, login, me, updateMe, list, getOne, create, update, remove, orders, myOrders, myOrderDetail, recomputeStats, protectCustomer }
