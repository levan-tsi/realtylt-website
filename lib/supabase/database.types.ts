/** Minimal typed schema for the anon client — only the `portal_*` tables the website
 * touches (docs/CLIENT-ACCOUNTS.md). The CRM's other tables are intentionally omitted; the
 * blog read path uses raw fetch, not this client. */

type Ts = string; // ISO timestamp

export interface Database {
  public: {
    Tables: {
      portal_clients: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          contact_id: string | null;
          created_at: Ts;
          updated_at: Ts;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      portal_favorites: {
        Row: {
          id: string;
          client_id: string;
          listing_id: string;
          collection: string;
          created_at: Ts;
        };
        Insert: { client_id: string; listing_id: string; collection?: string };
        Update: { collection?: string };
        Relationships: [];
      };
      portal_saved_searches: {
        Row: {
          id: string;
          client_id: string;
          label: string;
          query: string;
          alerts: boolean;
          created_at: Ts;
        };
        Insert: { client_id: string; label: string; query: string; alerts?: boolean };
        Update: { label?: string; query?: string; alerts?: boolean };
        Relationships: [];
      };
      portal_activity: {
        Row: {
          id: string;
          client_id: string;
          type: string;
          listing_id: string | null;
          meta: Record<string, unknown>;
          created_at: Ts;
        };
        Insert: {
          client_id: string;
          type: string;
          listing_id?: string | null;
          meta?: Record<string, unknown>;
        };
        Update: { meta?: Record<string, unknown> };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
