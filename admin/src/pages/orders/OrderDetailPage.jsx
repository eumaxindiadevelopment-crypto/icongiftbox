import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, MessageSquare, CheckCircle, Pencil } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Select, Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Loading'
import api from '../../lib/api'

const ADDRESS_FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'company', label: 'Company' },
  { key: 'address1', label: 'Address Line 1' },
  { key: 'address2', label: 'Address Line 2' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State / Region' },
  { key: 'postcode', label: 'Postal Code' },
  { key: 'country', label: 'Country' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
]

function AddressCard({ title, address, onEdit }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title={`Edit ${title.toLowerCase()}`}>
          <Pencil size={14} />
        </button>
      </CardHeader>
      <CardBody>
        {address ? (
          <address className="text-sm text-gray-600 not-italic space-y-0.5">
            <p className="font-medium text-gray-800">{address.firstName} {address.lastName}</p>
            {address.company && <p>{address.company}</p>}
            <p>{address.address1}</p>
            {address.address2 && <p>{address.address2}</p>}
            <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.postcode}</p>
            <p>{address.country || 'India'}</p>
            {address.email && <p className="text-gray-500 mt-1">{address.email}</p>}
            {address.phone && <p className="text-gray-500">{address.phone}</p>}
          </address>
        ) : (
          <p className="text-sm text-gray-400">No {title.toLowerCase()}</p>
        )}
      </CardBody>
    </Card>
  )
}

export function OrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [customerNote, setCustomerNote] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingAddress, setEditingAddress] = useState(null) // 'billing' | 'shipping' | null
  const [addressForm, setAddressForm] = useState({})
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => {
        setOrder(data)
        setStatus(data.status || 'pending')
      })
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdateStatus = async () => {
    setSaving(true)
    try {
      const { data } = await api.post(`/orders/${id}/status`, { status })
      setOrder(data)
    } catch {}
    setSaving(false)
  }

  const openAddressEdit = (type) => {
    setAddressForm(order?.[type === 'billing' ? 'billingAddress' : 'shippingAddress'] || {})
    setEditingAddress(type)
  }

  const handleSaveAddress = async () => {
    setSavingAddress(true)
    try {
      const field = editingAddress === 'billing' ? 'billingAddress' : 'shippingAddress'
      const { data } = await api.put(`/orders/${id}`, { [field]: addressForm })
      setOrder(data)
      setEditingAddress(null)
    } catch {}
    setSavingAddress(false)
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    setAddingNote(true)
    try {
      const { data } = await api.post(`/orders/${id}/notes`, { note, customerNote })
      setOrder(data)
      setNote('')
      setCustomerNote(false)
      setNoteOpen(false)
    } catch {}
    setAddingNote(false)
  }

  const customerName = order?.customer
    ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.email
    : order?.billingAddress
    ? `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}`.trim()
    : '—'

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-600">#{order?.orderNumber || order?._id?.slice(-8)}</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-gray-500">{formatDate(order?.createdAt)}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm"><Printer size={14} /> Print</Button>
          <Button size="sm" onClick={() => setNoteOpen(true)}><MessageSquare size={14} /> Add Note</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Line Items */}
          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(order?.lineItems || []).map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/30">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(item.total || item.price * item.quantity)}</td>
                    </tr>
                  ))}
                  {!order?.lineItems?.length && (
                    <tr><td colSpan={4} className="px-4 py-6 text-sm text-center text-gray-400">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order?.subtotal || 0)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span>{formatCurrency(order?.shippingTotal || 0)}</span></div>
              {order?.tax > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Tax (GST)</span><span>{formatCurrency(order.tax)}</span></div>}
              {order?.discountTotal > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-emerald-600">-{formatCurrency(order.discountTotal)}</span></div>}
              <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatCurrency(order?.total || 0)}</span>
              </div>
            </div>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader><CardTitle>Order Notes</CardTitle></CardHeader>
            {(order?.orderNotes || []).length === 0 ? (
              <div className="px-5 py-6 text-sm text-gray-400 text-center">No notes yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {order.orderNotes.map((n, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">{n.author || 'Admin'}</span>
                      <div className="flex items-center gap-2">
                        {n.customerNote && <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Customer note</span>}
                        <span className="text-xs text-gray-400">{formatDate(n.dateCreated)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
            <CardBody>
              <Select label="Update Status" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </Select>
              <Button className="w-full mt-3" size="sm" onClick={handleUpdateStatus} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Saving…' : 'Update Status'}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardBody className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-800">{customerName}</p>
              <p className="text-sm text-gray-500">{order?.customer?.email || order?.billingAddress?.email || '—'}</p>
              {order?.customer?.totalOrders && (
                <p className="text-xs text-gray-400 mt-1">{order.customer.totalOrders} orders · {formatCurrency(order.customer.totalSpent || 0)} spent</p>
              )}
            </CardBody>
          </Card>

          <AddressCard title="Billing Address" address={order?.billingAddress} onEdit={() => openAddressEdit('billing')} />
          <AddressCard title="Shipping Address" address={order?.shippingAddress} onEdit={() => openAddressEdit('shipping')} />

          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardBody className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-800">{order?.paymentMethodTitle || order?.paymentMethod || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${order?.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order?.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              {order?.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction</span>
                  <span className="font-mono text-xs text-gray-600">{order.transactionId}</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add Order Note"
        footer={
          <>
            <button onClick={() => setNoteOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleAddNote} disabled={addingNote || !note.trim()} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {addingNote ? 'Adding…' : 'Add Note'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <textarea
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Enter order note..."
            className="w-full rounded-lg border border-gray-300 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={customerNote} onChange={e => setCustomerNote(e.target.checked)} className="rounded border-gray-300" />
            Notify customer via email
          </label>
        </div>
      </Modal>

      <Modal
        open={!!editingAddress}
        onClose={() => setEditingAddress(null)}
        title={`Edit ${editingAddress === 'billing' ? 'Billing' : 'Shipping'} Address`}
        size="lg"
        footer={
          <>
            <button onClick={() => setEditingAddress(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSaveAddress} disabled={savingAddress} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {savingAddress ? 'Saving…' : 'Save Address'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ADDRESS_FIELDS.map(f => (
            <div key={f.key} className={f.key === 'address1' || f.key === 'address2' ? 'sm:col-span-2' : ''}>
              <Input
                label={f.label}
                value={addressForm[f.key] || ''}
                onChange={e => setAddressForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
