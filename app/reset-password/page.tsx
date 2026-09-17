'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Check if user has an active session from the password recovery link
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
        setCheckingSession(false);
        return;
      }

      // Check hash fragment in URL (Supabase often delivers access_token in #access_token=...)
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        setHasSession(true);
        setCheckingSession(false);
        return;
      }

      setHasSession(false);
      setCheckingSession(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(true);
        setCheckingSession(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated! ❤️', description: 'You can now log in with your new password.' });
      router.replace('/login');
    } catch (err: any) {
      toast({
        title: 'Failed to update password',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] via-[#f8eaff] to-[#fffaf5] px-4 py-8">
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
          {checkingSession ? (
            <div className="text-center py-8 text-rose-400 text-sm">
              Verifying reset token...
            </div>
          ) : !hasSession ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h1 className="font-display text-xl font-bold text-rose-700 mb-2">Reset link expired or invalid</h1>
              <p className="text-sm text-rose-400/80 mb-6">
                Please request a new password reset link to continue.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium text-sm hover:shadow-lg transition-all"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Set new password</h1>
              <p className="text-sm text-rose-400/70 mb-6">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-rose-600 mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
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
                  {loading ? 'Updating...' : 'Update Password ❤️'}
                </button>
              </form>
            </>
          )}

          <Link
            href="/login"
            className="flex items-center gap-1 justify-center mt-6 text-sm text-rose-400/60 hover:text-rose-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
