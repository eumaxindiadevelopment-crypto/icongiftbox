// Plain mysql2/promise connection pool, independent of the Sequelize connection
// in ./database.js. Used exclusively by the WooCommerce-HPOS-style orders
// subsystem (src/db/ordersRepository.js), which is deliberately ORM-free —
// hand-written SQL / prepared statements only, per the wc_orders schema.
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corporate-gifts',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
})

module.exports = pool
