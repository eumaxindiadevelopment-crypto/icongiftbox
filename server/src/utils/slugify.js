function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Appends -2, -3, ... to baseSlug until it doesn't collide with an existing
// row on Model (excluding the row being updated, if any).
async function uniqueSlug(Model, baseSlug, { excludeId } = {}) {
  let slug = baseSlug
  let n = 2
  while (true) {
    const where = { slug }
    if (excludeId) {
      const { Op } = require('sequelize')
      where.id = { [Op.ne]: excludeId }
    }
    const existing = await Model.findOne({ where, attributes: ['id'] })
    if (!existing) return slug
    slug = `${baseSlug}-${n}`
    n += 1
  }
}

module.exports = { slugify, uniqueSlug }
