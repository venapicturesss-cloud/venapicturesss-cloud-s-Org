import React, { useState, useEffect } from 'react';
import { SupabaseProvider } from './context/SupabaseContext';
import { useSupabaseAuth } from './context/SupabaseContext';
import SupabaseLogin from './components/SupabaseLogin';
import SupabaseDataManager from './components/SupabaseDataManager';
import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry, User, Card, Asset, ClientFeedback, Contract, RevisionStatus, NavigationAction, Notification, SocialMediaPost, PromoCode, SOP, CardType, PocketType, VendorData } from './types';
import { MOCK_USERS, DEFAULT_USER_PROFILE, MOCK_DATA, HomeIcon, FolderKanbanIcon, UsersIcon, DollarSignIcon, PlusIcon, lightenColor, darkenColor, hexToHsl } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { Leads } from './components/Leads';
import Booking from './components/Booking';
import Clients from './components/Clients';
import { Projects } from './components/Projects';
import { Freelancers } from './components/Freelancers';
import Finance from './components/Finance';
import Packages from './components/Packages';
import Assets from './components/Assets';
import Settings from './components/Settings';
import { CalendarView } from './components/CalendarView';
import Login from './components/Login';
import PublicBookingForm from './components/PublicBookingForm';
import PublicPackages from './components/PublicPackages';
import PublicFeedbackForm from './components/PublicFeedbackForm';
import PublicRevisionForm from './components/PublicRevisionForm';
import PublicLeadForm from './components/PublicLeadForm';
import Header from './components/Header';
import SuggestionForm from './components/SuggestionForm';
import ClientReports from './components/ClientKPI';
import GlobalSearch from './components/GlobalSearch';
import Contracts from './components/Contracts';
import ClientPortal from './components/ClientPortal';
import FreelancerPortal from './components/FreelancerPortal';
import { SocialPlanner } from './components/SocialPlanner';
import PromoCodes from './components/PromoCodes';
import SOPManagement from './components/SOP';
import Homepage from './components/Homepage';

const AccessDenied: React.FC<{onBackToDashboard: () => void}> = ({ onBackToDashboard }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-bold text-brand-danger mb-2">Akses Ditolak</h2>
        <p className="text-brand-text-secondary mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <button onClick={onBackToDashboard} className="button-primary">Kembali ke Dashboard</button>
    </div>
);

