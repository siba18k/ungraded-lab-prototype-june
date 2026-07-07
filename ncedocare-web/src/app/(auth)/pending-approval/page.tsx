import { Clock } from 'lucide-react'

export default function PendingApprovalPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-6 text-center">
            <div className="max-w-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                    <Clock className="h-8 w-8 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Awaiting approval</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Your account has been created and is pending approval from your
                    facility&apos;s admin. You&apos;ll be notified once you&apos;re approved.
                </p>
            </div>
        </main>
    )
}