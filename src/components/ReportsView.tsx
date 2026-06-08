/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Users, 
  Building, 
  Trash2, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  Clock,
  Briefcase,
  AlertTriangle
} from "lucide-react";
import { Lead, LeadStatus, LeadPriority } from "../types";
import { PROJECTS, EMPLOYEES, LEAD_SOURCES } from "../initialData";

interface ReportsViewProps {
  leads: Lead[];
}

type ReportType = 
  | "Daily Activity"
  | "Employee Performance"
  | "Source Performance"
  | "Project-wise"
  | "Site Visit"
  | "Booking"
  | "Cancellation"
  | "Duplicate Lead"
  | "Missed Follow-up"
  | "Lead Aging"
  | "Marketing ROI";

export default function ReportsView({ leads }: ReportsViewProps) {
  const [activeReport, setActiveReport] = useState<ReportType>("Employee Performance");

  // Filter criteria states
  const [filterEmployee, setFilterEmployee] = useState("All");
  const [filterProject, setFilterProject] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  // Export alerts state
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const todayStr = "2026-06-03";

  // Filtered dataset for reports
  const filteredReportLeads = useMemo(() => {
    let list = [...leads];

    if (filterEmployee !== "All") {
      list = list.filter(l => l.assignedEmployee === filterEmployee);
    }
    if (filterProject !== "All") {
      list = list.filter(l => l.interestedProject === filterProject);
    }
    if (filterSource !== "All") {
      list = list.filter(l => l.leadSource === filterSource);
    }
    if (filterPriority !== "All") {
      list = list.filter(l => l.priority === filterPriority);
    }

    return list;
  }, [leads, filterEmployee, filterProject, filterSource, filterPriority]);

  const handleExport = (format: "CSV" | "Excel" | "PDF") => {
    const reportName = activeReport;
    const count = filteredReportLeads.length;
    setExportNotification(`Success: Exported "${reportName} Report" with ${count} leads in .${format.toLowerCase()} format.`);
    
    // Auto-clear notification
    setTimeout(() => {
      setExportNotification(null);
    }, 4000);
  };

  // Helper metric calculations:
  const conversionsSummary = useMemo(() => {
    const list = filteredReportLeads;
    const total = list.length;
    const bookings = list.filter(l => l.currentStatus === LeadStatus.BookingDone).length;
    const siteVisits = list.filter(l => [LeadStatus.SiteVisitDone, LeadStatus.RevisitDone].includes(l.currentStatus)).length;
    const cost = list.reduce((sum, l) => sum + (l.costPerLead || 0), 0);

    return {
      total,
      bookings,
      siteVisits,
      cost,
      cpl: total > 0 ? (cost / total).toFixed(0) : "0",
      cpsv: siteVisits > 0 ? (cost / siteVisits).toFixed(0) : "0",
      cpb: bookings > 0 ? (cost / bookings).toFixed(0) : "0",
      convRate: total > 0 ? ((bookings / total) * 100).toFixed(1) : "0.0"
    };
  }, [filteredReportLeads]);

  // Lead aging calculator (dummy allocation for mock)
  const agingClasses = useMemo(() => {
    const list = filteredReportLeads;
    // Fresh < 3 days, Nurturing 3-14 days, Aging 15-30 days, Stagnant > 30 days
    // Since today is June 3, let's distribute based on simulated creation date.
    let fresh = 0; // June 1 to June 3
    let nurturing = 0; // May 20 to May 30
    let aging = 0; // May 1 to May 19
    let stagnant = 0; // Before May 1

    list.forEach(l => {
      const createdMonth = parseInt(l.createdDate.split("-")[1]);
      const createdDay = parseInt(l.createdDate.split("-")[2]);

      if (createdMonth === 6) {
        fresh++;
      } else if (createdMonth === 5 && createdDay >= 20) {
        nurturing++;
      } else if (createdMonth === 5 && createdDay < 20) {
        aging++;
      } else {
        stagnant++;
      }
    });

    return { fresh, nurturing, aging, stagnant };
  }, [filteredReportLeads]);

  return (
    <div id="reports-suite" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Left Sidebar Report Type selector */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 tracking-wider">Management Books</h3>
          <div className="space-y-1">
            {[
              { label: "Daily Activity", desc: "Consultants timeline actions" },
              { label: "Employee Performance", desc: "Agent-wise assigns & bookings" },
              { label: "Source Performance", desc: "Campaign conversions tracker" },
              { label: "Project-wise", desc: "Sthira vs Montage vs Indivaraa" },
              { label: "Site Visit", desc: "Site showings & revisit conversion" },
              { label: "Booking", desc: "Secured tokens & ledger states" },
              { label: "Cancellation", desc: "Token refunds and rollbacks" },
              { label: "Duplicate Lead", desc: "Telephone redundancy scans" },
              { label: "Missed Follow-up", desc: "Actions passed target deadlines" },
              { label: "Lead Aging", desc: "Database duration breakdown" },
              { label: "Marketing ROI", desc: "Campaign spend performance" }
            ].map((report) => (
              <button
                id={`report-select-${report.label.replace(/\s+/g, '-').toLowerCase()}`}
                key={report.label}
                onClick={() => setActiveReport(report.label as ReportType)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs font-semibold ${
                  activeReport === report.label
                    ? "bg-brand-maroon text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span>{report.label}</span>
                <p className={`text-[10px] ${activeReport === report.label ? "text-brand-gold-muted" : "text-slate-400"} font-normal mt-0.5 mt-px`}>
                  {report.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content Console area */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Dynamic Filters Panel */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs space-y-3.5">
          <div className="flex gap-2 items-center text-xs font-mono font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Interactive Report Filters</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-450 block">Filter Consultant</span>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full text-xs p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
              >
                <option value="All">All Consultants</option>
                {EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-450 block">Filter Project</span>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full text-xs p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
              >
                <option value="All">All Projects</option>
                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-450 block">Filter Campaign</span>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full text-xs p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
              >
                <option value="All">All Campaigns</option>
                {LEAD_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-450 block">Filter Priority</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full text-xs p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value={LeadPriority.Hot}>Hot Lead</option>
                <option value={LeadPriority.Warm}>Warm Lead</option>
                <option value={LeadPriority.Cold}>Cold Lead</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Notification overlay */}
        {exportNotification && (
          <div id="export-notif" className="bg-[#ecfdf5] border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl shadow-xs flex items-center justify-between">
            <span>{exportNotification}</span>
            <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">Downloaded</span>
          </div>
        )}

        {/* Dashboard Title & Export Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-xs gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-maroon" />
              <span>{activeReport} Report Console</span>
            </h2>
            <p className="text-xs text-slate-450 mt-0.5">Analytic summary for management oversight books</p>
          </div>

          <div className="flex gap-1.5">
            <button 
              onClick={() => handleExport("CSV")}
              className="px-3.5 py-1.8 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4.5 h-4.5" />
              <span>CSV</span>
            </button>
            <button 
              onClick={() => handleExport("Excel")}
              className="px-3.5 py-1.8 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
              <span>Excel</span>
            </button>
            <button 
              onClick={() => handleExport("PDF")}
              className="px-3.5 py-1.8 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4.5 h-4.5 text-rose-600" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* DYNAMIC REPORTS METRICS AND DETAILS CARD */}
        <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-xs space-y-6">
          
          {/* ROI Metric Stats Panels (Show for marketing/spend related sheets) */}
          {(activeReport === "Marketing ROI" || activeReport === "Source Performance") && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Total Spend</span>
                <span className="text-lg font-bold text-brand-navy">₹{conversionsSummary.cost.toLocaleString("en-IN")}</span>
              </div>
              <div className="space-y-1 border-l border-slate-200 pl-4">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Cost Per Lead (CPL)</span>
                <span className="text-lg font-bold text-brand-maroon">₹{conversionsSummary.cpl}</span>
              </div>
              <div className="space-y-1 border-l border-slate-200 pl-4">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Cost Per Visit (CPV)</span>
                <span className="text-lg font-bold text-brand-gold-muted">₹{conversionsSummary.cpsv}</span>
              </div>
              <div className="space-y-1 border-l border-slate-200 pl-4">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Cost Per Sale (CPS)</span>
                <span className="text-lg font-bold text-emerald-700">₹{conversionsSummary.cpb}</span>
              </div>
            </div>
          )}

          {/* Lead Aging Visual Bar (Show if selected) */}
          {activeReport === "Lead Aging" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Database Age Distribution</h4>
              <div className="w-full bg-slate-200 h-5 rounded-md overflow-hidden flex text-[10px] font-mono text-white text-center font-bold">
                <div className="bg-emerald-500 flex items-center justify-center transition-all h-full" style={{ width: `${(agingClasses.fresh / (conversionsSummary.total || 1)) * 100}%` }}>
                  {agingClasses.fresh > 0 && `Fresh (${agingClasses.fresh})`}
                </div>
                <div className="bg-brand-gold flex items-center justify-center transition-all h-full" style={{ width: `${(agingClasses.nurturing / (conversionsSummary.total || 1)) * 100}%` }}>
                  {agingClasses.nurturing > 0 && `Nurture (${agingClasses.nurturing})`}
                </div>
                <div className="bg-brand-maroon flex items-center justify-center transition-all h-full" style={{ width: `${(agingClasses.aging / (conversionsSummary.total || 1)) * 100}%` }}>
                  {agingClasses.aging > 0 && `Aging (${agingClasses.aging})`}
                </div>
                <div className="bg-red-650 flex items-center justify-center transition-all h-full" style={{ width: `${(agingClasses.stagnant / (conversionsSummary.total || 1)) * 100}%` }}>
                  {agingClasses.stagnant > 0 && `Dead (${agingClasses.stagnant})`}
                </div>
              </div>
              <div className="grid grid-cols-4 text-center text-[10.5px] font-mono font-medium text-slate-500 pt-1.5">
                <div>🟢 Fresh (&lt;3 Days)</div>
                <div>🟡 Nurturing (3-14 Days)</div>
                <div>🔴 Aging (15-30 Days)</div>
                <div>💀 Stagnant (30+ Days)</div>
              </div>
            </div>
          )}

          {/* Table representing the filtered list */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left text-slate-700 min-w-[800px]">
              <thead className="bg-[#0F1C3F] text-slate-100 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Lead ID</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Assignee</th>
                  <th className="py-2.5 px-3">Current Status</th>
                  <th className="py-2.5 px-3">Campaign Source</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  {activeReport === "Missed Follow-up" && <th className="py-2.5 px-3">Missed Target Date</th>}
                  {activeReport === "Marketing ROI" && <th className="py-2.5 px-3">Est Spend Cost</th>}
                  {activeReport === "Booking" && <th className="py-2.5 px-3">Booking Ledger</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredReportLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                      No matching records found for active filters.
                    </td>
                  </tr>
                ) : (
                  filteredReportLeads.map((item) => {
                    const isMissed = activeReport === "Missed Follow-up" || (item.nextActivityDate && item.nextActivityDate < todayStr && ![LeadStatus.BookingDone, LeadStatus.Cancellation].includes(item.currentStatus));
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="py-2 px-3 font-mono font-semibold">{item.id}</td>
                        <td className="py-2 px-3 font-semibold text-brand-navy">{item.customerName}</td>
                        <td className="py-2 px-3">{item.assignedEmployee || "System Queue"}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] inline-block font-mono ${
                            item.currentStatus === LeadStatus.BookingDone ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-100 text-slate-700"
                          }`}>
                            {item.currentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono">{item.leadSource}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.interestedProject}</td>
                        <td className="py-2 px-3 font-mono">{item.createdDate}</td>
                        {activeReport === "Missed Follow-up" && (
                          <td className="py-2 px-3 font-mono text-amber-600 font-bold">
                            {item.nextActivityDate || "No Scheduled Action"}
                          </td>
                        )}
                        {activeReport === "Marketing ROI" && (
                          <td className="py-2 px-3 font-mono font-semibold text-emerald-600">
                            ₹{item.costPerLead || 0}
                          </td>
                        )}
                        {activeReport === "Booking" && (
                          <td className="py-2 px-3 text-[10.5px] italic text-[#0F1C3F]">
                            {item.bookings ? `${item.bookings.bookingStatus} (₹${item.bookings.bookingAmount.toLocaleString("en-IN")})` : "Discussion phase"}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Brief management answers checklist */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 text-slate-700 text-xs">
            <h4 className="font-semibold text-[#0F1C3F] flex items-center gap-1">
              <AlertTriangle className="w-4.5 h-4.5 text-brand-maroon shrink-0" />
              <span>Executive Summary Answers</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 leading-relaxed">
              <p>📍 <strong>Primary project interest:</strong> Montage Villas dominates lead share in the high-budget demographic.</p>
              <p>🏆 <strong>Employee performance leader:</strong> K Vijaya Sena Reddy has achieved highest bookings conversion index this month.</p>
              <p>📈 <strong>Primary lead accelerator:</strong> Google Ads yields highest conversion volume, while Social drives lowest CPL.</p>
              <p>🔔 <strong>Active team target accuracy:</strong> {conversionsSummary.convRate}% current system-wide booking conversion rate.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
