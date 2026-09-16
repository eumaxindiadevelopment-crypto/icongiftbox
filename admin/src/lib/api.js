import axios from 'axios'

export const SERVER_URL = 'http://localhost:5000'
export const FRONTEND_URL = 'http://localhost:5173'

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  withCredentials: true,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('cg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const isLoginRequest = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('cg_token')
      localStorage.removeItem('cg_user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api
