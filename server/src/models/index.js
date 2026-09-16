const sequelize = require('../config/database')

const User = require('./User')
const Customer = require('./Customer')
const Category = require('./Category')
const Product = require('./Product')
const ProductImage = require('./ProductImage')
const ProductAttribute = require('./ProductAttribute')
const ProductVariation = require('./ProductVariation')
const ProductTag = require('./ProductTag')
const Brand = require('./Brand')
const Tag = require('./Tag')
const Attribute = require('./Attribute')
const AttributeTerm = require('./AttributeTerm')
const Review = require('./Review')
const Coupon = require('./Coupon')
const Banner = require('./Banner')
const Settings = require('./Settings')
const FeaturedCategory = require('./FeaturedCategory')
const AboutSection = require('./AboutSection')
const ProductSectionSettings = require('./ProductSectionSettings')
const SummerSale = require('./SummerSale')
const AllProductionSection = require('./AllProductionSection')
const GreatSavingSection = require('./GreatSavingSection')
const HottestBlogSection = require('./HottestBlogSection')
const BlockbusterSection = require('./BlockbusterSection')
const OfferSection = require('./OfferSection')
const FeaturedNowSection = require('./FeaturedNowSection')
const ShortListSection = require('./ShortListSection')
const SponsoredSection = require('./SponsoredSection')
const TradingSection = require('./TradingSection')
const CollectionSection = require('./CollectionSection')
const Media = require('./Media')
const OurClientSection = require('./OurClientSection')
const Enquiry = require('./Enquiry')
const EnquirySettings = require('./EnquirySettings')

// Category <-> Category (self-referencing parent)
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' })

// Product <-> Category (many-to-many)
const ProductCategory = sequelize.define('ProductCategory', {}, { tableName: 'product_categories', timestamps: false })
Product.belongsToMany(Category, {
  through: { model: ProductCategory, attributes: [] },
  as: 'categories',
  foreignKey: 'productId',
  otherKey: 'categoryId',
})
Category.belongsToMany(Product, {
  through: 'product_categories',
  as: 'products',
  foreignKey: 'categoryId',
  otherKey: 'productId',
})

// The single category a product's canonical SEO URL/breadcrumb is built
// from (distinct from the many-to-many `categories` above).
Product.belongsTo(Category, { as: 'primaryCategory', foreignKey: 'primaryCategoryId' })

// Product <-> child tables
Product.hasMany(ProductImage, { as: 'images', foreignKey: 'productId' })
Product.hasMany(ProductAttribute, { as: 'attributes', foreignKey: 'productId' })
Product.hasMany(ProductVariation, { as: 'variations', foreignKey: 'productId' })
Product.hasMany(ProductTag, { as: 'tagRows', foreignKey: 'productId' })

// Banner -> Product (nullable ref, not populated by any route)
Banner.belongsTo(Product, { as: 'productRef', foreignKey: 'productId', constraints: false })

// Product <-> Brand (many-to-one)
Product.belongsTo(Brand, { as: 'brand', foreignKey: 'brandId' })
Brand.hasMany(Product, { as: 'products', foreignKey: 'brandId' })

// Attribute <-> AttributeTerm (one-to-many)
Attribute.hasMany(AttributeTerm, { as: 'terms', foreignKey: 'attributeId' })
AttributeTerm.belongsTo(Attribute, { as: 'attribute', foreignKey: 'attributeId' })

// Product <-> Review (one-to-many); Review -> Customer (nullable, for logged-in authorship)
Product.hasMany(Review, { as: 'reviews', foreignKey: 'productId' })
Review.belongsTo(Product, { as: 'product', foreignKey: 'productId' })
Review.belongsTo(Customer, { as: 'customer', foreignKey: 'customerId' })

// Orders live outside Sequelize entirely — see src/db/ordersRepository.js,
// a plain mysql2 data-access layer over the WooCommerce-HPOS-style wc_orders schema.

module.exports = {
  sequelize,
  User,
  Customer,
  Category,
  Product,
  ProductCategory,
  ProductImage,
  ProductAttribute,
  ProductVariation,
  ProductTag,
  Brand,
  Tag,
  Attribute,
  AttributeTerm,
  Review,
  Coupon,
  Banner,
  Settings,
  FeaturedCategory,
  AboutSection,
  ProductSectionSettings,
  SummerSale,
  AllProductionSection,
  GreatSavingSection,
  HottestBlogSection,
  BlockbusterSection,
  OfferSection,
  FeaturedNowSection,
  ShortListSection,
  SponsoredSection,
  TradingSection,
  CollectionSection,
  Media,
  OurClientSection,
  Enquiry,
  EnquirySettings,
}
