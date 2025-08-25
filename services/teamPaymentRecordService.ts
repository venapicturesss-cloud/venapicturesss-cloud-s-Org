import { supabase } from '../lib/supabase';
import { TeamPaymentRecord } from '../types';

export class TeamPaymentRecordService {
  static async getAll(vendorId: string): Promise<TeamPaymentRecord[]> {
    const { data, error } = await supabase
      .from('team_payment_records')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async create(record: Omit<TeamPaymentRecord, 'id'>, vendorId: string): Promise<TeamPaymentRecord> {
    const { data, error } = await supabase
      .from('team_payment_records')
      .insert([{ ...record, vendor_id: vendorId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<TeamPaymentRecord>): Promise<TeamPaymentRecord> {
    const { data, error } = await supabase
      .from('team_payment_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_payment_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
