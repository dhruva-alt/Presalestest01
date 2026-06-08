/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  SuperAdmin = "Super Admin",
  Management = "Management",
  SalesHead = "Sales Head",
  SalesExecutive = "Sales Executive",
  CRMTeam = "CRM Team",
  MarketingTeam = "Marketing Team",
  PostSalesTeam = "Post Sales Team",
  FinanceTeam = "Finance Team"
}

export enum LeadStatus {
  FreshLeads = "Fresh Leads",
  PhoneCall = "Phone Call",
  SiteVisitFollowUp = "Site Visit Follow-up",
  SiteVisitPlanned = "Site Visit Planned",
  SiteVisitDone = "Site Visit Done",
  RevisitFollowUp = "Revisit Follow-up",
  RevisitDone = "Revisit Done",
  BookingDiscussion = "Booking Discussion",
  BookingDone = "Booking Done",
  DuplicateLead = "Duplicate Lead",
  Rechurn = "Rechurn",
  Cancellation = "Cancellation",
  NotInterested = "Not Interested",
  InvalidNumber = "Invalid Number"
}

export enum ActivityTab {
  Overall = "Overall",
  Today = "Today",
  Tomorrow = "Tomorrow",
  Pending = "Pending",
  Future = "Future",
  Completed = "Completed"
}

export enum LeadPriority {
  Hot = "Hot Lead",
  Warm = "Warm Lead",
  Cold = "Cold Lead"
}

export interface TimelineItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  employee: string;
  activityType: string;
  remark: string;
  nextAction?: string;
}

export interface SiteVisitDetails {
  status: "Planned" | "Done" | "Missed";
  visitDate: string;
  visitTime: string;
  salesExecutive: string;
  project: string;
  feedback?: string;
  budgetMatch?: "Yes" | "No" | "Maybe";
  preferredUnit?: string;
  customerInterest?: "High" | "Medium" | "Low";
  finalOutcome?: string;
}

export interface BookingDetails {
  bookingStatus: "Booking Discussion" | "Token Received" | "Booking Confirmed" | "Agreement Pending" | "Agreement Done" | "Payment Follow-up" | "Post Sales";
  unitPreference: string;
  bookingDate: string;
  bookingAmount: number;
  salesExecutive: string;
  agreementStatus: string;
  paymentStatus: string;
  postSalesHandoverStatus: string;
}

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  alternateNumber: string;
  email: string;
  location: string;
  occupation: string;
  budget: string; // e.g., "75 Lakhs - 1 Crore"
  requirement: string; // e.g., "3 BHK Villa", "2 BHK Apartment"
  preferredUnitSize: string; // e.g., "1800 sqft", "2400 sqft"
  interestedProject: string; // Sthira, Montage Villas, Indivaraa
  leadSource: string; // Facebook, Instagram, Google Ads, etc.
  assignedEmployee: string; // Chanakya Reddy, Vamshi Krishna, etc.
  currentStatus: LeadStatus;
  createdDate: string; // YYYY-MM-DD
  priority: LeadPriority;
  
  // Follow up elements
  nextActivity: string;
  nextActivityDate: string; // YYYY-MM-DD (empty if completed or closed)
  nextActivityTime: string; // HH:MM
  lastRemark: string;
  lastSpokenDate: string; // YYYY-MM-DD

  // Track site visits and bookings
  siteVisits: SiteVisitDetails[];
  bookings?: BookingDetails;

  // History timeline
  timeline: TimelineItem[];
  
  // Marketing & ROI data
  costPerLead?: number;
}
