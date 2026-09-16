// Plain mysql2/promise data-access layer for the WooCommerce-HPOS-style order
// schema (wc_orders + friends) — deliberately no ORM. Every exported function
// shapes its return value to match the old Sequelize+_id-alias order shape
// (`_id`, `lineItems[]`, `billingAddress{}`, etc.) so ordersController.js,
// reportsController.js, notificationsController.js and customersController.js
// — and the admin/frontend that consume their JSON — need no further changes.
const pool = require('../config/mysqlPool')

// ---------------------------------------------------------------------------
// Shaping helpers
// ---------------------------------------------------------------------------

function shapeAddress(a) {
  if (!a) return null
  return {
    firstName: a.first_name, lastName: a.last_name, company: a.company,
    address1: a.address_1, address2: a.address_2, city: a.city, state: a.state,
    postcode: a.postcode, country: a.country, email: a.email, phone: a.phone,
  }
}

function shapeLineItem(item) {
  const m = item.meta
  return {
    _id: String(item.order_item_id),
    productId: m._product_id ? Number(m._product_id) : null,
    name: item.order_item_name,
    quantity: Number(m._qty || 0),
    price: Number(m._line_price || 0),
    total: Number(m._line_total || 0),
    subtotal: Number(m._line_subtotal || 0),
  }
}

function shapeTaxLine(item) {
  const m = item.meta
  return {
    _id: String(item.order_item_id),
    rateCode: m._rate_code || item.order_item_name,
    label: item.order_item_name,
    taxTotal: Number(m._tax_amount || 0),
  }
}

function shapeCouponLine(item) {
  const m = item.meta
  return { _id: String(item.order_item_id), code: item.order_item_name, discount: Number(m._discount_amount || 0) }
}

async function fetchItemsWithMeta(orderId) {
  const [items] = await pool.query('SELECT * FROM wc_order_items WHERE order_id = ? ORDER BY order_item_id ASC', [orderId])
  if (!items.length) return []
  const ids = items.map((i) => i.order_item_id)
  const [metaRows] = await pool.query(
    `SELECT * FROM wc_order_itemmeta WHERE order_item_id IN (${ids.map(() => '?').join(',')})`,
    ids
  )
  const metaByItem = {}
  for (const m of metaRows) {
    (metaByItem[m.order_item_id] ??= {})[m.meta_key] = m.meta_value
  }
  return items.map((i) => ({ ...i, meta: metaByItem[i.order_item_id] || {} }))
}

async function shapeFullOrder(order) {
  const orderId = order.id
  const [metaRows] = await pool.query('SELECT meta_key, meta_value FROM wc_orders_meta WHERE order_id = ?', [orderId])
  const meta = {}
  const orderNotes = []
  for (const m of metaRows) {
    if (m.meta_key === '_order_note') {
      try { orderNotes.push(JSON.parse(m.meta_value)) } catch { /* skip malformed note */ }
    } else {
      meta[m.meta_key] = m.meta_value
    }
  }
  orderNotes.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))

  const [[stats]] = await pool.query('SELECT * FROM wc_order_stats WHERE order_id = ?', [orderId])
  const [addressRows] = await pool.query('SELECT * FROM wc_order_addresses WHERE order_id = ?', [orderId])
  const billing = addressRows.find((a) => a.address_type === 'billing')
  const shipping = addressRows.find((a) => a.address_type === 'shipping')

  const items = await fetchItemsWithMeta(orderId)
  const lineItems = items.filter((i) => i.order_item_type === 'line_item').map(shapeLineItem)
  const taxLines = items.filter((i) => i.order_item_type === 'tax').map(shapeTaxLine)
  const couponLines = items.filter((i) => i.order_item_type === 'coupon').map(shapeCouponLine)

  let customer = null
  if (order.customer_id) {
    const [[c]] = await pool.query(
      'SELECT id, firstName, lastName, email, totalOrders, totalSpent FROM customers WHERE id = ?',
      [order.customer_id]
    )
    if (c) customer = { _id: String(c.id), firstName: c.firstName, lastName: c.lastName, email: c.email, totalOrders: c.totalOrders, totalSpent: Number(c.totalSpent) }
  }

  return {
    _id: String(order.id),
    orderNumber: String(order.id).padStart(6, '0'),
    status: order.status,
    currency: order.currency,
    total: Number(order.total_amount),
    subtotal: Number(meta._subtotal ?? order.total_amount),
    tax: Number(order.tax_amount),
    shippingTotal: Number(meta._shipping_total ?? 0),
    discountTotal: Number(meta._discount_total ?? 0),
    paymentMethod: order.payment_method,
    paymentMethodTitle: order.payment_method_title,
    transactionId: order.transaction_id,
    isPaid: !!stats?.date_paid,
    customerId: order.customer_id ? String(order.customer_id) : null,
    customer,
    billingAddress: shapeAddress(billing),
    shippingAddress: shapeAddress(shipping),
    notes: order.customer_note,
    datePaid: stats?.date_paid || null,
    dateCompleted: stats?.date_completed || null,
    createdAt: order.date_created_gmt,
    updatedAt: order.date_updated_gmt,
    lineItems,
    taxLines,
    couponLines,
    orderNotes,
  }
}

