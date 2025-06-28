import { createClient } from '@supabase/supabase-js';

// Types for our database
export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          lat: number;
          lng: number;
          type: 'person' | 'property';
          status: 'safe' | 'at_risk' | 'unknown';
          location: string;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          lat: number;
          lng: number;
          type: 'person' | 'property';
          status?: 'safe' | 'at_risk' | 'unknown';
          location: string;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          lat?: number;
          lng?: number;
          type?: 'person' | 'property';
          status?: 'safe' | 'at_risk' | 'unknown';
          location?: string;
          last_updated?: string;
        };
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);