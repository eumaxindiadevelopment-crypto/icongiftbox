const { Attribute, AttributeTerm } = require('../models')

const INCLUDE_TERMS = [{ model: AttributeTerm, as: 'terms' }]

async function list(req, res, next) {
  try {
    const attributes = await Attribute.findAll({ include: INCLUDE_TERMS, order: [['name', 'ASC']] })
    res.json(attributes)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const attribute = await Attribute.findByPk(req.params.id, { include: INCLUDE_TERMS })
    if (!attribute) return res.status(404).json({ error: 'Attribute not found' })
    res.json(attribute)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const attribute = await Attribute.create(req.body)
    res.status(201).json(attribute)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const attribute = await Attribute.findByPk(req.params.id)
    if (!attribute) return res.status(404).json({ error: 'Attribute not found' })
    await attribute.update(req.body)
    res.json(attribute)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const attribute = await Attribute.findByPk(req.params.id)
    if (attribute) await attribute.destroy()
    res.json({ message: 'Attribute deleted' })
  } catch (err) { next(err) }
}

async function addTerm(req, res, next) {
  try {
    const attribute = await Attribute.findByPk(req.params.id)
    if (!attribute) return res.status(404).json({ error: 'Attribute not found' })
    const term = await AttributeTerm.create({ ...req.body, attributeId: attribute.id })
    res.status(201).json(term)
  } catch (err) { next(err) }
}

async function updateTerm(req, res, next) {
  try {
    const term = await AttributeTerm.findOne({ where: { id: req.params.termId, attributeId: req.params.id } })
    if (!term) return res.status(404).json({ error: 'Term not found' })
    await term.update(req.body)
    res.json(term)
  } catch (err) { next(err) }
}

async function removeTerm(req, res, next) {
  try {
    const term = await AttributeTerm.findOne({ where: { id: req.params.termId, attributeId: req.params.id } })
    if (term) await term.destroy()
    res.json({ message: 'Term deleted' })
  } catch (err) { next(err) }
}

module.exports = { list, getOne, create, update, remove, addTerm, updateTerm, removeTerm }
