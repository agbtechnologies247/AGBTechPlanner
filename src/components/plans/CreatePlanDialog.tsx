import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanner } from '@/contexts/PlannerContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#6b7280',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePlanDialog({ open, onOpenChange }: Props) {
  const { createPlan } = usePlanner()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setLoading(true)
    const plan = await createPlan({ title: title.trim(), description, color })
    setLoading(false)
    if (plan) {
      onOpenChange(false)
      setTitle('')
      setDescription('')
      setColor(COLORS[0])
      navigate(`/plan/${plan.id}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="plan-title">Plan name</Label>
            <Input
              id="plan-title"
              placeholder="e.g. Q2 Product Launch"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-desc">Description (optional)</Label>
            <Textarea
              id="plan-desc"
              placeholder="What is this plan about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    'size-7 rounded-full ring-offset-background transition-all',
                    color === c && 'ring-2 ring-ring ring-offset-2'
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim() || loading}>
            {loading && <Spinner className="mr-2" />}
            Create Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
