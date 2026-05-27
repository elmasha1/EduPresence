import { createContext, useContext, useEffect, useState } from 'react'
import api, { clearToken, getToken, setToken } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/me')
      .then(({ data }) => setUser(data.data ?? data))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const { data } = await api.post('/login', credentials)
    setToken(data.token)
    setUser(data.user.data ?? data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await api.post('/register', payload)
    setToken(data.token)
    setUser(data.user.data ?? data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {
      // ignore — we want to clear local state regardless
    }
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
