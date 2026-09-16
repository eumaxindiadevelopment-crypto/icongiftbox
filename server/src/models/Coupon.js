const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const Coupon = sequelize.define('Coupon', {
  wcCouponId: { type: DataTypes.INTEGER, unique: true, allowNull: true },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) { this.setDataValue('code', value?.toUpperCase()) },
  },
  discountType: {
    type: DataTypes.ENUM('percent', 'fixed_cart', 'fixed_product', 'free_shipping'),
    allowNull: false,
  },
  amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  description: DataTypes.TEXT,
  expiryDate: DataTypes.DATE,
  minimumAmount: DataTypes.DECIMAL(12, 2),
  maximumAmount: DataTypes.DECIMAL(12, 2),
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  usageLimit: DataTypes.INTEGER,
  usageLimitPerUser: DataTypes.INTEGER,
  freeShipping: { type: DataTypes.BOOLEAN, defaultValue: false },
  excludeSaleItems: { type: DataTypes.BOOLEAN, defaultValue: false },
  productIds: { type: DataTypes.JSON, defaultValue: [] },
  excludeProductIds: { type: DataTypes.JSON, defaultValue: [] },
  categoryIds: { type: DataTypes.JSON, defaultValue: [] },
  status: { type: DataTypes.ENUM('active', 'expired', 'inactive'), defaultValue: 'active' },
  syncedAt: DataTypes.DATE,
}, {
  tableName: 'coupons',
})

module.exports = withIdAlias(Coupon)
