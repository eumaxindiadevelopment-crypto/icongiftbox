const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const FeaturedNowSection = sequelize.define('FeaturedNowSection', {
  sectionTitle: { type: DataTypes.STRING, defaultValue: 'Featured now' },
  seeAllLink: { type: DataTypes.STRING, defaultValue: '/shop-list' },
  sliderItems: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'featured_now_sections' })

module.exports = withIdAlias(FeaturedNowSection)
