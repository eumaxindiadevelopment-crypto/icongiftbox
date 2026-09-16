const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const DEFAULT_MAP_CARDS = [
  { title: 'Cozy Knit Cardigan Sweater', saleTitle: 'up to 79% off', link: '/shop' },
  { title: 'Sophisticated Swagger Suit', saleTitle: 'up to 79% off', link: '/shop' },
  { title: 'Classic Denim Skinny Jeans', saleTitle: 'up to 79% off', link: '/shop' },
]
const DEFAULT_SLIDER_ITEMS = [
  { title: 'Cardigan Sweater', saleTitle: 'up to 79% off', link: '/shop' },
  { title: 'Swagger Suit', saleTitle: 'up to 79% off', link: '/shop' },
  { title: 'Skinny Jeans', saleTitle: 'up to 79% off', link: '/shop' },
  { title: 'Sports Leggings', saleTitle: 'up to 79% off', link: '/shop' },
  { title: 'Cardigan Sweater', saleTitle: 'up to 79% off', link: '/shop' },
  { title: 'Swagger Suit', saleTitle: 'up to 79% off', link: '/shop' },
]

const HottestBlogSection = sequelize.define('HottestBlogSection', {
  title: { type: DataTypes.STRING, defaultValue: 'Discovering the Hottest Nearby Destinations in Your Area' },
  subtitle: { type: DataTypes.STRING, defaultValue: 'Up to 60% off + up to ₹107 cashback' },
  seeAllLink: { type: DataTypes.STRING, defaultValue: '/shop' },
  mapCards: { type: DataTypes.JSON, defaultValue: DEFAULT_MAP_CARDS },
  sliderItems: { type: DataTypes.JSON, defaultValue: DEFAULT_SLIDER_ITEMS },
}, { tableName: 'hottest_blog_sections' })

module.exports = withIdAlias(HottestBlogSection)
