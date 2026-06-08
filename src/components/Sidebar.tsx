/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  MapPin, 
  CheckCircle, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Megaphone, 
  UserCheck, 
  Briefcase, 
  UserCog, 
  Settings as SettingsIcon,
  CircleDot
} from "lucide-react";
import { Role } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: Role;
  navCounts: {
    leads: number;
    todayFollowups: number;
    siteVisits: number;
    bookings: number;
  };
}

export default function Sidebar({ currentTab, setCurrentTab, userRole, navCounts }: SidebarProps) {
  // Navigation items with role access definitions
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.MarketingTeam]
    },
    { 
      id: "leads", 
      label: "Leads Screen", 
      icon: Users,
      badge: navCounts.leads,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.SalesExecutive, Role.CRMTeam]
    },
    { 
      id: "today_followups", 
      label: "Today Follow-ups", 
      icon: PhoneCall,
      badge: navCounts.todayFollowups,
      badgeColor: "bg-orange-500",
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.SalesExecutive, Role.CRMTeam]
    },
    { 
      id: "site_visits", 
      label: "Site Visits", 
      icon: MapPin,
      badge: navCounts.siteVisits,
      badgeColor: "bg-brand-gold",
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.SalesExecutive]
    },
    { 
      id: "bookings", 
      label: "Bookings & Sales", 
      icon: CheckCircle,
      badge: navCounts.bookings,
      badgeColor: "bg-emerald-600",
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.SalesExecutive, Role.PostSalesTeam, Role.FinanceTeam]
    },
    { 
      id: "calendar", 
      label: "Follow-up Calendar", 
      icon: CalendarIcon,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.SalesExecutive, Role.CRMTeam]
    },
    { 
      id: "reports", 
      label: "Reports", 
      icon: BarChart3,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.MarketingTeam, Role.FinanceTeam]
    },
    { 
      id: "marketing", 
      label: "Marketing Sources", 
      icon: Megaphone,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.MarketingTeam]
    },
    { 
      id: "customers", 
      label: "Active Customers", 
      icon: UserCheck,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.PostSalesTeam, Role.FinanceTeam]
    },
    { 
      id: "post_sales", 
      label: "Post Sales", 
      icon: Briefcase,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.PostSalesTeam]
    },
    { 
      id: "users", 
      label: "CRM Team Setup", 
      icon: UserCog,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead]
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: SettingsIcon,
      allowedRoles: [Role.SuperAdmin, Role.Management, Role.SalesHead, Role.SalesExecutive, Role.CRMTeam, Role.MarketingTeam, Role.PostSalesTeam, Role.FinanceTeam]
    }
  ];

  // Filter items based on user's active role
  const visibleItems = menuItems.filter(item => item.allowedRoles.includes(userRole));

  return (
    <aside id="crm-sidebar" className="w-68 bg-[#0F1C3F] text-slate-100 flex flex-col h-screen border-r border-[#1e2d57] selection:bg-brand-maroon/50 shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-[#1e2d57] bg-[#0E1733]">
        <div className="p-2.5 bg-brand-maroon rounded-lg flex items-center justify-center shadow-lg shadow-black/10">
          <CircleDot className="w-6 h-6 text-brand-gold animate-spin-slow" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-wider text-white leading-tight">TERAMOR</h1>
          <p className="text-[10px] text-brand-gold-muted font-mono uppercase tracking-widest font-semibold">Developers CRM</p>
        </div>
      </div>

      {/* Role Indicator Widget */}
      <div className="mx-4 my-4 p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col">
        <div className="text-[10px] uppercase text-slate-400 font-mono tracking-wider font-medium">Logged in via:</div>
        <div className="text-sm font-semibold text-brand-gold truncate mt-0.5">{userRole}</div>
        <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
          <span>Access Level Verified</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-link-${item.id}`}
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-205 group text-sm font-medium ${
                isActive 
                  ? "bg-brand-maroon text-white shadow-md shadow-brand-maroon/20 font-semibold" 
                  : "text-slate-300 hover:bg-[#1a2b5e] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-colors duration-200 ${
                  isActive ? "text-brand-gold" : "text-slate-400 group-hover:text-brand-gold"
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium text-white ${
                  item.badgeColor || "bg-brand-maroon"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-[#1e2d57] bg-[#0A132C] text-center text-[10px] text-slate-400 font-mono">
        <p>&copy; 2026 Teramor Developers</p>
        <p className="text-[9px] text-[#A5786B] mt-0.5">V3.1.2 - Premium Build</p>
      </div>
    </aside>
  );
}
