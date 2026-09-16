'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Footer } from '@/components/footer';
import { Heart } from 'lucide-react';

export default function SenderLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const role = profile?.role || user?.user_metadata?.role || 'sender';

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
    if (role === 'receiver') {
      router.replace('/receiver');
      return;
    }
  }, [user, profile, role, loading, router]);

  if (loading || (!user && !profile) || role !== 'sender') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] to-[#f8eaff]">
        <Heart className="w-12 h-12 text-rose-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#fff8fa] to-[#faf5ff]">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col justify-between">
        <div className="flex-1">{children}</div>
        <Footer className="mt-8" />
      </main>
    </div>
  );
}
