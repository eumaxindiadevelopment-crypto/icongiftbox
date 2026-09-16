const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const AttributeTerm = sequelize.define('AttributeTerm', {
  attributeId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: DataTypes.STRING,
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'attribute_terms',
  timestamps: false,
  hooks: {
    beforeValidate: (term) => {
      if (!term.slug && term.name) term.slug = slugify(term.name)
    },
  },
})

module.exports = withIdAlias(AttributeTerm)
