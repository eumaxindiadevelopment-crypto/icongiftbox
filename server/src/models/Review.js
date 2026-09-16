const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const Review = sequelize.define('Review', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: true },
  authorName: { type: DataTypes.STRING, allowNull: false },
  authorEmail: DataTypes.STRING,
  rating: { type: DataTypes.INTEGER, defaultValue: 5 },
  title: DataTypes.STRING,
  comment: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'spam'), defaultValue: 'pending' },
}, {
  tableName: 'reviews',
})

module.exports = withIdAlias(Review)
