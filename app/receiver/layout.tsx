'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Footer } from '@/components/footer';
import { Heart } from 'lucide-react';

export default function ReceiverLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const role = profile?.role || user?.user_metadata?.role || 'receiver';

  useEffect(() => {
    if (loading) return;
    if (!user && !profile) {
      router.replace('/login');
      return;
    }
    if (role === 'admin') {
      router.replace('/admin');
      return;
    }
    if (role === 'sender') {
      router.replace('/sender');
      return;
    }
  }, [user, profile, role, loading, router]);

  if (loading || (!user && !profile) || role !== 'receiver') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] to-[#f8eaff]">
        <Heart className="w-12 h-12 text-rose-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#fff8fa] to-[#faf5ff]">
      <DashboardSidebar />
      <main className="flex-1 w-full min-w-0 overflow-x-hidden flex flex-col justify-between">
        <div className="flex-1 w-full">{children}</div>
        <Footer className="mt-8" />
      </main>
    </div>
  );
}
