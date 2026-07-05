import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface QueueEntry {
  caseId: string;
  patientId: string;
  priorityLevel: string;
  riskScore: number;
  arrivalTime: unknown;
  queuePosition: number;
  status: string;
}

export const subscribeToFacilityQueue = (
  facilityId: string,
  callback: (entries: QueueEntry[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'facilityQueues', facilityId, 'activeQueue'),
    orderBy('queuePosition', 'asc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as QueueEntry));
  });
};
