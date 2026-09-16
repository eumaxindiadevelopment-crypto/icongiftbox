const { Tag } = require('../models')

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Auto-creates a canonical Tag row for any tag name a product is saved with,
// matching WooCommerce's real behaviour: typing a brand-new tag on the product
// screen creates the term, no separate trip to the Tags page required.
async function ensureTagsExist(tagNames) {
  for (const name of tagNames || []) {
    if (!name) continue
    const slug = slugify(name)
    const existing = await Tag.findOne({ where: { slug } })
    if (!existing) await Tag.create({ name, slug })
  }
}

module.exports = { ensureTagsExist, slugify }
