const { Coupon } = require('../models')

async function list(req, res, next) {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] })
    res.json(coupons)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json(coupon)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const coupon = await Coupon.findByPk(req.params.id)
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' })
    await coupon.update(req.body)
    res.json(coupon)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const coupon = await Coupon.findByPk(req.params.id)
    if (coupon) await coupon.destroy()
    res.json({ message: 'Coupon deleted' })
  } catch (err) { next(err) }
}

module.exports = { list, create, update, remove }
