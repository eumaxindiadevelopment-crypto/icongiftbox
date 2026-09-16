const { FeaturedNowSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const sliderItems = (body.sliderItems || []).map(({ image, name, saleTitle, price, originalPrice, review, link }) => ({
    image, name, saleTitle, price, originalPrice, review, link,
  }))
  return { sectionTitle: body.sectionTitle, seeAllLink: body.seeAllLink, sliderItems }
}

module.exports = createSingletonSectionController(FeaturedNowSection, transform)
