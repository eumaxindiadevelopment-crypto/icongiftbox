const { Brand } = require('../models')

async function list(req, res, next) {
  try {
    const brands = await Brand.findAll({ order: [['name', 'ASC']] })
    res.json(brands)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const { idOrSlug } = req.params
    const brand = /^\d+$/.test(idOrSlug)
      ? await Brand.findByPk(idOrSlug)
      : await Brand.findOne({ where: { slug: idOrSlug } })
    if (!brand) return res.status(404).json({ error: 'Brand not found' })
    res.json(brand)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const brand = await Brand.create(req.body)
    res.status(201).json(brand)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const brand = await Brand.findByPk(req.params.id)
    if (!brand) return res.status(404).json({ error: 'Brand not found' })
    await brand.update(req.body)
    res.json(brand)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const brand = await Brand.findByPk(req.params.id)
    if (brand) await brand.destroy()
    res.json({ message: 'Brand deleted' })
  } catch (err) { next(err) }
}

module.exports = { list, getOne, create, update, remove }
