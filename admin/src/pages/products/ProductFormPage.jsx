import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, ArrowLeft, Upload, Plus, Trash2, X,
  ImageIcon, RefreshCw, Star, Eye, Copy,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Loading'
import { MediaPicker } from '../../components/ui/MediaPicker'
import { Modal } from '../../components/ui/Modal'
import { RichEditor } from '../../components/ui/RichEditor'
import api, { SERVER_URL, FRONTEND_URL } from '../../lib/api'
import { buildProductUrl } from '../../lib/seoUrl'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toAbsUrl = (src) =>
  !src ? '' : src.startsWith('http') ? src : `${SERVER_URL}${src}`

const generateSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const comboKey = (attrs) =>
  Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|')

const STATUS_LABELS = { draft: 'Draft', publish: 'Published', pending: 'Pending Review', trash: 'Trashed' }
const VISIBILITY_LABELS = { public: 'Public', private: 'Private' }
const CATALOG_VISIBILITY_LABELS = {
  visible: 'Shop and search results', catalog: 'Shop only', search: 'Search results only', hidden: 'Hidden',
}

const toDatetimeLocal = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatPublishDate = (iso) =>
  !iso ? 'Immediately' : new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(iso))

function cartesianCombos(attrDefs) {
  return attrDefs.reduce((acc, def) => {
    if (!def.options.length) return acc
    if (!acc.length) return def.options.map(opt => ({ [def.name]: opt }))
    const next = []
    acc.forEach(combo => def.options.forEach(opt => next.push({ ...combo, [def.name]: opt })))
    return next
  }, [])
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`} />
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </label>
  )
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  const add = (raw) => {
    const tag = raw.trim().replace(/,+$/, '')
    if (!tag || tags.includes(tag)) { setInput(''); return }
    onChange([...tags, tag])
    setInput('')
  }

  return (
    <div
      className="min-h-[40px] flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg
                 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-text"
      onClick={e => e.currentTarget.querySelector('input')?.focus()}
    >
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors ml-0.5">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
          if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1))
        }}
        onBlur={() => { if (input.trim()) add(input) }}
        placeholder={tags.length ? '' : 'Type tag and press Enter…'}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent text-gray-900 placeholder-gray-400"
      />
    </div>
  )
}

function PublishRow({ icon, label, value, editing, onEdit, onOk, onCancel, children }) {
  return (
    <div className="text-sm text-gray-700 py-1.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-1.5">
        {icon}
        <span>{label}: <strong className="font-medium text-gray-900">{value}</strong></span>
        {!editing && (
          <button type="button" onClick={onEdit} className="text-xs text-blue-600 hover:underline ml-1">Edit</button>
        )}
      </div>
      {editing && (
        <div className="mt-2 pl-5 space-y-2">
          {children}
          <div className="flex gap-3">
            <button type="button" onClick={onOk}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              OK
            </button>
            <button type="button" onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function VariationGalleryModal({ variation, uploading, onAdd, onRemove, onClose, onOpenLibrary }) {
  const inputRef = useRef()
  if (!variation) return null
  const label = Object.values(variation.attributes || {}).join(' / ') || 'Variation'
  return (
    <Modal open={!!variation} onClose={onClose} title={`Gallery — ${label}`} size="md">
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { onAdd(Array.from(e.target.files || [])); e.target.value = '' }} />
      <div className="grid grid-cols-4 gap-2">
        {(variation.images || []).map((img, i) => (
          <div key={i} className="relative group aspect-square">
            <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
            <button type="button" onClick={() => onRemove(i)}
              className="absolute top-1 right-1 p-0.5 bg-white rounded-full shadow text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={12} />
            </button>
          </div>
        ))}
        <div
          onClick={() => inputRef.current?.click()}
          className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          title="Add image"
        >
          {uploading ? <Spinner size="sm" /> : <Plus size={18} className="text-gray-400" />}
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenLibrary}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ImageIcon size={14} /> Add from Media Library
      </button>
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id && id !== 'new'
  const slugEdited = useRef(false)

  const [form, setForm] = useState({
    name: '', slug: '', sku: '',
    price: '', salePrice: '', onSale: false,
    stock: '', managedInventory: true, backorders: 'no',
    status: 'draft', featured: false,
    visibility: 'public', catalogVisibility: 'visible', publishedAt: '',
    description: '', shortDescription: '',
    weight: '', length: '', width: '', height: '',
    taxStatus: 'taxable', taxClass: '',
    categories: [], primaryCategoryId: '', tags: [], brandId: '',
    attributes: [],
    hasVariations: false, variations: [],
    metaTitle: '', metaDescription: '',
  })

  const [allCategories, setAllCategories] = useState([])
  const [allBrands, setAllBrands] = useState([])
  const [mainImage, setMainImage] = useState(null)
  const [gallery, setGallery] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTarget, setPickerTarget] = useState('main')
  const [galleryModalVid, setGalleryModalVid] = useState(null)
  const [variationUploading, setVariationUploading] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')
  const [editingField, setEditingField] = useState(null) // 'status' | 'visibility' | 'catalogVisibility' | 'publishedAt'
  const [temp, setTemp] = useState({})
  const [copying, setCopying] = useState(false)
  const [catTab, setCatTab] = useState('all') // 'all' | 'used'
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatParent, setNewCatParent] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  const mainInputRef = useRef()
  const galleryInputRef = useRef()

  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), [])

  const startEdit = (field, initial) => { setTemp(t => ({ ...t, [field]: initial })); setEditingField(field) }
  const confirmEdit = () => { set(editingField, temp[editingField]); setEditingField(null) }
  const cancelEdit = () => setEditingField(null)

  // Auto-generate slug from name (unless user has manually edited the slug)
  useEffect(() => {
    if (!form.name || slugEdited.current) return
    set('slug', generateSlug(form.name))
  }, [form.name, set])

  // Load categories and product data
  useEffect(() => {
    api.get('/categories')
      .then(r => setAllCategories(Array.isArray(r.data) ? r.data : r.data.categories || []))
      .catch(() => {})
    api.get('/brands')
      .then(r => setAllBrands(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})

    if (!isEdit) return
    api.get(`/products/${id}`)
      .then(({ data }) => {
        slugEdited.current = true
        setForm({
          name: data.name || '',
          slug: data.slug || '',
          sku: data.sku || '',
          price: data.regularPrice ?? data.price ?? '',
          salePrice: data.salePrice ?? '',
          onSale: data.onSale || false,
          stock: data.stockQuantity ?? '',
          managedInventory: data.managedInventory ?? true,
          backorders: data.backorderAllowed ? 'yes' : 'no',
          status: data.status || 'draft',
          featured: data.featured || false,
          visibility: data.visibility || 'public',
          catalogVisibility: data.catalogVisibility || 'visible',
          publishedAt: data.publishedAt || '',
          description: data.description || '',
          shortDescription: data.shortDescription || '',
          weight: data.weight || '',
          length: data.dimensions?.length || '',
          width: data.dimensions?.width || '',
          height: data.dimensions?.height || '',
          taxStatus: data.taxStatus || 'taxable',
          taxClass: data.taxClass || '',
          categories: data.categories?.map(c => c._id || c) || [],
          primaryCategoryId: data.primaryCategory?._id || data.primaryCategoryId || '',
          brandId: data.brand?._id || data.brandId || '',
          tags: data.tags || [],
          attributes: data.attributes?.map(a => ({
            id: Math.random().toString(36).slice(2),
            name: a.name || '',
            options: Array.isArray(a.options) ? a.options.join(', ') : (a.options || ''),
            visible: a.visible ?? true,
          })) || [],
          hasVariations: data.type === 'variable',
          variations: data.variations?.map(v => ({
            id: Math.random().toString(36).slice(2),
            attributes: v.attributes || {},
            sku: v.sku || '',
            price: v.price ?? '',
            stock: v.stockQuantity ?? '',
            images: (v.images || []).map(img => ({ url: toAbsUrl(img.src), filename: '' })),
            enabled: v.enabled ?? true,
          })) || [],
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
        })
        if (data.images?.[0]) setMainImage({ url: toAbsUrl(data.images[0].src), filename: '' })
        if (data.images?.length > 1)
          setGallery(data.images.slice(1).map(img => ({ url: toAbsUrl(img.src), filename: '' })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, isEdit])

  // ── Image helpers ────────────────────────────────────────────────────────────

  const uploadFile = async (file) => {
    const fd = new FormData()
    fd.append('image', file)
    const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return data
  }

  const handleMainImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { setMainImage(await uploadFile(file)) } catch { setError('Image upload failed') }
    setUploading(false)
  }

  const handleGalleryImages = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return
    setUploading(true)
    try {
      const results = await Promise.all(files.map(uploadFile))
      setGallery(g => [...g, ...results])
    } catch { setError('Gallery upload failed') }
    setUploading(false)
  }

  const removeGalleryImage = async (idx) => {
    const img = gallery[idx]
    if (img.filename) await api.delete(`/upload/${img.filename}`).catch(() => {})
    setGallery(g => g.filter((_, i) => i !== idx))
  }

  const openPicker = (target) => { setPickerTarget(target); setPickerOpen(true) }
  const handlePickerSelect = (file) => {
    if (pickerTarget === 'main') setMainImage({ url: file.url, filename: file.filename })
    else if (pickerTarget === 'gallery') setGallery(g => [...g, { url: file.url, filename: file.filename }])
    else if (pickerTarget.startsWith('variation-gallery:')) {
      const vid = pickerTarget.slice('variation-gallery:'.length)
      set('variations', form.variations.map(v => v.id === vid
        ? { ...v, images: [...(v.images || []), { url: file.url, filename: file.filename }] }
        : v))
    }
  }

  // ── Variation gallery helpers ────────────────────────────────────────────────

  const addVariationImages = async (vid, files) => {
    if (!files.length) return
    setVariationUploading(true)
    try {
      const results = await Promise.all(files.map(uploadFile))
      set('variations', form.variations.map(v => v.id === vid
        ? { ...v, images: [...(v.images || []), ...results] }
        : v))
    } catch { setError('Gallery upload failed') }
    setVariationUploading(false)
  }

  const removeVariationImage = async (vid, idx) => {
    const variation = form.variations.find(v => v.id === vid)
    const img = variation?.images?.[idx]
    if (img?.filename) await api.delete(`/upload/${img.filename}`).catch(() => {})
    set('variations', form.variations.map(v => v.id === vid
      ? { ...v, images: v.images.filter((_, i) => i !== idx) }
      : v))
  }

  // ── Category tree helpers ────────────────────────────────────────────────────

  // Depth-first walk (top-level, then each one's children directly beneath it)
  // so the checkbox list below renders a WordPress-style indented tree instead
  // of the API's flat alphabetical order.
  
  const categoryTree = (() => {
    const result = []
    const addWithChildren = (cat, depth) => {
      result.push({ cat, depth })
      allCategories.filter(c => c.parent?._id === cat._id).forEach(child => addWithChildren(child, depth + 1))
    }
    allCategories.filter(c => !c.parent?._id).forEach(top => addWithChildren(top, 0))
    return result
  })()

  const mostUsedCategories = [...allCategories]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 10)
    .map(cat => ({ cat, depth: 0 }))

  // Prefer the most specific (deepest) checked category as the default primary
  // — e.g. if both "Eco-Friendly Gifts" and its child "Cork Products" are
  // checked, the product's canonical URL should use Cork Products, not fall
  // back to the parent just because it happened to be checked/ordered first.

  const pickPrimaryCategoryId = (categoryIds) => {
    if (!categoryIds.length) return null
    const deepest = categoryIds.find(id => allCategories.find(c => c._id === id)?.parent?._id)
    return deepest || categoryIds[0]
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    setAddingCat(true)
    try {
      const { data } = await api.post('/categories', { name: newCatName.trim(), parentId: newCatParent || null })
      setAllCategories(cs => [...cs, data])
      set('categories', [...form.categories, data._id])
      if (!form.primaryCategoryId) set('primaryCategoryId', data._id)
      setNewCatName(''); setNewCatParent(''); setShowAddCat(false)
    } catch { setError('Failed to add category') }
    setAddingCat(false)
  }

  // ── Attribute helpers ────────────────────────────────────────────────────────

  const addAttr = () =>
    set('attributes', [...form.attributes, { id: Date.now().toString(), name: '', options: '', visible: true }])

  const removeAttr = (attrId) =>
    set('attributes', form.attributes.filter(a => a.id !== attrId))

  const updateAttr = (attrId, key, val) =>
    set('attributes', form.attributes.map(a => a.id === attrId ? { ...a, [key]: val } : a))

  // ── Variation helpers ────────────────────────────────────────────────────────

  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')

  const handleGenerateVariations = () => {
    const attrDefs = form.attributes
      .filter(a => a.name.trim())
      .map(a => ({ name: a.name.trim(), options: a.options.split(',').map(s => s.trim()).filter(Boolean) }))
    const combos = cartesianCombos(attrDefs)
    const existingByKey = new Map(form.variations.map(v => [comboKey(v.attributes), v]))
    const next = combos.map(attrs => existingByKey.get(comboKey(attrs)) || {
      id: Math.random().toString(36).slice(2),
      attributes: attrs, sku: '', price: '', stock: '', images: [], enabled: true,
    })
    set('variations', next)
    set('hasVariations', true)
  }

  const updateVariation = (vid, key, val) =>
    set('variations', form.variations.map(v => v.id === vid ? { ...v, [key]: val } : v))

  const removeVariation = (vid) =>
    set('variations', form.variations.filter(v => v.id !== vid))

  const applyBulkPrice = () => { if (bulkPrice !== '') set('variations', form.variations.map(v => ({ ...v, price: bulkPrice }))) }
  const applyBulkStock = () => { if (bulkStock !== '') set('variations', form.variations.map(v => ({ ...v, stock: bulkStock }))) }

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.sku.trim()) { setError('SKU is required'); return }
    setSaving(true); setError('')
    try {
      const images = []
      if (mainImage) images.push({ src: mainImage.url, alt: form.name, position: 0 })
      gallery.forEach((img, i) => images.push({ src: img.url, alt: form.name, position: i + 1 }))

      const priceNum = Number(form.price) || 0
      const salePriceNum = form.onSale && form.salePrice ? Number(form.salePrice) : undefined

      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        sku: form.sku,
        price: salePriceNum ?? priceNum,
        regularPrice: priceNum,
        salePrice: salePriceNum,
        onSale: form.onSale && !!form.salePrice,
        stockQuantity: form.managedInventory ? (Number(form.stock) || 0) : 0,
        stockStatus: Number(form.stock) > 0 || !form.managedInventory ? 'instock' : 'outofstock',
        managedInventory: form.managedInventory,
        backorderAllowed: form.backorders === 'yes',
        status: form.status,
        featured: form.featured,
        visibility: form.visibility,
        catalogVisibility: form.catalogVisibility,
        publishedAt: form.publishedAt || undefined,
        description: form.description,
        shortDescription: form.shortDescription,
        weight: form.weight ? String(form.weight) : '',
        dimensions: { length: form.length, width: form.width, height: form.height },
        taxStatus: form.taxStatus,
        taxClass: form.taxClass,
        categories: form.categories,
        primaryCategoryId: form.primaryCategoryId || pickPrimaryCategoryId(form.categories) || null,
        brandId: form.brandId || null,
        tags: form.tags,
        attributes: form.attributes
          .filter(a => a.name.trim())
          .map(a => ({
            name: a.name,
            options: a.options.split(',').map(s => s.trim()).filter(Boolean),
            visible: a.visible,
          })),
        type: form.hasVariations ? 'variable' : 'simple',
        variations: form.hasVariations
          ? form.variations.map(v => ({
              attributes: v.attributes,
              sku: v.sku,
              price: Number(v.price) || 0,
              regularPrice: Number(v.price) || 0,
              stockQuantity: Number(v.stock) || 0,
              stockStatus: Number(v.stock) > 0 ? 'instock' : 'outofstock',
              images: (v.images || []).map(img => ({ src: img.url, alt: form.name })),
              enabled: v.enabled,
            }))
          : [],
        images,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      }

      if (isEdit) await api.put(`/products/${id}`, payload)
      else await api.post('/products', payload)
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product')
    }
    setSaving(false)
  }

  const handleCopyToDraft = async () => {
    if (!isEdit) return
    setCopying(true)
    try {
      const { data } = await api.get(`/products/${id}`)
      const suffix = Date.now().toString(36)
      const payload = {
        ...data,
        _id: undefined, __v: undefined, createdAt: undefined, updatedAt: undefined, publishedAt: undefined,
        name: `${data.name} (Copy)`,
        slug: `${data.slug || generateSlug(data.name)}-copy-${suffix}`,
        sku: data.sku ? `${data.sku}-copy-${suffix}` : data.sku,
        status: 'draft',
      }
      const res = await api.post('/products', payload)
      navigate(`/products/${res.data._id}/edit`)
    } catch {
      setError('Failed to copy product')
    }
    setCopying(false)
  }

  const handleMoveToTrash = async () => {
    if (!isEdit) return
    setSaving(true)
    try {
      await api.put(`/products/${id}`, { status: 'trash' })
      navigate('/products')
    } catch {
      setError('Failed to move product to trash')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  const discountPct = form.price && form.salePrice && Number(form.price) > Number(form.salePrice)
    ? Math.round((1 - Number(form.salePrice) / Number(form.price)) * 100)
    : 0

  const seoPreviewDesc = form.metaDescription
    || form.shortDescription?.replace(/<[^>]+>/g, '').slice(0, 160)
    || 'No description provided.'

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="text-xs text-gray-500">
            {isEdit ? form.name || 'Loading…' : 'Fill in the details below'}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/products')}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            <Save size={14} />
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Publish Product'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <X size={14} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ═══════════════ LEFT COLUMN ═══════════════ */}
        <div className="xl:col-span-2 space-y-5">

          {/* ── Product Information ── */}
          <Card>
            <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
            <CardBody className="space-y-4">

              <Input
                label="Product Name *"
                value={form.name}
                onChange={e => { slugEdited.current = false; set('name', e.target.value) }}
                placeholder="e.g. Executive Gift Hamper"
              />

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL Slug</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => { slugEdited.current = true; set('slug', e.target.value) }}
                    placeholder="product-url-slug"
                    className="flex-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => { slugEdited.current = false; set('slug', generateSlug(form.name)) }}
                    title="Regenerate from product name"
                    className="px-3 py-2 flex items-center gap-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap transition-colors"
                  >
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                  {FRONTEND_URL.replace(/^https?:\/\//, '')}{buildProductUrl({ slug: form.slug || '…', _id: id, primaryCategory: allCategories.find(c => c._id === form.primaryCategoryId) })}
                </p>
                {form.primaryCategoryId && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Based on category: <span className="font-medium text-gray-500">{allCategories.find(c => c._id === form.primaryCategoryId)?.name}</span>
                  </p>
                )}
              </div>

              <Input
                label={form.hasVariations ? 'SKU (parent) *' : 'SKU *'}
                helper={form.hasVariations ? 'Each variation below can have its own SKU — this one just identifies the parent product.' : undefined}
                value={form.sku}
                onChange={e => set('sku', e.target.value)}
                placeholder="e.g. EGH-001"
              />
            </CardBody>
          </Card>

          {/* ── Short Description ── */}
          <Card>
            <CardHeader>
              <CardTitle>Short Description</CardTitle>
              <span className="text-xs text-gray-400">Shown in product cards &amp; listings</span>
            </CardHeader>
            <CardBody>
              <RichEditor
                value={form.shortDescription}
                onChange={val => set('shortDescription', val)}
                placeholder="Brief product summary — what makes it special?"
                minHeight={100}
              />
            </CardBody>
          </Card>

          {/* ── Full Description ── */}
          <Card>
            <CardHeader>
              <CardTitle>Full Description</CardTitle>
              <span className="text-xs text-gray-400">Shown on the product detail page</span>
            </CardHeader>
            <CardBody>
              <RichEditor
                value={form.description}
                onChange={val => set('description', val)}
                placeholder="Detailed description, features, materials, use cases…"
                minHeight={220}
              />
            </CardBody>
          </Card>

          {/* ── Pricing ── */}
          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label={form.hasVariations ? 'Base Price (₹) *' : 'Regular Price (₹) *'}
                helper={form.hasVariations ? "Fallback only — customers see each variation's own price (set below), not this one." : undefined}
                type="number"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0.00"
              />

              {/* Sale price toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable Sale Price</p>
                  <p className="text-xs text-gray-500 mt-0.5">Display a discounted price on the product</p>
                </div>
                <Toggle checked={form.onSale} onChange={e => set('onSale', e.target.checked)} />
              </div>

              {form.onSale && (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg space-y-2">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        label="Sale Price (₹)"
                        type="number"
                        value={form.salePrice}
                        onChange={e => set('salePrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    {discountPct > 0 && (
                      <div className="pb-1">
                        <span className="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 rounded-full">
                          {discountPct}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  {form.price && form.salePrice && Number(form.salePrice) >= Number(form.price) && (
                    <p className="text-xs text-red-600">⚠ Sale price must be less than regular price</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Select label="Tax Status" value={form.taxStatus} onChange={e => set('taxStatus', e.target.value)}>
                  <option value="taxable">Taxable</option>
                  <option value="shipping">Shipping only</option>
                  <option value="none">None</option>
                </Select>
                <Select label="Tax Class" value={form.taxClass} onChange={e => set('taxClass', e.target.value)}>
                  <option value="">Standard Rate</option>
                  <option value="reduced-rate">Reduced Rate</option>
                  <option value="zero-rate">Zero Rate</option>
                </Select>
              </div>
            </CardBody>
          </Card>

          {/* ── Inventory ── */}
          <Card>
            <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Track Stock Quantity</p>
                  <p className="text-xs text-gray-500 mt-0.5">Manage and display inventory levels</p>
                </div>
                <Toggle checked={form.managedInventory} onChange={e => set('managedInventory', e.target.checked)} />
              </div>

              {form.managedInventory && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Stock Quantity"
                    type="number"
                    value={form.stock}
                    onChange={e => set('stock', e.target.value)}
                    placeholder="0"
                  />
                  <Select label="Allow Backorders" value={form.backorders} onChange={e => set('backorders', e.target.value)}>
                    <option value="no">Do not allow</option>
                    <option value="notify">Allow, notify customer</option>
                    <option value="yes">Allow</option>
                  </Select>
                </div>
              )}

              {form.managedInventory && form.stock !== '' && (
                <div className={`text-xs font-medium px-3 py-2 rounded-lg ${Number(form.stock) > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {Number(form.stock) > 0
                    ? `✓ In Stock — ${form.stock} unit${Number(form.stock) !== 1 ? 's' : ''} available`
                    : '✕ Out of Stock'}
                </div>
              )}
            </CardBody>
          </Card>

          {/* ── Shipping ── */}
          <Card>
            <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Weight (kg)"
                type="number"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                placeholder="0.00"
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[['length', 'Length'], ['width', 'Width'], ['height', 'Height']].map(([key, lbl]) => (
                    <div key={key}>
                      <input
                        type="number"
                        value={form[key]}
                        onChange={e => set(key, e.target.value)}
                        placeholder={lbl}
                        className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-400 mt-0.5 text-center">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ── Attributes ── */}
          <Card>
            <CardHeader>
              <CardTitle>Product Attributes</CardTitle>
              <button
                type="button"
                onClick={addAttr}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus size={12} /> Add Attribute
              </button>
            </CardHeader>
            <CardBody>
              {form.attributes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm font-medium">No attributes yet</p>
                  <p className="text-xs mt-1">Add attributes like Color, Size, Material, Finish</p>
                  <button
                    type="button"
                    onClick={addAttr}
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    + Add First Attribute
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_2fr_80px_32px] gap-3 px-1">
                    <p className="text-xs font-medium text-gray-400">Attribute name</p>
                    <p className="text-xs font-medium text-gray-400">Options (comma-separated)</p>
                    <p className="text-xs font-medium text-gray-400 text-center">Visible</p>
                    <span />
                  </div>
                  <p className="text-xs text-gray-400 px-1">
                    Reuse the same name for one attribute (e.g. one "Color" row with "Red, Blue, Green") instead of adding a separate row per value — the storefront filters group by attribute name.
                  </p>
                  <datalist id="attribute-name-suggestions">
                    <option value="Color" />
                    <option value="Size" />
                    <option value="Material" />
                  </datalist>
                  {form.attributes.map(attr => (
                    <div key={attr.id} className="grid grid-cols-[1fr_2fr_80px_32px] gap-3 items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <input
                        type="text"
                        list="attribute-name-suggestions"
                        value={attr.name}
                        onChange={e => updateAttr(attr.id, 'name', e.target.value)}
                        placeholder="e.g. Color"
                        className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={attr.options}
                        onChange={e => updateAttr(attr.id, 'options', e.target.value)}
                        placeholder="Red, Blue, Green"
                        className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-center">
                        <Toggle
                          checked={attr.visible}
                          onChange={e => updateAttr(attr.id, 'visible', e.target.checked)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttr(attr.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAttr}
                    className="w-full py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors mt-1"
                  >
                    + Add another attribute
                  </button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* ── Variations ── */}
          {form.attributes.some(a => a.options.trim()) && (
            <Card>
              <CardHeader>
                <CardTitle>Variations</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">This product has variations</span>
                  <Toggle checked={form.hasVariations} onChange={e => set('hasVariations', e.target.checked)} />
                </div>
              </CardHeader>
              {form.hasVariations && (
                <CardBody className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateVariations}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <RefreshCw size={12} className="inline mr-1" />
                      {form.variations.length ? 'Regenerate from Attributes' : 'Generate Variations from Attributes'}
                    </button>
                  </div>

                  {form.variations.length > 0 && (
                    <>
                      <div className="flex flex-wrap items-end gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Set price for all</label>
                          <input type="number" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} placeholder="0.00"
                            className="w-28 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button type="button" onClick={applyBulkPrice} className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Apply</button>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Set stock for all</label>
                          <input type="number" value={bulkStock} onChange={e => setBulkStock(e.target.value)} placeholder="0"
                            className="w-24 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button type="button" onClick={applyBulkStock} className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Apply</button>
                      </div>

                      <div className="grid grid-cols-[1.4fr_1fr_90px_90px_60px_60px_32px] gap-2 px-1">
                        <p className="text-xs font-medium text-gray-400">Variation</p>
                        <p className="text-xs font-medium text-gray-400">SKU</p>
                        <p className="text-xs font-medium text-gray-400">Price (₹)</p>
                        <p className="text-xs font-medium text-gray-400">Stock</p>
                        <p className="text-xs font-medium text-gray-400 text-center">Image</p>
                        <p className="text-xs font-medium text-gray-400 text-center">On</p>
                        <span />
                      </div>
                      {form.variations.map(v => (
                        <div key={v.id} className="grid grid-cols-[1.4fr_1fr_90px_90px_60px_60px_32px] gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-700 truncate">{Object.values(v.attributes).join(' / ')}</span>
                          <input type="text" value={v.sku} onChange={e => updateVariation(v.id, 'sku', e.target.value)} placeholder="SKU"
                            className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input type="number" value={v.price} onChange={e => updateVariation(v.id, 'price', e.target.value)} placeholder="0.00"
                            className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input type="number" value={v.stock} onChange={e => updateVariation(v.id, 'stock', e.target.value)} placeholder="0"
                            className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <button type="button" onClick={() => setGalleryModalVid(v.id)} title="Manage gallery" className="mx-auto block relative">
                            {v.images?.length > 0 ? (
                              <>
                                <img src={v.images[0].url} alt="" className="w-8 h-8 object-cover rounded-lg border border-gray-200" />
                                {v.images.length > 1 && (
                                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-blue-600 rounded-full">
                                    +{v.images.length - 1}
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <ImageIcon size={12} className="text-gray-400" />
                              </div>
                            )}
                          </button>
                          <div className="flex justify-center">
                            <Toggle checked={v.enabled} onChange={e => updateVariation(v.id, 'enabled', e.target.checked)} />
                          </div>
                          <button type="button" onClick={() => removeVariation(v.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </CardBody>
              )}
            </Card>
          )}
        </div>

        {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
        <div className="space-y-5">

          {/* ── Publish ── */}
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
              {isEdit && form.status !== 'trash' && (
                <a href={`${FRONTEND_URL}${buildProductUrl({ slug: form.slug, _id: id, primaryCategory: allCategories.find(c => c._id === form.primaryCategoryId) })}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-colors">
                  <Eye size={12} /> Preview Changes
                </a>
              )}
            </CardHeader>
            <CardBody className="space-y-1">

              <PublishRow
                icon={null}
                label="Status"
                value={STATUS_LABELS[form.status]}
                editing={editingField === 'status'}
                onEdit={() => startEdit('status', form.status)}
                onOk={confirmEdit}
                onCancel={cancelEdit}
              >
                <select value={temp.status} onChange={e => setTemp(t => ({ ...t, status: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="draft">Draft</option>
                  <option value="publish">Published</option>
                  <option value="pending">Pending Review</option>
                </select>
              </PublishRow>

              <PublishRow
                icon={null}
                label="Visibility"
                value={VISIBILITY_LABELS[form.visibility]}
                editing={editingField === 'visibility'}
                onEdit={() => startEdit('visibility', form.visibility)}
                onOk={confirmEdit}
                onCancel={cancelEdit}
              >
                {['public', 'private'].map(v => (
                  <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="visibility" checked={temp.visibility === v}
                      onChange={() => setTemp(t => ({ ...t, visibility: v }))}
                      className="text-blue-600 focus:ring-blue-500" />
                    {VISIBILITY_LABELS[v]}
                  </label>
                ))}
              </PublishRow>

              <PublishRow
                icon={null}
                label="Catalog visibility"
                value={CATALOG_VISIBILITY_LABELS[form.catalogVisibility]}
                editing={editingField === 'catalogVisibility'}
                onEdit={() => startEdit('catalogVisibility', form.catalogVisibility)}
                onOk={confirmEdit}
                onCancel={cancelEdit}
              >
                {Object.entries(CATALOG_VISIBILITY_LABELS).map(([v, lbl]) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="catalogVisibility" checked={temp.catalogVisibility === v}
                      onChange={() => setTemp(t => ({ ...t, catalogVisibility: v }))}
                      className="text-blue-600 focus:ring-blue-500" />
                    {lbl}
                  </label>
                ))}
              </PublishRow>

              <PublishRow
                icon={null}
                label="Published on"
                value={formatPublishDate(form.publishedAt)}
                editing={editingField === 'publishedAt'}
                onEdit={() => startEdit('publishedAt', toDatetimeLocal(form.publishedAt) || toDatetimeLocal(new Date()))}
                onOk={() => { set('publishedAt', new Date(temp.publishedAt).toISOString()); setEditingField(null) }}
                onCancel={cancelEdit}
              >
                <input type="datetime-local" value={temp.publishedAt}
                  onChange={e => setTemp(t => ({ ...t, publishedAt: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </PublishRow>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg !mt-4">
                <div className="flex items-center gap-2">
                  <Star size={15} className={form.featured ? 'text-yellow-500 fill-yellow-400' : 'text-gray-400'} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Featured Product</p>
                    <p className="text-xs text-gray-500">Show in featured sections</p>
                  </div>
                </div>
                <Toggle checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              </div>

              <div className="flex items-center justify-between pt-3 !mt-4 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-3">
                  {isEdit && (
                    <button type="button" onClick={handleCopyToDraft} disabled={copying}
                      className="flex items-center gap-1 text-blue-600 hover:underline disabled:opacity-50">
                      <Copy size={12} /> {copying ? 'Copying…' : 'Copy to a new draft'}
                    </button>
                  )}
                  {isEdit && form.status !== 'trash' && (
                    <button type="button" onClick={handleMoveToTrash}
                      className="flex items-center gap-1 text-red-600 hover:underline">
                      <Trash2 size={12} /> Move to Trash
                    </button>
                  )}
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={saving} className="w-full !mt-4">
                <Save size={14} />
                {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Publish Product'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/products')} className="w-full">
                Cancel
              </Button>
            </CardBody>
          </Card>

          {/* ── Product Image ── */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <button onClick={() => openPicker('main')} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <ImageIcon size={12} /> Library
              </button>
            </CardHeader>
            <CardBody>
              <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
              {mainImage ? (
                <div className="relative group">
                  <img
                    src={mainImage.url}
                    alt="Product"
                    className="w-full aspect-square object-cover rounded-xl border border-gray-200"
                    onError={() => setMainImage(null)}
                  />
                  <button
                    onClick={() => setMainImage(null)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={() => mainInputRef.current?.click()}
                    className="absolute bottom-2 left-2 px-2 py-1 bg-white rounded-lg shadow text-xs text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => mainInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 cursor-pointer transition-colors group"
                  >
                    {uploading
                      ? <Spinner className="mx-auto" />
                      : <>
                          <Upload size={22} className="mx-auto text-gray-300 group-hover:text-blue-400 mb-2" />
                          <p className="text-sm text-gray-500 group-hover:text-blue-600">Upload image</p>
                          <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                        </>
                    }
                  </div>
                  <button
                    onClick={() => openPicker('main')}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ImageIcon size={14} /> Select from Media Library
                  </button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* ── Gallery ── */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <button onClick={() => openPicker('gallery')} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <ImageIcon size={12} /> Library
              </button>
            </CardHeader>
            <CardBody>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryImages} />
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((img, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <button
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 p-0.5 bg-white rounded-full shadow text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  title="Add image"
                >
                  {uploading ? <Spinner size="sm" /> : <Plus size={18} className="text-gray-400" />}
                </div>
              </div>
            </CardBody>
          </Card>

          <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handlePickerSelect} />

          <VariationGalleryModal
            variation={form.variations.find(v => v.id === galleryModalVid) || null}
            uploading={variationUploading}
            onAdd={files => addVariationImages(galleryModalVid, files)}
            onRemove={idx => removeVariationImage(galleryModalVid, idx)}
            onClose={() => setGalleryModalVid(null)}
            onOpenLibrary={() => openPicker(`variation-gallery:${galleryModalVid}`)}
          />

          {/* ── Brand ── */}
          <Card>
            <CardHeader><CardTitle>Brand</CardTitle></CardHeader>
            <CardBody>
              <select
                value={form.brandId}
                onChange={e => set('brandId', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— No brand —</option>
                {allBrands.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </CardBody>
          </Card>

          {/* ── Categories ── */}
          <Card>
            <CardHeader><CardTitle>Product categories</CardTitle></CardHeader>
            <CardBody>
              {allCategories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">No categories found</p>
              ) : (
                <>
                  <div className="flex items-center gap-4 border-b border-gray-200 mb-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setCatTab('all')}
                      className={`pb-2 -mb-px border-b-2 transition-colors ${catTab === 'all' ? 'border-gray-800 text-gray-900 font-medium' : 'border-transparent text-blue-600 hover:text-blue-700'}`}
                    >
                      All Categories
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatTab('used')}
                      className={`pb-2 -mb-px border-b-2 transition-colors ${catTab === 'used' ? 'border-gray-800 text-gray-900 font-medium' : 'border-transparent text-blue-600 hover:text-blue-700'}`}
                    >
                      Most Used
                    </button>
                  </div>

                  <div className="space-y-0.5 max-h-52 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {(catTab === 'all' ? categoryTree : mostUsedCategories).map(({ cat, depth }) => {
                      const checked = form.categories.includes(cat._id)
                      const isPrimary = form.primaryCategoryId
                        ? form.primaryCategoryId === cat._id
                        : pickPrimaryCategoryId(form.categories) === cat._id
                      return (
                        <div
                          key={cat._id}
                          className="flex items-center gap-2.5 py-1 pr-2 rounded-lg hover:bg-gray-50 group"
                          style={{ paddingLeft: 6 + depth * 18 }}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                if (e.target.checked) set('categories', [...form.categories, cat._id])
                                else {
                                  set('categories', form.categories.filter(cid => cid !== cat._id))
                                  if (form.primaryCategoryId === cat._id) set('primaryCategoryId', '')
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 shrink-0"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">{cat.name}</span>
                          </label>
                          {checked && (
                            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer shrink-0" title="Used for this product's URL and breadcrumb">
                              <input
                                type="radio"
                                name="primaryCategory"
                                checked={isPrimary}
                                onChange={() => set('primaryCategoryId', cat._id)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              Primary
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {!showAddCat ? (
                      <button type="button" onClick={() => setShowAddCat(true)} className="text-xs text-blue-600 hover:underline">
                        + Add new category
                      </button>
                    ) : (
                      <div className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <input
                          type="text"
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)}
                          placeholder="New category name"
                          className="w-full text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={newCatParent}
                          onChange={e => setNewCatParent(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">— Parent category (none) —</option>
                          {allCategories.filter(c => !c.parent?._id).map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={addingCat || !newCatName.trim()}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            {addingCat ? 'Adding…' : 'Add New Category'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAddCat(false); setNewCatName(''); setNewCatParent('') }}
                            className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {form.categories.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">{form.categories.length} categor{form.categories.length === 1 ? 'y' : 'ies'} selected</p>
              )}
              <p className="text-xs text-gray-400 mt-1">"Primary" controls the category used in this product's SEO URL and breadcrumb.</p>
            </CardBody>
          </Card>

          {/* ── Tags ── */}
          <Card>
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardBody>
              <TagInput tags={form.tags} onChange={val => set('tags', val)} />
              <p className="text-xs text-gray-400 mt-2">Press Enter or , to add · Backspace to remove last</p>
            </CardBody>
          </Card>

          {/* ── SEO ── */}
          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-700">Meta Title</label>
                  <span className={`text-xs tabular-nums ${form.metaTitle.length > 60 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {form.metaTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={e => set('metaTitle', e.target.value)}
                  placeholder={form.name || 'SEO title…'}
                  maxLength={80}
                  className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-700">Meta Description</label>
                  <span className={`text-xs tabular-nums ${form.metaDescription.length > 160 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {form.metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)}
                  placeholder="Brief description for search engines…"
                  maxLength={200}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* SERP preview */}
              {(form.metaTitle || form.name) && (
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5 font-medium">Search Preview</p>
                  <p className="text-sm text-blue-700 font-medium leading-tight truncate">
                    {form.metaTitle || form.name}
                  </p>
                  <p className="text-xs text-green-700 mt-0.5 truncate">
                    {FRONTEND_URL.replace(/^https?:\/\//, '')}{buildProductUrl({ slug: form.slug || '…', _id: id, primaryCategory: allCategories.find(c => c._id === form.primaryCategoryId) })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {seoPreviewDesc}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  )
}
