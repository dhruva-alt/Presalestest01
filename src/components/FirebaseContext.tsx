/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  db, 
  isFirebasePlaceholder, 
  createAuditLog, 
  handleFirestoreError, 
  OperationType 
} from "../firebase";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { Lead, LeadStatus, LeadPriority, Role, TimelineItem } from "../types";
import { INITIAL_LEADS } from "../initialData";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

interface FirebaseContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  isLocalFallback: boolean;
  leads: Lead[];
  activityLogs: any[];
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  
  // Lead Operations
  createLead: (leadData: Omit<Lead, "id" | "timeline" | "siteVisits"> & { initialRemarkText: string }) => Promise<void>;
  updateLeadRemark: (leadId: string, remarkData: any) => Promise<void>;
  assignLeadSingle: (leadId: string, employeeName: string) => Promise<void>;
  assignLeadsBulk: (leadIds: string[], employeeName: string) => Promise<void>;
  deleteLeadRecord: (leadId: string) => Promise<boolean>;
  updateLeadFields: (leadId: string, updatedFields: Partial<Lead>, actionType: string, actionDesc: string) => Promise<void>;
  
  // Auxiliary operations
  loadDemoData: () => Promise<void>;
  purgeDatabase: () => Promise<void>;
  checkDuplicatePhone: (phone: string, idToExclude?: string) => Lead | null;
  importCSVLeads: (csvContent: string) => Promise<{ success: number; skipped: number; errors: string[] }>;
  exportLeadsCSV: () => string;
  getBackupJSON: () => string;
  triggerStaticToast: (text: string, type?: "success" | "warning") => void;
  systemToast: { text: string; type: "success" | "warning" } | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebase must be used inside a FirebaseProvider");
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [systemToast, setSystemToast] = useState<{ text: string; type: "success" | "warning" } | null>(null);

  // Allow switching roles directly for quick manual department toggling as requested
  const [overrideRole, setOverrideRole] = useState<Role | null>(null);

  const triggerStaticToast = (text: string, type: "success" | "warning" = "success") => {
    setSystemToast({ text, type });
    setTimeout(() => setSystemToast(null), 4500);
  };

  // 1. Setup Auth state listeners
  useEffect(() => {
    if (isFirebasePlaceholder) {
      // Local simulated mode
      const savedUser = localStorage.getItem("teramor_simulated_user");
      if (savedUser) {
        try {
          const profile = JSON.parse(savedUser);
          setUser({ uid: profile.uid, email: profile.email, displayName: profile.name });
          setUserProfile(profile);
        } catch (e) {
          console.error("Failed to parse simulated user", e);
        }
      } else {
        // Create a default Admin staff user profile
        const defaultProfile: UserProfile = {
          uid: "MOCK_ADMIN",
          name: "Chanakya Admin",
          email: "admin@teramor.in",
          role: Role.SuperAdmin,
          enabled: true,
          createdAt: new Date().toISOString()
        };
        setUser({ uid: defaultProfile.uid, email: defaultProfile.email, displayName: defaultProfile.name });
        setUserProfile(defaultProfile);
        localStorage.setItem("teramor_simulated_user", JSON.stringify(defaultProfile));
      }
      setLoading(false);
      return;
    }

    // Real Firebase Mode
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch or establish user profile in Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Setup new user default role as Sales Executive
            // Note: dhruva@teramor.in (User Email from runtime) is boosted to Super Admin as requested
            const isDhruva = firebaseUser.email === "dhruva@teramor.in";
            const initialProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Teramor Employee",
              email: firebaseUser.email || "",
              role: isDhruva ? Role.SuperAdmin : Role.SalesExecutive,
              enabled: true,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (err) {
          console.error("Error retrieving user profile from Firestore:", err);
          // Fallback initial
          setUserProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "Employee",
            email: firebaseUser.email || "",
            role: Role.SuperAdmin,
            enabled: true,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute calculated current effective role
  const currentRole = overrideRole || userProfile?.role || Role.SuperAdmin;
  const setCurrentRole = (role: Role) => {
    setOverrideRole(role);
    if (userProfile) {
      setUserProfile({ ...userProfile, role });
    }
  };

  // 2. Real-time leads and logs listener
  useEffect(() => {
    if (isFirebasePlaceholder) {
      // Local simulated updates from localStorage
      const loadLocalData = () => {
        const savedLeads = localStorage.getItem("teramor_crm_leads_v1");
        if (savedLeads) {
          try {
            const list = JSON.parse(savedLeads);
            // Apply Sales Executive filtering if offline mode
            if (currentRole === Role.SalesExecutive && userProfile) {
              const staffName = userProfile.name;
              setLeads(list.filter((l: Lead) => l.assignedEmployee === staffName));
            } else {
              setLeads(list);
            }
          } catch (e) {
            setLeads(INITIAL_LEADS);
          }
        } else {
          setLeads(INITIAL_LEADS);
          localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(INITIAL_LEADS));
        }

        const savedLogs = localStorage.getItem("teramor_crm_activity_logs");
        if (savedLogs) {
          try {
            setActivityLogs(JSON.parse(savedLogs));
          } catch (e) {
            setActivityLogs([]);
          }
        } else {
          setActivityLogs([]);
        }
      };

      loadLocalData();
      
      // Setup a periodic check or custom event listener for local changes
      const handleStorageChange = () => loadLocalData();
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }

    // Real Live Firebase Firestore Listeners
    if (!userProfile) return;

    // Filter leads for Sales Executive
    let leadsQuery: any = collection(db, "leads");
    if (currentRole === Role.SalesExecutive) {
      leadsQuery = query(collection(db, "leads"), where("assignedEmployee", "==", userProfile.name));
    }

    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const list: Lead[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Lead);
      });
      // Sort in-memory to keep consistent descending date
      list.sort((a,b) => b.createdDate.localeCompare(a.createdDate));
      setLeads(list);
    }, (err) => {
      console.error("Live leads snapshot read failed.", err);
    });

    // Real-time audit logs listener
    let logsQuery: any = collection(db, "activity_logs");
    if (currentRole === Role.SalesExecutive) {
      logsQuery = query(collection(db, "activity_logs"), where("operatorId", "==", userProfile.uid));
    }

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push(d.data());
      });
      list.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
      setActivityLogs(list);
    }, (err) => {
      console.error("Live activity logs read failed.", err);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeLogs();
    };
  }, [userProfile, currentRole]);

  // Auth Actions
  const loginWithGoogle = async () => {
    if (isFirebasePlaceholder) {
      triggerStaticToast("Google sign-in simulated successfully.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      triggerStaticToast("Signed in with Google successfully.");
    } catch (e: any) {
      triggerStaticToast(`Google sign in failed: ${e.message}`, "warning");
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebasePlaceholder) {
      // Simulate profile change using email check lookup
      const isExec = email.includes("sales") || email.includes("exec");
      const simulatedName = isExec ? "Vamshi Krishna" : "Chanakya Admin";
      const simulatedRole = isExec ? Role.SalesExecutive : Role.SuperAdmin;

      const profile: UserProfile = {
        uid: "MOCK_" + Date.now(),
        name: simulatedName,
        email: email,
        role: simulatedRole,
        enabled: true,
        createdAt: new Date().toISOString()
      };
      setUser({ uid: profile.uid, email: profile.email, displayName: profile.name });
      setUserProfile(profile);
      localStorage.setItem("teramor_simulated_user", JSON.stringify(profile));
      triggerStaticToast(`Simulated signature authentication for ${simulatedName}`);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      triggerStaticToast("Signed in successfully.");
    } catch (e: any) {
      triggerStaticToast(`Log in failed: ${e.message}`, "warning");
      throw e;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: Role) => {
    if (isFirebasePlaceholder) {
      const profile: UserProfile = {
        uid: "MOCK_" + Date.now(),
        name,
        email,
        role,
        enabled: true,
        createdAt: new Date().toISOString()
      };
      setUser({ uid: profile.uid, email: profile.email, displayName: profile.name });
      setUserProfile(profile);
      localStorage.setItem("teramor_simulated_user", JSON.stringify(profile));
      triggerStaticToast(`Simulated sign-up successfully for ${name}`);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userModel: UserProfile = {
        uid: userCredential.user.uid,
        name,
        email,
        role,
        enabled: true,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", userCredential.user.uid), userModel);
      setUserProfile(userModel);
      triggerStaticToast("Account registered and configured successfully.");
    } catch (e: any) {
      triggerStaticToast(`Sign up failed: ${e.message}`, "warning");
      throw e;
    }
  };

  const logout = async () => {
    if (isFirebasePlaceholder) {
      localStorage.removeItem("teramor_simulated_user");
      setUser(null);
      setUserProfile(null);
      triggerStaticToast("Signed out of local environment");
      return;
    }
    try {
      await signOut(auth);
      triggerStaticToast("Successfully logged out");
    } catch (e: any) {
      triggerStaticToast("Logout failed.", "warning");
    }
  };

  // Lead Operations
  const createLead = async (leadData: Omit<Lead, "id" | "timeline" | "siteVisits"> & { initialRemarkText: string }) => {
    // Duplicate Phone check
    const dup = checkDuplicatePhone(leadData.phone);
    if (dup) {
      triggerStaticToast(`Warning: Phone number ${leadData.phone} is already linked to lead ${dup.customerName} (${dup.id})`, "warning");
      // Still proceed or tag it depending on criteria? The prompt says "Add duplicate phone number detection".
      // Let's tag the status as Duplicate or warn! We can flag it or ask user. Let's tag it or show duplication match.
    }

    const nextIdNumber = leads.length + 101;
    const paddedId = `LD-${nextIdNumber.toString().padStart(3, "0")}`;
    const todayStr = new Date().toISOString().substring(0, 10);

    const freshLead: Lead = {
      ...leadData,
      id: paddedId,
      siteVisits: [],
      timeline: [
        {
          id: `TM-${Date.now()}-1`,
          date: todayStr,
          time: "10:30",
          employee: "System Queue",
          activityType: "Lead Created",
          remark: `Campaign source: ${leadData.leadSource}. Assigned to executive: ${leadData.assignedEmployee}`
        },
        {
          id: `TM-${Date.now()}-2`,
          date: todayStr,
          time: "10:32",
          employee: userProfile?.name || "Employee",
          activityType: "Action Scheduled",
          remark: leadData.initialRemarkText,
          nextAction: `${leadData.nextActivity} set on ${leadData.nextActivityDate} at ${leadData.nextActivityTime}`
        }
      ]
    };

    if (!isFirebasePlaceholder && db) {
      try {
        await setDoc(doc(db, "leads", paddedId), freshLead);
        await createAuditLog(
          paddedId, 
          userProfile?.uid || "unknown", 
          userProfile?.name || "Anonymous", 
          "Created", 
          `Created lead customer record ${leadData.customerName} (${paddedId})`
        );
        triggerStaticToast(`Success: Customer created securely as ${paddedId}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `leads/${paddedId}`);
      }
    } else {
      // Local
      const currentLeads = [...leads, freshLead];
      localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(currentLeads));
      setLeads(currentLeads);
      await createAuditLog(
        paddedId, 
        userProfile?.uid || "unknownPin", 
        userProfile?.name || "Admin", 
        "Created", 
        `[Simulated] Created lead customer record ${leadData.customerName}`
      );
      triggerStaticToast(`Success: Local Customer file created with ID ${paddedId}`);
    }
  };

  const updateLeadRemark = async (leadId: string, remarkData: any) => {
    const target = leads.find((l) => l.id === leadId);
    if (!target) return;

    const todayStr = new Date().toISOString().substring(0, 10);
    const timelineNode: TimelineItem = {
      id: `TM-${Date.now()}`,
      date: todayStr,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      employee: userProfile?.name || "Manager",
      activityType: remarkData.activityType,
      remark: remarkData.remark
    };

    if (remarkData.nextActivityDate) {
      timelineNode.nextAction = `${remarkData.nextActivity} scheduled on ${remarkData.nextActivityDate} at ${remarkData.nextActivityTime}`;
    }

    const siteVisitsCopy = [...(target.siteVisits || [])];
    if (remarkData.activityType === "Site Visit Planned") {
      siteVisitsCopy.push({
        status: "Planned",
        visitDate: remarkData.nextActivityDate,
        visitTime: remarkData.nextActivityTime,
        salesExecutive: target.assignedEmployee,
        project: target.interestedProject
      });
    } else if (remarkData.activityType === "Site Visit Done") {
      const lastPlannedIdx = siteVisitsCopy.findIndex((sv) => sv.status === "Planned");
      if (lastPlannedIdx !== -1) {
        siteVisitsCopy[lastPlannedIdx] = {
          ...siteVisitsCopy[lastPlannedIdx],
          status: "Done",
          feedback: remarkData.remark,
          budgetMatch: "Yes",
          customerInterest: "High",
          finalOutcome: "Expressed interest in booking"
        };
      } else {
        siteVisitsCopy.push({
          status: "Done",
          visitDate: todayStr,
          visitTime: "11:00",
          salesExecutive: target.assignedEmployee,
          project: target.interestedProject,
          feedback: remarkData.remark,
          budgetMatch: "Yes"
        });
      }
    }

    let bookingsState = target.bookings;
    if (remarkData.activityType === "Booking Done") {
      bookingsState = {
        bookingStatus: "Token Received",
        unitPreference: "Premium Allocated Unit",
        bookingDate: todayStr,
        bookingAmount: 250000,
        salesExecutive: target.assignedEmployee,
        agreementStatus: "Agreement Pending",
        paymentStatus: "Payment Follow-up",
        postSalesHandoverStatus: "Agreement Pending"
      };
    }

    const updatedLead: Lead = {
      ...target,
      currentStatus: remarkData.leadStatus,
      priority: remarkData.leadPriority,
      nextActivity: remarkData.nextActivity || "Archived",
      nextActivityDate: remarkData.nextActivityDate,
      nextActivityTime: remarkData.nextActivityTime,
      lastRemark: remarkData.remark,
      lastSpokenDate: todayStr,
      siteVisits: siteVisitsCopy,
      bookings: bookingsState,
      timeline: [timelineNode, ...(target.timeline || [])]
    };

    if (!isFirebasePlaceholder && db) {
      try {
        await setDoc(doc(db, "leads", leadId), updatedLead);
        await createAuditLog(
          leadId,
          userProfile?.uid || "unknown",
          userProfile?.name || "Anonymous",
          "Edited",
          `Logged action "${remarkData.activityType}" with remark: "${remarkData.remark}"`
        );
        triggerStaticToast(`Timeline & status updated for ${target.customerName}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `leads/${leadId}`);
      }
    } else {
      const nextList = leads.map((l) => (l.id === leadId ? updatedLead : l));
      localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(nextList));
      setLeads(nextList);
      await createAuditLog(
        leadId,
        userProfile?.uid || "unknown",
        userProfile?.name || "Mock",
        "Edited",
        `[Local] Updated remark: ${remarkData.remark}`
      );
      triggerStaticToast(`Timeline updated locally for ${target.customerName}`);
    }
  };

  const assignLeadSingle = async (leadId: string, employeeName: string) => {
    const target = leads.find((l) => l.id === leadId);
    if (!target) return;

    const timelineNode = {
      id: `TM-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      time: "10:30",
      employee: userProfile?.name || "Coordinator",
      activityType: "Lead Assigned",
      remark: `Transferred account follow-up and dashboard tracking to ${employeeName}.`
    };

    const updatedLead: Lead = {
      ...target,
      assignedEmployee: employeeName,
      timeline: [timelineNode, ...(target.timeline || [])]
    };

    if (!isFirebasePlaceholder && db) {
      try {
        await setDoc(doc(db, "leads", leadId), updatedLead);
        await createAuditLog(
          leadId,
          userProfile?.uid || "unknown",
          userProfile?.name || "Anonymous",
          "Assigned",
          `Assigned lead to executive: ${employeeName}`
        );
        triggerStaticToast(`Reassigned to ${employeeName}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `leads/${leadId}`);
      }
    } else {
      const nextList = leads.map((l) => (l.id === leadId ? updatedLead : l));
      localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(nextList));
      setLeads(nextList);
      await createAuditLog(
        leadId,
        userProfile?.uid || "unknown",
        userProfile?.name || "Mock",
        "Assigned",
        `Assigned lead to executive: ${employeeName}`
      );
      triggerStaticToast(`Reassigned to ${employeeName} locally`);
    }
  };

  const assignLeadsBulk = async (leadIds: string[], employeeName: string) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const updatedLeads = leads.map((l) => {
      if (leadIds.includes(l.id)) {
        const timelineNode = {
          id: `TM-${Date.now()}-${l.id}`,
          date: todayStr,
          time: "10:30",
          employee: userProfile?.name || "Coordinator",
          activityType: "Bulk Assigned",
          remark: `Reassigned in bulk to consultant ${employeeName}.`
        };
        return {
          ...l,
          assignedEmployee: employeeName,
          timeline: [timelineNode, ...(l.timeline || [])]
        };
      }
      return l;
    });

    if (!isFirebasePlaceholder && db) {
      try {
        const batch = writeBatch(db);
        for (const id of leadIds) {
          const leadDoc = updatedLeads.find((ul) => ul.id === id);
          if (leadDoc) {
            batch.set(doc(db, "leads", id), leadDoc);
          }
        }
        await batch.commit();
        for (const id of leadIds) {
          await createAuditLog(
            id,
            userProfile?.uid || "unknown",
            userProfile?.name || "Anonymous",
            "Transfer",
            `Bulk transfer ownership to ${employeeName}`
          );
        }
        triggerStaticToast(`Bulk reassigned ${leadIds.length} lead files to ${employeeName}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "leads_batch");
      }
    } else {
      localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(updatedLeads));
      setLeads(updatedLeads);
      for (const id of leadIds) {
        await createAuditLog(
          id,
          userProfile?.uid || "unknown",
          userProfile?.name || "Manager",
          "Transfer",
          `Bulk assigned locally to ${employeeName}`
        );
      }
      triggerStaticToast(`Locally reassigned ${leadIds.length} leads in bulk.`);
    }
  };

  const deleteLeadRecord = async (leadId: string): Promise<boolean> => {
    const target = leads.find((l) => l.id === leadId);
    if (!target) return false;

    if (!isFirebasePlaceholder && db) {
      try {
        await createAuditLog(
          leadId,
          userProfile?.uid || "unknown",
          userProfile?.name || "Anonymous",
          "Deleted",
          `Deleted lead directory information for ${target.customerName}`
        );
        await deleteDoc(doc(db, "leads", leadId));
        triggerStaticToast(`Permanently deleted lead ${leadId}`);
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `leads/${leadId}`);
        return false;
      }
    } else {
      const nextList = leads.filter((l) => l.id !== leadId);
      localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(nextList));
      setLeads(nextList);
      await createAuditLog(
        leadId,
        userProfile?.uid || "unknown",
        userProfile?.name || "Admin",
        "Deleted",
        `[Local] Removed record profile for ${target.customerName}`
      );
      triggerStaticToast(`Locally deleted lead ${leadId}`);
      return true;
    }
  };

  const updateLeadFields = async (leadId: string, updatedFields: Partial<Lead>, actionType: string, actionDesc: string) => {
    const target = leads.find((l) => l.id === leadId);
    if (!target) return;

    const finalLead = {
      ...target,
      ...updatedFields
    };

    if (!isFirebasePlaceholder && db) {
      try {
        await setDoc(doc(db, "leads", leadId), finalLead);
        await createAuditLog(
          leadId,
          userProfile?.uid || "unknown",
          userProfile?.name || "Anonymous",
          actionType,
          actionDesc
        );
        triggerStaticToast(`Secured updates committed to ${target.customerName}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `leads/${leadId}`);
      }
    } else {
      const nextList = leads.map((l) => (l.id === leadId ? finalLead : l));
      localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(nextList));
      setLeads(nextList);
      await createAuditLog(
        leadId,
        userProfile?.uid || "unknown",
        userProfile?.name || "Mock",
        actionType,
        `[Local] ${actionDesc}`
      );
      triggerStaticToast(`Updated fields locally for ${target.customerName}`);
    }
  };

  const checkDuplicatePhone = (phone: string, idToExclude?: string): Lead | null => {
    const cleanNum = phone.replace(/[^0-9]/g, "");
    if (!cleanNum || cleanNum.length < 5) return null;
    return leads.find((l) => {
      if (idToExclude && l.id === idToExclude) return false;
      const primaryLoc = l.phone.replace(/[^0-9]/g, "");
      const altLoc = (l.alternateNumber || "").replace(/[^0-9]/g, "");
      return primaryLoc === cleanNum || (altLoc && altLoc === cleanNum);
    }) || null;
  };

  const loadDemoData = async () => {
    if (!isFirebasePlaceholder && db) {
      try {
        const batch = writeBatch(db);
        for (const item of INITIAL_LEADS) {
          batch.set(doc(db, "leads", item.id), item);
        }
        await batch.commit();
        triggerStaticToast("Demo portfolios added to Firestore successfully!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "populate_demo_batch");
      }
    } else {
      localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(INITIAL_LEADS));
      setLeads(INITIAL_LEADS);
      triggerStaticToast("Demo portfolio loaded to local memory");
    }
  };

  const purgeDatabase = async () => {
    if (!isFirebasePlaceholder && db) {
      try {
        // Fetch all first to delete (Vite is simplified client batch run)
        const snap = await getDocs(collection(db, "leads"));
        const batch = writeBatch(db);
        snap.forEach((d) => {
          batch.delete(doc(db, "leads", d.id));
        });
        await batch.commit();
        triggerStaticToast("All leads purged from Cloud storage.");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "purge_batch");
      }
    } else {
      localStorage.removeItem("teramor_crm_leads_v1");
      setLeads([]);
      triggerStaticToast("Local database cleared");
    }
  };

  // CSV Import helper
  const importCSVLeads = async (csvContent: string) => {
    const lines = csvContent.split("\n");
    if (lines.length < 2) return { success: 0, skipped: 0, errors: ["Empty CSV format"] };
    
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    const leadListToCommit: Lead[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const getVal = (colName: string) => {
        const idx = headers.indexOf(colName);
        return idx !== -1 ? values[idx] || "" : "";
      };

      const name = getVal("name") || getVal("customername") || getVal("customer name");
      let phone = getVal("phone") || getVal("number") || getVal("mobile");
      
      if (!name || !phone) {
        errors.push(`Row ${i + 1}: Missing name or phone, skipped.`);
        skipped++;
        continue;
      }

      phone = phone.replace(/[^0-9]/g, "");

      // Check Duplicates
      const dup = checkDuplicatePhone(phone);
      if (dup) {
        errors.push(`Row ${i + 1}: Duplicate phone ${phone} matches lead ${dup.customerName} (${dup.id}), skipped.`);
        skipped++;
        continue;
      }

      const nextId = leads.length + added + 201;
      const textId = `LD-${nextId.toString().padStart(3, "0")}`;
      const today = new Date().toISOString().substring(0, 10);

      const importedInstance: Lead = {
        id: textId,
        customerName: name,
        phone: phone,
        alternateNumber: getVal("alternatenumber") || getVal("alternate") || "",
        email: getVal("email") || "",
        location: getVal("location") || "Unknown Location",
        occupation: getVal("occupation") || "Executive",
        budget: getVal("budget") || "75 Lakhs - 95 Lakhs",
        requirement: getVal("requirement") || "2 BHK Flat",
        preferredUnitSize: getVal("size") || "1350 sqft",
        interestedProject: getVal("project") || "Sthira",
        leadSource: getVal("source") || "CSV Import",
        assignedEmployee: getVal("assignedemployee") || getVal("assigned") || "Chanakya Reddy",
        currentStatus: LeadStatus.FreshLeads,
        createdDate: today,
        priority: LeadPriority.Warm,
        nextActivity: "First Call",
        nextActivityDate: today,
        nextActivityTime: "12:00",
        lastRemark: "Imported via CSV file uploading",
        lastSpokenDate: today,
        siteVisits: [],
        timeline: [
          {
            id: `TM-${Date.now()}-${i}`,
            date: today,
            time: "11:00",
            employee: userProfile?.name || "System Import",
            activityType: "Lead Created",
            remark: "Lead profile uploaded in batch compilation."
          }
        ]
      };

      leadListToCommit.push(importedInstance);
      added++;
    }

    if (leadListToCommit.length > 0) {
      if (!isFirebasePlaceholder && db) {
        try {
          const batch = writeBatch(db);
          for (const lItem of leadListToCommit) {
            batch.set(doc(db, "leads", lItem.id), lItem);
          }
          await batch.commit();
          for (const lItem of leadListToCommit) {
            await createAuditLog(
              lItem.id,
              userProfile?.uid || "unauth",
              userProfile?.name || "Importer",
              "Created",
              `Imported client record ${lItem.customerName} via batch CSV payload`
            );
          }
        } catch (e: any) {
          errors.push(`Firestore save error: ${e.message}`);
          return { success: 0, skipped: skipped + added, errors };
        }
      } else {
        const nextSet = [...leads, ...leadListToCommit];
        localStorage.setItem("teramor_crm_leads_v1", JSON.stringify(nextSet));
        setLeads(nextSet);
        for (const lItem of leadListToCommit) {
          await createAuditLog(
            lItem.id,
            userProfile?.uid || "unauth",
            userProfile?.name || "Importer",
            "Created",
            `Imported client record ${lItem.customerName} locally via CSV`
          );
        }
      }
    }

    triggerStaticToast(`CSV complete: Sourced ${added} leads, skipped ${skipped}`);
    return { success: added, skipped, errors };
  };

  // CSV Export helper
  const exportLeadsCSV = (): string => {
    const keys = ["ID", "Customer Name", "Phone", "Email", "Location", "Project", "Source", "Assigned Employee", "Status", "Priority", "Budget", "Requirement"];
    const csvRows = [];
    csvRows.push(keys.join(","));
    
    for (const lead of leads) {
      const row = [
        lead.id,
        `"${lead.customerName.replace(/"/g, '""')}"`,
        lead.phone,
        lead.email,
        `"${lead.location.replace(/"/g, '""')}"`,
        lead.interestedProject,
        lead.leadSource,
        lead.assignedEmployee,
        lead.currentStatus,
        lead.priority,
        lead.budget,
        `"${lead.requirement.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    }
    return csvRows.join("\n");
  };

  // Raw Backup JSON
  const getBackupJSON = (): string => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      leadsCount: leads.length,
      leadsSnapshot: leads
    }, null, 2);
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      userProfile,
      loading,
      isLocalFallback: isFirebasePlaceholder,
      leads,
      activityLogs,
      currentRole,
      setCurrentRole,
      loginWithGoogle,
      loginWithEmail,
      signUpWithEmail,
      logout,
      createLead,
      updateLeadRemark,
      assignLeadSingle,
      assignLeadsBulk,
      deleteLeadRecord,
      updateLeadFields,
      loadDemoData,
      purgeDatabase,
      checkDuplicatePhone,
      importCSVLeads,
      exportLeadsCSV,
      getBackupJSON,
      triggerStaticToast,
      systemToast
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};
