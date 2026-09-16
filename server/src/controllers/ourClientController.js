const { OurClientSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const slides = (body.slides || []).map(({ logoImage, animDuration }) => ({
    logoImage, animDuration: Number(animDuration) || 0.6,
  }))
  return {
    sectionTitle: body.sectionTitle,
    slides,
    autoplay: !!body.autoplay,
    autoplayDelay: Number(body.autoplayDelay) || 3000,
  }
}

module.exports = createSingletonSectionController(OurClientSection, transform)
