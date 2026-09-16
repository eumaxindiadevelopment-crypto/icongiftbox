const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const TradingSection = sequelize.define('TradingSection', {
  sectionTitle: { type: DataTypes.STRING, defaultValue: 'Discover the most trending Post in Pixio.' },
  shopLink: { type: DataTypes.STRING, defaultValue: '/shop' },
  slides: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'trading_sections' })

module.exports = withIdAlias(TradingSection)
