/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, LeadStatus, LeadPriority } from "./types";

export const PROJECTS = ["Sthira", "Montage Villas", "Indivaraa"];

export const EMPLOYEES = [
  "Master",
  "Chanakya Reddy",
  "K Vijaya Sena Reddy",
  "Harish",
  "Vamshi Krishna",
  "Bhaskar"
];

export const LEAD_SOURCES = [
  "Facebook",
  "Instagram",
  "Google Ads",
  "Website",
  "YouTube",
  "WhatsApp",
  "MCUBE",
  "TATA Tele",
  "Reference",
  "Walk-in",
  "Channel Partner",
  "In-house Digital Marketing",
  "No Source",
  "Other"
];

// Base values to calculate marketing cost
export const SOURCE_STATS = {
  "Facebook": { spend: 45000, leads: 180 },
  "Instagram": { spend: 35000, leads: 110 },
  "Google Ads": { spend: 120000, leads: 220 },
  "Website": { spend: 15000, leads: 95 },
  "YouTube": { spend: 28000, leads: 60 },
  "WhatsApp": { spend: 5000, leads: 150 },
  "MCUBE": { spend: 8000, leads: 40 },
  "TATA Tele": { spend: 12000, leads: 70 },
  "Reference": { spend: 0, leads: 30 },
  "Walk-in": { spend: 0, leads: 25 },
  "Channel Partner": { spend: 75000, leads: 50 },
  "In-house Digital Marketing": { spend: 20000, leads: 120 },
  "No Source": { spend: 0, leads: 15 },
  "Other": { spend: 5000, leads: 25 }
};

