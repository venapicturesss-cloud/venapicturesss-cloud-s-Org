import { supabase } from '../lib/supabase';
import { Project, PaymentStatus } from '../types';

export class ProjectService {
  static async getAll(vendorId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.transformFromDB);
  }

  static async create(project: Omit<Project, 'id'>, vendorId: string): Promise<Project> {
    const dbProject = this.transformToDB(project, vendorId);
    
    const { data, error } = await supabase
      .from('projects')
      .insert([dbProject])
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async update(id: string, updates: Partial<Project>): Promise<Project> {
    const dbUpdates = this.transformUpdatesToDB(updates);
    
    const { data, error } = await supabase
      .from('projects')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByClientId(clientId: string, vendorId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.transformFromDB);
  }

  private static transformFromDB(data: any): Project {
    return {
      id: data.id,
      projectName: data.project_name,
      clientName: data.client_name,
      clientId: data.client_id,
      projectType: data.project_type,
      packageName: data.package_name,
      packageId: data.package_id,
      addOns: data.add_ons || [],
      date: data.date,
      deadlineDate: data.deadline_date,
      location: data.location,
      progress: data.progress,
      status: data.status,
      activeSubStatuses: data.active_sub_statuses,
      totalCost: data.total_cost,
      amountPaid: data.amount_paid,
      paymentStatus: data.payment_status as PaymentStatus,
      team: data.team || [],
      notes: data.notes,
      accommodation: data.accommodation,
      driveLink: data.drive_link,
      clientDriveLink: data.client_drive_link,
      finalDriveLink: data.final_drive_link,
      startTime: data.start_time,
      endTime: data.end_time,
      image: data.image,
      revisions: data.revisions,
      promoCodeId: data.promo_code_id,
      discountAmount: data.discount_amount,
      shippingDetails: data.shipping_details,
      dpProofUrl: data.dp_proof_url,
      printingDetails: data.printing_details,
      printingCost: data.printing_cost,
      transportCost: data.transport_cost,
      bookingStatus: data.booking_status,
      rejectionReason: data.rejection_reason,
      chatHistory: data.chat_history || [],
    };
  }

  private static transformToDB(project: Omit<Project, 'id'>, vendorId: string) {
    return {
      project_name: project.projectName,
      client_name: project.clientName,
      client_id: project.clientId,
      project_type: project.projectType,
      package_name: project.packageName,
      package_id: project.packageId,
      add_ons: project.addOns,
      date: project.date,
      deadline_date: project.deadlineDate,
      location: project.location,
      progress: project.progress,
      status: project.status,
      active_sub_statuses: project.activeSubStatuses,
      total_cost: project.totalCost,
      amount_paid: project.amountPaid,
      payment_status: project.paymentStatus,
      team: project.team,
      notes: project.notes,
      accommodation: project.accommodation,
      drive_link: project.driveLink,
      client_drive_link: project.clientDriveLink,
      final_drive_link: project.finalDriveLink,
      start_time: project.startTime,
      end_time: project.endTime,
      image: project.image,
      revisions: project.revisions,
      promo_code_id: project.promoCodeId,
      discount_amount: project.discountAmount,
      shipping_details: project.shippingDetails,
      dp_proof_url: project.dpProofUrl,
      printing_details: project.printingDetails,
      printing_cost: project.printingCost,
      transport_cost: project.transportCost,
      booking_status: project.bookingStatus,
      rejection_reason: project.rejectionReason,
      chat_history: project.chatHistory,
      vendor_id: vendorId,
    };
  }

  private static transformUpdatesToDB(updates: Partial<Project>) {
    const dbUpdates: any = {};
    
    if (updates.projectName !== undefined) dbUpdates.project_name = updates.projectName;
    if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.projectType !== undefined) dbUpdates.project_type = updates.projectType;
    if (updates.packageName !== undefined) dbUpdates.package_name = updates.packageName;
    if (updates.packageId !== undefined) dbUpdates.package_id = updates.packageId;
    if (updates.addOns !== undefined) dbUpdates.add_ons = updates.addOns;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.deadlineDate !== undefined) dbUpdates.deadline_date = updates.deadlineDate;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.activeSubStatuses !== undefined) dbUpdates.active_sub_statuses = updates.activeSubStatuses;
    if (updates.totalCost !== undefined) dbUpdates.total_cost = updates.totalCost;
    if (updates.amountPaid !== undefined) dbUpdates.amount_paid = updates.amountPaid;
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.team !== undefined) dbUpdates.team = updates.team;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.accommodation !== undefined) dbUpdates.accommodation = updates.accommodation;
    if (updates.driveLink !== undefined) dbUpdates.drive_link = updates.driveLink;
    if (updates.clientDriveLink !== undefined) dbUpdates.client_drive_link = updates.clientDriveLink;
    if (updates.finalDriveLink !== undefined) dbUpdates.final_drive_link = updates.finalDriveLink;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.revisions !== undefined) dbUpdates.revisions = updates.revisions;
    if (updates.promoCodeId !== undefined) dbUpdates.promo_code_id = updates.promoCodeId;
    if (updates.discountAmount !== undefined) dbUpdates.discount_amount = updates.discountAmount;
    if (updates.shippingDetails !== undefined) dbUpdates.shipping_details = updates.shippingDetails;
    if (updates.dpProofUrl !== undefined) dbUpdates.dp_proof_url = updates.dpProofUrl;
    if (updates.printingDetails !== undefined) dbUpdates.printing_details = updates.printingDetails;
    if (updates.printingCost !== undefined) dbUpdates.printing_cost = updates.printingCost;
    if (updates.transportCost !== undefined) dbUpdates.transport_cost = updates.transportCost;
    if (updates.bookingStatus !== undefined) dbUpdates.booking_status = updates.bookingStatus;
    if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
    if (updates.chatHistory !== undefined) dbUpdates.chat_history = updates.chatHistory;

    return dbUpdates;
  }
}