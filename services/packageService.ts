import { supabase } from '../lib/supabase';
import { Package } from '../types';

export class PackageService {
  static async getAll(vendorId: string): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.transformFromDB);
  }

  static async create(pkg: Omit<Package, 'id'>, vendorId: string): Promise<Package> {
    const dbPackage = this.transformToDB(pkg, vendorId);
    
    const { data, error } = await supabase
      .from('packages')
      .insert([dbPackage])
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async update(id: string, updates: Partial<Package>): Promise<Package> {
    const dbUpdates = this.transformUpdatesToDB(updates);
    
    const { data, error } = await supabase
      .from('packages')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private static transformFromDB(data: any): Package {
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      physicalItems: data.physical_items || [],
      digitalItems: data.digital_items || [],
      processingTime: data.processing_time,
      photographers: data.photographers,
      videographers: data.videographers,
      coverImage: data.cover_image,
    };
  }

  private static transformToDB(pkg: Omit<Package, 'id'>, vendorId: string) {
    return {
      name: pkg.name,
      price: pkg.price,
      physical_items: pkg.physicalItems,
      digital_items: pkg.digitalItems,
      processing_time: pkg.processingTime,
      photographers: pkg.photographers,
      videographers: pkg.videographers,
      cover_image: pkg.coverImage,
      vendor_id: vendorId,
    };
  }

  private static transformUpdatesToDB(updates: Partial<Package>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.physicalItems !== undefined) dbUpdates.physical_items = updates.physicalItems;
    if (updates.digitalItems !== undefined) dbUpdates.digital_items = updates.digitalItems;
    if (updates.processingTime !== undefined) dbUpdates.processing_time = updates.processingTime;
    if (updates.photographers !== undefined) dbUpdates.photographers = updates.photographers;
    if (updates.videographers !== undefined) dbUpdates.videographers = updates.videographers;
    if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;

    return dbUpdates;
  }
}