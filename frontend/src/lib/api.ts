import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
})

export default api

export async function fetchProducts(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  const { data } = await api.get(`/products${query}`)
  return data
}

export async function fetchProduct(id: string) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export type ProductReview = {
  _id: string
  productId: number
  authorName: string
  rating: number
  title?: string
  comment: string
  status: 'pending' | 'approved' | 'spam'
  createdAt: string
}

export async function fetchProductReviews(productId: string | number) {
  const { data } = await api.get(`/reviews?productId=${productId}`)
  return data as ProductReview[]
}

export async function submitProductReview(payload: { productId: string | number; rating: number; title?: string; comment: string }) {
  const { data } = await api.post('/reviews', payload)
  return data as ProductReview
}

export type EnquiryPayload = {
  fullName: string
  phone: string
  email?: string
  city: string
  giftingFor: string
  budgetPerGift: string
  quantityRequired: string
  additionalInfo?: string
}

export async function submitEnquiry(payload: EnquiryPayload) {
  const { data } = await api.post('/enquiries', payload)
  return data
}

export type EnquirySettingsResponse = { enabled: boolean; delaySeconds: number }

export async function fetchEnquirySettings() {
  const { data } = await api.get('/enquiry-settings')
  return data as EnquirySettingsResponse
}

export async function fetchCategories() {
  const { data } = await api.get('/categories')
  return data
}

export async function fetchCategory(idOrSlug: string) {
  const { data } = await api.get(`/categories/${idOrSlug}`)
  return data as {
    _id: string; name: string; slug: string; description?: string
    parent?: { _id: string; name: string; slug: string } | null
  }
}

export async function fetchProductTags() {
  const { data } = await api.get('/products/meta/tags')
  return data as { name: string; count: number }[]
}

export async function fetchPriceRange() {
  const { data } = await api.get('/products/meta/price-range')
  return data as { min: number; max: number }
}

export async function fetchProductAttributes() {
  const { data } = await api.get('/products/meta/attributes')
  return data as { name: string; options: string[] }[]
}

// Brands actually assigned to products, optionally scoped to a category slug —
// keeps the sidebar's brand checkboxes limited to brands that exist within
// whatever's being browsed instead of listing every brand in the store.
export async function fetchProductBrands(categorySlug?: string | null) {
  const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ''
  const { data } = await api.get(`/products/meta/brands${query}`)
  return data as { _id: string; name: string; slug: string; count: number }[]
}

export type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  billingAddress?: OrderAddress | null
  shippingAddress?: OrderAddress | null
  totalOrders?: number
  totalSpent?: number
}

export type CustomerAuthResponse = { token: string; customer: Customer }

export async function registerCustomer(payload: { firstName: string; lastName: string; email: string; password: string; phone?: string }) {
  const { data } = await api.post('/customers/register', payload)
  return data as CustomerAuthResponse
}

export async function loginCustomer(payload: { email: string; password: string }) {
  const { data } = await api.post('/customers/login', payload)
  return data as CustomerAuthResponse
}

export async function fetchCurrentCustomer() {
  const { data } = await api.get('/customers/me')
  return data as Customer
}

export async function updateMyProfile(payload: Partial<Pick<Customer, 'firstName' | 'lastName' | 'phone' | 'billingAddress' | 'shippingAddress'>>) {
  const { data } = await api.put('/customers/me', payload)
  return data as Customer
}

export type OrderAddress = {
  firstName?: string; lastName?: string; company?: string; address1?: string; address2?: string
  city?: string; state?: string; postcode?: string; country?: string; email?: string; phone?: string
}

export type OrderLineItem = {
  _id: string; productId: number | null; name: string; quantity: number; price: number; total: number; subtotal: number
}

export type OrderNote = { author?: string; note: string; dateCreated: string; customerNote: boolean }

export type Order = {
  _id: string
  orderNumber: string
  status: string
  currency: string
  total: number
  subtotal: number
  tax: number
  shippingTotal: number
  discountTotal: number
  paymentMethod?: string
  paymentMethodTitle?: string
  isPaid: boolean
  billingAddress: OrderAddress | null
  shippingAddress: OrderAddress | null
  createdAt: string
  lineItems: OrderLineItem[]
  orderNotes: OrderNote[]
}

export async function fetchMyOrders() {
  const { data } = await api.get('/customers/me/orders')
  return (Array.isArray(data) ? data : [data]) as Order[]
}

export async function fetchMyOrder(id: string) {
  const { data } = await api.get(`/customers/me/orders/${id}`)
  return data as Order
}