// ---------------------------------------------------------------------------
// Internal write helpers
// ---------------------------------------------------------------------------

async function insertMeta(conn, orderId, kv) {
  for (const [key, value] of Object.entries(kv)) {
    if (value === undefined) continue
    await conn.execute('INSERT INTO wc_orders_meta (order_id, meta_key, meta_value) VALUES (?, ?, ?)', [orderId, key, value === null ? null : String(value)])
  }
}

async function insertItemMeta(conn, orderItemId, kv) {
  for (const [key, value] of Object.entries(kv)) {
    if (value === undefined) continue
    await conn.execute('INSERT INTO wc_order_itemmeta (order_item_id, meta_key, meta_value) VALUES (?, ?, ?)', [orderItemId, key, value === null ? null : String(value)])
  }
}

async function upsertAddress(conn, orderId, type, addr) {
  await conn.execute(
    `INSERT INTO wc_order_addresses (order_id, address_type, first_name, last_name, company, address_1, address_2, city, state, postcode, country, email, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), company=VALUES(company),
       address_1=VALUES(address_1), address_2=VALUES(address_2), city=VALUES(city), state=VALUES(state),
       postcode=VALUES(postcode), country=VALUES(country), email=VALUES(email), phone=VALUES(phone)`,
    [orderId, type, addr.firstName || null, addr.lastName || null, addr.company || null, addr.address1 || null,
      addr.address2 || null, addr.city || null, addr.state || null, addr.postcode || null, addr.country || null,
      addr.email || null, addr.phone || null]
  )
}

async function lookupCouponId(conn, code) {
  if (!code) return null
  const [rows] = await conn.query('SELECT id FROM coupons WHERE code = ? LIMIT 1', [code])
  return rows[0]?.id || null
}

async function clearChildren(conn, orderId) {
  const [items] = await conn.query('SELECT order_item_id FROM wc_order_items WHERE order_id = ?', [orderId])
  if (items.length) {
    const ids = items.map((i) => i.order_item_id)
    await conn.query(`DELETE FROM wc_order_itemmeta WHERE order_item_id IN (${ids.map(() => '?').join(',')})`, ids)
    await conn.query(`DELETE FROM wc_order_items WHERE order_id = ?`, [orderId])
  }
  await conn.query('DELETE FROM wc_order_product_lookup WHERE order_id = ?', [orderId])
  await conn.query('DELETE FROM wc_order_tax_lookup WHERE order_id = ?', [orderId])
  await conn.query('DELETE FROM wc_order_coupon_lookup WHERE order_id = ?', [orderId])
}

