'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/ncedocare';

export const AuthGuard = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (role && !allowedRoles.includes(role)) {
      // Redirect to their correct dashboard
      if (role === 'nurse')  router.replace('/nurse');
      if (role === 'doctor') router.replace('/doctor');
      if (role === 'admin')  router.replace('/admin');
    }
  }, [user, role, loading]);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading...</div>;
  return <>{children}</>;
};
