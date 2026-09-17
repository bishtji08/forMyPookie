'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, ArrowLeft, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { GoogleButton } from '@/components/auth/google-button';
import { getSafeRedirect } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Email confirmation state
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const red = params.get('redirect');
    if (red) {
      const safe = getSafeRedirect(red, '');
      if (safe) setRedirectUrl(safe);
    }

    // Detect OAuth error callbacks
    const errorParam = params.get('error');
    const errorDesc = params.get('error_description');
    if (errorParam) {
      if (errorParam === 'access_denied' || errorDesc?.toLowerCase().includes('cancel') || errorDesc?.toLowerCase().includes('denied')) {
        toast({
          title: 'Sign in cancelled',
          description: 'Google sign-in was cancelled or access was denied. You can try again anytime.',
        });
      } else {
        toast({
          title: 'Sign in issue',
          description: errorDesc || 'Unable to complete sign-in. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendConfirmation = async () => {
    if (cooldown > 0 || resending || !unconfirmedEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });
      if (error) throw error;
      toast({
        title: 'Confirmation email resent! 💌',
        description: `Check your inbox at ${unconfirmedEmail}.`,
      });
      setCooldown(60);
    } catch (err: any) {
      toast({
        title: 'Failed to resend email',
        description: err?.message || 'Please wait a moment and try again.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setUnconfirmedEmail(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Welcome back! ❤️', description: 'You are now logged in.' });

      // Determine role directly to route cleanly without bouncing
      let role = data?.user?.user_metadata?.role;
      if (!role && data?.user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        role = prof?.role;
      }

      // If there is a redirect parameter (e.g. from a shared love link / QR code), go there safely!
      const searchParams = new URLSearchParams(window.location.search);
      const targetParam = searchParams.get('redirect') || redirectUrl;
      const safeTarget = getSafeRedirect(targetParam, '');
      if (safeTarget) {
        // If user is logging in from a love link, link the experience to this user if not yet bound
        if (safeTarget.startsWith('/love/') && data.user) {
          const match = safeTarget.match(/\/love\/([^\/\?]+)/);
          if (match && match[1]) {
            await supabase
              .from('experiences')
              .update({
                receiver_id: data.user.id,
              })
              .eq('secure_token', match[1])
              .is('receiver_id', null);
          }
        }
        router.replace(safeTarget);
        return;
      }

      if (role === 'admin') router.replace('/admin');
      else if (role === 'receiver') router.replace('/receiver');
      else router.replace('/sender');
    } catch (err: any) {
      const errLower = (err?.message || '').toLowerCase();
      if (errLower.includes('not confirmed') || errLower.includes('email_not_confirmed')) {
        setUnconfirmedEmail(email.trim());
        toast({
          title: 'Email not confirmed',
          description: 'Please verify your email address before logging in.',
          variant: 'destructive',
        });
      } else if (errLower.includes('invalid login') || errLower.includes('invalid_credentials') || errLower.includes('invalid_grant')) {
        toast({
          title: 'Login failed',
          description: 'Incorrect email or password. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login failed',
          description: err?.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] via-[#f8eaff] to-[#fffaf5] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-400/30" />
          <span className="font-display text-xl font-bold text-rose-600">For My Pookie</span>
        </Link>

        <div className="glass rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-200/30">
          <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Welcome back</h1>
          <p className="text-sm text-rose-400/70 mb-6">Log in to continue your story.</p>

          {unconfirmedEmail && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">Email not verified yet</p>
                  <p className="text-amber-700/90 mt-0.5">
                    Your account (<span className="font-medium text-amber-900">{unconfirmedEmail}</span>) needs to be verified before signing in.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending || cooldown > 0}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    {resending
                      ? 'Sending...'
                      : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend confirmation email'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-rose-600 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700 placeholder:text-rose-300/50 text-base sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-rose-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700 placeholder:text-rose-300/50 text-base sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-400 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg hover:shadow-rose-300/40 transition-all disabled:opacity-50 text-base sm:text-sm"
            >
              {loading ? 'Logging in...' : 'Login ❤️'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-200/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/90 backdrop-blur-sm px-3 text-rose-400 font-medium rounded-full">
                or
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleButton
            redirectUrl={redirectUrl}
            text="Continue with Google"
          />

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-rose-500 hover:text-rose-600">
              Forgot password?
            </Link>
            <Link
              href={redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup'}
              className="text-rose-500 hover:text-rose-600 font-medium"
            >
              Create account
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1 justify-center mt-6 text-sm text-rose-400/60 hover:text-rose-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>
      </motion.div>
    </div>
  );
}
