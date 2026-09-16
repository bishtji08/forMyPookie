'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSafeRedirect } from '@/lib/utils';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Connecting your Google account…');

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      try {
        const code = searchParams.get('code');
        const redirectParam = searchParams.get('redirect');
        const roleParam = searchParams.get('role');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange warning:', error.message);
          }
        }

        // Retrieve current authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!session?.user) {
          router.replace('/login');
          return;
        }

        const user = session.user;

        // Query existing profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role, name')
          .eq('id', user.id)
          .maybeSingle();

        // Determine user role: never allow self-granting 'admin' via query param or OAuth metadata
        let assignedRole = existingProfile?.role;
        if (!assignedRole) {
          if (roleParam === 'receiver' || roleParam === 'sender') {
            assignedRole = roleParam;
          } else if (redirectParam?.startsWith('/love/')) {
            assignedRole = 'receiver';
          } else {
            const metaRole = user.user_metadata?.role;
            assignedRole = (metaRole === 'receiver' || metaRole === 'sender') ? metaRole : 'sender';
          }
        }

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        // Ensure profile exists in profiles table
        if (!existingProfile) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email || '',
            name: fullName,
            role: assignedRole,
            profile_image: avatarUrl,
            status: 'active',
          });
        }

        setStatus('Welcome! Taking you in… ❤️');

        // Route to the intended page safely
        const safeRedirect = getSafeRedirect(redirectParam, '');
        if (safeRedirect) {
          router.replace(safeRedirect);
          return;
        }

        if (assignedRole === 'admin') router.replace('/admin');
        else if (assignedRole === 'receiver') router.replace('/receiver');
        else router.replace('/sender');
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/login');
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] via-[#f8eaff] to-[#fffaf5] px-4">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mb-4"
        >
          <Heart className="w-16 h-16 text-rose-500 fill-rose-300/30 mx-auto" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-rose-700 mb-2">{status}</h2>
        <p className="text-sm text-rose-400/70 font-body">Setting up your romantic space…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] to-[#fffaf5]">
          <Heart className="w-12 h-12 text-rose-400 animate-pulse" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
