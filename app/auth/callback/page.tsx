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
        // 1. Check for errors in both searchParams and hash fragment
        let errorParam = searchParams.get('error');
        let errorDesc = searchParams.get('error_description');

        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (!errorParam && hashParams.get('error')) {
            errorParam = hashParams.get('error');
            errorDesc = hashParams.get('error_description');
          }
        }

        if (errorParam) {
          const q = new URLSearchParams();
          q.set('error', errorParam);
          if (errorDesc) q.set('error_description', errorDesc);
          router.replace(`/login?${q.toString()}`);
          return;
        }

        const code = searchParams.get('code');
        const redirectParam = searchParams.get('redirect');
        const roleParam = searchParams.get('role');

        // 2. Handle PKCE code exchange if present
        if (code) {
          try {
            const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeErr) {
              // May already have been consumed by detectSessionInUrl
              console.warn('Auth code exchange notice:', exchangeErr.message);
            }
          } catch (e) {
            console.warn('Code exchange handled:', e);
          }
        }

        // 3. Handle implicit token fragment if present (#access_token=...&refresh_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            try {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            } catch (e) {
              console.warn('Token set error:', e);
            }
          }
        }

        // 4. Retrieve current session with small retry buffer for async detection
        let session = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            session = data.session;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        if (!isMounted) return;

        if (!session?.user) {
          // If still no session after attempts, redirect back to login
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

        // Determine user role
        let assignedRole = existingProfile?.role;
        if (!assignedRole) {
          if (roleParam === 'receiver' || redirectParam?.startsWith('/love/')) {
            assignedRole = 'receiver';
          } else {
            assignedRole = 'sender';
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

        // If this is a receiver coming from a shared love link / QR code, immediately link to the experience
        if (assignedRole === 'receiver' && redirectParam?.startsWith('/love/')) {
          const match = redirectParam.match(/\/love\/([^\/\?]+)/);
          if (match && match[1]) {
            await supabase
              .from('experiences')
              .update({
                receiver_id: user.id,
                receiver_name: fullName,
              })
              .eq('secure_token', match[1])
              .is('receiver_id', null);
          }
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
