const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const Attribute = sequelize.define('Attribute', {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: true },
}, {
  tableName: 'attributes',
  hooks: {
    beforeValidate: (attribute) => {
      if (!attribute.slug && attribute.name) attribute.slug = slugify(attribute.name)
    },
  },
})

module.exports = withIdAlias(Attribute)
