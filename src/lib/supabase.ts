import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Split = {
  id: string;
  on_chain_id: number | null;
  name: string;
  creator_address: string;
  created_at: string;
};

export type Recipient = {
  id: string;
  split_id: string;
  address: string;
  percentage: number; // in basis points
};

export type Payment = {
  id: string;
  split_id: string;
  payer_address: string;
  amount: string;
  tx_hash: string;
  created_at: string;
};
