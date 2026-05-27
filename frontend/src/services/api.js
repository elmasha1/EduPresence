import axios from 'axios'
import toast from 'react-hot-toast'

const TOKEN_KEY = 'edupresence_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    // 401 → token invalid: drop it and bounce to /login
    if (status === 401 && getToken()) {
      clearToken()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }

    // Surface server errors that aren't form validation (422 handled per-form)
    if (status && status !== 422 && status !== 401 && message) {
      toast.error(message)
    } else if (!error.response) {
      toast.error('Impossible de joindre le serveur.')
    }

    return Promise.reject(error)
  }
)

export default api
