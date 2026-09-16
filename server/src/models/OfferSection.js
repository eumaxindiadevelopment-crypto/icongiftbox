const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const OfferSection = sequelize.define('OfferSection', {
  sectionTitle: { type: DataTypes.STRING, defaultValue: 'Featured offer for you' },
  seeAllLink: { type: DataTypes.STRING, defaultValue: '/shop-list' },
  slides: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'offer_sections' })

module.exports = withIdAlias(OfferSection)
