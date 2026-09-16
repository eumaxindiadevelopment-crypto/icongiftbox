const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { withIdAlias } = require('./_base')

const EnquirySettings = sequelize.define('EnquirySettings', {
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  delaySeconds: { type: DataTypes.DECIMAL(4, 1), defaultValue: 1.0 },
}, { tableName: 'enquiry_settings' })

module.exports = withIdAlias(EnquirySettings)
