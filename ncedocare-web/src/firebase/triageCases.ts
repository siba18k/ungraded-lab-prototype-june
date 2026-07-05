import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { TriageCase, NurseDecision, DoctorConsultation, CaseStatus } from '@/types/ncedocare';

const COLLECTION = 'triageCases';

// Get a single triage case
export const getTriageCase = async (caseId: string): Promise<TriageCase | null> => {
  const snap = await getDoc(doc(db, COLLECTION, caseId));
  return snap.exists() ? (snap.data() as TriageCase) : null;
};

// Get all cases for a facility filtered by status
export const getCasesByFacility = async (
  facilityId: string,
  status?: CaseStatus
): Promise<TriageCase[]> => {
  let q = query(
    collection(db, COLLECTION),
    where('facilityId', '==', facilityId),
    orderBy('createdAt', 'desc')
  );
  if (status) {
    q = query(
      collection(db, COLLECTION),
      where('facilityId', '==', facilityId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as TriageCase);
};

// Real-time listener for the nurse queue (ai_assessed cases)
export const subscribeToNurseQueue = (
  facilityId: string,
  callback: (cases: TriageCase[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTION),
    where('facilityId', '==', facilityId),
    where('status', '==', 'ai_assessed'),
    orderBy('aiRecommendation.riskScore', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as TriageCase));
  });
};

// Real-time listener for doctor queue (nurse_reviewed / with_doctor cases)
export const subscribeToDoctorQueue = (
  facilityId: string,
  callback: (cases: TriageCase[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTION),
    where('facilityId', '==', facilityId),
    where('status', 'in', ['nurse_reviewed', 'with_doctor']),
    orderBy('aiRecommendation.riskScore', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as TriageCase));
  });
};

// Nurse submits decision
export const submitNurseDecision = async (
  caseId: string,
  decision: Omit<NurseDecision, 'decidedAt'>
): Promise<void> => {
  const newStatus: CaseStatus =
    decision.action === 'escalated' ? 'with_doctor' : 'nurse_reviewed';
  await updateDoc(doc(db, COLLECTION, caseId), {
    nurseDecision: { ...decision, decidedAt: serverTimestamp() },
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
};

// Doctor submits consultation outcome
export const submitDoctorConsultation = async (
  caseId: string,
  consultation: Omit<DoctorConsultation, 'completedAt'>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, caseId), {
    doctorConsultation: { ...consultation, completedAt: serverTimestamp() },
    status: 'consultation_complete' as CaseStatus,
    updatedAt: serverTimestamp(),
  });
};
