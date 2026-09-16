import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-toastify'
import api, { Customer, loginCustomer, registerCustomer, fetchCurrentCustomer } from '../lib/api'

type RegisterPayload = { firstName: string; lastName: string; email: string; password: string; phone?: string }
type LoginPayload = { email: string; password: string }

type CustomerAuthContextType = {
  customer: Customer | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (payload: RegisterPayload) => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null)

const TOKEN_KEY = 'cg_customer_token'

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(!!token)

  useEffect(() => {
    if (!token) {
      delete api.defaults.headers.common['Authorization']
      setCustomer(null)
      setIsLoading(false)
      return
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    fetchCurrentCustomer()
      .then(setCustomer)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const register = async (payload: RegisterPayload) => {
    const { token: newToken, customer: newCustomer } = await registerCustomer(payload)
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setCustomer(newCustomer)
    toast.success(`Welcome, ${newCustomer.firstName}!`, { position: 'bottom-right', autoClose: 2000 })
  }

  const login = async (payload: LoginPayload) => {
    const { token: newToken, customer: newCustomer } = await loginCustomer(payload)
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setCustomer(newCustomer)
    toast.success(`Welcome back, ${newCustomer.firstName}!`, { position: 'bottom-right', autoClose: 2000 })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    toast.info('Logged out', { position: 'bottom-right', autoClose: 1500 })
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, isAuthenticated: !!customer, isLoading, register, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
