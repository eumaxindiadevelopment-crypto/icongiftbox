const { fn, col } = require('sequelize')
const { Tag, ProductTag } = require('../models')

async function withCounts(tags) {
  const counts = await ProductTag.findAll({
    attributes: ['tag', [fn('COUNT', col('id')), 'count']],
    group: ['tag'],
    raw: true,
  })
  const countMap = new Map(counts.map((c) => [c.tag, Number(c.count)]))
  return tags.map((t) => {
    const json = t.toJSON()
    json.count = countMap.get(json.name) || 0
    return json
  })
}

async function list(req, res, next) {
  try {
    const tags = await Tag.findAll({ order: [['name', 'ASC']] })
    res.json(await withCounts(tags))
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const { idOrSlug } = req.params
    const tag = /^\d+$/.test(idOrSlug)
      ? await Tag.findByPk(idOrSlug)
      : await Tag.findOne({ where: { slug: idOrSlug } })
    if (!tag) return res.status(404).json({ error: 'Tag not found' })
    const [withCount] = await withCounts([tag])
    res.json(withCount)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const tag = await Tag.create(req.body)
    res.status(201).json(tag)
  } catch (err) { next(err) }
}

// Renaming a tag cascades into every product currently tagged with the old name.
async function update(req, res, next) {
  try {
    const tag = await Tag.findByPk(req.params.id)
    if (!tag) return res.status(404).json({ error: 'Tag not found' })
    const oldName = tag.name
    await tag.update(req.body)
    if (req.body.name && req.body.name !== oldName) {
      await ProductTag.update({ tag: req.body.name }, { where: { tag: oldName } })
    }
    res.json(tag)
  } catch (err) { next(err) }
}

// Deleting a tag removes it from every product it's currently assigned to.
async function remove(req, res, next) {
  try {
    const tag = await Tag.findByPk(req.params.id)
    if (tag) {
      await ProductTag.destroy({ where: { tag: tag.name } })
      await tag.destroy()
    }
    res.json({ message: 'Tag deleted' })
  } catch (err) { next(err) }
}

module.exports = { list, getOne, create, update, remove }
