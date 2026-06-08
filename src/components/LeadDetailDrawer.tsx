/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Tag, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Award,
  Building,
  CheckCircle2,
  FileCheck
} from "lucide-react";
import { Lead, LeadStatus, TimelineItem } from "../types";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onAddRemark: () => void;
  onDeleteLead?: (id: string) => void;
}

export default function LeadDetailDrawer({ lead, onClose, onAddRemark, onDeleteLead }: LeadDetailDrawerProps) {

  if (!lead) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity duration-350 overflow-hidden"
      onClick={handleBackdropClick}
    >
      <div 
        id="lead-detail-drawer" 
        className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl relative animate-slide-in overflow-hidden selection:bg-brand-maroon/20"
      >
        {/* Drawer Header */}
        <div className="bg-brand-navy p-5 text-white flex justify-between items-center border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-brand-maroon text-white flex items-center justify-center font-display font-bold text-lg shadow-md shrink-0">
              {lead.customerName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-display font-bold tracking-tight">{lead.customerName}</h2>
              <p className="text-xs text-brand-gold-muted font-mono">Lead ID Reference: {lead.id}</p>
            </div>
          </div>
          <button 
            id="close-drawer-btn"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-305 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-100" />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-brand-grey/50">
          
          {/* Quick Stats Panel */}
          <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Phase</span>
              <span className="block text-sm font-semibold text-brand-navy bg-slate-100 px-2 py-1 rounded text-center truncate">
                {lead.currentStatus}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Temperature</span>
              <span className={`block text-sm font-semibold text-center px-2 py-1 rounded capitalize ${
                lead.priority === "Hot Lead" ? "bg-red-50 text-red-700 font-bold" : "bg-amber-50 text-amber-700"
              }`}>
                {lead.priority}
              </span>
            </div>
          </div>

          {/* Last Update Summary */}
          <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 border-b border-slate-100 pb-1.5 tracking-wider">
              Last Update Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Last Spoken On:</span>
                <span className="font-semibold text-slate-800">{lead.lastSpokenDate || lead.createdDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Next follow-up date:</span>
                <span className="font-semibold text-brand-maroon">{lead.nextActivityDate || "Not Scheduled"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Next Action Required:</span>
                <span className="font-semibold text-[#0F1C3F]">{lead.nextActivity || "None/Closed"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Campaign Source:</span>
                <span className="font-semibold text-slate-700">{lead.leadSource}</span>
              </div>
            </div>
            {lead.lastRemark && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2.5 text-xs">
                <span className="text-slate-400 block font-mono text-[10px] mb-1">Last Remark Logged:</span>
                <p className="text-slate-700 italic">"{lead.lastRemark}"</p>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 border-b border-slate-100 pb-2 tracking-wider">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div className="flex gap-2 items-start">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Alternate Contact Number</span>
                  <span className="text-slate-700 font-medium">{lead.alternateNumber || "None Provided"}</span>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Personal Email Address</span>
                  <span className="text-slate-700 font-medium max-w-[200px] truncate block">{lead.email || "No Email Sourced"}</span>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Customer Location</span>
                  <span className="text-slate-700 font-medium">{lead.location || "Hyderabad Area"}</span>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Occupation / Profession</span>
                  <span className="text-slate-700 font-medium">{lead.occupation || "Service / Business"}</span>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <DollarSign className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Capital Budget Outlay</span>
                  <span className="text-brand-maroon font-bold text-[13px]">{lead.budget || "Unspecified"}</span>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Project & Unit Size Requirements</span>
                  <span className="text-brand-navy font-semibold text-[13px]">{lead.interestedProject}</span>
                  <span className="text-[11px] text-slate-500 block">{lead.requirement} ({lead.preferredUnitSize || "Any Sqft"})</span>
                </div>
              </div>

              <div className="flex gap-2 items-start sm:col-span-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <Award className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono text-slate-440 block">Relationship Consultant Profile</span>
                  <span className="text-slate-700 font-semibold">{lead.assignedEmployee || "System Queue - Pending Assignment"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Site Visit Info Section (If Sited) */}
          {lead.siteVisits && lead.siteVisits.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs space-y-3.5">
              <h3 className="text-xs font-mono font-bold uppercase text-brand-gold border-b border-slate-100 pb-1.5 tracking-wider flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Site Showing Verification Logs</span>
              </h3>
              {lead.siteVisits.map((visit, i) => (
                <div key={i} className="text-xs bg-brand-grey/40 p-3 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-700">Showroom Visit Activity #{i+1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono ${
                      visit.status === "Done" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>{visit.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                    <div>Date: <strong className="text-slate-800">{visit.visitDate}</strong></div>
                    <div>Time: <strong className="text-slate-800">{visit.visitTime}</strong></div>
                    <div>Host Expert: <strong className="text-slate-800">{visit.salesExecutive}</strong></div>
                    <div>Target Unit: <strong className="text-slate-800">{visit.preferredUnit || "Unspec."}</strong></div>
                  </div>
                  {visit.feedback && (
                    <p className="text-[11px] text-slate-600 border-t border-slate-150 pt-1.5 mt-1.5 italic">
                      "Feedback: {visit.feedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Booking Info Section (If Confirmed) */}
          {lead.bookings && (
            <div className="bg-[#f0fdf4] rounded-xl border border-emerald-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-800 border-b border-emerald-100 pb-1.5 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Unit Booking Ledger Confirmed</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-emerald-600/80 block font-mono">Ledger State</span>
                  <span className="font-semibold text-emerald-900 bg-emerald-100/50 px-1.5 py-0.5 rounded inline-block mt-0.5">{lead.bookings.bookingStatus}</span>
                </div>
                <div>
                  <span className="text-emerald-600/80 block font-mono">Secured Token Deposit</span>
                  <span className="font-bold text-emerald-900 text-[13px]">₹{lead.bookings.bookingAmount.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-emerald-600/80 block font-mono">Date Deposited</span>
                  <span className="font-semibold text-emerald-800 font-mono">{lead.bookings.bookingDate}</span>
                </div>
                <div>
                  <span className="text-emerald-600/80 block font-mono">Payment Follow-up Stage</span>
                  <span className="font-semibold text-emerald-800 text-[11px]">{lead.bookings.paymentStatus || "Token Sourced"}</span>
                </div>
                <div className="md:col-span-2 bg-[#e6fcf0]/60 p-2.5 rounded border border-[#bef3d6] flex gap-2 items-center text-emerald-800">
                  <FileCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <div>
                    <span className="text-[9px] uppercase font-mono block">Agreement Status Handover</span>
                    <p className="text-[11px] font-semibold">{lead.bookings.agreementStatus} — {lead.bookings.postSalesHandoverStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 border-b border-slate-100 pb-2 tracking-wider">
              Customer Touchpoint Timeline
            </h3>
            
            <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-5">
              {lead.timeline.map((item) => (
                <div id={`timeline-item-${item.id}`} key={item.id} className="relative group">
                  {/* Timeline Indicator Node */}
                  <div className="absolute -left-[20.5px] top-1 w-3 h-3 rounded-full bg-brand-maroon border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />
                  
                  <div className="text-xs">
                    <div className="flex justify-between items-center mb-1 text-slate-500 font-mono">
                      <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
                        <span>{item.activityType}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500 font-sans font-medium text-[10px] bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.employee}
                        </span>
                      </div>
                      <span className="text-[10px]">{item.date} {item.time}</span>
                    </div>
                    
                    <p className="text-slate-750 italic leading-relaxed mt-1">"{item.remark}"</p>
                    {item.nextAction && (
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Action: <strong className="text-slate-500">{item.nextAction}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-150 flex gap-3 justify-between shrink-0">
          <div>
            {onDeleteLead && (
              <button 
                id="drawer-footer-delete-btn"
                onClick={() => {
                  onDeleteLead(lead.id);
                }}
                className="px-3 py-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-semibold border border-red-200 cursor-pointer"
                title="Permanently remove customer file"
              >
                Delete Lead File
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              id="drawer-footer-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-250 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors font-semibold cursor-pointer"
            >
              Collapse Drawer
            </button>
            
            <button 
              id="drawer-footer-remark-btn"
              onClick={() => {
                onAddRemark();
                onClose();
              }}
              className="px-4 py-2 text-xs bg-brand-maroon hover:bg-brand-maroon/90 text-white rounded-lg transition-colors font-semibold shadow-sm cursor-pointer"
            >
              Add Conversation Remark
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
