const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const Enquiry = sequelize.define('Enquiry', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: DataTypes.STRING,
  city: { type: DataTypes.STRING, allowNull: false },
  giftingFor: { type: DataTypes.STRING, allowNull: false },
  budgetPerGift: { type: DataTypes.STRING, allowNull: false },
  quantityRequired: { type: DataTypes.STRING, allowNull: false },
  additionalInfo: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('new', 'contacted', 'closed'), defaultValue: 'new' },
}, {
  tableName: 'enquiries',
})

module.exports = withIdAlias(Enquiry)
