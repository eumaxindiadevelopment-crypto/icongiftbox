const { Brand, Product } = require('../models')

// Adjusts Brand.count by +1/-1 when a product's brand is set/unset — mirrors
// utils/categoryCounts.js's adjustCategoryCounts, simplified for a single FK
// (a product has one brand, not many) instead of a many-to-many join table.
async function adjustBrandCount(brandId, delta) {
  if (!brandId) return
  await Brand.increment('count', { by: delta, where: { id: brandId } })
}

// Recomputes count from scratch for every brand — used at server startup to
// correct any drift, same rationale as recomputeAllCategoryCounts.
async function recomputeAllBrandCounts() {
  const brands = await Brand.findAll({ attributes: ['id'] })
  const counts = await Product.findAll({
    where: { brandId: brands.map((b) => b.id) },
    attributes: ['brandId', [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'count']],
    group: ['brandId'],
    raw: true,
  })
  const countMap = new Map(counts.map((c) => [c.brandId, Number(c.count)]))
  await Promise.all(
    brands.map((b) => Brand.update({ count: countMap.get(b.id) || 0 }, { where: { id: b.id } }))
  )
}

module.exports = { adjustBrandCount, recomputeAllBrandCounts }
