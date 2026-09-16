import { useState, useEffect, useCallback } from 'react'
import { SlidersHorizontal, Plus, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner, NoData } from '../../components/ui/Loading'
import api from '../../lib/api'

export function AttributesPage() {
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [newTerm, setNewTerm] = useState('')
  const [termSaving, setTermSaving] = useState(false)

  const fetchAttributes = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/attributes')
      setAttributes(Array.isArray(data) ? data : [])
    } catch { setAttributes([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAttributes() }, [fetchAttributes])

  const selected = attributes.find(a => a._id === selectedId) || null

  const handleAddAttribute = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true); setError('')
    try {
      const { data } = await api.post('/attributes', { name: newName.trim() })
      setNewName('')
      await fetchAttributes()
      setSelectedId(data._id)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add attribute')
    }
    setSaving(false)
  }

  const handleDeleteAttribute = async (id) => {
    if (!window.confirm('Delete this attribute and all its terms?')) return
    try {
      await api.delete(`/attributes/${id}`)
      if (selectedId === id) setSelectedId(null)
      fetchAttributes()
    } catch {}
  }

  const handleAddTerm = async (e) => {
    e.preventDefault()
    if (!newTerm.trim() || !selected) return
    setTermSaving(true)
    try {
      await api.post(`/attributes/${selected._id}/terms`, { name: newTerm.trim() })
      setNewTerm('')
      fetchAttributes()
    } catch {}
    setTermSaving(false)
  }

  const handleDeleteTerm = async (termId) => {
    if (!selected) return
    try {
      await api.delete(`/attributes/${selected._id}/terms/${termId}`)
      fetchAttributes()
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Attributes</h1>
        <p className="text-xs text-gray-500 mt-0.5">{attributes.length} total — reusable option sets like Size or Color for product variations</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Left: Attributes list */}
        <div>
          <Card>
            <CardHeader><CardTitle>Add New Attribute</CardTitle></CardHeader>
            <CardBody>
              <form onSubmit={handleAddAttribute} className="space-y-3">
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>}
                <Input label="Name *" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Size" />
                <button type="submit" disabled={saving} className="w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors">
                  {saving ? 'Adding…' : 'Add Attribute'}
                </button>
              </form>
            </CardBody>
          </Card>

          <Card className="mt-5">
            {loading ? (
              <div className="flex items-center justify-center h-40"><Spinner /></div>
            ) : attributes.length === 0 ? (
              <NoData title="No attributes yet" icon={<SlidersHorizontal size={40} />} />
            ) : (
              <div className="divide-y divide-gray-50">
                {attributes.map(attr => (
                  <button
                    key={attr._id}
                    type="button"
                    onClick={() => setSelectedId(attr._id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedId === attr._id ? 'bg-blue-50/60' : ''}`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${selectedId === attr._id ? 'text-blue-700' : 'text-gray-800'}`}>{attr.name}</p>
                      <p className="text-xs text-gray-400">{attr.terms?.length || 0} term{attr.terms?.length === 1 ? '' : 's'}</p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr._id) }}
                      className="text-xs text-red-500 hover:text-red-600 hover:underline"
                    >
                      Delete
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Terms for selected attribute */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{selected ? `"${selected.name}" Terms` : 'Terms'}</CardTitle>
            </CardHeader>
            {!selected ? (
              <NoData title="Select an attribute" message="Choose an attribute on the left to manage its terms (e.g. S, M, L, XL for Size)" icon={<SlidersHorizontal size={40} />} />
            ) : (
              <CardBody>
                <form onSubmit={handleAddTerm} className="flex gap-2 mb-4">
                  <input
                    value={newTerm}
                    onChange={e => setNewTerm(e.target.value)}
                    placeholder="e.g. XL"
                    className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button type="submit" disabled={termSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors flex items-center gap-1.5">
                    <Plus size={14} /> Add
                  </button>
                </form>

                {(!selected.terms || selected.terms.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-6">No terms yet — add one above.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selected.terms.map(term => (
                      <span key={term._id} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full">
                        {term.name}
                        <button type="button" onClick={() => handleDeleteTerm(term._id)} className="text-gray-400 hover:text-red-500">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
