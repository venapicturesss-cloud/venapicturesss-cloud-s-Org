import { supabase } from '../lib/supabase';
import { TeamMember, PerformanceNote } from '../types';

export class TeamMemberService {
  static async getAll(vendorId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.transformFromDB);
  }

  static async create(member: Omit<TeamMember, 'id'>, vendorId: string): Promise<TeamMember> {
    const dbMember = this.transformToDB(member, vendorId);
    const { data, error } = await supabase
      .from('team_members')
      .insert([dbMember])
      .select()
      .single();

    if (error) throw error;
    return this.transformFromDB(data);
  }

  static async update(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const dbUpdates = this.transformUpdatesToDB(updates);
    const { data, error } = await supabase
      .from('team_members')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformFromDB(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByPortalAccessId(accessId: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('portal_access_id', accessId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.transformFromDB(data);
  }

  private static transformFromDB(dbData: any): TeamMember {
    return {
      id: dbData.id,
      name: dbData.name,
      role: dbData.role,
      email: dbData.email,
      phone: dbData.phone,
      standardFee: dbData.standard_fee,
      noRek: dbData.no_rek,
      rewardBalance: dbData.reward_balance,
      rating: dbData.rating,
      performanceNotes: dbData.performance_notes || [],
      portalAccessId: dbData.portal_access_id,
    };
  }

  private static transformToDB(member: Omit<TeamMember, 'id'>, vendorId: string) {
    return {
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      standard_fee: member.standardFee,
      no_rek: member.noRek,
      reward_balance: member.rewardBalance,
      rating: member.rating,
      performance_notes: member.performanceNotes,
      portal_access_id: member.portalAccessId,
      vendor_id: vendorId,
    };
  }

  private static transformUpdatesToDB(updates: Partial<TeamMember>): any {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.standardFee !== undefined) dbUpdates.standard_fee = updates.standardFee;
    if (updates.noRek !== undefined) dbUpdates.no_rek = updates.noRek;
    if (updates.rewardBalance !== undefined) dbUpdates.reward_balance = updates.rewardBalance;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.performanceNotes !== undefined) dbUpdates.performance_notes = updates.performanceNotes;
    if (updates.portalAccessId !== undefined) dbUpdates.portal_access_id = updates.portalAccessId;
    return dbUpdates;
  }
}
