import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseContext';
import { ClientService } from '../services/clientService';
import { ProjectService } from '../services/projectService';
import { PackageService } from '../services/packageService';
import { TransactionService } from '../services/transactionService';
import { LeadService } from '../services/leadService';
import { ProfileService } from '../services/profileService';
import { 
  Client, Project, Package, AddOn, TeamMember, Transaction, 
  Lead, Card, FinancialPocket, Asset, Contract, ClientFeedback,
  Notification, SocialMediaPost, PromoCode, SOP, Profile,
  TeamProjectPayment, TeamPaymentRecord, RewardLedgerEntry
} from '../types';
import { MOCK_DATA } from '../constants';

interface SupabaseDataManagerProps {
  children: (data: {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    packages: Package[];
    setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    loading: boolean;
    // Mock data for entities not yet migrated
    addOns: AddOn[];
    setAddOns: React.Dispatch<React.SetStateAction<AddOn[]>>;
    teamMembers: TeamMember[];
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    clientFeedback: ClientFeedback[];
    setClientFeedback: React.Dispatch<React.SetStateAction<ClientFeedback[]>>;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    socialMediaPosts: SocialMediaPost[];
    setSocialMediaPosts: React.Dispatch<React.SetStateAction<SocialMediaPost[]>>;
    promoCodes: PromoCode[];
    setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
    sops: SOP[];
    setSops: React.Dispatch<React.SetStateAction<SOP[]>>;
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    teamPaymentRecords: TeamPaymentRecord[];
    setTeamPaymentRecords: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
    rewardLedgerEntries: RewardLedgerEntry[];
    setRewardLedgerEntries: React.Dispatch<React.SetStateAction<RewardLedgerEntry[]>>;
    vendorId: string | null;
    reloadData: () => void;
  }) => React.ReactNode;
}

