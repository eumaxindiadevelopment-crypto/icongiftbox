import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Tag, Copy, Check, X } from 'lucide-react'
import { formatDate, formatCurrency } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/Modal'
import { Spinner, NoData } from '../../components/ui/Loading'
import api from '../../lib/api'

const MODAL_TABS = [
  { key: 'general', label: 'General' },
  { key: 'restrictions', label: 'Usage Restriction' },
  { key: 'limits', label: 'Usage Limits' },
]

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percent',
  amount: '',
  // Restrictions
  minAmount: '',
  maxAmount: '',
  individualUse: false,
  excludeSaleItems: false,
  // Limits
  usageLimit: '',
  usageLimitPerUser: '',
  expiryDate: '',
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [copiedId, setCopiedId] = useState(null)
  const [error, setError] = useState('')

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/coupons')
      setCoupons(data.coupons || data || [])
    } catch { setCoupons([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const openAdd = () => {
    setEditItem(null)
    setForm({ ...emptyForm, code: generateCode() })
    setModalTab('general')
    setError('')
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditItem(c)
    setForm({
      code: c.code || '',
      description: c.description || '',
      discountType: c.discountType || c.type || 'percent',
      amount: c.amount ?? '',
      minAmount: c.minAmount ?? '',
      maxAmount: c.maxAmount ?? '',
      individualUse: c.individualUse || false,
      excludeSaleItems: c.excludeSaleItems || false,
      usageLimit: c.usageLimit ?? '',
      usageLimitPerUser: c.usageLimitPerUser ?? '',
      expiryDate: c.expiryDate?.slice(0, 10) || '',
    })
    setModalTab('general')
    setError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim()) { setError('Coupon code is required'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        amount: Number(form.amount) || 0,
        minAmount: form.minAmount ? Number(form.minAmount) : null,
        maxAmount: form.maxAmount ? Number(form.maxAmount) : null,
        individualUse: form.individualUse,
        excludeSaleItems: form.excludeSaleItems,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        usageLimitPerUser: form.usageLimitPerUser ? Number(form.usageLimitPerUser) : null,
        expiryDate: form.expiryDate || null,
      }
      if (editItem) await api.put(`/coupons/${editItem._id}`, payload)
      else await api.post('/coupons', payload)
      setModalOpen(false)
      fetchCoupons()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save coupon')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/coupons/${id}`); fetchCoupons() } catch {}
    setDeleteId(null)
  }

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const discountLabel = (c) => {
    const type = c.discountType || c.type
    if (type === 'percent') return `${c.amount}% off`
    if (type === 'fixed_cart') return `${formatCurrency(c.amount)} off`
    return 'Free shipping'
  }

  const isExpired = (c) => c.expiryDate && new Date(c.expiryDate) < new Date()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Coupons</h1>
          <p className="text-xs text-gray-500 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus size={14} /> Add Coupon</Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : coupons.length === 0 ? (
          <NoData title="No coupons yet" message="Create your first coupon to offer discounts" icon={<Tag size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Min Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-gray-800 tracking-wide">{c.code}</span>
                        <button onClick={() => copyCode(c.code, c._id)} title="Copy code"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all">
                          {copiedId === c._id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate hidden md:table-cell">
                      {c.description || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {discountLabel(c)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      {c.minAmount ? formatCurrency(c.minAmount) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-700 font-medium">{c.usageCount || 0}</span>
                        <span className="text-gray-400 text-xs">/ {c.usageLimit ?? '∞'}</span>
                      </div>
                      {c.usageLimit > 0 && (
                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-1">
                          <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((c.usageCount || 0) / c.usageLimit) * 100)}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">
                      {c.expiryDate
                        ? <span className={isExpired(c) ? 'text-red-600 font-medium' : 'text-gray-600'}>{formatDate(c.expiryDate)}</span>
                        : <span className="text-gray-300">No expiry</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={isExpired(c) ? 'expired' : (c.status || 'active')} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? `Edit Coupon — ${editItem.code}` : 'Add Coupon'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60">
              {saving ? 'Saving…' : editItem ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </>
        }
      >
        {/* Modal tabs */}
        <div className="flex border-b border-gray-200 -mx-6 px-6 mb-5">
          {MODAL_TABS.map(t => (
            <button key={t.key} onClick={() => setModalTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                modalTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-4">{error}</p>}

        {/* General */}
        {modalTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Coupon Code *</label>
              <div className="flex gap-2">
                <input
                  value={form.code}
                  onChange={e => set('code', e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                  className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 font-mono py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <button type="button" onClick={() => set('code', generateCode())}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 whitespace-nowrap">
                  Generate
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Internal note about this coupon…" rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <Select label="Discount Type" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
              <option value="percent">Percentage Discount</option>
              <option value="fixed_cart">Fixed Cart Discount</option>
              <option value="free_shipping">Free Shipping</option>
            </Select>
            {form.discountType !== 'free_shipping' && (
              <Input
                label={form.discountType === 'percent' ? 'Coupon Amount (%)' : 'Coupon Amount (₹)'}
                type="number"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder={form.discountType === 'percent' ? '10' : '100'}
              />
            )}
            <Input label="Coupon Expiry Date" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
          </div>
        )}

        {/* Usage Restriction */}
        {modalTab === 'restrictions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Minimum Spend (₹)" type="number" value={form.minAmount} onChange={e => set('minAmount', e.target.value)} placeholder="No minimum" />
              <Input label="Maximum Spend (₹)" type="number" value={form.maxAmount} onChange={e => set('maxAmount', e.target.value)} placeholder="No maximum" />
            </div>
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.individualUse} onChange={e => set('individualUse', e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Individual use only</p>
                  <p className="text-xs text-gray-500 mt-0.5">Check this box if the coupon cannot be used in conjunction with other coupons.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.excludeSaleItems} onChange={e => set('excludeSaleItems', e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Exclude sale items</p>
                  <p className="text-xs text-gray-500 mt-0.5">Check this box if the coupon should not apply to items on sale.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Usage Limits */}
        {modalTab === 'limits' && (
          <div className="space-y-4">
            <Input
              label="Usage limit per coupon"
              type="number"
              value={form.usageLimit}
              onChange={e => set('usageLimit', e.target.value)}
              placeholder="Unlimited"
              helper="How many times this coupon can be used before it's void."
            />
            <Input
              label="Usage limit per user"
              type="number"
              value={form.usageLimitPerUser}
              onChange={e => set('usageLimitPerUser', e.target.value)}
              placeholder="Unlimited"
              helper="How many times a single customer can use this coupon."
            />
            {editItem && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-600">Current Usage</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{editItem.usageCount || 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">times used out of {editItem.usageLimit ?? '∞'}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        danger
      />
    </div>
  )
}
