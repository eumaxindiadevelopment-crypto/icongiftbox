const { User, Product, Category, ProductImage, ProductTag } = require('./models')
const { recomputeAllCategoryCounts } = require('./utils/categoryCounts')

async function seedAdminUser() {
  const exists = await User.findOne({ where: { role: 'admin' } })
  if (!exists) {
    await User.create({
      name: 'Admin',
      email: 'admin@corporategifts.in',
      password: 'Admin@123',
      role: 'admin',
    })
    console.log('Admin user created: admin@corporategifts.in / Admin@123')
  }
}

async function seedCategories() {
  const count = await Category.count()
  if (count > 0) return null

  const cats = await Category.bulkCreate([
    { name: 'Gift Hampers', slug: 'gift-hampers', description: 'Luxury corporate gift hampers' },
    { name: 'Desk Accessories', slug: 'desk-accessories', description: 'Premium desk & office accessories' },
    { name: 'Customised Gifts', slug: 'customised-gifts', description: 'Personalised & branded gifts' },
    { name: 'Eco Friendly', slug: 'eco-friendly', description: 'Sustainable & eco-friendly gifts' },
    { name: 'Tech Gadgets', slug: 'tech-gadgets', description: 'Tech & electronic gift items' },
    { name: 'Apparel & Accessories', slug: 'apparel-accessories', description: 'Corporate branded apparel' },
  ])
  console.log('Categories seeded:', cats.length)
  return cats
}

