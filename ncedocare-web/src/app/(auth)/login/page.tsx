'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginWithEmail } from '@/firebase/auth';
import { getPatient } from '@/firebase/patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldCheck } from 'lucide-react';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const cred = await loginWithEmail(data.email, data.password);
      const patient = await getPatient(cred.user.uid);
      if (!patient) throw new Error('User profile not found.');

      if (patient.role === 'nurse')       router.replace('/nurse');
      else if (patient.role === 'doctor') router.replace('/doctor');
      else if (patient.role === 'admin')  router.replace('/admin');
      else throw new Error('Unauthorized: patient accounts cannot access this portal.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo / Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">NcedoCare</h1>
          <p className="text-slate-400 text-sm">Care Coordination Portal</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Sign in</CardTitle>
            <CardDescription className="text-slate-400">
              For healthcare staff only. Patients use the mobile app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-slate-300">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nurse@ncedocare.co.za"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password.message}</p>
                )}
              </div>

              {/* Global error */}
              {error && (
                <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                ) : (
                  'Sign in'
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs">
          NcedoCare · Smarter care for stronger communities
        </p>
      </div>
    </main>
  );
}
