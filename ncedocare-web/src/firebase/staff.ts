import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
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