/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Users, 
  Sparkles, 
  PhoneCall, 
  AlertTriangle, 
  MapPin, 
  CheckCircle, 
  RefreshCw, 
  DollarSign, 
  XSquare, 
  Copy, 
  Activity, 
  TrendingUp,
  UserCheck,
  Building,
  Target
} from "lucide-react";
import { Lead, LeadStatus, LeadPriority } from "../types";

interface DashboardProps {
  leads: Lead[];
  onCardClick: (filterKey: string, filterValue: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({ leads, onCardClick, setCurrentTab }: DashboardProps) {
  const todayStr = "2026-06-03";

  // Calculate stats
  const totalLeads = leads.length;
  
  const freshLeads = leads.filter(l => l.currentStatus === LeadStatus.FreshLeads).length;
  
  const todayFollowups = leads.filter(
    l => l.nextActivityDate === todayStr && 
         ![LeadStatus.BookingDone, LeadStatus.Cancellation, LeadStatus.DuplicateLead, LeadStatus.InvalidNumber].includes(l.currentStatus)
  ).length;

  const missedFollowups = leads.filter(
    l => l.nextActivityDate && 
         l.nextActivityDate < todayStr && 
         ![LeadStatus.BookingDone, LeadStatus.Cancellation, LeadStatus.DuplicateLead, LeadStatus.InvalidNumber].includes(l.currentStatus)
  ).length;

  const siteVisitsPlanned = leads.filter(l => l.currentStatus === LeadStatus.SiteVisitPlanned).length;
  const siteVisitsDone = leads.filter(l => l.currentStatus === LeadStatus.SiteVisitDone).length;
  const revisits = leads.filter(l => [LeadStatus.RevisitDone, LeadStatus.RevisitFollowUp].includes(l.currentStatus)).length;
  const bookings = leads.filter(l => l.currentStatus === LeadStatus.BookingDone).length;
  const cancellations = leads.filter(l => l.currentStatus === LeadStatus.Cancellation).length;
  const duplicates = leads.filter(l => l.currentStatus === LeadStatus.DuplicateLead).length;
  
  const activeLeads = leads.filter(
    l => ![LeadStatus.Cancellation, LeadStatus.DuplicateLead, LeadStatus.NotInterested, LeadStatus.InvalidNumber].includes(l.currentStatus)
  ).length;

  const conversionRate = totalLeads > 0 ? ((bookings / totalLeads) * 100).toFixed(1) : "0.0";

  // Employee Performance Map
  const employeePerformances = leads.reduce((acc, lead) => {
    const emp = lead.assignedEmployee || "Unassigned";
    if (!acc[emp]) {
      acc[emp] = { total: 0, bookings: 0, siteVisits: 0, hot: 0 };
    }
    acc[emp].total += 1;
    if (lead.currentStatus === LeadStatus.BookingDone) {
      acc[emp].bookings += 1;
    }
    if (lead.currentStatus === LeadStatus.SiteVisitDone || lead.currentStatus === LeadStatus.RevisitDone) {
      acc[emp].siteVisits += 1;
    }
    if (lead.priority === LeadPriority.Hot) {
      acc[emp].hot += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; bookings: number; siteVisits: number; hot: number }>);

  // Project health analytics
  const projectCounts = leads.reduce((acc, lead) => {
    const proj = lead.interestedProject || "Other";
    acc[proj] = (acc[proj] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cardConfig = [
    {
      id: "total_leads",
      title: "Total Leads",
      count: totalLeads,
      icon: Users,
      color: "border-slate-300 hover:border-brand-navy shadow-xs bg-white text-brand-navy",
      filterKey: "status",
      filterValue: "All",
      desc: "Gross database depth"
    },
    {
      id: "fresh_leads",
      title: "Fresh Leads",
      count: freshLeads,
      icon: Sparkles,
      color: "border-[#e0f2fe] bg-[#f0f9ff] text-sky-700 hover:border-sky-300",
      filterKey: "status",
      filterValue: LeadStatus.FreshLeads,
      desc: "Untouched web listings"
    },
    {
      id: "today_followups",
      title: "Today Follow-ups",
      count: todayFollowups,
      icon: PhoneCall,
      color: "border-[#fef3c7] bg-[#fffbeb] text-amber-700 hover:border-amber-300",
      filterKey: "activity",
      filterValue: "Today",
      desc: "Pipeline actions for today"
    },
    {
      id: "missed_followups",
      title: "Missed Follow-ups",
      count: missedFollowups,
      icon: AlertTriangle,
      color: "border-[#ffedd5] bg-[#fff7ed] text-orange-600 hover:border-orange-300",
      filterKey: "activity",
      filterValue: "Missed",
      desc: "Action items passed deadline"
    },
    {
      id: "site_visits_planned",
      title: "Site Visits Planned",
      count: siteVisitsPlanned,
      icon: MapPin,
      color: "border-[#fef9c3] bg-[#fefce8] text-yellow-600 hover:border-yellow-300",
      filterKey: "status",
      filterValue: LeadStatus.SiteVisitPlanned,
      desc: "Scheduled onsite showings"
    },
    {
      id: "site_visits_done",
      title: "Site Visits Done",
      count: siteVisitsDone,
      icon: UserCheck,
      color: "border-[#d1fae5] bg-[#ecfdf5] text-emerald-700 hover:border-emerald-300",
      filterKey: "status",
      filterValue: LeadStatus.SiteVisitDone,
      desc: "Physical inspection complete"
    },
    {
      id: "revisits",
      title: "Revisits Done",
      count: revisits,
      icon: RefreshCw,
      color: "border-[#f3e8ff] bg-[#faf5ff] text-purple-700 hover:border-purple-300",
      filterKey: "status",
      filterValue: LeadStatus.RevisitDone,
      desc: "Second-look buyer profiles"
    },
    {
      id: "bookings",
      title: "Bookings",
      count: bookings,
      icon: DollarSign,
      color: "border-[#d1fae5] bg-[#f0fdf4] text-green-700 hover:border-green-400 font-bold",
      filterKey: "status",
      filterValue: LeadStatus.BookingDone,
      desc: "Token deposits complete"
    },
    {
      id: "cancellations",
      title: "Cancellations",
      count: cancellations,
      icon: XSquare,
      color: "border-[#fee2e2] bg-[#fef2f2] text-red-600 hover:border-red-300",
      filterKey: "status",
      filterValue: LeadStatus.Cancellation,
      desc: "Refund requests or archives"
    },
    {
      id: "duplicates",
      title: "Duplicate Leads",
      count: duplicates,
      icon: Copy,
      color: "border-[#f1f5f9] bg-[#f8fafc] text-slate-500 hover:border-slate-300",
      filterKey: "status",
      filterValue: LeadStatus.DuplicateLead,
      desc: "Number redundancy checks"
    },
    {
      id: "active_leads",
      title: "Active Leads",
      count: activeLeads,
      icon: Activity,
      color: "border-brand-maroon/20 hover:border-brand-maroon bg-white text-brand-maroon",
      filterKey: "activity",
      filterValue: "Active",
      desc: "Viable active customer base"
    },
    {
      id: "conversion_rate",
      title: "Conversion Rate",
      count: `${conversionRate}%`,
      icon: TrendingUp,
      color: "border-[#e0f2fe] bg-[#f0fcfc] text-teal-700 hover:border-teal-300",
      filterKey: "status",
      filterValue: "Conversion",
      desc: "Gross booking / gross leads"
    }
  ];

  const handleCardClickInner = (card: typeof cardConfig[0]) => {
    if (card.filterKey === "status" && card.filterValue === "Conversion") {
      setCurrentTab("reports");
    } else {
      onCardClick(card.filterKey, card.filterValue);
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Dynamic Greetings Area */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-bold text-brand-navy tracking-tight">Executive Operations Center</h2>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to the Teramor digital workspace. Today is <span className="font-semibold text-brand-maroon">Wednesday, Jun 3, 2026</span>.
          </p>
        </div>
        <div className="hidden md:flex gap-1.5 items-center px-4 py-2 bg-brand-navy/5 rounded-lg text-brand-navy text-xs font-mono">
          <Target className="w-4 h-4 text-brand-maroon animate-pulse" />
          <span>Active Target: 10 Bookings / Month</span>
        </div>
      </div>

      {/* Grid of clickable KPI cards */}
      <div id="dashboard-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          return (
            <button
              id={`dashboard-card-${card.id}`}
              key={card.id}
              onClick={() => handleCardClickInner(card)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 group ${card.color}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 group-hover:text-current transition-colors">
                  {card.title}
                </span>
                <div className="p-1.5 rounded-lg bg-white/40 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold tracking-tight">{card.count}</span>
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-current mt-2 opacity-80 leading-normal truncate">
                {card.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Grid of secondary statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Employee performance list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-base text-brand-navy">Consultant Accomplishments</h3>
              <p className="text-xs text-slate-400">Tracking assigned lead volume & conversion outcomes</p>
            </div>
            <button 
              onClick={() => setCurrentTab("users")}
              className="text-xs font-semibold text-brand-maroon hover:text-brand-navy hover:underline"
            >
              Manage Team
            </button>
          </div>
          <div className="mt-4 space-y-3.5">
            {Object.entries(employeePerformances).map(([name, data]) => {
              // Calculate width percentage relative to largest total
              const maxTotal = Math.max(...Object.values(employeePerformances).map(e => e.total));
              const pct = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
              return (
                <div key={name} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center font-display font-bold text-xs uppercase">
                        {name.charAt(0)}
                      </span>
                      <span className="font-medium text-slate-700">{name}</span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-slate-500">Assigns: <strong className="text-slate-800">{data.total}</strong></span>
                      <span className="text-emerald-600">Bookings: <strong className="text-emerald-700">{data.bookings}</strong></span>
                      <span className="text-brand-gold">Visits: <strong className="text-amber-700">{data.siteVisits}</strong></span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#75423F] h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${pct * 0.7}%` }}
                    />
                    <div 
                      className="bg-brand-gold h-full transition-all duration-500"
                      style={{ width: `${(data.siteVisits / (data.total || 1)) * pct * 0.2}%` }}
                    />
                    <div 
                      className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${(data.bookings / (data.total || 1)) * pct * 0.1}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project metrics breakdowns */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-brand-navy pb-4 border-b border-slate-100">Project-wise Interest</h3>
            <div className="mt-5 space-y-4">
              {Object.entries(projectCounts).map(([project, count]) => {
                const totalProj = Object.values(projectCounts).reduce((a, b) => a + b, 0);
                const percentage = totalProj > 0 ? ((count / totalProj) * 100).toFixed(0) : "0";
                
                // Set color schemes based on core projects
                let badgeColor = "bg-brand-maroon text-white";
                let barColor = "bg-brand-maroon";
                if (project === "Montage Villas") {
                  badgeColor = "bg-brand-navy text-white";
                  barColor = "bg-brand-navy";
                } else if (project === "Indivaraa") {
                  badgeColor = "bg-brand-gold text-brand-navy";
                  barColor = "bg-brand-gold";
                }

                return (
                  <div key={project} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">{project}</span>
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {count} Leads ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${barColor}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400 font-mono">Portfolio Interest Ratio</span>
          </div>
        </div>

      </div>
    </div>
  );
}
