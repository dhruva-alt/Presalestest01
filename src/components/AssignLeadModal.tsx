/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, UserCog, UserCheck } from "lucide-react";
import { EMPLOYEES } from "../initialData";

interface AssignLeadModalProps {
  leadIds: string[];
  customerNames: string[];
  onClose: () => void;
  onAssign: (employeeName: string) => void;
}

export default function AssignLeadModal({ leadIds, customerNames, onClose, onAssign }: AssignLeadModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState(EMPLOYEES[1]); // Default to Chanakya Reddy

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(selectedEmployee);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div 
        id="assign-lead-modal" 
        className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-150 overflow-hidden animate-scale-in animate-duration-150"
      >
        {/* Header */}
        <div className="bg-brand-navy p-4 text-white flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-brand-gold" />
            <h2 className="text-base font-display font-semibold text-white tracking-tight">Assign / Transfer Leads</h2>
          </div>
          <button 
            id="close-assign-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Target Leads Info Box */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-brand-navy shrink-0">Selected Leads to Assign ({leadIds.length}):</h3>
            <div className="max-h-24 overflow-y-auto mt-2 text-slate-600 space-y-1 pr-1 font-mono">
              {customerNames.map((name, idx) => (
                <div key={idx} className="flex justify-between hover:bg-slate-100/50 p-1 rounded">
                  <span>{name}</span>
                  <span className="text-[10px] text-slate-400">ID: {leadIds[idx]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Employee assignment dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-750 block">Select Target Real Estate Agent</label>
            <select
              id="assignment-employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full py-2 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none"
            >
              {EMPLOYEES.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Informational Guideline text */}
          <p className="text-[10px] text-slate-450 leading-relaxed italic">
            Assigning leads transfers active timeline responsibilities and follow-up alerts immediately to the selected consultant inbox.
          </p>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-150 flex gap-2.5 justify-end">
            <button
              id="assign-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-650 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="assign-submit-btn"
              type="submit"
              className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon/90 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-brand-gold" />
              <span>Confirm Leadership Assignment</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
