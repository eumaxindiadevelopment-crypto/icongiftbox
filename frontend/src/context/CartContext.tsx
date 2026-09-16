import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-toastify'
import type { CategoryRef } from '../lib/seoUrl'

export type CartItem = {
  id: string | number
  slug?: string
  image: string
  title: string
  price: number
  quantity: number
  variationId?: string
  attributes?: Record<string, string>
  // Carried through so cart/checkout links can build the SEO product URL
  // (/category-slug/product-slug) instead of falling back to /product/:id.
  primaryCategory?: CategoryRef | null
}

const lineKey = (item: { id: string | number; variationId?: string }) => `${item.id}:${item.variationId ?? ''}`

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (id: string | number, variationId?: string) => void
  updateQuantity: (id: string | number, quantity: number, variationId?: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'cg_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => lineKey(i) === lineKey(item))
      if (existing) {
        return prev.map(i => lineKey(i) === lineKey(item) ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { ...item, quantity }]
    })
    toast.success('Added to cart!', {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: false,
      toastId: `cart-${lineKey(item)}`,
    })
  }

  const removeFromCart = (id: string | number, variationId?: string) => {
    setCartItems(prev => prev.filter(i => lineKey(i) !== lineKey({ id, variationId })))
    toast.info('Item removed from cart', { position: 'bottom-right', autoClose: 1500 })
  }

  const updateQuantity = (id: string | number, quantity: number, variationId?: string) => {
    if (quantity < 1) {
      setCartItems(prev => prev.filter(i => lineKey(i) !== lineKey({ id, variationId })))
      toast.info('Item removed from cart', { position: 'bottom-right', autoClose: 1500 })
      return
    }
    setCartItems(prev => prev.map(i => lineKey(i) === lineKey({ id, variationId }) ? { ...i, quantity } : i))
  }

  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
