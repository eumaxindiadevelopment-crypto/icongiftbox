const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const ProductImage = sequelize.define('ProductImage', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  src: DataTypes.STRING,
  alt: DataTypes.STRING,
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'product_images',
  timestamps: false,
})

module.exports = withIdAlias(ProductImage)
