import { supabase } from '../lib/supabase';
import { Transaction, TransactionType } from '../types';

export class TransactionService {
  static async getAll(vendorId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(this.transformFromDB);
  }

  static async create(transaction: Omit<Transaction, 'id'>, vendorId: string): Promise<Transaction> {
    const dbTransaction = this.transformToDB(transaction, vendorId);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([dbTransaction])
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const dbUpdates = this.transformUpdatesToDB(updates);
    
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByProjectId(projectId: string, vendorId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('project_id', projectId)
      .eq('vendor_id', vendorId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(this.transformFromDB);
  }

  private static transformFromDB(data: any): Transaction {
    return {
      id: data.id,
      date: data.date,
      description: data.description,
      amount: data.amount,
      type: data.type as TransactionType,
      projectId: data.project_id,
      category: data.category,
      method: data.method,
      pocketId: data.pocket_id,
      cardId: data.card_id,
      printingItemId: data.printing_item_id,
      vendorSignature: data.vendor_signature,
    };
  }

  private static transformToDB(transaction: Omit<Transaction, 'id'>, vendorId: string) {
    return {
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      project_id: transaction.projectId,
      category: transaction.category,
      method: transaction.method,
      pocket_id: transaction.pocketId,
      card_id: transaction.cardId,
      printing_item_id: transaction.printingItemId,
      vendor_signature: transaction.vendorSignature,
      vendor_id: vendorId,
    };
  }

  private static transformUpdatesToDB(updates: Partial<Transaction>) {
    const dbUpdates: any = {};
    
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.method !== undefined) dbUpdates.method = updates.method;
    if (updates.pocketId !== undefined) dbUpdates.pocket_id = updates.pocketId;
    if (updates.cardId !== undefined) dbUpdates.card_id = updates.cardId;
    if (updates.printingItemId !== undefined) dbUpdates.printing_item_id = updates.printingItemId;
    if (updates.vendorSignature !== undefined) dbUpdates.vendor_signature = updates.vendorSignature;

    return dbUpdates;
  }
}