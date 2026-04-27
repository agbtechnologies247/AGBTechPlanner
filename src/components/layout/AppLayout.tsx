import { useEffect } from 'react'
import { Outlet, useNavigate, NavLink, useParams } from 'react-router-dom'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarSeparator, SidebarInset,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { usePlanner } from '@/contexts/PlannerContext'
import { ModeToggle } from '@/components/mode-toggle'
import { LayoutDashboard, Plus, LogOut, Settings, User, ChevronDown, Sun, SquareCheck as CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreatePlanDialog } from '@/components/plans/CreatePlanDialog'
import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import logo from '@/assets/logo.png'

const PLAN_COLORS: Record<string, string> = {
  '#3b82f6': 'bg-blue-500',
  '#10b981': 'bg-emerald-500',
  '#f59e0b': 'bg-amber-500',
  '#ef4444': 'bg-red-500',
  '#8b5cf6': 'bg-violet-500',
  '#06b6d4': 'bg-cyan-500',
  '#ec4899': 'bg-pink-500',
  '#84cc16': 'bg-lime-500',
}

function getColorClass(color: string) {
  return PLAN_COLORS[color] ?? 'bg-primary'
}

export function AppLayout() {
  const { user, profile, signOut } = useAuth()
  const { plans, loadPlans, loading } = usePlanner()
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()
  const { planId } = useParams()

  useEffect(() => {
    if (user) loadPlans()
  }, [user, loadPlans])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="pb-0">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                <img src={logo} alt="AGB Tech Logo" className="size-full object-contain" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold leading-tight">AGB Tech Planner</span>
                <span className="text-xs text-muted-foreground">Workspace</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Personal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="My Day">
                      <NavLink to="/my-day" className={({ isActive }) => cn(isActive && 'bg-sidebar-accent')}>
                        <Sun className="size-4" />
                        <span>My Day</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="My Tasks">
                      <NavLink to="/my-tasks" className={({ isActive }) => cn(isActive && 'bg-sidebar-accent')}>
                        <CheckSquare className="size-4" />
                        <span>My Tasks</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard">
                      <NavLink to="/" end className={({ isActive }) => cn(isActive && 'bg-sidebar-accent')}>
                        <LayoutDashboard className="size-4" />
                        <span>Dashboard</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <div className="flex items-center justify-between px-2">
                <SidebarGroupLabel>Plans</SidebarGroupLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-xs" onClick={() => setCreateOpen(true)}>
                      <Plus className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Plan</TooltipContent>
                </Tooltip>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <SidebarMenuItem key={i}>
                        <div className="flex items-center gap-2 px-2 py-1.5">
                          <Skeleton className="size-4 rounded" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </SidebarMenuItem>
                    ))
                  ) : plans.length === 0 ? (
                    <SidebarMenuItem>
                      <div className="px-2 py-2 text-xs text-muted-foreground">
                        No plans yet. Create one to get started.
                      </div>
                    </SidebarMenuItem>
                  ) : (
                    plans.map(plan => (
                      <SidebarMenuItem key={plan.id}>
                        <SidebarMenuButton asChild tooltip={plan.title} isActive={planId === plan.id}>
                          <NavLink to={`/plan/${plan.id}`}>
                            <span className={cn('size-2.5 rounded-sm shrink-0', getColorClass(plan.color))} />
                            <span className="truncate">{plan.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium leading-tight truncate">{profile?.full_name ?? 'User'}</span>
                        <span className="text-xs text-muted-foreground truncate">{profile?.email ?? user?.email}</span>
                      </div>
                      <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="size-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="size-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                      <LogOut className="size-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            <ModeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>

      <CreatePlanDialog open={createOpen} onOpenChange={setCreateOpen} />
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}
