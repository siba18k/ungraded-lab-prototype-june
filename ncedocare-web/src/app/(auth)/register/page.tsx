'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpWithEmail } from '@/firebase/auth'
import {
    createFacility,
    facilityHasAdmin,
    getFacilityById,
} from '@/firebase/facilities'
import { createStaffRecord } from '@/firebase/staff'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Building2,
    Check,
    HeartPulse,
    Loader2,
    MapPin,
    Search,
    ShieldCheck,
    Stethoscope,
    UserRound,
} from 'lucide-react'
import { StaffRole } from '@/types/ncedocare'

interface HealthsiteResult {
    osmId: string
    osmType: string
    name: string
    amenity: string
    address: string
    lat: number
    lng: number
}

const schema = z.object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

const ROLES: { value: StaffRole; label: string; icon: React.ReactNode }[] = [
    { value: 'nurse', label: 'Nurse / Triage', icon: <HeartPulse className="h-4 w-4" /> },
    { value: 'doctor', label: 'Doctor', icon: <Stethoscope className="h-4 w-4" /> },
]

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<HealthsiteResult[]>([])
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    const [selectedFacility, setSelectedFacility] = useState<HealthsiteResult | null>(null)
    const [facilityIsNew, setFacilityIsNew] = useState<boolean | null>(null)
    const [role, setRole] = useState<StaffRole>('nurse')
    const [submitError, setSubmitError] = useState('')
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) })

    const runSearch = async () => {
        setSearching(true)
        setSearchError('')
        try {
            const res = await fetch(
                `/api/healthsites/search?q=${encodeURIComponent(searchTerm)}&country=South Africa`
            )
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Search failed')
            setResults(data.facilities)
        } catch (err) {
            setSearchError(
                err instanceof Error ? err.message : 'Could not search facilities.'
            )
        } finally {
            setSearching(false)
        }
    }

    const selectFacility = async (facility: HealthsiteResult) => {
        setSelectedFacility(facility)
        const existing = await getFacilityById(facility.osmId)
        if (existing) {
            const hasAdmin = await facilityHasAdmin(facility.osmId)
            setFacilityIsNew(!hasAdmin)
        } else {
            setFacilityIsNew(true)
        }
        setStep(2)
    }

    const onSubmit = async (data: FormData) => {
        if (!selectedFacility) return
        setLoading(true)
        setSubmitError('')

        try {
            const cred = await signUpWithEmail(data.email, data.password)

            const existingFacility = await getFacilityById(selectedFacility.osmId)
            if (!existingFacility) {
                await createFacility(selectedFacility.osmId, {
                    name: selectedFacility.name,
                    address: selectedFacility.address,
                    lat: selectedFacility.lat,
                    lng: selectedFacility.lng,
                    country: 'South Africa',
                    createdBy: cred.user.uid,
                })
            }

            const finalRole: StaffRole = facilityIsNew ? 'admin' : role
            const status = facilityIsNew ? 'active' : 'pending'

            await createStaffRecord({
                uid: cred.user.uid,
                fullName: data.fullName,
                email: data.email,
                facilityId: selectedFacility.osmId,
                facilityName: selectedFacility.name,
                role: finalRole,
                status,
            })

            if (finalRole === 'admin') {
                router.replace('/admin')
            } else {
                router.replace('/pending-approval')
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Registration failed. Try again.'
            setSubmitError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-very-light)]">
                        <ShieldCheck className="h-8 w-8 text-[#2563eb]" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Register Your Facility
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Join NcedoCare as staff at your hospital or clinic
                    </p>
                </div>

                <div className="mb-6 flex items-center justify-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                    step >= s
                                        ? 'bg-[#2563eb] text-white'
                                        : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                {step > s ? <Check className="h-4 w-4" /> : s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`h-0.5 w-8 ${
                                        step > s ? 'bg-[#2563eb]' : 'bg-slate-200'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:p-7">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Find your hospital</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Search by name — results are pulled from Healthsites.io
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                                    placeholder="e.g. Netcare Milpark Hospital"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50"
                                />
                                <Button
                                    type="button"
                                    onClick={runSearch}
                                    disabled={searching || searchTerm.trim().length < 2}
                                    className="h-12 rounded-xl bg-[#2563eb] px-4 hover:bg-[#1d4ed8]"
                                >
                                    {searching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {searchError && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {searchError}
                                </div>
                            )}

                            <div className="max-h-80 space-y-2 overflow-y-auto">
                                {results.map((facility) => (
                                    <button
                                        key={facility.osmId}
                                        type="button"
                                        onClick={() => selectFacility(facility)}
                                        className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#bfdbfe] hover:bg-[#eff6ff]"
                                    >
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff]">
                                            <Building2 className="h-4 w-4 text-[#2563eb]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {facility.name}
                                            </p>
                                            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                {facility.address || 'Address unavailable'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {results.length === 0 && !searching && (
                                <p className="text-center text-sm text-slate-400">
                                    Search for your facility to get started.
                                </p>
                            )}
                        </div>
                    )}

                    {step === 2 && selectedFacility && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Confirm facility</h2>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-semibold text-slate-900">{selectedFacility.name}</p>
                                <p className="mt-1 text-sm text-slate-500">{selectedFacility.address}</p>
                            </div>

                            {facilityIsNew ? (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                    This facility isn&apos;t registered yet. You&apos;ll become its{' '}
                                    <strong>admin</strong> automatically.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        This facility is already registered. Your account will need
                                        admin approval before you can access patient data.
                                    </div>
                                    <Label className="text-sm font-semibold text-slate-800">
                                        Your role
                                    </Label>
                                    <div className="flex gap-2">
                                        {ROLES.map((r) => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => setRole(r.value)}
                                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
                                                    role === r.value
                                                        ? 'border-[#2563eb] bg-[#eff6ff] text-[#2563eb]'
                                                        : 'border-slate-200 text-slate-500'
                                                }`}
                                            >
                                                {r.icon}
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="h-11 flex-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="h-11 flex-1 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Create your account</h2>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-800">Full name</Label>
                                <div className="relative">
                                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-9"
                                        placeholder="Jane Dlamini"
                                        {...register('fullName')}
                                    />
                                </div>
                                {errors.fullName && (
                                    <p className="text-sm text-red-600">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-800">Email</Label>
                                <Input
                                    type="email"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50"
                                    placeholder="you@facility.co.za"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-800">Password</Label>
                                <Input
                                    type="password"
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50"
                                    placeholder="At least 6 characters"
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            {submitError && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {submitError}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="h-12 flex-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 flex-1 rounded-xl bg-[#2563eb] font-bold hover:bg-[#1d4ed8]"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Create account'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-[#2563eb]">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    )
}