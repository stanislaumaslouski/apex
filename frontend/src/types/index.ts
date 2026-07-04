export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClientCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  is_active?: boolean;
}

export interface ClientUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  is_active?: boolean;
}