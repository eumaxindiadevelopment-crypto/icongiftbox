const repo = require('../db/ordersRepository')
const { applyOrderToCustomer } = require('../utils/customerStats')

// Public guest checkout — no auth required, but accepts an optional customerId
// so a logged-in customer's order still gets linked and rolled into their stats.
async function guestCheckout(req, res, next) {
  try {
    const { billingAddress, lineItems, notes, paymentMethod, customerId } = req.body
    if (!lineItems || lineItems.length === 0)
      return res.status(400).json({ error: 'Cart is empty' })

    const { id, orderNumber, total } = await repo.createGuestOrder({ billingAddress, lineItems, notes, paymentMethod, customerId })
    if (customerId) await applyOrderToCustomer(customerId, { total, billingAddress })
    res.status(201).json({ success: true, orderId: id, orderNumber })
  } catch (err) { next(err) }
}

async function list(req, res, next) {
  try {
    const { status, page = 1, limit = 20, dateFrom, dateTo, search } = req.query
    const data = await repo.getOrders({ status, page, limit, dateFrom, dateTo, search })
    res.json(data)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const order = await repo.getOrderById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const order = await repo.createOrder(req.body)
    res.status(201).json(order)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const order = await repo.updateOrder(req.params.id, req.body)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) { next(err) }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body
    const order = await repo.updateOrderStatus(req.params.id, status)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) { next(err) }
}

async function addNote(req, res, next) {
  try {
    const { note, customerNote = false } = req.body
    const order = await repo.addOrderNote(req.params.id, { author: req.user.email, note, customerNote })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) { next(err) }
}

async function bulkStatus(req, res, next) {
  try {
    const { ids, status } = req.body
    await repo.bulkUpdateStatus(ids, status)
    res.json({ message: `${ids.length} orders updated to ${status}` })
  } catch (err) { next(err) }
}

async function refund(req, res, next) {
  try {
    const order = await repo.refundOrder(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) { next(err) }
}

module.exports = { guestCheckout, list, getOne, create, update, updateStatus, addNote, bulkStatus, refund }
