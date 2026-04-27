import { createContext, useContext, useReducer, useCallback } from 'react'
import type { Plan, Bucket, Task, TaskLabel, Profile } from '@/lib/database.types'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'

interface PlannerState {
  plans: Plan[]
  currentPlan: Plan | null
  buckets: Bucket[]
  tasks: Task[]
  labels: TaskLabel[]
  members: Profile[]
  loading: boolean
  totalTasks: number
  currentPage: number
  pageSize: number
}

type Action =
  | { type: 'SET_PLANS'; plans: Plan[] }
  | { type: 'SET_CURRENT_PLAN'; plan: Plan | null }
  | { type: 'SET_BUCKETS'; buckets: Bucket[] }
  | { type: 'SET_TASKS'; tasks: Task[]; total?: number }
  | { type: 'SET_LABELS'; labels: TaskLabel[] }
  | { type: 'SET_MEMBERS'; members: Profile[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'ADD_PLAN'; plan: Plan }
  | { type: 'UPDATE_PLAN'; plan: Plan }
  | { type: 'DELETE_PLAN'; id: string }
  | { type: 'ADD_BUCKET'; bucket: Bucket }
  | { type: 'UPDATE_BUCKET'; bucket: Bucket }
  | { type: 'DELETE_BUCKET'; id: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }

function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case 'SET_PLANS': return { ...state, plans: action.plans }
    case 'SET_CURRENT_PLAN': return { ...state, currentPlan: action.plan }
    case 'SET_BUCKETS': return { ...state, buckets: action.buckets }
    case 'SET_TASKS': return { ...state, tasks: action.tasks, totalTasks: action.total ?? action.tasks.length }
    case 'SET_LABELS': return { ...state, labels: action.labels }
    case 'SET_MEMBERS': return { ...state, members: action.members }
    case 'SET_LOADING': return { ...state, loading: action.loading }
    case 'SET_PAGE': return { ...state, currentPage: action.page }
    case 'ADD_PLAN': return { ...state, plans: [...state.plans, action.plan] }
    case 'UPDATE_PLAN': return { ...state, plans: state.plans.map(p => p.id === action.plan.id ? action.plan : p), currentPlan: state.currentPlan?.id === action.plan.id ? action.plan : state.currentPlan }
    case 'DELETE_PLAN': return { ...state, plans: state.plans.filter(p => p.id !== action.id) }
    case 'ADD_BUCKET': return { ...state, buckets: [...state.buckets, action.bucket] }
    case 'UPDATE_BUCKET': return { ...state, buckets: state.buckets.map(b => b.id === action.bucket.id ? action.bucket : b) }
    case 'DELETE_BUCKET': return { ...state, buckets: state.buckets.filter(b => b.id !== action.id) }
    case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.task] }
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) }
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }
    default: return state
  }
}

const initialState: PlannerState = {
  plans: [], currentPlan: null, buckets: [], tasks: [], labels: [], members: [], loading: false, totalTasks: 0, currentPage: 1, pageSize: 20,
}

