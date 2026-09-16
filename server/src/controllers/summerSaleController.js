const { SummerSale } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

const ALLOWED = [
  'panel1Image', 'panel1Badge', 'panel1Heading', 'panel1Year', 'panel1BtnText', 'panel1BtnLink',
  'panel2Image', 'panel2Badge', 'panel2Heading', 'panel2BtnText', 'panel2BtnLink',
]

function transform(body) {
  const out = {}
  ALLOWED.forEach(k => { if (body[k] !== undefined) out[k] = body[k] })
  return out
}

module.exports = createSingletonSectionController(SummerSale, transform)
