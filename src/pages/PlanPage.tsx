import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePlanner } from '@/contexts/PlannerContext'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BoardView } from '@/components/views/BoardView'
import { GridView } from '@/components/views/GridView'
import { ScheduleView } from '@/components/views/ScheduleView'
import { ChartsView } from '@/components/views/ChartsView'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { PlanMembersDialog } from '@/components/plans/PlanMembersDialog'
import type { Task } from '@/lib/database.types'
import { LayoutGrid, List, CalendarDays, ChartBar as BarChart3, Plus, Users, Download } from 'lucide-react'

export function PlanPage() {
  const { planId } = useParams<{ planId: string }>()
  const { currentPlan, buckets, tasks, loading, loadPlanData, exportPlan, members, loadMembers } = usePlanner()
  const [activeView, setActiveView] = useState('board')
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (planId) {
      loadPlanData(planId)
      loadMembers(planId)
    }
  }, [planId, loadPlanData, loadMembers])

  function openTask(task: Task) {
    setSelectedTask(task)
    setTaskDialogOpen(true)
  }

  function handleNewTask() {
    setSelectedTask(null)
    setTaskDialogOpen(true)
  }

  if (loading && !currentPlan) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-72 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!currentPlan) return null

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length

  return (
    <div className="flex flex-col h-full">
      {/* Plan header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="size-4 rounded-full shrink-0"
              style={{ backgroundColor: currentPlan.color }}
            />
            <div>
              <h1 className="scroll-m-20 text-2xl font-bold tracking-tight">{currentPlan.title}</h1>
              {currentPlan.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{currentPlan.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="gap-1.5">
              <span className="text-emerald-500">{completedCount}</span>
              <span className="text-muted-foreground">/ {totalCount} tasks</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
              <Users className="size-3.5" />
              Members
            </Button>
            <Button size="sm" onClick={handleNewTask}>
              <Plus className="size-3.5" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList variant="line">
              <TabsTrigger value="board">
                <LayoutGrid className="size-3.5" />
                Board
              </TabsTrigger>
              <TabsTrigger value="grid">
                <List className="size-3.5" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <CalendarDays className="size-3.5" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="charts">
                <BarChart3 className="size-3.5" />
                Charts
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select onValueChange={(v) => loadPlanData(planId!, { filter: { status: v === 'all' ? undefined : v } })}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Filter: Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(v) => loadPlanData(planId!, { sort: { column: v, ascending: v !== 'due_date' } })}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order_index">Manual</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => exportPlan(planId!)}>
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-auto">
        {activeView === 'board' && (
          <BoardView
            plan={currentPlan}
            buckets={buckets}
            tasks={tasks}
            onTaskClick={openTask}
          />
        )}
        {activeView === 'grid' && (
          <GridView tasks={tasks} onTaskClick={openTask} />
        )}
        {activeView === 'schedule' && (
          <ScheduleView tasks={tasks} onTaskClick={openTask} />
        )}
        {activeView === 'charts' && (
          <ChartsView tasks={tasks} buckets={buckets} />
        )}
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={selectedTask}
        planId={currentPlan.id}
      />

      <PlanMembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        planId={currentPlan.id}
        members={members}
        onUpdate={() => loadMembers(currentPlan.id)}
      />
    </div>
  )
}
