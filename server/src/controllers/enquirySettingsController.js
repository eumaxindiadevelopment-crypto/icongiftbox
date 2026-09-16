const { EnquirySettings } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  return {
    enabled: !!body.enabled,
    delaySeconds: Number(body.delaySeconds) || 0,
  }
}

module.exports = createSingletonSectionController(EnquirySettings, transform)
