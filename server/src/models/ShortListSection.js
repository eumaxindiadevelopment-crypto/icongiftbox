const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const ShortListSection = sequelize.define('ShortListSection', {
  bannerImage: { type: DataTypes.STRING, defaultValue: '' },
  bannerTitle: { type: DataTypes.STRING, defaultValue: 'Recent Additions to Your Shortlist' },
  btnText: { type: DataTypes.STRING, defaultValue: 'Shop Now' },
  btnLink: { type: DataTypes.STRING, defaultValue: '/shop-list' },
  animationText: { type: DataTypes.STRING, defaultValue: 'Shortlist' },
  cards: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'short_list_sections' })

module.exports = withIdAlias(ShortListSection)