const SupabaseDataManager: React.FC<SupabaseDataManagerProps> = ({ children }) => {
  const { user, vendorId } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);

  // Supabase-connected data
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [profile, setProfile] = useState<Profile>(MOCK_DATA.profile);

  // Mock data for entities not yet migrated (will be migrated later)
  const [addOns, setAddOns] = useState<AddOn[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.addOns)));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.teamMembers)));
  const [cards, setCards] = useState<Card[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.cards)));
  const [pockets, setPockets] = useState<FinancialPocket[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.pockets)));
  const [assets, setAssets] = useState<Asset[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.assets)));
  const [contracts, setContracts] = useState<Contract[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.contracts)));
  const [clientFeedback, setClientFeedback] = useState<ClientFeedback[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.clientFeedback)));
  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.notifications)));
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.socialMediaPosts)));
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.promoCodes)));
  const [sops, setSops] = useState<SOP[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.sops)));
  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.teamProjectPayments)));
  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.teamPaymentRecords)));
  const [rewardLedgerEntries, setRewardLedgerEntries] = useState<RewardLedgerEntry[]>(() => JSON.parse(JSON.stringify(MOCK_DATA.rewardLedgerEntries)));

  useEffect(() => {
    if (user && vendorId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, vendorId]);

  const loadData = async () => {
    if (!vendorId) return;

    try {
      setLoading(true);

      // Load all data in parallel
      const [
        clientsData,
        projectsData,
        packagesData,
        transactionsData,
        leadsData,
        profileData,
      ] = await Promise.all([
        ClientService.getAll(vendorId),
        ProjectService.getAll(vendorId),
        PackageService.getAll(vendorId),
        TransactionService.getAll(vendorId),
        LeadService.getAll(vendorId),
        ProfileService.get(vendorId),
      ]);

      setClients(clientsData);
      setProjects(projectsData);
      setPackages(packagesData);
      setTransactions(transactionsData);
      setLeads(leadsData);
      
      if (profileData) {
        setProfile(profileData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced setters that sync with Supabase
  const setClientsWithSync = async (
    updater: React.SetStateAction<Client[]>
  ) => {
    if (!vendorId) return;
    
    setClients(prev => {
      const newClients = typeof updater === 'function' ? updater(prev) : updater;
      
      // Sync changes to Supabase (simplified - in production you'd want more sophisticated sync)
      const addedClients = newClients.filter(c => !prev.find(p => p.id === c.id));
      addedClients.forEach(async (client) => {
        try {
          await ClientService.create(client, vendorId);
        } catch (error) {
          console.error('Error syncing client to Supabase:', error);
        }
      });
      
      return newClients;
    });
  };

  const setProjectsWithSync = async (
    updater: React.SetStateAction<Project[]>
  ) => {
    if (!vendorId) return;
    
    setProjects(prev => {
      const newProjects = typeof updater === 'function' ? updater(prev) : updater;
      
      // Sync changes to Supabase
      const addedProjects = newProjects.filter(p => !prev.find(pr => pr.id === p.id));
      addedProjects.forEach(async (project) => {
        try {
          await ProjectService.create(project, vendorId);
        } catch (error) {
          console.error('Error syncing project to Supabase:', error);
        }
      });
      
      return newProjects;
    });
  };

  const setPackagesWithSync = async (
    updater: React.SetStateAction<Package[]>
  ) => {
    if (!vendorId) return;
    
    setPackages(prev => {
      const newPackages = typeof updater === 'function' ? updater(prev) : updater;
      
      // Sync changes to Supabase
      const addedPackages = newPackages.filter(p => !prev.find(pk => pk.id === p.id));
      addedPackages.forEach(async (pkg) => {
        try {
          await PackageService.create(pkg, vendorId);
        } catch (error) {
          console.error('Error syncing package to Supabase:', error);
        }
      });
      
      return newPackages;
    });
  };

  const setTransactionsWithSync = async (
    updater: React.SetStateAction<Transaction[]>
  ) => {
    if (!vendorId) return;
    
    setTransactions(prev => {
      const newTransactions = typeof updater === 'function' ? updater(prev) : updater;
      
      // Sync changes to Supabase
      const addedTransactions = newTransactions.filter(t => !prev.find(tr => tr.id === t.id));
      addedTransactions.forEach(async (transaction) => {
        try {
          await TransactionService.create(transaction, vendorId);
        } catch (error) {
          console.error('Error syncing transaction to Supabase:', error);
        }
      });
      
      return newTransactions;
    });
  };

  const setLeadsWithSync = async (
    updater: React.SetStateAction<Lead[]>
  ) => {
    if (!vendorId) return;
    
    setLeads(prev => {
      const newLeads = typeof updater === 'function' ? updater(prev) : updater;
      
      // Sync changes to Supabase
      const addedLeads = newLeads.filter(l => !prev.find(ld => ld.id === l.id));
      addedLeads.forEach(async (lead) => {
        try {
          await LeadService.create(lead, vendorId);
        } catch (error) {
          console.error('Error syncing lead to Supabase:', error);
        }
      });
      
      return newLeads;
    });
  };

  const setProfileWithSync = async (
    updater: React.SetStateAction<Profile>
  ) => {
    if (!vendorId) return;
    
    setProfile(prev => {
      const newProfile = typeof updater === 'function' ? updater(prev) : updater;
      
      // Sync to Supabase
      ProfileService.update(vendorId, newProfile).catch(error => {
        console.error('Error syncing profile to Supabase:', error);
      });
      
      return newProfile;
    });
  };

  return children({
    clients,
    setClients: setClientsWithSync,
    projects,
    setProjects: setProjectsWithSync,
    packages,
    setPackages: setPackagesWithSync,
    transactions,
    setTransactions: setTransactionsWithSync,
    leads,
    setLeads: setLeadsWithSync,
    profile,
    setProfile: setProfileWithSync,
    loading,
    // Mock data for entities not yet migrated
    addOns,
    setAddOns,
    teamMembers,
    setTeamMembers,
    cards,
    setCards,
    pockets,
    setPockets,
    assets,
    setAssets,
    contracts,
    setContracts,
    clientFeedback,
    setClientFeedback,
    notifications,
    setNotifications,
    socialMediaPosts,
    setSocialMediaPosts,
    promoCodes,
    setPromoCodes,
    sops,
    setSops,
    teamProjectPayments,
    setTeamProjectPayments,
    teamPaymentRecords,
    setTeamPaymentRecords,
    rewardLedgerEntries,
    setRewardLedgerEntries,
    vendorId,
    reloadData: loadData,
  });
};

export default SupabaseDataManager;