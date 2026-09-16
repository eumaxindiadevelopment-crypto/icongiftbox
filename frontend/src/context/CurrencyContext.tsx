import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import api from '../lib/api'

export type CurrencySettings = {
  currency: string
  currencyPosition: 'left' | 'right' | 'left_space' | 'right_space'
  thousandSeparator: string
  decimalSeparator: string
  numberOfDecimals: number
  // All prices from the API are stored in baseCurrency; exchangeRate is the
  // live multiplier (baseCurrency -> currency) that must be applied before
  // formatting, so switching currency actually converts the value instead
  // of just relabelling the same number under a different symbol.
  baseCurrency: string
  exchangeRate: number
}

// Matches the defaults already seeded in server/src/controllers/settingsController.js,
// so there's no flash of a different format before the real setting loads.
const DEFAULT_SETTINGS: CurrencySettings = {
  currency: 'INR',
  currencyPosition: 'left',
  thousandSeparator: ',',
  decimalSeparator: '.',
  numberOfDecimals: 2,
  baseCurrency: 'INR',
  exchangeRate: 1,
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AUD: '$', CAD: '$', AED: 'د.إ', SGD: '$', JPY: '¥',
}

function formatNumber(value: number, settings: CurrencySettings) {
  const n = Number(value) || 0
  const fixed = n.toFixed(settings.numberOfDecimals)
  const [intPart, decPart] = fixed.split('.')
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandSeparator)
  return decPart ? `${withThousands}${settings.decimalSeparator}${decPart}` : withThousands
}

function formatWithSettings(value: number, settings: CurrencySettings) {
  const symbol = CURRENCY_SYMBOLS[settings.currency] || settings.currency
  const converted = value * (settings.exchangeRate || 1)
  const num = formatNumber(converted, settings)
  switch (settings.currencyPosition) {
    case 'right': return `${num}${symbol}`
    case 'left_space': return `${symbol} ${num}`
    case 'right_space': return `${num} ${symbol}`
    default: return `${symbol}${num}`
  }
}

type CurrencyContextType = {
  settings: CurrencySettings
  formatPrice: (value: number | string | null | undefined) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  settings: DEFAULT_SETTINGS,
  formatPrice: (v) => formatWithSettings(Number(v) || 0, DEFAULT_SETTINGS),
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CurrencySettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    api.get('/settings/public/currency')
      .then(({ data }) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => {})
  }, [])

  const value = useMemo(() => ({
    settings,
    formatPrice: (v: number | string | null | undefined) => formatWithSettings(Number(v) || 0, settings),
  }), [settings])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
