const { TradingSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const slides = (body.slides || []).map(({ image, date, name, animDuration }) => ({
    image, date, name, animDuration: String(animDuration || '0.6'),
  }))
  return { sectionTitle: body.sectionTitle, shopLink: body.shopLink, slides }
}

module.exports = createSingletonSectionController(TradingSection, transform)
