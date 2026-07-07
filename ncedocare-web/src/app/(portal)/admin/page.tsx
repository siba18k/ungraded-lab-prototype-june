'use client'

import { useEffect, useState, useCallback } from 'react'
import { getStaffByFacility, updateStaffStatus, updateStaffRole } from '@/firebase/staff'
import { useAuthStore } from '@/store/authStore'
import { StaffMember, StaffRole } from '@/types/ncedocare'
import { Check, X, Loader2, ShieldCheck, Clock, Ban, Stethoscope, HeartPulse } from 'lucide-react'

export default function AdminStaffPage() {
    const { staff: currentStaff } = useAuthStore()
    const [members, setMembers] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [actingOn, setActingOn] = useState<string | null>(null)

    const loadStaff = useCallback(async () => {
        if (!currentStaff?.facilityId) return
        setLoading(true)
        const data = await getStaffByFacility(currentStaff.facilityId)
        setMembers(data.sort((a, b) => (a.status === 'pending' ? -1 : 1)))
        setLoading(false)
    }, [currentStaff?.facilityId])

    useEffect(() => {
        loadStaff()
    }, [loadStaff])

    const handleApprove = async (uid: string) => {
        setActingOn(uid)
        await updateStaffStatus(uid, 'active')
        await loadStaff()
        setActingOn(null)
    }

    const handleReject = async (uid: string) => {
        setActingOn(uid)
        await updateStaffStatus(uid, 'suspended')
        await loadStaff()
        setActingOn(null)
    }

    const handleRoleChange = async (uid: string, role: StaffRole) => {
        setActingOn(uid)
        await updateStaffRole(uid, role)
        await loadStaff()
        setActingOn(null)
    }

    const pending = members.filter((m) => m.status === 'pending')
    const active = members.filter((m) => m.status === 'active')
    const suspended = members.filter((m) => m.status === 'suspended')

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#2563eb]" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage staff access for {currentStaff?.facilityName}
                </p>
            </div>

            {pending.length > 0 && (
                <section className="mb-8">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-600">
                        <Clock className="h-4 w-4" />
                        Pending approval ({pending.length})
                    </h2>
                    <div className="space-y-3">
                        {pending.map((m) => (
                            <div
                                key={m.uid}
                                className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 p-4"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900">{m.fullName}</p>
                                    <p className="text-sm text-slate-500">{m.email}</p>
                                    <div className="mt-2 flex gap-2">
                                        {(['nurse', 'doctor'] as StaffRole[]).map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => handleRoleChange(m.uid, r)}
                                                disabled={actingOn === m.uid}
                                                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                    m.role === r
                                                        ? 'border-[#2563eb] bg-[#eff6ff] text-[#2563eb]'
                                                        : 'border-slate-200 bg-white text-slate-500'
                                                }`}
                                            >
                                                {r === 'nurse' ? (
                                                    <HeartPulse className="h-3 w-3" />
                                                ) : (
                                                    <Stethoscope className="h-3 w-3" />
                                                )}
                                                {r === 'nurse' ? 'Nurse' : 'Doctor'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(m.uid)}
                                        disabled={actingOn === m.uid}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:opacity-50"
                                    >
                                        {actingOn === m.uid ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleReject(m.uid)}
                                        disabled={actingOn === m.uid}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600 disabled:opacity-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-8">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                    Active staff ({active.length})
                </h2>
                <div className="space-y-2">
                    {active.map((m) => (
                        <div
                            key={m.uid}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                        >
                            <div>
                                <p className="font-semibold text-slate-900">{m.fullName}</p>
                                <p className="text-sm text-slate-500">{m.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold capitalize text-[#2563eb]">
                  {m.role}
                </span>
                                {m.role !== 'admin' && (
                                    <button
                                        onClick={() => handleReject(m.uid)}
                                        disabled={actingOn === m.uid}
                                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                                    >
                                        Suspend
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {active.length === 0 && (
                        <p className="text-sm text-slate-400">No active staff yet.</p>
                    )}
                </div>
            </section>

            {suspended.length > 0 && (
                <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
                        <Ban className="h-4 w-4" />
                        Suspended ({suspended.length})
                    </h2>
                    <div className="space-y-2">
                        {suspended.map((m) => (
                            <div
                                key={m.uid}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900">{m.fullName}</p>
                                    <p className="text-sm text-slate-500">{m.email}</p>
                                </div>
                                <button
                                    onClick={() => handleApprove(m.uid)}
                                    disabled={actingOn === m.uid}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                                >
                                    Reinstate
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}