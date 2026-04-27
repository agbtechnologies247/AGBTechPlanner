import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Task } from '@/lib/database.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SquareCheck as CheckSquare, Search, Calendar, Flag } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'text-destructive bg-destructive/10 border-destructive/30' },
  high: { label: 'High', color: 'text-amber-600 bg-amber-50 border-amber-300 dark:text-amber-400 dark:bg-amber-950/30' },
  medium: { label: 'Medium', color: 'text-blue-600 bg-blue-50 border-blue-300 dark:text-blue-400 dark:bg-blue-950/30' },
  low: { label: 'Low', color: '' },
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed', deferred: 'Deferred',
}

export function MyTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  useEffect(() => {
    async function loadTasks() {
      if (!user) return
      setLoading(true)
      const { data } = await api
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false })
      setTasks(data ?? [])
      setLoading(false)
    }
    loadTasks()
  }, [user])

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'completed' ? 'not_started' : 'completed'
    await api.from('tasks').update({ status: newStatus } as any).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    if (newStatus === 'completed') toast.success('Task completed!')
  }

  function filterTasks(statusFilter?: string) {
    return tasks.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
      const matchPriority = !priorityFilter || t.priority === priorityFilter
      const matchStatus = !statusFilter || t.status === statusFilter
      return matchSearch && matchPriority && matchStatus
    })
  }

  const activeTasks = filterTasks('in_progress')
  const pendingTasks = filterTasks('not_started')
  const completedTasks = filterTasks('completed')
  const allFiltered = filterTasks()

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <CheckSquare className="size-6 text-primary" />
        <h1 className="scroll-m-20 text-2xl font-bold tracking-tight">My Tasks</h1>
        <Badge variant="secondary" className="ml-1">{tasks.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search my tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={priorityFilter || 'all'} onValueChange={v => setPriorityFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({allFiltered.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Done ({completedTasks.length})</TabsTrigger>
          </TabsList>

          {[
            { value: 'all', items: allFiltered },
            { value: 'active', items: activeTasks },
            { value: 'pending', items: pendingTasks },
            { value: 'completed', items: completedTasks },
          ].map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No tasks here</p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border overflow-hidden bg-card">
                    {tab.items.map((task, idx) => {
                      const cfg = PRIORITY_CONFIG[task.priority]
                      const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed'
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent',
                            idx !== 0 && 'border-t',
                            task.status === 'completed' && 'opacity-60'
                          )}
                        >
                          <Checkbox
                            checked={task.status === 'completed'}
                            onCheckedChange={() => toggleTask(task)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium truncate', task.status === 'completed' && 'line-through text-muted-foreground')}>
                              {task.title}
                            </p>
                            {task.due_date && (
                              <span className={cn('flex items-center gap-1 text-xs mt-0.5', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                                <Calendar className="size-3" />
                                {format(new Date(task.due_date), 'MMM d, yyyy')}
                                {isOverdue && ' · Overdue'}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className={cn('text-xs shrink-0', cfg.color)}>
                            <Flag className="size-2.5 mr-1" />
                            {cfg.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs shrink-0 hidden sm:flex">
                            {STATUS_LABELS[task.status]}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Pagination placeholder */}
                  <div className="flex items-center justify-between py-2">
                    <p className="text-xs text-muted-foreground">Showing {tab.items.length} of {tasks.length} tasks</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>Previous</Button>
                      <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
