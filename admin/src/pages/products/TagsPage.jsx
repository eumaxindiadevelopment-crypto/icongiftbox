import { useState, useEffect, useCallback, useRef } from 'react'
import { Hash, RefreshCw, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner, NoData } from '../../components/ui/Loading'
import api from '../../lib/api'

const generateSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const empty = { name: '', slug: '', description: '' }

export function TagsPage() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(empty)
  const [editItem, setEditItem] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const slugEdited = useRef(false)
  const formTopRef = useRef()

  const fetchTags = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/tags')
      setTags(Array.isArray(data) ? data : [])
    } catch { setTags([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTags() }, [fetchTags])

  useEffect(() => {
    if (!form.name || slugEdited.current) return
    setForm(f => ({ ...f, slug: generateSlug(f.name) }))
  }, [form.name])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const resetForm = () => {
    setEditItem(null)
    setForm(empty)
    setError('')
    slugEdited.current = false
  }

  const loadForEdit = (tag) => {
    setEditItem(tag)
    slugEdited.current = true
    setForm({ name: tag.name || '', slug: tag.slug || '', description: tag.description || '' })
    setError('')
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const payload = { name: form.name.trim(), slug: form.slug || generateSlug(form.name), description: form.description }
      if (editItem) await api.put(`/tags/${editItem._id}`, payload)
      else await api.post('/tags', payload)
      resetForm()
      fetchTags()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag? It will be removed from every product that has it.')) return
    try {
      await api.delete(`/tags/${id}`)
      if (editItem?._id === id) resetForm()
      fetchTags()
    } catch {}
  }

  const filtered = tags.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Tags</h1>
        <p className="text-xs text-gray-500 mt-0.5">{tags.length} total</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div ref={formTopRef}>
          <Card>
            <CardHeader>
              <CardTitle>{editItem ? 'Edit Tag' : 'Add New Tag'}</CardTitle>
              {editItem && (
                <button type="button" onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-700">Cancel editing</button>
              )}
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>}

                <Input label="Name *" value={form.name} onChange={e => { slugEdited.current = false; set('name', e.target.value) }} placeholder="e.g. eco-friendly" />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.slug} onChange={e => { slugEdited.current = true; set('slug', e.target.value) }}
                      className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    <button type="button" onClick={() => { slugEdited.current = false; set('slug', generateSlug(form.name)) }}
                      title="Regenerate" className="px-2.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                </div>

                <button type="submit" disabled={saving} className="w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors">
                  {saving ? 'Saving…' : editItem ? 'Update Tag' : 'Add New Tag'}
                </button>
                {editItem && (
                  <button type="button" onClick={resetForm} className="w-full py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                )}
              </form>
            </CardBody>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card>
            {loading ? (
              <div className="flex items-center justify-center h-40"><Spinner /></div>
            ) : tags.length === 0 ? (
              <NoData title="No tags yet" message="Tags are also created automatically when you type a new one on a product" icon={<Hash size={40} />} />
            ) : (
              <>
                <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                  <div className="relative ml-auto min-w-[220px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search tags…" value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{filtered.length} item{filtered.length === 1 ? '' : 's'}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Products</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(tag => (
                        <tr key={tag._id} className={`group hover:bg-gray-50/60 transition-colors ${editItem?._id === tag._id ? 'bg-blue-50/40' : ''}`}>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => loadForEdit(tag)} className="text-left">
                              <p className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors">{tag.name}</p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{tag.slug}</p>
                            </button>
                            <div className="flex items-center gap-1 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => loadForEdit(tag)} className="text-blue-600 hover:text-blue-700 hover:underline">Edit</button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => handleDelete(tag._id)} className="text-red-600 hover:text-red-700 hover:underline">Delete</button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate hidden md:table-cell">
                            {tag.description || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">{tag.count ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
