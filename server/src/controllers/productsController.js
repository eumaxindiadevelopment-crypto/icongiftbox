const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { sequelize, Product, Category, ProductCategory, ProductImage, ProductAttribute, ProductVariation, ProductTag, Brand } = require('../models')
const { adjustCategoryCounts, recomputeCategoryCounts } = require('../utils/categoryCounts')
const { adjustBrandCount } = require('../utils/brandCounts')
const { ensureTagsExist } = require('../utils/tagSync')

const PRODUCT_SCALAR_FIELDS = [
  'wcProductId', 'name', 'slug', 'description', 'shortDescription', 'sku', 'price', 'regularPrice',
  'salePrice', 'onSale', 'inStock', 'stockQuantity', 'stockStatus', 'type', 'variationOptions', 'weight',
  'dimensions', 'taxStatus', 'taxClass', 'managedInventory', 'backorderAllowed', 'featured', 'status',
  'visibility', 'catalogVisibility', 'publishedAt', 'syncedAt', 'metaTitle', 'metaDescription', 'brandId',
  'primaryCategoryId',
]

const CATEGORY_CHAIN_ATTRS = ['id', 'name', 'slug']

const PRODUCT_INCLUDES = [
  {
    model: Category,
    as: 'categories',
    attributes: CATEGORY_CHAIN_ATTRS,
    through: { attributes: [] },
    // Parent included so the shapeProduct() primary-category fallback below
    // can build a correct nested URL, not just a flat top-level one.
    include: [{ model: Category, as: 'parent', attributes: CATEGORY_CHAIN_ATTRS }],
  },
  {
    model: Category,
    as: 'primaryCategory',
    attributes: CATEGORY_CHAIN_ATTRS,
    include: [{ model: Category, as: 'parent', attributes: CATEGORY_CHAIN_ATTRS }],
  },
  { model: ProductImage, as: 'images' },
  { model: ProductAttribute, as: 'attributes' },
  { model: ProductVariation, as: 'variations' },
  { model: ProductTag, as: 'tagRows' },
  { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug'] },
]

function scalarFields(body) {
  const out = {}
  PRODUCT_SCALAR_FIELDS.forEach((f) => { if (body[f] !== undefined) out[f] = body[f] })
  return out
}

function withVariationOptions(body) {
  if (!Array.isArray(body.variations)) return body
  const opts = new Set()
  body.variations.forEach(v => {
    if (!v.attributes) return
    Object.values(v.attributes).forEach(val => val && opts.add(val))
  })
  return { ...body, variationOptions: Array.from(opts) }
}

// If the admin didn't explicitly pick a primary category, default to the
// most specific (deepest) checked category — not just whichever was checked
// first — so the product's SEO URL/breadcrumb reflects its subcategory
// (e.g. Cork Products) instead of silently falling back to the parent
// (e.g. Eco-Friendly Gifts) whenever the parent happened to be checked too.

async function withPrimaryCategory(body, existing) {
  if (body.primaryCategoryId !== undefined) return body
  if (Array.isArray(body.categories) && body.categories.length) {
    const rows = await Category.findAll({ where: { id: body.categories }, attributes: ['id', 'parentId'] })
    const deepest = rows.find(r => r.parentId)
    return { ...body, primaryCategoryId: deepest ? deepest.id : body.categories[0] }
  }
  if (!existing) return body
  return body
}

// Soft auth check — true when the request carries a valid admin token, without requiring one
function checkIsAdmin(req) {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET); return true } catch { return false }
}

function withPublishedAt(body, existing) {
  if (body.status === 'publish' && !body.publishedAt && !existing?.publishedAt) {
    return { ...body, publishedAt: new Date() }
  }
  return body
}

function shapeProduct(instance) {
  const json = instance.toJSON()
  json.tags = (json.tagRows || []).map(t => t.tag)
  delete json.tagRows
  // Some imported/legacy products have categories assigned but no explicit
  // primary category — fall back to the first one so the SEO URL builder
  // (buildProductUrl on the frontend) doesn't drop to the flat /product/:id
  // route just because primaryCategoryId was never set.
  if (!json.primaryCategory && json.categories?.length) {
    json.primaryCategory = json.categories[0]
  }
  return json
}

async function loadFull(id) {
  const product = await Product.findByPk(id, { include: PRODUCT_INCLUDES })
  return product ? shapeProduct(product) : null
}

