const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const DEFAULT_CARDS = [
  { name: 'Cozy Knit Cardigan Sweater', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop' },
  { name: 'Sophisticated Swagger Suit', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop' },
  { name: 'Classic Denim Skinny Jeans', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop' },
]

const AllProductionSection = sequelize.define('AllProductionSection', {
  mainImage: { type: DataTypes.STRING, defaultValue: '' },
  title: { type: DataTypes.STRING, defaultValue: 'Users Who Viewed This Also Checked Out These Similar Profiles' },
  shopLink: { type: DataTypes.STRING, defaultValue: '/shop' },
  cards: { type: DataTypes.JSON, defaultValue: DEFAULT_CARDS },
}, { tableName: 'all_production_sections' })

module.exports = withIdAlias(AllProductionSection)
