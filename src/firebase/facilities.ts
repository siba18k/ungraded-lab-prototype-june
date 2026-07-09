import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore'
import { db } from './firebase'
import { Facility } from '@/types/ncedocare'

export const getFacilityById = async (
    facilityId: string
): Promise<Facility | null> => {
    const ref = doc(db, 'facilities', facilityId)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as Facility) : null
}

export const createFacility = async (
    facilityId: string,
    data: {
        name: string
        address?: string
        lat: number
        lng: number
        country?: string
        createdBy: string
    }
): Promise<void> => {
    const ref = doc(db, 'facilities', facilityId)
    await setDoc(ref, {
        ...data,
        facilityId,
        isActive: true,
        createdAt: serverTimestamp(),
    })
}

export const facilityHasAdmin = async (
    facilityId: string
): Promise<boolean> => {
    const q = query(
        collection(db, 'staff'),
        where('facilityId', '==', facilityId),
        where('role', '==', 'admin')
    )
    const snap = await getDocs(q)
    return !snap.empty
}