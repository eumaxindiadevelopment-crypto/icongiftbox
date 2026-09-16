const { Category, ProductCategory } = require('../models')

// Applies +delta or -delta to Category.count for each category id, tallying
// duplicates first so a batch of ids (e.g. from several deleted products) only
// issues one update per distinct category instead of one per occurrence.
async function adjustCategoryCounts(categoryIds, delta) {
  const tally = new Map()
  ;(categoryIds || []).forEach((id) => {
    if (!id) return
    const key = id.toString()
    tally.set(key, (tally.get(key) || 0) + delta)
  })
  if (!tally.size) return
  await Promise.all(
    [...tally.entries()].map(([id, amount]) =>
      Category.increment('count', { by: amount, where: { id } })
    )
  )
}

// Recomputes count from scratch for the given category ids by counting products
// that currently reference them. Used where the before/after category diff for
// a mutation can't be tracked per-row (bulk category reassignment) or at
// server startup to correct any drift.
async function recomputeCategoryCounts(categoryIds) {
  const ids = [...new Set((categoryIds || []).map((id) => id?.toString()).filter(Boolean))]
  if (!ids.length) return
  const counts = await ProductCategory.findAll({
    where: { categoryId: ids },
    attributes: ['categoryId', [ProductCategory.sequelize.fn('COUNT', ProductCategory.sequelize.col('productId')), 'count']],
    group: ['categoryId'],
    raw: true,
  })
  const countMap = new Map(counts.map((c) => [c.categoryId.toString(), Number(c.count)]))
  await Promise.all(
    ids.map((id) => Category.update({ count: countMap.get(id) || 0 }, { where: { id } }))
  )
}

// Recomputes count for every category — cheap enough to run once at server
// startup (see seed.js) but too slow to run on every GET /api/categories
// request once the catalog grows, which is why the route now just reads the
// stored field instead of aggregating live.
async function recomputeAllCategoryCounts() {
  const categories = await Category.findAll({ attributes: ['id'] })
  await recomputeCategoryCounts(categories.map((c) => c.id))
}

module.exports = { adjustCategoryCounts, recomputeCategoryCounts, recomputeAllCategoryCounts }
