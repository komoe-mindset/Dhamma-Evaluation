import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import firebaseConfigJSON from "../firebase-applet-config.json";

// App ID resolution
export const getAppId = (): string => {
  if (typeof window !== "undefined") {
    const win = window as any;
    if (win.appletId) return win.appletId;
    if (win.__APP_ID__) return win.__APP_ID__;
  }
  return firebaseConfigJSON.appId ? "586522d1-9ce2-4832-b8a5-7704c9bf8815" : "586522d1-9ce2-4832-b8a5-7704c9bf8815";
};

// Config resolution
const firebaseConfig =
  (typeof window !== "undefined" && (window as any).firebaseConfig) || firebaseConfigJSON;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Specify the provisioned database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Silent Anonymous Authentication
let authPromise: Promise<any> | null = null;
export const ensureAuthenticated = async () => {
  if (auth.currentUser) return auth.currentUser;
  if (!authPromise) {
    authPromise = signInAnonymously(auth).catch((err) => {
      console.warn("Anonymous auth notice:", err);
      return null;
    });
  }
  return authPromise;
};

// Get Evaluations Collection Path
export const getEvaluationsCollectionRef = () => {
  const appId = getAppId();
  return collection(db, "artifacts", appId, "public", "data", "evaluations");
};

export interface SavedEvaluationRecord {
  id: string;
  bookTitle: string;
  authorName: string;
  reviewerName: string;
  publishYear: string;
  categories: string[];
  mahapadesa: Record<string, string>;
  legal: Record<string, string>;
  verdict: string;
  overallNotes: string;
  savedAt: string;
  updatedAt: string;
}

// Error Handling Function
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export const handleFirestoreError = (
  error: unknown,
  operationType: OperationType,
  path: string | null
) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(errInfo.error);
};

// Save evaluation record to Firestore
export const saveEvaluationToCloud = async (formData: any, docId?: string): Promise<string> => {
  await ensureAuthenticated();
  const appId = getAppId();
  const path = `artifacts/${appId}/public/data/evaluations`;
  const recordId = docId || `eval_${Date.now()}`;
  const docRef = doc(db, "artifacts", appId, "public", "data", "evaluations", recordId);

  const payload: SavedEvaluationRecord = {
    id: recordId,
    bookTitle: formData.bookTitle || "ခေါင်းစဉ်မရှိ စာအုပ်",
    authorName: formData.authorName || "-",
    reviewerName: formData.reviewerName || "-",
    publishYear: formData.publishYear || "-",
    categories: formData.categories || [],
    mahapadesa: formData.mahapadesa || {},
    legal: formData.legal || {},
    verdict: formData.finalVerdict || formData.verdict || "pending_revision",
    overallNotes: formData.additionalNotes || formData.overallNotes || "",
    savedAt: new Date().toLocaleDateString("my-MM", { dateStyle: "full" }) + " " + new Date().toLocaleTimeString("my-MM"),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    return recordId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return recordId;
  }
};

// Fetch all evaluation records
export const fetchEvaluationsFromCloud = async (): Promise<SavedEvaluationRecord[]> => {
  await ensureAuthenticated();
  const appId = getAppId();
  const path = `artifacts/${appId}/public/data/evaluations`;
  const colRef = getEvaluationsCollectionRef();

  try {
    const snapshot = await getDocs(colRef);
    const records: SavedEvaluationRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push({ id: docSnap.id, ...(docSnap.data() as Omit<SavedEvaluationRecord, "id">) });
    });
    records.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// Real-time listener for evaluation records
export const subscribeEvaluationsFromCloud = (
  onData: (records: SavedEvaluationRecord[]) => void,
  onError?: (err: any) => void
) => {
  const appId = getAppId();
  const colRef = getEvaluationsCollectionRef();

  ensureAuthenticated().then(() => {
    return onSnapshot(
      colRef,
      (snapshot) => {
        const records: SavedEvaluationRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push({ id: docSnap.id, ...(docSnap.data() as Omit<SavedEvaluationRecord, "id">) });
        });
        records.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
        onData(records);
      },
      (error) => {
        if (onError) onError(error);
        console.warn("Realtime listener error:", error);
      }
    );
  });
};

// Delete record from Firestore
export const deleteEvaluationFromCloud = async (recordId: string): Promise<boolean> => {
  await ensureAuthenticated();
  const appId = getAppId();
  const path = `artifacts/${appId}/public/data/evaluations/${recordId}`;
  const docRef = doc(db, "artifacts", appId, "public", "data", "evaluations", recordId);

  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
};
