// ─────────────────────────────────────────────
// Enums & Literals
// ─────────────────────────────────────────────

export type UserRole = "manager" | "client" | "super_admin" | "admin" | "team_member" | "client_owner" | "client_member";
export type EffectiveRole = "manager" | "client";


export type ClientStatus = "active" | "inactive" | "archived";

export type ProjectStatus = "planning" | "active" | "on_hold" | "waiting_for_client" | "completed" | "archived";

export type ServiceStatus = "not_started" | "in_progress" | "waiting_for_client" | "completed" | "on_hold";

export type TaskStatus = "backlog" | "planned" | "in_progress" | "waiting" | "in_review" | "completed" | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type MilestoneStatus = "not_started" | "in_progress" | "completed";

export type DeliverableStatus = "draft" | "submitted" | "awaiting_review" | "changes_requested" | "approved" | "archived";

export type ApprovalStatus = "not_submitted" | "awaiting_review" | "changes_requested" | "approved" | "archived";

export type InvoiceStatus = "draft" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled";

export type PaymentMethod = "bank_transfer" | "cash" | "cheque" | "mobile_money" | "other";

export type Currency = "ETB" | "USD";

export type FileCategory = "image" | "video" | "pdf" | "document" | "design" | "archive" | "contract" | "receipt" | "other";

export type EventType = "meeting" | "deadline" | "shoot" | "delivery" | "review" | "payment" | "launch" | "internal" | "other";

export type ServiceType =
  | "website"
  | "software"
  | "branding"
  | "seo"
  | "google_business"
  | "social_media"
  | "content_production"
  | "photography"
  | "videography"
  | "video_editing"
  | "marketing"
  | "consulting"
  | "maintenance";

export type Visibility = "internal" | "client";

export type ClientHealthStatus = "on_track" | "attention_required" | "waiting_for_client" | "delayed";

// ─────────────────────────────────────────────
// Base
// ─────────────────────────────────────────────

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// ─────────────────────────────────────────────
// Organization
// ─────────────────────────────────────────────

