const { OfferSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const slides = (body.slides || []).map(({ backgroundImage, offerText, headingStyle, heading, spanText, btnText, btnLink }) => ({
    backgroundImage, offerText, headingStyle, heading, spanText, btnText, btnLink,
  }))
  return { sectionTitle: body.sectionTitle, seeAllLink: body.seeAllLink, slides }
}

module.exports = createSingletonSectionController(OfferSection, transform)
