const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) { this.setDataValue('email', value?.toLowerCase()) },
  },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('admin', 'shop_manager', 'editor', 'product_manager', 'customer_service'),
    defaultValue: 'editor',
  },
  permissions: { type: DataTypes.JSON, defaultValue: [] },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: DataTypes.DATE,
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 12)
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12)
    },
  },
})

User.prototype.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

module.exports = withIdAlias(User)
