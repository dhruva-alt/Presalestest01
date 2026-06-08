/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import { Lead, LeadStatus, LeadPriority } from "../types";

interface AddRemarkModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSave: (remarkData: {
    activityType: string;
    remark: string;
    nextActivityDate: string;
    nextActivityTime: string;
    nextActivity: string;
    leadStatus: LeadStatus;
    leadPriority: LeadPriority;
  }) => void;
}

export default function AddRemarkModal({ lead, onClose, onSave }: AddRemarkModalProps) {
  if (!lead) return null;

  const todayStr = "2026-06-03";

  // Form Fields
  const [activityType, setActivityType] = useState("Phone Call");
  const [remark, setRemark] = useState("");
  const [nextActivityDate, setNextActivityDate] = useState("");
  const [nextActivityTime, setNextActivityTime] = useState("");
  const [nextActivity, setNextActivity] = useState("");
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(lead.currentStatus);
  const [leadPriority, setLeadPriority] = useState<LeadPriority>(lead.priority);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync Activity Type shifts to appropriate stages if matching
  useEffect(() => {
    // When activity changes, suggest a matching status stage
    if (activityType === "Site Visit Planned") {
      setLeadStatus(LeadStatus.SiteVisitPlanned);
      setNextActivity("On-site showing coordinator");
    } else if (activityType === "Site Visit Done") {
      setLeadStatus(LeadStatus.SiteVisitDone);
      setNextActivity("Site visit feedback capture");
    } else if (activityType === "Revisit Planned") {
      setLeadStatus(LeadStatus.RevisitFollowUp);
      setNextActivity("Revisit showing hosting");
    } else if (activityType === "Revisit Done") {
      setLeadStatus(LeadStatus.RevisitDone);
      setNextActivity("Post-revisit offer sharing");
    } else if (activityType === "Booking Discussion") {
      setLeadStatus(LeadStatus.BookingDiscussion);
      setNextActivity("Block deposit token negotiation");
    } else if (activityType === "Booking Done") {
      setLeadStatus(LeadStatus.BookingDone);
      setNextActivity("Post sales agreement processing");
    } else if (activityType === "Cancellation") {
      setLeadStatus(LeadStatus.Cancellation);
      setNextActivity("Archived / Closed");
    } else if (activityType === "Not Interested") {
      setLeadStatus(LeadStatus.NotInterested);
      setNextActivity("Archived");
    } else if (activityType === "Invalid Number") {
      setLeadStatus(LeadStatus.InvalidNumber);
      setNextActivity("Archived / Dead number");
    } else if (activityType === "Phone Call") {
      setLeadStatus(LeadStatus.PhoneCall);
      setNextActivity("Follow up discussion review");
    } else if (activityType === "WhatsApp Follow-up") {
      setNextActivity("WhatsApp text trigger callback");
    }
  }, [activityType]);

  const isClosedStatusSelected = (status: LeadStatus) => {
    return [
      LeadStatus.BookingDone,
      LeadStatus.Cancellation,
      LeadStatus.NotInterested,
      LeadStatus.InvalidNumber,
      LeadStatus.DuplicateLead
    ].includes(status);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!remark.trim()) {
      newErrors.remark = "Please write a remark describing the outcome of this conversation";
    }

    // Force Next Follow-Up Date UNLESS status is closed/booked/cancelled/duplicate/invalid
    const isClosed = isClosedStatusSelected(leadStatus);
    if (!isClosed) {
      if (!nextActivityDate.trim()) {
        newErrors.nextActivityDate = "Business Requirement: Next follow-up date must be chosen for active pipeline leads";
      }
      if (!nextActivity.trim()) {
        newErrors.nextActivity = "Next action task detail is required (e.g. Schedule call, shared pricing sheet)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      activityType,
      remark: remark.trim(),
      nextActivityDate: isClosed ? "" : nextActivityDate,
      nextActivityTime: isClosed ? "" : (nextActivityTime || "11:00"),
      nextActivity: isClosed ? "Archived" : nextActivity,
      leadStatus,
      leadPriority
    });
  };

  const activityOptions = [
    "Phone Call",
    "WhatsApp Follow-up",
    "Site Visit Planned",
    "Site Visit Done",
    "Revisit Planned",
    "Revisit Done",
    "Booking Discussion",
    "Booking Done",
    "Not Interested",
    "Cancellation",
    "Invalid Number"
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div 
        id="add-remark-modal" 
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-150 animate-scale-in"
      >
        <div className="bg-brand-navy p-4 text-white flex justify-between items-center border-b border-white/5">
          <div>
            <h2 className="text-sm uppercase font-mono tracking-wider text-brand-gold-muted leading-tight">Conversation Remark Logs</h2>
            <h3 className="text-base font-display font-medium text-white-100">{lead.customerName}</h3>
          </div>
          <button 
            id="close-remark-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          {/* Conversation Activity Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-450">Current Call Outcome / Activity Type</label>
              <select
                id="remark-activity-type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none"
              >
                {activityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450">Set Lead Status To</label>
              <select
                id="remark-lead-status"
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none"
              >
                {Object.values(LeadStatus).map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450">Set Temperature</label>
              <select
                id="remark-lead-priority"
                value={leadPriority}
                onChange={(e) => setLeadPriority(e.target.value as LeadPriority)}
                className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none"
              >
                <option value={LeadPriority.Hot}>🔥 Hot</option>
                <option value={LeadPriority.Warm}>⚡ Warm</option>
                <option value={LeadPriority.Cold}>❄️ Cold</option>
              </select>
            </div>
          </div>

          {/* Remark Text description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-450">Outcome Summary / Remark Description</label>
            <textarea
              id="remark-text"
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (errors.remark) setErrors(prev => ({ ...prev, remark: "" }));
              }}
              rows={3}
              placeholder="e.g. Discussed budget matching options. Promised to coordinate on pricing for West facing model units on 3BHK blocks."
              className={`w-full py-1.5 px-3 rounded-lg bg-slate-50 border ${
                errors.remark ? "border-red-500" : "border-slate-200 focus:border-brand-maroon focus:bg-white"
              } focus:outline-none text-xs`}
            />
            {errors.remark && <p className="text-[11px] text-red-500 font-mono mt-0.5">{errors.remark}</p>}
          </div>

          {/* Scheduler Section (Disabled for finalized sales) */}
          {isClosedStatusSelected(leadStatus) ? (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-150 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Lead state marked closed/finalised. Next follow-up is automatically archived as complete.</span>
            </div>
          ) : (
            <div className="border-t border-slate-150 pt-3.5 mt-2 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-maroon" />
                <span>Next Follow-up Action Details</span>
              </h4>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450">Next Action Requirement</label>
                  <input
                    id="remark-next-action-text"
                    type="text"
                    value={nextActivity}
                    onChange={(e) => {
                      setNextActivity(e.target.value);
                      if (errors.nextActivity) setErrors(prev => ({ ...prev, nextActivity: "" }));
                    }}
                    placeholder="e.g. Schedule onsite visit walkthrough or share quotation file"
                    className={`w-full py-2 px-3 rounded-lg bg-slate-50 border ${
                      errors.nextActivity ? "border-red-500" : "border-slate-200 focus:border-brand-maroon focus:bg-white"
                    } focus:outline-none text-xs`}
                  />
                  {errors.nextActivity && <p className="text-[11px] text-red-500 font-mono mt-0.5">{errors.nextActivity}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-450">Follow-up Date</label>
                    <input
                      id="remark-next-action-date"
                      type="date"
                      value={nextActivityDate}
                      onChange={(e) => {
                        setNextActivityDate(e.target.value);
                        if (errors.nextActivityDate) setErrors(prev => ({ ...prev, nextActivityDate: "" }));
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs bg-slate-50 border ${
                        errors.nextActivityDate ? "border-red-500" : "border-slate-200 focus:border-brand-maroon focus:bg-white"
                      } focus:outline-none font-mono`}
                    />
                    {errors.nextActivityDate && <p className="text-[11px] text-red-500 font-mono mt-0.5">{errors.nextActivityDate}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-450">Preferred Time</label>
                    <input
                      id="remark-next-action-time"
                      type="time"
                      value={nextActivityTime}
                      onChange={(e) => setNextActivityTime(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-150 flex gap-2.5 justify-end">
            <button
              id="remark-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-650 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="remark-save-btn"
              type="submit"
              className="px-4 py-2 text-xs bg-brand-maroon hover:bg-brand-maroon/90 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
            >
              Commit Remark Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
