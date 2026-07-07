import { AuthGuard } from '@/components/layout/AuthGuard';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['nurse', 'doctor', 'admin']}>
      <div className="min-h-screen bg-slate-950 text-white">
        {children}
      </div>
    </AuthGuard>
  );
}
