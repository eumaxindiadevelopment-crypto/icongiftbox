// Mock data for development — replace with real API calls

export const dashboardStats = {
  totalRevenue: 124580.50,
  totalOrders: 1847,
  totalCustomers: 932,
  avgOrderValue: 67.45,
  revenueChange: 12.5,
  ordersChange: 8.2,
  customersChange: 15.3,
  avgOrderChange: -2.1,
}

export const revenueData = [
  { date: 'Jan', revenue: 8200, orders: 124 },
  { date: 'Feb', revenue: 9100, orders: 138 },
  { date: 'Mar', revenue: 11400, orders: 162 },
  { date: 'Apr', revenue: 10300, orders: 148 },
  { date: 'May', revenue: 12800, orders: 183 },
  { date: 'Jun', revenue: 14200, orders: 201 },
  { date: 'Jul', revenue: 13100, orders: 188 },
  { date: 'Aug', revenue: 15600, orders: 224 },
  { date: 'Sep', revenue: 14900, orders: 213 },
  { date: 'Oct', revenue: 16800, orders: 241 },
  { date: 'Nov', revenue: 18200, orders: 261 },
  { date: 'Dec', revenue: 21480, orders: 307 },
]

export const topProducts = [
  { id: 1, name: 'Executive Gift Hamper', sku: 'EGH-001', sales: 234, revenue: 23400, stock: 45 },
  { id: 2, name: 'Premium Pen Set', sku: 'PPS-002', sales: 198, revenue: 9900, stock: 120 },
  { id: 3, name: 'Corporate Diary 2026', sku: 'CD-2026', sales: 187, revenue: 5610, stock: 0 },
  { id: 4, name: 'Leather Business Card Holder', sku: 'LBC-003', sales: 165, revenue: 8250, stock: 78 },
  { id: 5, name: 'Crystal Trophy Award', sku: 'CTA-004', sales: 143, revenue: 14300, stock: 22 },
]

export const recentOrders = [
  { id: '#ORD-2401', customer: 'Rahul Sharma', date: '2026-06-10', status: 'completed', total: 2450.00, items: 3 },
  { id: '#ORD-2400', customer: 'Priya Patel', date: '2026-06-10', status: 'processing', total: 1200.00, items: 2 },
  { id: '#ORD-2399', customer: 'Amit Kumar', date: '2026-06-09', status: 'pending', total: 5600.00, items: 5 },
  { id: '#ORD-2398', customer: 'Sunita Singh', date: '2026-06-09', status: 'completed', total: 890.00, items: 1 },
  { id: '#ORD-2397', customer: 'Vikram Mehta', date: '2026-06-08', status: 'cancelled', total: 3200.00, items: 4 },
  { id: '#ORD-2396', customer: 'Deepa Nair', date: '2026-06-08', status: 'refunded', total: 750.00, items: 1 },
]

export const products = [
  { id: 1, name: 'Executive Gift Hamper', sku: 'EGH-001', price: 1999, salePrice: 1799, stock: 45, status: 'publish', category: 'Gift Sets', image: null, inStock: true },
  { id: 2, name: 'Premium Pen Set', sku: 'PPS-002', price: 599, salePrice: null, stock: 120, status: 'publish', category: 'Stationery', image: null, inStock: true },
  { id: 3, name: 'Corporate Diary 2026', sku: 'CD-2026', price: 349, salePrice: 299, stock: 0, status: 'publish', category: 'Stationery', image: null, inStock: false },
  { id: 4, name: 'Leather Business Card Holder', sku: 'LBC-003', price: 699, salePrice: null, stock: 78, status: 'publish', category: 'Accessories', image: null, inStock: true },
  { id: 5, name: 'Crystal Trophy Award', sku: 'CTA-004', price: 1299, salePrice: null, stock: 22, status: 'publish', category: 'Awards', image: null, inStock: true },
  { id: 6, name: 'Customized Mug Set', sku: 'CMS-005', price: 499, salePrice: 449, stock: 200, status: 'publish', category: 'Drinkware', image: null, inStock: true },
  { id: 7, name: 'USB Power Bank 10000mAh', sku: 'USB-006', price: 1499, salePrice: null, stock: 0, status: 'draft', category: 'Electronics', image: null, inStock: false },
  { id: 8, name: 'Bluetooth Speaker', sku: 'BS-007', price: 2499, salePrice: 2199, stock: 15, status: 'publish', category: 'Electronics', image: null, inStock: true },
  { id: 9, name: 'Engraved Cufflinks', sku: 'EC-008', price: 899, salePrice: null, stock: 60, status: 'publish', category: 'Accessories', image: null, inStock: true },
  { id: 10, name: 'Bamboo Desk Organizer', sku: 'BDO-009', price: 1199, salePrice: 999, stock: 35, status: 'publish', category: 'Office', image: null, inStock: true },
]

