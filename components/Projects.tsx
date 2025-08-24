import React, { useState, useMemo, useEffect } from 'react';
import { Project, PaymentStatus, TeamMember, Client, Package, TeamProjectPayment, Transaction, TransactionType, AssignedTeamMember, Profile, Revision, RevisionStatus, NavigationAction, AddOn, PrintingItem, Card, ProjectStatusConfig, SubStatusConfig } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import StatCard from './StatCard';
import DonutChart from './DonutChart';
import { EyeIcon, PlusIcon, PencilIcon, Trash2Icon, ListIcon, LayoutGridIcon, FolderKanbanIcon, AlertCircleIcon, CalendarIcon, CheckSquareIcon, Share2Icon, ClockIcon, UsersIcon, ArrowDownIcon, ArrowUpIcon, FileTextIcon, SendIcon, CheckCircleIcon, ClipboardListIcon, DollarSignIcon, MessageSquareIcon, BriefcaseIcon, LightbulbIcon } from '../constants';

const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.LUNAS: return 'bg-brand-success/20 text-brand-success';
        case PaymentStatus.DP_TERBAYAR: return 'bg-blue-500/20 text-blue-400';
        case PaymentStatus.BELUM_BAYAR: return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

const getRevisionStatusClass = (status: RevisionStatus) => {
    switch (status) {
        case RevisionStatus.COMPLETED: return 'bg-green-500/20 text-green-400';
        case RevisionStatus.IN_PROGRESS: return 'bg-blue-500/20 text-blue-400';
        case RevisionStatus.PENDING: return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getSubStatusText = (project: Project): string => {
    if (project.activeSubStatuses && project.activeSubStatuses.length > 0) {
        return project.activeSubStatuses.join(', ');
    }
    if (project.status === 'Dikirim' && project.shippingDetails) {
        return `Dikirim: ${project.shippingDetails}`;
    }
    return project.status;
};

const getStatusColor = (status: string, config: ProjectStatusConfig[]): string => {
    const statusConfig = config.find(c => c.name === status);
    return statusConfig ? statusConfig.color : '#64748b'; // slate-500 default
};

const getStatusClass = (status: string, config: ProjectStatusConfig[]) => {
    const color = getStatusColor(status, config);
     const colorMap: { [key: string]: string } = {
        '#10b981': 'bg-green-500/20 text-green-400', // Selesai
        '#3b82f6': 'bg-blue-500/20 text-blue-400', // Dikonfirmasi
        '#8b5cf6': 'bg-purple-500/20 text-purple-400', // Editing
        '#f97316': 'bg-orange-500/20 text-orange-400', // Cetak
        '#06b6d4': 'bg-cyan-500/20 text-cyan-400', // Dikirim
        '#eab308': 'bg-yellow-500/20 text-yellow-400', // Tertunda
        '#6366f1': 'bg-indigo-500/20 text-indigo-400', // Persiapan
        '#ef4444': 'bg-red-500/20 text-red-400', // Dibatalkan
        '#14b8a6': 'bg-teal-500/20 text-teal-400', // Revisi
    };
    return colorMap[color] || 'bg-gray-500/20 text-gray-400';
};

const ConfirmationIcons: React.FC<{ project: Project }> = ({ project }) => (
    <div className="flex items-center gap-1.5">
        {project.isEditingConfirmedByClient && <span title="Editing dikonfirmasi klien"><CheckCircleIcon className="w-4 h-4 text-green-500" /></span>}
        {project.isPrintingConfirmedByClient && <span title="Cetak dikonfirmasi klien"><CheckCircleIcon className="w-4 h-4 text-green-500" /></span>}
        {project.isDeliveryConfirmedByClient && <span title="Pengiriman dikonfirmasi klien"><CheckCircleIcon className="w-4 h-4 text-green-500" /></span>}
    </div>
);

// --- [NEW] ProjectForm Component ---
interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    formData: any; // Simplified for now
    onFormChange: (e: React.ChangeEvent<any>) => void;
    onSubStatusChange: (option: string, isChecked: boolean) => void;
    onClientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onTeamChange: (member: TeamMember) => void;
    onTeamFeeChange: (memberId: string, fee: number) => void;
    onTeamRewardChange: (memberId: string, reward: number) => void;
    onTeamSubJobChange: (memberId: string, subJob: string) => void;
    onCustomSubStatusChange: (index: number, field: 'name' | 'note', value: string) => void;
    onAddCustomSubStatus: () => void;
    onRemoveCustomSubStatus: (index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    clients: Client[];
    teamMembers: TeamMember[];
    profile: Profile;
    teamByRole: Record<string, TeamMember[]>;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    isOpen, onClose, mode, formData, onFormChange, onSubStatusChange, onClientChange,
    onTeamChange, onTeamFeeChange, onTeamRewardChange, onTeamSubJobChange,
    onCustomSubStatusChange, onAddCustomSubStatus, onRemoveCustomSubStatus,
    onSubmit, clients, teamMembers,
    profile, teamByRole
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Tambah Proyek Baru (Operasional)' : `Edit Proyek: ${formData.projectName}`}
            size="4xl"
        >
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* --- LEFT COLUMN --- */}
                    <div className="space-y-6">
                        {/* Section 1: Basic Info */}
                        <section>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">Informasi Dasar Proyek</h4>
                            <div className="space-y-4">
                                {mode === 'add' && (
                                    <div className="input-group">
                                        <select id="clientId" name="clientId" value={formData.clientId} onChange={onClientChange} className="input-field" required>
                                            <option value="">Pilih Klien...</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <label htmlFor="clientId" className="input-label">Klien</label>
                                    </div>
                                )}
                                <div className="input-group"><input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={onFormChange} className="input-field" placeholder=" " required /><label htmlFor="projectName" className="input-label">Nama Proyek</label></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group">
                                        <select id="projectType" name="projectType" value={formData.projectType} onChange={onFormChange} className="input-field" required>
                                            <option value="" disabled>Pilih Jenis...</option>
                                            {profile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                        </select>
                                        <label htmlFor="projectType" className="input-label">Jenis Proyek</label>
                                    </div>
                                    <div className="input-group">
                                        <select id="status" name="status" value={formData.status} onChange={onFormChange} className="input-field" required>
                                            {profile.projectStatusConfig.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                        <label htmlFor="status" className="input-label">Status Proyek</label>
                                    </div>
                                </div>
                                <div className="input-group"><input type="text" id="location" name="location" value={formData.location} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="location" className="input-label">Lokasi</label></div>
                            </div>
                        </section>

                        {/* Section 2: Schedule & Details */}
                        <section>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">Jadwal & Detail</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group"><input type="date" id="date" name="date" value={formData.date} onChange={onFormChange} className="input-field" placeholder=" " required /><label htmlFor="date" className="input-label">Tanggal Acara</label></div>
                                    <div className="input-group"><input type="date" id="deadlineDate" name="deadlineDate" value={formData.deadlineDate} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="deadlineDate" className="input-label">Deadline</label></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group"><input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="startTime" className="input-label">Waktu Mulai</label></div>
                                    <div className="input-group"><input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="endTime" className="input-label">Waktu Selesai</label></div>
                                </div>
                                {formData.status === 'Dikirim' && (
                                    <div className="input-group"><input type="text" id="shippingDetails" name="shippingDetails" value={formData.shippingDetails} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="shippingDetails" className="input-label">Detail Pengiriman</label></div>
                                )}
                            </div>
                        </section>

                        {/* Section 3: Links & Notes */}
                        <section>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">Tautan & Catatan</h4>
                            <div className="space-y-4">
                                <div className="input-group"><input type="url" id="driveLink" name="driveLink" value={formData.driveLink} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="driveLink" className="input-label">Link Brief/Moodboard (Internal)</label></div>
                                <div className="input-group"><input type="url" id="clientDriveLink" name="clientDriveLink" value={formData.clientDriveLink} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="clientDriveLink" className="input-label">Link File dari Klien</label></div>
                                <div className="input-group"><input type="url" id="finalDriveLink" name="finalDriveLink" value={formData.finalDriveLink} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="finalDriveLink" className="input-label">Link File Jadi (untuk Klien)</label></div>
                                <div className="input-group"><textarea id="notes" name="notes" value={formData.notes} onChange={onFormChange} className="input-field" placeholder=" " rows={4}></textarea><label htmlFor="notes" className="input-label">Catatan Tambahan</label></div>
                            </div>
                        </section>
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="space-y-6">
                        {/* Section 4: Team Assignment */}
                        <section>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">Tugas Tim</h4>
                            <div className="space-y-3">
                                {Object.entries(teamByRole).map(([role, members]) => (
                                    <div key={role}>
                                        <h5 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">{role}</h5>
                                        {members.map(member => {
                                            const assignedMember = formData.team.find((t: any) => t.memberId === member.id);
                                            const isSelected = !!assignedMember;
                                            return (
                                                <div key={member.id} className={`p-3 rounded-lg transition-colors ${isSelected ? 'bg-brand-accent/10' : 'bg-brand-bg'}`}>
                                                    <div className="flex justify-between items-center">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox" checked={isSelected} onChange={() => onTeamChange(member)} />
                                                            <span className="font-medium text-brand-text-light">{member.name}</span>
                                                        </label>
                                                        {isSelected && <p className="text-xs text-brand-text-secondary">Fee: {formatCurrency(member.standardFee)}</p>}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                                            <div className="input-group !mt-0"><input type="number" value={assignedMember.fee} onChange={e => onTeamFeeChange(member.id, Number(e.target.value))} className="input-field !p-2 !text-sm" placeholder=" "/><label className="input-label !text-xs">Fee Proyek</label></div>
                                                            <div className="input-group !mt-0"><input type="number" value={assignedMember.reward || ''} onChange={e => onTeamRewardChange(member.id, Number(e.target.value))} className="input-field !p-2 !text-sm" placeholder=" "/><label className="input-label !text-xs">Reward</label></div>
                                                            <div className="input-group !mt-0"><input type="text" value={assignedMember.subJob || ''} onChange={e => onTeamSubJobChange(member.id, e.target.value)} className="input-field !p-2 !text-sm" placeholder=" "/><label className="input-label !text-xs">Sub-Job</label></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 5: Additional Costs */}
                        <section>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">Biaya Tambahan</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group"><input type="number" id="printingCost" name="printingCost" value={formData.printingCost} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="printingCost" className="input-label">Biaya Cetak</label></div>
                                <div className="input-group"><input type="number" id="transportCost" name="transportCost" value={formData.transportCost} onChange={onFormChange} className="input-field" placeholder=" " /><label htmlFor="transportCost" className="input-label">Biaya Transportasi</label></div>
                            </div>
                        </section>

                        {/* Section 6: Client Confirmation */}
                        <section>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">Konfirmasi Klien</h4>
                            <div className="p-3 bg-brand-bg rounded-lg space-y-3">
                                <label className="flex items-center justify-between cursor-pointer"><span className="text-sm">Editing disetujui</span><input type="checkbox" name="isEditingConfirmedByClient" checked={formData.isEditingConfirmedByClient} onChange={onFormChange} /></label>
                                <label className="flex items-center justify-between cursor-pointer"><span className="text-sm">Cetak disetujui</span><input type="checkbox" name="isPrintingConfirmedByClient" checked={formData.isPrintingConfirmedByClient} onChange={onFormChange} /></label>
                                <label className="flex items-center justify-between cursor-pointer"><span className="text-sm">Pengiriman disetujui</span><input type="checkbox" name="isDeliveryConfirmedByClient" checked={formData.isDeliveryConfirmedByClient} onChange={onFormChange} /></label>
                            </div>
                        </section>
                        
                        {/* Section 7: Custom Sub-Status */}
                        <section>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">Sub-Status untuk "{formData.status}"</h4>
                            <div className="p-3 bg-brand-bg rounded-lg">
                                <label className="text-sm font-medium text-brand-text-secondary block mb-3">Pilih sub-status aktif:</label>
                                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                                    {(formData.customSubStatuses || []).map((sub: SubStatusConfig) => (
                                        <label key={sub.name} className="flex items-center gap-2 p-2 rounded-md hover:bg-brand-input cursor-pointer">
                                            <input type="checkbox" checked={(formData.activeSubStatuses || []).includes(sub.name)} onChange={e => onSubStatusChange(sub.name, e.target.checked)} />
                                            <span>{sub.name}</span>
                                        </label>
                                    ))}
                                </div>

                                <h5 className="text-sm font-semibold text-brand-text-secondary mt-4 pt-4 border-t border-brand-border">Edit Sub-Status (khusus proyek ini)</h5>
                                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                                    {(formData.customSubStatuses || []).map((sub: SubStatusConfig, index: number) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={sub.name} onChange={e => onCustomSubStatusChange(index, 'name', e.target.value)} placeholder="Nama Sub-Status" className="input-field !p-2 !text-sm flex-grow"/>
                                            <input type="text" value={sub.note} onChange={e => onCustomSubStatusChange(index, 'note', e.target.value)} placeholder="Catatan" className="input-field !p-2 !text-sm flex-grow"/>
                                            <button type="button" onClick={() => onRemoveCustomSubStatus(index)} className="p-2 text-brand-danger hover:bg-brand-danger/10 rounded-full"><Trash2Icon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={onAddCustomSubStatus} className="text-sm font-semibold text-brand-accent hover:underline mt-2">+ Tambah</button>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-3 pt-6 border-t border-brand-border">
                    <button type="button" onClick={onClose} className="button-secondary">Batal</button>
                    <button type="submit" className="button-primary">{mode === 'add' ? 'Simpan Proyek' : 'Update Proyek'}</button>
                </div>
            </form>
        </Modal>
    );
};


// --- [NEW] ProjectAnalytics Component ---
const ProjectAnalytics: React.FC<{
    projects: Project[];
    teamProjectPayments: TeamProjectPayment[];
    projectStatusConfig: ProjectStatusConfig[];
    onStatCardClick: (stat: 'value' | 'receivables' | 'team_costs' | 'top_type') => void;
}> = ({ projects, teamProjectPayments, projectStatusConfig, onStatCardClick }) => {
    const activeProjects = useMemo(() => projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan'), [projects]);

    const stats = useMemo(() => {
        const totalActiveValue = activeProjects.reduce((sum, p) => sum + p.totalCost, 0);
        const totalReceivables = activeProjects.reduce((sum, p) => sum + (p.totalCost - p.amountPaid), 0);
        const unpaidTeamCosts = teamProjectPayments.filter(p => p.status === 'Unpaid' && activeProjects.some(ap => ap.id === p.projectId)).reduce((sum, p) => sum + p.fee, 0);

        const projectTypeCounts = projects.reduce((acc, p) => {
            acc[p.projectType] = (acc[p.projectType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topProjectType = Object.keys(projectTypeCounts).length > 0
            ? Object.entries(projectTypeCounts).sort(([, a], [, b]) => b - a)[0][0]
            : 'N/A';
            
        return { totalActiveValue, totalReceivables, unpaidTeamCosts, topProjectType };
    }, [activeProjects, teamProjectPayments, projects]);
    
    const projectStatusDistribution = useMemo(() => {
        const statusCounts = activeProjects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(statusCounts).map(([label, value]) => {
            const config = projectStatusConfig.find(s => s.name === label);
            return {
                label,
                value,
                color: config ? config.color : '#64748b'
            };
        }).sort((a,b) => b.value - a.value);
    }, [activeProjects, projectStatusConfig]);

    return (
        <div className="mb-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => onStatCardClick('value')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '100ms' }}>
                    <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Nilai Proyek Aktif" value={formatCurrency(stats.totalActiveValue)} iconBgColor="bg-blue-500/20" iconColor="text-blue-400" />
                </div>
                <div onClick={() => onStatCardClick('receivables')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '200ms' }}>
                    <StatCard icon={<AlertCircleIcon className="w-6 h-6"/>} title="Total Piutang" value={formatCurrency(stats.totalReceivables)} iconBgColor="bg-yellow-500/20" iconColor="text-yellow-400" />
                </div>
                <div onClick={() => onStatCardClick('team_costs')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '300ms' }}>
                    <StatCard icon={<BriefcaseIcon className="w-6 h-6"/>} title="Biaya Tim Belum Lunas" value={formatCurrency(stats.unpaidTeamCosts)} iconBgColor="bg-red-500/20" iconColor="text-red-400" />
                </div>
                <div onClick={() => onStatCardClick('top_type')} className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-105" style={{ animationDelay: '400ms' }}>
                    <StatCard icon={<FolderKanbanIcon className="w-6 h-6"/>} title="Jenis Proyek Teratas" value={stats.topProjectType} iconBgColor="bg-indigo-500/20" iconColor="text-indigo-400" />
                </div>
            </div>

            <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border widget-animate" style={{ animationDelay: '500ms' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-1">
                         <h3 className="text-xl font-bold text-gradient mb-4">Distribusi Status Proyek</h3>
                        <DonutChart data={projectStatusDistribution} />
                    </div>
                    <div className="md:col-span-2 text-center text-brand-text-secondary h-full flex items-center justify-center bg-brand-bg rounded-lg p-8">
                        <p>Grafik analitik lainnya akan segera hadir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- NEW COMPONENT: ProjectSummaryTable ---
const ProjectSummaryTable: React.FC<{
    projects: Project[];
    teamProjectPayments: TeamProjectPayment[];
    handleOpenDetailModal: (project: Project) => void;
    config: ProjectStatusConfig[];
}> = ({ projects, teamProjectPayments, handleOpenDetailModal, config }) => {

    const getTeamPaymentStatus = (project: Project) => {
        if (project.team.length === 0) {
            return { text: 'N/A', className: 'bg-gray-500/20 text-gray-400' };
        }
        const projectPayments = teamProjectPayments.filter(p => p.projectId === project.id);
        if (projectPayments.length < project.team.length || projectPayments.some(p => p.status === 'Unpaid')) {
            const paidCount = projectPayments.filter(p => p.status === 'Paid').length;
            if (paidCount === 0) {
                 return { text: 'Belum Lunas', className: 'bg-red-500/20 text-red-400' };
            }
            return { text: 'Sebagian', className: 'bg-yellow-500/20 text-yellow-400' };
        }
        return { text: 'Lunas', className: 'bg-green-500/20 text-green-400' };
    };

    const getUrgentTask = (project: Project) => {
        const activeRevisionsCount = (project.revisions || []).filter(r => r.status !== RevisionStatus.COMPLETED).length;
        if (activeRevisionsCount > 0) {
            return { text: `${activeRevisionsCount} Revisi Aktif`, className: 'bg-purple-500/20 text-purple-400', icon: <PencilIcon className="w-4 h-4" /> };
        }
        const pendingConfirmations = (Object.keys(project.subStatusConfirmationSentAt || {})).filter(subStatus => !(project.confirmedSubStatuses || []).includes(subStatus)).length;
        if (pendingConfirmations > 0) {
            return { text: `Menunggu ${pendingConfirmations} Konfirmasi`, className: 'bg-yellow-500/20 text-yellow-400', icon: <ClockIcon className="w-4 h-4" /> };
        }
        return { text: 'Aman', className: 'bg-green-500/20 text-green-400', icon: <CheckCircleIcon className="w-4 h-4" /> };
    };

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border mb-6 widget-animate" style={{ animationDelay: '500ms' }}>
            <h3 className="text-xl font-bold text-gradient mb-4">Ringkasan Proyek Aktif</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-brand-text-secondary uppercase">
                        <tr>
                            <th className="px-4 py-3">Proyek / Klien</th>
                            <th className="px-4 py-3">Status & Progres</th>
                            <th className="px-4 py-3">Pembayaran Klien</th>
                            <th className="px-4 py-3">Pembayaran Tim</th>
                            <th className="px-4 py-3">Tugas Mendesak</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {projects.map(project => {
                            const teamPayment = getTeamPaymentStatus(project);
                            const urgentTask = getUrgentTask(project);
                            return (
                                <tr key={project.id} className="hover:bg-brand-bg">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-brand-text-light">{project.projectName}</p>
                                        <p className="text-xs text-brand-text-secondary">{project.clientName}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${getStatusClass(project.status, config)}`}>{project.status}</span>
                                        <div className="w-full bg-brand-bg rounded-full h-1.5 mt-2">
                                            <div className="h-1.5 rounded-full" style={{ width: `${project.progress}%`, backgroundColor: getStatusColor(project.status, config) }}></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(project.paymentStatus)}`}>{project.paymentStatus}</span></td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${teamPayment.className}`}>{teamPayment.text}</span></td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${urgentTask.className}`}>
                                            {urgentTask.icon}
                                            {urgentTask.text}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleOpenDetailModal(project)} className="button-secondary text-xs !px-3 !py-1.5">Lihat Detail</button>
                                    </td>
                                </tr>
                            )
                        })}
                         {projects.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8 text-brand-text-secondary">Tidak ada proyek aktif.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


interface ProjectListViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    config: ProjectStatusConfig[];
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ projects, handleOpenDetailModal, handleOpenForm, handleProjectDelete, config }) => {
    
    const ProgressBar: React.FC<{ progress: number, status: string, config: ProjectStatusConfig[] }> = ({ progress, status, config }) => (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getStatusColor(status, config) }}></div>
        </div>
    );
    
    return (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-brand-text-secondary uppercase">
                <tr>
                    <th className="px-6 py-4 font-medium tracking-wider">Nama Proyek</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Klien</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 font-medium tracking-wider min-w-[200px]">Progress</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Tim</th>
                    <th className="px-6 py-4 font-medium tracking-wider text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
                {projects.map(p => (
                    <tr key={p.id} className="hover:bg-brand-bg transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-brand-text-light">{p.projectName}</p>
                                <ConfirmationIcons project={p} />
                            </div>
                            <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusClass(p.status, config)}`}>
                                {getSubStatusText(p)}
                            </p>
                        </td>
                        <td className="px-6 py-4 text-brand-text-primary">{p.clientName}</td>
                        <td className="px-6 py-4 text-brand-text-primary">{new Date(p.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <ProgressBar progress={p.progress} status={p.status} config={config} />
                                <span className="text-xs font-semibold text-brand-text-secondary">{p.progress}%</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-brand-text-primary">{p.team.map(t => t.name.split(' ')[0]).join(', ') || '-'}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-1">
                                <button onClick={() => handleOpenDetailModal(p)} className="p-2 text-brand-text-secondary hover:bg-gray-700/50 rounded-full" title="Detail Proyek"><EyeIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleOpenForm('edit', p)} className="p-2 text-brand-text-secondary hover:bg-gray-700/50 rounded-full" title="Edit Proyek"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleProjectDelete(p.id)} className="p-2 text-brand-text-secondary hover:bg-gray-700/50 rounded-full" title="Hapus Proyek"><Trash2Icon className="w-5 h-5"/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {projects.length === 0 && <p className="text-center py-8 text-sm text-brand-text-secondary">Tidak ada proyek dalam kategori ini.</p>}
    </div>
    );
};

interface ProjectKanbanViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    draggedProjectId: string | null;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, projectId: string) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, newStatus: string) => void;
    config: ProjectStatusConfig[];
}

const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({ projects, handleOpenDetailModal, draggedProjectId, handleDragStart, handleDragOver, handleDrop, config }) => {
    
    const ProgressBar: React.FC<{ progress: number, status: string, config: ProjectStatusConfig[] }> = ({ progress, status, config }) => (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getStatusColor(status, config) }}></div>
        </div>
    );
    
    return (
    <div className="flex gap-6 overflow-x-auto pb-4">
        {config
            .filter(statusConfig => statusConfig.name !== 'Dibatalkan')
            .map(statusConfig => {
                const status = statusConfig.name;
                return (
                    <div 
                        key={status} 
                        className="w-80 flex-shrink-0 bg-brand-bg rounded-2xl border border-brand-border"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        <div className="p-4 font-semibold text-brand-text-light border-b-2 flex justify-between items-center sticky top-0 bg-brand-bg/80 backdrop-blur-sm rounded-t-2xl z-10" style={{ borderBottomColor: getStatusColor(status, config) }}>
                            <span>{status}</span>
                            <span className="text-sm font-normal bg-brand-surface text-brand-text-secondary px-2.5 py-1 rounded-full">{projects.filter(p => p.status === status).length}</span>
                        </div>
                        <div className="p-3 space-y-3 h-[calc(100vh-420px)] overflow-y-auto">
                            {projects
                                .filter(p => p.status === status)
                                .map(p => (
                                    <div
                                        key={p.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, p.id)}
                                        onClick={() => handleOpenDetailModal(p)}
                                        className={`p-4 bg-brand-surface rounded-xl cursor-grab border-l-4 shadow-lg ${draggedProjectId === p.id ? 'opacity-50 ring-2 ring-brand-accent' : 'opacity-100'}`}
                                        style={{ borderLeftColor: getStatusColor(p.status, config) }}
                                    >
                                        <p className="font-semibold text-sm text-brand-text-light">{p.projectName}</p>
                                        <p className="text-xs text-brand-text-secondary mt-1">{p.clientName}</p>
                                        <p className="text-xs font-bold text-brand-text-primary mt-1">
                                            {getSubStatusText(p)}
                                        </p>
                                        <ProgressBar progress={p.progress} status={p.status} config={config}/>
                                        <div className="flex justify-between items-center mt-3 text-xs">
                                            <span className="text-brand-text-secondary">{new Date(p.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                                            <ConfirmationIcons project={p} />
                                            <span className={`px-2 py-0.5 rounded-full ${getPaymentStatusClass(p.paymentStatus)}`}>
                                                {p.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
            })
        }
    </div>
    );
};

interface ProjectDetailModalProps {
    selectedProject: Project | null;
    setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
    teamMembers: TeamMember[];
    clients: Client[];
    profile: Profile;
    showNotification: (message: string) => void;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onClose: () => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    handleOpenBriefingModal: (project: Project) => void;
    handleOpenConfirmationModal: (project: Project, subStatus: SubStatusConfig, isFollowUp: boolean) => void;
    packages: Package[];
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ selectedProject, setSelectedProject, teamMembers, clients, profile, showNotification, setProjects, onClose, handleOpenForm, handleProjectDelete, handleOpenBriefingModal, handleOpenConfirmationModal, packages }) => {
    const [detailTab, setDetailTab] = useState<'details' | 'revisions' | 'files' | 'laba-rugi'>('details');
    const [newRevision, setNewRevision] = useState({ adminNotes: '', deadline: '', freelancerId: '' });

    const teamByRole = useMemo(() => {
        if (!selectedProject?.team) return {};
        return selectedProject.team.reduce((acc, member) => {
            const { role } = member;
            if (!acc[role]) {
                acc[role] = [];
            }
            acc[role].push(member);
            return acc;
        }, {} as Record<string, AssignedTeamMember[]>);
    }, [selectedProject?.team]);

    const handleAddRevision = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !newRevision.freelancerId || !newRevision.adminNotes || !newRevision.deadline) {
            showNotification('Harap lengkapi semua field revisi.');
            return;
        }

        const revisionToAdd: Revision = {
            id: `REV-${Date.now()}`,
            date: new Date().toISOString(),
            adminNotes: newRevision.adminNotes,
            deadline: newRevision.deadline,
            freelancerId: newRevision.freelancerId,
            status: RevisionStatus.PENDING,
        };
        
        const updatedProject = { ...selectedProject, revisions: [...(selectedProject.revisions || []), revisionToAdd] };

        setProjects(prevProjects => prevProjects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);

        showNotification('Revisi baru berhasil ditambahkan.');
        setNewRevision({ adminNotes: '', deadline: '', freelancerId: '' });
    };

    const handleShareRevisionLink = (revision: Revision) => {
        if (!selectedProject) return;
        const url = `${window.location.origin}${window.location.pathname}#/revision-form?projectId=${selectedProject.id}&freelancerId=${revision.freelancerId}&revisionId=${revision.id}`;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Tautan revisi berhasil disalin!');
        }, (err) => {
            showNotification('Gagal menyalin tautan.');
            console.error('Could not copy text: ', err);
        });
    };

    const formatDateFull = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    
    const handleToggleDigitalItem = (itemText: string) => {
        if (!selectedProject) return;

        const currentCompleted = selectedProject.completedDigitalItems || [];
        const isCompleted = currentCompleted.includes(itemText);
        const newCompleted = isCompleted
            ? currentCompleted.filter(item => item !== itemText)
            : [...currentCompleted, itemText];

        const updatedProject = { ...selectedProject, completedDigitalItems: newCompleted };

        setProjects(prevProjects => prevProjects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject); // Update local state for immediate UI feedback in the modal
    };
    
    if (!selectedProject) return null;

    const allSubStatusesForCurrentStatus = selectedProject.customSubStatuses || profile.projectStatusConfig.find(s => s.name === selectedProject.status)?.subStatuses || [];

    return (
        <div>
            <div className="border-b border-brand-border">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setDetailTab('details')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'details' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><ClipboardListIcon className="w-5 h-5"/> Detail</button>
                    <button onClick={() => setDetailTab('laba-rugi')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'laba-rugi' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><DollarSignIcon className="w-5 h-5"/> Laba/Rugi</button>
                    <button onClick={() => setDetailTab('files')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'files' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><FileTextIcon className="w-5 h-5"/> File & Tautan</button>
                    <button onClick={() => setDetailTab('revisions')} className={`shrink-0 inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'revisions' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-secondary hover:text-brand-text-light'}`}><PencilIcon className="w-5 h-5"/> Revisi</button>
                </nav>
            </div>

            <div className="pt-6 max-h-[65vh] overflow-y-auto pr-2">
                {detailTab === 'details' && (
                    <div className="space-y-6">
                        <div className="text-sm space-y-2">
                            <p><strong className="font-semibold text-brand-text-secondary w-32 inline-block">Klien:</strong> {selectedProject.clientName}</p>
                            <p><strong className="font-semibold text-brand-text-secondary w-32 inline-block">Tanggal Acara:</strong> {formatDateFull(selectedProject.date)}</p>
                            <p><strong className="font-semibold text-brand-text-secondary w-32 inline-block">Lokasi:</strong> {selectedProject.location}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Paket & Biaya</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm p-4 bg-brand-bg rounded-lg">
                                <span className="text-brand-text-secondary">Paket:</span> <span className="font-medium text-brand-text-light">{selectedProject.packageName}</span>
                                <span className="text-brand-text-secondary">Add-ons:</span> <span className="font-medium text-brand-text-light">{selectedProject.addOns.map(a => a.name).join(', ') || '-'}</span>
                                <span className="text-brand-text-secondary">Total Biaya Proyek:</span> <span className="font-bold text-brand-text-light">{formatCurrency(selectedProject.totalCost)}</span>
                                <span className="text-brand-text-secondary">Status Pembayaran:</span> <span><span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(selectedProject.paymentStatus)}`}>{selectedProject.paymentStatus}</span></span>
                                <span className="text-brand-text-secondary">Biaya Cetak:</span> <span className="font-medium text-brand-text-light">{formatCurrency(selectedProject.printingCost || 0)}</span>
                                <span className="text-brand-text-secondary">Biaya Transportasi:</span> <span className="font-medium text-brand-text-light">{formatCurrency(selectedProject.transportCost || 0)}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Progres Sub-Status</h4>
                            {allSubStatusesForCurrentStatus.length > 0 ? (
                                <div className="space-y-3 p-4 bg-brand-bg rounded-lg">
                                    {allSubStatusesForCurrentStatus.map(subStatus => {
                                        const isActive = selectedProject.activeSubStatuses?.includes(subStatus.name);
                                        const sentAt = selectedProject.subStatusConfirmationSentAt?.[subStatus.name];
                                        const isConfirmed = selectedProject.confirmedSubStatuses?.includes(subStatus.name);
                                        const clientNote = selectedProject.clientSubStatusNotes?.[subStatus.name];
                                        const needsFollowUp = sentAt && !isConfirmed && (new Date().getTime() - new Date(sentAt).getTime()) / (1000 * 60 * 60) > 24;

                                        return (
                                            <div key={subStatus.name} className="py-2 border-b border-brand-border last:border-b-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            {isConfirmed && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                                                            <p className={`font-medium ${isActive ? 'text-brand-text-light' : 'text-brand-text-secondary'}`}>{subStatus.name}</p>
                                                            {needsFollowUp && <span className="text-xs font-semibold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Perlu Follow-up</span>}
                                                        </div>
                                                        <p className="text-xs text-brand-text-secondary">{subStatus.note}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleOpenConfirmationModal(selectedProject, subStatus, needsFollowUp || false)} 
                                                        className="button-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                                                        disabled={isConfirmed}
                                                    >
                                                        {isConfirmed ? 'Terkonfirmasi' : <><SendIcon className="w-3 h-3" /> Minta Konfirmasi</>}
                                                    </button>
                                                </div>
                                                {clientNote && (
                                                    <div className="mt-3 ml-4 p-2 bg-brand-input rounded-md border-l-2 border-brand-accent">
                                                        <p className="text-xs font-semibold text-brand-accent">Catatan Klien:</p>
                                                        <p className="text-sm text-brand-text-primary italic">"{clientNote}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-brand-text-secondary p-4 bg-brand-bg rounded-lg">Tidak ada sub-status untuk status proyek saat ini.</p>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Deliverables</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-brand-bg rounded-lg">
                                    <h5 className="font-semibold text-brand-text-primary text-sm mb-2">Output Fisik (Cetak)</h5>
                                    {(selectedProject.printingDetails || []).length > 0 ? (
                                        <ul className="space-y-2 text-sm">
                                            {(selectedProject.printingDetails || []).map(item => (
                                                <li key={item.id} className="flex justify-between items-center">
                                                    <span className="text-brand-text-light">{item.customName || item.type}</span>
                                                    <span className="text-brand-text-secondary font-medium">{formatCurrency(item.cost)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-brand-text-secondary italic">Tidak ada item fisik.</p>
                                    )}
                                </div>
                                <div className="p-4 bg-brand-bg rounded-lg">
                                    <h5 className="font-semibold text-brand-text-primary text-sm mb-2">Output Digital</h5>
                                    {(() => {
                                        const pkg = packages.find(p => p.id === selectedProject.packageId);
                                        if (!pkg || pkg.digitalItems.length === 0) {
                                            return <p className="text-sm text-brand-text-secondary italic">Tidak ada item digital.</p>;
                                        }
                                        return (
                                            <div className="space-y-2 text-sm">
                                                {pkg.digitalItems.map((item, index) => {
                                                    const isCompleted = selectedProject.completedDigitalItems?.includes(item);
                                                    return (
                                                        <label key={index} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-brand-input cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompleted}
                                                                onChange={() => handleToggleDigitalItem(item)}
                                                            />
                                                            <span className={`text-brand-text-primary ${isCompleted ? 'line-through text-brand-text-secondary' : ''}`}>{item}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Tim</h4>
                            <div className="space-y-4">
                                {Object.entries(teamByRole).length > 0 ? (
                                    Object.entries(teamByRole).map(([role, members]) => (
                                        <div key={role}>
                                            <h5 className="font-semibold text-brand-text-primary text-sm uppercase tracking-wider">{role}</h5>
                                            <div className="mt-2 space-y-2">
                                                {members.map(member => (
                                                    <div key={member.memberId} className="p-3 bg-brand-bg rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                        <div>
                                                            <p className="text-sm text-brand-text-light font-medium">{member.name}</p>
                                                            {member.subJob && <p className="text-xs text-brand-text-secondary">{member.subJob}</p>}
                                                        </div>
                                                        <div className="text-xs flex items-center gap-4 mt-2 sm:mt-0 self-start sm:self-center">
                                                            <div className="text-right">
                                                                <p className="text-brand-text-secondary">Fee</p>
                                                                <p className="font-semibold text-brand-text-primary">{formatCurrency(member.fee)}</p>
                                                            </div>
                                                            {(member.reward && member.reward > 0) && (
                                                                <div className="text-right">
                                                                    <p className="text-brand-text-secondary">Hadiah</p>
                                                                    <p className="font-semibold text-yellow-400">{formatCurrency(member.reward)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-brand-text-secondary p-4 bg-brand-bg rounded-lg">Belum ada tim yang ditugaskan.</p>
                                )}
                            </div>
                        </div>

                        {selectedProject.notes && (
                            <div>
                                <h4 className="font-semibold text-gradient mb-3">Catatan</h4>
                                <div className="p-4 bg-brand-bg rounded-lg">
                                    <p className="text-sm text-brand-text-primary whitespace-pre-wrap">{selectedProject.notes}</p>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Aksi Cepat</h4>
                            <div className="p-4 bg-brand-bg rounded-lg">
                                <button type="button" onClick={() => handleOpenBriefingModal(selectedProject)} className="button-secondary text-sm inline-flex items-center gap-2">
                                    <Share2Icon className="w-4 h-4"/> Bagikan Briefing Tim
                                </button>
                            </div>
                        </div>

                    </div>
                )}
                {detailTab === 'laba-rugi' && (() => {
                    const totalTeamFee = selectedProject.team.reduce((sum, member) => sum + member.fee, 0);
                    const totalOtherExpenses = (selectedProject.printingCost || 0) + (selectedProject.transportCost || 0);
                    const totalProductionCost = totalTeamFee + totalOtherExpenses;
                    const grossProfit = selectedProject.totalCost - totalProductionCost;
                    const addOnsTotal = selectedProject.addOns.reduce((sum, addon) => sum + addon.price, 0);
                    const basePackagePrice = selectedProject.totalCost - addOnsTotal + (selectedProject.discountAmount || 0);

                    return (
                         <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gradient mb-3">Ringkasan Keuangan Proyek</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <StatCard icon={<ArrowUpIcon />} title="Total Pemasukan" value={formatCurrency(selectedProject.totalCost)} iconBgColor="bg-green-500/20" iconColor="text-green-400" />
                                    <StatCard icon={<ArrowDownIcon />} title="Total Biaya Produksi" value={formatCurrency(totalProductionCost)} iconBgColor="bg-red-500/20" iconColor="text-red-400" />
                                    <StatCard icon={<DollarSignIcon />} title="Laba Kotor" value={formatCurrency(grossProfit)} iconBgColor="bg-blue-500/20" iconColor="text-blue-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-brand-bg rounded-lg">
                                    <h5 className="font-semibold text-brand-text-primary mb-2">Rincian Pemasukan</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-1 border-b border-brand-border/50"><span className="text-brand-text-secondary">Harga Paket Dasar</span> <span className="font-medium">{formatCurrency(basePackagePrice)}</span></div>
                                        {selectedProject.addOns.map(addon => <div key={addon.id} className="flex justify-between py-1 border-b border-brand-border/50"><span className="text-brand-text-secondary">{addon.name}</span> <span className="font-medium">{formatCurrency(addon.price)}</span></div>)}
                                        {selectedProject.discountAmount && <div className="flex justify-between py-1 border-b border-brand-border/50"><span className="text-brand-text-secondary">Diskon</span> <span className="font-medium text-green-400">-{formatCurrency(selectedProject.discountAmount)}</span></div>}
                                        <div className="flex justify-between font-bold pt-2"><span className="text-brand-text-light">TOTAL</span> <span>{formatCurrency(selectedProject.totalCost)}</span></div>
                                    </div>
                                </div>
                                 <div className="p-4 bg-brand-bg rounded-lg">
                                    <h5 className="font-semibold text-brand-text-primary mb-2">Rincian Pengeluaran</h5>
                                     <div className="space-y-2 text-sm">
                                        {selectedProject.team.map(member => <div key={member.memberId} className="flex justify-between py-1 border-b border-brand-border/50"><span className="text-brand-text-secondary">Fee: {member.name}</span> <span className="font-medium">{formatCurrency(member.fee)}</span></div>)}
                                        {selectedProject.printingCost && <div className="flex justify-between py-1 border-b border-brand-border/50"><span className="text-brand-text-secondary">Biaya Cetak</span> <span className="font-medium">{formatCurrency(selectedProject.printingCost)}</span></div>}
                                        {selectedProject.transportCost && <div className="flex justify-between py-1 border-b border-brand-border/50"><span className="text-brand-text-secondary">Biaya Transportasi</span> <span className="font-medium">{formatCurrency(selectedProject.transportCost)}</span></div>}
                                        <div className="flex justify-between font-bold pt-2"><span className="text-brand-text-light">TOTAL</span> <span>{formatCurrency(totalProductionCost)}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
                {detailTab === 'files' && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gradient mb-2">File & Tautan Penting</h4>
                        <div className="p-4 bg-brand-bg rounded-lg space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-brand-border"><span className="text-brand-text-secondary">Link Moodboard/Brief (Internal)</span>{selectedProject.driveLink ? <a href={selectedProject.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Buka Tautan</a> : <span className="text-brand-text-secondary">N/A</span>}</div>
                            <div className="flex justify-between items-center py-2 border-b border-brand-border"><span className="text-brand-text-secondary">Link File dari Klien</span>{selectedProject.clientDriveLink ? <a href={selectedProject.clientDriveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Buka Tautan</a> : <span className="text-brand-text-secondary">N/A</span>}</div>
                            <div className="flex justify-between items-center py-2"><span className="text-brand-text-secondary">Link File Jadi (untuk Klien)</span>{selectedProject.finalDriveLink ? <a href={selectedProject.finalDriveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Buka Tautan</a> : <span className="text-brand-text-secondary">Belum tersedia</span>}</div>
                        </div>
                    </div>
                )}
                {detailTab === 'revisions' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Daftar Revisi</h4>
                            <div className="space-y-3">
                                {(selectedProject.revisions || []).length > 0 ? (selectedProject.revisions || []).map(rev => (
                                    <div key={rev.id} className="p-3 bg-brand-bg rounded-lg">
                                        <div className="flex justify-between items-center text-xs mb-2">
                                            <span className={`px-2 py-0.5 rounded-full font-medium ${getRevisionStatusClass(rev.status)}`}>{rev.status}</span>
                                            <span>Deadline: {new Date(rev.deadline).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <p className="text-sm"><strong className="text-brand-text-secondary">Admin:</strong> {rev.adminNotes}</p>
                                        <p className="text-sm mt-1"><strong className="text-brand-text-secondary">Freelancer ({teamMembers.find(t => t.id === rev.freelancerId)?.name || 'N/A'}):</strong> {rev.freelancerNotes || '-'}</p>
                                        {rev.driveLink && <p className="text-sm mt-1"><strong className="text-brand-text-secondary">Link Hasil:</strong> <a href={rev.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Buka Tautan</a></p>}
                                        <button onClick={() => handleShareRevisionLink(rev)} className="text-xs font-semibold text-brand-accent hover:underline mt-2">Bagikan Tautan Revisi</button>
                                    </div>
                                )) : <p className="text-center text-sm text-brand-text-secondary py-4">Belum ada revisi.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gradient mb-3">Tambah Tugas Revisi Baru</h4>
                            <form onSubmit={handleAddRevision} className="p-4 bg-brand-bg rounded-lg space-y-4">
                                <div className="input-group"><textarea id="adminNotes" value={newRevision.adminNotes} onChange={e => setNewRevision(p => ({...p, adminNotes: e.target.value}))} className="input-field" rows={3} placeholder=" " required /><label htmlFor="adminNotes" className="input-label">Catatan Revisi untuk Freelancer</label></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="input-group"><select id="freelancerId" value={newRevision.freelancerId} onChange={e => setNewRevision(p => ({...p, freelancerId: e.target.value}))} className="input-field" required><option value="">Pilih Freelancer...</option>{selectedProject.team.map(t => <option key={t.memberId} value={t.memberId}>{t.name}</option>)}</select><label htmlFor="freelancerId" className="input-label">Tugaskan ke</label></div>
                                    <div className="input-group"><input type="date" id="deadline" value={newRevision.deadline} onChange={e => setNewRevision(p => ({...p, deadline: e.target.value}))} className="input-field" placeholder=" " required /><label htmlFor="deadline" className="input-label">Deadline</label></div>
                                </div>
                                <div className="text-right"><button type="submit" className="button-primary">Tambah Revisi</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


interface ProjectsProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    clients: Client[];
    packages: Package[];
    teamMembers: TeamMember[];
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
    profile: Profile;
    showNotification: (message: string) => void;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
}

const ConfirmationModal: React.FC<{
    project: Project;
    subStatus: SubStatusConfig;
    isFollowUp: boolean;
    clients: Client[];
    teamMembers: TeamMember[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onClose: () => void;
}> = ({ project, subStatus, isFollowUp, clients, teamMembers, setProjects, onClose }) => {
    const [recipientId, setRecipientId] = useState<string>('');
    const [message, setMessage] = useState('');

    const client = useMemo(() => clients.find(c => c.id === project.clientId), [clients, project.clientId]);

    useEffect(() => {
        if (client) {
            setRecipientId(`client-${client.id}`);
        } else if (project.team.length > 0) {
            setRecipientId(`freelancer-${project.team[0].memberId}`);
        }
    }, [client, project.team]);

    useEffect(() => {
        let recipientName = '[Penerima]';
        if (recipientId.startsWith('client-') && client) {
            recipientName = client.name;
        } else if (recipientId.startsWith('freelancer-')) {
            const memberId = recipientId.split('-')[1];
            recipientName = project.team.find(t => t.memberId === memberId)?.name || '[Freelancer]';
        }

        const initialMessage = `✨ *Konfirmasi Tugas Proyek* ✨

Halo *${recipientName}*,

Kami dari *Vena Pictures* ingin meminta konfirmasi Anda untuk sub-tugas pada proyek *"${project.projectName}"*.

*Tugas yang perlu dikonfirmasi:*
📝 *${subStatus.name}*

*Detail/Catatan Tambahan:*
📄 ${subStatus.note || "_Tidak ada catatan tambahan._"}

Mohon untuk meninjau detail di atas dan balas pesan ini dengan *"SETUJU"* atau *"CONFIRM"* jika Anda sudah memahami dan menyetujui tugas tersebut.

Jika ada pertanyaan, jangan ragu untuk menghubungi kami kembali.

Terima kasih atas perhatian dan kerja samanya!

Salam hangat,
*Tim Vena Pictures*`;

        const followUpMessage = `✨ *Follow-Up Konfirmasi Tugas* ✨

Halo *${recipientName}*,

Kami dari *Vena Pictures* ingin menindaklanjuti dengan hormat permintaan konfirmasi kami sebelumnya untuk sub-tugas pada proyek *"${project.projectName}"*.

*Tugas yang perlu dikonfirmasi:*
📝 *${subStatus.name}*

*Detail/Catatan Tambahan:*
📄 ${subStatus.note || "_Tidak ada catatan tambahan._"}

Kami mohon kesediaan Anda untuk memberikan konfirmasi agar kami dapat melanjutkan ke tahap berikutnya.

Jika ada pertanyaan atau kendala, jangan ragu untuk menghubungi kami.

Terima kasih atas perhatian dan kerja samanya!

Salam hangat,
*Tim Vena Pictures*`;

        setMessage(isFollowUp ? followUpMessage : initialMessage);

    }, [recipientId, project, subStatus, client, isFollowUp]);

    const handleShare = () => {
        let phoneNumber = '';
        if (recipientId.startsWith('client-') && client) {
            phoneNumber = client.phone;
        } else if (recipientId.startsWith('freelancer-')) {
            const memberId = recipientId.split('-')[1];
            phoneNumber = teamMembers.find(t => t.id === memberId)?.phone || '';
        }

        if (phoneNumber) {
            // Update project state with the timestamp
            setProjects(prev => prev.map(p => {
                if (p.id === project.id) {
                    const newConfirmationSentAt = {
                        ...(p.subStatusConfirmationSentAt || {}),
                        [subStatus.name]: new Date().toISOString(),
                    };
                    return { ...p, subStatusConfirmationSentAt: newConfirmationSentAt };
                }
                return p;
            }));

            // Open WhatsApp
            const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            onClose(); // Close modal after sharing
        } else {
            alert('Nomor telepon untuk penerima ini tidak ditemukan.');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`${isFollowUp ? 'Follow-Up' : 'Minta'} Konfirmasi Tugas: ${subStatus.name}`}>
            <div className="space-y-6">
                <div className="input-group">
                    <select id="recipient" value={recipientId} onChange={e => setRecipientId(e.target.value)} className="input-field">
                        {client && <option value={`client-${client.id}`}>Klien: {client.name}</option>}
                        {project.team.map(member => (
                            <option key={member.memberId} value={`freelancer-${member.memberId}`}>Freelancer: {member.name}</option>
                        ))}
                    </select>
                    <label className="input-label">Kirim ke</label>
                </div>
                <div>
                    <label className="text-sm font-medium text-brand-text-secondary mb-2 block">Pesan Kustom</label>
                    <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                         <textarea 
                            id="message" 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            rows={15} 
                            className="w-full bg-transparent text-sm text-brand-text-primary focus:outline-none resize-none"
                        ></textarea>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-brand-border">
                    <button onClick={handleShare} className="button-primary inline-flex items-center gap-2">
                        <SendIcon className="w-4 h-4"/> Bagikan ke WhatsApp
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, clients, packages, teamMembers, teamProjectPayments, setTeamProjectPayments, transactions, setTransactions, initialAction, setInitialAction, profile, showNotification, cards, setCards }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    
    const initialFormState = useMemo(() => ({
        id: '',
        clientId: '',
        projectName: '',
        clientName: '',
        projectType: '',
        packageName: '',
        status: profile.projectStatusConfig.find(s => s.name === 'Persiapan')?.name || profile.projectStatusConfig[0]?.name || '',
        activeSubStatuses: [],
        customSubStatuses: [] as SubStatusConfig[],
        location: '',
        date: new Date().toISOString().split('T')[0],
        deadlineDate: '',
        team: [],
        notes: '',
        driveLink: '',
        clientDriveLink: '',
        finalDriveLink: '',
        startTime: '',
        endTime: '',
        shippingDetails: '',
        printingDetails: [],
        printingCost: 0,
        transportCost: 0,
        isEditingConfirmedByClient: false,
        isPrintingConfirmedByClient: false,
        isDeliveryConfirmedByClient: false,
    }), [profile]);

    const [formData, setFormData] = useState(initialFormState);

    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
    
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
    const [briefingText, setBriefingText] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [googleCalendarLink, setGoogleCalendarLink] = useState('');
    const [icsDataUri, setIcsDataUri] = useState('');
    
    const [activeStatModal, setActiveStatModal] = useState<string | null>(null);

    const [activeSectionOpen, setActiveSectionOpen] = useState(true);
    const [completedSectionOpen, setCompletedSectionOpen] = useState(false);

    const [confirmationModalState, setConfirmationModalState] = useState<{ project: Project; subStatus: SubStatusConfig; isFollowUp: boolean; } | null>(null);


    const handleOpenDetailModal = (project: Project) => {
        setSelectedProject(project);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        if (initialAction && initialAction.type === 'VIEW_PROJECT_DETAILS' && initialAction.id) {
            const projectToView = projects.find(p => p.id === initialAction.id);
            if (projectToView) {
                handleOpenDetailModal(projectToView);
            }
            setInitialAction(null);
        }
    }, [initialAction, projects, setInitialAction]);

    const teamByRole = useMemo(() => {
        return teamMembers.reduce((acc, member) => {
            if (!acc[member.role]) {
                acc[member.role] = [];
            }
            acc[member.role].push(member);
            return acc;
        }, {} as Record<string, TeamMember[]>);
    }, [teamMembers]);

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => viewMode === 'kanban' || statusFilter === 'all' || p.status === statusFilter)
            .filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || p.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [projects, searchTerm, statusFilter, viewMode]);
    
    const allActiveProjects = useMemo(() => projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan'), [projects]);
    const activeProjects = useMemo(() => filteredProjects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan'), [filteredProjects]);
    const completedAndCancelledProjects = useMemo(() => filteredProjects.filter(p => p.status === 'Selesai' || p.status === 'Dibatalkan'), [filteredProjects]);
    
    const modalData = useMemo(() => {
        if (!activeStatModal) return null;
    
        const activeProjectsList = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan');
    
        switch (activeStatModal) {
            case 'value':
                return {
                    title: 'Rincian Nilai Proyek Aktif',
                    items: activeProjectsList.map(p => ({
                        id: p.id,
                        primary: p.projectName,
                        secondary: p.clientName,
                        value: p.totalCost
                    })),
                    total: activeProjectsList.reduce((sum, p) => sum + p.totalCost, 0)
                };
            case 'receivables':
                const receivablesProjects = activeProjectsList.filter(p => p.totalCost > p.amountPaid);
                return {
                    title: 'Rincian Total Piutang',
                    items: receivablesProjects.map(p => ({
                        id: p.id,
                        primary: p.projectName,
                        secondary: p.clientName,
                        value: p.totalCost - p.amountPaid
                    })),
                    total: receivablesProjects.reduce((sum, p) => sum + (p.totalCost - p.amountPaid), 0)
                };
            case 'team_costs':
                const unpaidTeamCostsList = teamProjectPayments.filter(p => p.status === 'Unpaid' && activeProjectsList.some(ap => ap.id === p.projectId));
                return {
                    title: 'Rincian Biaya Tim Belum Lunas',
                    items: unpaidTeamCostsList.map(p => ({
                        id: p.id,
                        primary: p.teamMemberName,
                        secondary: `Proyek: ${projects.find(proj => proj.id === p.projectId)?.projectName || 'N/A'}`,
                        value: p.fee
                    })),
                    total: unpaidTeamCostsList.reduce((sum, p) => sum + p.fee, 0)
                };
            case 'top_type':
                const projectTypeCounts = projects.reduce((acc, p) => {
                    acc[p.projectType] = (acc[p.projectType] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
    
                const topProjectType = Object.keys(projectTypeCounts).length > 0
                    ? Object.entries(projectTypeCounts).sort(([, a], [, b]) => b - a)[0][0]
                    : 'N/A';
                
                const topTypeProjects = projects.filter(p => p.projectType === topProjectType);
                
                return {
                    title: `Daftar Proyek Jenis: ${topProjectType}`,
                    items: topTypeProjects.map(p => ({
                        id: p.id,
                        primary: p.projectName,
                        secondary: p.clientName,
                        value: p.status
                    })),
                    total: null
                };
            default:
                return null;
        }
    }, [activeStatModal, projects, teamProjectPayments]);


    const handleOpenForm = (mode: 'add' | 'edit', project?: Project) => {
        setFormMode(mode);
        if (mode === 'edit' && project) {
            const { addOns, paymentStatus, amountPaid, totalCost, progress, packageId, dpProofUrl, ...operationalData } = project;
            const pkg = packages.find(p => p.id === project.packageId);
            const statusConfig = profile.projectStatusConfig.find(s => s.name === project.status);
            const subStatuses = project.customSubStatuses ?? statusConfig?.subStatuses ?? [];

            setFormData({
                ...initialFormState,
                ...operationalData, 
                printingDetails: project.printingDetails || [], 
                activeSubStatuses: project.activeSubStatuses || [],
                customSubStatuses: subStatuses,
                printingCost: project.printingCost || pkg?.defaultPrintingCost || 0,
                transportCost: project.transportCost || pkg?.defaultTransportCost || 0,
                isEditingConfirmedByClient: project.isEditingConfirmedByClient || false,
                isPrintingConfirmedByClient: project.isPrintingConfirmedByClient || false,
                isDeliveryConfirmedByClient: project.isDeliveryConfirmedByClient || false,
            });
        } else {
            setFormData({...initialFormState, projectType: profile.projectTypes[0] || ''});
        }
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setFormData(initialFormState);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        setFormData(prev => {
            const newState = {...prev, [name]: value};
            if (name === 'status') {
                newState.activeSubStatuses = [];
                // When status changes, populate customSubStatuses from the new status template
                const statusConfig = profile.projectStatusConfig.find(s => s.name === value);
                newState.customSubStatuses = statusConfig?.subStatuses || [];
                if (value !== 'Dikirim') {
                    newState.shippingDetails = '';
                }
            }
            return newState;
        });
    };
    
    const handleSubStatusChange = (option: string, isChecked: boolean) => {
        setFormData(prev => {
            const currentSubStatuses = prev.activeSubStatuses || [];
            if (isChecked) {
                return { ...prev, activeSubStatuses: [...currentSubStatuses, option] };
            } else {
                return { ...prev, activeSubStatuses: currentSubStatuses.filter(s => s !== option) };
            }
        });
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId: client.id,
                clientName: client.name,
                projectName: prev.projectName || `Acara ${client.name}`
            }));
        }
    };

    const handleTeamChange = (member: TeamMember) => {
        setFormData(prev => {
            const isSelected = prev.team.some(t => t.memberId === member.id);
            if (isSelected) {
                return {
                    ...prev,
                    team: prev.team.filter(t => t.memberId !== member.id)
                }
            } else {
                const newTeamMember: AssignedTeamMember = {
                    memberId: member.id,
                    name: member.name,
                    role: member.role,
                    fee: member.standardFee,
                    reward: 0,
                };
                return {
                    ...prev,
                    team: [...prev.team, newTeamMember]
                }
            }
        });
    };
    
    const handleTeamFeeChange = (memberId: string, newFee: number) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, fee: newFee } : t)
        }));
    };

    const handleTeamRewardChange = (memberId: string, newReward: number) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, reward: newReward } : t)
        }));
    };

    const handleTeamSubJobChange = (memberId: string, subJob: string) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, subJob: subJob } : t)
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let projectData: Project;

        if (formMode === 'add') {
             projectData = {
                ...initialFormState,
                ...formData,
                id: `PRJ${Date.now()}`,
                progress: 0,
                totalCost: 0, // Will be set on client page
                amountPaid: 0,
                paymentStatus: PaymentStatus.BELUM_BAYAR,
                packageId: '',
                addOns: [],
            };
        } else { // edit mode
            const originalProject = projects.find(p => p.id === formData.id);
            if (!originalProject) return; 
            projectData = { ...originalProject, ...formData };
            
            const paymentCardId = cards.find(c => c.id !== 'CARD_CASH')?.id;
            if (!paymentCardId) {
                showNotification("Tidak ada kartu pembayaran untuk mencatat pengeluaran.");
            } else {
                let tempTransactions = [...transactions];
                let tempCards = [...cards];
                const fieldsToProcess: ('printingCost' | 'transportCost')[] = [];

                if (originalProject.printingCost !== projectData.printingCost) fieldsToProcess.push('printingCost');
                if (originalProject.transportCost !== projectData.transportCost) fieldsToProcess.push('transportCost');

                fieldsToProcess.forEach(field => {
                    const cost = projectData[field] || 0;
                    const category = field === 'printingCost' ? 'Biaya Cetak' : 'Transportasi';
                    const description = field === 'printingCost' ? `Biaya Cetak - ${projectData.projectName}` : `Biaya Transportasi - ${projectData.projectName}`;
                    const txId = `TRN-COST-${field.replace('Cost','')}-${projectData.id}`;
                    
                    const existingTxIndex = tempTransactions.findIndex(t => t.id === txId);

                    if (existingTxIndex > -1) {
                        const oldAmount = tempTransactions[existingTxIndex].amount;
                        if (cost > 0) {
                            tempTransactions[existingTxIndex].amount = cost;
                            const diff = cost - oldAmount;
                            tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance - diff } : c);
                        } else {
                            tempTransactions.splice(existingTxIndex, 1);
                            tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance + oldAmount } : c);
                        }
                    } else if (cost > 0) {
                        const newTx: Transaction = {
                            id: txId, date: new Date().toISOString().split('T')[0], description, amount: cost,
                            type: TransactionType.EXPENSE, projectId: projectData.id, category,
                            method: 'Sistem', cardId: paymentCardId,
                        };
                        tempTransactions.push(newTx);
                        tempCards = tempCards.map(c => c.id === paymentCardId ? { ...c, balance: c.balance - cost } : c);
                    }
                });

                setTransactions(tempTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setCards(tempCards);
            }
        }
        
        const allTeamMembersOnProject = projectData.team;
        const otherProjectPayments = teamProjectPayments.filter(p => p.projectId !== projectData.id);
        const newProjectPaymentEntries: TeamProjectPayment[] = allTeamMembersOnProject.map(teamMember => ({
            id: `TPP-${projectData.id}-${teamMember.memberId}`,
            projectId: projectData.id,
            teamMemberName: teamMember.name,
            teamMemberId: teamMember.memberId,
            date: projectData.date,
            status: 'Unpaid',
            fee: teamMember.fee,
            reward: teamMember.reward || 0,
        }));
        setTeamProjectPayments([...otherProjectPayments, ...newProjectPaymentEntries]);

        if (formMode === 'add') {
            setProjects(prev => [projectData, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
            setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        handleCloseForm();
    };

    const handleProjectDelete = (projectId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini? Semua data terkait (termasuk tugas tim dan transaksi) akan dihapus.")) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
            setTeamProjectPayments(prev => prev.filter(fp => fp.projectId !== projectId));
            setTransactions(prev => prev.filter(t => t.projectId !== projectId));
        }
    };
    
    const handleOpenBriefingModal = (project: Project) => {
        setSelectedProject(project);
        const date = new Date(project.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    
        const teamList = project.team.length > 0
            ? project.team.map(t => `- ${t.name}`).join('\n')
            : 'Tim belum ditugaskan.';
    
        const parts = [];
        parts.push(`${date}`);
        parts.push(`*${project.projectName}*`);
        parts.push(`\n*Tim Bertugas:*\n${teamList}`);
        
        if (project.startTime || project.endTime || project.location) parts.push(''); 
    
        if (project.startTime) parts.push(`*Waktu Mulai:* ${project.startTime}`);
        if (project.endTime) parts.push(`*Waktu Selesai:* ${project.endTime}`);
        if (project.location) parts.push(`*Lokasi :* ${project.location}`);
        
        if (project.notes) {
            parts.push('');
            parts.push(`*Catatan:*\n${project.notes}`);
        }
    
        if (project.location || project.driveLink) parts.push('');
    
        if (project.location) {
            const mapsQuery = encodeURIComponent(project.location);
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
            parts.push(`*Link Lokasi:*\n${mapsLink}`);
        }
    
        if (project.driveLink) {
             if (project.location) parts.push('');
            parts.push(`*Link Moodboard:*\n${project.driveLink}`);
        }

        if (profile.briefingTemplate) {
            parts.push('\n---\n');
            parts.push(profile.briefingTemplate);
        }

        const text = parts.join('\n').replace(/\n\n\n+/g, '\n\n').trim();
    
        setBriefingText(text);
        setWhatsappLink(`whatsapp://send?text=${encodeURIComponent(text)}`);
        
        const toGoogleCalendarFormat = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
        const timeRegex = /(\d{2}:\d{2})/;
        const startTimeMatch = project.startTime?.match(timeRegex);
        const endTimeMatch = project.endTime?.match(timeRegex);

        let googleLink = '';
        let icsContent = '';

        if (startTimeMatch) {
            const startDate = new Date(`${project.date}T${startTimeMatch[1]}:00`);
            const isInternalEvent = profile.eventTypes.includes(project.projectType);
            const durationHours = isInternalEvent ? 2 : 8;

            const endDate = endTimeMatch 
                ? new Date(`${project.date}T${endTimeMatch[1]}:00`)
                : new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

            const googleDates = `${toGoogleCalendarFormat(startDate)}/${toGoogleCalendarFormat(endDate)}`;
            
            const calendarDescription = `Briefing untuk ${project.projectName}:\n\n${text}`;

            googleLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(project.projectName)}&dates=${googleDates}&details=${encodeURIComponent(calendarDescription)}&location=${encodeURIComponent(project.location || '')}`;

            const icsDescription = calendarDescription.replace(/\n/g, '\\n');
            icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `UID:${project.id}@venapictures.com`,
                `DTSTAMP:${toGoogleCalendarFormat(new Date())}`,
                `DTSTART:${toGoogleCalendarFormat(startDate)}`,
                `DTEND:${toGoogleCalendarFormat(endDate)}`,
                `SUMMARY:${project.projectName}`,
                `DESCRIPTION:${icsDescription}`,
                `LOCATION:${project.location || ''}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');
        }

        setGoogleCalendarLink(googleLink);
        setIcsDataUri(icsContent ? `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}` : '');
    
        setIsBriefingModalOpen(true);
    };
    
    const getProgressForStatus = (status: string, config: ProjectStatusConfig[]): number => {
        const progressMap: { [key: string]: number } = {
            'Tertunda': 0,
            'Persiapan': 10,
            'Dikonfirmasi': 25,
            'Editing': 70,
            'Revisi': 80,
            'Cetak': 90,
            'Dikirim': 95,
            'Selesai': 100,
            'Dibatalkan': 0,
        };
        return progressMap[status] ?? 0;
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
        e.dataTransfer.setData("projectId", projectId);
        setDraggedProjectId(projectId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData("projectId");
        const projectToUpdate = projects.find(p => p.id === projectId);

        if (projectToUpdate && projectToUpdate.status !== newStatus) {
            setProjects(prevProjects =>
                prevProjects.map(p =>
                    p.id === projectId ? { ...p, status: newStatus, progress: getProgressForStatus(newStatus, profile.projectStatusConfig), activeSubStatuses: [] } : p
                )
            );
            showNotification(`Status "${projectToUpdate.projectName}" diubah ke "${newStatus}"`);
        }
        setDraggedProjectId(null);
    };
    
    const handleOpenConfirmationModal = (project: Project, subStatus: SubStatusConfig, isFollowUp: boolean) => {
        setConfirmationModalState({ project, subStatus, isFollowUp });
    };

    const handleCustomSubStatusChange = (index: number, field: 'name' | 'note', value: string) => {
        setFormData(prev => {
            const newCustomSubStatuses = [...(prev.customSubStatuses || [])];
            const oldName = newCustomSubStatuses[index]?.name;
            newCustomSubStatuses[index] = { ...newCustomSubStatuses[index], [field]: value };
    
            if (field === 'name' && oldName && (prev.activeSubStatuses || []).includes(oldName)) {
                const newActiveSubStatuses = (prev.activeSubStatuses || []).map(name => name === oldName ? value : name);
                return { ...prev, customSubStatuses: newCustomSubStatuses, activeSubStatuses: newActiveSubStatuses };
            }
    
            return { ...prev, customSubStatuses: newCustomSubStatuses };
        });
    };

    const addCustomSubStatus = () => {
        setFormData(prev => ({
            ...prev,
            customSubStatuses: [...(prev.customSubStatuses || []), { name: '', note: '' }]
        }));
    };

    const removeCustomSubStatus = (index: number) => {
        setFormData(prev => {
            const customSubStatuses = prev.customSubStatuses || [];
            const subStatusToRemove = customSubStatuses[index];
            const newCustomSubStatuses = customSubStatuses.filter((_, i) => i !== index);

            let newActiveSubStatuses = prev.activeSubStatuses || [];
            if (subStatusToRemove) {
                newActiveSubStatuses = newActiveSubStatuses.filter(name => name !== subStatusToRemove.name);
            }

            return {
                ...prev,
                customSubStatuses: newCustomSubStatuses,
                activeSubStatuses: newActiveSubStatuses
            };
        });
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Manajemen Proyek" subtitle="Lacak semua proyek dari awal hingga selesai.">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsInfoModalOpen(true)} className="button-secondary">Pelajari Halaman Ini</button>
                    <button onClick={() => handleOpenForm('add')} className="button-primary inline-flex items-center gap-2">
                        <PlusIcon className="w-5 h-5"/>
                        Tambah Proyek
                    </button>
                </div>
            </PageHeader>
            
            <div className="space-y-6">
                <ProjectAnalytics 
                    projects={projects}
                    teamProjectPayments={teamProjectPayments}
                    projectStatusConfig={profile.projectStatusConfig}
                    onStatCardClick={setActiveStatModal}
                />
                <ProjectSummaryTable
                    projects={allActiveProjects}
                    teamProjectPayments={teamProjectPayments}
                    handleOpenDetailModal={handleOpenDetailModal}
                    config={profile.projectStatusConfig}
                />

                <div className="bg-brand-surface p-4 rounded-xl shadow-lg border border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="input-group flex-grow !mt-0 w-full md:w-auto">
                        <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field !rounded-lg !border !bg-brand-bg p-2.5" placeholder=" " />
                        <label className="input-label">Cari proyek atau klien...</label>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field !rounded-lg !border !bg-brand-bg p-2.5 w-full md:w-48">
                            <option value="all">Semua Status</option>
                            {profile.projectStatusConfig.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                         <div className="p-1 bg-brand-bg rounded-lg flex items-center h-fit">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-brand-surface shadow-sm text-brand-text-light' : 'text-brand-text-secondary'}`}><ListIcon className="w-5 h-5"/></button>
                            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-brand-surface shadow-sm text-brand-text-light' : 'text-brand-text-secondary'}`}><LayoutGridIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
                
                {viewMode === 'list' ? (
                    <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
                        <div className="p-4 border-b border-brand-border">
                            <button onClick={() => setActiveSectionOpen(p => !p)} className="w-full flex justify-between items-center">
                                <h3 className="font-semibold text-brand-text-light">Proyek Aktif ({activeProjects.length})</h3>
                                {activeSectionOpen ? <ArrowUpIcon className="w-5 h-5 text-brand-text-secondary"/> : <ArrowDownIcon className="w-5 h-5 text-brand-text-secondary"/>}
                            </button>
                        </div>
                        {activeSectionOpen && <ProjectListView projects={activeProjects} handleOpenDetailModal={handleOpenDetailModal} handleOpenForm={handleOpenForm} handleProjectDelete={handleProjectDelete} config={profile.projectStatusConfig} />}
                         <div className="p-4 border-t border-brand-border">
                            <button onClick={() => setCompletedSectionOpen(p => !p)} className="w-full flex justify-between items-center">
                                <h3 className="font-semibold text-brand-text-light">Proyek Selesai & Dibatalkan ({completedAndCancelledProjects.length})</h3>
                                {completedSectionOpen ? <ArrowUpIcon className="w-5 h-5 text-brand-text-secondary"/> : <ArrowDownIcon className="w-5 h-5 text-brand-text-secondary"/>}
                            </button>
                        </div>
                        {completedSectionOpen && <ProjectListView projects={completedAndCancelledProjects} handleOpenDetailModal={handleOpenDetailModal} handleOpenForm={handleOpenForm} handleProjectDelete={handleProjectDelete} config={profile.projectStatusConfig} />}
                    </div>
                ) : (
                    <ProjectKanbanView projects={filteredProjects} handleOpenDetailModal={handleOpenDetailModal} draggedProjectId={draggedProjectId} handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDrop={handleDrop} config={profile.projectStatusConfig} />
                )}
            </div>
            
            <ProjectForm
                isOpen={isFormModalOpen}
                onClose={handleCloseForm}
                mode={formMode}
                formData={formData}
                onFormChange={handleFormChange}
                onSubStatusChange={handleSubStatusChange}
                onClientChange={handleClientChange}
                onTeamChange={handleTeamChange}
                onTeamFeeChange={handleTeamFeeChange}
                onTeamRewardChange={handleTeamRewardChange}
                onTeamSubJobChange={handleTeamSubJobChange}
                onCustomSubStatusChange={handleCustomSubStatusChange}
                onAddCustomSubStatus={addCustomSubStatus}
                onRemoveCustomSubStatus={removeCustomSubStatus}
                onSubmit={handleFormSubmit}
                clients={clients}
                teamMembers={teamMembers}
                profile={profile}
                teamByRole={teamByRole}
            />

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detail Proyek: ${selectedProject?.projectName}`} size="3xl">
                <ProjectDetailModal 
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    teamMembers={teamMembers}
                    clients={clients}
                    profile={profile}
                    showNotification={showNotification}
                    setProjects={setProjects}
                    onClose={() => setIsDetailModalOpen(false)}
                    handleOpenForm={handleOpenForm}
                    handleProjectDelete={handleProjectDelete}
                    handleOpenBriefingModal={handleOpenBriefingModal}
                    handleOpenConfirmationModal={handleOpenConfirmationModal}
                    packages={packages}
                />
            </Modal>

            <Modal isOpen={isBriefingModalOpen} onClose={() => setIsBriefingModalOpen(false)} title="Bagikan Briefing Proyek" size="2xl">
                {selectedProject && (
                    <div className="space-y-4">
                        <textarea value={briefingText} readOnly rows={15} className="input-field w-full text-sm"></textarea>
                        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-brand-border">
                            {icsDataUri && <a href={icsDataUri} download={`${selectedProject.projectName}.ics`} className="button-secondary text-sm">Download .ICS</a>}
                            {googleCalendarLink && <a href={googleCalendarLink} target="_blank" rel="noopener noreferrer" className="button-secondary text-sm">Tambah ke Google Calendar</a>}
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="button-primary inline-flex items-center gap-2">
                                <SendIcon className="w-4 h-4"/> Bagikan ke WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!activeStatModal} onClose={() => setActiveStatModal(null)} title={modalData?.title || ''} size="2xl">
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {modalData && modalData.items.length > 0 ? (
                        <div className="space-y-3">
                            {modalData.items.map(item => (
                                <div key={item.id} className="p-3 bg-brand-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-text-light">{item.primary}</p>
                                        <p className="text-sm text-brand-text-secondary">{item.secondary}</p>
                                    </div>
                                    <p className={`font-semibold ${typeof item.value === 'number' ? 'text-brand-text-light' : 'text-brand-accent'}`}>
                                        {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-brand-text-secondary py-8">Tidak ada data untuk ditampilkan.</p>}
                    {modalData?.total !== null && (
                        <div className="mt-4 pt-4 border-t border-brand-border font-bold flex justify-between text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(modalData?.total || 0)}</span>
                        </div>
                    )}
                </div>
            </Modal>

            {confirmationModalState && (
                <ConfirmationModal
                    project={confirmationModalState.project}
                    subStatus={confirmationModalState.subStatus}
                    isFollowUp={confirmationModalState.isFollowUp}
                    clients={clients}
                    teamMembers={teamMembers}
                    setProjects={setProjects}
                    onClose={() => setConfirmationModalState(null)}
                />
            )}
            
            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Panduan Halaman Proyek">
                <div className="space-y-4 text-sm text-brand-text-primary">
                    <p>Halaman ini adalah pusat kendali operasional untuk semua proyek Anda. Fokusnya adalah melacak progres dan mengelola detail harian.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Statistik Kunci:</strong> Di bagian atas, Anda akan melihat ringkasan finansial dan operasional dari proyek-proyek yang sedang aktif.</li>
                        <li><strong>Ringkasan Proyek Aktif:</strong> Tabel ini memberikan gambaran cepat tentang semua proyek yang belum selesai, termasuk status pembayaran klien, pembayaran tim, dan tugas mendesak seperti revisi yang menunggu.</li>
                        <li><strong>Tampilan Papan Kanban vs. Daftar:</strong>
                            <ul className="list-['-_'] list-inside ml-4">
                                <li><strong>Papan Kanban (<LayoutGridIcon className="w-4 h-4 inline-block"/>):</strong> Visualisasikan alur kerja Anda. Anda dapat menyeret (drag-and-drop) kartu proyek dari satu status ke status lainnya untuk memperbarui progresnya dengan cepat.</li>
                                <li><strong>Daftar (<ListIcon className="w-4 h-4 inline-block"/>):</strong> Tampilan tabel tradisional yang bagus untuk melihat detail lebih banyak sekaligus dan menyortir data.</li>
                            </ul>
                        </li>
                        <li><strong>Edit Detail Operasional:</strong> Tombol "Edit Proyek" membuka formulir untuk mengelola detail operasional seperti status, sub-status, jadwal, tim yang ditugaskan, tautan file, dan catatan internal.</li>
                        <li><strong>Detail Proyek Lengkap (<EyeIcon className="w-4 h-4 inline-block"/>):</strong> Klik ikon mata untuk membuka detail lengkap proyek, termasuk manajemen revisi, progres checklist, dan rincian laba/rugi.</li>
                        <li><strong>Catatan Penting:</strong> Penambahan proyek baru dan pengelolaan data klien/pembayaran utama dilakukan di halaman <strong>Manajemen Klien</strong>. Halaman ini fokus pada pengelolaan progres proyek yang sudah ada.</li>
                    </ul>
                </div>
            </Modal>

        </div>
    );
};
