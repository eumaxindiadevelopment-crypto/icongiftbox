import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Upload, X, Image, FolderOpen, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

const EMPTY_ITEM = { image: '', title: '', saleTitle: 'up to 79% off', link: '/shop' }

const DEFAULT = {
  title: 'Discovering the Hottest Nearby Destinations in Your Area',
  subtitle: 'Up to 60% off + up to ₹107 cashback',
  seeAllLink: '/shop',
  mapCards: [
    { ...EMPTY_ITEM, title: 'Cozy Knit Cardigan Sweater' },
    { ...EMPTY_ITEM, title: 'Sophisticated Swagger Suit' },
    { ...EMPTY_ITEM, title: 'Classic Denim Skinny Jeans' },
  ],
  sliderItems: [
    { ...EMPTY_ITEM, title: 'Cardigan Sweater' },
    { ...EMPTY_ITEM, title: 'Swagger Suit' },
    { ...EMPTY_ITEM, title: 'Skinny Jeans' },
    { ...EMPTY_ITEM, title: 'Sports Leggings' },
  ],
}

function ImagePicker({ value, onChange, fileRef, onUpload, uploading, onOpenMedia }) {
  return (
    <div className="flex items-start gap-3">
      {value ? (
        <div className="relative w-16 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange('')}
            className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500">
            <X size={9} />
          </button>
        </div>
      ) : (
        <div className="w-16 h-14 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
          <Image size={16} />
        </div>
      )}
      <div className="flex-1 space-y-1">
        <div className="flex gap-1.5">
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50">
            <Upload size={10} />{uploading ? '...' : 'Upload'}
          </button>
          <button onClick={onOpenMedia}
            className="flex items-center gap-1 border border-blue-300 text-blue-600 rounded px-2 py-1 text-xs hover:bg-blue-50">
            <FolderOpen size={10} />Media
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Or paste URL..." value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  )
}

export function HottestBlogPage() {
  const [form, setForm]           = useState(DEFAULT)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState({})
  const [mediaTarget, setMediaTarget] = useState(null)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // refs: map-0,map-1,map-2 + slider-0..N
  const allRefs = useRef({})
  const getRef = (key) => {
    if (!allRefs.current[key]) allRefs.current[key] = { current: null }
    return allRefs.current[key]
  }

  useEffect(() => {
    api.get('/hottest-blog')
      .then(({ data }) => setForm({
        ...DEFAULT, ...data,
        mapCards:    data.mapCards?.length    ? data.mapCards    : DEFAULT.mapCards,
        sliderItems: data.sliderItems?.length ? data.sliderItems : DEFAULT.sliderItems,
      }))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setMapCard    = (i, k, v) => setForm(f => ({ ...f, mapCards:    f.mapCards.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }))
  const setSliderItem = (i, k, v) => setForm(f => ({ ...f, sliderItems: f.sliderItems.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }))

  const addSliderItem = () => setForm(f => ({ ...f, sliderItems: [...f.sliderItems, { ...EMPTY_ITEM }] }))
  const removeSliderItem = (i) => setForm(f => ({ ...f, sliderItems: f.sliderItems.filter((_, idx) => idx !== i) }))
  const moveSliderItem = (i, dir) => {
    const items = [...form.sliderItems]
    const si = i + dir
    if (si < 0 || si >= items.length) return
    ;[items[i], items[si]] = [items[si], items[i]]
    set('sliderItems', items)
  }

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(u => ({ ...u, [field]: true }))
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      applyImage(field, data.url)
    } catch { setError('Upload failed') }
    finally { setUploading(u => ({ ...u, [field]: false })) }
  }

  const applyImage = (field, url) => {
    if (field.startsWith('map-')) setMapCard(parseInt(field.split('-')[1]), 'image', url)
    else if (field.startsWith('slider-')) setSliderItem(parseInt(field.split('-')[1]), 'image', url)
  }

  const handleMediaSelect = (file) => {
    applyImage(mediaTarget, file.url)
    setMediaTarget(null)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await api.put('/hottest-blog', form)
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch { setError('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8 text-center">Loading...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Hottest Blog Section</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the map area and slider on the home page</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between">
          {error}<button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>}

      {/* Section Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Section Settings</h2>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">See All Link</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.seeAllLink} onChange={e => set('seeAllLink', e.target.value)} placeholder="/shop" />
          </div>
        </div>
      </div>

      {/* Map Cards */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Map Cards
          <span className="ml-2 text-xs font-normal text-gray-400">(3 floating cards on the map — positions are fixed)</span>
        </h2>
        <div className="space-y-4">
          {form.mapCards.map((card, i) => {
            const key = `map-${i}`
            const ref = getRef(key)
            return (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-600">Card {i + 1}
                  <span className="ml-2 font-normal text-gray-400">(area-box{i + 1})</span>
                </p>
                <ImagePicker
                  value={card.image}
                  onChange={v => setMapCard(i, 'image', v)}
                  fileRef={ref}
                  onUpload={handleUpload(key)}
                  uploading={uploading[key]}
                  onOpenMedia={() => setMediaTarget(key)}
                />
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      value={card.title} onChange={e => setMapCard(i, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sale Label</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      value={card.saleTitle} onChange={e => setMapCard(i, 'saleTitle', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Link</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      value={card.link} onChange={e => setMapCard(i, 'link', e.target.value)} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Slider Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h2 className="text-sm font-semibold text-gray-800">
            Slider Items
            <span className="ml-2 text-xs font-normal text-gray-400">({form.sliderItems.length} items)</span>
          </h2>
          <button onClick={addSliderItem}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
            <Plus size={13} /> Add Slide
          </button>
        </div>

        <div className="space-y-3">
          {form.sliderItems.map((item, i) => {
            const key = `slider-${i}`
            const ref = getRef(key)
            return (
              <div key={i} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                  <button onClick={() => moveSliderItem(i, -1)} disabled={i === 0}
                    className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▲</button>
                  <button onClick={() => moveSliderItem(i, 1)} disabled={i === form.sliderItems.length - 1}
                    className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▼</button>
                </div>
                <GripVertical size={14} className="text-gray-300 shrink-0 mt-1" />

                <div className="flex-1 space-y-2">
                  <ImagePicker
                    value={item.image}
                    onChange={v => setSliderItem(i, 'image', v)}
                    fileRef={ref}
                    onUpload={handleUpload(key)}
                    uploading={uploading[key]}
                    onOpenMedia={() => setMediaTarget(key)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Title</label>
                      <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        value={item.title} onChange={e => setSliderItem(i, 'title', e.target.value)} placeholder="Product title" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Sale Label</label>
                      <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        value={item.saleTitle} onChange={e => setSliderItem(i, 'saleTitle', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Link</label>
                      <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        value={item.link} onChange={e => setSliderItem(i, 'link', e.target.value)} />
                    </div>
                  </div>
                </div>

                <button onClick={() => removeSliderItem(i)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 mt-1">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>How it works:</strong> The 3 map cards float over the map image at fixed positions.
        The slider scrolls automatically on the right side. Add as many slider items as needed.
      </div>

      {/* Media Picker Modal */}
      {mediaTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
              <button onClick={() => setMediaTarget(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
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