const BottomNavBar: React.FC<{ activeView: ViewType; handleNavigation: (view: ViewType) => void }> = ({ activeView, handleNavigation }) => {
    const navItems = [
        { view: ViewType.DASHBOARD, label: 'Beranda', icon: HomeIcon },
        { view: ViewType.PROJECTS, label: 'Proyek', icon: FolderKanbanIcon },
        { view: ViewType.CLIENTS, label: 'Klien', icon: UsersIcon },
        { view: ViewType.FINANCE, label: 'Keuangan', icon: DollarSignIcon },
    ];

    return (
        <nav className="bottom-nav xl:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => handleNavigation(item.view)}
                        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeView === item.view ? 'text-brand-accent' : 'text-brand-text-secondary'}`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

const App: React.FC = () => {
  return (
    <SupabaseProvider>
      <AppContent />
    </SupabaseProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, loading: authLoading, signOut } = useSupabaseAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>(ViewType.HOMEPAGE);
  const [notification, setNotification] = useState<string>('');
  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Check authentication status based on Supabase user
  useEffect(() => {
    setIsAuthenticated(!!user);
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-brand-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SupabaseLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <SupabaseDataManager>
      {(data) => <MainApp {...data} currentUser={user} handleLogout={signOut} />}
    </SupabaseDataManager>
  );
};

interface MainAppProps {
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
  currentUser: User | null;
  handleLogout: () => void;
  vendorId: string | null;
  reloadData: () => void;
}

const MainApp: React.FC<MainAppProps> = ({
  clients, setClients, projects, setProjects, packages, setPackages,
  transactions, setTransactions, leads, setLeads, profile, setProfile,
  loading, addOns, setAddOns, teamMembers, setTeamMembers, cards, setCards,
  pockets, setPockets, assets, setAssets, contracts, setContracts,
  clientFeedback, setClientFeedback, notifications, setNotifications,
  socialMediaPosts, setSocialMediaPosts, promoCodes, setPromoCodes,
  sops, setSops, teamProjectPayments, setTeamProjectPayments,
  teamPaymentRecords, setTeamPaymentRecords, rewardLedgerEntries, setRewardLedgerEntries,
  currentUser, handleLogout, vendorId, reloadData
}) => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [notification, setNotification] = useState<string>('');
  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-brand-text-secondary">Loading data...</p>
        </div>
      </div>
    );
  }


    // --- [NEW] MOCK EMAIL SERVICE ---
    const sendEmailNotification = (recipientEmail: string, notification: Notification) => {
        console.log(`
        ========================================
        [SIMULASI EMAIL] Mengirim notifikasi ke: ${recipientEmail}
        ----------------------------------------
        Judul: ${notification.title}
        Pesan: ${notification.message}
        Waktu: ${new Date(notification.timestamp).toLocaleString('id-ID')}
        ========================================
        `);
    };

    // --- [NEW] CENTRALIZED NOTIFICATION HANDLER ---
    const addNotification = (newNotificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            id: `NOTIF-${Date.now()}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            ...newNotificationData
        };

        setNotifications(prev => [newNotification, ...prev]);

        if (profile.email) {
            sendEmailNotification(profile.email, newNotification);
        } else {
            console.warn('[SIMULASI EMAIL] Gagal: Alamat email vendor tidak diatur di Pengaturan Profil.');
        }
    };

  useEffect(() => {
    const handleHashChange = () => {
        const newRoute = window.location.hash || '#/home';
        setRoute(newRoute);
        if (!currentUser) {
            const isPublicRoute = newRoute.startsWith('#/public') || newRoute.startsWith('#/feedback') || newRoute.startsWith('#/suggestion-form') || newRoute.startsWith('#/revision-form') || newRoute.startsWith('#/portal') || newRoute.startsWith('#/freelancer-portal') || newRoute.startsWith('#/login') || newRoute === '#/home' || newRoute === '#';
            if (!isPublicRoute) {
                window.location.hash = '#/home';
            }
        }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);
  
  useEffect(() => {
        const styleElement = document.getElementById('public-theme-style');
        const isPublicRoute = route.startsWith('#/public') || route.startsWith('#/portal') || route.startsWith('#/freelancer-portal');
        
        document.body.classList.toggle('app-theme', !isPublicRoute);
        document.body.classList.toggle('public-page-body', isPublicRoute);

        if (isPublicRoute) {
            const brandColor = profile.brandColor || '#3b82f6';
            
            if (styleElement) {
                const hoverColor = darkenColor(brandColor, 10);
                const brandHsl = hexToHsl(brandColor);
                styleElement.innerHTML = `
                    :root {
                        --public-accent: ${brandColor};
                        --public-accent-hover: ${hoverColor};
                        --public-accent-hsl: ${brandHsl};
                    }
                `;
            }
        } else if (styleElement) {
            styleElement.innerHTML = '';
        }

    }, [route, profile.brandColor]);

  const showNotification = (message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, duration);
  };

  const handleSetProfile = (value: React.SetStateAction<Profile>) => {
    setProfile(value);
  };

  const handleLoginSuccess = (user: User) => {
    // This is now handled by Supabase auth
  };
  
  // handleLogout is now passed from parent (Supabase signOut)

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNavigation = (view: ViewType, action?: NavigationAction, notificationId?: string) => {
    const viewRouteMap: { [key in ViewType]?: string } = {
        [ViewType.HOMEPAGE]: '#/home',
        [ViewType.DASHBOARD]: '#/dashboard',
        [ViewType.CLIENTS]: '#/clients',
        [ViewType.PROJECTS]: '#/projects',
    };

    const routeKey = Object.keys(viewRouteMap).find(key => key === view) as ViewType | undefined;
    
    let newRoute = '#/dashboard'; // Default fallback
    if (routeKey && viewRouteMap[routeKey]) {
        newRoute = viewRouteMap[routeKey]!;
    } else {
        newRoute = `#/${view.toLowerCase().replace(/ /g, '-')}`;
    }

    window.location.hash = newRoute;

    setActiveView(view);
    setInitialAction(action || null);
    setIsSidebarOpen(false); // Close sidebar on navigation
    setIsSearchOpen(false); // Close search on navigation
    if (notificationId) {
        handleMarkAsRead(notificationId);
    }
  };

  const hasPermission = (view: ViewType) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (view === ViewType.DASHBOARD) return true;
    return currentUser.permissions?.includes(view) || false;
  };
  
  const renderView = () => {
    if (!hasPermission(activeView)) {
        return <AccessDenied onBackToDashboard={() => setActiveView(ViewType.DASHBOARD)} />;
    }
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <Dashboard 
          projects={projects} 
          clients={clients} 
          transactions={transactions} 
          teamMembers={teamMembers}
          cards={cards}
          pockets={pockets}
          handleNavigation={handleNavigation}
          leads={leads}
          teamProjectPayments={teamProjectPayments}
          packages={packages}
          assets={assets}
          clientFeedback={clientFeedback}
          contracts={contracts}
          currentUser={currentUser}
          projectStatusConfig={profile.projectStatusConfig}
        />;
      case ViewType.PROSPEK:
        return <Leads
            leads={leads} setLeads={setLeads}
            clients={clients} setClients={setClients}
            projects={projects} setProjects={setProjects}
            packages={packages} addOns={addOns}
            transactions={transactions} setTransactions={setTransactions}
            userProfile={profile} setProfile={handleSetProfile} showNotification={showNotification}
            cards={cards} setCards={setCards}
            pockets={pockets} setPockets={setPockets}
            promoCodes={promoCodes} setPromoCodes={setPromoCodes}
            vendorId={vendorId}
            reloadData={reloadData}
        />;
      case ViewType.BOOKING:
        return <Booking
            leads={leads}
            clients={clients}
            projects={projects}
            setProjects={setProjects}
            packages={packages}
            userProfile={profile}
            setProfile={setProfile}
            handleNavigation={handleNavigation}
            showNotification={showNotification}
        />;
      case ViewType.CLIENTS:
        return <Clients
          clients={clients} setClients={setClients}
          projects={projects} setProjects={setProjects}
          packages={packages} addOns={addOns}
          transactions={transactions} setTransactions={setTransactions}
          userProfile={profile}
          showNotification={showNotification}
          initialAction={initialAction} setInitialAction={setInitialAction}
          cards={cards} setCards={setCards}
          pockets={pockets} setPockets={setPockets}
          contracts={contracts}
          handleNavigation={handleNavigation}
          clientFeedback={clientFeedback}
          promoCodes={promoCodes} setPromoCodes={setPromoCodes}
          onSignInvoice={(pId, sig) => setProjects(prev => prev.map(p => p.id === pId ? { ...p, invoiceSignature: sig } : p))}
          onSignTransaction={(tId, sig) => setTransactions(prev => prev.map(t => t.id === tId ? { ...t, vendorSignature: sig } : t))}
          addNotification={addNotification}
          vendorId={vendorId}
          reloadData={reloadData}
        />;
      case ViewType.PROJECTS:
        return <Projects 
          projects={projects} setProjects={setProjects}
          clients={clients}
          packages={packages}
          teamMembers={teamMembers}
          teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPayments}
          transactions={transactions} setTransactions={setTransactions}
          initialAction={initialAction} setInitialAction={setInitialAction}
          profile={profile}
          showNotification={showNotification}
          cards={cards}
          setCards={setCards}
          vendorId={vendorId}
          reloadData={reloadData}
        />;
      case ViewType.TEAM:
        return (
          <Freelancers
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            teamProjectPayments={teamProjectPayments}
            setTeamProjectPayments={setTeamProjectPayments}
            teamPaymentRecords={teamPaymentRecords}
            setTeamPaymentRecords={setTeamPaymentRecords}
            transactions={transactions}
            setTransactions={setTransactions}
            userProfile={profile}
            showNotification={showNotification}
            initialAction={initialAction}
            setInitialAction={setInitialAction}
            projects={projects}
            setProjects={setProjects}
            rewardLedgerEntries={rewardLedgerEntries}
            setRewardLedgerEntries={setRewardLedgerEntries}
            pockets={pockets}
            setPockets={setPockets}
            cards={cards}
            setCards={setCards}
            onSignPaymentRecord={(rId, sig) => setTeamPaymentRecords(prev => prev.map(r => r.id === rId ? { ...r, vendorSignature: sig } : r))}
            vendorId={vendorId}
            reloadData={reloadData}
          />
        );
      case ViewType.FINANCE:
        return <Finance 
          transactions={transactions} setTransactions={setTransactions}
          pockets={pockets} setPockets={setPockets}
          projects={projects}
          profile={profile}
          cards={cards} setCards={setCards}
          teamMembers={teamMembers}
          rewardLedgerEntries={rewardLedgerEntries}
        />;
      case ViewType.PACKAGES:
        return <Packages packages={packages} setPackages={setPackages} addOns={addOns} setAddOns={setAddOns} projects={projects} vendorId={vendorId} reloadData={reloadData} />;
      case ViewType.ASSETS:
        return <Assets assets={assets} setAssets={setAssets} profile={profile} showNotification={showNotification} />;
      case ViewType.CONTRACTS:
        return <Contracts 
            contracts={contracts} setContracts={setContracts}
            clients={clients} projects={projects} profile={profile}
            showNotification={showNotification}
            initialAction={initialAction} setInitialAction={setInitialAction}
            packages={packages}
            onSignContract={(cId, sig, signer) => setContracts(prev => prev.map(c => c.id === cId ? { ...c, [signer === 'vendor' ? 'vendorSignature' : 'clientSignature']: sig } : c))}
        />;
      case ViewType.SOP:
        return <SOPManagement sops={sops} setSops={setSops} profile={profile} showNotification={showNotification} />;
      case ViewType.SETTINGS:
        return <Settings 
          profile={profile} setProfile={handleSetProfile} 
          transactions={transactions} projects={projects}
          users={[]} // Will be implemented later
          setUsers={() => {}} // Will be implemented later
          currentUser={currentUser}
        />;
      case ViewType.CALENDAR:
        return <CalendarView projects={projects} setProjects={setProjects} teamMembers={teamMembers} profile={profile} />;
      case ViewType.CLIENT_REPORTS:
        return <ClientReports 
            clients={clients}
            leads={leads}
            projects={projects}
            feedback={clientFeedback}
            setFeedback={setClientFeedback}
            showNotification={showNotification}
        />;
      case ViewType.SOCIAL_MEDIA_PLANNER:
        return <SocialPlanner posts={socialMediaPosts} setPosts={setSocialMediaPosts} projects={projects} showNotification={showNotification} />;
      case ViewType.PROMO_CODES:
        return <PromoCodes promoCodes={promoCodes} setPromoCodes={setPromoCodes} projects={projects} showNotification={showNotification} />;
      default:
        return <div />;
    }
  };
  
  // --- ROUTING LOGIC ---
  if (route.startsWith('#/home') || route === '#/') return <Homepage />;
  
  if (route.startsWith('#/public-packages')) {
    return <PublicPackages
        packages={packages}
        addOns={addOns}
        userProfile={profile}
        showNotification={showNotification}
        setClients={setClients}
        setProjects={setProjects}
        setTransactions={setTransactions}
        setCards={setCards}
        setLeads={setLeads}
        addNotification={addNotification}
        cards={cards}
        promoCodes={promoCodes}
        setPromoCodes={setPromoCodes}
    />;
  }
  if (route.startsWith('#/public-booking')) {
    const allDataForForm = { clients, projects, teamMembers, transactions, teamProjectPayments, teamPaymentRecords, pockets, profile, leads, rewardLedgerEntries, cards, assets, contracts, clientFeedback, notifications, socialMediaPosts, promoCodes, sops, packages, addOns };
    return <PublicBookingForm {...allDataForForm} userProfile={profile} showNotification={showNotification} setClients={setClients} setProjects={setProjects} setTransactions={setTransactions} setCards={setCards} setPockets={setPockets} setPromoCodes={setPromoCodes} setLeads={setLeads} addNotification={addNotification} />;
  }
  if (route.startsWith('#/public-lead-form')) {
    return <PublicLeadForm setLeads={setLeads} userProfile={profile} showNotification={showNotification} />;
  }
  
  if (route.startsWith('#/feedback')) return <PublicFeedbackForm setClientFeedback={setClientFeedback} />;
  if (route.startsWith('#/suggestion-form')) return <SuggestionForm setLeads={setLeads} />;
  if (route.startsWith('#/revision-form')) return <PublicRevisionForm projects={projects} teamMembers={teamMembers} onUpdateRevision={(pId, rId, data) => setProjects(prev => prev.map(p => p.id === pId ? {...p, revisions: p.revisions?.map(r => r.id === rId ? {...r, ...data, completedDate: new Date().toISOString()} : r)} : p))} />;
  if (route.startsWith('#/portal/')) {
    const accessId = route.split('/portal/')[1];
    return <ClientPortal accessId={accessId} clients={clients} projects={projects} setClientFeedback={setClientFeedback} showNotification={showNotification} contracts={contracts} transactions={transactions} userProfile={profile} packages={packages} onClientConfirmation={(pId, stage) => setProjects(prev => prev.map(p => p.id === pId ? {...p, [`is${stage.charAt(0).toUpperCase() + stage.slice(1)}ConfirmedByClient`]: true} : p))} onClientSubStatusConfirmation={(pId, sub, note) => setProjects(prev => prev.map(p => p.id === pId ? {...p, confirmedSubStatuses: [...(p.confirmedSubStatuses || []), sub], clientSubStatusNotes: {...(p.clientSubStatusNotes || {}), [sub]: note}} : p))} onSignContract={(cId, sig, signer) => setContracts(prev => prev.map(c => c.id === cId ? {...c, [signer === 'vendor' ? 'vendorSignature' : 'clientSignature']: sig} : c))} />;
  }
  if (route.startsWith('#/freelancer-portal/')) {
     const accessId = route.split('/freelancer-portal/')[1];
     return <FreelancerPortal accessId={accessId} teamMembers={teamMembers} projects={projects} teamProjectPayments={teamProjectPayments} teamPaymentRecords={teamPaymentRecords} rewardLedgerEntries={rewardLedgerEntries} showNotification={showNotification} onUpdateRevision={(pId, rId, data) => setProjects(prev => prev.map(p => p.id === pId ? {...p, revisions: p.revisions?.map(r => r.id === rId ? {...r, ...data, completedDate: new Date().toISOString()} : r)} : p))} sops={sops} userProfile={profile} />;
  }

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text-primary">
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => handleNavigation(view)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            pageTitle={activeView} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            setIsSearchOpen={setIsSearchOpen}
            notifications={notifications}
            handleNavigation={handleNavigation}
            handleMarkAllAsRead={handleMarkAllAsRead}
            currentUser={currentUser}
            profile={profile}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 xl:pb-8">
            {renderView()}
        </main>
      </div>
      {notification && (
        <div className="fixed top-5 right-5 bg-brand-accent text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
          {notification}
        </div>
      )}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
        handleNavigation={handleNavigation}
      />
      <BottomNavBar activeView={activeView} handleNavigation={handleNavigation} />
    </div>
  );
};

export default App;