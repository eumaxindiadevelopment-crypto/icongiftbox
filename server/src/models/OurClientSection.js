const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const OurClientSection = sequelize.define('OurClientSection', {
  sectionTitle: { type: DataTypes.STRING, defaultValue: 'Our Client' },
  slides: { type: DataTypes.JSON, defaultValue: [] },
  autoplay: { type: DataTypes.BOOLEAN, defaultValue: true },
  autoplayDelay: { type: DataTypes.INTEGER, defaultValue: 3000 },
}, { tableName: 'our_client_sections' })

module.exports = withIdAlias(OurClientSection)
