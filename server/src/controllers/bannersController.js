const { Banner } = require('../models')

// GET /api/banners — public, returns active banners sorted by order
async function list(req, res) {
  try {
    const { all } = req.query
    const where = all === 'true' ? {} : { isActive: true }
    const banners = await Banner.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] })
    res.json(banners)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getOne(req, res) {
  try {
    const banner = await Banner.findByPk(req.params.id)
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    res.json(banner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function create(req, res) {
  try {
    const count = await Banner.count()
    const banner = await Banner.create({ ...req.body, sortOrder: req.body.sortOrder ?? count })
    res.status(201).json(banner)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function update(req, res) {
  try {
    const banner = await Banner.findByPk(req.params.id)
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    await banner.update(req.body)
    res.json(banner)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function remove(req, res) {
  try {
    const banner = await Banner.findByPk(req.params.id)
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    await banner.destroy()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { list, getOne, create, update, remove }
