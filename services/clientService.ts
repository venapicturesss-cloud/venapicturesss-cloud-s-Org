import { supabase } from '../lib/supabase';
import { Client, ClientStatus, ClientType } from '../types';

export class ClientService {
  static async getAll(vendorId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.transformFromDB);
  }

  static async create(client: Omit<Client, 'id'>, vendorId: string): Promise<Client> {
    const dbClient = this.transformToDB(client, vendorId);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([dbClient])
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async update(id: string, updates: Partial<Client>): Promise<Client> {
    const dbUpdates = this.transformUpdatesToDB(updates);
    
    const { data, error } = await supabase
      .from('clients')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByPortalAccessId(accessId: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('portal_access_id', accessId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.transformFromDB(data);
  }

  private static transformFromDB(data: any): Client {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      clientType: data.client_type as ClientType,
      status: data.status as ClientStatus,
      since: data.since,
      lastContact: data.last_contact,
      portalAccessId: data.portal_access_id,
    };
  }

  private static transformToDB(client: Omit<Client, 'id'>, vendorId: string) {
    return {
      name: client.name,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp,
      instagram: client.instagram,
      client_type: client.clientType,
      status: client.status,
      since: client.since,
      last_contact: client.lastContact,
      portal_access_id: client.portalAccessId,
      vendor_id: vendorId,
    };
  }

  private static transformUpdatesToDB(updates: Partial<Client>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
    if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram;
    if (updates.clientType !== undefined) dbUpdates.client_type = updates.clientType;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.since !== undefined) dbUpdates.since = updates.since;
    if (updates.lastContact !== undefined) dbUpdates.last_contact = updates.lastContact;
    if (updates.portalAccessId !== undefined) dbUpdates.portal_access_id = updates.portalAccessId;

    return dbUpdates;
  }
}