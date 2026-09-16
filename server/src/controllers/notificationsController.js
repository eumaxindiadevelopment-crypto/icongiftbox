const { Op } = require('sequelize')
const { Product } = require('../models')
const ordersRepo = require('../db/ordersRepository')

const LOW_STOCK_THRESHOLD = 25

async function list(req, res, next) {
  try {
    const [pendingOrders, lowStock, outOfStock] = await Promise.all([
      ordersRepo.getPendingOrdersBrief(5),
      Product.findAll({ where: { stockQuantity: { [Op.gt]: 0, [Op.lt]: LOW_STOCK_THRESHOLD } }, order: [['updatedAt', 'DESC']], limit: 5, attributes: ['id', 'name', 'stockQuantity', 'updatedAt'] }),
      Product.findAll({ where: { [Op.or]: [{ stockStatus: 'outofstock' }, { stockQuantity: 0 }] }, order: [['updatedAt', 'DESC']], limit: 5, attributes: ['id', 'name', 'updatedAt'] }),
    ])

    const notifications = [
      ...pendingOrders.map(o => ({
        id: `order-${o.id}`,
        type: 'order',
        text: `New order ${o.orderNumber || '#' + String(o.id).padStart(6, '0')} pending`,
        date: o.createdAt,
        unread: true,
        link: `/orders/${o.id}`,
      })),
      ...lowStock.map(p => ({
        id: `low-${p.id}`,
        type: 'low-stock',
        text: `${p.name} — Low stock (${p.stockQuantity} units)`,
        date: p.updatedAt,
        unread: true,
        link: '/inventory',
      })),
      ...outOfStock.map(p => ({
        id: `out-${p.id}`,
        type: 'out-of-stock',
        text: `${p.name} — Out of stock`,
        date: p.updatedAt,
        unread: true,
        link: '/inventory',
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)

    res.json({
      notifications,
      unreadCount: notifications.filter(n => n.unread).length,
    })
  } catch (err) { next(err) }
}

module.exports = { list }
