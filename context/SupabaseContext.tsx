import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  vendorId: string | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);

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
          setVendorId(null);
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

      const userData: User = {
        id: data.id,
        email: data.email,
        password: '', // Don't store password
        fullName: data.full_name,
        companyName: data.company_name,
        role: data.role,
        permissions: data.permissions,
        vendorId: data.vendor_id,
      };

      setUser(userData);
      setVendorId(data.vendor_id);
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
    setVendorId(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    vendorId,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};