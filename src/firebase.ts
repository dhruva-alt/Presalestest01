/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocFromServer 
} from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json';
import { Lead, Role } from './types';

// Check if configuration is the placeholder template
export const isFirebasePlaceholder = !firebaseConfig || firebaseConfig.apiKey === "placeholder-api-key";

let app;
let db: any;
let auth: any;

if (!isFirebasePlaceholder) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed. Falling back to local mode.", error);
  }
}

export { db, auth };

// Structured operations errors handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth ? auth.currentUser : null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo: currentAuth?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Hardened Error Logged: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// Test connectivity function
export async function testConnection() {
  if (isFirebasePlaceholder || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet status.");
    }
  }
}

if (!isFirebasePlaceholder) {
  testConnection();
}

/**
 * Creates an unmodifiable audit log document.
 */
export async function createAuditLog(
  leadId: string, 
  operatorId: string, 
  operatorName: string, 
  actionType: string, 
  description: string
) {
  const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString();

  const payload = {
    id: logId,
    leadId,
    operatorId,
    operatorName,
    actionType,
    description,
    timestamp
  };

  if (!isFirebasePlaceholder && db) {
    try {
      await setDoc(doc(db, 'activity_logs', logId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `activity_logs/${logId}`);
    }
  } else {
    // Local storage fallback for audit log tracing
    const existing = localStorage.getItem('teramor_crm_activity_logs') || '[]';
    try {
      const parsed = JSON.parse(existing);
      parsed.unshift(payload);
      localStorage.setItem('teramor_crm_activity_logs', JSON.stringify(parsed));
    } catch (e) {
      console.error("Failed to append local audit log", e);
    }
  }
}
