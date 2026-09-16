'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface GoogleButtonProps {
  redirectUrl?: string | null;
  role?: 'sender' | 'receiver';
  text?: string;
  className?: string;
  disabled?: boolean;
}

export function GoogleButton({
  redirectUrl,
  role = 'sender',
  text = 'Continue with Google',
  className = '',
  disabled = false,
}: GoogleButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const targetRedirect = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '';
      const callbackUrl = new URL('/auth/callback', origin);
      if (targetRedirect) {
        callbackUrl.searchParams.set('redirect', targetRedirect);
      }
      if (role) {
        callbackUrl.searchParams.set('role', role);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      toast({
        title: 'Google sign-in error',
        description: err?.message || 'Could not initiate Google sign-in. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading || disabled}
      className={`w-full py-3 px-5 rounded-full bg-[#f0e8ff] hover:bg-[#e7dbff] active:scale-[0.99] border border-[#ded0fb] text-[#4a284e] font-medium text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-[#4a284e] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span>Connecting with Google…</span>
        </>
      ) : (
        <>
          <GoogleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
