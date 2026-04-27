import { useState, useEffect } from 'react'
import { usePlanner } from '@/contexts/PlannerContext'
import { useAuth } from '@/contexts/AuthContext'
import type { Task, TaskChecklist } from '@/lib/database.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { api } from '@/lib/api'
import { Calendar, Flag, Plus, Trash2, SquareCheck as CheckSquare, MessageSquare, Send, X, Users } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  planId: string
}

const PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const
const STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'deferred', label: 'Deferred' },
] as const

export function TaskDialog({ open, onOpenChange, task, planId }: Props) {
  const { createTask, updateTask, deleteTask, buckets } = usePlanner()
  const { user, profile } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [status, setStatus] = useState<Task['status']>('not_started')
  const [dueDate, setDueDate] = useState('')
  const [bucketId, setBucketId] = useState<string>('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [checklists, setChecklists] = useState<TaskChecklist[]>([])
  const [newCheckItem, setNewCheckItem] = useState('')
  const [comments, setComments] = useState<Array<{ id: string; content: string; created_at: string; user?: { full_name: string } }>>([])
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)
  const { members, loadMembers } = usePlanner()

  const isEditing = !!task

  useEffect(() => {
    if (planId) loadMembers(planId)
  }, [planId, loadMembers])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.due_date ?? '')
      setBucketId(task.bucket_id ?? '')
      setAssigneeIds(task.assignments?.map(a => a.user_id) ?? (task.assigned_to ? [task.assigned_to] : []))
      setChecklists(task.checklists ?? [])
      setComments((task.comments as typeof comments) ?? [])
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStatus('not_started')
      setDueDate('')
      setBucketId('')
      setAssigneeIds([])
      setChecklists([])
      setComments([])
    }
  }, [task, open])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const taskData = {
        title: title.trim(),
        description,
        priority,
        status,
        due_date: dueDate || null,
        bucket_id: bucketId || null,
      }

      let savedTask: Task | null = null
      if (isEditing && task) {
        await updateTask(task.id, taskData)
        savedTask = task
        toast.success('Task updated')
      } else {
        savedTask = await createTask({ ...taskData, plan_id: planId })
        toast.success('Task created')
      }

      if (savedTask) {
        // Update assignments table and also set primary assignee on task for simple filtering
        const primaryAssigneeId = assigneeIds.length > 0 ? assigneeIds[0] : null
        await api.from('tasks').update({ assigned_to: primaryAssigneeId } as any).eq('id', savedTask.id)
        
        await api.from('task_assignments').delete().eq('task_id', savedTask.id)
        if (assigneeIds.length > 0) {
          await api.from('task_assignments').insert(assigneeIds.map(id => ({ task_id: (savedTask as Task).id, user_id: id })) as any)
        }
      }

      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  function toggleAssignee(userId: string) {
    setAssigneeIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId])
  }

  async function handleDelete() {
    if (!task) return
    await deleteTask(task.id)
    toast.success('Task deleted')
    onOpenChange(false)
  }

  async function addCheckItem() {
    if (!newCheckItem.trim() || !task) return
    const { data } = await api.from('task_checklists').insert({
      task_id: task.id,
      title: newCheckItem.trim(),
      order_index: checklists.length,
    } as any).select().maybeSingle()
    if (data) setChecklists(prev => [...prev, data])
    setNewCheckItem('')
  }

  async function toggleCheckItem(item: TaskChecklist) {
    const { data } = await api.from('task_checklists').update({ is_completed: !item.is_completed } as any).eq('id', item.id).select().maybeSingle()
    if (data) setChecklists(prev => prev.map(c => c.id === item.id ? data : c))
  }

  async function deleteCheckItem(id: string) {
    await api.from('task_checklists').delete().eq('id', id)
    setChecklists(prev => prev.filter(c => c.id !== id))
  }

  async function addComment() {
    if (!newComment.trim() || !task || !user) return
    const { data } = await api.from('task_comments').insert({
      task_id: task.id,
      user_id: user.id,
      content: newComment.trim(),
    } as any).select('*, user:profiles(full_name)').maybeSingle()
    if (data) setComments((prev: any[]) => [...prev, data as any])
    setNewComment('')
  }

  const checklistProgress = checklists.length > 0
    ? Math.round((checklists.filter(c => c.is_completed).length / checklists.length) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              placeholder="Task title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus={!isEditing}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="resize-none min-h-16"
              rows={3}
            />
          </div>

          {/* Row: Priority, Status, Bucket */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Flag className="size-3" />Priority</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Task['priority'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as Task['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Bucket</Label>
              <Select value={bucketId || 'none'} onValueChange={v => setBucketId(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No bucket</SelectItem>
                  {buckets.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date and Assignees */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Calendar className="size-3" />Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Users className="size-3" />Assignees</Label>
              <div className="flex flex-wrap gap-1.5 border rounded-md p-2 min-h-11 bg-background">
                {assigneeIds.length === 0 && (
                  <span className="text-sm text-muted-foreground py-1 px-2">No one assigned</span>
                )}
                {assigneeIds.map(id => {
                  const m = members.find(m => m.id === id)
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 pl-1 pr-1.5 py-0.5 h-7">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[7px] bg-primary/10">{m?.full_name[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate text-xs font-medium">{m?.full_name || 'User'}</span>
                      <X className="size-3 cursor-pointer hover:text-destructive ml-0.5" onClick={() => toggleAssignee(id)} />
                    </Badge>
                  )
                })}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 border-dashed gap-1 px-2">
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Members</div>
                    {members.map(m => (
                      <DropdownMenuItem 
                        key={m.id} 
                        onClick={() => toggleAssignee(m.id)}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[9px]">{m.full_name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{m.full_name}</span>
                        </div>
                        {assigneeIds.includes(m.id) && (
                          <div className="size-2 rounded-full bg-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    {members.length === 0 && (
                      <div className="p-4 text-center text-xs text-muted-foreground">No members found</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Checklist (only for existing tasks) */}
          {isEditing && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <CheckSquare className="size-3.5" />
                  Checklist
                  {checklists.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">{checklistProgress}%</Badge>
                  )}
                </Label>
                {checklists.length > 0 && (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${checklistProgress}%` }} />
                  </div>
                )}
                <div className="space-y-1.5">
                  {checklists.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <Checkbox
                        checked={item.is_completed}
                        onCheckedChange={() => toggleCheckItem(item)}
                      />
                      <span className={cn('flex-1 text-sm', item.is_completed && 'line-through text-muted-foreground')}>
                        {item.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => deleteCheckItem(item.id)}
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add checklist item..."
                    value={newCheckItem}
                    onChange={e => setNewCheckItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={addCheckItem}>
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Comments */}
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  Comments ({comments.length})
                </Label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="size-6 shrink-0">
                        <AvatarFallback className="text-[9px]">
                          {(comment.user?.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-lg bg-muted px-3 py-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium">{comment.user?.full_name ?? 'User'}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(comment.created_at), 'MMM d, HH:mm')}</span>
                        </div>
                        <p className="text-sm mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {(profile?.full_name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addComment()}
                      className="h-8 text-sm"
                    />
                    <Button size="icon-sm" onClick={addComment} disabled={!newComment.trim()}>
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          {isEditing ? (
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim() || saving}>
              {saving && <Spinner className="mr-2" />}
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
