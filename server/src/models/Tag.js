const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const Tag = sequelize.define('Tag', {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: true },
  description: DataTypes.TEXT,
  count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'tags',
  hooks: {
    beforeValidate: (tag) => {
      if (!tag.slug && tag.name) tag.slug = slugify(tag.name)
    },
  },
})

module.exports = withIdAlias(Tag)
