const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const DEFAULT_CARDS = [
  { name: 'Athletic Mesh Sports Leggings', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: false },
  { name: 'Athletic Mesh Sports Leggings', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: true },
  { name: 'Athletic Mesh Sports Leggings', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: false },
  { name: 'Athletic Mesh Sports Leggings', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: false },
]

const GreatSavingSection = sequelize.define('GreatSavingSection', {
  bannerImage: { type: DataTypes.STRING, defaultValue: '' },
  title: { type: DataTypes.STRING, defaultValue: 'Great saving on everyday essentials' },
  subtitle: { type: DataTypes.STRING, defaultValue: 'Up to 60% off + up to ₹107 cashback' },
  btnText: { type: DataTypes.STRING, defaultValue: 'See all' },
  btnLink: { type: DataTypes.STRING, defaultValue: '/shop' },
  animationText: { type: DataTypes.STRING, defaultValue: 'Great saving' },
  cards: { type: DataTypes.JSON, defaultValue: DEFAULT_CARDS },
}, { tableName: 'great_saving_sections' })

module.exports = withIdAlias(GreatSavingSection)
