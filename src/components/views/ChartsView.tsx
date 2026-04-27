import type { Task, Bucket } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low']
const PRIORITY_LABELS: Record<string, string> = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' }

interface Props {
  tasks: Task[]
  buckets: Bucket[]
}

export function ChartsView({ tasks, buckets }: Props) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const notStarted = tasks.filter(t => t.status === 'not_started').length
  const deferred = tasks.filter(t => t.status === 'deferred').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const priorityData = PRIORITY_ORDER.map(p => ({
    name: PRIORITY_LABELS[p],
    total: tasks.filter(t => t.priority === p).length,
    completed: tasks.filter(t => t.priority === p && t.status === 'completed').length,
  }))

  const statusData = [
    { name: 'Completed', value: completed, fill: 'var(--chart-2)' },
    { name: 'In Progress', value: inProgress, fill: 'var(--chart-1)' },
    { name: 'Not Started', value: notStarted, fill: 'var(--chart-3)' },
    { name: 'Deferred', value: deferred, fill: 'var(--chart-4)' },
  ].filter(d => d.value > 0)

  const bucketData = buckets.map(b => ({
    name: b.title,
    tasks: tasks.filter(t => t.bucket_id === b.id).length,
    completed: tasks.filter(t => t.bucket_id === b.id && t.status === 'completed').length,
  }))

  const chartConfig = {
    total: { label: 'Total', color: 'var(--chart-1)' },
    completed: { label: 'Completed', color: 'var(--chart-2)' },
    tasks: { label: 'Tasks', color: 'var(--chart-1)' },
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Tasks', value: total, icon: TrendingUp, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Overdue', value: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length, icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className={cn('rounded-lg p-2', s.color)}>
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Overall Completion Rate</p>
              <p className="text-xs text-muted-foreground">{completed} of {total} tasks completed</p>
            </div>
            <span className="text-3xl font-bold">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Priority distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
            <CardDescription>Total vs completed per priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
              <BarChart data={priorityData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
            <CardDescription>Task breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
              <PieChart accessibilityLayer>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tasks per bucket */}
        {bucketData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Tasks by Bucket</CardTitle>
              <CardDescription>Work distribution across buckets</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={bucketData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="tasks" fill="var(--color-tasks)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
