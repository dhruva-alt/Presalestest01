/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { UserCog, ShieldAlert, Users, Calendar, CheckSquare, Layers, Lock, ShieldCheck } from "lucide-react";
import { Lead, Role, LeadPriority, LeadStatus } from "../types";
import { EMPLOYEES } from "../initialData";

interface UserManagementViewProps {
  leads: Lead[];
  currentRole: Role;
  onChangeRole: (role: Role) => void;
}

export default function UserManagementView({ leads, currentRole, onChangeRole }: UserManagementViewProps) {
  
  // Tabulate workload allocation statistics per employee
  const employeeRegistry = useMemo(() => {
    return EMPLOYEES.map(empName => {
      const assignedLeads = leads.filter(l => l.assignedEmployee === empName);
      const totalCount = assignedLeads.length;
      
      const hotCount = assignedLeads.filter(l => l.priority === LeadPriority.Hot).length;
      const bookingsCount = assignedLeads.filter(l => l.currentStatus === LeadStatus.BookingDone).length;
      const siteVisitsCount = assignedLeads.filter(l => [LeadStatus.SiteVisitDone, LeadStatus.RevisitDone].includes(l.currentStatus)).length;

      // Calculate efficiency index index
      const efficiency = totalCount > 0 ? (((bookingsCount + siteVisitsCount) / totalCount) * 100).toFixed(0) : "0";

      return {
        name: empName,
        total: totalCount,
        hot: hotCount,
        bookings: bookingsCount,
        siteVisits: siteVisitsCount,
        efficiency
      };
    });
  }, [leads]);

  return (
    <div id="crm-user-management" className="space-y-6">
      
      {/* Simulation Box */}
      <div className="bg-[#FAF9F6] p-5 rounded-xl border-2 border-dashed border-brand-maroon/20 space-y-4">
        <div className="flex gap-2 items-center">
          <ShieldAlert className="w-5 h-5 text-brand-maroon shrink-0" />
          <h3 className="font-display font-medium text-brand-navy text-sm">Role-Based Access Control Simulation</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Teramor Developers CRM uses role gates for data safety. You can select any role below to instantly simulate the custom dashboard views, restricted tabs, and row-level assign permissions of that department.
        </p>

        {/* Roles grids */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.values(Role).map((role) => {
            const isActive = currentRole === role;
            return (
              <button
                id={`role-switch-btn-${role.replace(/\s+/g, '-').toLowerCase()}`}
                key={role}
                onClick={() => onChangeRole(role)}
                className={`py-2 px-3 text-xs rounded-lg border font-semibold text-center cursor-pointer select-none transition-all ${
                  isActive
                    ? "bg-brand-maroon text-white border-brand-maroon shadow-md scale-102"
                    : "bg-white hover:bg-slate-50 text-slate-705 border-slate-200"
                }`}
              >
                <span>{role}</span>
                {isActive && <ShieldCheck className="w-3.5 h-3.5 text-brand-gold inline-block ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid containing employee workload parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workload breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-150 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-display font-bold text-brand-navy pb-3 border-b border-slate-100 flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-brand-maroon" />
            <span>Consultant Caseload Allocation Overview</span>
          </h3>

          <div className="space-y-3.5">
            {employeeRegistry.map((item) => (
              <div key={item.name} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0F1C3F] text-white flex items-center justify-center font-bold text-[10px]">
                      {item.name.charAt(0)}
                    </span>
                    <span className="font-semibold text-slate-800 font-sans">{item.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>Active leads: <strong className="text-slate-800 font-bold">{item.total}</strong></span>
                    <span className="text-red-650">Hot: <strong className="font-bold">{item.hot}</strong></span>
                    <span className="text-brand-gold-muted">Visits: <strong className="font-bold">{item.siteVisits}</strong></span>
                    <span className="text-emerald-700">Bookings: <strong className="font-bold">{item.bookings}</strong></span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-maroon h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.efficiency}%` }}
                    title={`Efficiency index index: ${item.efficiency}%`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono self-end">Conversion Rate: {item.efficiency}% score</span>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Guidelines brief */}
        <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-display font-medium text-brand-navy pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Lock className="w-4.5 h-4.5 text-slate-500" />
              <span>Permission Protocols</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-650 leading-relaxed">
              <div className="border-l-2 border-brand-maroon pl-2">
                <strong className="text-brand-navy block font-sans">Super Admin / Management</strong>
                Full structural capabilities. Unlocked reporting suites, leads dispatch, and bulk re-routing.
              </div>
              <div className="border-l-2 border-brand-maroon pl-2">
                <strong className="text-brand-navy block font-sans">Sales Head</strong>
                Operational owner. Allocates unassigned leads and transfers caseload between executive inboxes.
              </div>
              <div className="border-l-2 border-brand-maroon pl-2">
                <strong className="text-brand-navy block font-sans">Sales Executive</strong>
                Row-level restriction. View and update assigned portfolios only. Can add remarks and reschedule follow-ups.
              </div>
              <div className="border-l-2 border-brand-maroon pl-2">
                <strong className="text-brand-navy block font-sans">CRM / Post Sales / Finance Team</strong>
                Siloed access. Restricted to specific pipeline columns (follow-ups, token audits, handover ledgers).
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center text-[10px] font-mono text-slate-400">
            Access Protocols Verified
          </div>
        </div>

      </div>

    </div>
  );
}