async function insertChildren(conn, orderId, { lineItems = [], taxLines = [], couponLines = [], customerId, date = new Date() }) {
  for (const li of lineItems) {
    const lineTotal = li.total ?? (li.price * li.quantity)
    const lineSubtotal = li.subtotal ?? lineTotal
    const [itemResult] = await conn.execute(
      `INSERT INTO wc_order_items (order_item_name, order_item_type, order_id) VALUES (?, 'line_item', ?)`,
      [li.name || li.title || '', orderId]
    )
    const orderItemId = itemResult.insertId
    await insertItemMeta(conn, orderItemId, {
      _product_id: li.productId || null, _qty: li.quantity, _line_total: lineTotal, _line_subtotal: lineSubtotal, _line_price: li.price,
    })
    await conn.execute(
      `INSERT INTO wc_order_product_lookup (order_item_id, order_id, product_id, variation_id, customer_id, date_created, product_qty, product_net_revenue, product_gross_revenue, coupon_amount, tax_amount, shipping_amount, shipping_tax_amount)
       VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, 0, 0, 0, 0)`,
      [orderItemId, orderId, li.productId || 0, customerId || null, date, li.quantity || 0, lineSubtotal, lineTotal]
    )
  }

  for (const [i, tl] of taxLines.entries()) {
    const [itemResult] = await conn.execute(
      `INSERT INTO wc_order_items (order_item_name, order_item_type, order_id) VALUES (?, 'tax', ?)`,
      [tl.label || tl.rateCode || 'Tax', orderId]
    )
    const orderItemId = itemResult.insertId
    await insertItemMeta(conn, orderItemId, { _rate_code: tl.rateCode, _tax_amount: tl.taxTotal })
    await conn.execute(
      `INSERT INTO wc_order_tax_lookup (order_id, tax_rate_id, date_created, shipping_tax, order_tax, total_tax) VALUES (?, ?, ?, 0, ?, ?)`,
      [orderId, i, date, tl.taxTotal || 0, tl.taxTotal || 0]
    )
  }

  for (const cl of couponLines) {
    const [itemResult] = await conn.execute(
      `INSERT INTO wc_order_items (order_item_name, order_item_type, order_id) VALUES (?, 'coupon', ?)`,
      [cl.code, orderId]
    )
    const orderItemId = itemResult.insertId
    await insertItemMeta(conn, orderItemId, { _discount_amount: cl.discount })
    const couponId = await lookupCouponId(conn, cl.code)
    if (couponId) {
      await conn.execute(
        `INSERT INTO wc_order_coupon_lookup (order_id, coupon_id, date_created, discount_amount) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE discount_amount = VALUES(discount_amount)`,
        [orderId, couponId, date, cl.discount || 0]
      )
    }
  }
}

async function upsertStats(conn, orderId, { status, customerId, total, tax, shippingTotal, subtotal, discountTotal, numItemsSold, date = new Date() }) {
  const netTotal = (Number(subtotal) || 0) - (Number(discountTotal) || 0)
  await conn.execute(
    `INSERT INTO wc_order_stats (order_id, parent_id, date_created, date_paid, date_completed, num_items_sold, total_sales, tax_total, shipping_total, net_total, status, customer_id)
     VALUES (?, 0, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE num_items_sold=VALUES(num_items_sold), total_sales=VALUES(total_sales),
       tax_total=VALUES(tax_total), shipping_total=VALUES(shipping_total), net_total=VALUES(net_total),
       status=VALUES(status), customer_id=VALUES(customer_id)`,
    [orderId, date, numItemsSold || 0, total || 0, tax || 0, shippingTotal || 0, netTotal, status, customerId || null]
  )
}

