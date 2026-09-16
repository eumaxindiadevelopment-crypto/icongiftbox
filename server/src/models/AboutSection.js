const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const AboutSection = sequelize.define('AboutSection', {
  mainImage: { type: DataTypes.STRING, defaultValue: '' },
  mainBtnText: { type: DataTypes.STRING, defaultValue: 'Woman collection' },
  mainBtnLink: { type: DataTypes.STRING, defaultValue: '/shop' },
  title: { type: DataTypes.STRING, defaultValue: 'Set your wardrobe with our amazing selection!' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  aboutLink: { type: DataTypes.STRING, defaultValue: '/about-us' },
  card1Image: { type: DataTypes.STRING, defaultValue: '' },
  card1BtnText: { type: DataTypes.STRING, defaultValue: 'Child Fashion' },
  card1Link: { type: DataTypes.STRING, defaultValue: '/shop' },
  card2Image: { type: DataTypes.STRING, defaultValue: '' },
  card2BtnText: { type: DataTypes.STRING, defaultValue: 'Man collection' },
  card2Link: { type: DataTypes.STRING, defaultValue: '/shop' },
  card2Badge: { type: DataTypes.STRING, defaultValue: '50% Sale' },
}, { tableName: 'about_sections' })

module.exports = withIdAlias(AboutSection)
