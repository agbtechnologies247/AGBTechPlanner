import { useState } from 'react'
import type { Task } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths,
  parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-destructive text-white',
  high: 'bg-amber-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-muted text-muted-foreground',
}

interface Props {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function ScheduleView({ tasks, onTaskClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function getTasksForDay(day: Date) {
    return tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), day))
  }

  const tasksWithDates = tasks.filter(t => t.due_date).sort((a, b) =>
    new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
  )

  return (
    <div className="p-6 space-y-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
          <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border overflow-hidden">
        {/* Day names */}
        <div className="grid grid-cols-7 bg-muted/50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground border-b">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isCurrentDay = isToday(day)
            const isLastRow = idx >= days.length - 7

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[100px] p-1.5 border-b border-r transition-colors',
                  !isCurrentMonth && 'bg-muted/20',
                  !isLastRow ? 'border-b' : 'border-b-0',
                  idx % 7 === 6 && 'border-r-0'
                )}
              >
                <div className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                  isCurrentDay ? 'bg-primary text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map(task => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={cn(
                        'w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate block font-medium',
                        PRIORITY_COLORS[task.priority]
                      )}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-muted-foreground pl-1">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming tasks */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Calendar className="size-4" /> Upcoming Tasks
        </h3>
        {tasksWithDates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks with due dates.</p>
        ) : (
          <div className="space-y-2">
            {tasksWithDates.slice(0, 10).map(task => (
              <button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="flex items-center gap-3 w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-center text-center w-10 shrink-0">
                  <span className="text-xs text-muted-foreground">{format(parseISO(task.due_date!), 'MMM')}</span>
                  <span className="text-lg font-bold leading-tight">{format(parseISO(task.due_date!), 'd')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', task.status === 'completed' && 'line-through text-muted-foreground')}>
                    {task.title}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn('shrink-0 text-xs', task.priority === 'urgent' && 'border-destructive text-destructive')}
                >
                  {task.priority}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
