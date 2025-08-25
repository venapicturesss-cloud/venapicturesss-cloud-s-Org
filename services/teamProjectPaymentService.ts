import { supabase } from '../lib/supabase';
import { TeamProjectPayment } from '../types';

export class TeamProjectPaymentService {
  static async getAll(vendorId: string): Promise<TeamProjectPayment[]> {
    const { data, error } = await supabase
      .from('team_project_payments')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async create(payment: Omit<TeamProjectPayment, 'id'>, vendorId: string): Promise<TeamProjectPayment> {
    const { data, error } = await supabase
      .from('team_project_payments')
      .insert([{ ...payment, vendor_id: vendorId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<TeamProjectPayment>): Promise<TeamProjectPayment> {
    const { data, error } = await supabase
      .from('team_project_payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_project_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