// Matches case-insensitively (and trims whitespace) since the same option
// (e.g. "Blue" vs "blue") can be typed with different casing across products.
async function productIdsByAttribute(attrName, value) {
  const rows = await ProductAttribute.findAll({
    where: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), attrName),
    attributes: ['productId', 'options'],
    raw: true,
  })
  const target = String(value).trim().toLowerCase()
  return rows
    .filter(r => (r.options || []).some(o => String(o).trim().toLowerCase() === target))
    .map(r => r.productId)
}

async function productIdsByVariationOption(value) {
  const rows = await Product.findAll({
    where: { type: 'variable' },
    attributes: ['id', 'variationOptions'],
    raw: true,
  })
  const target = String(value).trim().toLowerCase()
  return rows
    .filter(r => (r.variationOptions || []).some(o => String(o).trim().toLowerCase() === target))
    .map(r => r.id)
}

function intersectFilter(current, ids) {
  const set = new Set(ids)
  const next = current ? current.filter(id => set.has(id)) : [...set]
  return next.length ? next : [-1]
}

// Replaces a product's child rows (images/attributes/variations/tags) inside a
// transaction: full destroy + bulkCreate, since these arrays are always
// sent as a complete replacement from the admin form, mirroring how the old
// Mongoose embedded-array writes worked.
async function syncChildren(product, body, t) {
  if (Array.isArray(body.images)) {
    await ProductImage.destroy({ where: { productId: product.id }, transaction: t })
    if (body.images.length) {
      await ProductImage.bulkCreate(
        body.images.map((img, i) => ({ productId: product.id, src: img.src, alt: img.alt, sortOrder: i })),
        { transaction: t }
      )
    }
  }
  if (Array.isArray(body.attributes)) {
    await ProductAttribute.destroy({ where: { productId: product.id }, transaction: t })
    if (body.attributes.length) {
      await ProductAttribute.bulkCreate(
        body.attributes.map((a, i) => ({ productId: product.id, name: a.name, visible: a.visible, options: a.options || [], sortOrder: i })),
        { transaction: t }
      )
    }
  }
  if (Array.isArray(body.variations)) {
    await ProductVariation.destroy({ where: { productId: product.id }, transaction: t })
    if (body.variations.length) {
      await ProductVariation.bulkCreate(
        body.variations.map((v, i) => ({
          productId: product.id, attributes: v.attributes || {}, sku: v.sku, price: v.price, regularPrice: v.regularPrice,
          stockQuantity: v.stockQuantity, stockStatus: v.stockStatus, images: v.images || [], enabled: v.enabled, sortOrder: i,
        })),
        { transaction: t }
      )
    }
  }
  if (Array.isArray(body.tags)) {
    await ProductTag.destroy({ where: { productId: product.id }, transaction: t })
    if (body.tags.length) {
      await ProductTag.bulkCreate(body.tags.map(tag => ({ productId: product.id, tag })), { transaction: t })
      await ensureTagsExist(body.tags)
    }
  }
  if (Array.isArray(body.categories)) {
    await product.setCategories(body.categories, { transaction: t })
  }
}

