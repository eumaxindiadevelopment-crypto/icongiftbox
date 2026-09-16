const jwt = require('jsonwebtoken')
const { Review, Product, Customer, Category } = require('../models')
const { recomputeProductRating } = require('../utils/reviewStats')

const PRODUCT_INCLUDE = {
  model: Product,
  as: 'product',
  attributes: ['id', 'name', 'slug'],
  include: [{
    model: Category,
    as: 'primaryCategory',
    attributes: ['id', 'name', 'slug'],
    include: [{ model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] }],
  }],
}

// Distinguishes staff tokens from customer tokens (unlike products' soft
// checkIsAdmin, reviews must NOT let a logged-in customer see other people's
// pending/spam reviews, so the role is checked, not just token validity).
function checkIsStaff(req) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return false
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.role !== 'customer'
  } catch { return false }
}

async function list(req, res, next) {
  try {
    const { productId, status } = req.query
    const where = {}
    if (productId) where.productId = productId
    if (checkIsStaff(req)) {
      if (status) where.status = status
    } else {
      where.status = 'approved'
    }
    const reviews = await Review.findAll({
      where,
      include: [PRODUCT_INCLUDE],
      order: [['createdAt', 'DESC']],
    })
    res.json(reviews)
  } catch (err) { next(err) }
}

// Customer-submitted — requires login (protectCustomer), always starts pending.
async function create(req, res, next) {
  try {
    const { productId, rating, title, comment } = req.body
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'productId, rating and comment are required' })
    }
    const [product, customer] = await Promise.all([
      Product.findByPk(productId),
      Customer.findByPk(req.user.id),
    ])
    if (!product) return res.status(404).json({ error: 'Product not found' })
    const review = await Review.create({
      productId,
      customerId: req.user.id,
      authorName: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Customer',
      authorEmail: customer?.email,
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title || null,
      comment,
      status: 'pending',
    })
    res.status(201).json(review)
  } catch (err) { next(err) }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body
    const review = await Review.findByPk(req.params.id)
    if (!review) return res.status(404).json({ error: 'Review not found' })
    await review.update({ status })
    await recomputeProductRating(review.productId)
    res.json(review)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const review = await Review.findByPk(req.params.id)
    if (review) {
      const { productId } = review
      await review.destroy()
      await recomputeProductRating(productId)
    }
    res.json({ message: 'Review deleted' })
  } catch (err) { next(err) }
}

module.exports = { list, create, updateStatus, remove }
