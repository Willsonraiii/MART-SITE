import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchMe, loginRequest, logoutRequest, registerRequest, updateProfileRequest } from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const pendingEvent = useRef('restore')
  const boot = useRef(0)

  const consumeAuthEvent = useCallback(() => {
    const event = pendingEvent.current
    pendingEvent.current = 'restore'
    return event
  }, [])

  const refresh = useCallback(async () => {
    const id = ++boot.current
    try {
      const data = await fetchMe()
      if (id !== boot.current) return
      setUser(data?.user || null)
    } catch {
      if (id !== boot.current) return
      setUser(null)
    } finally {
      if (id === boot.current) setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (body) => {
    const data = await loginRequest(body)
    boot.current += 1
    pendingEvent.current = 'login'
    setUser(data.user)
    setReady(true)
    return data.user
  }, [])

  const register = useCallback(async (body) => {
    const data = await registerRequest(body)
    boot.current += 1
    pendingEvent.current = 'login'
    setUser(data.user)
    setReady(true)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    boot.current += 1
    try {
      await logoutRequest()
    } catch {
      /* still clear locally */
    }
    pendingEvent.current = 'logout'
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (body) => {
    const data = await updateProfileRequest(body)
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({ user, ready, login, register, logout, updateProfile, refresh, consumeAuthEvent }),
    [user, ready, login, register, logout, updateProfile, refresh, consumeAuthEvent],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
