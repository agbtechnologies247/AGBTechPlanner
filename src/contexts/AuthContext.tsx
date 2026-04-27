import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@/lib/api'
import { api } from '@/lib/api'
import type { Profile } from '@/lib/database.types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = api.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        (async () => { await fetchProfile(session.user.id) })()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await api.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await api.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error }
  }

  async function signIn(email: string, password: string) {
    const { error } = await api.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await api.auth.signOut()
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return
    await api.from('profiles').update(updates as any).eq('id', user.id)
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