async function seedProducts(categories) {
  const count = await Product.count()
  if (count > 0) return

  const hampers     = categories.find(c => c.name === 'Gift Hampers')?.id
  const desk        = categories.find(c => c.name === 'Desk Accessories')?.id
  const custom      = categories.find(c => c.name === 'Customised Gifts')?.id
  const eco         = categories.find(c => c.name === 'Eco Friendly')?.id
  const tech        = categories.find(c => c.name === 'Tech Gadgets')?.id
  const apparel     = categories.find(c => c.name === 'Apparel & Accessories')?.id

  const products = [
    {
      name: 'Premium Corporate Gift Hamper', slug: 'premium-corporate-gift-hamper', sku: 'CGH-001',
      price: 2499, regularPrice: 2999, salePrice: 2499, onSale: true, stockQuantity: 50, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: true, categoryIds: [hampers],
      shortDescription: 'A luxurious hamper featuring premium dry fruits, chocolates & more.',
      description: 'Our flagship corporate gift hamper includes premium cashews, almonds, raisins, dark chocolates, herbal tea and a handcrafted wooden box.',
      images: [{ src: '/uploads/products/hamper1.jpg', alt: 'Premium Gift Hamper' }],
      tags: ['hamper', 'premium', 'corporate'],
    },
    {
      name: 'Customised Leather Diary', slug: 'customised-leather-diary', sku: 'CLD-002',
      price: 699, regularPrice: 699, stockQuantity: 120, stockStatus: 'instock', inStock: true,
      status: 'publish', featured: false, categoryIds: [desk, custom],
      shortDescription: 'Personalised A5 leather diary with logo embossing.',
      description: 'Premium PU leather A5 diary with 200 pages, pen loop, and custom logo embossing. Perfect for corporate gifting.',
      images: [{ src: '/uploads/products/diary1.jpg', alt: 'Leather Diary' }],
      tags: ['diary', 'leather', 'customised'],
    },
    {
      name: 'Bamboo Pen & Card Holder Set', slug: 'bamboo-pen-card-holder', sku: 'BPC-003',
      price: 499, regularPrice: 599, salePrice: 499, onSale: true, stockQuantity: 200, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: false, categoryIds: [desk, eco],
      shortDescription: 'Eco-friendly bamboo desk set with pen holder & card organiser.',
      description: 'Sustainable bamboo desk organiser set. Includes pen holder and business card holder. Laser engraving available.',
      images: [{ src: '/uploads/products/bamboo1.jpg', alt: 'Bamboo Desk Set' }],
      tags: ['bamboo', 'eco', 'desk'],
    },
    {
      name: 'Wireless Charging Pad', slug: 'wireless-charging-pad', sku: 'WCP-004',
      price: 999, regularPrice: 1199, salePrice: 999, onSale: true, stockQuantity: 75, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: true, categoryIds: [tech],
      shortDescription: '10W fast wireless charger with branded logo.',
      description: 'Universal Qi wireless charging pad supports 10W fast charge. Slim design with custom logo printing. Compatible with all Qi-enabled devices.',
      images: [{ src: '/uploads/products/charger1.jpg', alt: 'Wireless Charger' }],
      tags: ['tech', 'wireless', 'charger'],
    },
    {
      name: 'Corporate Branded T-Shirt', slug: 'corporate-branded-tshirt', sku: 'CBT-005',
      price: 349, regularPrice: 349, stockQuantity: 300, stockStatus: 'instock', inStock: true,
      status: 'publish', featured: false, categoryIds: [apparel],
      shortDescription: '100% cotton round-neck T-shirt with custom logo print.',
      description: 'Premium 180 GSM 100% cotton T-shirt available in S, M, L, XL, XXL. Full-colour or single-colour logo printing on front/back.',
      images: [{ src: '/uploads/products/tshirt1.jpg', alt: 'Corporate T-Shirt' }],
      tags: ['apparel', 'tshirt', 'branded'],
    },
    {
      name: 'Stainless Steel Bottle', slug: 'stainless-steel-bottle', sku: 'SSB-006',
      price: 599, regularPrice: 799, salePrice: 599, onSale: true, stockQuantity: 150, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: true, categoryIds: [eco],
      shortDescription: '750ml double-wall insulated bottle with laser-etched branding.',
      description: 'Double-wall vacuum insulated stainless steel bottle keeps drinks cold for 24hrs and hot for 12hrs. Leak-proof lid. Custom laser etching.',
      images: [{ src: '/uploads/products/bottle1.jpg', alt: 'Steel Bottle' }],
      tags: ['bottle', 'eco', 'insulated'],
    },
    {
      name: 'Luxury Chocolate Box', slug: 'luxury-chocolate-box', sku: 'LCB-007',
      price: 899, regularPrice: 1099, salePrice: 899, onSale: true, stockQuantity: 60, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: false, categoryIds: [hampers],
      shortDescription: 'Handcrafted Belgian chocolates in a premium gift box.',
      description: 'Assorted Belgian chocolates (24 pieces) in an elegant magnetic closure box. Custom ribbon and personalized message card included.',
      images: [{ src: '/uploads/products/chocolate1.jpg', alt: 'Chocolate Box' }],
      tags: ['chocolate', 'luxury', 'sweet'],
    },
    {
      name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', sku: 'BTS-008',
      price: 1499, regularPrice: 1799, salePrice: 1499, onSale: true, stockQuantity: 40, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: true, categoryIds: [tech],
      shortDescription: 'Compact 5W Bluetooth 5.0 speaker with logo branding.',
      description: 'Portable Bluetooth 5.0 speaker with 5W output, 6-hour battery life, and micro-USB charging. Available in 5 colours with custom logo.',
      images: [{ src: '/uploads/products/speaker1.jpg', alt: 'Bluetooth Speaker' }],
      tags: ['speaker', 'bluetooth', 'tech'],
    },
    {
      name: 'Executive Pen Set', slug: 'executive-pen-set', sku: 'EPS-009',
      price: 449, regularPrice: 549, salePrice: 449, onSale: true, stockQuantity: 180, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: false, categoryIds: [desk, custom],
      shortDescription: 'Set of 2 metal ball pens in a premium gift box.',
      description: 'Two premium metal ballpoint pens (black & blue ink) presented in a velvet-lined gift box. Laser engraving on barrel.',
      images: [{ src: '/uploads/products/pen1.jpg', alt: 'Executive Pen Set' }],
      tags: ['pen', 'executive', 'stationery'],
    },
    {
      name: 'Tote Bag with Logo', slug: 'tote-bag-logo', sku: 'TBL-010',
      price: 299, regularPrice: 299, stockQuantity: 250, stockStatus: 'instock', inStock: true,
      status: 'publish', featured: false, categoryIds: [eco, apparel],
      shortDescription: 'Jute & cotton tote bag with custom logo screen print.',
      description: '12oz canvas tote bag with reinforced handles. Custom logo screen printing on one or both sides. Eco-friendly and reusable.',
      images: [{ src: '/uploads/products/tote1.jpg', alt: 'Tote Bag' }],
      tags: ['tote', 'bag', 'eco'],
    },
    {
      name: 'Customised Mug Set (Set of 2)', slug: 'customised-mug-set', sku: 'CMS-011',
      price: 399, regularPrice: 499, salePrice: 399, onSale: true, stockQuantity: 100, stockStatus: 'instock',
      inStock: true, status: 'publish', featured: false, categoryIds: [custom],
      shortDescription: '350ml ceramic mugs with full-colour logo printing.',
      description: 'Set of 2 premium white ceramic mugs (350ml). Sublimation printing for vibrant, long-lasting designs. Dishwasher safe.',
      images: [{ src: '/uploads/products/mug1.jpg', alt: 'Customised Mugs' }],
      tags: ['mug', 'ceramic', 'customised'],
    },
    {
      name: 'Power Bank 10000mAh', slug: 'power-bank-10000mah', sku: 'PBK-012',
      price: 1299, regularPrice: 1499, salePrice: 1299, onSale: true, stockQuantity: 0, stockStatus: 'outofstock',
      inStock: false, status: 'publish', featured: false, categoryIds: [tech],
      shortDescription: 'Slim 10000mAh power bank with dual USB output.',
      description: '10000mAh lithium polymer power bank with dual USB-A (5V/2A) outputs and micro-USB input. Ultra-slim profile. Custom logo printing.',
      images: [{ src: '/uploads/products/powerbank1.jpg', alt: 'Power Bank' }],
      tags: ['powerbank', 'tech', 'charging'],
    },
  ]

  for (const p of products) {
    const { images, tags, categoryIds, ...scalar } = p
    const product = await Product.create(scalar)
    if (images?.length) {
      await ProductImage.bulkCreate(images.map((img, i) => ({ productId: product.id, src: img.src, alt: img.alt, sortOrder: i })))
    }
    if (tags?.length) {
      await ProductTag.bulkCreate(tags.map(tag => ({ productId: product.id, tag })))
    }
    await product.setCategories((categoryIds || []).filter(Boolean))
  }
  console.log('Products seeded:', products.length)
}

async function seedAll() {
  try {
    await seedAdminUser()
    let cats = await seedCategories()
    if (!cats) {
      cats = await Category.findAll()
    }
    await seedProducts(cats)
    // Category.count is denormalized (read directly by GET /api/categories) and
    // kept in sync incrementally by the product routes as products change. This
    // startup recompute corrects any drift (e.g. from bulk DB edits or a fresh
    // dataset import) without paying an aggregation cost on every request.
    await recomputeAllCategoryCounts()
  } catch (err) {
    console.error('Seed error:', err.message)
  }
}

module.exports = seedAll