export const orders = [
  { id: '#ORD-2401', customer: 'Rahul Sharma', email: 'rahul@acme.com', date: '2026-06-10', status: 'completed', total: 2450.00, paymentMethod: 'Credit Card', items: 3 },
  { id: '#ORD-2400', customer: 'Priya Patel', email: 'priya@corp.com', date: '2026-06-10', status: 'processing', total: 1200.00, paymentMethod: 'UPI', items: 2 },
  { id: '#ORD-2399', customer: 'Amit Kumar', email: 'amit@biz.com', date: '2026-06-09', status: 'pending', total: 5600.00, paymentMethod: 'Net Banking', items: 5 },
  { id: '#ORD-2398', customer: 'Sunita Singh', email: 'sunita@ltd.com', date: '2026-06-09', status: 'completed', total: 890.00, paymentMethod: 'Credit Card', items: 1 },
  { id: '#ORD-2397', customer: 'Vikram Mehta', email: 'vikram@tech.com', date: '2026-06-08', status: 'cancelled', total: 3200.00, paymentMethod: 'Debit Card', items: 4 },
  { id: '#ORD-2396', customer: 'Deepa Nair', email: 'deepa@co.com', date: '2026-06-08', status: 'refunded', total: 750.00, paymentMethod: 'UPI', items: 1 },
  { id: '#ORD-2395', customer: 'Suresh Joshi', email: 'suresh@in.com', date: '2026-06-07', status: 'processing', total: 4100.00, paymentMethod: 'Credit Card', items: 6 },
  { id: '#ORD-2394', customer: 'Meena Iyer', email: 'meena@org.com', date: '2026-06-07', status: 'on-hold', total: 1800.00, paymentMethod: 'Net Banking', items: 2 },
  { id: '#ORD-2393', customer: 'Raj Kapoor', email: 'raj@pvt.com', date: '2026-06-06', status: 'completed', total: 6500.00, paymentMethod: 'Credit Card', items: 8 },
  { id: '#ORD-2392', customer: 'Anjali Gupta', email: 'anjali@services.com', date: '2026-06-06', status: 'completed', total: 2200.00, paymentMethod: 'UPI', items: 3 },
]

export const customers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@acme.com', phone: '+91 98765 43210', totalOrders: 12, totalSpent: 28400, lastOrder: '2026-06-10', status: 'active', company: 'Acme Corp' },
  { id: 2, name: 'Priya Patel', email: 'priya@corp.com', phone: '+91 87654 32109', totalOrders: 8, totalSpent: 15200, lastOrder: '2026-06-10', status: 'active', company: 'Corp Ltd' },
  { id: 3, name: 'Amit Kumar', email: 'amit@biz.com', phone: '+91 76543 21098', totalOrders: 24, totalSpent: 67800, lastOrder: '2026-06-09', status: 'active', company: 'Biz Solutions' },
  { id: 4, name: 'Sunita Singh', email: 'sunita@ltd.com', phone: '+91 65432 10987', totalOrders: 5, totalSpent: 8900, lastOrder: '2026-06-09', status: 'active', company: 'Singh Ltd' },
  { id: 5, name: 'Vikram Mehta', email: 'vikram@tech.com', phone: '+91 54321 09876', totalOrders: 3, totalSpent: 6400, lastOrder: '2026-06-08', status: 'inactive', company: 'Tech Ventures' },
  { id: 6, name: 'Deepa Nair', email: 'deepa@co.com', phone: '+91 43210 98765', totalOrders: 7, totalSpent: 12100, lastOrder: '2026-06-08', status: 'active', company: 'Nair & Co' },
  { id: 7, name: 'Suresh Joshi', email: 'suresh@in.com', phone: '+91 32109 87654', totalOrders: 15, totalSpent: 34500, lastOrder: '2026-06-07', status: 'active', company: 'Joshi Industries' },
  { id: 8, name: 'Meena Iyer', email: 'meena@org.com', phone: '+91 21098 76543', totalOrders: 6, totalSpent: 9800, lastOrder: '2026-06-07', status: 'active', company: 'Iyer Org' },
]

export const coupons = [
  { id: 1, code: 'CORP10', type: 'percent', amount: 10, usageCount: 145, usageLimit: 500, expiryDate: '2026-12-31', status: 'active' },
  { id: 2, code: 'WELCOME500', type: 'fixed_cart', amount: 500, usageCount: 89, usageLimit: 200, expiryDate: '2026-09-30', status: 'active' },
  { id: 3, code: 'BULK20', type: 'percent', amount: 20, usageCount: 34, usageLimit: 100, expiryDate: '2026-07-31', status: 'active' },
  { id: 4, code: 'FREESHIP', type: 'free_shipping', amount: 0, usageCount: 210, usageLimit: null, expiryDate: '2026-12-31', status: 'active' },
  { id: 5, code: 'SUMMER25', type: 'percent', amount: 25, usageCount: 56, usageLimit: 150, expiryDate: '2026-06-30', status: 'expired' },
]

export const categoryData = [
  { name: 'Gift Sets', value: 35, fill: '#2563eb' },
  { name: 'Electronics', value: 22, fill: '#10b981' },
  { name: 'Stationery', value: 18, fill: '#f59e0b' },
  { name: 'Accessories', value: 15, fill: '#8b5cf6' },
  { name: 'Awards', value: 10, fill: '#ef4444' },
]

export const stockAlerts = [
  { id: 3, name: 'Corporate Diary 2026', sku: 'CD-2026', stock: 0, status: 'outofstock' },
  { id: 7, name: 'USB Power Bank 10000mAh', sku: 'USB-006', stock: 0, status: 'outofstock' },
  { id: 5, name: 'Crystal Trophy Award', sku: 'CTA-004', stock: 22, status: 'lowstock' },
  { id: 8, name: 'Bluetooth Speaker', sku: 'BS-007', stock: 15, status: 'lowstock' },
]
