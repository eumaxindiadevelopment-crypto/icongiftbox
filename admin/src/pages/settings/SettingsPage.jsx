import { useState, useEffect } from 'react'
import { Save, Store, Package, FileText, Truck, CreditCard, Mail, Key, HelpCircle, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Loading'
import { cn } from '../../lib/utils'
import api from '../../lib/api'
import { COUNTRIES, INDIA_STATES, CURRENCIES } from '../../constants/geoData'

const TABS = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'tax', label: 'Tax', icon: FileText },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'api', label: 'API', icon: Key },
]

// WooCommerce-style settings row: label + help icon on the left, control on the right.
function SettingsRow({ label, help, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_20px_1fr] gap-3 items-start py-4 border-b border-gray-100 last:border-b-0">
      <label className="text-sm font-semibold text-gray-800 pt-2">{label}</label>
      <div className="pt-2 text-gray-300 shrink-0" title={help || ''}>{help && <HelpCircle size={15} />}</div>
      <div className="max-w-md">{children}</div>
    </div>
  )
}

function CountryMultiSelect({ selected, onChange }) {
  const toggle = (code) => onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code])
  return (
    <div>
      <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-0.5 bg-white">
        {COUNTRIES.map(c => (
          <label key={c.code} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={selected.includes(c.code)} onChange={() => toggle(c.code)} className="rounded border-gray-300 text-blue-600" />
            {c.name}
          </label>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={() => onChange(COUNTRIES.map(c => c.code))} className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Select all</button>
        <button type="button" onClick={() => onChange([])} className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Select none</button>
      </div>
    </div>
  )
}

const DEFAULTS = {
  general: {
    addressLine1: '', addressLine2: '', city: '', country: 'IN', state: '', postcode: '',
    sellingLocation: 'all', excludedCountries: [], specificCountries: [],
    shippingLocation: 'all-you-sell', shippingSpecificCountries: [],
    defaultCustomerLocation: 'geolocate', addressAutocomplete: false,
    currency: 'INR', currencyPosition: 'left', thousandSeparator: ',', decimalSeparator: '.', numberOfDecimals: 2,
  },
  products: { weightUnit: 'kg', dimensionUnit: 'cm', defaultView: 'Grid', enableReviews: true, showStarRating: true },
  tax: { enableTax: true, taxCalculation: 'On cart total', pricesWithTax: 'Excluding tax' },
  shipping: { defaultLocation: 'Shop base address', methods: { freeShipping: true, flatRate: true, localPickup: false } },
  payment: { methods: { razorpay: true, payU: true, cod: true, bankTransfer: false } },
  email: { fromName: 'Corporate Gifts India', fromEmail: 'noreply@corporategifts.in', template: 'Default', notifications: { newOrder: true, statusChange: true, lowStock: true, customerRegistration: true, abandonedCart: false } },
  api: { storeUrl: '', consumerKey: '', consumerSecret: '', syncFrequency: 'Every 30 minutes' },
}

export function SettingsPage() {
  const [tab, setTab] = useState('general')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [rates, setRates] = useState(null)
  const [ratesLoading, setRatesLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/settings/${tab}`)
      .then(({ data: d }) => setData(d && Object.keys(d).length ? d : DEFAULTS[tab] || {}))
      .catch(() => setData(DEFAULTS[tab] || {}))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    if (tab !== 'general') return
    api.get('/settings/exchange-rates').then(({ data: d }) => setRates(d)).catch(() => {})
  }, [tab])

  const refreshRates = () => {
    setRatesLoading(true)
    api.post('/settings/exchange-rates/refresh')
      .then(({ data: d }) => setRates(d))
      .catch(() => {})
      .finally(() => setRatesLoading(false))
  }

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }))
  const setNested = (parent, key, val) => setData(prev => ({ ...prev, [parent]: { ...(prev[parent] || {}), [key]: val } }))

  const handleSave = async () => {
    try {
      await api.put(`/settings/${tab}`, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  const SaveBtn = () => (
    <Button size="sm" onClick={handleSave}>
      <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
    </Button>
  )

  return (
    <div className="flex gap-6">
      <div className="w-48 shrink-0">
        <nav className="space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                tab === t.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100')}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : (
          <>
            {tab === 'general' && (
              <>
                {/* ── Store Address ── */}
                <Card>
                  <CardHeader className="block py-4">
                    <CardTitle>Store Address</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">This is where your business is located. Tax rates and shipping rates will use this address.</p>
                  </CardHeader>
                  <CardBody className="!py-0">
                    <SettingsRow label="Address line 1" help="Street address">
                      <input className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.addressLine1 || ''} onChange={e => set('addressLine1', e.target.value)} />
                    </SettingsRow>
                    <SettingsRow label="Address line 2" help="Apartment, suite, unit, etc. (optional)">
                      <input className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.addressLine2 || ''} onChange={e => set('addressLine2', e.target.value)} />
                    </SettingsRow>
                    <SettingsRow label="City" help="Town / City">
                      <input className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.city || ''} onChange={e => set('city', e.target.value)} />
                    </SettingsRow>
                    <SettingsRow label="Country / State" help="The country and state or region your business is located in.">
                      <div className="flex gap-2">
                        <select className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={data.country || 'IN'} onChange={e => set('country', e.target.value)}>
                          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                        {data.country === 'IN' ? (
                          <select className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={data.state || ''} onChange={e => set('state', e.target.value)}>
                            <option value="">— Select a state —</option>
                            {INDIA_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                          </select>
                        ) : (
                          <input placeholder="State / region" className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={data.state || ''} onChange={e => set('state', e.target.value)} />
                        )}
                      </div>
                    </SettingsRow>
                    <SettingsRow label="Postcode / ZIP" help="Postcode or ZIP for your business location.">
                      <input className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.postcode || ''} onChange={e => set('postcode', e.target.value)} />
                    </SettingsRow>
                  </CardBody>
                </Card>

                {/* ── General options ── */}
                <Card>
                  <CardHeader><CardTitle>General options</CardTitle></CardHeader>
                  <CardBody className="!py-0">
                    <SettingsRow label="Selling location(s)" help="This option lets you limit which countries you sell to.">
                      <select className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.sellingLocation || 'all'} onChange={e => set('sellingLocation', e.target.value)}>
                        <option value="all">Sell to all countries</option>
                        <option value="except">Sell to all countries, except for…</option>
                        <option value="specific">Sell to specific countries</option>
                      </select>
                    </SettingsRow>

                    {data.sellingLocation === 'except' && (
                      <SettingsRow label="Sell to all countries, except for…">
                        <CountryMultiSelect selected={data.excludedCountries || []} onChange={v => set('excludedCountries', v)} />
                      </SettingsRow>
                    )}
                    {data.sellingLocation === 'specific' && (
                      <SettingsRow label="Sell to specific countries">
                        <CountryMultiSelect selected={data.specificCountries || []} onChange={v => set('specificCountries', v)} />
                      </SettingsRow>
                    )}

                    <SettingsRow label="Shipping location(s)" help="Choose which countries you want to ship to.">
                      <select className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.shippingLocation || 'all-you-sell'} onChange={e => set('shippingLocation', e.target.value)}>
                        <option value="all-you-sell">Ship to all countries you sell to</option>
                        <option value="all">Ship to all countries</option>
                        <option value="specific">Ship to specific countries only</option>
                        <option value="disabled">Disable shipping &amp; shipping calculations</option>
                      </select>
                    </SettingsRow>

                    {data.shippingLocation === 'specific' && (
                      <SettingsRow label="Ship to specific countries">
                        <CountryMultiSelect selected={data.shippingSpecificCountries || []} onChange={v => set('shippingSpecificCountries', v)} />
                      </SettingsRow>
                    )}

                    <SettingsRow label="Default customer location" help="The location your store defaults to when a shopper's location can't be determined.">
                      <select className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.defaultCustomerLocation || 'geolocate'} onChange={e => set('defaultCustomerLocation', e.target.value)}>
                        <option value="geolocate">Geolocate</option>
                        <option value="none">No location by default</option>
                        <option value="base">Shop country/region</option>
                        <option value="geolocate-ajax">Geolocate (with page caching support)</option>
                      </select>
                    </SettingsRow>

                    <SettingsRow label="Address autocomplete">
                      <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 mt-0.5"
                          checked={!!data.addressAutocomplete} onChange={e => set('addressAutocomplete', e.target.checked)} />
                        <span>
                          Enable predictive address search
                          <span className="block text-xs text-gray-400 mt-0.5">Suggest full addresses to customers as they type.</span>
                        </span>
                      </label>
                    </SettingsRow>
                  </CardBody>
                </Card>

                {/* ── Currency options ── */}
                <Card>
                  <CardHeader className="block py-4">
                    <CardTitle>Currency options</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">The following options affect how prices are displayed on the frontend.</p>
                  </CardHeader>
                  <CardBody className="!py-0">
                    <SettingsRow label="Currency" help="This controls what currency prices are listed at in the catalog and which currency gateways will take payments in.">
                      <select className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.currency || 'INR'} onChange={e => set('currency', e.target.value)}>
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                      {(data.currency || 'INR') !== (rates?.base || 'INR') && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          {rates?.rates?.[data.currency] ? (
                            <span>
                              Live rate: 1 {rates.base} = {rates.rates[data.currency].toFixed(4)} {data.currency}
                              {rates.updatedAt && <> · updated {new Date(rates.updatedAt).toLocaleString()}</>}
                            </span>
                          ) : (
                            <span>Fetching live rate…</span>
                          )}
                          <button type="button" onClick={refreshRates} disabled={ratesLoading}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-50">
                            <RefreshCw size={12} className={ratesLoading ? 'animate-spin' : ''} /> Refresh
                          </button>
                        </div>
                      )}
                    </SettingsRow>
                    <SettingsRow label="Currency position" help="This controls the position of the currency symbol.">
                      <select className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.currencyPosition || 'left'} onChange={e => set('currencyPosition', e.target.value)}>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="left_space">Left with space</option>
                        <option value="right_space">Right with space</option>
                      </select>
                    </SettingsRow>
                    <SettingsRow label="Thousand separator" help="This sets the thousand separator of displayed prices.">
                      <input className="w-24 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.thousandSeparator ?? ','} onChange={e => set('thousandSeparator', e.target.value)} />
                    </SettingsRow>
                    <SettingsRow label="Decimal separator" help="This sets the decimal separator of displayed prices.">
                      <input className="w-24 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.decimalSeparator ?? '.'} onChange={e => set('decimalSeparator', e.target.value)} />
                    </SettingsRow>
                    <SettingsRow label="Number of decimals" help="This sets the number of decimal points shown in displayed prices.">
                      <input type="number" min={0} max={6} className="w-24 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={data.numberOfDecimals ?? 2} onChange={e => set('numberOfDecimals', Number(e.target.value))} />
                    </SettingsRow>
                  </CardBody>
                </Card>

                <div>
                  <SaveBtn />
                </div>
              </>
            )}

            {tab === 'products' && (
              <Card>
                <CardHeader><CardTitle>Product Settings</CardTitle><SaveBtn /></CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Weight Unit" value={data.weightUnit || 'kg'} onChange={e => set('weightUnit', e.target.value)}>
                      <option>kg</option><option>g</option><option>lbs</option><option>oz</option>
                    </Select>
                    <Select label="Dimension Unit" value={data.dimensionUnit || 'cm'} onChange={e => set('dimensionUnit', e.target.value)}>
                      <option>cm</option><option>m</option><option>mm</option><option>in</option><option>yd</option>
                    </Select>
                  </div>
                  <Select label="Default Product View" value={data.defaultView || 'Grid'} onChange={e => set('defaultView', e.target.value)}>
                    <option>List</option><option>Grid</option>
                  </Select>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Reviews</p>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={!!data.enableReviews} onChange={e => set('enableReviews', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                      Enable product reviews
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={!!data.showStarRating} onChange={e => set('showStarRating', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                      Show star rating on products
                    </label>
                  </div>
                </CardBody>
              </Card>
            )}

            {tab === 'tax' && (
              <Card>
                <CardHeader><CardTitle>Tax Settings</CardTitle><SaveBtn /></CardHeader>
                <CardBody className="space-y-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={!!data.enableTax} onChange={e => set('enableTax', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                    Enable tax rates
                  </label>
                  <Select label="Tax Calculation" value={data.taxCalculation || ''} onChange={e => set('taxCalculation', e.target.value)}>
                    <option>On cart total</option><option>On subtotal</option>
                  </Select>
                  <Select label="Prices Entered With Tax" value={data.pricesWithTax || ''} onChange={e => set('pricesWithTax', e.target.value)}>
                    <option>Excluding tax</option><option>Including tax</option>
                  </Select>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Rate Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Rate %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[{ name: 'GST 5%', rate: 5 }, { name: 'GST 12%', rate: 12 }, { name: 'GST 18%', rate: 18 }, { name: 'GST 28%', rate: 28 }].map(t => (
                          <tr key={t.name}><td className="px-4 py-2">{t.name}</td><td className="px-4 py-2">{t.rate}%</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            )}

            {tab === 'shipping' && (
              <Card>
                <CardHeader><CardTitle>Shipping Settings</CardTitle><SaveBtn /></CardHeader>
                <CardBody className="space-y-4">
                  <Select label="Default Customer Location" value={data.defaultLocation || ''} onChange={e => set('defaultLocation', e.target.value)}>
                    <option>No default location</option>
                    <option>Shop base address</option>
                    <option>Customer billing address</option>
                  </Select>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Shipping Methods</p>
                    {[
                      { key: 'freeShipping', label: 'Free Shipping' },
                      { key: 'flatRate', label: 'Flat Rate' },
                      { key: 'localPickup', label: 'Local Pickup' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox"
                            checked={!!(data.methods?.[key])}
                            onChange={e => setNested('methods', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {tab === 'payment' && (
              <Card>
                <CardHeader><CardTitle>Payment Settings</CardTitle><SaveBtn /></CardHeader>
                <CardBody className="space-y-3">
                  {[
                    { key: 'razorpay', label: 'Razorpay' },
                    { key: 'payU', label: 'PayU' },
                    { key: 'cod', label: 'Cash on Delivery' },
                    { key: 'bankTransfer', label: 'Bank Transfer' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!(data.methods?.[key])}
                          onChange={e => setNested('methods', key, e.target.checked)}
                          className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}

            {tab === 'email' && (
              <Card>
                <CardHeader><CardTitle>Email Settings</CardTitle><SaveBtn /></CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="From Name" value={data.fromName || ''} onChange={e => set('fromName', e.target.value)} />
                    <Input label="From Email" value={data.fromEmail || ''} onChange={e => set('fromEmail', e.target.value)} />
                  </div>
                  <Select label="Email Template" value={data.template || 'Default'} onChange={e => set('template', e.target.value)}>
                    <option>Default</option><option>Modern</option><option>Minimal</option>
                  </Select>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                    {[
                      { key: 'newOrder', label: 'New order' },
                      { key: 'statusChange', label: 'Order status change' },
                      { key: 'lowStock', label: 'Low stock alert' },
                      { key: 'customerRegistration', label: 'Customer registration' },
                      { key: 'abandonedCart', label: 'Abandoned cart' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox"
                          checked={!!(data.notifications?.[key])}
                          onChange={e => setNested('notifications', key, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600" />
                        {label}
                      </label>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {tab === 'api' && (
              <Card>
                <CardHeader><CardTitle>API Settings</CardTitle><SaveBtn /></CardHeader>
                <CardBody className="space-y-4">
                  <Input label="WooCommerce Store URL" value={data.storeUrl || ''} onChange={e => set('storeUrl', e.target.value)} />
                  <Input label="Consumer Key" type="password" value={data.consumerKey || ''} onChange={e => set('consumerKey', e.target.value)} />
                  <Input label="Consumer Secret" type="password" value={data.consumerSecret || ''} onChange={e => set('consumerSecret', e.target.value)} />
                  <Select label="Sync Frequency" value={data.syncFrequency || 'Every 30 minutes'} onChange={e => set('syncFrequency', e.target.value)}>
                    <option>Every 15 minutes</option>
                    <option>Every 30 minutes</option>
                    <option>Every hour</option>
                    <option>Every 6 hours</option>
                    <option>Daily</option>
                  </Select>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
