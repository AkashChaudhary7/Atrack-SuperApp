import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import defaultFirebaseConfig from "../firebase-applet-config.json";

const activeConfig = defaultFirebaseConfig;

// Initialize or retrieve app
const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

// Configure cache setting dynamically based on environment to avoid errors under Node.js / SSR
const firestoreSettings = typeof window !== "undefined" ? {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
} : {};

export const db = initializeFirestore(app, firestoreSettings, activeConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);

// Function to update the configuration at runtime dynamically - locked down to default only
export function updateFirebaseConfigAtRuntime(newConfig: typeof defaultFirebaseConfig | null) {
  // Option removed to enforce security and default single workspace config
  console.warn("Override configuration is disabled. Default project active.");
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