async function insertOrderTx({
  status = 'pending', currency = 'INR', paymentMethod, paymentMethodTitle, customerId = null,
  billingAddress, shippingAddress, lineItems = [], taxLines = [], couponLines = [], notes,
  subtotal, shippingTotal = 0, discountTotal = 0, tax = 0, total, ipAddress, userAgent, transactionId,
}) {
  const now = new Date()
  const billingEmail = billingAddress?.email || null
  const resolvedSubtotal = subtotal ?? lineItems.reduce((s, i) => s + (i.price * i.quantity), 0)
  const resolvedTotal = total ?? (resolvedSubtotal + tax + shippingTotal - discountTotal)

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [orderResult] = await conn.execute(
      `INSERT INTO wc_orders (status, currency, type, tax_amount, total_amount, customer_id, billing_email, date_created_gmt, date_updated_gmt, payment_method, payment_method_title, transaction_id, ip_address, user_agent, customer_note)
       VALUES (?, ?, 'shop_order', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [status, currency, tax, resolvedTotal, customerId, billingEmail, now, now, paymentMethod || null, paymentMethodTitle || null, transactionId || null, ipAddress || null, userAgent || null, notes || null]
    )
    const orderId = orderResult.insertId

    await insertMeta(conn, orderId, { _subtotal: resolvedSubtotal, _shipping_total: shippingTotal, _discount_total: discountTotal })
    if (billingAddress) await upsertAddress(conn, orderId, 'billing', billingAddress)
    if (shippingAddress) await upsertAddress(conn, orderId, 'shipping', shippingAddress)

    await insertChildren(conn, orderId, { lineItems, taxLines, couponLines, customerId, date: now })

    const numItemsSold = lineItems.reduce((s, li) => s + (Number(li.quantity) || 0), 0)
    await upsertStats(conn, orderId, { status, customerId, total: resolvedTotal, tax, shippingTotal, subtotal: resolvedSubtotal, discountTotal, numItemsSold, date: now })

    await conn.commit()
    return orderId
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

async function createGuestOrder({ billingAddress, lineItems, notes, paymentMethod, customerId }) {
  const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const orderId = await insertOrderTx({
    status: 'pending',
    currency: 'INR',
    paymentMethod: paymentMethod || 'cod',
    paymentMethodTitle: paymentMethod === 'bank' ? 'Direct Bank Transfer' : 'Cash on Delivery',
    customerId: customerId || null,
    billingAddress,
    shippingAddress: billingAddress,
    lineItems: lineItems.map((i) => ({ name: i.title, quantity: i.quantity, price: i.price, total: i.price * i.quantity, subtotal: i.price * i.quantity })),
    notes,
    subtotal,
    total: subtotal,
  })
  return { id: orderId, orderNumber: String(orderId).padStart(6, '0'), total: subtotal }
}

async function createOrder(body) {
  const orderId = await insertOrderTx({
    status: body.status || 'pending',
    currency: body.currency || 'INR',
    paymentMethod: body.paymentMethod,
    paymentMethodTitle: body.paymentMethodTitle,
    transactionId: body.transactionId,
    customerId: body.customerId || null,
    billingAddress: body.billingAddress,
    shippingAddress: body.shippingAddress || body.billingAddress,
    lineItems: body.lineItems || [],
    taxLines: body.taxLines || [],
    couponLines: body.couponLines || [],
    notes: body.notes,
    subtotal: body.subtotal,
    shippingTotal: body.shippingTotal || 0,
    discountTotal: body.discountTotal || 0,
    tax: body.tax || 0,
    total: body.total,
  })
  return getOrderById(orderId)
}

async function getOrderById(id) {
  const [[order]] = await pool.query('SELECT * FROM wc_orders WHERE id = ?', [id])
  if (!order) return null
  return shapeFullOrder(order)
}

async function getOrders({ status, page = 1, limit = 20, dateFrom, dateTo, search, customerId } = {}) {
  const where = []
  const params = []
  if (status) { where.push('o.status = ?'); params.push(status) }
  if (customerId) { where.push('o.customer_id = ?'); params.push(customerId) }
  if (dateFrom) { where.push('o.date_created_gmt >= ?'); params.push(new Date(dateFrom)) }
  if (dateTo) { where.push('o.date_created_gmt <= ?'); params.push(new Date(dateTo)) }
  if (search) { where.push('(o.billing_email LIKE ? OR o.id = ?)'); params.push(`%${search}%`, Number(search) || 0) }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const limitNum = Math.max(1, +limit || 20)
  const pageNum = Math.max(1, +page || 1)
  const offset = (pageNum - 1) * limitNum

  const [rows] = await pool.query(
    `SELECT o.* FROM wc_orders o ${whereSql} ORDER BY o.date_created_gmt DESC LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  )
  const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM wc_orders o ${whereSql}`, params)

  let addressByOrder = {}
  let customerById = {}
  if (rows.length) {
    const ids = rows.map((r) => r.id)
    const [addrRows] = await pool.query(
      `SELECT * FROM wc_order_addresses WHERE order_id IN (${ids.map(() => '?').join(',')}) AND address_type = 'billing'`,
      ids
    )
    addressByOrder = Object.fromEntries(addrRows.map((a) => [a.order_id, a]))
    const customerIds = [...new Set(rows.map((r) => r.customer_id).filter(Boolean))]
    if (customerIds.length) {
      const [custRows] = await pool.query(
        `SELECT id, firstName, lastName, email FROM customers WHERE id IN (${customerIds.map(() => '?').join(',')})`,
        customerIds
      )
      customerById = Object.fromEntries(custRows.map((c) => [c.id, c]))
    }
  }

  const orders = rows.map((o) => ({
    _id: String(o.id),
    orderNumber: String(o.id).padStart(6, '0'),
    status: o.status,
    createdAt: o.date_created_gmt,
    paymentMethod: o.payment_method,
    paymentMethodTitle: o.payment_method_title,
    total: Number(o.total_amount),
    customer: o.customer_id && customerById[o.customer_id]
      ? { firstName: customerById[o.customer_id].firstName, lastName: customerById[o.customer_id].lastName, email: customerById[o.customer_id].email }
      : null,
    billingAddress: shapeAddress(addressByOrder[o.id]),
  }))

  return { orders, total: count, page: pageNum, pages: Math.max(1, Math.ceil(count / limitNum)) }
}

async function getOrdersByCustomer(customerId) {
  const { orders } = await getOrders({ customerId, limit: 100 })
  return orders
}

async function updateOrder(id, body) {
  const [[existing]] = await pool.query('SELECT * FROM wc_orders WHERE id = ?', [id])
  if (!existing) return null
  const now = new Date()

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const status = body.status ?? existing.status
    const currency = body.currency ?? existing.currency
    const tax = body.tax ?? Number(existing.tax_amount)
    const total = body.total ?? Number(existing.total_amount)
    const customerId = body.customerId !== undefined ? body.customerId : existing.customer_id

    await conn.execute(
      `UPDATE wc_orders SET status=?, currency=?, tax_amount=?, total_amount=?, customer_id=?, billing_email=?, date_updated_gmt=?,
         payment_method=?, payment_method_title=?, transaction_id=?, customer_note=? WHERE id=?`,
      [status, currency, tax, total, customerId || null, body.billingAddress?.email || existing.billing_email,
        now, body.paymentMethod ?? existing.payment_method, body.paymentMethodTitle ?? existing.payment_method_title,
        body.transactionId ?? existing.transaction_id, body.notes ?? existing.customer_note, id]
    )

    if (body.subtotal !== undefined || body.shippingTotal !== undefined || body.discountTotal !== undefined) {
      await conn.execute('DELETE FROM wc_orders_meta WHERE order_id = ? AND meta_key IN ("_subtotal","_shipping_total","_discount_total")', [id])
      await insertMeta(conn, id, {
        _subtotal: body.subtotal ?? total, _shipping_total: body.shippingTotal ?? 0, _discount_total: body.discountTotal ?? 0,
      })
    }

    if (body.billingAddress) await upsertAddress(conn, id, 'billing', body.billingAddress)
    if (body.shippingAddress) await upsertAddress(conn, id, 'shipping', body.shippingAddress)

    if (body.lineItems || body.taxLines || body.couponLines) {
      await clearChildren(conn, id)
      await insertChildren(conn, id, {
        lineItems: body.lineItems || [], taxLines: body.taxLines || [], couponLines: body.couponLines || [], customerId, date: now,
      })
    }

    const numItemsSold = (body.lineItems || []).reduce((s, li) => s + (Number(li.quantity) || 0), 0)
    await upsertStats(conn, id, {
      status, customerId, total, tax,
      shippingTotal: body.shippingTotal ?? 0, subtotal: body.subtotal ?? total, discountTotal: body.discountTotal ?? 0,
      numItemsSold: numItemsSold || undefined, date: now,
    })

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return getOrderById(id)
}

async function updateOrderStatus(id, status) {
  const now = new Date()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute('UPDATE wc_orders SET status = ?, date_updated_gmt = ? WHERE id = ?', [status, now, id])
    const setClauses = ['status = ?']
    const params = [status]
    if (status === 'completed') { setClauses.push('date_completed = ?'); params.push(now) }
    if (status === 'processing' || status === 'completed') { setClauses.push('date_paid = COALESCE(date_paid, ?)'); params.push(now) }
    params.push(id)
    await conn.execute(`UPDATE wc_order_stats SET ${setClauses.join(', ')} WHERE order_id = ?`, params)
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
  return getOrderById(id)
}

async function bulkUpdateStatus(ids, status) {
  if (!ids?.length) return
  const now = new Date()
  const placeholders = ids.map(() => '?').join(',')
  await pool.execute(`UPDATE wc_orders SET status=?, date_updated_gmt=? WHERE id IN (${placeholders})`, [status, now, ...ids])
  await pool.execute(`UPDATE wc_order_stats SET status=? WHERE order_id IN (${placeholders})`, [status, ...ids])
}

async function addOrderNote(id, { author, note, customerNote = false }) {
  const payload = JSON.stringify({ author, note, dateCreated: new Date().toISOString(), customerNote })
  await pool.execute('INSERT INTO wc_orders_meta (order_id, meta_key, meta_value) VALUES (?, "_order_note", ?)', [id, payload])
  return getOrderById(id)
}

async function refundOrder(id) {
  return updateOrderStatus(id, 'refunded')
}

function buildStatsWhere({ dateFrom, dateTo, statuses, customerId } = {}) {
  const where = []
  const params = []
  if (statuses?.length) { where.push(`s.status IN (${statuses.map(() => '?').join(',')})`); params.push(...statuses) }
  if (dateFrom) { where.push('s.date_created >= ?'); params.push(new Date(dateFrom)) }
  if (dateTo) { where.push('s.date_created <= ?'); params.push(new Date(dateTo)) }
  if (customerId) { where.push('s.customer_id = ?'); params.push(customerId) }
  return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', params }
}

async function getOrderSummary({ dateFrom, dateTo, statuses } = {}) {
  const { whereSql, params } = buildStatsWhere({ dateFrom, dateTo, statuses })
  const [[row]] = await pool.query(
    `SELECT SUM(total_sales) AS total, COUNT(*) AS count, AVG(total_sales) AS avgOrder FROM wc_order_stats s ${whereSql}`,
    params
  )
  return { total: Number(row.total || 0), count: Number(row.count || 0), avgOrder: Number(row.avgOrder || 0) }
}

async function countOrders({ dateFrom, dateTo, statuses } = {}) {
  const { whereSql, params } = buildStatsWhere({ dateFrom, dateTo, statuses })
  const [[row]] = await pool.query(`SELECT COUNT(*) AS count FROM wc_order_stats s ${whereSql}`, params)
  return Number(row.count || 0)
}

async function getRevenueSeries({ dateFrom, dateTo, statuses, groupBy = 'day', limit = 90 } = {}) {
  const { whereSql, params } = buildStatsWhere({ dateFrom, dateTo, statuses })
  const format = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d'
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(s.date_created, ?) AS period, SUM(s.total_sales) AS revenue, COUNT(*) AS orders
     FROM wc_order_stats s ${whereSql}
     GROUP BY period ORDER BY period ASC LIMIT ?`,
    [format, ...params, limit]
  )
  return rows.map((r) => ({ _id: r.period, revenue: Number(r.revenue), orders: Number(r.orders) }))
}

async function getPendingOrdersBrief(limit = 5) {
  const [rows] = await pool.query(
    `SELECT id, total_amount, date_created_gmt FROM wc_orders WHERE status = 'pending' ORDER BY date_created_gmt DESC LIMIT ?`,
    [limit]
  )
  return rows.map((r) => ({ id: r.id, orderNumber: String(r.id).padStart(6, '0'), total: Number(r.total_amount), createdAt: r.date_created_gmt }))
}

module.exports = {
  createGuestOrder,
  createOrder,
  getOrderById,
  getOrders,
  getOrdersByCustomer,
  updateOrder,
  updateOrderStatus,
  bulkUpdateStatus,
  addOrderNote,
  refundOrder,
  getOrderSummary,
  countOrders,
  getRevenueSeries,
  getPendingOrdersBrief,
}
