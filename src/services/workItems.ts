// Fetch all work items from the global 'workItems' collection
// (Removed duplicate fetchAllWorkItems to avoid redeclaration error)
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { WorkItem, WorkItemPriority, WorkItemState, WorkItemType, Comment } from '@/types/workItem';

const COLLECTION = 'workItems';


type FirestoreWorkItem = {
  title: string;
  type: WorkItemType;
  state: WorkItemState;
  assignedTo: string | null;
  areaPath: string;
  tags: string[];
  priority: WorkItemPriority;
  description: string;
  comments: Comment[];
  activityDate: Timestamp;
  createdDate: Timestamp;
  createdBy: string; // Added createdBy property
  goalId?: string | null;
};

const fromFirestore = (id: string, data: FirestoreWorkItem): WorkItem => {
  return {
    id: id, // Keep id as a string to match WorkItem interface.
    title: data.title,
    type: data.type,
    state: data.state,
    assignedTo: data.assignedTo,
    areaPath: data.areaPath,
    tags: data.tags ?? [],
    priority: data.priority,
    description: data.description ?? '',
    comments: data.comments ?? [],
    activityDate: data.activityDate.toDate().toISOString(),
    createdDate: data.createdDate.toDate().toISOString(),
    createdBy: data.createdBy ?? '', // Provide a fallback if missing
    approved: (data as any).approved ?? false,
    // goalId removed to match WorkItem interface
  };
};

const toFirestore = (item: Partial<WorkItem>): Partial<FirestoreWorkItem> => {
  const result: Partial<FirestoreWorkItem> = {};
  if (item.title !== undefined) result.title = item.title;
  if (item.type !== undefined) result.type = item.type as WorkItemType;
  if (item.state !== undefined) result.state = item.state as WorkItemState;
  if (item.assignedTo !== undefined) result.assignedTo = item.assignedTo ?? null;
  if (item.areaPath !== undefined) result.areaPath = item.areaPath as string;
  if (item.tags !== undefined) result.tags = item.tags as string[];
  if (item.priority !== undefined) result.priority = item.priority as WorkItemPriority;
  if (item.description !== undefined) result.description = item.description as string;
  if (item.comments !== undefined) result.comments = item.comments as Comment[];
  if (item.activityDate !== undefined)
    result.activityDate = Timestamp.fromDate(new Date(item.activityDate));
  if (item.createdDate !== undefined)
    result.createdDate = Timestamp.fromDate(new Date(item.createdDate));
  if ((item as any).goalId !== undefined) result.goalId = (item as any).goalId ?? null;
  return result;
};

export const subscribeToWorkItems = (
  userId: string,
  onData: (items: WorkItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, 'users', userId, COLLECTION), orderBy('activityDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => fromFirestore(d.id, d.data() as FirestoreWorkItem));
      onData(items);
    },
    (error) => onError?.(error as Error)
  );
};

export const fetchAllWorkItems = async (userId: string): Promise<WorkItem[]> => {
  const q = query(collection(db, 'users', userId, COLLECTION), orderBy('activityDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as FirestoreWorkItem));
};

export const createWorkItem = async (userId: string, item: Omit<WorkItem, 'id'>): Promise<WorkItem> => {
  // Compute next numeric id (simple approach; for production prefer transactions)
  const snap = await getDocs(query(collection(db, 'users', userId, COLLECTION)));
  const maxId = snap.docs.reduce((max, d) => {
    const n = Number(d.id);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  const newId = maxId + 1;
  const idStr = String(newId);
  const ref = doc(db, 'users', userId, COLLECTION, idStr);
  await setDoc(ref, {
    ...toFirestore({ ...item }),
    createdDate: serverTimestamp(),
    activityDate: serverTimestamp(),
  });
  return { ...item, id: idStr }; // <-- id is now a string
};

export const updateWorkItem = async (userId: string, item: WorkItem): Promise<void> => {
  const idStr = String(item.id);
  const ref = doc(db, 'users', userId, COLLECTION, idStr);
  await updateDoc(ref, {
    ...toFirestore(item),
    activityDate: serverTimestamp(),
  });
};

export const deleteWorkItem = async (userId: string, id: number): Promise<void> => {
  const ref = doc(db, 'users', userId, COLLECTION, String(id));
  await deleteDoc(ref);
};


