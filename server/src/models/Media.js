const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const Media = sequelize.define('Media', {
  filename: { type: DataTypes.STRING, unique: true, allowNull: false },
  title: DataTypes.STRING,
  altText: DataTypes.STRING,
  caption: DataTypes.TEXT,
  description: DataTypes.TEXT,
}, {
  tableName: 'media',
})

module.exports = withIdAlias(Media)
