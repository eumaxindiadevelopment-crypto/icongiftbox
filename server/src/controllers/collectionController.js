const { CollectionSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  const images = (body.images || []).map(({ image, design }) => ({ image, design }))
  return { sectionTitle: body.sectionTitle, btnText: body.btnText, btnLink: body.btnLink, images }
}

module.exports = createSingletonSectionController(CollectionSection, transform)
