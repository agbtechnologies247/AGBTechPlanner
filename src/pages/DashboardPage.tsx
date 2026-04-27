import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlanner } from '@/contexts/PlannerContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { api } from '@/lib/api'
import type { Task } from '@/lib/database.types'
import { Plus, CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle, LayoutGrid } from 'lucide-react'
import { CreatePlanDialog } from '@/components/plans/CreatePlanDialog'
import { format, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'destructive',
  high: 'outline',
  medium: 'secondary',
  low: 'outline',
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'bg-emerald-500' },
  deferred: { label: 'Deferred', color: 'bg-amber-500' },
}

export function DashboardPage() {
  const { profile } = useAuth()
  const { plans, loading, loadPlans } = usePlanner()
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  useEffect(() => {
    async function loadTasks() {
      setTasksLoading(true)
      const { data } = await api.from('tasks').select('*').order('created_at', { ascending: false })
      setAllTasks(data ?? [])
      setTasksLoading(false)
    }
    loadTasks()
  }, [])

  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter(t => t.status === 'completed').length
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
  const overdueTasks = allTasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && t.status !== 'completed').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const recentTasks = allTasks.slice(0, 5)

  const statusChartData = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    name: config.label,
    value: allTasks.filter(t => t.status === key).length,
    fill: key === 'completed' ? 'var(--chart-2)' : key === 'in_progress' ? 'var(--chart-1)' : key === 'deferred' ? 'var(--chart-4)' : 'var(--chart-3)',
  }))

  const priorityData = ['urgent', 'high', 'medium', 'low'].map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    tasks: allTasks.filter(t => t.priority === p).length,
  }))

  const chartConfig = {
    tasks: { label: 'Tasks', color: 'var(--chart-1)' },
    value: { label: 'Count', color: 'var(--chart-2)' },
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
            {greeting()}, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening across your plans</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          New Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: LayoutGrid, color: 'text-blue-500', filter: 'all' },
          { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'text-emerald-500', filter: 'completed' },
          { label: 'In Progress', value: inProgressTasks, icon: Clock, color: 'text-amber-500', filter: 'active' },
          { label: 'Overdue', value: overdueTasks, icon: AlertCircle, color: 'text-destructive', filter: 'active' },
        ].map(stat => (
          <Card key={stat.label} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/my-tasks')}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn('rounded-lg bg-muted p-2', stat.color)}>
                <stat.icon className="size-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{tasksLoading ? <Skeleton className="h-7 w-10" /> : stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress & Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
            <CardDescription>Distribution across priority levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart data={priorityData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tasks" fill="var(--color-tasks)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Status</CardTitle>
            <CardDescription>Overall completion rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="space-y-2">
              {statusChartData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans & Recent Tasks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Your Plans</CardTitle>
              <CardDescription>{plans.length} active plans</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" />
              New
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">No plans yet</p>
                <Button size="sm" onClick={() => setCreateOpen(true)}>Create your first plan</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {plans.slice(0, 6).map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => navigate(`/plan/${plan.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: plan.color }} />
                    <span className="flex-1 truncate text-sm font-medium">{plan.title}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(plan.created_at), 'MMM d')}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Tasks</CardTitle>
            <CardDescription>Latest activity across all plans</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => navigate(`/plan/${task.plan_id}`)}
                  >
                    <span className={cn('size-2 rounded-full shrink-0', STATUS_CONFIG[task.status].color)} />
                    <span className="flex-1 truncate text-sm">{task.title}</span>
                    <Badge variant={PRIORITY_COLORS[task.priority] as any} className="shrink-0 text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreatePlanDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