export const INITIAL_LEADS: Lead[] = [
  {
    id: "LD-001",
    customerName: "Test Naidu",
    phone: "9876543210",
    alternateNumber: "8765432109",
    email: "test.naidu@gmail.com",
    location: "Gachibowli, Hyderabad",
    occupation: "IT Project Manager",
    budget: "1.5 Crore - 1.8 Crore",
    requirement: "3 BHK Villa",
    preferredUnitSize: "2200 sqft",
    interestedProject: "Montage Villas",
    leadSource: "Facebook",
    assignedEmployee: "Chanakya Reddy",
    currentStatus: LeadStatus.FreshLeads,
    createdDate: "2026-06-03",
    priority: LeadPriority.Hot,
    nextActivity: "Phone Call",
    nextActivityDate: "2026-06-03",
    nextActivityTime: "11:30",
    lastRemark: "Fresh lead created from social media. Interested in corner unit villas.",
    lastSpokenDate: "2026-06-03",
    costPerLead: 250,
    siteVisits: [],
    timeline: [
      {
        id: "TM-001",
        date: "2026-06-03",
        time: "10:20",
        employee: "System",
        activityType: "Lead Created",
        remark: "Lead integrated automatically via FaceBook Lead Form.",
      }
    ]
  },
  {
    id: "LD-002",
    customerName: "Dhruva Reddy",
    phone: "9000012345",
    alternateNumber: "9111122233",
    email: "dhruva.reddy@yahoo.com",
    location: "Jubilee Hills, Hyderabad",
    occupation: "Business Owner",
    budget: "2.0 Crore - 2.5 Crore",
    requirement: "4 BHK Luxury Villa",
    preferredUnitSize: "3200 sqft",
    interestedProject: "Montage Villas",
    leadSource: "Reference",
    assignedEmployee: "K Vijaya Sena Reddy",
    currentStatus: LeadStatus.BookingDone,
    createdDate: "2026-05-15",
    priority: LeadPriority.Hot,
    nextActivity: "Agreement Sign",
    nextActivityDate: "2026-06-05",
    nextActivityTime: "15:00",
    lastRemark: "Booking confirmed! Recieved token amount of 5 Lakhs. Schedule agreement signing.",
    lastSpokenDate: "2026-06-01",
    costPerLead: 0,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-05-18",
        visitTime: "16:00",
        salesExecutive: "K Vijaya Sena Reddy",
        project: "Montage Villas",
        feedback: "LOVED the layout of West-facing model villa. Fitting matches their requirements perfectly.",
        budgetMatch: "Yes",
        preferredUnit: "Villa #42, West Facing",
        customerInterest: "High",
        finalOutcome: "Proceeded to token booking discussion"
      }
    ],
    bookings: {
      bookingStatus: "Booking Confirmed",
      unitPreference: "Villa #42, West Facing",
      bookingDate: "2026-06-01",
      bookingAmount: 500000,
      salesExecutive: "K Vijaya Sena Reddy",
      agreementStatus: "Agreement Pending",
      paymentStatus: "Payment Follow-up",
      postSalesHandoverStatus: "Agreement Done"
    },
    timeline: [
      {
        id: "TM-002",
        date: "2026-05-15",
        time: "14:15",
        employee: "System",
        activityType: "Lead Created",
        remark: "Created by referral. Assigned to Vijaya Sena Reddy.",
      },
      {
        id: "TM-003",
        date: "2026-05-18",
        time: "16:00",
        employee: "K Vijaya Sena Reddy",
        activityType: "Site Visit Planned",
        remark: "Client visiting Montage site details with family.",
      },
      {
        id: "TM-004",
        date: "2026-05-22",
        time: "11:00",
        employee: "K Vijaya Sena Reddy",
        activityType: "Revisit Done",
        remark: "Second visit with father-in-law to finalise specific plot.",
      },
      {
        id: "TM-005",
        date: "2026-06-01",
        time: "12:30",
        employee: "K Vijaya Sena Reddy",
        activityType: "Booking Done",
        remark: "Token amount check of ₹5,00,000 received. Form filled.",
      }
    ]
  },
  {
    id: "LD-003",
    customerName: "Sreedhar Simhadri",
    phone: "9988776655",
    alternateNumber: "",
    email: "sreedhar.simhadri@outlook.com",
    location: "Kondapur, Hyderabad",
    occupation: "Software Director",
    budget: "1.1 Crore - 1.4 Crore",
    requirement: "3 BHK Premium Apartment",
    preferredUnitSize: "1850 sqft",
    interestedProject: "Sthira",
    leadSource: "Google Ads",
    assignedEmployee: "Vamshi Krishna",
    currentStatus: LeadStatus.SiteVisitDone,
    createdDate: "2026-05-28",
    priority: LeadPriority.Hot,
    nextActivity: "Follow-up Call",
    nextActivityDate: "2026-06-03",
    nextActivityTime: "14:00",
    lastRemark: "Completed the site visit. Expressed high interest. Follow-up today for final decision on unit block.",
    lastSpokenDate: "2026-06-02",
    costPerLead: 540,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-06-01",
        visitTime: "11:30",
        salesExecutive: "Vamshi Krishna",
        project: "Sthira",
        feedback: "Very happy with modern amenities & central location. Highlighted budget is matching.",
        budgetMatch: "Yes",
        preferredUnit: "Sthira B-Block 904",
        customerInterest: "High",
        finalOutcome: "Will confirm booking by Wednesday"
      }
    ],
    timeline: [
      {
        id: "TM-006",
        date: "2026-05-28",
        time: "09:05",
        employee: "System",
        activityType: "Lead Created",
        remark: "Captured via Sthira Google Ads landing page.",
      },
      {
        id: "TM-007",
        date: "2026-05-29",
        time: "10:30",
        employee: "Vamshi Krishna",
        activityType: "Phone Call",
        remark: "Called lead. Outlined project Sthira details. Site visit scheduled for June 1st.",
      },
      {
        id: "TM-008",
        date: "2026-06-01",
        time: "11:30",
        employee: "Vamshi Krishna",
        activityType: "Site Visit Done",
        remark: "Showed Sthira sample model unit, clubhouse, construction progress. Customer extremely positive.",
      }
    ]
  },
  {
    id: "LD-004",
    customerName: "Sai Charith",
    phone: "9123456780",
    alternateNumber: "",
    email: "charith.sai@gmail.com",
    location: "Miyapur, Hyderabad",
    occupation: "Senior Consultant",
    budget: "75 Lakhs - 95 Lakhs",
    requirement: "2 BHK Smart Apartment",
    preferredUnitSize: "1350 sqft",
    interestedProject: "Indivaraa",
    leadSource: "Instagram",
    assignedEmployee: "Harish",
    currentStatus: LeadStatus.PhoneCall,
    createdDate: "2026-05-25",
    priority: LeadPriority.Warm,
    nextActivity: "Follow-up",
    nextActivityDate: "2026-05-30", // Missed since today is 2026-06-03!
    nextActivityTime: "10:15",
    lastRemark: "First call done. Requested floor plans via WhatsApp. Sent them but no response yet.",
    lastSpokenDate: "2026-05-26",
    costPerLead: 310,
    siteVisits: [],
    timeline: [
      {
        id: "TM-009",
        date: "2026-05-25",
        time: "16:40",
        employee: "System",
        activityType: "Lead Created",
        remark: "Instagram ad click. Lead captured.",
      },
      {
        id: "TM-010",
        date: "2026-05-26",
        time: "10:15",
        employee: "Harish",
        activityType: "Phone Call",
        remark: "Spoke with lead. He is shifting to Hyd in late June. Emailed Indivaraa brochure.",
      }
    ]
  },
  {
    id: "LD-005",
    customerName: "Subramanyam KV",
    phone: "9440598765",
    alternateNumber: "9440512345",
    email: "subbu.kv@outlook.com",
    location: "Kukatpally, Hyderabad",
    occupation: "Govt Employee",
    budget: "1.8 Crore - 2.2 Crore",
    requirement: "3 BHK Premium Villa",
    preferredUnitSize: "2500 sqft",
    interestedProject: "Montage Villas",
    leadSource: "Website",
    assignedEmployee: "Bhaskar",
    currentStatus: LeadStatus.SiteVisitPlanned,
    createdDate: "2026-06-01",
    priority: LeadPriority.Hot,
    nextActivity: "Site Visit Host",
    nextActivityDate: "2026-06-03", // Planned for Today!
    nextActivityTime: "16:30",
    lastRemark: "Site visit planned for today evening. Client requested model villa walkthrough. Arranged vehicle pickup.",
    lastSpokenDate: "2026-06-02",
    costPerLead: 150,
    siteVisits: [
      {
        status: "Planned",
        visitDate: "2026-06-03",
        visitTime: "16:30",
        salesExecutive: "Bhaskar",
        project: "Montage Villas"
      }
    ],
    timeline: [
      {
        id: "TM-011",
        date: "2026-06-01",
        time: "11:20",
        employee: "System",
        activityType: "Lead Created",
        remark: "Web contact form submission.",
      },
      {
        id: "TM-012",
        date: "2026-06-02",
        time: "14:10",
        employee: "Bhaskar",
        activityType: "Phone Call",
        remark: "Scheduled site visit for Wednesday June 3rd at 4.30pm. Send vehicle details.",
      }
    ]
  },
  {
    id: "LD-006",
    customerName: "Nellutla Srikanth",
    phone: "9848022334",
    alternateNumber: "",
    email: "srikanth.n@gmail.com",
    location: "Madhapur, Hyderabad",
    occupation: "Director, MNC",
    budget: "1.3 Crore - 1.6 Crore",
    requirement: "3 BHK Apartment / Duplex",
    preferredUnitSize: "2100 sqft",
    interestedProject: "Sthira",
    leadSource: "MCUBE",
    assignedEmployee: "Vamshi Krishna",
    currentStatus: LeadStatus.RevisitFollowUp,
    createdDate: "2026-05-20",
    priority: LeadPriority.Warm,
    nextActivity: "Revisit Setup",
    nextActivityDate: "2026-06-04", // Tomorrow!
    nextActivityTime: "11:00",
    lastRemark: "First visit completed. Expressed positive interest. Promised to come back with parents for layout sign off.",
    lastSpokenDate: "2026-05-30",
    costPerLead: 200,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-05-25",
        visitTime: "15:00",
        salesExecutive: "Vamshi Krishna",
        project: "Sthira",
        feedback: "Liked structure and high-quality build. Wanted structural cross-sections.",
        budgetMatch: "Yes",
        preferredUnit: "Sthira Unit A-402",
        customerInterest: "Medium"
      }
    ],
    timeline: [
      {
        id: "TM-013",
        date: "2026-05-20",
        time: "09:30",
        employee: "System",
        activityType: "Lead Created",
        remark: "Inbound call tracked via MCUBE system.",
      },
      {
        id: "TM-014",
        date: "2026-05-25",
        time: "15:00",
        employee: "Vamshi Krishna",
        activityType: "Site Visit Done",
        remark: "Showed Sthira structure, details, quality standards.",
      }
    ]
  },
  {
    id: "LD-007",
    customerName: "Manoj Kumar",
    phone: "9550123456",
    alternateNumber: "",
    email: "manoj.k@gmail.com",
    location: "Nizampet, Hyderabad",
    occupation: "Retailer Owner",
    budget: "70 Lakhs - 85 Lakhs",
    requirement: "2 BHK Budget Flat",
    preferredUnitSize: "1200 sqft",
    interestedProject: "Indivaraa",
    leadSource: "TATA Tele",
    assignedEmployee: "Bhaskar",
    currentStatus: LeadStatus.Cancellation,
    createdDate: "2026-05-10",
    priority: LeadPriority.Cold,
    nextActivity: "Archived",
    nextActivityDate: "", // Closed
    nextActivityTime: "",
    lastRemark: "Had put a token but due to home loan rejection, requested token cancellation and full refund.",
    lastSpokenDate: "2026-05-28",
    costPerLead: 170,
    siteVisits: [],
    timeline: [
      {
        id: "TM-017",
        date: "2026-05-10",
        time: "15:00",
        employee: "System",
        activityType: "Lead Created",
        remark: "TATA Tele integration.",
      },
      {
        id: "TM-018",
        date: "2026-05-12",
        time: "10:00",
        employee: "Bhaskar",
        activityType: "Phone Call",
        remark: "Customer visited office on 15th.",
      },
      {
        id: "TM-019",
        date: "2026-05-28",
        time: "17:00",
        employee: "Bhaskar",
        activityType: "Cancellation",
        remark: "Loan document rejected due to past credit score. Token transaction returned.",
      }
    ]
  },
  {
    id: "LD-008",
    customerName: "Anil Kumar",
    phone: "9866123456",
    alternateNumber: "",
    email: "anil.tech@gmail.com",
    location: "Uppal, Hyderabad",
    occupation: "Lead Analyst",
    budget: "85 Lakhs - 1.1 Crore",
    requirement: "2.5 BHK Flat",
    preferredUnitSize: "1500 sqft",
    interestedProject: "Sthira",
    leadSource: "YouTube",
    assignedEmployee: "Harish",
    currentStatus: LeadStatus.DuplicateLead,
    createdDate: "2026-05-20",
    priority: LeadPriority.Cold,
    nextActivity: "Duplicate check",
    nextActivityDate: "",
    nextActivityTime: "",
    lastRemark: "Duplicate lead entry. Main file tracked under Primary ID LD-042.",
    lastSpokenDate: "2026-05-22",
    costPerLead: 460,
    siteVisits: [],
    timeline: [
      {
        id: "TM-015",
        date: "2026-05-20",
        time: "11:00",
        employee: "Harish",
        activityType: "Lead Created",
        remark: "YouTube Video Ad lead form submission."
      },
      {
        id: "TM-016",
        date: "2026-05-22",
        time: "12:00",
        employee: "Harish",
        activityType: "Duplicate Lead",
        remark: "Flagged. Merged secondary request into primary sheet."
      }
    ]
  },
  {
    id: "LD-009",
    customerName: "Gururaj",
    phone: "9390112233",
    alternateNumber: "",
    email: "gururaj_g@yahoo.com",
    location: "Begumpet, Hyderabad",
    occupation: "Civil Engineer",
    budget: "1.0 Crore - 1.2 Crore",
    requirement: "3 BHK Apartment",
    preferredUnitSize: "1650 sqft",
    interestedProject: "Sthira",
    leadSource: "Website",
    assignedEmployee: "Chanakya Reddy",
    currentStatus: LeadStatus.NotInterested,
    createdDate: "2026-05-25",
    priority: LeadPriority.Cold,
    nextActivity: "Archived",
    nextActivityDate: "",
    nextActivityTime: "",
    lastRemark: "Not interested. Landlord already possesses plots near Sthira project. Opted out.",
    lastSpokenDate: "2026-05-29",
    costPerLead: 150,
    siteVisits: [],
    timeline: [
      {
        id: "TM-020",
        date: "2026-05-25",
        time: "14:00",
        employee: "Chanakya Reddy",
        activityType: "Lead Created",
        remark: "Website callback."
      },
      {
        id: "TM-021",
        date: "2026-05-29",
        time: "16:00",
        employee: "Chanakya Reddy",
        activityType: "Not Interested",
        remark: "Stated he has customized individual home plan. Closed file."
      }
    ]
  },
  {
    id: "LD-010",
    customerName: "Laxman",
    phone: "9494112233",
    alternateNumber: "",
    email: "laxman.prasad@gmail.com",
    location: "Secunderabad",
    occupation: "Business Executive",
    budget: "1.5 Crore - 2.0 Crore",
    requirement: "3 BHK Villa",
    preferredUnitSize: "2400 sqft",
    interestedProject: "Montage Villas",
    leadSource: "In-house Digital Marketing",
    assignedEmployee: "K Vijaya Sena Reddy",
    currentStatus: LeadStatus.PhoneCall,
    createdDate: "2026-06-02",
    priority: LeadPriority.Hot,
    nextActivity: "Follow-up",
    nextActivityDate: "2026-06-03", // Planned for Today!
    nextActivityTime: "10:00", // Scheduled for today, already active!
    lastRemark: "Spoke with client. Very motivated buyer. Schedule call to define budget matching plots.",
    lastSpokenDate: "2026-06-02",
    costPerLead: 160,
    siteVisits: [],
    timeline: [
      {
        id: "TM-022",
        date: "2026-06-02",
        time: "11:20",
        employee: "System",
        activityType: "Lead Created",
        remark: "Sourced from internal direct marketing portal."
      },
      {
        id: "TM-023",
        date: "2026-06-02",
        time: "15:45",
        employee: "K Vijaya Sena Reddy",
        activityType: "Phone Call",
        remark: "First call successful. Scheduled budget detailing."
      }
    ]
  },
  {
    id: "LD-011",
    customerName: "Devi Sudhakar",
    phone: "9346045612",
    alternateNumber: "9346011111",
    email: "sudha.devi@gmail.com",
    location: "Attapur, Hyderabad",
    occupation: "Doctor (MD)",
    budget: "1.1 Crore - 1.4 Crore",
    requirement: "3 BHK Apartment",
    preferredUnitSize: "1900 sqft",
    interestedProject: "Sthira",
    leadSource: "Google Ads",
    assignedEmployee: "Harish",
    currentStatus: LeadStatus.SiteVisitFollowUp,
    createdDate: "2026-05-29",
    priority: LeadPriority.Hot,
    nextActivity: "Follow-up Call",
    nextActivityDate: "2026-06-03", // Planned for Today!
    nextActivityTime: "15:00",
    lastRemark: "Completed Sthira walk through. Liked structure. Promised to confirm bank loan potential and re-dial.",
    lastSpokenDate: "2026-06-01",
    costPerLead: 540,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-05-31",
        visitTime: "10:00",
        salesExecutive: "Harish",
        project: "Sthira",
        feedback: "Impressed by open greens of Sthira. Bank support critical.",
        budgetMatch: "Yes",
        preferredUnit: "Block A - 501",
        customerInterest: "High"
      }
    ],
    timeline: [
      {
        id: "TM-024",
        date: "2026-05-29",
        time: "16:15",
        employee: "System",
        activityType: "Lead Created",
        remark: "Sourced via Google Ads."
      },
      {
        id: "TM-025",
        date: "2026-05-31",
        time: "10:00",
        employee: "Harish",
        activityType: "Site Visit Done",
        remark: "Walkthrough of site with Devi. Family satisfied."
      }
    ]
  },
  {
    id: "LD-012",
    customerName: "Ravi",
    phone: "9123498765",
    alternateNumber: "",
    email: "ravi_cool@outlook.com",
    location: "Unknown",
    occupation: "Unspecified",
    budget: "85 Lakhs - 1.0 Crore",
    requirement: "2 BHK Flat",
    preferredUnitSize: "1300 sqft",
    interestedProject: "Indivaraa",
    leadSource: "Facebook",
    assignedEmployee: "Vamshi Krishna",
    currentStatus: LeadStatus.InvalidNumber,
    createdDate: "2026-05-22",
    priority: LeadPriority.Cold,
    nextActivity: "None",
    nextActivityDate: "",
    nextActivityTime: "",
    lastRemark: "Number is continuously invalid. Tried three times. Closed as invalid entry.",
    lastSpokenDate: "2026-05-24",
    costPerLead: 250,
    siteVisits: [],
    timeline: [
      {
        id: "TM-026",
        date: "2026-05-22",
        time: "18:00",
        employee: "System",
        activityType: "Lead Created",
        remark: "FB instant form API download."
      },
      {
        id: "TM-027",
        date: "2026-05-24",
        time: "11:00",
        employee: "Vamshi Krishna",
        activityType: "Invalid Number",
        remark: "Call failed with message inside network. Unreachable."
      }
    ]
  },
  {
    id: "LD-013",
    customerName: "Venkata Satyanarayana",
    phone: "9888844444",
    alternateNumber: "",
    email: "satya.v@gmail.com",
    location: "Hitech City, Hyderabad",
    occupation: "VP, Tech Firm",
    budget: "2.0 Crore - 2.5 Crore",
    requirement: "4 BHK Luxury Villa",
    preferredUnitSize: "3500 sqft",
    interestedProject: "Montage Villas",
    leadSource: "Google Ads",
    assignedEmployee: "Chanakya Reddy",
    currentStatus: LeadStatus.BookingDiscussion,
    createdDate: "2026-05-18",
    priority: LeadPriority.Hot,
    nextActivity: "Token Discussion",
    nextActivityDate: "2026-06-03", // Planned for today!
    nextActivityTime: "11:00",
    lastRemark: "Pricing sheet customized with modifications. Agreed to block Villa #10. Booking discussion ready.",
    lastSpokenDate: "2026-06-02",
    costPerLead: 540,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-05-23",
        visitTime: "11:00",
        salesExecutive: "Chanakya Reddy",
        project: "Montage Villas",
        feedback: "Premium layout matches his stature.",
        budgetMatch: "Yes",
        preferredUnit: "Villa 10",
        customerInterest: "High"
      }
    ],
    timeline: [
      {
        id: "TM-028",
        date: "2026-05-18",
        time: "10:15",
        employee: "System",
        activityType: "Lead Created",
        remark: "Google search ads premium villa click."
      },
      {
        id: "TM-029",
        date: "2026-05-23",
        time: "11:00",
        employee: "Chanakya Reddy",
        activityType: "Site Visit Done",
        remark: "Montage site inspection complete."
      },
      {
        id: "TM-030",
        date: "2026-06-02",
        time: "16:30",
        employee: "Chanakya Reddy",
        activityType: "Booking Discussion",
        remark: "Finalized unit layout changes. Sent updated pricing."
      }
    ]
  },
  {
    id: "LD-014",
    customerName: "Prashanth Naidu",
    phone: "9875566778",
    alternateNumber: "",
    email: "prashanth.n@gmail.com",
    location: "Kothapet, Hyderabad",
    occupation: "Pharma Executive",
    budget: "75 Lakhs - 95 Lakhs",
    requirement: "2 BHK Elegant Appt",
    preferredUnitSize: "1400 sqft",
    interestedProject: "Indivaraa",
    leadSource: "Instagram",
    assignedEmployee: "Harish",
    currentStatus: LeadStatus.RevisitDone,
    createdDate: "2026-05-12",
    priority: LeadPriority.Warm,
    nextActivity: "Follow-up",
    nextActivityDate: "2026-06-04", // Tomorrow
    nextActivityTime: "14:30",
    lastRemark: "Revisit completed on May 29 with parents. Positive vibe. Need bank tie up check with SBI representative.",
    lastSpokenDate: "2026-05-29",
    costPerLead: 310,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-05-15",
        visitTime: "14:00",
        salesExecutive: "Harish",
        project: "Indivaraa"
      },
      {
        status: "Done",
        visitDate: "2026-05-29",
        visitTime: "11:00",
        salesExecutive: "Harish",
        project: "Indivaraa",
        feedback: "Parents satisfied. Demanding loan assistance.",
        budgetMatch: "Yes",
        preferredUnit: "A-201",
        customerInterest: "High"
      }
    ],
    timeline: [
      {
        id: "TM-031",
        date: "2026-05-12",
        time: "14:00",
        employee: "System",
        activityType: "Lead Created",
        remark: "Instagram visual ad capture."
      },
      {
        id: "TM-032",
        date: "2026-05-15",
        time: "14:00",
        employee: "Harish",
        activityType: "Site Visit Done",
        remark: "Completed first walkthrough."
      },
      {
        id: "TM-033",
        date: "2026-05-29",
        time: "11:00",
        employee: "Harish",
        activityType: "Revisit Done",
        remark: "Satisfied with construction schedule."
      }
    ]
  },
  {
    id: "LD-015",
    customerName: "Kishore Kumar",
    phone: "9122233344",
    alternateNumber: "",
    email: "kishore_k@ymail.com",
    location: "Kompally, Hyderabad",
    occupation: "Senior Advocate",
    budget: "1.1 Crore - 1.4 Crore",
    requirement: "3 BHK Apartment",
    preferredUnitSize: "1800 sqft",
    interestedProject: "Sthira",
    leadSource: "MCUBE",
    assignedEmployee: "Bhaskar",
    currentStatus: LeadStatus.FreshLeads,
    createdDate: "2026-06-03", // Today!
    priority: LeadPriority.Warm,
    nextActivity: "Call Customer",
    nextActivityDate: "2026-06-03",
    nextActivityTime: "12:00",
    lastRemark: "Fresh inbound call. Needs morning site visit tomorrow. Set follow-up to pre-book.",
    lastSpokenDate: "2026-06-03",
    costPerLead: 200,
    siteVisits: [],
    timeline: [
      {
        id: "TM-034",
        date: "2026-06-03",
        time: "08:15",
        employee: "System",
        activityType: "Lead Created",
        remark: "Assigned by system. Source MCUBE."
      }
    ]
  },
  {
    id: "LD-016",
    customerName: "Subha Sri",
    phone: "9177012345",
    alternateNumber: "",
    email: "subhasri.m@gmail.com",
    location: "Banjara Hills, Hyderabad",
    occupation: "Architect",
    budget: "1.8 Crore - 2.2 Crore",
    requirement: "3 BHK Premium Villa",
    preferredUnitSize: "2600 sqft",
    interestedProject: "Montage Villas",
    leadSource: "Website",
    assignedEmployee: "Vamshi Krishna",
    currentStatus: LeadStatus.Rechurn,
    createdDate: "2026-05-01",
    priority: LeadPriority.Hot,
    nextActivity: "Follow-up",
    nextActivityDate: "2026-06-03", // Today!
    nextActivityTime: "15:30",
    lastRemark: "High budget client. Rechurned after 1 month. Follow up for new available west facing units.",
    lastSpokenDate: "2026-06-02",
    costPerLead: 150,
    siteVisits: [],
    timeline: [
      {
        id: "TM-035",
        date: "2026-05-01",
        time: "12:00",
        employee: "System",
        activityType: "Lead Created",
        remark: "Registered on Website."
      },
      {
        id: "TM-036",
        date: "2026-06-02",
        time: "15:00",
        employee: "Vamshi Krishna",
        activityType: "Remark Added",
        remark: "Reactivated historical query. Showed interest in new blocks."
      }
    ]
  },
  {
    id: "LD-017",
    customerName: "K Vijaya Raghavan",
    phone: "9347511223",
    alternateNumber: "",
    email: "vijaya.raghav@gmail.com",
    location: "Nallagandla, Hyderabad",
    occupation: "Pharma Director",
    budget: "2.0 Crore - 2.5 Crore",
    requirement: "4 BHK Villa",
    preferredUnitSize: "3400 sqft",
    interestedProject: "Montage Villas",
    leadSource: "Walk-in",
    assignedEmployee: "K Vijaya Sena Reddy",
    currentStatus: LeadStatus.SiteVisitDone,
    createdDate: "2026-05-25",
    priority: LeadPriority.Hot,
    nextActivity: "Feedback Collection",
    nextActivityDate: "2026-06-02", // Missed follow-up!
    nextActivityTime: "11:00",
    lastRemark: "Direct Walk-in customer. Site visit done with standard checklist. Call needed to handle pricing queries.",
    lastSpokenDate: "2026-05-25",
    costPerLead: 0,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-05-25",
        visitTime: "15:00",
        salesExecutive: "K Vijaya Sena Reddy",
        project: "Montage Villas",
        feedback: "Very positive response, checked materials used.",
        budgetMatch: "Yes",
        preferredUnit: "Villa 14",
        customerInterest: "High"
      }
    ],
    timeline: [
      {
        id: "TM-037",
        date: "2026-05-25",
        time: "14:30",
        employee: "K Vijaya Sena Reddy",
        activityType: "Lead Created",
        remark: "Direct walking to Montage Sales office. Form filled."
      },
      {
        id: "TM-038",
        date: "2026-05-25",
        time: "15:00",
        employee: "K Vijaya Sena Reddy",
        activityType: "Site Visit Done",
        remark: "Showed structure and construction techniques."
      }
    ]
  },
  {
    id: "LD-018",
    customerName: "Siddharth Verma",
    phone: "9866114422",
    alternateNumber: "",
    email: "siddharth_v@gmail.com",
    location: "Madhapur, Hyderabad",
    occupation: "Fintech Co-founder",
    budget: "2.0 Crore - 2.5 Crore",
    requirement: "4 BHK Villa",
    preferredUnitSize: "3600 sqft",
    interestedProject: "Montage Villas",
    leadSource: "Google Ads",
    assignedEmployee: "Chanakya Reddy",
    currentStatus: LeadStatus.BookingDone,
    createdDate: "2026-05-29",
    priority: LeadPriority.Hot,
    nextActivity: "Token Handover",
    nextActivityDate: "2026-06-03", // Today!
    nextActivityTime: "14:00",
    lastRemark: "Paid ₹3,00,000 token transfer block bank account. Process internal dispatch receipts.",
    lastSpokenDate: "2026-06-02",
    costPerLead: 540,
    siteVisits: [
      {
        status: "Done",
        visitDate: "2026-05-30",
        visitTime: "14:00",
        salesExecutive: "Chanakya Reddy",
        project: "Montage Villas"
      }
    ],
    bookings: {
      bookingStatus: "Token Received",
      unitPreference: "Villa 19",
      bookingDate: "2026-06-02",
      bookingAmount: 300000,
      salesExecutive: "Chanakya Reddy",
      agreementStatus: "Agreement Pending",
      paymentStatus: "Payment Follow-up",
      postSalesHandoverStatus: "Agreement Pending"
    },
    timeline: [
      {
        id: "TM-039",
        date: "2026-05-29",
        time: "11:00",
        employee: "System",
        activityType: "Lead Created",
        remark: "Google landing page signup."
      },
      {
        id: "TM-040",
        date: "2026-05-30",
        time: "14:00",
        employee: "Chanakya Reddy",
        activityType: "Site Visit Done",
        remark: "Completed villa visits."
      },
      {
        id: "TM-041",
        date: "2026-06-02",
        time: "11:30",
        employee: "Chanakya Reddy",
        activityType: "Booking Done",
        remark: "Received booking token amount ₹3,00,000."
      }
    ]
  },
  {
    id: "LD-019",
    customerName: "Kandula Prasad",
    phone: "9133445566",
    alternateNumber: "",
    email: "kandula.prasad@gmail.com",
    location: "Srinagar Colony",
    occupation: "Real Estate Investor",
    budget: "1.1 Crore - 1.4 Crore",
    requirement: "3 BHK Apartment",
    preferredUnitSize: "1950 sqft",
    interestedProject: "Sthira",
    leadSource: "Channel Partner",
    assignedEmployee: "Vamshi Krishna",
    currentStatus: LeadStatus.SiteVisitPlanned,
    createdDate: "2026-06-02",
    priority: LeadPriority.Hot,
    nextActivity: "Site visit hosting",
    nextActivityDate: "2026-06-04", // Tomorrow!
    nextActivityTime: "15:00",
    lastRemark: "Referred by elite channel partner. Customer wants structural presentation. Set for tomorrow.",
    lastSpokenDate: "2026-06-02",
    costPerLead: 1500,
    siteVisits: [
      {
        status: "Planned",
        visitDate: "2026-06-04",
        visitTime: "15:00",
        salesExecutive: "Vamshi Krishna",
        project: "Sthira"
      }
    ],
    timeline: [
      {
        id: "TM-042",
        date: "2026-06-02",
        time: "15:00",
        employee: "System",
        activityType: "Lead Created",
        remark: "Registered via partner broker network."
      }
    ]
  },
  {
    id: "LD-020",
    customerName: "Ganesh Shankar",
    phone: "9456123478",
    alternateNumber: "",
    email: "ganesh.shankar@gmail.com",
    location: "Kondapur, Hyderabad",
    occupation: "IT Manager",
    budget: "75 Lakhs - 95 Lakhs",
    requirement: "2 BHK Flat",
    preferredUnitSize: "1350 sqft",
    interestedProject: "Indivaraa",
    leadSource: "Instagram",
    assignedEmployee: "Harish",
    currentStatus: LeadStatus.FreshLeads,
    createdDate: "2026-06-03", // Today!
    priority: LeadPriority.Warm,
    nextActivity: "First Call",
    nextActivityDate: "2026-06-03",
    nextActivityTime: "16:00",
    lastRemark: "Fresh lead received from today's targeted Instagram visual campaign. Out of office, callback in afternoon.",
    lastSpokenDate: "2026-06-03",
    costPerLead: 310,
    siteVisits: [],
    timeline: [
      {
        id: "TM-043",
        date: "2026-06-03",
        time: "09:12",
        employee: "System",
        activityType: "Lead Created",
        remark: "Captured via Instagram Lead ad form."
      }
    ]
  }
];
