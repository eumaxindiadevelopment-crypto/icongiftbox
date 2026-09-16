require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

// Security
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 2000, message: 'Too many requests' }))

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
]
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true,
}))

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// Static uploads — served cross-origin so admin (port 5174) can load images
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/brands', require('./routes/brands'))
app.use('/api/tags', require('./routes/tags'))
app.use('/api/attributes', require('./routes/attributes'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/customers', require('./routes/customers'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/coupons', require('./routes/coupons'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/featured-categories', require('./routes/featuredCategories'))
app.use('/api/about-section', require('./routes/aboutSection'))
app.use('/api/product-section-settings', require('./routes/productSectionSettings'))
app.use('/api/summer-sale', require('./routes/summerSale'))
app.use('/api/all-production', require('./routes/allProduction'))
app.use('/api/great-saving', require('./routes/greatSaving'))
app.use('/api/hottest-blog', require('./routes/hottestBlog'))
app.use('/api/blockbuster', require('./routes/blockbuster'))
app.use('/api/offer-section', require('./routes/offerSection'))
app.use('/api/featured-now', require('./routes/featuredNow'))
app.use('/api/shortlist', require('./routes/shortlist'))
app.use('/api/sponsored', require('./routes/sponsored'))
app.use('/api/our-client', require('./routes/ourClient'))
app.use('/api/enquiries', require('./routes/enquiries'))
app.use('/api/enquiry-settings', require('./routes/enquirySettings'))
app.use('/api/trading', require('./routes/trading'))
app.use('/api/collection', require('./routes/collection'))

// Error handling
app.use(notFound)
app.use(errorHandler)

// Database + start
const PORT = process.env.PORT || 5000
const { sequelize } = require('./models')

sequelize.authenticate()
  .then(async () => {
    console.log('MySQL connected')
    await require('./seed')()

    const exchangeRates = require('./services/exchangeRateService')
    exchangeRates.refreshRates()
      .then(() => console.log('Exchange rates synced'))
      .catch(err => console.error('Exchange rate sync failed (using cached/fallback rates):', err.message))
    exchangeRates.scheduleRefresh()

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('Database connection error:', err.message)
    process.exit(1)
  })

module.exports = app
