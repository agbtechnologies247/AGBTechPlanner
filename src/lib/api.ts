// Custom API client for local Postgres migration (Previously Supabase)
const API_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3000'

export interface User {
  id: string
  email: string
  user_metadata?: any
}

export interface Session {
  access_token: string
  user: User
}

// ─── Fetch with retry + timeout ────────────────────────────────────────────
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  timeout = 10000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(id)
      return res
    } catch (err) {
      clearTimeout(id)
      if (i === retries - 1) throw err
      console.warn(`[API] Retry ${i + 1}/${retries} for ${url}`)
      await new Promise(r => setTimeout(r, 500 * Math.pow(2, i)))
    }
  }
  throw new Error('Fetch failed after retries')
}

// ─── ApiClient ─────────────────────────────────────────────────────────────
class ApiClient {
  // Must be declared as a class field so arrow-function methods in `auth` can access it via `this`
  private authCallbacks: Array<(event: string, session: any) => void> = []

  auth = {
    getSession: async () => {
      const session = localStorage.getItem('agb_session')
      return { data: { session: session ? JSON.parse(session) : null }, error: null }
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log(`[API] Attempting sign-in for ${email}`)
      try {
        const res = await fetchWithRetry(`${API_URL}/auth/v1/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const { data, error } = await res.json()
        if (data?.session) {
          localStorage.setItem('agb_session', JSON.stringify(data.session))
          this.notifyCallbacks('SIGNED_IN', data.session)
        }
        return { data, error: error ? { message: error } : null }
      } catch (err: any) {
        return { data: null, error: { message: err.message } }
      }
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const res = await fetchWithRetry(`${API_URL}/auth/v1/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, data: options?.data }),
        })
        const body = await res.json()
        if (body.data?.session) {
          localStorage.setItem('agb_session', JSON.stringify(body.data.session))
          this.notifyCallbacks('SIGNED_UP', body.data.session)
        }
        return body
      } catch (err: any) {
        return { data: null, error: err.message }
      }
    },

    signOut: async () => {
      localStorage.removeItem('agb_session')
      this.notifyCallbacks('SIGNED_OUT', null)
      return { error: null }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.authCallbacks.push(callback)
      this.auth.getSession().then(({ data: { session } }) => {
        callback('INITIAL_SESSION', session)
      })
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.authCallbacks = this.authCallbacks.filter(c => c !== callback)
            },
          },
        },
      }
    },
  }

  private notifyCallbacks(event: string, session: any) {
    this.authCallbacks.forEach(cb => cb(event, session))
  }

  from(table: string) {
    return new QueryBuilder(table)
  }
}

// ─── QueryBuilder ──────────────────────────────────────────────────────────
class QueryBuilder {
  private table: string
  private filters: Record<string, string> = {}
  private orderBy = ''
  private selectQuery = '*'
  private method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET'
  private body: any = null

  constructor(table: string) {
    this.table = table
  }

  select(query = '*', _options: any = {}) {
    this.selectQuery = query
    return this
  }

  eq(col: string, val: any) {
    this.filters[col] = `eq.${val}`
    return this
  }

  or(filters: string) {
    this.filters['or'] = `(${filters})`
    return this
  }

  in(col: string, vals: any[]) {
    this.filters[col] = `in.(${vals.join(',')})`
    return this
  }

  is(col: string, val: any) {
    this.filters[col] = `is.${val}`
    return this
  }

  order(col: string, options: { ascending?: boolean } = {}) {
    this.orderBy = `${col}.${options.ascending ? 'asc' : 'desc'}`
    return this
  }

  range(_from: number, _to: number) {
    return this
  }

  maybeSingle() {
    return this.then((res: any) => ({
      data: Array.isArray(res.data) ? (res.data[0] ?? null) : res.data,
      error: res.error,
    }))
  }

  insert(data: any) {
    this.method = 'POST'
    this.body = data
    return this
  }

  update(data: any) {
    this.method = 'PATCH'
    this.body = data
    return this
  }

  delete() {
    this.method = 'DELETE'
    return this
  }

  private getHeaders(): Record<string, string> {
    const sessionStr = localStorage.getItem('agb_session')
    const session = sessionStr ? JSON.parse(sessionStr) : {}
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token || ''}`,
    }
  }

  async then(resolve: (result: { data: any; error: any; count?: number }) => any) {
    try {
      const params = new URLSearchParams(this.filters)
      if (this.orderBy) params.append('order', this.orderBy)
      if (this.selectQuery) params.append('select', this.selectQuery)

      const url = `${API_URL}/rest/v1/${this.table}?${params.toString()}`
      console.log(`[API] ${this.method} ${url}`, this.body || '')

      const res = await fetchWithRetry(url, {
        method: this.method,
        headers: this.getHeaders(),
        body: this.body ? JSON.stringify(this.body) : undefined,
      })

      if (this.method === 'DELETE' && res.status === 204) {
        return resolve({ data: null, error: null })
      }

      const data = await res.json()
      
      if (!res.ok) {
        return resolve({ data: null, error: data.error || 'API Error', count: 0 })
      }

      return resolve({ data, error: null, count: Array.isArray(data) ? data.length : 0 })
    } catch (err: any) {
      console.error(`[API] Error in ${this.table}:`, err)
      return resolve({ data: null, error: err.message })
    }
  }
}

// ─── Singleton export ──────────────────────────────────────────────────────
export const api = new ApiClient() as any
