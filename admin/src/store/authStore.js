import { create } from 'zustand'

const stored = () => {
  try {
    const u = localStorage.getItem('cg_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

export const useAuthStore = create(set => ({
  user: stored(),
  token: localStorage.getItem('cg_token') || null,

  login(user, token) {
    localStorage.setItem('cg_token', token)
    localStorage.setItem('cg_user', JSON.stringify(user))
    set({ user, token })
  },

  logout() {
    localStorage.removeItem('cg_token')
    localStorage.removeItem('cg_user')
    set({ user: null, token: null })
  },

  isAuthenticated() {
    return !!localStorage.getItem('cg_token')
  },
}))
