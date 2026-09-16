const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const Brand = sequelize.define('Brand', {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: true },
  description: DataTypes.TEXT,
  logo: { type: DataTypes.JSON, defaultValue: null },
  count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'brands',
  hooks: {
    beforeValidate: (brand) => {
      if (!brand.slug && brand.name) brand.slug = slugify(brand.name)
    },
  },
})

module.exports = withIdAlias(Brand)
