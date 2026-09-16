const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const FeaturedCategory = sequelize.define('FeaturedCategory', {
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, defaultValue: '' },
  url: { type: DataTypes.STRING, defaultValue: '/shop' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'featured_categories' })

module.exports = withIdAlias(FeaturedCategory)
