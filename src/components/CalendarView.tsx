/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle,
  ExternalLink,
  Plus
} from "lucide-react";
import { Lead, LeadStatus } from "../types";

interface CalendarViewProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
}

type CalendarEvent = {
  id: string;
  lead: Lead;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: "Follow-up" | "Site Visit" | "Revisit" | "Booking Meeting" | "Agreement" | "Payment Follow-up";
};

export default function CalendarView({ leads, onViewLead }: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<"Month" | "Week" | "Day">("Month");
  
  // Pivot date: June 3, 2026 (Wednesday)
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // Offset in days from June 3
  const pivotDate = new Date(2026, 5, 3); // June 3, 2026

  // Build list of calendar events dynamically from leads
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    leads.forEach(l => {
      if (!l.nextActivityDate) return;

      let eventType: CalendarEvent["type"] = "Follow-up";
      const activityLower = l.nextActivity.toLowerCase();
      const status = l.currentStatus;

      if (activityLower.includes("visit") || status === LeadStatus.SiteVisitPlanned) {
        eventType = "Site Visit";
      } else if (activityLower.includes("revisit") || status === LeadStatus.RevisitFollowUp || status === LeadStatus.RevisitDone) {
        eventType = "Revisit";
      } else if (activityLower.includes("booking") || activityLower.includes("token") || status === LeadStatus.BookingDiscussion) {
        eventType = "Booking Meeting";
      } else if (activityLower.includes("agreement") || activityLower.includes("sign")) {
        eventType = "Agreement";
      } else if (activityLower.includes("payment") || activityLower.includes("installment")) {
        eventType = "Payment Follow-up";
      } else if (activityLower.includes("call") || activityLower.includes("phone") || activityLower.includes("whatsapp")) {
        eventType = "Follow-up";
      }

      events.push({
        id: `EV-${l.id}`,
        lead: l,
        title: `${l.customerName} - ${l.nextActivity}`,
        date: l.nextActivityDate,
        time: l.nextActivityTime || "11:00",
        type: eventType
      });
    });
    return events;
  }, [leads]);

  // Color mapping logic for activity classifications requested in Section 16
  const getEventBgStyle = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "Site Visit":
        return "bg-amber-100 text-amber-900 border-l-3 border-brand-gold";
      case "Revisit":
        return "bg-purple-100 text-purple-950 border-l-3 border-purple-500";
      case "Booking Meeting":
        return "bg-emerald-100 text-emerald-950 border-l-3 border-emerald-600";
      case "Agreement":
        return "bg-rose-100 text-rose-950 border-l-3 border-brand-maroon";
      case "Payment Follow-up":
        return "bg-sky-100 text-sky-950 border-l-3 border-sky-600";
      case "Follow-up":
      default:
        return "bg-indigo-50 text-[#0F1C3F] border-l-3 border-[#0F1C3F]";
    }
  };

  const getEventBadgeStyle = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "Site Visit":
        return "bg-brand-gold text-slate-900";
      case "Revisit":
        return "bg-purple-600 text-white";
      case "Booking Meeting":
        return "bg-emerald-600 text-white";
      case "Agreement":
        return "bg-brand-maroon text-white";
      case "Payment Follow-up":
        return "bg-sky-650 text-white";
      case "Follow-up":
      default:
        return "bg-[#0F1C3F] text-white";
    }
  };

  // June 2026 Calendar Grid Math:
  // June 1st, 2026 is a Monday.
  // June has 30 Days.
  // 35 or 42 grid cells.
  const June2026Days = useMemo(() => {
    const days: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = [];
    
    // Add empty / trailing cells for previous month (May has 31 days. May 31 is Sunday. So Monday is June 1st, no padding needed!)
    // Wait, Monday is June 1st, so perfectly aligned!
    for (let i = 1; i <= 30; i++) {
      const padded = i.toString().padStart(2, "0");
      days.push({
        dayNumber: i,
        dateString: `2026-06-${padded}`,
        isCurrentMonth: true
      });
    }

    // Add padding days for July 2026 at the end to make complete 35 cell grids
    for (let i = 1; i <= 5; i++) {
      const padded = i.toString().padStart(2, "0");
      days.push({
        dayNumber: i,
        dateString: `2026-07-${padded}`,
        isCurrentMonth: false
      });
    }

    return days;
  }, []);

  // For Week View, get active week date strings based on selected offset
  const WeekDaysStrings = useMemo(() => {
    const today = new Date(pivotDate);
    today.setDate(today.getDate() + selectedDayOffset);
    
    // Find Monday of active week
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday ...
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));

    const daysList: { label: string; dateStr: string; dateObj: Date }[] = [];
    const weekdaysLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(monday);
      tempDate.setDate(monday.getDate() + i);
      const yyyy = tempDate.getFullYear();
      const mm = (tempDate.getMonth() + 1).toString().padStart(2, "0");
      const dd = tempDate.getDate().toString().padStart(2, "0");
      daysList.push({
        label: weekdaysLabels[i],
        dateStr: `${yyyy}-${mm}-${paddedVal(dd)}`,
        dateObj: tempDate
      });
    }
    return daysList;
  }, [selectedDayOffset]);

  const paddedVal = (val: string | number) => {
    return val.toString().padStart(2, "0");
  };

  // Get active day date string for Day view
  const ActiveDayDetails = useMemo(() => {
    const activeDate = new Date(pivotDate);
    activeDate.setDate(activeDate.getDate() + selectedDayOffset);
    const yyyy = activeDate.getFullYear();
    const mm = (activeDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = activeDate.getDate().toString().padStart(2, "0");
    
    return {
      dateStr: `${yyyy}-${mm}-${paddedVal(dd)}`,
      formattedDate: activeDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    };
  }, [selectedDayOffset]);

  // Handle previous/next scroll interactions
  const handlePrev = () => {
    if (currentView === "Month") {
      // Static month view focusing June 2026
    } else if (currentView === "Week") {
      setSelectedDayOffset(prev => prev - 7);
    } else {
      setSelectedDayOffset(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentView === "Month") {
      // Static month view focusing June 2026
    } else if (currentView === "Week") {
      setSelectedDayOffset(prev => prev + 7);
    } else {
      setSelectedDayOffset(prev => prev + 1);
    }
  };

  const resetToPivot = () => {
    setSelectedDayOffset(0);
  };

  return (
    <div id="calendar-scheduler" className="space-y-5">
      
      {/* Calendar Header Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-navy text-brand-gold rounded-lg shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-brand-navy">Follow-up Schedule Center</h2>
            <p className="text-xs text-slate-500 font-mono">
              {currentView === "Month" && "June 2026 Operations Tracker"}
              {currentView === "Week" && `Week of ${WeekDaysStrings[0].dateStr} to ${WeekDaysStrings[6].dateStr}`}
              {currentView === "Day" && ActiveDayDetails.formattedDate}
            </p>
          </div>
        </div>

        {/* View Selection Controls */}
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          {(["Month", "Week", "Day"] as const).map(view => (
            <button
              id={`calendar-view-btn-${view.toLowerCase()}`}
              key={view}
              onClick={() => {
                setCurrentView(view);
                resetToPivot();
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer select-none transition-all ${
                currentView === view 
                  ? "bg-brand-maroon text-white shadow-xs" 
                  : "text-slate-650 hover:bg-slate-200/50"
              }`}
            >
              {view} View
            </button>
          ))}
        </div>

        {/* Chronological Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={resetToPivot}
            className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer"
          >
            Today (Jun 3)
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white">
            <button 
              onClick={handlePrev}
              disabled={currentView === "Month"}
              className="p-1.5 hover:bg-slate-50 border-r border-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext}
              disabled={currentView === "Month"}
              className="p-1.5 hover:bg-slate-50 text-slate-600 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend key row */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-wrap gap-4 text-xs font-mono font-medium shadow-xs">
        <span className="text-slate-400 font-bold shrink-0 uppercase tracking-wider text-[10px] self-center">Activity Classifications:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0F1C3F]" /> Phone Follow-up</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-gold" /> Site Visit</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Revisit</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Booking Meetings</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-maroon" /> Agreement Signed</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Payment Recieved</span>
      </div>

      {/* Main Grid View */}
      <div className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs">
        
        {/* MONTH VIEW */}
        {currentView === "Month" && (
          <div>
            {/* Weekdays indicator row */}
            <div className="grid grid-cols-7 border-b border-slate-150 bg-slate-50 text-center py-2.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              <div>Monday</div>
              <div>Tuesday</div>
              <div>Wednesday</div>
              <div>Thursday</div>
              <div>Friday</div>
              <div>Saturday</div>
              <div>Sunday</div>
            </div>
            
            {/* 30-day Month body rendering */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-150 min-h-[500px]">
              {June2026Days.map((day, index) => {
                const dayEvents = calendarEvents.filter(e => e.date === day.dateString);
                const isSelectedToday = day.dateString === "2026-06-03";
                
                return (
                  <div 
                    key={index} 
                    className={`p-2 min-h-[100px] flex flex-col justify-between hover:bg-slate-50/40 transition-colors ${
                      day.isCurrentMonth ? "bg-white" : "bg-slate-50/60 opacity-40"
                    } ${isSelectedToday ? "bg-brand-maroon/5 border-2 border-brand-maroon" : ""}`}
                  >
                    {/* Date label */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-semibold font-mono w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelectedToday 
                          ? "bg-brand-maroon text-white font-bold" 
                          : "text-slate-600"
                      }`}>
                        {day.dayNumber}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                          {dayEvents.length} Item{dayEvents.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Events body list */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-24 pr-0.5">
                      {dayEvents.map(ev => (
                        <div
                          key={ev.id}
                          onClick={() => onViewLead(ev.lead)}
                          className={`p-1 rounded text-[10px] sm:text-[11px] leading-tight border transition-all cursor-pointer hover:shadow-xs font-medium ${getEventBgStyle(ev.type)}`}
                          title={`Customer: ${ev.lead.customerName}\nAction: ${ev.lead.nextActivity}\nTime: ${ev.time}`}
                        >
                          <div className="flex justify-between font-bold">
                            <span className="truncate">{ev.lead.customerName}</span>
                            <span className="text-[9px] font-mono shrink-0 ml-1 opacity-70">{ev.time}</span>
                          </div>
                          <div className="truncate text-[10px] opacity-80">{ev.lead.nextActivity}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {currentView === "Week" && (
          <div className="divide-y divide-slate-150">
            {WeekDaysStrings.map((day, idx) => {
              const dayEvents = calendarEvents.filter(e => e.date === day.dateStr);
              const isSelectedToday = day.dateStr === "2026-06-03";
              return (
                <div 
                  key={idx} 
                  className={`p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch transition-colors ${
                    isSelectedToday ? "bg-brand-maroon/5 border-l-4 border-brand-maroon" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="w-28 shrink-0 flex flex-row md:flex-col justify-between items-baseline md:items-start">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">{day.label}</span>
                    <span className={`text-xl font-display font-bold mt-1 inline-block ${
                      isSelectedToday ? "text-brand-maroon" : "text-brand-navy"
                    }`}>
                      {day.dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 leading-normal block">{day.dateStr}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    {dayEvents.length === 0 ? (
                      <span className="text-xs text-slate-430 italic block self-center pt-2">No operations scheduled</span>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {dayEvents.map(ev => (
                          <div
                            key={ev.id}
                            onClick={() => onViewLead(ev.lead)}
                            className={`p-3 rounded-lg border flex justify-between items-start cursor-pointer hover:shadow-md transition-all ${getEventBgStyle(ev.type)}`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold text-white ${getEventBadgeStyle(ev.type)}`}>
                                  {ev.type}
                                </span>
                                <span className="font-semibold text-[13px]">{ev.lead.customerName}</span>
                              </div>
                              <p className="text-xs font-medium text-slate-600 truncate max-w-xs">{ev.lead.nextActivity}</p>
                              
                              <div className="flex gap-3 text-[10px] text-slate-500 font-mono">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {ev.time}</span>
                                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> {ev.lead.assignedEmployee}</span>
                              </div>
                            </div>
                            <div className="p-1 rounded bg-white hover:bg-slate-50 text-slate-500 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DAY VIEW */}
        {currentView === "Day" && (
          <div className="p-5 space-y-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm text-brand-navy">Hourly Schedule</h3>
                <p className="text-xs text-slate-450 mt-0.5 font-mono">Operations schedule sorted chronologically</p>
              </div>
              <span className="text-xs font-mono font-bold text-brand-maroon">{ActiveDayDetails.dateStr}</span>
            </div>

            <div className="space-y-3">
              {calendarEvents.filter(e => e.date === ActiveDayDetails.dateStr).length === 0 ? (
                <div className="py-12 text-center text-slate-450 text-sm">
                  <CalendarIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  No events found on this date. Use the Navigation controls above to modify dates.
                </div>
              ) : (
                calendarEvents
                  .filter(e => e.date === ActiveDayDetails.dateStr)
                  .sort((a,b) => a.time.localeCompare(b.time))
                  .map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => onViewLead(ev.lead)}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between cursor-pointer hover:shadow-md transition-all ${getEventBgStyle(ev.type)}`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="px-3 py-1.5 rounded-lg bg-white shrink-0 text-center border font-mono">
                          <span className="block text-xs text-slate-400 leading-none uppercase font-bold">Today</span>
                          <span className="block text-sm font-bold text-slate-900 mt-1 leading-none">{ev.time}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold text-white ${getEventBadgeStyle(ev.type)}`}>
                              {ev.type}
                            </span>
                            <span className="font-bold text-[14px] text-slate-800">{ev.lead.customerName}</span>
                          </div>
                          <p className="text-xs text-slate-705 mt-1">{ev.lead.nextActivity}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end justify-between text-xs font-mono text-slate-500 gap-2 shrink-0">
                        <div className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> assigned to: <strong className="text-slate-805 font-bold font-sans">{ev.lead.assignedEmployee}</strong></div>
                        <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone: <strong className="text-slate-805 font-mono">{ev.lead.phone}</strong></div>
                      </div>
                    </div>
                  ))
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
