export interface ChecklistCategory {
  id: string;
  name: string;
  description?: string;
  color?: string; // hex or tailwind badge color class
  order_index: number;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
}
