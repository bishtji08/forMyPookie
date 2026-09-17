'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAppUrl } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const appUrl = getAppUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast({ title: 'Reset link sent! 💌', description: 'Check your email.' });
    } catch (err: any) {
      toast({
        title: 'Failed to send reset link',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
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

        <div className="glass rounded-3xl p-8 shadow-xl shadow-rose-200/30">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold text-rose-700 mb-2">Check your email</h1>
              <p className="text-sm text-rose-400/70 mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition-all"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Forgot password?</h1>
              <p className="text-sm text-rose-400/70 mb-6">
                Enter your email and we'll send you a reset link.
              </p>

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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700 placeholder:text-rose-300/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg hover:shadow-rose-300/40 transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link 💌'}
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
