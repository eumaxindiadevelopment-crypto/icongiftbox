const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')
const { slugify, uniqueSlug } = require('../utils/slugify')

const Product = sequelize.define('Product', {
  wcProductId: { type: DataTypes.INTEGER, unique: true, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: true },
  description: DataTypes.TEXT,
  shortDescription: DataTypes.TEXT,
  sku: { type: DataTypes.STRING, unique: true, allowNull: true },
  price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  regularPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  salePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  onSale: { type: DataTypes.BOOLEAN, defaultValue: false },
  inStock: { type: DataTypes.BOOLEAN, defaultValue: true },
  stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  stockStatus: { type: DataTypes.ENUM('instock', 'outofstock', 'onbackorder'), defaultValue: 'instock' },
  brandId: { type: DataTypes.INTEGER, allowNull: true },
  // Which of the product's (possibly several) categories its canonical SEO
  // URL and breadcrumb are built from. Not just "first in categories[]" —
  // that array has no stable order (no sortOrder column on the join table),
  // so the canonical URL would silently drift between saves without this.
  primaryCategoryId: { type: DataTypes.INTEGER, allowNull: true },
  type: { type: DataTypes.ENUM('simple', 'variable'), defaultValue: 'simple' },
  variationOptions: { type: DataTypes.JSON, defaultValue: [] },
  weight: DataTypes.STRING,
  dimensions: { type: DataTypes.JSON, defaultValue: null },
  taxStatus: { type: DataTypes.ENUM('taxable', 'shipping', 'none'), defaultValue: 'taxable' },
  taxClass: DataTypes.STRING,
  managedInventory: { type: DataTypes.BOOLEAN, defaultValue: false },
  backorderAllowed: { type: DataTypes.BOOLEAN, defaultValue: false },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('publish', 'draft', 'pending', 'trash'), defaultValue: 'draft' },
  visibility: { type: DataTypes.ENUM('public', 'private'), defaultValue: 'public' },
  catalogVisibility: { type: DataTypes.ENUM('visible', 'catalog', 'search', 'hidden'), defaultValue: 'visible' },
  publishedAt: DataTypes.DATE,
  syncedAt: DataTypes.DATE,
  metaTitle: DataTypes.STRING,
  metaDescription: DataTypes.STRING,
  averageRating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'products',
  hooks: {
    beforeValidate: async (product) => {
      if (!product.slug && product.name) product.slug = slugify(product.name)
      // Guard on product.slug being present — see Category.js for why
      // changed('slug') alone isn't safe against partial bulk updates.
      if (product.slug && (product.changed('slug') || product.isNewRecord)) {
        product.slug = await uniqueSlug(Product, product.slug, { excludeId: product.id })
      }
    },
  },
})

module.exports = withIdAlias(Product)
