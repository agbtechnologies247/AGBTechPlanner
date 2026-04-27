import { useState } from 'react'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState, type ColumnFiltersState,
} from '@tanstack/react-table'
import { usePlanner } from '@/contexts/PlannerContext'
import type { Task } from '@/lib/database.types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowUpDown, MoveHorizontal as MoreHorizontal, Search, Calendar, Trash2, Eye } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

const PRIORITY_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  urgent: 'destructive', high: 'default', medium: 'secondary', low: 'outline',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed', deferred: 'Deferred',
}

const STATUS_COLORS: Record<string, string> = {
  not_started: 'text-muted-foreground',
  in_progress: 'text-blue-600 dark:text-blue-400',
  completed: 'text-emerald-600 dark:text-emerald-400',
  deferred: 'text-amber-600 dark:text-amber-400',
}

interface Props {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function GridView({ tasks, onTaskClick }: Props) {
  const { updateTask, deleteTask } = usePlanner()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<Task>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={v => row.toggleSelected(!!v)}
          onClick={e => e.stopPropagation()}
        />
      ),
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
          Title <ArrowUpDown className="ml-1 size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={row.original.status === 'completed'}
            onCheckedChange={async checked => {
              await updateTask(row.original.id, { status: checked ? 'completed' : 'not_started' })
            }}
            onClick={e => e.stopPropagation()}
          />
          <span className={cn('text-sm font-medium', row.original.status === 'completed' && 'line-through text-muted-foreground')}>
            {row.getValue('title')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn('text-sm', STATUS_COLORS[row.getValue('status') as string])}>
          {STATUS_LABELS[row.getValue('status') as string]}
        </span>
      ),
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
          Priority <ArrowUpDown className="ml-1 size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant={PRIORITY_VARIANT[row.getValue('priority') as string]}>
          {(row.getValue('priority') as string).charAt(0).toUpperCase() + (row.getValue('priority') as string).slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.getValue('due_date') as string | null
        if (!date) return <span className="text-muted-foreground text-sm">—</span>
        const isOverdue = isPast(new Date(date)) && row.original.status !== 'completed'
        return (
          <span className={cn('flex items-center gap-1 text-sm', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
            <Calendar className="size-3" />
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
        )
      },
    },
    {
      id: 'assignee',
      header: 'Assignee',
      cell: ({ row }) => {
        const a = row.original.assignee
        if (!a || !a.full_name) return <span className="text-muted-foreground text-sm">—</span>
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="text-[9px]">
                {a.full_name.split(' ').map(n => n?.[0] || '').join('').slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{a.full_name}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={e => { e.stopPropagation(); onTaskClick(row.original) }}>
              <Eye className="size-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={e => { e.stopPropagation(); deleteTask(row.original.id) }}
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 48,
    },
  ]

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) || 'all'}
          onValueChange={v => table.getColumn('status')?.setFilterValue(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="deferred">Deferred</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={(table.getColumn('priority')?.getFilterValue() as string) || 'all'}
          onValueChange={v => table.getColumn('priority')?.setFilterValue(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {table.getFilteredRowModel().rows.length} tasks
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                {hg.headers.map(header => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onTaskClick(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
