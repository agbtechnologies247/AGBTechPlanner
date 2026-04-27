export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'deferred'
export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  email: string | null
  role: string
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  title: string
  description: string
  owner_id: string
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface PlanMember {
  id: string
  plan_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  profile?: Profile
}

export interface Bucket {
  id: string
  plan_id: string
  title: string
  order_index: number
  color: string
  created_at: string
}

export interface TaskLabel {
  id: string
  plan_id: string
  name: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  plan_id: string
  bucket_id: string | null
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  due_date: string | null
  start_date: string | null
  assigned_to: string | null
  created_by: string
  order_index: number
  completed_at: string | null
  created_at: string
  updated_at: string
  assignee?: Profile
  assignees?: Profile[]
  creator?: Profile
  labels?: TaskLabel[]
  checklists?: TaskChecklist[]
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  assignments?: { user_id: string; profile?: Profile }[]
  count?: number
}

export interface TaskChecklist {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  order_index: number
  created_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: Profile
}

export interface TaskAttachment {
  id: string
  task_id: string
  user_id: string
  file_name: string
  file_url: string
  file_size: number
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      plans: { Row: Plan; Insert: Partial<Plan>; Update: Partial<Plan> }
      plan_members: { Row: PlanMember; Insert: Partial<PlanMember>; Update: Partial<PlanMember> }
      buckets: { Row: Bucket; Insert: Partial<Bucket>; Update: Partial<Bucket> }
      task_labels: { Row: TaskLabel; Insert: Partial<TaskLabel>; Update: Partial<TaskLabel> }
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> }
      task_checklists: { Row: TaskChecklist; Insert: Partial<TaskChecklist>; Update: Partial<TaskChecklist> }
      task_comments: { Row: TaskComment; Insert: Partial<TaskComment>; Update: Partial<TaskComment> }
      task_attachments: { Row: TaskAttachment; Insert: Partial<TaskAttachment>; Update: Partial<TaskAttachment> }
      task_label_assignments: { Row: { task_id: string; label_id: string }; Insert: { task_id: string; label_id: string }; Update: { task_id: string; label_id: string } }
      task_assignments: { Row: { task_id: string; user_id: string; assigned_at: string }; Insert: { task_id: string; user_id: string; assigned_at?: string }; Update: { task_id?: string; user_id?: string; assigned_at?: string } }
    }
  }
}
