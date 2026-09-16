const { BlockbusterSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const sliderItems = (body.sliderItems || []).map(({ image, title, saleTitle, price, originalPrice, link }) => ({
    image, title, saleTitle, price, originalPrice, link,
  }))
  return { sectionTitle: body.sectionTitle, seeAllText: body.seeAllText, seeAllLink: body.seeAllLink, sliderItems }
}

module.exports = createSingletonSectionController(BlockbusterSection, transform)
