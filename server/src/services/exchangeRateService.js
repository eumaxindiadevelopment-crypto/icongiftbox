const axios = require('axios')
const cron = require('node-cron')
const { Settings } = require('../models')

// All product/order prices in this store are entered and stored in this
// currency. Every other currency is displayed by converting from this base
// using the live rate, never by re-labelling the same number.
const BASE_CURRENCY = 'INR'
const SETTINGS_KEY = 'exchangeRates'
const RATE_PROVIDER_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`

// Used only until the first successful live fetch completes (e.g. first-ever
// boot with no internet access yet), so the storefront never shows a raw
// unconverted number under a foreign symbol.
const FALLBACK_RATES = {
  INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095, AUD: 0.018,
  CAD: 0.016, AED: 0.044, SGD: 0.016, JPY: 1.75,
}

async function fetchLiveRates() {
  const { data } = await axios.get(RATE_PROVIDER_URL, { timeout: 10000 })
  if (data?.result !== 'success' || !data.rates) throw new Error('Unexpected exchange rate API response')
  return data.rates
}

async function refreshRates() {
  const rates = await fetchLiveRates()
  const [doc] = await Settings.findOrCreate({
    where: { key: SETTINGS_KEY },
    defaults: { value: { base: BASE_CURRENCY, rates, updatedAt: new Date().toISOString() } },
  })
  doc.value = { base: BASE_CURRENCY, rates, updatedAt: new Date().toISOString() }
  await doc.save()
  return doc.value
}

async function getRates() {
  const doc = await Settings.findOne({ where: { key: SETTINGS_KEY } })
  if (doc?.value?.rates) return doc.value
  return { base: BASE_CURRENCY, rates: FALLBACK_RATES, updatedAt: null }
}

function scheduleRefresh() {
  // Every 6 hours — plenty fresh for retail pricing without hammering the
  // (free, unauthenticated) rate provider.
  cron.schedule('0 */6 * * *', () => {
    refreshRates().catch(err => console.error('Exchange rate refresh failed:', err.message))
  })
}

module.exports = { BASE_CURRENCY, refreshRates, getRates, scheduleRefresh }