// GET /api/products — public (no auth required for browsing)
async function list(req, res, next) {
  try {
    const { status, stockStatus, category, type, tags, search, minPrice, maxPrice, color, size, brand, page = 1, limit = 20 } = req.query
    const isAdmin = checkIsAdmin(req)
    const where = {}
    if (isAdmin) where.status = status || { [Op.ne]: 'trash' }
    else where.status = 'publish'
    if (stockStatus) where.stockStatus = stockStatus
    if (type) where.type = type
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price[Op.gte] = +minPrice
      if (maxPrice) where.price[Op.lte] = +maxPrice
    }
    if (!isAdmin) {
      where.visibility = { [Op.ne]: 'private' }
      where.catalogVisibility = search ? { [Op.notIn]: ['hidden', 'catalog'] } : { [Op.notIn]: ['hidden', 'search'] }
    }

    let idFilter = null
    if (category) {
      const categoryRow = /^\d+$/.test(category)
        ? await Category.findByPk(category, { attributes: ['id'] })
        : await Category.findOne({ where: { slug: category }, attributes: ['id'] })
      const rows = categoryRow
        ? await ProductCategory.findAll({ where: { categoryId: categoryRow.id }, attributes: ['productId'], raw: true })
        : []
      idFilter = intersectFilter(idFilter, rows.map(r => r.productId))
    }
    if (tags) {
      const rows = await ProductTag.findAll({ where: { tag: tags.split(',') }, attributes: ['productId'], raw: true })
      idFilter = intersectFilter(idFilter, rows.map(r => r.productId))
    }
    if (color) {
      const ids = [...await productIdsByAttribute('color', color), ...await productIdsByVariationOption(color)]
      idFilter = intersectFilter(idFilter, ids)
    }
    if (size) {
      const ids = [...await productIdsByAttribute('size', size), ...await productIdsByVariationOption(size)]
      idFilter = intersectFilter(idFilter, ids)
    }
    if (brand) {
      const brandRows = await Brand.findAll({ where: { slug: brand.split(',').filter(Boolean) }, attributes: ['id'], raw: true })
      where.brandId = brandRows.map(b => b.id)
    }
    if (idFilter) where.id = idFilter
    if (search) where.id = { [Op.in]: idFilter || sequelize.literal(`(SELECT id FROM products WHERE MATCH(name, sku) AGAINST(${sequelize.escape(search)} IN NATURAL LANGUAGE MODE))`) }

    const [products, total] = await Promise.all([
      Product.findAll({
        where,
        include: PRODUCT_INCLUDES,
        order: [['createdAt', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
        distinct: true,
      }),
      Product.count({ where, distinct: true }),
    ])
    res.json({ products: products.map(shapeProduct), total, page: +page, pages: Math.ceil(total / +limit) })
  } catch (err) { next(err) }
}

// GET /api/products/meta/tags — public, distinct tags with counts
async function metaTags(req, res, next) {
  try {
    const rows = await ProductTag.findAll({
      attributes: ['tag', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['tag'],
      order: [['tag', 'ASC']],
      raw: true,
    })
    res.json(rows.map(t => ({ name: t.tag, count: Number(t.count) })))
  } catch (err) { next(err) }
}

// GET /api/products/meta/price-range — public, min/max price across products
async function metaPriceRange(req, res, next) {
  try {
    const result = await Product.findOne({
      attributes: [[sequelize.fn('MIN', sequelize.col('price')), 'min'], [sequelize.fn('MAX', sequelize.col('price')), 'max']],
      raw: true,
    })
    res.json({ min: Number(result?.min ?? 0), max: Number(result?.max ?? 0) })
  } catch (err) { next(err) }
}

// GET /api/products/meta/attributes — public, distinct attribute names + options.
// Groups/dedupes case-insensitively (trimmed) so "Color"/"color" and
// "Blue"/"blue" from different products collapse into one entry each,
// instead of showing up as separate-looking duplicates in filter UIs.

async function metaAttributes(req, res, next) {
  try {
    const rows = await ProductAttribute.findAll({ attributes: ['name', 'options'], raw: true })
    const byNameKey = new Map()
    rows.forEach(({ name, options }) => {
      const nameKey = String(name).trim().toLowerCase()
      if (!byNameKey.has(nameKey)) byNameKey.set(nameKey, { name: String(name).trim(), options: new Map() })
      const group = byNameKey.get(nameKey)
      ;(options || []).forEach(o => {
        const optKey = String(o).trim().toLowerCase()
        if (optKey && !group.options.has(optKey)) group.options.set(optKey, String(o).trim())
      })
    })
    res.json([...byNameKey.values()].map(({ name, options }) => ({
      name,
      options: [...options.values()].sort((a, b) => a.localeCompare(b)),
    })))
  } catch (err) { next(err) }
}

// GET /api/products/meta/brands — public, brands actually assigned to published products,
// optionally narrowed to one category (?category=slug) so the sidebar only ever offers
// brands that exist within the category being browsed instead of every brand in the store.
async function metaBrands(req, res, next) {
  try {
    const { category } = req.query
    const where = { status: 'publish', brandId: { [Op.ne]: null } }
    if (category) {
      const categoryRow = /^\d+$/.test(category)
        ? await Category.findByPk(category, { attributes: ['id'] })
        : await Category.findOne({ where: { slug: category }, attributes: ['id'] })
      const rows = categoryRow
        ? await ProductCategory.findAll({ where: { categoryId: categoryRow.id }, attributes: ['productId'], raw: true })
        : []
      where.id = rows.map(r => r.productId)
    }
    const counts = await Product.findAll({
      where,
      attributes: ['brandId', [sequelize.fn('COUNT', sequelize.col('Product.id')), 'count']],
      group: ['brandId'],
      raw: true,
    })
    const countByBrandId = new Map(counts.map(r => [r.brandId, Number(r.count)]))
    const brands = await Brand.findAll({ where: { id: [...countByBrandId.keys()] }, attributes: ['id', 'name', 'slug'], order: [['name', 'ASC']] })
    res.json(brands.map(b => ({ ...b.toJSON(), count: countByBrandId.get(b.id) || 0 })))
  } catch (err) { next(err) }
}

// GET /api/products/:id — public, accepts either a numeric id or a slug
async function getOne(req, res, next) {
  try {
    const { id } = req.params
    const product = /^\d+$/.test(id)
      ? await Product.findByPk(id, { include: PRODUCT_INCLUDES })
      : await Product.findOne({ where: { slug: id }, include: PRODUCT_INCLUDES })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    if (!checkIsAdmin(req) && (product.status !== 'publish' || product.visibility === 'private')) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(shapeProduct(product))
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const body = await withPrimaryCategory(withVariationOptions(withPublishedAt(req.body)))
    const result = await sequelize.transaction(async (t) => {
      const product = await Product.create(scalarFields(body), { transaction: t })
      await syncChildren(product, body, t)
      return product
    })
    await adjustCategoryCounts(body.categories, 1)
    await adjustBrandCount(body.brandId, 1)
    res.status(201).json(await loadFull(result.id))
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const existing = await Product.findByPk(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Product not found' })
    const oldIds = (await existing.getCategories({ attributes: ['id'] })).map(c => String(c.id))
    const oldBrandId = existing.brandId
    const body = await withPrimaryCategory(withVariationOptions(withPublishedAt(req.body, existing)), existing)

    await sequelize.transaction(async (t) => {
      await existing.update(scalarFields(body), { transaction: t })
      await syncChildren(existing, body, t)
    })

    const newIds = Array.isArray(body.categories) ? body.categories.map(String) : oldIds
    await adjustCategoryCounts(newIds.filter(id => !oldIds.includes(id)), 1)
    await adjustCategoryCounts(oldIds.filter(id => !newIds.includes(id)), -1)
    if (body.brandId !== undefined && body.brandId !== oldBrandId) {
      await adjustBrandCount(oldBrandId, -1)
      await adjustBrandCount(body.brandId, 1)
    }
    res.json(await loadFull(req.params.id))
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id)
    if (product) {
      const categoryIds = (await product.getCategories({ attributes: ['id'] })).map(c => c.id)
      const { brandId } = product
      await product.destroy()
      await adjustCategoryCounts(categoryIds, -1)
      await adjustBrandCount(brandId, -1)
    }
    res.json({ message: 'Product deleted' })
  } catch (err) { next(err) }
}

async function bulkDelete(req, res, next) {
  try {
    const { ids } = req.body
    const toDelete = await Product.findAll({ where: { id: ids }, include: [{ model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } }] })
    const categoryIds = toDelete.flatMap(p => (p.categories || []).map(c => c.id))
    const brandIds = toDelete.map(p => p.brandId).filter(Boolean)
    await Product.destroy({ where: { id: ids } })
    await adjustCategoryCounts(categoryIds, -1)
    await Promise.all(brandIds.map(id => adjustBrandCount(id, -1)))
    res.json({ message: `${ids.length} products deleted` })
  } catch (err) { next(err) }
}

async function bulkUpdate(req, res, next) {
  try {
    const { ids, update: patch } = req.body
    // Bulk category reassignment can't be diffed per-row like the single-product
    // PUT route does, so fall back to a full recompute for every category touched
    // (before and after) rather than trying to track individual add/remove deltas.
    let affectedCategoryIds = null
    if (patch.categories) {
      const affected = await Product.findAll({ where: { id: ids }, include: [{ model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } }] })
      affectedCategoryIds = affected.flatMap(p => (p.categories || []).map(c => c.id))
    }
    await Product.update(scalarFields(patch), { where: { id: ids } })
    if (patch.categories) {
      const products = await Product.findAll({ where: { id: ids } })
      await Promise.all(products.map(p => p.setCategories(patch.categories)))
      await recomputeCategoryCounts([...affectedCategoryIds, ...patch.categories])
    }
    res.json({ message: `${ids.length} products updated` })
  } catch (err) { next(err) }
}

module.exports = { list, metaTags, metaPriceRange, metaAttributes, metaBrands, getOne, create, update, remove, bulkDelete, bulkUpdate }
