/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Menu, 
  Plus, 
  User, 
  LogOut, 
  TrendingUp, 
  Target,
  CircleDot,
  FileText,
  Lock,
  Mail,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  LockKeyhole
} from "lucide-react";
import { useFirebase } from "./components/FirebaseContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import LeadsView from "./components/LeadsView";
import LeadDetailDrawer from "./components/LeadDetailDrawer";
import AddLeadModal from "./components/AddLeadModal";
import AddRemarkModal from "./components/AddRemarkModal";
import AssignLeadModal from "./components/AssignLeadModal";
import CalendarView from "./components/CalendarView";
import ReportsView from "./components/ReportsView";
import MarketingSourcesView from "./components/MarketingSourcesView";
import UserManagementView from "./components/UserManagementView";
import { CustomersView, PostSalesView, SettingsView } from "./components/SecondaryViews";

import { Lead, LeadStatus, LeadPriority, Role } from "./types";

export default function App() {
  const todayStr = "2026-06-03";

  // Access Auth structures and database commands from context
  const {
    user,
    userProfile,
    loading,
    isLocalFallback,
    leads,
    activityLogs,
    currentRole,
    setCurrentRole,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout,
    createLead,
    updateLeadRemark,
    assignLeadSingle,
    assignLeadsBulk,
    deleteLeadRecord,
    updateLeadFields,
    loadDemoData,
    purgeDatabase,
    importCSVLeads,
    exportLeadsCSV,
    getBackupJSON,
    triggerStaticToast,
    systemToast
  } = useFirebase();

  // Navigation states
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  // Active Modals & Drawer controls
  const [activeDrawerLead, setActiveDrawerLead] = useState<Lead | null>(null);
  const [activeRemarkLead, setActiveRemarkLead] = useState<Lead | null>(null);
  const [activeAssignLead, setActiveAssignLead] = useState<Lead | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [bulkAssignLeadIds, setBulkAssignLeadIds] = useState<string[] | null>(null);

  // CSV controls
  const [csvFileContent, setCsvFileContent] = useState<string>("");
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [importLog, setImportLog] = useState<{ success: number; skipped: number; errors: string[] } | null>(null);

  // Authentication interface tabs
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<Role>(Role.SalesExecutive);

  // Active filter settings
  const [dashboardFilter, setDashboardFilter] = useState<{ key: string; value: string } | null>(null);

  // Confirmation prompts modal states as requested
  const [deletionConfirmLeadId, setDeletionConfirmLeadId] = useState<string | null>(null);
  const [purgeConfirmShow, setPurgeConfirmShow] = useState(false);

  // 1. Calculations & Metrics
  const criticalMissedCount = useMemo(() => {
    return leads.filter(
      l => l.nextActivityDate && 
           l.nextActivityDate < todayStr && 
           ![LeadStatus.BookingDone, LeadStatus.Cancellation, LeadStatus.DuplicateLead, LeadStatus.NotInterested, LeadStatus.InvalidNumber].includes(l.currentStatus)
    ).length;
  }, [leads]);

  const todayFollowupsCount = useMemo(() => {
    return leads.filter(
      l => l.nextActivityDate === todayStr && 
           ![LeadStatus.BookingDone, LeadStatus.Cancellation, LeadStatus.DuplicateLead, LeadStatus.NotInterested, LeadStatus.InvalidNumber].includes(l.currentStatus)
    ).length;
  }, [leads]);

  const navCounts = useMemo(() => {
    return {
      leads: leads.filter(l => l.currentStatus === LeadStatus.FreshLeads).length,
      todayFollowups: todayFollowupsCount,
      siteVisits: leads.filter(l => l.currentStatus === LeadStatus.SiteVisitPlanned).length,
      bookings: leads.filter(l => l.currentStatus === LeadStatus.BookingDone).length
    };
  }, [leads, todayFollowupsCount]);

  // Handle Operations triggers via Firebase context
  const handleCreateLead = async (newLeadData: any) => {
    await createLead(newLeadData);
    setShowAddLeadModal(false);
  };

  const handleUpdateRemark = async (remarkData: any) => {
    if (!activeRemarkLead) return;
    await updateLeadRemark(activeRemarkLead.id, remarkData);
    setActiveRemarkLead(null);
  };

  const handleSingleAssign = async (employeeName: string) => {
    if (!activeAssignLead) return;
    await assignLeadSingle(activeAssignLead.id, employeeName);
    setActiveAssignLead(null);
  };

  const handleBulkAssign = async (employeeName: string) => {
    if (!bulkAssignLeadIds) return;
    await assignLeadsBulk(bulkAssignLeadIds, employeeName);
    setBulkAssignLeadIds(null);
  };

  const executeDeleteLead = async () => {
    if (!deletionConfirmLeadId) return;
    const success = await deleteLeadRecord(deletionConfirmLeadId);
    if (success) {
      if (activeDrawerLead && activeDrawerLead.id === deletionConfirmLeadId) {
        setActiveDrawerLead(null);
      }
    }
    setDeletionConfirmLeadId(null);
  };

  const executePurge = async () => {
    await purgeDatabase();
    setPurgeConfirmShow(false);
  };

  const triggerCSVImport = async () => {
    if (!csvFileContent.trim()) {
      triggerStaticToast("Please paste CSV data first.", "warning");
      return;
    }
    const result = await importCSVLeads(csvFileContent);
    setImportLog(result);
    setCsvFileContent("");
  };

  const triggerDownloadCSV = () => {
    const csvContent = exportLeadsCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Teramor_Leads_Backup_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerStaticToast("CSV leads catalog exported successfully.");
  };

  const triggerDownloadBackup = () => {
    const backupJson = getBackupJSON();
    const blob = new Blob([backupJson], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TERAMOR_CRM_PORTFOLIO_BACKUP_${new Date().toISOString().substring(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerStaticToast("CRM database JSON backup generated and saved.");
  };

  // Helper bypass login for testing roles
  const handleSimulatedBypass = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    await loginWithEmail(email, pass);
  };

  // Click handler from Dashboard Metric widgets
  const handleDashboardCardClick = (key: string, value: string) => {
    setDashboardFilter({ key, value });
    setCurrentTab("leads");
  };

  // Render Loader Area
  if (loading) {
    return (
      <div id="loading-fallback" className="h-screen w-screen bg-brand-ivory flex flex-col justify-center items-center">
        <div className="p-4 bg-[#0F1C3F] rounded-2xl flex items-center justify-center shadow-2xl mb-4 animate-bounce">
          <CircleDot className="w-12 h-12 text-[#D4AF37] animate-spin" />
        </div>
        <h2 className="font-display font-bold text-brand-navy tracking-widest text-lg">TERAMOR DEVELOPERS</h2>
        <p className="text-xs text-slate-500 font-mono tracking-widest mt-1 uppercase">Synchronizing Client Ledger...</p>
      </div>
    );
  }

  // Render Authentication screen if client is unauthenticated
  if (!user) {
    return (
      <div id="auth-viewport" className="min-h-screen w-screen bg-[#F5F4F0] flex items-center justify-center p-4 md:p-8 font-sans">
        <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-12 min-h-[600px] border border-slate-100">
          
          {/* Left Decorative branding panel */}
          <div className="md:col-span-5 bg-brand-navy p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-maroon/25 rounded-full select-none transform translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-gold/10 rounded-full select-none transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-2 bg-brand-maroon rounded-lg">
                <CircleDot className="w-6 h-6 text-brand-gold" />
              </div>
              <span className="font-display font-medium tracking-widest text-lg">TERAMOR</span>
            </div>

            <div className="relative z-10 my-8">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-3">
                Secure executive real estate portal.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Access your real-time dashboard of premium project leads, site follow-ups, financial records, and booking audits.
              </p>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-4 text-[11px] text-brand-gold-muted font-mono uppercase tracking-widest">
              Verified Security Systems Active
            </div>
          </div>

          {/* Right auth operations panel */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold text-brand-navy">
                  {isRegistering ? "Register Associate Account" : "Associate Login"}
                </h2>
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs font-semibold text-brand-maroon hover:underline"
                >
                  {isRegistering ? "Already registered? Login" : "No account? Register"}
                </button>
              </div>

              {isLocalFallback && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-800 leading-relaxed">
                  <strong>Notice:</strong> App is running in Local fallback mockup. Accounts are simulated instantly for rapid evaluation. Google sign-in is disabled in template placeholders.
                </div>
              )}

              {/* Input forms */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (isRegistering) {
                  await signUpWithEmail(loginEmail, loginPassword, regName, regRole);
                } else {
                  await loginWithEmail(loginEmail, loginPassword);
                }
              }} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Chanakya Kumar"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-brand-maroon focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="employee@teramor.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-brand-maroon focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Authorization Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-brand-maroon focus:bg-white"
                    />
                  </div>
                </div>

                {isRegistering && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">CRM System Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as Role)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-semibold focus:outline-none focus:border-brand-maroon focus:bg-white"
                    >
                      {Object.values(Role).map(roleOption => (
                        <option key={roleOption} value={roleOption}>{roleOption}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full py-3 bg-brand-navy hover:bg-brand-navy/95 text-[#FAF9F6] rounded-xl font-display font-bold text-sm tracking-widest transition-colors shadow-lg mt-3"
                >
                  {isRegistering ? "CREATE INTEGRATED PROFILE" : "VERIFY ENTRANCE & ACCESS"}
                </button>
              </form>

              {/* OAuth Google Sign In */}
              <div className="mt-6">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-mono text-slate-400">CORP OAUTH ENTRY</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button 
                  onClick={loginWithGoogle}
                  className="w-full py-3 border border-slate-250 hover:bg-slate-50 text-brand-navy rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 "
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.0003 9.6c.01-.01.01-.01.01-.01H21.6v4.8h-4.8c-.51 1.76-2.11 3.2-4.8 3.2-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.51 0 2.8.61 3.8 1.6l3.4-3.4C17.3 2.91 14.81 2 12.0003 2c-5.5 0-10 4.5-10 10s4.5 10 10 10c5.3 0 9.8-3.9 9.8-10 0-.6-.1-1.2-.2-1.8H12" />
                  </svg>
                  <span>Authenticate using Google GSuite</span>
                </button>
              </div>
            </div>

            {/* Quick Testing Accounts Section as requested to retain demo options */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-3 font-semibold">Testing Bypasses (Role Simulation)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button 
                  onClick={() => handleSimulatedBypass("admin@teramor.in", "123456")}
                  className="p-2 border border-brand-maroon/20 hover:border-brand-maroon bg-brand-maroon/5 rounded-lg text-left text-[11px] font-sans"
                >
                  <div className="font-bold text-brand-maroon">Super Admin</div>
                  <div className="text-[10px] text-slate-500 font-mono">admin@teramor.in</div>
                </button>
                <button 
                  onClick={() => handleSimulatedBypass("sales.exec@teramor.in", "123456")}
                  className="p-2 border border-slate-200 hover:border-brand-navy bg-slate-50 rounded-lg text-left text-[11px] font-sans"
                >
                  <div className="font-bold text-brand-navy">Sales Executive</div>
                  <div className="text-[10px] text-slate-500 font-mono">sales.exec@teramor.in</div>
                </button>
                <button 
                  onClick={() => handleSimulatedBypass("management@teramor.in", "123456")}
                  className="p-2 border border-slate-200 hover:border-brand-gold bg-slate-50 rounded-lg text-left text-[11px] font-sans"
                >
                  <div className="font-bold text-[#b49323]">Management</div>
                  <div className="text-[10px] text-slate-500 font-mono">manager@teramor.in</div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Render main core CRM App Layout
  return (
    <div id="teramor-crm-viewport" className="flex h-screen w-screen overflow-hidden bg-brand-grey text-[#0F1C3F] selection:bg-brand-maroon/20 font-sans">
      
      {/* 1. Left Navigation Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        userRole={currentRole}
        navCounts={navCounts}
      />

      {/* Primary Content operations area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* 2. Topbar Header */}
        <header id="crm-topbar" className="h-16 border-b border-slate-200 bg-white px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-medium text-slate-850 tracking-tight text-sm md:text-base">
              Operations Board &mdash; <strong className="text-brand-maroon capitalize">{currentTab.replace("_", " ")}</strong>
            </h1>
          </div>

          {/* Interactive tools */}
          <div className="flex items-center gap-4">
            
            {/* Live alerts notifications */}
            <div className="flex items-center gap-3">
              {criticalMissedCount > 0 && (
                <div 
                  className="bg-orange-50 text-orange-650 px-3 py-1 bg-amber-50 rounded-lg border border-orange-200 text-xs font-semibold flex items-center gap-1.5 animate-pulse cursor-pointer"
                  onClick={() => {
                    setCurrentTab("leads");
                    handleDashboardCardClick("activity", "Missed");
                  }}
                  title="Click to process missed follow-up items"
                >
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="hidden md:inline">{criticalMissedCount} Overdue Follow-ups</span>
                  <span className="inline md:hidden">{criticalMissedCount}</span>
                </div>
              )}

              {/* Notification bell widget */}
              <div 
                className="p-1.5 rounded-lg hover:bg-slate-55/70 relative border border-slate-200 cursor-pointer bg-white text-slate-500 hover:text-brand-navy"
                onClick={() => {
                  setCurrentTab("leads");
                  handleDashboardCardClick("activity", "Today");
                }}
                title={`${todayFollowupsCount} Follow-ups planned for today`}
              >
                <Bell className="w-4.5 h-4.5" />
                {todayFollowupsCount > 0 && (
                  <span className="w-2 h-2 bg-brand-maroon rounded-full absolute top-1 right-1.5 animate-pulse"></span>
                )}
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

            {/* Quick user profile dropdown */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono">Simulate Department:</span>
              <select
                id="header-role-switcher"
                value={currentRole}
                onChange={(e) => {
                  setCurrentRole(e.target.value as Role);
                  triggerStaticToast(`Simulating department role: ${e.target.value}`);
                }}
                className="bg-slate-50 border border-slate-205 py-1 px-2.5 rounded-md font-semibold text-brand-navy focus:outline-none"
              >
                {Object.values(Role).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="h-5 w-px bg-slate-200"></div>

            {/* Account settings / Logout */}
            <div className="flex items-center gap-2">
              <div className="flex-col text-right hidden lg:flex">
                <div className="text-[11px] font-bold text-brand-navy">{user.displayName || user.email}</div>
                <div className="text-[9px] text-slate-500 capitalize">{currentRole}</div>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-brand-maroon hover:border-brand-maroon/50 transition-colors"
                title="Secure GSuite Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>
        </header>

        {/* Action Panel Utilities Bar for Management & Administrators */}
        {currentRole !== Role.SalesExecutive && (
          <div className="bg-brand-navy text-white px-6 py-2.5 shrink-0 flex items-center justify-between text-xs font-mono border-b border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-brand-gold font-bold uppercase tracking-widest text-[9px]">Administrative Console:</span>
              <span className="text-slate-300">Live Leads count: <strong className="text-white">{leads.length}</strong></span>
              <span className="h-3 w-px bg-white/20"></span>
              <span className="text-slate-300">Real-time DB updates: <strong className="text-emerald-400">Online</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowCSVModal(true)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-semibold transition-colors flex items-center gap-1"
                title="Paste / upload lead files in CSV"
              >
                <Upload className="w-3.5 h-3.5 text-brand-gold" />
                <span>CSV Import</span>
              </button>
              <button 
                onClick={triggerDownloadCSV}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-semibold transition-colors flex items-center gap-1"
                title="Download leads spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Export</span>
              </button>
              <button 
                onClick={triggerDownloadBackup}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-semibold transition-colors flex items-center gap-1"
                title="Unzip backup JSON database"
              >
                <LockKeyhole className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>
              <button 
                onClick={loadDemoData}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded font-semibold transition-colors flex items-center gap-1"
                title="Populate current context database"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Demo Data</span>
              </button>
              {currentRole === Role.SuperAdmin && (
                <button 
                  onClick={() => setPurgeConfirmShow(true)}
                  className="px-2 py-1 bg-brand-maroon hover:bg-red-800 text-white rounded font-semibold transition-colors flex items-center gap-1"
                  title="Purge leads database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Screen Views router */}
        <div className="flex-1 p-6 overflow-y-auto bg-brand-grey/50">
          
          {/* Toast notifications */}
          {systemToast && (
            <div 
              id="crm-toast-msg"
              className={`fixed top-18 right-6 z-50 p-4 rounded-xl border shadow-lg max-w-sm animate-slide-in flex gap-2.5 items-center ${
                systemToast.type === "warning"
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-[#f0fdf4] border-emerald-300 text-emerald-800"
              }`}
            >
              <CheckCircle className={`w-5 h-5 ${systemToast.type === "warning" ? "text-amber-500" : "text-emerald-500"} shrink-0`} />
              <span className="text-xs font-semibold leading-relaxed font-sans">{systemToast.text}</span>
            </div>
          )}

          {/* Router switcher */}
          {currentTab === "dashboard" && (
            <Dashboard 
              leads={leads} 
              onCardClick={handleDashboardCardClick}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === "leads" && (
            <LeadsView 
              leads={leads}
              currentRole={currentRole}
              onViewLead={setActiveDrawerLead}
              onAddRemark={setActiveRemarkLead}
              onAssignLead={setActiveAssignLead}
              onAddNewLead={() => setShowAddLeadModal(true)}
              onBulkAssign={(leadIds) => setBulkAssignLeadIds(leadIds)}
              selectedFilterFromDashboard={dashboardFilter}
              clearDashboardFilter={() => setDashboardFilter(null)}
            />
          )}

          {currentTab === "today_followups" && (
            <LeadsView 
              leads={leads}
              currentRole={currentRole}
              onViewLead={setActiveDrawerLead}
              onAddRemark={setActiveRemarkLead}
              onAssignLead={setActiveAssignLead}
              onAddNewLead={() => setShowAddLeadModal(true)}
              onBulkAssign={(leadIds) => setBulkAssignLeadIds(leadIds)}
              selectedFilterFromDashboard={{ key: "activity", value: "Today" }}
              clearDashboardFilter={() => {}}
            />
          )}

          {currentTab === "site_visits" && (
            <LeadsView 
              leads={leads}
              currentRole={currentRole}
              onViewLead={setActiveDrawerLead}
              onAddRemark={setActiveRemarkLead}
              onAssignLead={setActiveAssignLead}
              onAddNewLead={() => setShowAddLeadModal(true)}
              onBulkAssign={(leadIds) => setBulkAssignLeadIds(leadIds)}
              selectedFilterFromDashboard={{ key: "status", value: LeadStatus.SiteVisitPlanned }}
              clearDashboardFilter={() => {}}
            />
          )}

          {currentTab === "bookings" && (
            <LeadsView 
              leads={leads}
              currentRole={currentRole}
              onViewLead={setActiveDrawerLead}
              onAddRemark={setActiveRemarkLead}
              onAssignLead={setActiveAssignLead}
              onAddNewLead={() => setShowAddLeadModal(true)}
              onBulkAssign={(leadIds) => setBulkAssignLeadIds(leadIds)}
              selectedFilterFromDashboard={{ key: "status", value: LeadStatus.BookingDone }}
              clearDashboardFilter={() => {}}
            />
          )}

          {currentTab === "calendar" && (
            <CalendarView 
              leads={leads}
              onViewLead={setActiveDrawerLead}
            />
          )}

          {currentTab === "reports" && (
            <ReportsView 
              leads={leads}
            />
          )}

          {currentTab === "marketing" && (
            <MarketingSourcesView 
              leads={leads}
            />
          )}

          {currentTab === "users" && (
            <UserManagementView 
              leads={leads}
              currentRole={currentRole}
              onChangeRole={setCurrentRole}
            />
          )}

          {currentTab === "customers" && (
            <CustomersView 
              leads={leads}
              currentRole={currentRole}
              onViewLead={setActiveDrawerLead}
            />
          )}

          {currentTab === "post_sales" && (
            <PostSalesView 
              leads={leads}
              currentRole={currentRole}
              onViewLead={setActiveDrawerLead}
            />
          )}

          {currentTab === "settings" && (
            <SettingsView 
              currentRole={currentRole}
            />
          )}

        </div>
      </main>

      {/* ==========================================================
         DIALOG MODALS & DRAWERS MOUNT OVERLAYS
         ========================================================== */}
      
      {/* 1. Account details slider profile drawer */}
      {activeDrawerLead && (
        <LeadDetailDrawer 
          lead={activeDrawerLead}
          onClose={() => setActiveDrawerLead(null)}
          onAddRemark={() => setActiveRemarkLead(activeDrawerLead)}
          onDeleteLead={(id) => setDeletionConfirmLeadId(id)}
        />
      )}

      {/* 2. New conversation remark update logging popup */}
      {activeRemarkLead && (
        <AddRemarkModal 
          lead={activeRemarkLead}
          onClose={() => setActiveRemarkLead(null)}
          onSave={handleUpdateRemark}
        />
      )}

      {/* 3. Single Lead assignment dialog */}
      {activeAssignLead && (
        <AssignLeadModal 
          leadIds={[activeAssignLead.id]}
          customerNames={[activeAssignLead.customerName]}
          onClose={() => setActiveAssignLead(null)}
          onAssign={handleSingleAssign}
        />
      )}

      {/* 4. Bulk Leads assignments allocation dialog */}
      {bulkAssignLeadIds && bulkAssignLeadIds.length > 0 && (
        <AssignLeadModal 
          leadIds={bulkAssignLeadIds}
          customerNames={leads.filter(l => bulkAssignLeadIds.includes(l.id)).map(l => l.customerName)}
          onClose={() => setBulkAssignLeadIds(null)}
          onAssign={handleBulkAssign}
        />
      )}

      {/* 5. Add New Sourced Lead form popup */}
      {showAddLeadModal && (
        <AddLeadModal 
          existingLeads={leads}
          onClose={() => setShowAddLeadModal(false)}
          onSave={handleCreateLead}
        />
      )}

      {/* 6. Paste CSV input Dialog as requested */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-brand-navy">
                <Upload className="w-5 h-5 text-brand-maroon" />
                <h3 className="font-display font-semibold text-base">Import Lead Records from CSV</h3>
              </div>
              <button 
                className="p-1 rounded-full hover:bg-slate-100 font-bold text-slate-400 hover:text-slate-700" 
                onClick={() => {
                  setShowCSVModal(false);
                  setImportLog(null);
                }}
              >
                ✕
              </button>
            </div>

            {importLog ? (
              <div className="space-y-4 overflow-y-auto flex-1">
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-3 border border-emerald-200">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h4 className="font-semibold text-sm">Upload operations complete</h4>
                    <p className="text-xs">Successfully written: <strong>{importLog.success}</strong> records. Skipped: <strong>{importLog.skipped}</strong>.</p>
                  </div>
                </div>
                {importLog.errors.length > 0 && (
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-500 uppercase">Conflict / Process audit:</span>
                    <ul className="text-[11px] font-mono text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100 space-y-1 mt-1 max-h-48 overflow-y-auto">
                      {importLog.errors.map((err, index) => <li key={index}>• {err}</li>)}
                    </ul>
                  </div>
                )}
                <button 
                  onClick={() => {
                    setImportLog(null);
                    setShowCSVModal(false);
                  }}
                  className="w-full py-2 bg-brand-navy text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  DISMISS
                </button>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Paste raw CSV text containing headers like <strong className="text-brand-navy">Name, Phone</strong> (and optional alternateNumber, email, location, budget, requirement, project, source). Phone fields are automatically normalized and evaluated for duplication to retain pristine ledger hygiene.
                </p>
                <div className="text-[11px] font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 overflow-x-auto select-all">
                  Name, Phone, Email, Location, Project, Source<br />
                  Suresh Naidu, 9876500000, suresh@gmail.com, Gachibowli, Montage Villas, Google Ads
                </div>
                <textarea 
                  value={csvFileContent}
                  onChange={(e) => setCsvFileContent(e.target.value)}
                  placeholder="Paste csv text here..."
                  className="flex-1 w-full bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-brand-maroon focus:bg-white min-h-[150px] resize-none"
                />
                
                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 shrink-0">
                  <button 
                    onClick={() => setShowCSVModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={triggerCSVImport}
                    className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon/95 text-white rounded-lg text-xs font-bold"
                  >
                    Import Records
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation dialogues step */}
      {deletionConfirmLeadId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-scale-up">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-brand-navy text-lg">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you absolutely sure you want to permanently delete lead file <strong className="text-brand-navy font-semibold">{deletionConfirmLeadId}</strong>? This will create an immutable audit trail and remove all phone history. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => setDeletionConfirmLeadId(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteLead}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Purge Database Confirmation */}
      {purgeConfirmShow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-scale-up">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-brand-navy text-lg">Purge Entire Database</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Warning! You are about to erase ALL lead entries in the database. This action is reserved solely for Super Admin users doing system resets.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => setPurgeConfirmShow(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executePurge}
                className="py-2.5 bg-brand-maroon hover:bg-brand-maroon/95 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Yes, Purge Database
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
