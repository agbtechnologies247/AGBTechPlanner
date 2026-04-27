import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { Search, UserPlus, X, Mail, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/database.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  members: Profile[]
  onUpdate: () => void
}

export function PlanMembersDialog({ open, onOpenChange, planId, members, onUpdate }: Props) {
  const [email, setEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  const SUGGESTED_MEMBERS = [
    { email: 'agbtech.maheshlakhe@gmail.com', name: 'Mahesh Lakhe' },
    { email: 'agbtech.rushabhkorde@gmail.com', name: 'Rushabh Korde' },
    { email: 'agbtech.omkarvani@gmail.com', name: 'Omkar Vani' },
    { email: 'agbtech.mehulhotkar@gmail.com', name: 'Mehul Hotkar' },
    { email: 'support@agbtechnologies.com', name: 'Support Team' },
  ]

  async function handleAddMember(overrideEmail?: string) {
    const targetEmail = (overrideEmail || email).trim().toLowerCase()
    if (!targetEmail) return
    setInviteLoading(true)
    try {
      // 1. Find profile by email
      const { data: profile, error: searchError } = await api.from('profiles').select('*').eq('email', targetEmail).maybeSingle()
      console.log(`[PlanMembers] Searching for ${targetEmail}:`, { profile, searchError })
      
      if (searchError) {
        toast.error(`Error searching for user: ${searchError}`)
        return
      }
      
      if (!profile) {
        toast.error(`User not found with email: ${targetEmail}`)
        return
      }

      // Check if already a member
      if (members.some(m => m.id === profile.id)) {
        toast.error('User is already a member of this plan')
        return
      }

      // 2. Add to plan_members
      const { error } = await api.from('plan_members').insert({
        plan_id: planId,
        user_id: profile.id,
        role: 'editor'
      } as any)

      if (error) {
        if (error.message.includes('unique')) toast.error('User is already a member')
        else toast.error(error.message)
      } else {
        toast.success(`Added ${profile.full_name} to plan`)
        setEmail('')
        onUpdate()
      }
    } finally {
      setInviteLoading(false)
    }
  }

  async function removeMember(userId: string) {
    const { error } = await api.from('plan_members').delete().eq('plan_id', planId).eq('user_id', userId)
    if (error) toast.error(error.message)
    else {
      toast.success('Member removed')
      onUpdate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plan Members</DialogTitle>
          <DialogDescription>Manage who has access to this plan</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Add New Member</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="User email address..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9"
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                />
              </div>
              <Button onClick={() => handleAddMember()} disabled={inviteLoading || !email.trim()}>
                <UserPlus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Suggested Members</Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_MEMBERS.map(sm => {
                const isMember = members.some(m => (m.email || '').toLowerCase() === sm.email.toLowerCase())
                return (
                  <Button
                    key={sm.email}
                    variant="outline"
                    size="sm"
                    className={cn("h-8 text-xs gap-1.5 rounded-full", isMember && "opacity-50 pointer-events-none")}
                    onClick={() => handleAddMember(sm.email)}
                    disabled={isMember || inviteLoading}
                  >
                    <Avatar className="size-4">
                      <AvatarFallback className="text-[8px]">{sm.name[0]}</AvatarFallback>
                    </Avatar>
                    {sm.name}
                    {!isMember && <Plus className="size-3" />}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Current Members ({members.length})
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2 group">
                  <Avatar className="size-8">
                    <AvatarFallback>{m.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.full_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{m.email || ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[9px] py-0 h-5 px-1.5 font-medium">Editor</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon-xs" 
                      onClick={() => removeMember(m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <Search className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No members assigned yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
