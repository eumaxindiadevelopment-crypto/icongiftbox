// Every homepage CMS "section" model (AboutSection, SummerSale, HottestBlogSection,
// etc.) is a singleton — exactly one row, fetched with GET and fully replaced with
// PUT — so the handler logic is identical across all of them and only the model +
// the allowed/transformed fields differ. This factory holds that shared logic once
// instead of copy-pasting the same get-or-create / update-or-create pair per section.
function createSingletonSectionController(Model, transform = (body) => body) {
  async function get(req, res, next) {
    try {
      let doc = await Model.findOne()
      if (!doc) doc = await Model.create({})
      res.json(doc)
    } catch (err) { next(err) }
  }

  async function update(req, res, next) {
    try {
      const patch = transform(req.body)
      let doc = await Model.findOne()
      if (!doc) doc = await Model.create(patch)
      else await doc.update(patch)
      res.json(doc)
    } catch (err) { next(err) }
  }

  return { get, update }
}

module.exports = createSingletonSectionController
