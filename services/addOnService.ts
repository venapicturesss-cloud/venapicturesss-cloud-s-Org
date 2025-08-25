import { supabase } from '../lib/supabase';
import { AddOn } from '../types';

export class AddOnService {
  static async getAll(vendorId: string): Promise<AddOn[]> {
    const { data, error } = await supabase
      .from('add_ons')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async create(addOn: Omit<AddOn, 'id'>, vendorId: string): Promise<AddOn> {
    const { data, error } = await supabase
      .from('add_ons')
      .insert([{ ...addOn, vendor_id: vendorId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<AddOn>): Promise<AddOn> {
    const { data, error } = await supabase
      .from('add_ons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('add_ons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
