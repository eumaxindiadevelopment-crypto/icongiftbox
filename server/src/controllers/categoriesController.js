const { Category } = require('../models')

const PARENT_INCLUDE = [{ model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] }]

async function list(req, res, next) {
  try {
    // count is denormalized on the Category row (kept in sync by the product
    // routes — see utils/categoryCounts.js) instead of aggregating the whole
    // products table on every request.
    const categories = await Category.findAll({
      include: PARENT_INCLUDE,
      order: [['name', 'ASC']],
    })
    res.json(categories)
  } catch (err) { next(err) }
}

// GET /api/categories/:idOrSlug — public, resolves either a numeric id or a slug
// (used by category landing pages for breadcrumb/meta before products load).
// Includes the parent (if any) so a subcategory page's breadcrumb doesn't
// need a second request.
async function getOne(req, res, next) {
  try {
    const { idOrSlug } = req.params
    const category = /^\d+$/.test(idOrSlug)
      ? await Category.findByPk(idOrSlug, { include: PARENT_INCLUDE })
      : await Category.findOne({ where: { slug: idOrSlug }, include: PARENT_INCLUDE })
    if (!category) return res.status(404).json({ error: 'Category not found' })
    res.json(category)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const category = await Category.create(req.body)
    res.status(201).json(category)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id)
    if (!category) return res.status(404).json({ error: 'Category not found' })
    await category.update(req.body)
    res.json(category)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id)
    if (category) await category.destroy()
    res.json({ message: 'Category deleted' })
  } catch (err) { next(err) }
}

module.exports = { list, getOne, create, update, remove }
