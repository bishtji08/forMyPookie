'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Heart } from 'lucide-react';

export default function DashboardRouter() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user && !profile) {
      router.replace('/login');
      return;
    }
    const role = profile?.role || user?.user_metadata?.role || 'sender';
    if (role === 'admin') router.replace('/admin');
    else if (role === 'receiver') router.replace('/receiver');
    else router.replace('/sender');
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] to-[#f8eaff]">
      <div className="text-center">
        <Heart className="w-12 h-12 text-rose-400 animate-pulse mx-auto mb-4" />
        <p className="text-rose-400 font-body">Loading your dashboard...</p>
      </div>
    </div>
  );
}
