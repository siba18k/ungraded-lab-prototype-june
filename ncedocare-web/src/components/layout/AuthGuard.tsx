'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/firebase'
import { getStaffMember } from '@/firebase/staff'
import { StaffRole } from '@/types/ncedocare'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
    allowedRoles: StaffRole[]
    children: React.ReactNode
}

export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
    const router = useRouter()
    const { setStaff, setRole, setFacilityId } = useAuthStore()
    const [checking, setChecking] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let settled = false

        const timeout = setTimeout(() => {
            if (!settled) {
                console.error('AuthGuard: timed out waiting for staff lookup')
                setError('Timed out loading your profile. Check the browser console for details.')
                settled = true
            }
        }, 8000)

        const unsub = onAuthStateChanged(auth, (user) => {
            console.log('AuthGuard: auth state changed', user?.uid)

            if (!user) {
                clearTimeout(timeout)
                router.replace('/login')
                return
            }

            getStaffMember(user.uid)
                .then((staff) => {
                    console.log('AuthGuard: staff doc result', staff)
                    settled = true
                    clearTimeout(timeout)

                    if (!staff) {
                        setError(`No staff record found for uid ${user.uid}.`)
                        return
                    }
                    if (staff.status !== 'active') {
                        setError(`Account status is "${staff.status}", not active.`)
                        return
                    }
                    if (!allowedRoles.includes(staff.role)) {
                        setError(`Role "${staff.role}" is not permitted on this page.`)
                        return
                    }

                    // Populate the global store so child pages can access staff data
                    setStaff(staff)
                    setRole(staff.role)
                    setFacilityId(staff.facilityId)

                    setChecking(false)
                })
                .catch((err) => {
                    console.error('AuthGuard: getStaffMember threw', err)
                    settled = true
                    clearTimeout(timeout)
                    setError(err instanceof Error ? err.message : 'Failed to load staff profile.')
                })
        })

        return () => {
            clearTimeout(timeout)
            unsub()
        }
    }, [router, allowedRoles, setStaff, setRole, setFacilityId])

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center">
                <p className="max-w-md text-sm font-semibold text-red-600">{error}</p>
                <button
                    onClick={() => router.replace('/login')}
                    className="text-sm font-semibold text-[#2563eb]"
                >
                    Back to login
                </button>
            </div>
        )
    }

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <Loader2 className="h-6 w-6 animate-spin text-[#2563eb]" />
            </div>
        )
    }

    return <>{children}</>
}
