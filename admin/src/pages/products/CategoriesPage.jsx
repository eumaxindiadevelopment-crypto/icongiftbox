import { useState, useEffect, useCallback, useRef } from 'react'
import { FolderTree, Upload, ImageIcon, X, RefreshCw, Search, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner, NoData } from '../../components/ui/Loading'
import { MediaPicker } from '../../components/ui/MediaPicker'
import api, { SERVER_URL, FRONTEND_URL } from '../../lib/api'
import { buildCategoryUrl } from '../../lib/seoUrl'

const generateSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const toAbsUrl = (src) =>
  !src ? '' : src.startsWith('http') ? src : `${SERVER_URL}${src}`

const empty = { name: '', slug: '', description: '', parent: '' }
const PER_PAGE = 20

export function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(empty)
  const [editItem, setEditItem] = useState(null)
  const [image, setImage] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [quickEditId, setQuickEditId] = useState(null)
  const [qeForm, setQeForm] = useState({ name: '', slug: '', parentId: '' })
  const [qeSaving, setQeSaving] = useState(false)
  const [page, setPage] = useState(1)

  const slugEdited = useRef(false)
  const fileInputRef = useRef()
  const formTopRef = useRef()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/categories')
      setCategories(Array.isArray(data) ? data : data.categories || [])
    } catch { setCategories([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => { setPage(1) }, [search])

  // Auto-slug from name
  useEffect(() => {
    if (!form.name || slugEdited.current) return
    setForm(f => ({ ...f, slug: generateSlug(f.name) }))
  }, [form.name])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const resetForm = () => {
    setEditItem(null)
    setForm(empty)
    setImage(null)
    setError('')
    slugEdited.current = false
  }

  const loadForEdit = (cat) => {
    setEditItem(cat)
    slugEdited.current = true
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      parent: cat.parent?._id || cat.parent || '',
    })
    setImage(cat.image?.src ? { url: toAbsUrl(cat.image.src) } : null)
    setError('')
    // Scroll to form on mobile
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('image', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImage(data)
    } catch { setError('Image upload failed') }
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        parentId: form.parent || null,
        image: image ? { src: image.url, alt: form.name } : undefined,
      }
      if (editItem) await api.put(`/categories/${editItem._id}`, payload)
      else await api.post('/categories', payload)
      resetForm()
      fetch()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      if (editItem?._id === id) resetForm()
      setSelected(s => s.filter(x => x !== id))
      fetch()
    } catch {}
    setDeleteId(null)
  }

  const openQuickEdit = (cat) => {
    setQuickEditId(cat._id)
    setQeForm({ name: cat.name || '', slug: cat.slug || '', parentId: cat.parentId || '' })
  }

  const saveQuickEdit = async (id) => {
    setQeSaving(true)
    try {
      await api.put(`/categories/${id}`, { name: qeForm.name, slug: qeForm.slug, parentId: qeForm.parentId || null })
      setQuickEditId(null)
      fetch()
    } catch {}
    setQeSaving(false)
  }

  // Only top-level categories can be picked as a parent — the URL/breadcrumb
  // scheme supports exactly 2 levels (top + child), so a category that
  // already has its own parent can't be chosen as one, preventing a 3rd
  // level from ever being created via this UI.
  const parentOptions = categories.filter(c => !c.parentId && (!editItem || c._id !== editItem._id))
  const parentPreview = parentOptions.find(c => c._id === form.parent)
  const filteredCategories = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug?.toLowerCase().includes(search.toLowerCase())
  )

  // Group each child directly under its parent (WordPress-style listing) instead
  // of the flat alphabetical order the API returns, so the "— " indent prefix
  // below reads as a hierarchy rather than a random dash.
  const sortedCategories = (() => {
    const included = new Set(filteredCategories.map(c => c._id))
    const childrenByParent = {}
    filteredCategories.forEach(c => {
      const pid = c.parent?._id
      if (pid) (childrenByParent[pid] ??= []).push(c)
    })
    const result = []
    filteredCategories.forEach(c => {
      if (c.parent?._id) return
      result.push(c)
      ;(childrenByParent[c._id] || []).forEach(child => result.push(child))
    })
    // A child whose parent got filtered out by the search box still needs to show up.
    filteredCategories.forEach(c => {
      if (c.parent?._id && !included.has(c.parent._id)) result.push(c)
    })
    return result
  })()

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pagedCategories = sortedCategories.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSelected(selected.length === pagedCategories.length ? [] : pagedCategories.map(c => c._id))

  const handleBulkApply = async () => {
    if (bulkAction !== 'delete' || !selected.length) return
    if (!window.confirm(`Delete ${selected.length} categor${selected.length === 1 ? 'y' : 'ies'}?`)) return
    try {
      await Promise.all(selected.map(id => api.delete(`/categories/${id}`)))
      if (editItem && selected.includes(editItem._id)) resetForm()
      setSelected([]); setBulkAction('')
      fetch()
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Categories</h1>
          <p className="text-xs text-gray-500 mt-0.5">{categories.length} total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">

        {/* ─── LEFT: Add / Edit Form ─── */}
        <div ref={formTopRef}>
          <Card>
            <CardHeader>
              <CardTitle>{editItem ? 'Edit Category' : 'Add New Category'}</CardTitle>
              {editItem && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X size={11} /> Cancel editing
                </button>
              )}
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
                )}

                {/* Name */}
                <Input
                  label="Name *"
                  value={form.name}
                  onChange={e => { slugEdited.current = false; set('name', e.target.value) }}
                  placeholder="e.g. Gift Sets"
                />

                {/* Slug */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => { slugEdited.current = true; set('slug', e.target.value) }}
                      placeholder="gift-sets"
                      className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => { slugEdited.current = false; set('slug', generateSlug(form.name)) }}
                      title="Regenerate"
                      className="px-2.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                    {FRONTEND_URL.replace(/^https?:\/\//, '')}{buildCategoryUrl({ slug: form.slug || '…', parent: parentPreview })}
                  </p>
                </div>

                {/* Parent */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    value={form.parent}
                    onChange={e => set('parent', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">— None (top level) —</option>
                    {parentOptions.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Optional. Describe this category…"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Thumbnail</label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  {image ? (
                    <div className="relative group w-24 h-24">
                      <img
                        src={image.url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-white border border-gray-200 rounded-full shadow text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {uploading ? <Spinner size="sm" /> : <Upload size={12} />}
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <ImageIcon size={12} /> Library
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : editItem ? 'Update Category' : 'Add New Category'}
                </button>

                {editItem && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </CardBody>
          </Card>
        </div>

        {/* ─── RIGHT: Category Table ─── */}
        <div className="xl:col-span-2">
          <Card>
            {loading ? (
              <div className="flex items-center justify-center h-40"><Spinner /></div>
            ) : categories.length === 0 ? (
              <NoData
                title="No categories yet"
                message="Add your first category using the form on the left"
                icon={<FolderTree size={40} />}
              />
            ) : (
              <>
                {/* Bulk actions + search row */}
                <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100">
                  <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Bulk actions</option>
                    <option value="delete">Delete</option>
                  </select>
                  <Button variant="secondary" size="sm" onClick={handleBulkApply} disabled={!bulkAction || !selected.length}>
                    <Check size={13} /> Apply
                  </Button>
                  {selected.length > 0 && (
                    <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                      {selected.length} selected
                      <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                    </span>
                  )}
                  <div className="relative ml-auto min-w-[220px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search categories…" value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{filteredCategories.length} item{filteredCategories.length === 1 ? '' : 's'}</span>
                </div>

                {filteredCategories.length === 0 ? (
                  <NoData title="No categories match your search" icon={<Search size={40} />} />
                ) : (
                <>
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="pl-4 pr-2 py-3 w-10">
                        <input type="checkbox" checked={selected.length === pagedCategories.length && pagedCategories.length > 0}
                          onChange={toggleAll} className="rounded border-gray-300 text-blue-600" />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12" />
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Parent</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pagedCategories.map(cat => (
                      <>
                      <tr
                        key={cat._id}
                        className={`group hover:bg-gray-50/60 transition-colors ${editItem?._id === cat._id || quickEditId === cat._id ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-100' : ''}`}
                      >
                        {/* Select */}
                        <td className="pl-4 pr-2 py-3">
                          <input type="checkbox" checked={selected.includes(cat._id)}
                            onChange={() => toggleSelect(cat._id)} className="rounded border-gray-300 text-blue-600" />
                        </td>

                        {/* Thumbnail */}
                        <td className="px-3 py-3">
                          {cat.image?.src ? (
                            <img
                              src={toAbsUrl(cat.image.src)}
                              alt={cat.name}
                              className="w-9 h-9 object-cover rounded-lg border border-gray-100"
                              onError={e => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <FolderTree size={14} className="text-gray-300" />
                            </div>
                          )}
                        </td>

                        {/* Name + slug + WordPress-style hover row actions */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => loadForEdit(cat)}
                            className="text-left group/name"
                          >
                            <p className="text-sm font-medium text-gray-800 group-hover/name:text-blue-600 transition-colors">
                              {cat.parent?.name && <span className="text-gray-400">— </span>}
                              {cat.name}
                            </p>
                          </button>
                          <div className="flex flex-wrap items-center gap-1 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={`${FRONTEND_URL}${buildCategoryUrl(cat)}`} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline">View</a>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => loadForEdit(cat)} className="text-blue-600 hover:text-blue-700 hover:underline">Edit</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => openQuickEdit(cat)} className="text-blue-600 hover:text-blue-700 hover:underline">Quick Edit</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-700 hover:underline">Delete</button>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate hidden md:table-cell">
                          {cat.description || <span className="text-gray-300">—</span>}
                        </td>

                        {/* Parent */}
                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                          {cat.parent?.name
                            ? <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{cat.parent.name}</span>
                            : <span className="text-gray-300">—</span>
                          }
                        </td>

                        {/* Count */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-gray-600">{cat.count ?? 0}</span>
                        </td>
                      </tr>

                      {/* Quick Edit row */}
                      {quickEditId === cat._id && (
                        <tr key={`qe-${cat._id}`} className="bg-blue-50/30">
                          <td colSpan={6} className="px-6 py-4 border-b border-blue-100">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Quick Edit</span>
                              <span className="text-xs text-gray-400">— {cat.name}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                <input value={qeForm.name} onChange={e => setQeForm(f => ({ ...f, name: e.target.value }))}
                                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                                <input value={qeForm.slug} onChange={e => setQeForm(f => ({ ...f, slug: e.target.value }))}
                                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Parent Category</label>
                                <select value={qeForm.parentId} onChange={e => setQeForm(f => ({ ...f, parentId: e.target.value }))}
                                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                  <option value="">— None (top level) —</option>
                                  {categories.filter(c => !c.parentId && c._id !== cat._id).map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => saveQuickEdit(cat._id)} disabled={qeSaving}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors">
                                {qeSaving ? 'Saving…' : 'Update'}
                              </button>
                              <button onClick={() => setQuickEditId(null)}
                                className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      </>
                    ))}
                  </tbody>
                </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Page {currentPage} of {totalPages} · {sortedCategories.length} item{sortedCategories.length === 1 ? '' : 's'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronsLeft size={14} />
                      </button>
                      <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft size={14} />
                      </button>
                      <span className="px-2 text-sm text-gray-700 font-medium tabular-nums">{currentPage}</span>
                      <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight size={14} />
                      </button>
                      <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronsRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
                </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={file => setImage({ url: file.url, filename: file.filename })}
      />
    </div>
  )
}
