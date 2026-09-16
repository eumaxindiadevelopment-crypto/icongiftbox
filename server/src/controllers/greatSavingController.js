const { GreatSavingSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const cards = (body.cards || []).map(({ name, image, saleTitle, price, originalPrice, link, showBadge }) => ({
    name, image, saleTitle, price, originalPrice, link, showBadge: !!showBadge,
  }))
  return {
    bannerImage: body.bannerImage,
    title: body.title,
    subtitle: body.subtitle,
    btnText: body.btnText,
    btnLink: body.btnLink,
    animationText: body.animationText,
    cards,
  }
}

module.exports = createSingletonSectionController(GreatSavingSection, transform)
