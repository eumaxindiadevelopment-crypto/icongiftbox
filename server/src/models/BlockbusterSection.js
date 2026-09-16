const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const BlockbusterSection = sequelize.define('BlockbusterSection', {
  sectionTitle: { type: DataTypes.STRING, defaultValue: 'Blockbuster deals' },
  seeAllText: { type: DataTypes.STRING, defaultValue: 'See all deals' },
  seeAllLink: { type: DataTypes.STRING, defaultValue: '/shop-list' },
  sliderItems: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'blockbuster_sections' })

module.exports = withIdAlias(BlockbusterSection)
