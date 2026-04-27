import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { usePlanner } from '@/contexts/PlannerContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Plan, Bucket, Task } from '@/lib/database.types'
import { Plus, MoveHorizontal as MoreHorizontal, SquareCheck as CheckSquare, Calendar, Flag, GripVertical, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format, isPast } from 'date-fns'

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', className: 'text-destructive border-destructive/30 bg-destructive/10' },
  high: { label: 'High', className: 'text-amber-600 border-amber-300 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
  medium: { label: 'Medium', className: 'text-blue-600 border-blue-300 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
  low: { label: 'Low', className: 'text-muted-foreground border-border bg-muted/50' },
}

interface Props {
  plan: Plan
  buckets: Bucket[]
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function BoardView({ plan, buckets, tasks, onTaskClick }: Props) {
  const { createBucket, deleteBucket, updateTask, createTask } = usePlanner()
  const [newBucketName, setNewBucketName] = useState('')
  const [addingBucket, setAddingBucket] = useState(false)
  const [addingTaskBucket, setAddingTaskBucket] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  function getTasksForBucket(bucketId: string | null) {
    return tasks.filter(t => t.bucket_id === bucketId).sort((a, b) => a.order_index - b.order_index)
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const taskId = result.draggableId
    const destBucketId = result.destination.droppableId === 'unassigned' ? null : result.destination.droppableId
    await updateTask(taskId, { bucket_id: destBucketId, order_index: result.destination.index })
  }

  async function handleAddBucket() {
    if (!newBucketName.trim()) return
    await createBucket({ plan_id: plan.id, title: newBucketName.trim(), color: '#6b7280' })
    setNewBucketName('')
    setAddingBucket(false)
  }

  async function handleAddTask(bucketId: string | null) {
    if (!newTaskTitle.trim()) return
    await createTask({
      plan_id: plan.id,
      bucket_id: bucketId,
      title: newTaskTitle.trim(),
      priority: 'medium',
      status: 'not_started',
    })
    setNewTaskTitle('')
    setAddingTaskBucket(null)
  }

  const allBuckets: Array<{ id: string | null; title: string; color: string }> = [
    ...buckets,
  ]

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 overflow-x-auto min-h-full pb-8">
        {allBuckets.map(bucket => {
          const bucketTasks = getTasksForBucket(bucket.id)
          return (
            <div key={bucket.id ?? 'unassigned'} className="flex flex-col gap-3 w-72 shrink-0">
              {/* Bucket header */}
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: bucket.color }} />
                <span className="flex-1 font-medium text-sm truncate">{bucket.title}</span>
                <Badge variant="secondary" className="text-xs tabular-nums shrink-0">{bucketTasks.length}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => bucket.id && deleteBucket(bucket.id)}
                    >
                      Delete bucket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Task cards */}
              <Droppable droppableId={bucket.id ?? 'unassigned'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex flex-col gap-2 min-h-[120px] rounded-xl p-2 transition-colors',
                      snapshot.isDraggingOver ? 'bg-accent' : 'bg-muted/40'
                    )}
                  >
                    {bucketTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              'group rounded-lg border bg-background p-3 shadow-xs cursor-pointer transition-shadow hover:shadow-sm',
                              snapshot.isDragging && 'shadow-md rotate-1',
                              task.status === 'completed' && 'opacity-60'
                            )}
                            onClick={() => onTaskClick(task)}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                {...provided.dragHandleProps}
                                className="mt-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground"
                                onClick={e => e.stopPropagation()}
                              >
                                <GripVertical className="size-3.5" />
                              </span>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <p className={cn('text-sm leading-snug font-medium', task.status === 'completed' && 'line-through text-muted-foreground')}>
                                  {task.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={cn('inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium', PRIORITY_CONFIG[task.priority].className)}>
                                    <Flag className="size-2.5" />
                                    {PRIORITY_CONFIG[task.priority].label}
                                  </span>
                                  {task.due_date && (
                                    <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs', isPast(new Date(task.due_date)) && task.status !== 'completed' ? 'text-destructive bg-destructive/10' : 'text-muted-foreground bg-muted')}>
                                      <Calendar className="size-2.5" />
                                      {format(new Date(task.due_date), 'MMM d')}
                                    </span>
                                  )}
                                </div>
                                {task.checklists && task.checklists.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CheckSquare className="size-3" />
                                    {task.checklists.filter(c => c.is_completed).length}/{task.checklists.length}
                                  </div>
                                )}
                              </div>
                            </div>
                            {task.assignee && (
                              <div className="flex justify-end mt-2">
                                <Avatar className="size-5">
                                  <AvatarFallback className="text-[9px]">
                                    {task.assignee.full_name.split(' ').map(n => n?.[0] || '').join('').slice(0, 2) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {addingTaskBucket === (bucket.id ?? 'unassigned') ? (
                      <div className="rounded-lg border bg-background p-2 space-y-2">
                        <Input
                          placeholder="Task title..."
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddTask(bucket.id)
                            if (e.key === 'Escape') setAddingTaskBucket(null)
                          }}
                          autoFocus
                          className="h-7 text-xs"
                        />
                        <div className="flex gap-1">
                          <Button size="xs" onClick={() => handleAddTask(bucket.id)}>Add</Button>
                          <Button size="xs" variant="ghost" onClick={() => setAddingTaskBucket(null)}>
                            <X className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-1.5 text-muted-foreground hover:text-foreground h-7 text-xs"
                        onClick={() => setAddingTaskBucket(bucket.id ?? 'unassigned')}
                      >
                        <Plus className="size-3" />
                        Add task
                      </Button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}

        {/* Add bucket column */}
        <div className="w-72 shrink-0">
          {addingBucket ? (
            <div className="rounded-xl border bg-card p-3 space-y-2">
              <Input
                placeholder="Bucket name..."
                value={newBucketName}
                onChange={e => setNewBucketName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddBucket()
                  if (e.key === 'Escape') setAddingBucket(false)
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddBucket}>Add Bucket</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingBucket(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-dashed h-10 text-muted-foreground"
              onClick={() => setAddingBucket(true)}
            >
              <Plus className="size-4" />
              Add bucket
            </Button>
          )}
        </div>
      </div>
    </DragDropContext>
  )
}
