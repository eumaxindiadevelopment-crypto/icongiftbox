const { fn, col } = require('sequelize')
const { Review, Product } = require('../models')

// Recomputes a product's averageRating/reviewCount from its approved reviews
// only — called whenever a review is approved/spammed/deleted, so the rollup
// never counts pending or rejected reviews.
async function recomputeProductRating(productId) {
  const result = await Review.findOne({
    where: { productId, status: 'approved' },
    attributes: [[fn('AVG', col('rating')), 'avg'], [fn('COUNT', col('id')), 'count']],
    raw: true,
  })
  const avg = Number(result?.avg || 0)
  const count = Number(result?.count || 0)
  await Product.update(
    { averageRating: Math.round(avg * 10) / 10, reviewCount: count },
    { where: { id: productId } }
  )
}

module.exports = { recomputeProductRating }
