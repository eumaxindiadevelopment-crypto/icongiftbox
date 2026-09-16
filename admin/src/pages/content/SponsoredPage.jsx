import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Upload, X, Image, FolderOpen, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

const DEFAULT_SLIDE = { logoImage: '', showStoreBadge: false, animDuration: 0.6 }

const DEFAULT = {
  sectionTitle: 'Brand',
  seeAllLink:   '/shop-list',
  slides:       [],
  autoplay:      true,
  autoplayDelay: 3000,
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

export function SponsoredPage() {
  const [form, setForm]           = useState(DEFAULT)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState({})
  const [mediaTarget, setMediaTarget] = useState(null)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const logoFileRefs = useRef([])

  useEffect(() => {
    api.get('/sponsored')
      .then(({ data }) => setForm({ ...DEFAULT, ...data, slides: data.slides?.length ? data.slides : [] }))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setSlide = (i, k, v) => setForm(f => ({
    ...f, slides: f.slides.map((s, idx) => idx === i ? { ...s, [k]: v } : s),
  }))

  const addSlide = () => setForm(f => ({ ...f, slides: [...f.slides, { ...DEFAULT_SLIDE }] }))

  const removeSlide = (i) => setForm(f => ({ ...f, slides: f.slides.filter((_, idx) => idx !== i) }))

  const moveSlide = (i, dir) => setForm(f => {
    const slides = [...f.slides]
    const j = i + dir
    if (j < 0 || j >= slides.length) return f
    ;[slides[i], slides[j]] = [slides[j], slides[i]]
    return { ...f, slides }
  })

  const handleUpload = (key, field) => async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(u => ({ ...u, [key]: true }))
    try {
      const fd = new FormData(); fd.append('image', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const idx = parseInt(key.split('-')[1])
      setSlide(idx, field, data.url)
    } catch { setError('Upload failed') }
    finally { setUploading(u => ({ ...u, [key]: false })) }
  }

  const handleMediaSelect = (file) => {
    const [field, idxStr] = mediaTarget.split(':')
    const idx = parseInt(idxStr)
    setSlide(idx, field, file.url)
    setMediaTarget(null)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await api.put('/sponsored', form)
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch { setError('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8 text-center">Loading...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Brand Carousel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the brand logo carousel on the home page</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between">{error}<button onClick={() => setError('')}><X size={14} /></button></div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>}

      {/* Section Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Section Header</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.sectionTitle} onChange={e => set('sectionTitle', e.target.value)} placeholder="Brand" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">See All Link</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.seeAllLink} onChange={e => set('seeAllLink', e.target.value)} placeholder="/shop-list" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Autoplay Delay (ms)</label>
            <input type="number" step="100" min="500" disabled={!form.autoplay}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              value={form.autoplayDelay} onChange={e => set('autoplayDelay', +e.target.value)} placeholder="3000" />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={!!form.autoplay} onChange={e => set('autoplay', e.target.checked)}
              className="rounded border-gray-300 text-blue-600" />
            Enable autoplay (auto-advances the carousel on its own)
          </label>
        </div>
      </div>

      {/* Slides */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h2 className="text-sm font-semibold text-gray-800">Slides</h2>
          <button onClick={addSlide} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700">
            <Plus size={13} />Add Slide
          </button>
        </div>

        {form.slides.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No slides yet. Click "Add Slide" to get started.</p>
        )}

        <div className="space-y-4">
          {form.slides.map((slide, i) => {
            if (!logoFileRefs.current[i]) logoFileRefs.current[i] = { current: null }
            return (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Slide {i + 1}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500"><ChevronUp size={14} /></button>
                    <button onClick={() => moveSlide(i, 1)} disabled={i === form.slides.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500"><ChevronDown size={14} /></button>
                    <button onClick={() => removeSlide(i)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>

                <ImagePicker
                  label="Brand Logo"
                  value={slide.logoImage}
                  onChange={v => setSlide(i, 'logoImage', v)}
                  fileRef={logoFileRefs.current[i]}
                  onUpload={handleUpload(`logo-${i}`, 'logoImage')}
                  uploading={uploading[`logo-${i}`]}
                  onOpenMedia={() => setMediaTarget(`logoImage:${i}`)}
                />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Animation Duration (s)</label>
                  <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={slide.animDuration} onChange={e => setSlide(i, 'animDuration', e.target.value)} placeholder="0.6" />
                </div>

                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={!!slide.showStoreBadge} onChange={e => setSlide(i, 'showStoreBadge', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600" />
                  Show "in Store" badge
                </label>
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
