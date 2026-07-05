import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Patient } from '@/types/ncedocare';

export const getPatient = async (uid: string): Promise<Patient | null> => {
  const snap = await getDoc(doc(db, 'patients', uid));
  return snap.exists() ? (snap.data() as Patient) : null;
};
