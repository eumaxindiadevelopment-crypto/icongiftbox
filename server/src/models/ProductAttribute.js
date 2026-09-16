const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const ProductAttribute = sequelize.define('ProductAttribute', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  name: DataTypes.STRING,
  visible: { type: DataTypes.BOOLEAN, defaultValue: true },
  options: { type: DataTypes.JSON, defaultValue: [] },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'product_attributes',
  timestamps: false,
})

module.exports = withIdAlias(ProductAttribute)
