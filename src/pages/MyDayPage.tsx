import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { Task } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isToday, isPast } from 'date-fns'
import { Sun, Calendar, CircleAlert as AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'border-destructive/40 text-destructive bg-destructive/10' },
  high: { label: 'High', className: 'border-amber-300 text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
  medium: { label: 'Medium', className: 'border-blue-300 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
  low: { label: 'Low', className: '' },
}

export function MyDayPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTasks() {
      if (!user) return
      setLoading(true)
      const today = format(new Date(), 'yyyy-MM-dd')
      const { data } = await api
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .or(`due_date.eq.${today},status.eq.in_progress`)
        .order('priority', { ascending: true })
      setTasks(data ?? [])
      setLoading(false)
    }
    loadTasks()
  }, [user])

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'completed' ? 'not_started' : 'completed'
    await api.from('tasks').update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null } as any).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    if (newStatus === 'completed') toast.success('Task completed!')
  }

  const todayTasks = tasks.filter(t => t.due_date && isToday(new Date(t.due_date)))
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const overdueTasks = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && t.status !== 'completed')

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2">
          <Sun className="size-6 text-amber-500" />
          <h1 className="scroll-m-20 text-2xl font-bold tracking-tight">My Day</h1>
        </div>
        <p className="text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <>
          {overdueTasks.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertCircle className="size-4" />
                  Overdue ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} />)}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="size-4 text-blue-500" />
                Due Today ({todayTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No tasks due today</p>
              ) : (
                todayTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="size-4 text-amber-500" />
                In Progress ({inProgressTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {inProgressTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No tasks in progress</p>
              ) : (
                inProgressTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} />)
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low
  return (
    <div className={cn('flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors', task.status === 'completed' && 'opacity-60')}>
      <Checkbox checked={task.status === 'completed'} onCheckedChange={() => onToggle(task)} />
      <span className={cn('flex-1 text-sm', task.status === 'completed' && 'line-through text-muted-foreground')}>
        {task.title}
      </span>
      <Badge variant="outline" className={cn('text-xs shrink-0', cfg.className)}>{cfg.label}</Badge>
    </div>
  )
}
