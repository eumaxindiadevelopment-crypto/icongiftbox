const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const CollectionSection = sequelize.define('CollectionSection', {
  sectionTitle: { type: DataTypes.STRING, defaultValue: 'Upgrade your style with our top-notch collection.' },
  btnText: { type: DataTypes.STRING, defaultValue: 'All Collections' },
  btnLink: { type: DataTypes.STRING, defaultValue: '/shop-list' },
  images: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'collection_sections' })

module.exports = withIdAlias(CollectionSection)
