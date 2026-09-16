import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, RefreshCw, Trash2, Users } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { NoData, Spinner } from '../../components/ui/Loading'
import { ConfirmDialog } from '../../components/ui/Modal'
import api from '../../lib/api'

const SHOW_OPTIONS = [
  { value: '', label: 'All Customers' },
  { value: 'active', label: 'Active Customers' },
  { value: 'inactive', label: 'Inactive Customers' },
]

function usernameOf(email) {
  return email ? email.split('@')[0] : '—'
}

function addressField(customer, field) {
  return customer.billingAddress?.[field] || customer.shippingAddress?.[field] || ''
}

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState({ avgOrders: 0, avgLifetimeSpend: 0, avgOrderValue: 0 })
  const [search, setSearch] = useState('')
  const [show, setShow] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (show) params.set('status', show)
      const { data } = await api.get(`/customers?${params}`)
      setCustomers(data.customers || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setSummary(data.summary || { avgOrders: 0, avgLifetimeSpend: 0, avgOrderValue: 0 })
      setLastUpdated(new Date())
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [page, search, show])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleUpdateNow = async () => {
    setUpdating(true)
    try {
      await api.post('/customers/recompute-stats')
      await fetchCustomers()
    } catch {}
    setUpdating(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/customers/${id}`)
      fetchCustomers()
    } catch {}
    setDeleteId(null)
  }

  const exportCSV = () => {
    const headers = ['Name', 'Username', 'Last active', 'Date registered', 'Email', 'Orders', 'Total spend', 'AOV', 'Country', 'City', 'Region', 'Postal code']
    const rows = customers.map(c => [
      `"${c.firstName} ${c.lastName}"`, usernameOf(c.email), formatDate(c.lastOrderDate || c.updatedAt),
      formatDate(c.createdAt), c.email, c.totalOrders, Number(c.totalSpent).toFixed(2), Number(c.averageOrderValue).toFixed(2),
      addressField(c, 'country'), addressField(c, 'city'), addressField(c, 'state'), addressField(c, 'postcode'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-base font-semibold text-gray-900">Customers</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download size={14} /> Download</Button>
        </div>
      </div>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Show:</label>
          <select
            value={show}
            onChange={e => { setShow(e.target.value); setPage(1) }}
            className="min-w-[220px] text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SHOW_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 flex items-center gap-6">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Last updated</p>
            <p className="text-sm text-gray-700">{lastUpdated ? formatDate(lastUpdated) : '—'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleUpdateNow} disabled={updating}>
            <RefreshCw size={13} className={updating ? 'animate-spin' : ''} /> {updating ? 'Updating…' : 'Update now'}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : customers.length === 0 ? (
          <NoData title="No customers found" icon={<Users size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date registered</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total spend</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">AOV</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Postal code</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/customers/${c._id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{usernameOf(c.email)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(c.lastOrderDate || c.updatedAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(c.averageOrderValue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{addressField(c, 'country') || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{addressField(c, 'city') || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{addressField(c, 'state') || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{addressField(c, 'postcode') || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing {customers.length} of {total} customers</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Prev</button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">{page}</button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 px-4 py-3 border-t border-gray-100 text-sm text-gray-500 flex-wrap">
          <span>{total} customers</span>
          <span>{summary.avgOrders.toFixed(1)} average order</span>
          <span>{formatCurrency(summary.avgLifetimeSpend)} average lifetime spend</span>
          <span>{formatCurrency(summary.avgOrderValue)} average order value</span>
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Customer"
        message="Are you sure? All customer data will be permanently deleted."
        danger
      />
    </div>
  )
}
