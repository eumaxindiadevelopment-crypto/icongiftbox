const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const SummerSale = sequelize.define('SummerSale', {
  panel1Image: { type: DataTypes.STRING, defaultValue: '' },
  panel1Badge: { type: DataTypes.STRING, defaultValue: 'Sale Up to 50% Off' },
  panel1Heading: { type: DataTypes.STRING, defaultValue: 'Summer' },
  panel1Year: { type: DataTypes.STRING, defaultValue: '2024' },
  panel1BtnText: { type: DataTypes.STRING, defaultValue: 'Shop Now' },
  panel1BtnLink: { type: DataTypes.STRING, defaultValue: '/shop' },
  panel2Image: { type: DataTypes.STRING, defaultValue: '' },
  panel2Badge: { type: DataTypes.STRING, defaultValue: 'Sale Up to 50% Off' },
  panel2Heading: { type: DataTypes.STRING, defaultValue: 'New Summer Collection' },
  panel2BtnText: { type: DataTypes.STRING, defaultValue: 'Shop Now' },
  panel2BtnLink: { type: DataTypes.STRING, defaultValue: '/shop' },
}, { tableName: 'summer_sales' })

module.exports = withIdAlias(SummerSale)
