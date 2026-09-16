// Sequelize serializes DECIMAL columns as strings (to avoid float precision
// loss), unlike the old Mongoose Number fields — every price/total/amount
// column across the schema, listed here by bare column name so nested
// eager-loaded rows (order line items, variations, etc.) get converted too.
const DECIMAL_FIELD_NAMES = new Set([
  'price', 'regularPrice', 'salePrice', 'total', 'subtotal', 'tax',
  'shippingTotal', 'discountTotal', 'taxTotal', 'discount', 'amount',
  'minimumAmount', 'maximumAmount', 'totalSpent', 'averageOrderValue',
])

// Renames each Sequelize model's own `id` PK to `_id` (stringified) in JSON
// output, recursing into eager-loaded associations, so every response keeps
// the shape the frontend/admin already expect from the old Mongoose ids.
function remapIds(value) {
  if (Array.isArray(value)) return value.map(remapIds)
  if (value instanceof Date) return value
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, val] of Object.entries(value)) {
      if (key === 'id' && (typeof val === 'number' || typeof val === 'string')) {
        out._id = String(val)
        continue
      }
      if (DECIMAL_FIELD_NAMES.has(key) && typeof val === 'string') {
        out[key] = Number(val)
        continue
      }
      out[key] = remapIds(val)
    }
    return out
  }
  return value
}

function withIdAlias(Model) {
  Model.prototype.toJSON = function toJSON() {
    return remapIds(this.get({ plain: true }))
  }
  return Model
}

module.exports = { withIdAlias, remapIds }
