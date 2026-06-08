/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { UserCheck, Briefcase, Settings, ShieldCheck, DollarSign, FileCheck, CheckCircle2, Building, Mail, Phone, Lock } from "lucide-react";
import { Lead, LeadStatus, Role } from "../types";

interface SecondaryViewsProps {
  leads: Lead[];
  currentRole: Role;
  onViewLead: (lead: Lead) => void;
}

/* ==========================================================
   CUSTOMERS VIEW - Booked / Active customers and payments
   ========================================================== */
export function CustomersView({ leads, onViewLead }: SecondaryViewsProps) {
  // Extract clients who have booked units (BookingDone status)
  const bookedCustomers = leads.filter(l => l.currentStatus === LeadStatus.BookingDone);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-brand-maroon" />
          <span>Active Booked Customers Ledger</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Inspecting active booking contracts, registered allocations, and contract dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookedCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No finalized booked customers logged in the pipeline yet.
          </div>
        ) : (
          bookedCustomers.map((customer) => {
            const booking = customer.bookings;
            return (
              <div 
                key={customer.id} 
                className="bg-white rounded-xl border border-slate-205 shadow-2xs p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-display font-bold text-xs uppercase">
                        {customer.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-[13px]">{customer.customerName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">ID: {customer.id}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
                      Booked
                    </span>
                  </div>

                  <div className="text-xs space-y-2 border-t border-b border-slate-100 py-3 font-mono text-slate-605">
                    <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-800">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customer.interestedProject} — {customer.requirement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secured Unit:</span>
                      <strong className="text-slate-750 font-sans">{booking?.unitPreference || "Villa #42"}</strong>
                    </div>
                    {booking && (
                      <>
                        <div className="flex justify-between">
                          <span>Deposit Token:</span>
                          <strong className="text-slate-850">₹{booking.bookingAmount.toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Agreements:</span>
                          <strong className="text-brand-maroon font-sans text-[11px]">{booking.agreementStatus}</strong>
                        </div>
                        <div className="flex justify-between text-emerald-750">
                          <span>Payment Stage:</span>
                          <strong className="font-sans text-[11px]">{booking.paymentStatus}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex gap-2.5">
                  <button
                    onClick={() => onViewLead(customer)}
                    className="w-full py-1.8 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-center transition-all cursor-pointer"
                  >
                    View Account Detail Ledger
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   POST SALES VIEW - Section 13 agreement handovers
   ========================================================== */
export function PostSalesView({ leads, onViewLead }: SecondaryViewsProps) {
  const bookedLeads = leads.filter(l => l.currentStatus === LeadStatus.BookingDone);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-maroon" />
          <span>Post Sales Handover & Agreement Tracker</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Reviewing legal documentation, agreement handovers, and compliance workflows.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 font-display font-semibold text-brand-navy bg-slate-50">
          Agreement Progress Queue
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 font-mono uppercase text-[9px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Client Name</th>
                <th className="py-2.5 px-4">Allocated Project</th>
                <th className="py-2.5 px-4">Agreement Status</th>
                <th className="py-2.5 px-4">Payment Follow-up Stage</th>
                <th className="py-2.5 px-4">Handover Compliance Status</th>
                <th className="py-2.5 px-4 text-center">Reference Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {bookedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No active handovers logged under the current filters.
                  </td>
                </tr>
              ) : (
                bookedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#0F1C3F]">{lead.customerName}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{lead.interestedProject}</span>
                      <span className="text-slate-400 block text-[10px] font-mono">{lead.requirement}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded border border-amber-200 font-sans font-semibold">
                        {lead.bookings?.agreementStatus || "Agreement Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans font-semibold">
                      {lead.bookings?.paymentStatus || "Token Sourced"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded border border-emerald-250 font-sans font-semibold">
                        {lead.bookings?.postSalesHandoverStatus || "In Verification"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onViewLead(lead)}
                        className="p-1 px-2 hover:bg-slate-100 rounded border border-slate-200 text-slate-600 font-semibold cursor-pointer text-[11px]"
                      >
                        Launch
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   SETTINGS VIEW - Basic system settings controls
   ========================================================== */
export function SettingsView({ currentRole }: { currentRole: Role }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-maroon" />
          <span>CRM Configuration panel</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Configure company profiles, local notifications, and security protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold font-display text-brand-navy pb-2 border-b border-slate-100">Company Details</h3>
          <div className="space-y-3 text-xs leading-relaxed">
            <div>
              <span className="text-slate-400 font-mono block">Enterprise Name:</span>
              <span className="font-semibold text-slate-850">Teramor Developer Holdings Pvt Ltd</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block">Active Offices:</span>
              <span className="font-semibold text-slate-850">Jubilee Road, Hyderabad, Telangana</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono block">Corporate License ID:</span>
              <span className="font-semibold font-mono text-brand-gold-muted text-[11px]">HYD-TS-RE-340112</span>
            </div>
          </div>
        </div>

        {/* Security Parameters config */}
        <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold font-display text-brand-navy pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-maroon" />
              <span>Permission Settings</span>
            </h3>
            <p className="text-xs text-slate-600 leading-normal">
              Active permission policies restrict lead allocations automatically based on the Department Role selected in the CRM topbar.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-mono bg-emerald-50 p-2 rounded">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your role verified: <strong>{currentRole}</strong></span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-4 text-center block">Security build ver 3.1.2 online</span>
        </div>
      </div>
    </div>
  );
}
