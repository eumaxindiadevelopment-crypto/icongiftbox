const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const Customer = sequelize.define('Customer', {
  wcCustomerId: { type: DataTypes.INTEGER, unique: true, allowNull: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) { this.setDataValue('email', value?.toLowerCase()) },
  },
  password: { type: DataTypes.STRING, allowNull: true },
  phone: DataTypes.STRING,
  company: DataTypes.STRING,
  role: { type: DataTypes.STRING, defaultValue: 'customer' },
  avatar: DataTypes.STRING,
  billingAddress: { type: DataTypes.JSON, defaultValue: null },
  shippingAddress: { type: DataTypes.JSON, defaultValue: null },
  isGuest: { type: DataTypes.BOOLEAN, defaultValue: false },
  totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSpent: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  averageOrderValue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  lastOrderDate: DataTypes.DATE,
  notes: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  syncedAt: DataTypes.DATE,
}, {
  tableName: 'customers',
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: { withPassword: { attributes: {} } },
  indexes: [{ fields: ['totalSpent'] }],
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) customer.password = await bcrypt.hash(customer.password, 12)
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password') && customer.password) customer.password = await bcrypt.hash(customer.password, 12)
    },
  },
})

Customer.prototype.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false)
  return bcrypt.compare(candidate, this.password)
}

module.exports = withIdAlias(Customer)
