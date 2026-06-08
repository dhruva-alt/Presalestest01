/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Megaphone, TrendingUp, DollarSign, Target, Award, Globe, HelpCircle } from "lucide-react";
import { Lead, LeadStatus } from "../types";
import { LEAD_SOURCES, SOURCE_STATS } from "../initialData";

interface MarketingSourcesViewProps {
  leads: Lead[];
}

export default function MarketingSourcesView({ leads }: MarketingSourcesViewProps) {
  
  // Calculate source metrics dynamically based on the current live lead list!
  const sourcesPerformance = useMemo(() => {
    return LEAD_SOURCES.map(sourceName => {
      // Find leads with this source
      const sourceLeads = leads.filter(l => l.leadSource === sourceName);
      const totalLeads = sourceLeads.length;

      // Find site showing events
      const siteVisits = sourceLeads.filter(l => 
        l.currentStatus === LeadStatus.SiteVisitDone || 
        l.currentStatus === LeadStatus.RevisitDone ||
        (l.siteVisits && l.siteVisits.some(sv => sv.status === "Done"))
      ).length;

      // Find booking finalizations
      const bookingsCompleted = sourceLeads.filter(l => l.currentStatus === LeadStatus.BookingDone).length;

      // Marketing Campaign cost calculations as defined in SOURCE_STATS
      const defaultStat = SOURCE_STATS[sourceName as keyof typeof SOURCE_STATS] || { spend: 0, leads: 1 };
      const spend = defaultStat.spend;

      // Conversion rate
      const conversionRate = totalLeads > 0 ? ((bookingsCompleted / totalLeads) * 100).toFixed(1) : "0.0";

      // ROI metrics per channel
      const costPerLead = totalLeads > 0 ? (spend / totalLeads).toFixed(0) : "0";
      const costPerVisit = siteVisits > 0 ? (spend / siteVisits).toFixed(0) : "0";
      const costPerBooking = bookingsCompleted > 0 ? (spend / bookingsCompleted).toFixed(0) : "0";

      return {
        sourceName,
        totalLeads,
        siteVisits,
        bookingsCompleted,
        spend,
        conversionRate,
        costPerLead,
        costPerVisit,
        costPerBooking
      };
    });
  }, [leads]);

  // Find most optimal channel based on conversion percentage or bookings
  const topChannel = useMemo(() => {
    let optimal = { name: "No Sourced Channels", bookings: 0 };
    sourcesPerformance.forEach(s => {
      if (s.bookingsCompleted > optimal.bookings) {
        optimal = { name: s.sourceName, bookings: s.bookingsCompleted };
      }
    });
    return optimal;
  }, [sourcesPerformance]);

  return (
    <div id="marketing-performance-console" className="space-y-6">
      
      {/* Greetings area */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex justify-between items-center flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-brand-maroon" />
            <span>Campaign Source Tracking Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Cross-analyzing source efficiency, booking acquisition spend, and conversion ratios.</p>
        </div>
        <div className="flex gap-2 text-xs bg-brand-navy/5 px-3 py-1.5 rounded-lg border border-brand-navy/10 text-brand-navy font-mono">
          <Award className="w-4 h-4 text-brand-gold shrink-0 self-center" />
          <span>Champion Channel: <strong>{topChannel.name}</strong> ({topChannel.bookings} Bookings)</span>
        </div>
      </div>

      {/* Grid of aggregated channel stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-pink-50 text-brand-maroon">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Digital Campaign Share</span>
            <span className="text-lg font-bold text-brand-navy">
              {leads.filter(l => ["Facebook", "Instagram", "Google Ads"].includes(l.leadSource)).length} Leads
            </span>
            <p className="text-[10px] text-slate-450 font-mono">FB, Insta & Google Search integrations</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-yellow-50 text-brand-gold-muted">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Referral/Organic Share</span>
            <span className="text-lg font-bold text-brand-navy">
              {leads.filter(l => ["Reference", "Walk-in"].includes(l.leadSource)).length} Leads
            </span>
            <p className="text-[10px] text-slate-450 font-mono">No spend corporate network assets</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Gross Invested capital</span>
            <span className="text-lg font-bold text-emerald-800">₹3,45,000</span>
            <p className="text-[10px] text-slate-450 font-mono">Aggregated monthly campaign outlays</p>
          </div>
        </div>
      </div>

      {/* Main Campaign details grid */}
      <div className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 font-display font-semibold text-brand-navy bg-slate-50">
          Source-wise Acquisition and Conversion Audit Sheet
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100 text-slate-500 font-mono uppercase text-[9px] tracking-wider border-b border-slate-205">
                <th className="py-2.5 px-4">Campaign Channel Name</th>
                <th className="py-2.5 px-4 text-center">Total Sourced</th>
                <th className="py-2.5 px-4 text-center">Site Showings</th>
                <th className="py-2.5 px-4 text-center">Deposited Bookings</th>
                <th className="py-2.5 px-3">Est Spend</th>
                <th className="py-2.5 px-3">Cost per Lead (CPL)</th>
                <th className="py-2.5 px-3">Cost per Visit (CPV)</th>
                <th className="py-2.5 px-3">Cost per Book (CPB)</th>
                <th className="py-2.5 px-4 text-right">Conversion Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-155">
              {sourcesPerformance.map((source) => (
                <tr key={source.sourceName} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{source.sourceName}</td>
                  <td className="py-3 px-4 text-center text-slate-600 font-mono">{source.totalLeads}</td>
                  <td className="py-3 px-4 text-center text-slate-600 font-mono">{source.siteVisits}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                    {source.bookingsCompleted}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-550">
                    {source.spend > 0 ? `₹${source.spend.toLocaleString("en-IN")}` : "₹0 (Organic)"}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {source.spend > 0 ? `₹${source.costPerLead}` : "₹0"}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {source.spend > 0 && source.siteVisits > 0 ? `₹${source.costPerVisit}` : "₹0"}
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-650 font-bold">
                    {source.spend > 0 && source.bookingsCompleted > 0 ? `₹${source.costPerBooking}` : "₹0"}
                  </td>
                  <td className="py-3 px-4 text-right align-middle">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <span className="font-bold text-[#0F1C3F] font-mono leading-none">{source.conversionRate}%</span>
                      {/* CSS mini bar */}
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden inline-block shrink-0 border border-slate-200">
                        <div 
                          className="bg-brand-maroon h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, parseFloat(source.conversionRate) * 4)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
