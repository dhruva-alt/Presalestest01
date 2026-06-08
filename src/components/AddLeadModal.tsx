/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { Lead, LeadStatus, LeadPriority, Role } from "../types";
import { PROJECTS, EMPLOYEES, LEAD_SOURCES } from "../initialData";

interface AddLeadModalProps {
  onClose: () => void;
  onSave: (lead: Omit<Lead, "id" | "timeline" | "siteVisits"> & { initialRemarkText: string }) => void;
  existingLeads: Lead[];
}

export default function AddLeadModal({ onClose, onSave, existingLeads }: AddLeadModalProps) {
  const todayStr = "2026-06-03";

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [budget, setBudget] = useState("1.1 Crore - 1.4 Crore");
  const [requirement, setRequirement] = useState("3 BHK Apartment");
  const [preferredUnitSize, setPreferredUnitSize] = useState("");
  const [interestedProject, setInterestedProject] = useState(PROJECTS[0]);
  const [leadSource, setLeadSource] = useState(LEAD_SOURCES[0]);
  const [assignedEmployee, setAssignedEmployee] = useState(EMPLOYEES[1]); // Default to first actual employee (Chanakya)
  const [initialRemark, setInitialRemark] = useState("");
  const [nextActivity, setNextActivity] = useState("First Introduction Call");
  const [nextFollowUpDate, setNextFollowUpDate] = useState(todayStr);
  const [nextFollowUpTime, setNextFollowUpTime] = useState("10:00");
  const [priority, setPriority] = useState<LeadPriority>(LeadPriority.Warm);

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check duplicate telephone entries instantly!
  useEffect(() => {
    if (phone.length === 10) {
      const match = existingLeads.find(l => l.phone.trim() === phone.trim());
      if (match) {
        setDuplicateWarning(
          `Alert: A lead under name "${match.customerName}" is already logged with mobile "${phone}" assigned to ${match.assignedEmployee || "No one yet"}! Saving this will create a potential duplicate.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [phone, existingLeads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is a required field";
    }
    
    // Validate phone logic (Must be exactly 10 digits as stated in section 9)
    const rawPhone = phone.replace(/\s+/g, "");
    if (!rawPhone) {
      newErrors.phone = "Mobile phone number is a required field";
    } else if (!/^\d{10}$/.test(rawPhone)) {
      newErrors.phone = "Primary mobile number MUST contain exactly 10 digits";
    }

    if (!initialRemark.trim()) {
      newErrors.initialRemark = "Please write a brief initial remark statement for the timeline";
    }

    if (!nextFollowUpDate) {
      newErrors.nextFollowUpDate = "Next follow-up date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      customerName,
      phone: rawPhone,
      alternateNumber,
      email,
      location,
      occupation,
      budget,
      requirement,
      preferredUnitSize: preferredUnitSize || "Not Specified",
      interestedProject,
      leadSource,
      assignedEmployee,
      currentStatus: LeadStatus.FreshLeads,
      createdDate: todayStr,
      priority,
      nextActivity,
      nextActivityDate: nextFollowUpDate,
      nextActivityTime: nextFollowUpTime || "11:00",
      lastRemark: initialRemark,
      lastSpokenDate: todayStr,
      initialRemarkText: initialRemark
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="add-lead-modal" 
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-150 relative animate-scale-in"
      >
        {/* Header */}
        <div className="bg-brand-navy p-4 text-white flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold" />
            <h2 className="text-lg font-display font-bold tracking-tight">Create Fresh Lead Entry</h2>
          </div>
          <button 
            id="close-lead-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Duplicate Warnings Alert */}
          {duplicateWarning && (
            <div id="duplicate-warning-banner" className="bg-amber-50 text-amber-900 text-xs p-3 rounded-lg border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="form-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors(prev => ({ ...prev, customerName: "" }));
                }}
                placeholder="e.g. Test Naidu"
                className={`w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border ${
                  errors.customerName ? "border-red-500 bg-red-50/5" : "border-slate-200 focus:border-brand-maroon focus:bg-white"
                } focus:outline-none`}
              />
              {errors.customerName && <p className="text-[11px] text-red-500 font-mono mt-0.5">{errors.customerName}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">
                Primary Phone (10 digits) <span className="text-red-500">*</span>
              </label>
              <input
                id="form-customer-phone"
                type="text"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                }}
                placeholder="10-digit mobile number"
                className={`w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border ${
                  errors.phone ? "border-red-500 bg-red-50/5" : "border-slate-200 focus:border-brand-maroon focus:bg-white"
                } focus:outline-none font-mono`}
              />
              {errors.phone && <p className="text-[11px] text-red-500 font-mono mt-0.5">{errors.phone}</p>}
            </div>

            {/* Alternate Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Alternate Phone</label>
              <input
                id="form-customer-alt"
                type="text"
                value={alternateNumber}
                onChange={(e) => setAlternateNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Alternative contact (optional)"
                className="w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white font-mono"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Email Address</label>
              <input
                id="form-customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@domain.com"
                className="w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white"
              />
            </div>

            {/* Location Area */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Location / Locality</label>
              <input
                id="form-customer-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gachibowli, Hyderabad"
                className="w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Occupation</label>
              <input
                id="form-customer-job"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. IT Executive"
                className="w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white"
              />
            </div>

            {/* Budget options */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Capital Budget Outlay</label>
              <select
                id="form-customer-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon"
              >
                <option value="50 Lakhs - 75 Lakhs">50 Lakhs - 75 Lakhs</option>
                <option value="75 Lakhs - 1.1 Crore">75 Lakhs - 1.1 Crore</option>
                <option value="1.1 Crore - 1.5 Crore">1.1 Crore - 1.5 Crore</option>
                <option value="1.5 Crore - 2.0 Crore">1.5 Crore - 2.0 Crore</option>
                <option value="2.0 Crore - 3.0 Crore">2.0 Crore - 3.0 Crore</option>
                <option value="3.0 Crore+">3.0 Crore+</option>
              </select>
            </div>

            {/* Requirement specifications */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Unit Requirements</label>
              <select
                id="form-customer-req"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon"
              >
                <option value="2 BHK Smart Apartment">2 BHK Smart Apartment</option>
                <option value="2.5 BHK Executive Flat">2.5 BHK Executive Flat</option>
                <option value="3 BHK Premium Apartment">3 BHK Premium Apartment</option>
                <option value="3 BHK Duplex House">3 BHK Duplex House</option>
                <option value="3 BHK Premium Villa">3 BHK Premium Villa</option>
                <option value="4 BHK Luxury Villa">4 BHK Luxury Villa</option>
              </select>
            </div>

            {/* Preferred unit size */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Preferred Floor Space (Sqft)</label>
              <input
                id="form-customer-unit-size"
                type="text"
                value={preferredUnitSize}
                onChange={(e) => setPreferredUnitSize(e.target.value)}
                placeholder="e.g. 1850"
                className="w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white"
              />
            </div>

            {/* Project selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Interested Project</label>
              <select
                id="form-customer-project"
                value={interestedProject}
                onChange={(e) => setInterestedProject(e.target.value)}
                className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon"
              >
                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Lead campaign source */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Campaign Sourced Via</label>
              <select
                id="form-customer-source"
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon"
              >
                {LEAD_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
              </select>
            </div>

            {/* Assigned Consultant */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Responsible CRM Consultant</label>
              <select
                id="form-customer-expert"
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon"
              >
                {EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>

            {/* Temperature priorities */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Temperature Priority</label>
              <select
                id="form-customer-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full py-2 px-3 rounded-lg text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon"
              >
                <option value={LeadPriority.Hot}>🔥 Hot (Closing Soon)</option>
                <option value={LeadPriority.Warm}>⚡ Warm (Nurturing Stage)</option>
                <option value={LeadPriority.Cold}>❄️ Cold (Long Term / Inactive)</option>
              </select>
            </div>

          </div>

          {/* Separation Header */}
          <div className="border-t border-slate-150 pt-3 mt-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Activity Setup</h4>
          </div>

          {/* Initial Follow up specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Initial Next Action</label>
              <input
                id="form-activity-title"
                type="text"
                value={nextActivity}
                onChange={(e) => setNextActivity(e.target.value)}
                className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Next Follow-up Date <span className="text-red-500">*</span></label>
              <input
                id="form-activity-date"
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => {
                  setNextFollowUpDate(e.target.value);
                  if (errors.nextFollowUpDate) setErrors(prev => ({ ...prev, nextFollowUpDate: "" }));
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs bg-slate-50 border ${
                  errors.nextFollowUpDate ? "border-red-500 bg-red-50/5" : "border-slate-200 focus:border-brand-maroon focus:bg-white"
                } focus:outline-none font-mono`}
              />
              {errors.nextFollowUpDate && <p className="text-[11px] text-red-500 font-mono mt-0.5">{errors.nextFollowUpDate}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-750">Next Follow-up Time</label>
              <input
                id="form-activity-time"
                type="time"
                value={nextFollowUpTime}
                onChange={(e) => setNextFollowUpTime(e.target.value)}
                className="w-full py-1.5 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-maroon focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Initial timeline remark description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-750">
              Initial Timeline Details / Conversation Remark <span className="text-red-500">*</span>
            </label>
            <textarea
              id="form-customer-remark"
              value={initialRemark}
              onChange={(e) => {
                setInitialRemark(e.target.value);
                if (errors.initialRemark) setErrors(prev => ({ ...prev, initialRemark: "" }));
              }}
              rows={3}
              placeholder="Record initial source summary details, preferences discussed, or physical meeting coordinates..."
              className={`w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border ${
                errors.initialRemark ? "border-red-500 bg-red-50/5" : "border-slate-200 focus:border-brand-maroon focus:bg-white"
              } focus:outline-none`}
            />
            {errors.initialRemark && <p className="text-[11px] text-red-500 font-mono mt-0.5">{errors.initialRemark}</p>}
          </div>

          {/* Footer Save actions */}
          <div className="p-4 bg-slate-50 -mx-6 -mb-6 border-t border-slate-150 flex gap-3 justify-end">
            <button
              id="form-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-650 font-semibold transition-all cursor-pointer"
            >
              Discard Entry
            </button>
            <button
              id="form-save-btn"
              type="submit"
              className="px-5 py-2 text-xs bg-brand-maroon hover:bg-brand-maroon/90 text-white rounded-lg font-semibold shadow-sm cursor-pointer"
            >
              Verify & Register Lead
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
