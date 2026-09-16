const { ProductSectionSettings } = require('../models')
const createSingletonSectionController = require('./_singletonSection')

function transform(body) {
  return {
    title: body.title,
    productCount: body.productCount,
    filterTabs: (body.filterTabs || []).map(({ label, category, categoryId }) => ({
      label, category, categoryId: categoryId || '',
    })),
  }
}

module.exports = createSingletonSectionController(ProductSectionSettings, transform)
