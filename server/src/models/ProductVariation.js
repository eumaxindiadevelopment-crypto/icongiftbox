const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const ProductVariation = sequelize.define('ProductVariation', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  attributes: { type: DataTypes.JSON, defaultValue: {} },
  sku: DataTypes.STRING,
  price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  regularPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  stockStatus: { type: DataTypes.ENUM('instock', 'outofstock', 'onbackorder'), defaultValue: 'instock' },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue('images')
      // Legacy rows were seeded with double-JSON-encoded strings in places
      // (e.g. "{\"src\":...}" instead of a real {src,...} object), so each
      // element — and the top-level value itself — may need one JSON.parse
      // pass before it's usable.
      const coerce = (v) => {
        if (typeof v === 'string') {
          try { return coerce(JSON.parse(v)) } catch { return null }
        }
        return v
      }
      const parsed = coerce(raw)
      const arr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : [])
      return arr.map(coerce).filter(Boolean)
    },
  },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'product_variations',
  timestamps: false,
})

module.exports = withIdAlias(ProductVariation)
