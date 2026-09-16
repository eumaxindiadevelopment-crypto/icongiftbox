const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const ProductTag = sequelize.define('ProductTag', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  tag: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'product_tags',
  timestamps: false,
  indexes: [{ fields: ['tag'] }],
})

module.exports = withIdAlias(ProductTag)
