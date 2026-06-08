/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Search, 
  User, 
  Phone, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Filter, 
  CheckSquare, 
  Trash2, 
  Plus, 
  Briefcase, 
  AlertCircle,
  Clock,
  ExternalLink,
  Users
} from "lucide-react";
import { Lead, LeadStatus, LeadPriority, ActivityTab, Role } from "../types";
import { PROJECTS, EMPLOYEES, LEAD_SOURCES } from "../initialData";

interface LeadsViewProps {
  leads: Lead[];
  currentRole: Role;
  onViewLead: (lead: Lead) => void;
  onAddRemark: (lead: Lead) => void;
  onAssignLead: (lead: Lead) => void;
  onAddNewLead: () => void;
  onBulkAssign: (leadIds: string[]) => void;
  selectedFilterFromDashboard?: { key: string; value: string } | null;
  clearDashboardFilter?: () => void;
}

export default function LeadsView({
  leads,
  currentRole,
  onViewLead,
  onAddRemark,
  onAssignLead,
  onAddNewLead,
  onBulkAssign,
  selectedFilterFromDashboard,
  clearDashboardFilter
}: LeadsViewProps) {
  const todayStr = "2026-06-03";
  const tomorrowStr = "2026-06-04";

  // Filter states
  const [activeTab, setActiveTab] = useState<ActivityTab>(ActivityTab.Overall);
  const [selectedStatusChip, setSelectedStatusChip] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("All");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("All");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("All");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  
  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Apply dashboard filter if present
  React.useEffect(() => {
    if (selectedFilterFromDashboard) {
      if (selectedFilterFromDashboard.key === "status") {
        setSelectedStatusChip(selectedFilterFromDashboard.value);
        setActiveTab(ActivityTab.Overall);
      } else if (selectedFilterFromDashboard.key === "activity") {
        const val = selectedFilterFromDashboard.value;
        if (val === "Today") {
          setActiveTab(ActivityTab.Today);
          setSelectedStatusChip("All");
        } else if (val === "Missed") {
          setActiveTab(ActivityTab.Pending); // Missed is displayed under Pending
          setSelectedStatusChip("All");
        } else if (val === "Active") {
          setActiveTab(ActivityTab.Overall);
          setSelectedStatusChip("All");
          // Clear closed leads filter
        }
      }
      if (clearDashboardFilter) clearDashboardFilter();
    }
  }, [selectedFilterFromDashboard, clearDashboardFilter]);

  // Determine which list item matches the active tab
  const getTabFilteredLeads = (list: Lead[], tab: ActivityTab) => {
    switch (tab) {
      case ActivityTab.Today:
        return list.filter(l => l.nextActivityDate === todayStr && !isClosedLead(l));
      case ActivityTab.Tomorrow:
        return list.filter(l => l.nextActivityDate === tomorrowStr && !isClosedLead(l));
      case ActivityTab.Pending:
        return list.filter(l => l.nextActivityDate && l.nextActivityDate < todayStr && !isClosedLead(l));
      case ActivityTab.Future:
        return list.filter(l => l.nextActivityDate && l.nextActivityDate > tomorrowStr && !isClosedLead(l));
      case ActivityTab.Completed:
        return list.filter(l => isClosedLead(l));
      case ActivityTab.Overall:
      default:
        return list;
    }
  };

  const isClosedLead = (l: Lead) => {
    return [
      LeadStatus.BookingDone,
      LeadStatus.Cancellation,
      LeadStatus.NotInterested,
      LeadStatus.InvalidNumber,
      LeadStatus.DuplicateLead
    ].includes(l.currentStatus);
  };

  // Pre-calculate count badges for activity tabs
  const tabCounts = useMemo(() => {
    return {
      overall: leads.length,
      today: leads.filter(l => l.nextActivityDate === todayStr && !isClosedLead(l)).length,
      tomorrow: leads.filter(l => l.nextActivityDate === tomorrowStr && !isClosedLead(l)).length,
      pending: leads.filter(l => l.nextActivityDate && l.nextActivityDate < todayStr && !isClosedLead(l)).length,
      future: leads.filter(l => l.nextActivityDate && l.nextActivityDate > tomorrowStr && !isClosedLead(l)).length,
      completed: leads.filter(l => isClosedLead(l)).length,
    };
  }, [leads]);

  // Pre-calculate count badges for status chips based on the CURRENT tab's leads!
  const currentTabLeads = useMemo(() => {
    return getTabFilteredLeads(leads, activeTab);
  }, [leads, activeTab]);

  const statusChips = [
    "All",
    LeadStatus.FreshLeads,
    LeadStatus.PhoneCall,
    LeadStatus.SiteVisitFollowUp,
    LeadStatus.SiteVisitPlanned,
    LeadStatus.SiteVisitDone,
    LeadStatus.RevisitFollowUp,
    LeadStatus.RevisitDone,
    LeadStatus.BookingDiscussion,
    LeadStatus.BookingDone,
    LeadStatus.DuplicateLead,
    LeadStatus.Rechurn,
    LeadStatus.Cancellation,
    LeadStatus.NotInterested,
    LeadStatus.InvalidNumber
  ];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: currentTabLeads.length };
    statusChips.slice(1).forEach((status) => {
      counts[status] = currentTabLeads.filter(l => l.currentStatus === status).length;
    });
    return counts;
  }, [currentTabLeads]);

  // Master Lead Filter Logic
  const filteredLeads = useMemo(() => {
    let list = [...currentTabLeads];

    // Status Chip filter
    if (selectedStatusChip !== "All") {
      list = list.filter(l => l.currentStatus === selectedStatusChip);
    }

    // Role-based filtering: "Sales Executive can update only assigned leads"
    if (currentRole === Role.SalesExecutive) {
      // Filter out unless assigned to the current employee (let's assume "Vamshi Krishna" is the logged-in sales executive for simulation)
      list = list.filter(l => l.assignedEmployee === "Vamshi Krishna");
    }

    // Text Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        l => l.customerName.toLowerCase().includes(q) || 
             l.phone.includes(q) || 
             l.assignedEmployee.toLowerCase().includes(q) ||
             (l.id && l.id.toLowerCase().includes(q))
      );
    }

    // Quick Filters
    if (selectedProjectFilter !== "All") {
      list = list.filter(l => l.interestedProject === selectedProjectFilter);
    }
    if (selectedEmployeeFilter !== "All") {
      list = list.filter(l => l.assignedEmployee === selectedEmployeeFilter);
    }
    if (selectedSourceFilter !== "All") {
      list = list.filter(l => l.leadSource === selectedSourceFilter);
    }
    if (selectedPriorityFilter !== "All") {
      list = list.filter(l => l.priority === selectedPriorityFilter);
    }

    // Sort: Hot priorities at top, then chronological creation
    return list.sort((a, b) => {
      const pA = a.priority === LeadPriority.Hot ? 3 : a.priority === LeadPriority.Warm ? 2 : 1;
      const pB = b.priority === LeadPriority.Hot ? 3 : b.priority === LeadPriority.Warm ? 2 : 1;
      if (pA !== pB) return pB - pA;
      return b.createdDate.localeCompare(a.createdDate);
    });
  }, [
    currentTabLeads, 
    selectedStatusChip, 
    currentRole, 
    searchQuery, 
    selectedProjectFilter, 
    selectedEmployeeFilter, 
    selectedSourceFilter, 
    selectedPriorityFilter
  ]);

  // Toggle selection for bulk assignment
  const handleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleBulkAssignClick = () => {
    if (selectedLeadIds.length === 0) return;
    onBulkAssign(selectedLeadIds);
    setSelectedLeadIds([]);
  };

  // Helper styles for badges & indicators
  const getStatusBadgeStyle = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.FreshLeads:
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case LeadStatus.PhoneCall:
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case LeadStatus.SiteVisitPlanned:
        return "bg-yellow-50 text-yellow-800 border border-yellow-200";
      case LeadStatus.SiteVisitDone:
        return "bg-green-50 text-green-700 border border-green-200";
      case LeadStatus.RevisitDone:
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case LeadStatus.BookingDone:
        return "bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold";
      case LeadStatus.Cancellation:
        return "bg-red-50 text-red-700 border border-red-200";
      case LeadStatus.DuplicateLead:
        return "bg-slate-100 text-slate-600 border border-slate-250";
      case LeadStatus.NotInterested:
        return "bg-gray-100 text-gray-700 border border-gray-200";
      case LeadStatus.InvalidNumber:
        return "bg-red-50 text-rose-700 border border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const getPriorityStyle = (priority: LeadPriority) => {
    switch (priority) {
      case LeadPriority.Hot:
        return "bg-red-50 text-red-700 border border-red-150 animate-pulse-soft";
      case LeadPriority.Warm:
        return "bg-amber-50 text-amber-700 border border-amber-150";
      case LeadPriority.Cold:
      default:
        return "bg-blue-50 text-blue-600 border border-blue-100";
    }
  };

  return (
    <div id="leads-screen-main" className="space-y-5">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex-1 relative">
          <input
            id="lead-search-bar"
            type="text"
            placeholder="Search leads by customer name, phone number, or agent ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-850 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white max-w-xl transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk Assign Triggers */}
          {selectedLeadIds.length > 0 && (
            <button
              id="bulk-assign-btn"
              onClick={handleBulkAssignClick}
              className="px-3.5 py-2 text-xs bg-brand-navy hover:bg-brand-navy/90 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm font-semibold"
            >
              <Users className="w-4 h-4 text-brand-gold" />
              <span>Bulk Assign Selected ({selectedLeadIds.length})</span>
            </button>
          )}

          <button
            id="add-lead-btn"
            onClick={onAddNewLead}
            className="px-4 py-2 text-sm bg-brand-maroon hover:bg-brand-maroon/90 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 text-brand-gold" />
            <span>Create New Lead</span>
          </button>
        </div>
      </div>

      {/* 4. Simple Activity Tabs */}
      <div id="activity-tabs-row" className="flex flex-wrap border-b border-slate-200 gap-1 overflow-x-auto whitespace-nowrap bg-white/20 p-1 rounded-xl">
        {[
          { id: ActivityTab.Overall, label: "Overall Database", count: tabCounts.overall },
          { id: ActivityTab.Today, label: "Today Follow-ups", count: tabCounts.today, alert: tabCounts.today > 0 },
          { id: ActivityTab.Tomorrow, label: "Tomorrow Schedule", count: tabCounts.tomorrow },
          { id: ActivityTab.Pending, label: "Pending Follow-ups", count: tabCounts.pending, danger: tabCounts.pending > 0 },
          { id: ActivityTab.Future, label: "Future Spokons", count: tabCounts.future },
          { id: ActivityTab.Completed, label: "Completed / Closed", count: tabCounts.completed }
        ].map((tab) => (
          <button
            id={`activity-tab-${tab.id.replace(/\s+/g, '-').toLowerCase()}`}
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedStatusChip("All"); // Reset subchip to prevent empty filtered grids
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === tab.id
                ? "bg-brand-navy text-white border-brand-navy shadow-sm"
                : "bg-white hover:bg-slate-50 text-slate-600 border-slate-100"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
              activeTab === tab.id
                ? "bg-brand-maroon text-brand-gold"
                : tab.danger
                  ? "bg-red-100 text-red-700 animate-pulse-soft"
                  : "bg-slate-100 text-slate-600"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 5. Horizontal Status Chips */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
        <div className="text-xs font-mono font-bold text-slate-400 mb-2.5 tracking-wider uppercase">Filter by Current Stage:</div>
        <div id="status-chips-container" className="flex gap-2 overflow-x-auto pb-1 shrink-0 whitespace-nowrap">
          {statusChips.map((chipName) => {
            const count = statusCounts[chipName] ?? 0;
            const isSelected = selectedStatusChip === chipName;
            return (
              <button
                id={`status-chip-${chipName.replace(/\s+/g, '-').toLowerCase()}`}
                key={chipName}
                onClick={() => setSelectedStatusChip(chipName)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold select-none flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-brand-maroon text-white border-brand-maroon shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200"
                }`}
              >
                <span>{chipName}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-brand-gold text-brand-maroon" : "bg-slate-200 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Filters Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
        {/* Project filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Project</label>
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-maroon"
          >
            <option value="All">All Projects</option>
            {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Employee filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Assigned Expert</label>
          <select
            value={selectedEmployeeFilter}
            onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-maroon"
          >
            <option value="All">All Consultants</option>
            {EMPLOYEES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Source filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Lead Campaign Source</label>
          <select
            value={selectedSourceFilter}
            onChange={(e) => setSelectedSourceFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-maroon"
          >
            <option value="All">All Campaign Sources</option>
            {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Priority filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Temperature</label>
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-maroon"
          >
            <option value="All">All Priorities</option>
            <option value={LeadPriority.Hot}>Hot Lead</option>
            <option value={LeadPriority.Warm}>Warm Lead</option>
            <option value={LeadPriority.Cold}>Cold Lead</option>
          </select>
        </div>
      </div>

      {/* Role restriction simulation alerts */}
      {currentRole === Role.SalesExecutive && (
        <div className="bg-amber-50 text-amber-800 text-xs px-3.5 py-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Simulation Active: As <strong>Sales Executive</strong> (Vamshi Krishna), you are restricted to viewing and updating your own assigned pipeline leads only.</span>
        </div>
      )}

      {/* Lead Table Container */}
      <div id="leads-table-container" className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 accent-brand-maroon cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Status & Priority</th>
                <th className="py-3 px-4">Project & Budget</th>
                <th className="py-3 px-4">Responsible</th>
                <th className="py-3 px-4">Next Activity</th>
                <th className="py-3 px-4">Latest Remark Log</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-450 text-sm">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    No active leads matching the filters were found in compliance with permissions.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <tr 
                      id={`lead-row-${lead.id}`}
                      key={lead.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${isSelected ? "bg-brand-maroon/5/30" : ""}`}
                    >
                      {/* Selection Box */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectLead(lead.id)}
                          className="rounded border-slate-300 accent-brand-maroon cursor-pointer"
                        />
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-navy/10 text-[#0F1C3F] flex items-center justify-center font-display font-medium text-sm border border-brand-navy/10 shrink-0">
                            {lead.customerName.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span 
                              onClick={() => onViewLead(lead)}
                              className="font-semibold text-brand-navy hover:text-brand-maroon hover:underline cursor-pointer flex items-center gap-1 text-[13px]"
                            >
                              {lead.customerName}
                              <ExternalLink className="w-3 h-3 text-slate-400 inline" />
                            </span>
                            
                            {/* Contact tools */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-500 font-mono">{lead.phone}</span>
                              
                              <a 
                                href={`tel:${lead.phone}`}
                                title="Click to Call (Launcher)"
                                className="p-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              >
                                <Phone className="w-3 h-3 text-brand-navy" />
                              </a>
                              <a 
                                href={`https://wa.me/91${lead.phone}?text=Hello%20${encodeURIComponent(lead.customerName)},%20this%20is%20regarding%2520your%20interest%20in%20Teramor%20Projects.`}
                                target="_blank"
                                rel="noreferrer"
                                title="Launch Instant WhatsApp Chat"
                                className="p-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Campaign Source */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-150">
                          {lead.leadSource}
                        </span>
                      </td>

                      {/* Status and Temperature indicator */}
                      <td className="py-3.5 px-4 space-y-1.5 w-[160px]">
                        <div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full block text-center truncate ${getStatusBadgeStyle(lead.currentStatus)}`}>
                            {lead.currentStatus}
                          </span>
                        </div>
                        <div>
                          <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-sm block text-center ${getPriorityStyle(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        </div>
                      </td>

                      {/* Interested Project & Budget */}
                      <td className="py-3.5 px-4 text-xs w-[180px]">
                        <div className="font-semibold text-slate-850 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.interestedProject}</span>
                        </div>
                        <div className="text-slate-500 mt-1 font-mono">{lead.requirement}</div>
                        <div className="text-brand-gold-muted font-bold mt-0.5 text-[11px]">{lead.budget}</div>
                      </td>

                      {/* Assigned Employee */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-1 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{lead.assignedEmployee || "Unassigned"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">ID: {lead.id}</div>
                      </td>

                      {/* Next Activity Column */}
                      <td className="py-3.5 px-4 text-xs max-w-[150px]">
                        {lead.nextActivityDate ? (
                          <div className="space-y-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                            <div className="font-semibold text-[#0F1C3F] flex items-center gap-1 leading-none">
                              <Clock className="w-3 h-3 text-[#A5786B]" />
                              <span className="truncate">{lead.nextActivity}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className={lead.nextActivityDate < todayStr && !isClosedLead(lead) ? "text-amber-600 font-bold" : "font-mono"}>
                                {lead.nextActivityDate} {lead.nextActivityTime}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No activity scheduled</span>
                        )}
                      </td>

                      {/* Latest Remark Log Preview */}
                      <td className="py-3.5 px-4 text-xs w-[220px]">
                        <p className="text-slate-650 leading-relaxed line-clamp-2 italic pr-2" title={lead.lastRemark}>
                          "{lead.lastRemark || "No remarks entered"}"
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 block">Spoken: {lead.lastSpokenDate || lead.createdDate}</span>
                      </td>

                      {/* Quick Actions Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`row-action-view-${lead.id}`}
                            onClick={() => onViewLead(lead)}
                            className="p-1.5 hover:bg-slate-100 rounded-md text-brand-navy border border-slate-150 shadow-xs hover:text-brand-maroon transition-all cursor-pointer"
                            title="View customer profile & timeline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            id={`row-action-remark-${lead.id}`}
                            onClick={() => onAddRemark(lead)}
                            className="p-1.5 hover:bg-slate-100 rounded-md text-emerald-600 border border-slate-150 shadow-xs hover:text-emerald-700 transition-all cursor-pointer"
                            title="Add call remark & schedule next follow-up"
                          >
                            <Plus className="w-3.5 h-3.5 inline" />
                            <span className="text-[10px] font-semibold font-sans tracking-tight ml-0.5">Remark</span>
                          </button>

                          {(currentRole === Role.SuperAdmin || currentRole === Role.Management || currentRole === Role.SalesHead) && (
                            <button
                              id={`row-action-assign-${lead.id}`}
                              onClick={() => onAssignLead(lead)}
                              className="p-1.5 hover:bg-slate-100 rounded-md text-brand-gold-muted border border-slate-150 shadow-xs hover:text-brand-navy transition-all cursor-pointer"
                              title="Assign lead to expert"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination & Summary bar */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-xs font-mono text-slate-500 flex justify-between items-center">
          <div>
            Showing <strong className="text-slate-700">{filteredLeads.length}</strong> of <strong className="text-slate-700">{leads.length}</strong> leads in database
          </div>
          <div>
            Active CRM Records
          </div>
        </div>
      </div>
    </div>
  );
}
