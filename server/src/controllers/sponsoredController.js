const { SponsoredSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const slides = (body.slides || []).map(({ image, logoImage, title, saleTitle, showStoreBadge, animDuration }) => ({
    image, logoImage, title, saleTitle, showStoreBadge: !!showStoreBadge, animDuration: Number(animDuration) || 0.6,
  }))
  return {
    sectionTitle: body.sectionTitle,
    seeAllLink: body.seeAllLink,
    slides,
    autoplay: !!body.autoplay,
    autoplayDelay: Number(body.autoplayDelay) || 3000,
  }
}

module.exports = createSingletonSectionController(SponsoredSection, transform)
