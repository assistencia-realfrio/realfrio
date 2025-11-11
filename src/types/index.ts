export type StoreLocation = "CALDAS DA RAINHA" | "PORTO DE MÓS";

export interface ClientFormValues {
  name: string;
  contact: string | null;
  email: string | null;
  store: StoreLocation | null;
  maps_link: string | null;
  locality: string | null;
  google_drive_link: string | null;
}

export interface Client {
  id: string;
  created_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  name: string;
  contact: string | null;
  email: string | null;
  store: StoreLocation | null;
  maps_link: string | null;
  locality: string | null;
  google_drive_link: string | null;
}

export interface Equipment {
  id: string;
  created_by: string;
  client_id: string;
  name: string;
  model: string | null;
  serial_number: string | null;
  created_at: string;
  brand: string | null;
  google_drive_link: string | null;
}

export interface Activity {
  id: string;
  user_id: string | null;
  entity_type: 'client' | 'equipment' | 'service_order';
  entity_id: string;
  action_type: string;
  content: string;
  details: any;
  created_at: string;
}