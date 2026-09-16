const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const Settings = sequelize.define('Settings', {
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  value: { type: DataTypes.JSON, defaultValue: null },
}, {
  tableName: 'settings',
})

module.exports = withIdAlias(Settings)
