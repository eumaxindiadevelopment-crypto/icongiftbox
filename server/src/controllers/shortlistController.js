const { ShortListSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const cards = (body.cards || []).map(({ image, name, saleTitle, price, originalPrice, link, showBadge }) => ({
    image, name, saleTitle, price, originalPrice, link, showBadge: !!showBadge,
  }))
  return {
    bannerImage: body.bannerImage,
    bannerTitle: body.bannerTitle,
    btnText: body.btnText,
    btnLink: body.btnLink,
    animationText: body.animationText,
    cards,
  }
}

module.exports = createSingletonSectionController(ShortListSection, transform)
