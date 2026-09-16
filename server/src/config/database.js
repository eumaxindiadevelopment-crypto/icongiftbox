const { Sequelize } = require('sequelize')

// MySQL's wire protocol reports both JSON and TEXT/BLOB columns with the same
// type code (JSON is internally a synonym for LONGBLOB in MySQL, unlike
// MariaDB which reports a real JSON type), so mysql2's field.type can't tell
// them apart — hence an explicit allowlist of the actual JSON columns in the
// schema, parsed back into real objects/arrays on read. Matched by bare
// column name: Sequelize aliases eager-loaded (included) tables using their
// association `as:` name rather than the model name (e.g. the ProductAttribute
// table shows up as "attributes", ProductVariation as "variations"), and
// prefixes the reported field name with that alias (e.g. "attributes.options")
// — so the lookup strips any such prefix first. Every bare name below is
// unique to a single column across the whole schema except `image`, which
// also exists as a plain STRING column on Banner and is handled with an
// explicit table check instead.
const JSON_COLUMN_NAMES = new Set([
  'permissions', 'billingAddress', 'shippingAddress', 'variationOptions',
  'dimensions', 'options', 'attributes', 'productIds', 'excludeProductIds',
  'categoryIds', 'value', 'filterTabs', 'cards', 'mapCards', 'sliderItems',
  'slides', 'images', 'logo',
])
// `image` is JSON on Category/ProductVariation but a plain string on Banner —
// both PascalCase model names and lowercase association aliases are listed.
const JSON_IMAGE_TABLES = new Set(['Category', 'categories', 'parent', 'ProductVariation', 'variations'])

const sequelize = new Sequelize(
  process.env.DB_NAME || 'corporate-gifts',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    dialectOptions: {
      typeCast: (field, next) => {
        const bareName = field.name.includes('.') ? field.name.slice(field.name.lastIndexOf('.') + 1) : field.name
        const isJson = JSON_COLUMN_NAMES.has(bareName) || (bareName === 'image' && JSON_IMAGE_TABLES.has(field.table))
        if (isJson) {
          const value = field.string()
          return value === null ? null : JSON.parse(value)
        }
        return next()
      },
    },
  }
)

module.exports = sequelize
