import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Building2, ShoppingBag, IndianRupee } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/Badge'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Spinner } from '../../components/ui/Loading'
import api from '../../lib/api'

export function CustomerDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id || id === 'new') { setLoading(false); return }
    Promise.all([
      api.get(`/customers/${id}`),
      api.get(`/customers/${id}/orders`),
    ])
      .then(([cRes, oRes]) => {
        setCustomer(cRes.data)
        setOrders(Array.isArray(oRes.data) ? oRes.data : oRes.data.orders || [])
      })
      .catch(() => setError('Customer not found'))
      .finally(() => setLoading(false))
  }, [id])

  const name = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email : '—'
  const totalSpent = customer?.totalSpent || orders.reduce((s, o) => s + (o.total || 0), 0)
  const avgOrder = orders.length ? totalSpent / orders.length : 0
  const lastOrder = orders[0]?.createdAt

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>
  if (!customer) return null

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500">{customer.company || customer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={orders.length || customer.totalOrders || 0} icon={ShoppingBag} iconBg="bg-orange-50" iconColor="text-orange-600" />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={IndianRupee} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Avg Order Value" value={formatCurrency(avgOrder)} icon={IndianRupee} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="Last Order" value={lastOrder ? formatDate(lastOrder) : '—'} icon={ShoppingBag} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
            {orders.length === 0 ? (
              <div className="px-5 py-10 text-sm text-gray-400 text-center">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      <th className="px-4 py-3 text-left">Order</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => navigate(`/orders/${order._id}`)}>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-600">#{order.orderNumber || order._id?.slice(-8)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={15} className="text-gray-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 size={15} className="text-gray-400 shrink-0" />
                  <span>{customer.company}</span>
                </div>
              )}
            </CardBody>
          </Card>

          {customer.billingAddress && (
            <Card>
              <CardHeader><CardTitle>Billing Address</CardTitle></CardHeader>
              <CardBody>
                <address className="text-sm text-gray-600 not-italic space-y-0.5">
                  <p className="font-medium text-gray-800">{customer.billingAddress.firstName} {customer.billingAddress.lastName}</p>
                  {customer.billingAddress.address1 && <p>{customer.billingAddress.address1}</p>}
                  {customer.billingAddress.address2 && <p>{customer.billingAddress.address2}</p>}
                  {customer.billingAddress.city && (
                    <p>{customer.billingAddress.city}{customer.billingAddress.state ? `, ${customer.billingAddress.state}` : ''} {customer.billingAddress.postcode}</p>
                  )}
                  <p>{customer.billingAddress.country || 'India'}</p>
                </address>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <CardBody className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span>{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="capitalize">{customer.role || 'customer'}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
