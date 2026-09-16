const { HottestBlogSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

const cleanItems = (arr) => (arr || []).map(({ image, title, saleTitle, link }) => ({
  image: image || '', title: title || '', saleTitle: saleTitle || 'up to 79% off', link: link || '/shop',
}))

function transform(body) {
  return {
    title: body.title,
    subtitle: body.subtitle,
    seeAllLink: body.seeAllLink,
    mapCards: cleanItems(body.mapCards).slice(0, 3),
    sliderItems: cleanItems(body.sliderItems),
  }
}

module.exports = createSingletonSectionController(HottestBlogSection, transform)
