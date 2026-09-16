const { Enquiry } = require('../models')

// Public — submitted from the "Talk to Our Corporate Gifting Experts" popup.
async function create(req, res, next) {
  try {
    const { fullName, phone, email, city, giftingFor, budgetPerGift, quantityRequired, additionalInfo } = req.body
    if (!fullName || !phone || !city || !giftingFor || !budgetPerGift || !quantityRequired) {
      return res.status(400).json({ error: 'fullName, phone, city, giftingFor, budgetPerGift and quantityRequired are required' })
    }
    const enquiry = await Enquiry.create({
      fullName, phone, email, city, giftingFor, budgetPerGift, quantityRequired,
      additionalInfo: additionalInfo || null,
    })
    res.status(201).json(enquiry)
  } catch (err) { next(err) }
}

// Admin — paginated list, optionally filtered by status.
async function list(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = {}
    if (status) where.status = status

    const { rows, count } = await Enquiry.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: +limit,
      offset: (+page - 1) * +limit,
    })
    res.json({ enquiries: rows, total: count, page: +page, pages: Math.ceil(count / +limit) })
  } catch (err) { next(err) }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body
    const enquiry = await Enquiry.findByPk(req.params.id)
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' })
    await enquiry.update({ status })
    res.json(enquiry)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await Enquiry.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Enquiry deleted' })
  } catch (err) { next(err) }
}

module.exports = { create, list, updateStatus, remove }