interface PlannerContextValue extends PlannerState {
  loadPlans: () => Promise<void>
  loadPlanData: (planId: string, options?: { page?: number; filter?: any; sort?: any }) => Promise<void>
  createPlan: (data: { title: string; description: string; color: string }) => Promise<Plan | null>
  updatePlan: (id: string, data: Partial<Plan>) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  createBucket: (data: { plan_id: string; title: string; color: string }) => Promise<Bucket | null>
  updateBucket: (id: string, data: Partial<Bucket>) => Promise<void>
  deleteBucket: (id: string) => Promise<void>
  createTask: (data: Partial<Task>) => Promise<Task | null>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  createLabel: (data: { plan_id: string; name: string; color: string }) => Promise<TaskLabel | null>
  exportPlan: (planId: string) => Promise<void>
  loadMembers: (planId: string) => Promise<void>
}

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined)

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  const loadPlans = useCallback(async () => {
    if (!user) return
    dispatch({ type: 'SET_LOADING', loading: true })
    const { data } = await api.from('plans').select('*').order('created_at', { ascending: false })
    dispatch({ type: 'SET_PLANS', plans: data ?? [] })
    dispatch({ type: 'SET_LOADING', loading: false })
  }, [user])

  const loadMembers = useCallback(async (planId: string) => {
    const { data } = await api
      .from('plan_members')
      .select('profile:profiles(*)')
      .eq('plan_id', planId)
    const members = (data ?? []).map((m: any) => (Array.isArray(m.profile) ? m.profile[0] : m.profile)).filter(Boolean) as Profile[]
    dispatch({ type: 'SET_MEMBERS', members })
  }, [])

  const loadPlanData = useCallback(async (planId: string, options?: { page?: number; filter?: any; sort?: any }) => {
    dispatch({ type: 'SET_LOADING', loading: true })
    const page = options?.page ?? 1
    const from = (page - 1) * state.pageSize
    const to = from + state.pageSize - 1

    let query = api
      .from('tasks')
      .select('*, assignee:assigned_to(id,full_name,avatar_url), labels:task_label_assignments(label:task_labels(*)), checklists:task_checklists(*), comments:task_comments(*, user:profiles(*))', { count: 'exact' })
      .eq('plan_id', planId)

    if (options?.filter?.status) query = query.eq('status', options.filter.status)
    if (options?.filter?.priority) query = query.eq('priority', options.filter.priority)
    
    if (options?.sort) {
      query = query.order(options.sort.column, { ascending: options.sort.ascending })
    } else {
      query = query.order('order_index', { ascending: true })
    }

    const [planRes, bucketsRes, tasksRes, labelsRes] = await Promise.all([
      api.from('plans').select('*').eq('id', planId).maybeSingle(),
      api.from('buckets').select('*').eq('plan_id', planId).order('order_index'),
      query.range(from, to),
      api.from('task_labels').select('*').eq('plan_id', planId),
    ])

    const tasks = (tasksRes.data ?? []).map((t: any) => ({
      ...t,
      labels: t.labels?.map((la: any) => la.label).filter(Boolean) ?? [],
    })) as Task[]

    dispatch({ type: 'SET_CURRENT_PLAN', plan: planRes.data ?? null })
    dispatch({ type: 'SET_BUCKETS', buckets: bucketsRes.data ?? [] })
    dispatch({ type: 'SET_TASKS', tasks, total: tasksRes.count ?? 0 })
    dispatch({ type: 'SET_LABELS', labels: labelsRes.data ?? [] })
    dispatch({ type: 'SET_PAGE', page })
    dispatch({ type: 'SET_LOADING', loading: false })
  }, [state.pageSize])

  const createPlan = useCallback(async (data: { title: string; description: string; color: string }) => {
    if (!user) return null
    const { data: plan } = await api.from('plans').insert({ ...data, owner_id: user.id } as any).select().maybeSingle()
    if (plan) dispatch({ type: 'ADD_PLAN', plan })
    return plan
  }, [user])

  const updatePlan = useCallback(async (id: string, data: Partial<Plan>) => {
    const { data: plan } = await api.from('plans').update(data as any).eq('id', id).select().maybeSingle()
    if (plan) dispatch({ type: 'UPDATE_PLAN', plan })
  }, [])

  const deletePlan = useCallback(async (id: string) => {
    await api.from('plans').delete().eq('id', id)
    dispatch({ type: 'DELETE_PLAN', id })
  }, [])

  const createBucket = useCallback(async (data: { plan_id: string; title: string; color: string }) => {
    const order = state.buckets.filter(b => b.plan_id === data.plan_id).length
    const { data: bucket } = await api.from('buckets').insert({ ...data, order_index: order } as any).select().maybeSingle()
    if (bucket) dispatch({ type: 'ADD_BUCKET', bucket })
    return bucket
  }, [state.buckets])

  const updateBucket = useCallback(async (id: string, data: Partial<Bucket>) => {
    const { data: bucket } = await api.from('buckets').update(data as any).eq('id', id).select().maybeSingle()
    if (bucket) dispatch({ type: 'UPDATE_BUCKET', bucket })
  }, [])

  const deleteBucket = useCallback(async (id: string) => {
    await api.from('buckets').delete().eq('id', id)
    dispatch({ type: 'DELETE_BUCKET', id })
  }, [])

  const createTask = useCallback(async (data: Partial<Task>) => {
    if (!user) return null
    const order = state.tasks.filter(t => t.bucket_id === data.bucket_id).length
    const { data: task } = await api.from('tasks').insert({ ...data, created_by: user.id, order_index: order } as any).select('*, assignee:assigned_to(id,full_name,avatar_url)').maybeSingle()
    if (task) dispatch({ type: 'ADD_TASK', task: task as Task })
    return task as Task | null
  }, [user, state.tasks])

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const { data: task } = await api.from('tasks').update(data as any).eq('id', id).select('*, assignee:assigned_to(id,full_name,avatar_url), checklists:task_checklists(*), labels:task_label_assignments(label:task_labels(*))').maybeSingle()
    if (task) {
      const existing = state.tasks.find(t => t.id === id)
      dispatch({ type: 'UPDATE_TASK', task: { ...(existing ?? {}), ...task } as Task })
    }
  }, [state.tasks])

  const deleteTask = useCallback(async (id: string) => {
    await api.from('tasks').delete().eq('id', id)
    dispatch({ type: 'DELETE_TASK', id })
  }, [])

  const createLabel = useCallback(async (data: { plan_id: string; name: string; color: string }) => {
    const { data: label } = await api.from('task_labels').insert(data as any).select().maybeSingle()
    if (label) dispatch({ type: 'SET_LABELS', labels: [...state.labels, label] })
    return label
  }, [state.labels])

  const exportPlan = useCallback(async (planId: string) => {
    const { data: tasks } = await api.from('tasks').select('*, bucket:buckets(title)').eq('plan_id', planId)
    if (!tasks) return
    
    const csvRows = [
      ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Bucket'].join(','),
      ...tasks.map((t: any) => [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.priority,
        t.status,
        t.due_date || '',
        `"${(t.bucket as any)?.title || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvRows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plan_export_${planId}.csv`
    a.click()
  }, [])

  return (
    <PlannerContext.Provider value={{
      ...state,
      loadPlans, loadPlanData, createPlan, updatePlan, deletePlan,
      createBucket, updateBucket, deleteBucket,
      createTask, updateTask, deleteTask, createLabel, exportPlan, loadMembers
    }}>
      {children}
    </PlannerContext.Provider>
  )
}

export function usePlanner() {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider')
  return ctx
}
