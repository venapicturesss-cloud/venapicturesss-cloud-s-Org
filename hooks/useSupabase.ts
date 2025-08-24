import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Client, Project, Package, AddOn, TeamMember, Transaction, 
  Lead, Card, FinancialPocket, Asset, Contract, ClientFeedback,
  Notification, SocialMediaPost, PromoCode, SOP, Profile, User,
  TeamProjectPayment, TeamPaymentRecord, RewardLedgerEntry
} from '../types';

// Helper function to get current vendor ID
const getCurrentVendorId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: userData } = await supabase
    .from('users')
    .select('vendor_id')
    .eq('id', user.id)
    .single();
    
  return userData?.vendor_id || null;
};

// Generic CRUD hooks
export const useSupabaseData = <T extends { id: string; vendor_id?: string }>(
  tableName: string,
  transform?: (data: any) => T
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const vendorId = await getCurrentVendorId();
      if (!vendorId) {
        throw new Error('No vendor ID found');
      }

      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = transform 
        ? result?.map(transform) || []
        : result || [];
        
      setData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const create = async (newItem: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const vendorId = await getCurrentVendorId();
      if (!vendorId) throw new Error('No vendor ID found');

      const { data: result, error } = await supabase
        .from(tableName)
        .insert([{ ...newItem, vendor_id: vendorId }])
        .select()
        .single();

      if (error) throw error;

      const transformedResult = transform ? transform(result) : result;
      setData(prev => [transformedResult, ...prev]);
      return transformedResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedResult = transform ? transform(result) : result;
      setData(prev => prev.map(item => item.id === id ? transformedResult : item));
      return transformedResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove
  };
};

// Specific hooks for each entity
export const useClients = () => {
  return useSupabaseData<Client>('clients', (data) => ({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp,
    instagram: data.instagram,
    clientType: data.client_type,
    status: data.status,
    since: data.since,
    lastContact: data.last_contact,
    portalAccessId: data.portal_access_id,
  }));
};

export const useProjects = () => {
  return useSupabaseData<Project>('projects', (data) => ({
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
    paymentStatus: data.payment_status,
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
  }));
};

export const usePackages = () => {
  return useSupabaseData<Package>('packages', (data) => ({
    id: data.id,
    name: data.name,
    price: data.price,
    physicalItems: data.physical_items || [],
    digitalItems: data.digital_items || [],
    processingTime: data.processing_time,
    photographers: data.photographers,
    videographers: data.videographers,
    coverImage: data.cover_image,
  }));
};

export const useAddOns = () => {
  return useSupabaseData<AddOn>('add_ons');
};

export const useTeamMembers = () => {
  return useSupabaseData<TeamMember>('team_members', (data) => ({
    id: data.id,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    standardFee: data.standard_fee,
    noRek: data.no_rek,
    rewardBalance: data.reward_balance,
    rating: data.rating,
    performanceNotes: data.performance_notes || [],
    portalAccessId: data.portal_access_id,
  }));
};

export const useTransactions = () => {
  return useSupabaseData<Transaction>('transactions', (data) => ({
    id: data.id,
    date: data.date,
    description: data.description,
    amount: data.amount,
    type: data.type,
    projectId: data.project_id,
    category: data.category,
    method: data.method,
    pocketId: data.pocket_id,
    cardId: data.card_id,
    printingItemId: data.printing_item_id,
    vendorSignature: data.vendor_signature,
  }));
};

export const useLeads = () => {
  return useSupabaseData<Lead>('leads', (data) => ({
    id: data.id,
    name: data.name,
    contactChannel: data.contact_channel,
    location: data.location,
    status: data.status,
    date: data.date,
    notes: data.notes,
    whatsapp: data.whatsapp,
  }));
};

export const useCards = () => {
  return useSupabaseData<Card>('cards', (data) => ({
    id: data.id,
    cardHolderName: data.card_holder_name,
    bankName: data.bank_name,
    cardType: data.card_type,
    lastFourDigits: data.last_four_digits,
    expiryDate: data.expiry_date,
    balance: data.balance,
    colorGradient: data.color_gradient,
  }));
};

// Authentication hooks
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser({
        id: data.id,
        email: data.email,
        password: '', // Don't store password
        fullName: data.full_name,
        companyName: data.company_name,
        role: data.role,
        permissions: data.permissions,
        vendorId: data.vendor_id,
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
};