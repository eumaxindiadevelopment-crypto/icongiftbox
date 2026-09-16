const { AllProductionSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const cards = (body.cards || []).map(({ name, image, saleTitle, price, originalPrice, link }) => ({
    name, image, saleTitle, price, originalPrice, link,
  }))
  return { mainImage: body.mainImage, title: body.title, shopLink: body.shopLink, cards }
}

module.exports = createSingletonSectionController(AllProductionSection, transform)
