import { supabase } from '../lib/supabase';
import { Lead, LeadStatus, ContactChannel } from '../types';

export class LeadService {
  static async getAll(vendorId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.transformFromDB);
  }

  static async create(lead: Omit<Lead, 'id'>, vendorId: string): Promise<Lead> {
    const dbLead = this.transformToDB(lead, vendorId);
    
    const { data, error } = await supabase
      .from('leads')
      .insert([dbLead])
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const dbUpdates = this.transformUpdatesToDB(updates);
    
    const { data, error } = await supabase
      .from('leads')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private static transformFromDB(data: any): Lead {
    return {
      id: data.id,
      name: data.name,
      contactChannel: data.contact_channel as ContactChannel,
      location: data.location,
      status: data.status as LeadStatus,
      date: data.date,
      notes: data.notes,
      whatsapp: data.whatsapp,
    };
  }

  private static transformToDB(lead: Omit<Lead, 'id'>, vendorId: string) {
    return {
      name: lead.name,
      contact_channel: lead.contactChannel,
      location: lead.location,
      status: lead.status,
      date: lead.date,
      notes: lead.notes,
      whatsapp: lead.whatsapp,
      vendor_id: vendorId,
    };
  }

  private static transformUpdatesToDB(updates: Partial<Lead>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.contactChannel !== undefined) dbUpdates.contact_channel = updates.contactChannel;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;

    return dbUpdates;
  }
}