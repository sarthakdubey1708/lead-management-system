import { useCallback, useEffect, useRef, useState } from 'react'
import { apiRequest } from '../api/client.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const generation = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    apiRequest('/auth/me', { signal: controller.signal }).then(
      ({ data }) => {
        if (!controller.signal.aborted) setSession({ user: data.user })
      },
      (error) => {
        if (!controller.signal.aborted) {
          setSession(error.status === 401 ? { user: null } : { error: error.message })
        }
      },
    )
    return () => controller.abort()
  }, [attempt])

  const request = useCallback(async (path, options) => {
    const currentGeneration = generation.current
    try {
      return await apiRequest(path, options)
    } catch (error) {
      if (error.status === 401 && currentGeneration === generation.current) {
        generation.current += 1
        setSession({ user: null })
      }
      throw error
    }
  }, [])

  async function login(credentials) {
    const { data } = await apiRequest('/auth/login', { method: 'POST', body: credentials })
    generation.current += 1
    setSession({ user: data.user })
  }

  async function logout() {
    await request('/auth/logout', { method: 'POST' })
    generation.current += 1
    setSession({ user: null })
  }

  function retry() {
    setSession(null)
    setAttempt((value) => value + 1)
  }

  return (
    <AuthContext.Provider value={{ session, request, login, logout, retry }}>
      {children}
    </AuthContext.Provider>
  )
}
