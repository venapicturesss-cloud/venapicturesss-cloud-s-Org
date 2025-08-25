import { supabase } from '../lib/supabase';
import { RewardLedgerEntry } from '../types';

export class RewardLedgerEntryService {
  static async getAll(vendorId: string): Promise<RewardLedgerEntry[]> {
    const { data, error } = await supabase
      .from('reward_ledger_entries')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async create(entry: Omit<RewardLedgerEntry, 'id'>, vendorId: string): Promise<RewardLedgerEntry> {
    const { data, error } = await supabase
      .from('reward_ledger_entries')
      .insert([{ ...entry, vendor_id: vendorId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update and Delete are less common for a ledger, but can be added if needed.
}
