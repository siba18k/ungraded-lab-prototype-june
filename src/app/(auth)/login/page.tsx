'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginWithEmail } from '@/firebase/auth'
import { getStaffMember } from '@/firebase/staff'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Loader2, HeartPulse, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')

    try {
      const cred = await loginWithEmail(data.email, data.password)
      const staff = await getStaffMember(cred.user.uid)

      if (!staff) throw new Error('Staff profile not found.')
      if (staff.status === 'pending')
        throw new Error('Your account is pending admin approval.')
      if (staff.status === 'suspended')
        throw new Error('Your account has been suspended.')

      if (staff.role === 'nurse') router.replace('/nurse')
      else if (staff.role === 'doctor') router.replace('/doctor')
      else if (staff.role === 'admin') router.replace('/admin')
      else throw new Error('This account cannot access the staff portal.')
    } catch (err: unknown) {
      const message =
          err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-9 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-very-light)]">
              <HeartPulse className="h-8 w-8 text-[#2563eb]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              NcedoCare
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Smarter care for stronger communities
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:p-7">
            <div className="mb-6 flex rounded-xl bg-slate-50 p-1">
              <button
                  type="button"
                  className="flex-1 rounded-lg bg-[#2563eb] py-3 text-sm font-semibold text-white transition"
              >
                Log In
              </button>
              <Link
                  href="/register"
                  className="flex flex-1 items-center justify-center rounded-lg py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
              >
                Register
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-800">
                  Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="h-13 rounded-xl border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#bfdbfe]"
                    {...register('email')}
                />
                {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-800">
                  Password
                </Label>
                <div className="relative">
                  <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="h-13 rounded-xl border-slate-200 bg-slate-50 px-4 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#bfdbfe]"
                      {...register('password')}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                    type="button"
                    className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
              )}

              <Button
                  type="submit"
                  disabled={loading}
                  className="h-13 w-full rounded-xl bg-[#2563eb] text-base font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition hover:bg-[#1d4ed8]"
              >
                {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                ) : (
                    'Log In'
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
              Your data is encrypted and stored securely. NcedoCare complies with POPIA.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-[#2563eb]">
              Register your facility
            </Link>
          </p>
        </div>
      </main>
  )
}