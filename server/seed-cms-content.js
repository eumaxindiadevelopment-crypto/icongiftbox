/**
 * One-off content seed for the homepage CMS sections (banners, featured categories,
 * and the 13 singleton section rows). seed.js only seeds products/categories/admin —
 * this fills in the marketing content so the homepage shows real corporate-gifts
 * branding instead of each section's built-in fashion-template fallback data.
 * Safe to re-run: banners/featured-categories are replaced, singleton rows are updated in place.
 */
require('dotenv').config()
const {
  sequelize, Product, Category, Banner, FeaturedCategory,
  AboutSection, SummerSale, AllProductionSection, GreatSavingSection,
  HottestBlogSection, BlockbusterSection, OfferSection, FeaturedNowSection,
  ShortListSection, SponsoredSection, TradingSection, CollectionSection,
} = require('./src/models')

async function run() {
  await sequelize.authenticate()

  const products = await Product.findAll({ include: [{ association: 'images' }] })
  const bySlug = Object.fromEntries(products.map(p => [p.slug, p]))
  const img = slug => bySlug[slug]?.images?.[0]?.src || ''
  const pick = (...slugs) => slugs.map(s => bySlug[s]).filter(Boolean)

  const productCard = p => ({
    name: p.name,
    title: p.name,
    image: p.images?.[0]?.src || '',
    saleTitle: p.onSale ? `Save ₹${Math.round(p.regularPrice - p.price)}` : 'Best Seller',
    price: String(p.price),
    originalPrice: String(p.regularPrice),
    link: `/product/${p.slug}`,
  })

  // 1. Hero banner slider
  await Banner.destroy({ where: {} })
  await Banner.bulkCreate([
    { title: 'Premium Corporate Gift Hampers', subtitle: 'Starting at', price: '2499', image: img('premium-corporate-gift-hamper'), buttonText: 'Shop Hampers', productLink: '/product/premium-corporate-gift-hamper', sortOrder: 0 },
    { title: 'Custom Branded Merchandise', subtitle: 'Starting at', price: '299', image: img('corporate-branded-tshirt'), buttonText: 'View Detail', productLink: '/product/corporate-branded-tshirt', sortOrder: 1 },
    { title: 'Tech Gifts For Your Team', subtitle: 'Starting at', price: '999', image: img('wireless-charging-pad'), buttonText: 'View Detail', productLink: '/product/wireless-charging-pad', sortOrder: 2 },
  ])
  console.log('Banners seeded')

  // 2. Featured categories strip
  await FeaturedCategory.destroy({ where: {} })
  await FeaturedCategory.bulkCreate([
    { name: 'Gift Hampers', image: img('premium-corporate-gift-hamper'), url: '/shop/category/gift-hampers', sortOrder: 0 },
    { name: 'Desk Accessories', image: img('customised-leather-diary'), url: '/shop/category/desk-accessories', sortOrder: 1 },
    { name: 'Customised Gifts', image: img('customised-mug-set'), url: '/shop/category/customised-gifts', sortOrder: 2 },
    { name: 'Eco Friendly', image: img('stainless-steel-bottle'), url: '/shop/category/eco-friendly', sortOrder: 3 },
    { name: 'Tech Gadgets', image: img('bluetooth-speaker'), url: '/shop/category/tech-gadgets', sortOrder: 4 },
    { name: 'Apparel & Accessories', image: img('corporate-branded-tshirt'), url: '/shop/category/apparel-accessories', sortOrder: 5 },
  ])
  console.log('Featured categories seeded')

  // 3. About section
  const about = (await AboutSection.findOne()) || await AboutSection.create({})
  await about.update({
    mainImage: img('premium-corporate-gift-hamper'),
    mainBtnText: 'Gift Hampers', mainBtnLink: '/shop/category/gift-hampers',
    title: 'Elevate Your Corporate Gifting Game!',
    description: 'From premium hampers to custom branded merchandise, we help you make a lasting impression with every gift — for clients, employees, and everyone in between.',
    aboutLink: '/about-us',
    card1Image: img('bluetooth-speaker'), card1BtnText: 'Tech Gadgets', card1Link: '/shop/category/tech-gadgets',
    card2Image: img('customised-mug-set'), card2BtnText: 'Custom Branding', card2Link: '/shop/category/customised-gifts', card2Badge: '20% Off',
  })
  console.log('About section updated')

  // 4. Summer sale panels -> festive / bulk gifting promo
  const sale = (await SummerSale.findOne()) || await SummerSale.create({})
  await sale.update({
    panel1Image: img('luxury-chocolate-box'), panel1Badge: 'Sale Up to 20% Off', panel1Heading: 'Festive', panel1Year: 'Gifting', panel1BtnText: 'Shop Now', panel1BtnLink: '/shop',
    panel2Image: img('executive-pen-set'), panel2Badge: 'Sale Up to 20% Off', panel2Heading: 'New Corporate Collection', panel2BtnText: 'Shop Now', panel2BtnLink: '/shop',
  })
  console.log('Summer sale updated')

  // 5. "All production" -> customers also bought
  const allProd = (await AllProductionSection.findOne()) || await AllProductionSection.create({})
  await allProd.update({
    mainImage: img('bamboo-pen-card-holder'),
    title: 'Customers Also Bought These Popular Gifts',
    shopLink: '/shop',
    cards: pick('customised-leather-diary', 'bamboo-pen-card-holder', 'stainless-steel-bottle').map(productCard),
  })
  console.log('All production section updated')

  // 6. Great saving
  const greatSaving = (await GreatSavingSection.findOne()) || await GreatSavingSection.create({})
  await greatSaving.update({
    bannerImage: img('power-bank-10000mah'),
    title: 'Great Savings on Corporate Gifting Essentials',
    subtitle: 'Up to 30% off + free branding on bulk orders',
    btnText: 'See all', btnLink: '/shop', animationText: 'Great Saving',
    cards: pick('executive-pen-set', 'tote-bag-logo', 'customised-mug-set', 'bluetooth-speaker')
      .map((p, i) => ({ ...productCard(p), showBadge: i === 1 })),
  })
  console.log('Great saving section updated')

  // 7. "Hottest blog" -> trending gifts
  const hottest = (await HottestBlogSection.findOne()) || await HottestBlogSection.create({})
  await hottest.update({
    title: 'Most Popular Corporate Gifts This Season',
    subtitle: 'Up to 30% off on bulk corporate orders',
    seeAllLink: '/shop',
    mapCards: pick('luxury-chocolate-box', 'wireless-charging-pad', 'corporate-branded-tshirt').map(productCard),
    sliderItems: pick('premium-corporate-gift-hamper', 'customised-leather-diary', 'bamboo-pen-card-holder', 'wireless-charging-pad', 'corporate-branded-tshirt', 'stainless-steel-bottle').map(productCard),
  })
  console.log('Hottest blog section updated')

  // 8. Blockbuster deals
  const blockbuster = (await BlockbusterSection.findOne()) || await BlockbusterSection.create({})
  await blockbuster.update({
    sectionTitle: 'Blockbuster Corporate Deals',
    seeAllText: 'See all deals', seeAllLink: '/shop-list',
    sliderItems: pick('luxury-chocolate-box', 'bluetooth-speaker', 'power-bank-10000mah', 'customised-mug-set').map(productCard),
  })
  console.log('Blockbuster section updated')

  // 9. Offer section (promo banners)
  const offer = (await OfferSection.findOne()) || await OfferSection.create({})
  await offer.update({
    sectionTitle: 'Featured Offer For You',
    seeAllLink: '/shop-list',
    slides: [
      { backgroundImage: img('premium-corporate-gift-hamper'), offerText: '20% Off', headingStyle: 'product-name', heading: 'Gift Hampers', spanText: '', btnText: 'Shop Now', btnLink: '/shop/category/gift-hampers' },
      { backgroundImage: img('bluetooth-speaker'), offerText: 'Sale Up to 30% Off', headingStyle: 'sub-title1', heading: 'Tech Gifts', spanText: '2026', btnText: 'Shop Now', btnLink: '/shop/category/tech-gadgets' },
      { backgroundImage: img('corporate-branded-tshirt'), offerText: '20% Off', headingStyle: 'sub-title2', heading: 'Branded Apparel', spanText: 'Sale', btnText: 'Shop Now', btnLink: '/shop/category/apparel-accessories' },
    ],
  })
  console.log('Offer section updated')

  // 10. Featured now
  const featuredNow = (await FeaturedNowSection.findOne()) || await FeaturedNowSection.create({})
  await featuredNow.update({
    sectionTitle: 'Featured Now',
    seeAllLink: '/shop-list',
    sliderItems: pick('wireless-charging-pad', 'stainless-steel-bottle', 'executive-pen-set').map(p => ({ ...productCard(p), review: '(2k Review)' })),
  })
  console.log('Featured now section updated')

  // 11. Shortlist
  const shortlist = (await ShortListSection.findOne()) || await ShortListSection.create({})
  await shortlist.update({
    bannerImage: img('customised-mug-set'),
    bannerTitle: 'Recently Added Corporate Gifts',
    btnText: 'Shop Now', btnLink: '/shop-list', animationText: 'Shortlist',
    cards: pick('luxury-chocolate-box', 'tote-bag-logo').map((p, i) => ({ ...productCard(p), showBadge: i === 0 })),
  })
  console.log('Shortlist section updated')

  // 12. Sponsored strip
  const sponsored = (await SponsoredSection.findOne()) || await SponsoredSection.create({})
  await sponsored.update({
    sectionTitle: 'Sponsored',
    seeAllLink: '/shop-list',
    slides: pick('bamboo-pen-card-holder', 'power-bank-10000mah', 'customised-leather-diary', 'bluetooth-speaker')
      .map(p => ({ image: p.images?.[0]?.src || '', title: p.name, saleTitle: 'Min. 20% Off' })),
  })
  console.log('Sponsored section updated')

  // 13. Trading (blog-styled trending strip)
  const trading = (await TradingSection.findOne()) || await TradingSection.create({})
  await trading.update({
    sectionTitle: 'Trending Corporate Gift Ideas',
    shopLink: '/shop',
    slides: pick('premium-corporate-gift-hamper', 'executive-pen-set', 'stainless-steel-bottle', 'bluetooth-speaker', 'customised-mug-set')
      .map(p => ({ image: p.images?.[0]?.src || '', name: p.name, date: 'Corporate Gifting' })),
  })
  console.log('Trading section updated')

  // 14. Collection banner grid
  const collection = (await CollectionSection.findOne()) || await CollectionSection.create({})
  await collection.update({
    sectionTitle: 'Upgrade Your Workplace With Our Top-Notch Gift Collection',
    btnText: 'All Collections', btnLink: '/shop-list',
    images: [
      { image: img('premium-corporate-gift-hamper'), design: 'collection1' },
      { image: img('bluetooth-speaker'), design: 'collection2' },
      { image: img('corporate-branded-tshirt'), design: 'collection3' },
      { image: img('customised-mug-set'), design: 'collection4' },
      { image: img('stainless-steel-bottle'), design: 'collection5' },
    ],
  })
  console.log('Collection section updated')

  console.log('\n✔ CMS content seed complete.')
  process.exit()
}

run().catch(e => { console.error('Seed error:', e.message); process.exit(1) })
