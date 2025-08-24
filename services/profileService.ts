import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export class ProfileService {
  static async get(vendorId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.transformFromDB(data);
  }

  static async create(profile: Profile, vendorId: string): Promise<Profile> {
    const dbProfile = this.transformToDB(profile, vendorId);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([dbProfile])
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  static async update(vendorId: string, updates: Partial<Profile>): Promise<Profile> {
    const dbUpdates = this.transformUpdatesToDB(updates);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('vendor_id', vendorId)
      .select()
      .single();

    if (error) throw error;

    return this.transformFromDB(data);
  }

  private static transformFromDB(data: any): Profile {
    return {
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      companyName: data.company_name,
      website: data.website || '',
      address: data.address,
      bankAccount: data.bank_account,
      authorizedSigner: data.authorized_signer,
      idNumber: data.id_number,
      bio: data.bio || '',
      incomeCategories: data.income_categories || [],
      expenseCategories: data.expense_categories || [],
      projectTypes: data.project_types || [],
      eventTypes: data.event_types || [],
      assetCategories: data.asset_categories || [],
      sopCategories: data.sop_categories || [],
      projectStatusConfig: data.project_status_config || [],
      notificationSettings: data.notification_settings || {},
      securitySettings: data.security_settings || {},
      briefingTemplate: data.briefing_template || '',
      termsAndConditions: data.terms_and_conditions,
      contractTemplate: data.contract_template,
      logoBase64: data.logo_base64,
      brandColor: data.brand_color,
      publicPageConfig: data.public_page_config || {},
      packageShareTemplate: data.package_share_template,
      bookingFormTemplate: data.booking_form_template,
      chatTemplates: data.chat_templates,
      currentPlanId: data.current_plan_id,
    };
  }

  private static transformToDB(profile: Profile, vendorId: string) {
    return {
      full_name: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      company_name: profile.companyName,
      website: profile.website,
      address: profile.address,
      bank_account: profile.bankAccount,
      authorized_signer: profile.authorizedSigner,
      id_number: profile.idNumber,
      bio: profile.bio,
      income_categories: profile.incomeCategories,
      expense_categories: profile.expenseCategories,
      project_types: profile.projectTypes,
      event_types: profile.eventTypes,
      asset_categories: profile.assetCategories,
      sop_categories: profile.sopCategories,
      project_status_config: profile.projectStatusConfig,
      notification_settings: profile.notificationSettings,
      security_settings: profile.securitySettings,
      briefing_template: profile.briefingTemplate,
      terms_and_conditions: profile.termsAndConditions,
      contract_template: profile.contractTemplate,
      logo_base64: profile.logoBase64,
      brand_color: profile.brandColor,
      public_page_config: profile.publicPageConfig,
      package_share_template: profile.packageShareTemplate,
      booking_form_template: profile.bookingFormTemplate,
      chat_templates: profile.chatTemplates,
      current_plan_id: profile.currentPlanId,
      vendor_id: vendorId,
    };
  }

  private static transformUpdatesToDB(updates: Partial<Profile>) {
    const dbUpdates: any = {};
    
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.bankAccount !== undefined) dbUpdates.bank_account = updates.bankAccount;
    if (updates.authorizedSigner !== undefined) dbUpdates.authorized_signer = updates.authorizedSigner;
    if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.incomeCategories !== undefined) dbUpdates.income_categories = updates.incomeCategories;
    if (updates.expenseCategories !== undefined) dbUpdates.expense_categories = updates.expenseCategories;
    if (updates.projectTypes !== undefined) dbUpdates.project_types = updates.projectTypes;
    if (updates.eventTypes !== undefined) dbUpdates.event_types = updates.eventTypes;
    if (updates.assetCategories !== undefined) dbUpdates.asset_categories = updates.assetCategories;
    if (updates.sopCategories !== undefined) dbUpdates.sop_categories = updates.sopCategories;
    if (updates.projectStatusConfig !== undefined) dbUpdates.project_status_config = updates.projectStatusConfig;
    if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
    if (updates.securitySettings !== undefined) dbUpdates.security_settings = updates.securitySettings;
    if (updates.briefingTemplate !== undefined) dbUpdates.briefing_template = updates.briefingTemplate;
    if (updates.termsAndConditions !== undefined) dbUpdates.terms_and_conditions = updates.termsAndConditions;
    if (updates.contractTemplate !== undefined) dbUpdates.contract_template = updates.contractTemplate;
    if (updates.logoBase64 !== undefined) dbUpdates.logo_base64 = updates.logoBase64;
    if (updates.brandColor !== undefined) dbUpdates.brand_color = updates.brandColor;
    if (updates.publicPageConfig !== undefined) dbUpdates.public_page_config = updates.publicPageConfig;
    if (updates.packageShareTemplate !== undefined) dbUpdates.package_share_template = updates.packageShareTemplate;
    if (updates.bookingFormTemplate !== undefined) dbUpdates.booking_form_template = updates.bookingFormTemplate;
    if (updates.chatTemplates !== undefined) dbUpdates.chat_templates = updates.chatTemplates;
    if (updates.currentPlanId !== undefined) dbUpdates.current_plan_id = updates.currentPlanId;

    return dbUpdates;
  }
}