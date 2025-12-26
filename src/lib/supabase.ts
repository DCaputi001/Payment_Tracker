/**
 * Supabase client configuration and type definitions.
 * Initializes the Supabase client with environment variables and defines data models.
 */

import { createClient } from '@supabase/supabase-js';

// Load Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client instance configured with project credentials.
 * Used throughout the application for database operations.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Payment record type definition.
 * Represents a single payment transaction in the system.
 */
export interface Payment {
  id: string;
  client_name: string;
  payment_method: 'Cash' | 'Zelle' | 'Check' | 'Booker CC';
  amount_paid: number;
  timestamp: string;
  service_type?: string;
  created_at: string;
  updated_at: string;
}
