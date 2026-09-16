const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const DEFAULT_FILTER_TABS = [
  { label: 'All', category: 'ALL' },
  { label: 'Tops', category: 'Tops' },
  { label: 'Dress', category: 'Dress' },
  { label: 'Bottoms', category: 'Bottoms' },
  { label: 'Caps', category: 'Caps' },
]

const ProductSectionSettings = sequelize.define('ProductSectionSettings', {
  title: { type: DataTypes.STRING, defaultValue: 'Most popular products' },
  productCount: { type: DataTypes.INTEGER, defaultValue: 8 },
  filterTabs: { type: DataTypes.JSON, defaultValue: DEFAULT_FILTER_TABS },
}, { tableName: 'product_section_settings' })

module.exports = withIdAlias(ProductSectionSettings)
