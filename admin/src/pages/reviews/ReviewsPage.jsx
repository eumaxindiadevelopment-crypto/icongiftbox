import { useState, useEffect, useCallback } from 'react'
import { Star, Check, Ban, Trash2, MessageSquare } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Spinner, NoData } from '../../components/ui/Loading'
import api, { FRONTEND_URL } from '../../lib/api'
import { buildProductUrl } from '../../lib/seoUrl'

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'spam', label: 'Spam' },
]

const STATUS_VARIANT = { pending: 'warning', approved: 'success', spam: 'danger' }

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} fill={i <= rating ? 'currentColor' : 'none'} className={i <= rating ? '' : 'text-gray-300'} />
      ))}
    </div>
  )
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab) params.set('status', activeTab)
      const { data } = await api.get(`/reviews?${params}`)
      setReviews(Array.isArray(data) ? data : [])
    } catch { setReviews([]) }
    finally { setLoading(false) }
  }, [activeTab])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const setStatus = async (id, status) => {
    try {
      await api.post(`/reviews/${id}/status`, { status })
      fetchReviews()
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this review?')) return
    try {
      await api.delete(`/reviews/${id}`)
      fetchReviews()
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Reviews</h1>
        <p className="text-xs text-gray-500 mt-0.5">{reviews.length} shown</p>
      </div>

      <Card>
        <div className="flex gap-0 overflow-x-auto border-b border-gray-100">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : reviews.length === 0 ? (
          <NoData title="No reviews found" icon={<MessageSquare size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviews.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors align-top">
                    <td className="px-4 py-3 text-sm">
                      {r.product ? (
                        <a href={`${FRONTEND_URL}${buildProductUrl(r.product)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {r.product.name}
                        </a>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{r.authorName}</p>
                      <p className="text-xs text-gray-400">{r.authorEmail}</p>
                    </td>
                    <td className="px-4 py-3"><Stars rating={r.rating} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[280px]">
                      {r.title && <p className="font-medium text-gray-800">{r.title}</p>}
                      <p className="line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[r.status] || 'neutral'}>{r.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== 'approved' && (
                          <button onClick={() => setStatus(r._id, 'approved')} title="Approve" className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600">
                            <Check size={14} />
                          </button>
                        )}
                        {r.status !== 'spam' && (
                          <button onClick={() => setStatus(r._id, 'spam')} title="Mark as spam" className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600">
                            <Ban size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(r._id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
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
      </Card>
    </div>
  )
}
