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
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relationship: string;
          phone?: string;
          email?: string;
          address: string;
          lat: number;
          lng: number;
          status: 'safe' | 'caution' | 'danger';
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relationship: string;
          phone?: string;
          email?: string;
          address: string;
          lat: number;
          lng: number;
          status?: 'safe' | 'caution' | 'danger';
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          relationship?: string;
          phone?: string;
          email?: string;
          address?: string;
          lat?: number;
          lng?: number;
          status?: 'safe' | 'caution' | 'danger';
          description?: string;
          updated_at?: string;
        };
      };
      live_locations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          lat: number;
          lng: number;
          accuracy?: number;
          heading?: number;
          speed?: number;
          is_sharing: boolean;
          share_with: string[];
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          lat: number;
          lng: number;
          accuracy?: number;
          heading?: number;
          speed?: number;
          is_sharing?: boolean;
          share_with?: string[];
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          lat?: number;
          lng?: number;
          accuracy?: number;
          heading?: number;
          speed?: number;
          is_sharing?: boolean;
          share_with?: string[];
          last_updated?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
