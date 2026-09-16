const { Settings } = require('../models')
const exchangeRates = require('../services/exchangeRateService')

const DEFAULTS = {
  general: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: 'IN',
    state: '',
    postcode: '',
    sellingLocation: 'all',
    excludedCountries: [],
    specificCountries: [],
    shippingLocation: 'all-you-sell',
    shippingSpecificCountries: [],
    defaultCustomerLocation: 'geolocate',
    addressAutocomplete: false,
    currency: 'INR',
    currencyPosition: 'left',
    thousandSeparator: ',',
    decimalSeparator: '.',
    numberOfDecimals: 2,
  },
  products: {
    weightUnit: 'kg',
    dimensionUnit: 'cm',
    defaultView: 'Grid',
    enableReviews: true,
    showStarRating: true,
  },
  tax: {
    enableTax: true,
    taxCalculation: 'On cart total',
    pricesWithTax: 'Excluding tax',
  },
  shipping: {
    defaultLocation: 'Shop base address',
    methods: { freeShipping: true, flatRate: true, localPickup: false },
  },
  payment: {
    methods: {
      razorpay: true,
      payU: true,
      cod: true,
      bankTransfer: false,
    },
  },
  email: {
    fromName: 'Corporate Gifts India',
    fromEmail: 'noreply@corporategifts.in',
    template: 'Default',
    notifications: {
      newOrder: true,
      statusChange: true,
      lowStock: true,
      customerRegistration: true,
      abandonedCart: false,
    },
  },
  api: {
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
    syncFrequency: 'Every 30 minutes',
  },
}

async function get(req, res, next) {
  try {
    const doc = await Settings.findOne({ where: { key: req.params.key } })
    const defaults = DEFAULTS[req.params.key] || {}
    // Merge rather than replace, so a settings row saved before new fields were
    // added (e.g. an old 'general' shape) still gets sane defaults for them
    // instead of silently omitting them.
    res.json(doc ? { ...defaults, ...doc.value } : defaults)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const [doc] = await Settings.findOrCreate({ where: { key: req.params.key }, defaults: { value: req.body } })
    doc.value = req.body
    await doc.save()
    res.json(doc.value)
  } catch (err) { next(err) }
}

// Public (no auth) — the storefront needs currency formatting but must not be
// able to read the rest of General settings (store address, etc.).
// All prices are stored in exchangeRates.BASE_CURRENCY; exchangeRate here is
// the live multiplier the storefront must apply before formatting, so a
// switch to a different currency actually converts the value instead of
// just relabelling the same number under a different symbol.
async function getPublicCurrency(req, res, next) {
  try {
    const doc = await Settings.findOne({ where: { key: 'general' } })
    const defaults = DEFAULTS.general
    const merged = doc ? { ...defaults, ...doc.value } : defaults
    const { base, rates, updatedAt } = await exchangeRates.getRates()
    const exchangeRate = merged.currency === base ? 1 : (rates[merged.currency] ?? 1)
    res.json({
      currency: merged.currency,
      currencyPosition: merged.currencyPosition,
      thousandSeparator: merged.thousandSeparator,
      decimalSeparator: merged.decimalSeparator,
      numberOfDecimals: merged.numberOfDecimals,
      baseCurrency: base,
      exchangeRate,
      ratesUpdatedAt: updatedAt,
    })
  } catch (err) { next(err) }
}

// Admin-only visibility into the full live rate table (for the Currency
// options screen) and a manual retry button for when the provider was
// unreachable at boot.
async function getExchangeRates(req, res, next) {
  try {
    res.json(await exchangeRates.getRates())
  } catch (err) { next(err) }
}

async function refreshExchangeRates(req, res, next) {
  try {
    res.json(await exchangeRates.refreshRates())
  } catch (err) { next(err) }
}

module.exports = { get, update, getPublicCurrency, getExchangeRates, refreshExchangeRates }
