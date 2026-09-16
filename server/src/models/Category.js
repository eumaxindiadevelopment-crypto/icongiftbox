const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')
const { slugify, uniqueSlug } = require('../utils/slugify')

const Category = sequelize.define('Category', {
  wcCategoryId: { type: DataTypes.INTEGER, unique: true, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: true },
  description: DataTypes.TEXT,
  parentId: { type: DataTypes.INTEGER, allowNull: true },
  image: { type: DataTypes.JSON, defaultValue: null },
  count: { type: DataTypes.INTEGER, defaultValue: 0 },
  syncedAt: DataTypes.DATE,
}, {
  tableName: 'categories',
  hooks: {
    beforeValidate: async (category) => {
      if (!category.slug && category.name) category.slug = slugify(category.name)
      // Guard on category.slug being present — a partial bulk update (e.g.
      // Category.update({count}, {where}) touching unrelated fields) still
      // runs this hook against a synthetic instance where slug was never
      // loaded, so `changed('slug')` alone isn't a safe check here.
      if (category.slug && (category.changed('slug') || category.isNewRecord)) {
        category.slug = await uniqueSlug(Category, category.slug, { excludeId: category.id })
      }
    },
  },
})

module.exports = withIdAlias(Category)
