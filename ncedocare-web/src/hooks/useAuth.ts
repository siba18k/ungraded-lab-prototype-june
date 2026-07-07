'use client'

import { useEffect } from 'react'
import { onAuthChange } from '@/firebase/auth'
import { getPatient } from '@/firebase/patients'
import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
    const {
        user,
        role,
        facilityId,
        loading,
        setUser,
        setRole,
        setFacilityId,
        setLoading,
        clear,
    } = useAuthStore()

    useEffect(() => {
        const unsub = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)
                const patient = await getPatient(firebaseUser.uid)
                if (patient) {
                    setRole(patient.role)
                    setFacilityId(patient.primaryFacilityId)
                }
            } else {
                clear()
            }
            setLoading(false)
        })

        return () => unsub()
    }, [setUser, setRole, setFacilityId, setLoading, clear])

    return { user, role, facilityId, loading }
}