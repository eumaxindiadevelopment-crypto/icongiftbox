const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const SponsoredSection = sequelize.define('SponsoredSection', {
  sectionTitle: { type: DataTypes.STRING, defaultValue: 'Brand' },
  seeAllLink: { type: DataTypes.STRING, defaultValue: '/shop-list' },
  slides: { type: DataTypes.JSON, defaultValue: [] },
  autoplay: { type: DataTypes.BOOLEAN, defaultValue: true },
  autoplayDelay: { type: DataTypes.INTEGER, defaultValue: 3000 },
}, { tableName: 'sponsored_sections' })

module.exports = withIdAlias(SponsoredSection)
