import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Upload, X, Image, FolderOpen, Save } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

// Fixed, non-reorderable slots — each "design" class is a specific absolutely
// positioned spot around the heading (see _collection-bx.scss), not a
// scrollable list, so the admin UI mirrors that fixed layout instead of a
// free add/remove list.
const SLOTS = [
  { design: 'collection1', label: 'Top Left' },
  { design: 'collection5', label: 'Top Center' },
  { design: 'collection3', label: 'Top Right' },
  { design: 'collection2', label: 'Bottom Left' },
  { design: 'collection4', label: 'Bottom Right' },
]

const DEFAULT = {
  sectionTitle: 'Upgrade your style with our top-notch collection.',
  btnText:      'All Collections',
  btnLink:      '/shop-list',
  images:       [],
}

function ImagePicker({ label, value, onChange, fileRef, onUpload, uploading, onOpenMedia }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => onChange('')} className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"><X size={10} /></button>
          </div>
        ) : (
          <div className="w-20 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-300 shrink-0"><Image size={18} /></div>
        )}
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50">
              <Upload size={10} />{uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button onClick={onOpenMedia} className="flex items-center gap-1 border border-blue-300 text-blue-600 rounded px-2 py-1 text-xs hover:bg-blue-50">
              <FolderOpen size={10} />Media
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Or paste URL..." value={value} onChange={e => onChange(e.target.value)} />
        </div>
      </div>
    </div>
  )
}

export function CollectionPage() {
  const [form, setForm]           = useState(DEFAULT)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState({})
  const [mediaTarget, setMediaTarget] = useState(null)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const fileRefs = useRef({})

  useEffect(() => {
    api.get('/collection')
      .then(({ data }) => {
        // Reconcile whatever's saved onto the fixed 5 slots, so a slot with
        // no saved image yet still renders as an empty picker instead of
        // disappearing.
        const byDesign = new Map((data.images || []).map(img => [img.design, img.image]))
        const images = SLOTS.map(s => ({ design: s.design, image: byDesign.get(s.design) || '' }))
        setForm({ ...DEFAULT, ...data, images })
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setSlotImage = (design, url) => setForm(f => ({
    ...f, images: f.images.map(img => img.design === design ? { ...img, image: url } : img),
  }))

  const handleUpload = (design) => async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(u => ({ ...u, [design]: true }))
    try {
      const fd = new FormData(); fd.append('image', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSlotImage(design, data.url)
    } catch { setError('Upload failed') }
    finally { setUploading(u => ({ ...u, [design]: false })) }
  }

  const handleMediaSelect = (file) => {
    setSlotImage(mediaTarget, file.url)
    setMediaTarget(null)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      // Only persist slots that actually have an image.
      await api.put('/collection', { ...form, images: form.images.filter(img => img.image) })
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch { setError('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8 text-center">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Collection Section</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the "Upgrade your style" collection banner on the home page</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between">{error}<button onClick={() => setError('')}><X size={14} /></button></div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>}

      {/* Heading */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Heading</h2>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.sectionTitle} onChange={e => set('sectionTitle', e.target.value)} placeholder="Upgrade your style with our top-notch collection." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.btnText} onChange={e => set('btnText', e.target.value)} placeholder="All Collections" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.btnLink} onChange={e => set('btnLink', e.target.value)} placeholder="/shop-list" />
          </div>
        </div>
      </div>

      {/* Floating images */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Floating Images</h2>
        <p className="text-xs text-gray-400">These 5 photos float around the heading in fixed positions — each slot below corresponds to a specific spot on the page.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SLOTS.map(slot => {
            if (!fileRefs.current[slot.design]) fileRefs.current[slot.design] = { current: null }
            const img = form.images.find(i => i.design === slot.design)
            return (
              <div key={slot.design} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <ImagePicker
                  label={slot.label}
                  value={img?.image || ''}
                  onChange={v => setSlotImage(slot.design, v)}
                  fileRef={fileRefs.current[slot.design]}
                  onUpload={handleUpload(slot.design)}
                  uploading={uploading[slot.design]}
                  onOpenMedia={() => setMediaTarget(slot.design)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {mediaTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click an image to select it</p>
              </div>
              <button onClick={() => setMediaTarget(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <MediaPage selectionMode={true} onSelect={handleMediaSelect} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
