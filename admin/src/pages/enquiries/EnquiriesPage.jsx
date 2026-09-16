import { useState, useEffect, useCallback } from 'react'
import { Check, Ban, Trash2, MessageSquare, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Spinner, NoData } from '../../components/ui/Loading'
import api from '../../lib/api'

const TABS = [
  { key: '', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'closed', label: 'Closed' },
]

const STATUS_VARIANT = { new: 'warning', contacted: 'info', closed: 'success' }

function PopupSettings() {
  const [settings, setSettings] = useState({ enabled: true, delaySeconds: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/enquiry-settings')
      .then(({ data }) => setSettings({ enabled: data.enabled ?? true, delaySeconds: data.delaySeconds ?? 1 }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/enquiry-settings', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {}
    finally { setSaving(false) }
  }

  if (loading) return null

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Home Page Popup</h2>
          <p className="text-xs text-gray-500 mt-0.5">Controls the "Talk to Our Corporate Gifting Experts" popup on the website</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
          <Save size={13} />{saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={!!settings.enabled}
            onChange={e => setSettings(s => ({ ...s, enabled: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600" />
          Enable popup on the website
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 whitespace-nowrap">Appear after</label>
          <input type="number" step="0.5" min="0" disabled={!settings.enabled}
            className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            value={settings.delaySeconds}
            onChange={e => setSettings(s => ({ ...s, delaySeconds: +e.target.value }))} />
          <span className="text-sm text-gray-500">seconds</span>
        </div>
      </div>
    </Card>
  )
}

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')

  const fetchEnquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (activeTab) params.set('status', activeTab)
      const { data } = await api.get(`/enquiries?${params}`)
      setEnquiries(data.enquiries || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch { setEnquiries([]) }
    finally { setLoading(false) }
  }, [activeTab, page])

  useEffect(() => { fetchEnquiries() }, [fetchEnquiries])

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/enquiries/${id}`, { status })
      fetchEnquiries()
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this enquiry?')) return
    try {
      await api.delete(`/enquiries/${id}`)
      fetchEnquiries()
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Enquiries</h1>
        <p className="text-xs text-gray-500 mt-0.5">{total} total — from the "Talk to Our Corporate Gifting Experts" popup</p>
      </div>

      <PopupSettings />

      <Card>
        <div className="flex gap-0 overflow-x-auto border-b border-gray-100">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : enquiries.length === 0 ? (
          <NoData title="No enquiries found" icon={<MessageSquare size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Gifting For</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enquiries.map(e => (
                  <tr key={e._id} className="hover:bg-gray-50/50 transition-colors align-top">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{e.fullName}</p>
                      <p className="text-xs text-gray-400">{e.phone}</p>
                      {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.city}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.giftingFor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{e.budgetPerGift}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{e.quantityRequired}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[220px]">
                      {e.additionalInfo ? <p className="line-clamp-2">{e.additionalInfo}</p> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[e.status] || 'neutral'}>{e.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {e.status !== 'contacted' && (
                          <button onClick={() => setStatus(e._id, 'contacted')} title="Mark as contacted" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                            <Check size={14} />
                          </button>
                        )}
                        {e.status !== 'closed' && (
                          <button onClick={() => setStatus(e._id, 'closed')} title="Mark as closed" className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600">
                            <Ban size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(e._id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
