const { AboutSection } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

const ALLOWED = [
  'mainImage', 'mainBtnText', 'mainBtnLink',
  'title', 'description', 'aboutLink',
  'card1Image', 'card1BtnText', 'card1Link',
  'card2Image', 'card2BtnText', 'card2Link', 'card2Badge',
]

function transform(body) {
  const out = {}
  ALLOWED.forEach(k => { if (body[k] !== undefined) out[k] = body[k] })
  return out
}

module.exports = createSingletonSectionController(AboutSection, transform)
