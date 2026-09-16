const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect } = require('../middleware/auth')
const { Media } = require('../models')

const uploadDir = path.join(__dirname, '../../uploads/products')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// SEO-friendly names, like WordPress: "My Cool Photo.jpg" -> "my-cool-photo.jpg",
// and "my-cool-photo-1.jpg", "-2.jpg", ... on a filename collision — instead of
// the previous random "1717000000-ab12cd.jpg", which told search engines nothing.
function slugifyOriginalName(originalname) {
  const ext = path.extname(originalname).toLowerCase()
  const stem = path.basename(originalname, path.extname(originalname))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image'
  return { stem, ext }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const { stem, ext } = slugifyOriginalName(file.originalname)
    let filename = `${stem}${ext}`
    let n = 1
    while (fs.existsSync(path.join(uploadDir, filename))) {
      filename = `${stem}-${n}${ext}`
      n++
    }
    cb(null, filename)
  },
})

// Images (all common formats), video, PDF and PowerPoint — matched by extension
// rather than mimetype, since browsers/OSes report inconsistent mimetypes for
// office documents in particular.
const ALLOWED_FILE_REGEX = /\.(jpe?g|png|gif|webp|svg|bmp|ico|tiff?|avif|mp4|webm|mov|avi|mkv|ogv|ogg|pdf|ppt|pptx)$/i

const fileFilter = (req, file, cb) => {
  ALLOWED_FILE_REGEX.test(path.extname(file.originalname))
    ? cb(null, true)
    : cb(new Error('Unsupported file type. Allowed: images, video, PDF, PPT/PPTX.'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } })

const getBaseUrl = (req) =>
  process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`

// Turns "my-cool_photo.jpg" — or the auto-generated "1717000000-ab12cd.jpg" —
// into a human default title ("My Cool Photo") for the SEO fields below.
function titleFromFilename(name) {
  const stem = path.basename(name, path.extname(name))
  const cleaned = stem.replace(/^\d+-[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim()
  const words = cleaned || stem.replace(/[-_]+/g, ' ').trim()
  return words.replace(/\b\w/g, (c) => c.toUpperCase())
}

// Every file on disk gets a matching metadata row — files that predate this
// table (or were dropped into uploads/products/ by hand) get one lazily here
// instead of failing to show a title/alt-text field at all.
async function ensureMediaRows(filenames) {
  if (!filenames.length) return []
  const existing = await Media.findAll({ where: { filename: filenames } })
  const existingNames = new Set(existing.map((m) => m.filename))
  const missing = filenames.filter((f) => !existingNames.has(f))
  if (missing.length) {
    await Media.bulkCreate(missing.map((filename) => ({ filename, title: titleFromFilename(filename) })))
    return Media.findAll({ where: { filename: filenames } })
  }
  return existing
}

// GET /api/upload — list all media files
router.get('/', protect, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 40 } = req.query
    const base = getBaseUrl(req)
    const files = fs.existsSync(uploadDir)
      ? fs.readdirSync(uploadDir).filter((f) => ALLOWED_FILE_REGEX.test(f))
      : []

    const mediaRows = await ensureMediaRows(files)
    const mediaByFilename = new Map(mediaRows.map((m) => [m.filename, m]))

    const searchLower = search.toLowerCase()
    const enriched = files
      .map((filename) => {
        const filePath = path.join(uploadDir, filename)
        const stat = fs.statSync(filePath)
        const media = mediaByFilename.get(filename)
        return {
          filename,
          url: `${base}/uploads/products/${filename}`,
          size: stat.size,
          uploadedAt: stat.mtime,
          ext: path.extname(filename).slice(1).toUpperCase(),
          title: media?.title || titleFromFilename(filename),
          altText: media?.altText || '',
          caption: media?.caption || '',
          description: media?.description || '',
        }
      })
      .filter((f) => !search || f.filename.toLowerCase().includes(searchLower) || f.title.toLowerCase().includes(searchLower))
      .sort((a, b) => b.uploadedAt - a.uploadedAt)

    const total = enriched.length
    const start = (+page - 1) * +limit
    const items = enriched.slice(start, start + +limit)

    res.json({ files: items, total, page: +page, pages: Math.ceil(total / +limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/upload — single image
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const base = getBaseUrl(req)
  const title = titleFromFilename(req.file.originalname)
  await Media.create({ filename: req.file.filename, title })
  res.json({
    filename: req.file.filename,
    url: `${base}/uploads/products/${req.file.filename}`,
    size: req.file.size,
    uploadedAt: new Date(),
    ext: path.extname(req.file.filename).slice(1).toUpperCase(),
    title,
    altText: '',
    caption: '',
    description: '',
  })
})

// POST /api/upload/multiple — up to 20 images
router.post('/multiple', protect, upload.array('images', 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' })
  const base = getBaseUrl(req)
  await Media.bulkCreate(req.files.map((f) => ({ filename: f.filename, title: titleFromFilename(f.originalname) })))
  res.json(req.files.map((f) => ({
    filename: f.filename,
    url: `${base}/uploads/products/${f.filename}`,
    size: f.size,
    uploadedAt: new Date(),
    ext: path.extname(f.filename).slice(1).toUpperCase(),
    title: titleFromFilename(f.originalname),
    altText: '',
    caption: '',
    description: '',
  })))
})

// PATCH /api/upload/:filename — update title / alt text / caption / description
router.patch('/:filename', protect, async (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' })

  const { title, altText, caption, description } = req.body
  const [media] = await Media.findOrCreate({
    where: { filename: req.params.filename },
    defaults: { title: titleFromFilename(req.params.filename) },
  })
  await media.update({
    ...(title !== undefined && { title }),
    ...(altText !== undefined && { altText }),
    ...(caption !== undefined && { caption }),
    ...(description !== undefined && { description }),
  })
  res.json(media)
})

// DELETE /api/upload/:filename
router.delete('/:filename', protect, async (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  await Media.destroy({ where: { filename: req.params.filename } })
  res.json({ message: 'Deleted' })
})

module.exports = router
