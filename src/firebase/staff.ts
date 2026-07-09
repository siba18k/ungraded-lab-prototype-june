import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'
import { StaffMember, StaffRole, StaffStatus } from '@/types/ncedocare'

export const getStaffMember = async (
    uid: string
): Promise<StaffMember | null> => {
    const ref = doc(db, 'staff', uid)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as StaffMember) : null
}

export const createStaffRecord = async (input: {
    uid: string
    fullName: string
    email: string
    facilityId: string
    facilityName: string
    role: StaffRole
    status: StaffStatus
}): Promise<void> => {
    const ref = doc(db, 'staff', input.uid)
    await setDoc(ref, {
        ...input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
}

export const getStaffByFacility = async (
    facilityId: string
): Promise<StaffMember[]> => {
    const q = query(collection(db, 'staff'), where('facilityId', '==', facilityId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as StaffMember)
}

export const getPendingStaff = async (
    facilityId: string
): Promise<StaffMember[]> => {
    const q = query(
        collection(db, 'staff'),
        where('facilityId', '==', facilityId),
        where('status', '==', 'pending')
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as StaffMember)
}

export const updateStaffStatus = async (
    uid: string,
    status: StaffStatus
): Promise<void> => {
    const ref = doc(db, 'staff', uid)
    await updateDoc(ref, { status, updatedAt: serverTimestamp() })
}

export const updateStaffRole = async (
    uid: string,
    role: StaffRole
): Promise<void> => {
    const ref = doc(db, 'staff', uid)
    await updateDoc(ref, { role, updatedAt: serverTimestamp() })
}