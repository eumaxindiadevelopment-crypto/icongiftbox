import { useState, useEffect } from 'react'
import { CreditCard, Truck, Shield, Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Loading'
import api from '../../lib/api'

const DEFAULT_METHODS = [
  { key: 'razorpay', name: 'Razorpay', desc: 'Accept UPI, cards, net banking & wallets', icon: '💳', enabled: true },
  { key: 'payU', name: 'PayU', desc: 'Trusted Indian payment gateway', icon: '🏦', enabled: true },
  { key: 'cod', name: 'Cash on Delivery', desc: 'Pay at the time of delivery', icon: '💵', enabled: true },
  { key: 'bankTransfer', name: 'Bank Transfer', desc: 'Direct bank transfer / NEFT / RTGS', icon: '🏛️', enabled: false },
]

const SHIPPING_ZONES = [
  { name: 'Metro Cities', regions: 'Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad', methods: ['Standard', 'Express'] },
  { name: 'Rest of India', regions: 'All other pin codes', methods: ['Standard'] },
  { name: 'International', regions: 'Outside India', methods: ['DHL Express'] },
]

export function PaymentsPage() {
  const [methods, setMethods] = useState(DEFAULT_METHODS)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings/payment')
      .then(({ data }) => {
        if (data?.methods) {
          setMethods(DEFAULT_METHODS.map(m => ({ ...m, enabled: data.methods[m.key] ?? m.enabled })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = key => setMethods(prev => prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m))

  const handleSave = async () => {
    const methodMap = Object.fromEntries(methods.map(m => [m.key, m.enabled]))
    try {
      await api.put('/settings/payment', { methods: methodMap })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" /> Payment Methods
            </CardTitle>
            <Button size="sm" onClick={handleSave}>
              <Save size={13} /> {saved ? 'Saved!' : 'Save'}
            </Button>
          </CardHeader>
          <div className="divide-y divide-gray-50">
            {methods.map(pm => (
              <div key={pm.key} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pm.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{pm.name}</p>
                    <p className="text-xs text-gray-500">{pm.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer" onClick={() => toggle(pm.key)}>
                  <input type="checkbox" checked={pm.enabled} onChange={() => {}} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck size={16} className="text-blue-600" /> Shipping Zones
            </CardTitle>
            <button className="text-sm text-blue-600 hover:underline">+ Add Zone</button>
          </CardHeader>
          <div className="divide-y divide-gray-50">
            {SHIPPING_ZONES.map(zone => (
              <div key={zone.name} className="px-5 py-4">
                <p className="text-sm font-semibold text-gray-800 mb-1">{zone.name}</p>
                <p className="text-xs text-gray-500 mb-2">{zone.regions}</p>
                <div className="flex gap-1 flex-wrap">
                  {zone.methods.map(m => (
                    <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={16} className="text-emerald-600" /> Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'SSL Certificate', status: 'Active', icon: '🔒' },
              { label: 'PCI DSS Compliance', status: 'Compliant', icon: '✅' },
              { label: 'Fraud Protection', status: 'Enabled', icon: '🛡️' },
            ].map(item => (
              <div key={item.label} className="p-4 border border-emerald-100 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span>{item.icon}</span>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                </div>
                <p className="text-xs text-emerald-600 font-medium">{item.status}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
