const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const Banner = sequelize.define('Banner', {
  title: { type: DataTypes.STRING, allowNull: false },
  subtitle: { type: DataTypes.STRING, defaultValue: '' },
  image: { type: DataTypes.STRING, defaultValue: '' },
  price: { type: DataTypes.STRING, defaultValue: '' },
  buttonText: { type: DataTypes.STRING, defaultValue: 'View Detail' },
  productId: { type: DataTypes.INTEGER, allowNull: true },
  productLink: { type: DataTypes.STRING, defaultValue: '/product-default' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'banners',
})

module.exports = withIdAlias(Banner)