export interface Organization extends BaseRecord {
  name: string;
  slug: string;
  logo_url?: string | null;
  accent_color?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

// ─────────────────────────────────────────────
// Users & Memberships
// ─────────────────────────────────────────────

export interface Profile extends BaseRecord {
  organization_id: string;
  client_id?: string | null;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  title?: string | null;
}

export interface Membership extends BaseRecord {
  organization_id: string;
  client_id?: string | null;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  permissions?: Record<string, boolean>;
  profile?: Profile;
}

// ─────────────────────────────────────────────
// Clients
// ─────────────────────────────────────────────

export interface Client extends BaseRecord {
  organization_id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  industry?: string | null;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  status: ClientStatus;
  health_status?: ClientHealthStatus | null;
  start_date?: string | null;
  internal_notes?: string | null;
  client_notes?: string | null;
  // joined
  contacts?: ClientContact[];
  projects?: Project[];
}

export interface ClientContact extends BaseRecord {
  client_id: string;
  organization_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  is_primary: boolean;
  social_accounts?: Record<string, string> | null;
}

// ─────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────

export interface Project extends BaseRecord {
  organization_id: string;
  client_id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  budget_currency?: Currency | null;
  progress_override?: number | null;
  // joined
  client?: Client;
  services?: Service[];
  team?: ProjectMember[];
}

export interface ProjectMember extends BaseRecord {
  project_id: string;
  user_id: string;
  organization_id: string;
  profile?: Profile;
}

// ─────────────────────────────────────────────
// Services (workspace per service type)
// ─────────────────────────────────────────────

export interface Service extends BaseRecord {
  organization_id: string;
  project_id: string;
  client_id: string;
  service_type: ServiceType;
  name: string;
  description?: string | null;
  status: ServiceStatus;
  current_phase?: string | null;
  progress: number; // 0-100
  start_date?: string | null;
  target_date?: string | null;
  summary?: string | null;
  // joined
  project?: Project;
  milestones?: Milestone[];
  tasks?: Task[];
}

// ─────────────────────────────────────────────
// Milestones
// ─────────────────────────────────────────────

export interface Milestone extends BaseRecord {
  organization_id: string;
  project_id: string;
  service_id: string;
  client_id: string;
  name: string;
  description?: string | null;
  status: MilestoneStatus;
  order_index: number;
  due_date?: string | null;
  completed_at?: string | null;
  // joined
  tasks?: Task[];
}

// ─────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────

export interface Task extends BaseRecord {
  organization_id: string;
  project_id: string;
  service_id?: string | null;
  client_id: string;
  milestone_id?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string | null;
  creator_id: string;
  due_date?: string | null;
  start_date?: string | null;
  completed_at?: string | null;
  visibility: Visibility;
  // joined
  assignee?: Profile;
  comments?: Comment[];
  attachments?: FileRecord[];
}

// ─────────────────────────────────────────────
// Work Records
// ─────────────────────────────────────────────

export interface WorkRecord extends BaseRecord {
  organization_id: string;
  project_id: string;
  service_id: string;
  client_id: string;
  title: string;
  description: string;
  work_date: string;
  author_id: string;
  team_member_id?: string | null;
  related_task_id?: string | null;
  related_deliverable_id?: string | null;
  status: "draft" | "published";
  visibility: Visibility;
  changes?: string | null;
  notes?: string | null;
  // joined
  author?: Profile;
  team_member?: Profile;
  files?: FileRecord[];
}

// ─────────────────────────────────────────────
// Deliverables
// ─────────────────────────────────────────────

export interface Deliverable extends BaseRecord {
  organization_id: string;
  project_id: string;
  service_id: string;
  client_id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  current_version: number;
  status: DeliverableStatus;
  created_by: string;
  related_task_id?: string | null;
  // joined
  versions?: DeliverableVersion[];
  approval?: Approval;
}

export interface DeliverableVersion extends BaseRecord {
  deliverable_id: string;
  organization_id: string;
  version_number: number;
  file_url: string;
  file_name: string;
  file_size?: number | null;
  file_type?: string | null;
  notes?: string | null;
  uploaded_by: string;
  // joined
  uploader?: Profile;
}

// ─────────────────────────────────────────────
// Approvals
// ─────────────────────────────────────────────

export interface Approval extends BaseRecord {
  organization_id: string;
  project_id: string;
  service_id: string;
  client_id: string;
  deliverable_id: string;
  deliverable_version_id?: string | null;
  title: string;
  description?: string | null;
  status: ApprovalStatus;
  requested_by: string;
  requested_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  client_comment?: string | null;
  // joined
  deliverable?: Deliverable;
  requester?: Profile;
  reviewer?: Profile;
}

// ─────────────────────────────────────────────
// Feedback
// ─────────────────────────────────────────────

export interface Feedback extends BaseRecord {
  organization_id: string;
  project_id: string;
  service_id?: string | null;
  client_id: string;
  deliverable_id?: string | null;
  approval_id?: string | null;
  author_id: string;
  content: string;
  attachment_url?: string | null;
  // joined
  author?: Profile;
}

// ─────────────────────────────────────────────
// Decisions & Events
// ─────────────────────────────────────────────

export interface Decision extends BaseRecord {
  organization_id: string;
  project_id: string;
  service_id?: string | null;
  client_id: string;
  title: string;
  description: string;
  decision_date: string;
  made_by: string;
  visibility: Visibility;
}

export interface Event extends BaseRecord {
  organization_id: string;
  project_id?: string | null;
  service_id?: string | null;
  client_id?: string | null;
  title: string;
  description?: string | null;
  event_type: EventType;
  start_datetime: string;
  end_datetime?: string | null;
  location?: string | null;
  is_all_day: boolean;
  visibility: Visibility;
  created_by: string;
}

// ─────────────────────────────────────────────
// Files
// ─────────────────────────────────────────────

export interface FileRecord extends BaseRecord {
  organization_id: string;
  project_id?: string | null;
  service_id?: string | null;
  client_id?: string | null;
  name: string;
  file_url: string;
  file_key: string;
  file_type?: string | null;
  file_size?: number | null;
  category: FileCategory;
  visibility: Visibility;
  uploaded_by: string;
  version?: number | null;
  // joined
  uploader?: Profile;
}

// ─────────────────────────────────────────────
// Finance
// ─────────────────────────────────────────────

export interface Invoice extends BaseRecord {
  organization_id: string;
  client_id: string;
  project_id?: string | null;
  invoice_number: string;
  title?: string | null;
  status: InvoiceStatus;
  currency: Currency;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  due_date?: string | null;
  sent_at?: string | null;
  notes?: string | null;
  // joined
  items?: InvoiceItem[];
  payments?: Payment[];
  client?: Client;
}

export interface InvoiceItem extends BaseRecord {
  invoice_id: string;
  organization_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  order_index: number;
}

export interface Payment extends BaseRecord {
  organization_id: string;
  client_id: string;
  invoice_id?: string | null;
  project_id?: string | null;
  amount: number;
  currency: Currency;
  payment_date: string;
  method: PaymentMethod;
  reference?: string | null;
  receipt_url?: string | null;
  notes?: string | null;
  recorded_by: string;
  // joined
  invoice?: Invoice;
  client?: Client;
}

// ─────────────────────────────────────────────
// Activity & Comments
// ─────────────────────────────────────────────

export interface ActivityLog extends BaseRecord {
  organization_id: string;
  project_id?: string | null;
  service_id?: string | null;
  client_id?: string | null;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_title?: string | null;
  previous_state?: Record<string, unknown> | null;
  new_state?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  visibility: Visibility;
  // joined
  actor?: Profile;
}

export interface Comment extends BaseRecord {
  organization_id: string;
  project_id?: string | null;
  service_id?: string | null;
  client_id?: string | null;
  entity_type: string;
  entity_id: string;
  author_id: string;
  content: string;
  attachment_url?: string | null;
  visibility: Visibility;
  // joined
  author?: Profile;
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export interface Notification extends BaseRecord {
  organization_id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  action_url?: string | null;
}

// ─────────────────────────────────────────────
// UI / Form helpers
// ─────────────────────────────────────────────

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
