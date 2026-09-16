const { FeaturedCategory } = require('../models')

async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isActive: true }
    const items = await FeaturedCategory.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function create(req, res) {
  try {
    const count = await FeaturedCategory.count()
    const item = await FeaturedCategory.create({ ...req.body, sortOrder: req.body.sortOrder ?? count })
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function update(req, res) {
  try {
    const item = await FeaturedCategory.findByPk(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    await item.update(req.body)
    res.json(item)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function remove(req, res) {
  try {
    const item = await FeaturedCategory.findByPk(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    await item.destroy()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { list, create, update, remove }
