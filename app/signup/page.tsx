'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, User, ArrowLeft, Eye, EyeOff, MailCheck, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoogleButton } from '@/components/auth/google-button';
import { getSafeRedirect } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'sender' | 'receiver'>('sender');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Email verification state
  const [verificationPending, setVerificationPending] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const red = params.get('redirect');
    if (red) {
      const safe = getSafeRedirect(red, '');
      if (safe) setRedirectUrl(safe);
    }
    const nameParam = params.get('name');
    if (nameParam) {
      setName(nameParam);
    }
    const roleParam = params.get('role');
    if (roleParam === 'receiver' || roleParam === 'sender') {
      setRole(roleParam);
    }
  }, []);

  // Cooldown timer for resending verification email
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (cooldown > 0 || resending || !submittedEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: submittedEmail,
      });
      if (error) throw error;
      toast({
        title: 'Verification email sent! 💌',
        description: `We've sent a new confirmation link to ${submittedEmail}.`,
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim(), role } },
      });
      if (error) throw error;

      // Upsert profile record
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
          role,
        });
      }

      // Check if email confirmation is required by Supabase (user exists but no active session)
      if (data.user && !data.session) {
        setSubmittedEmail(email.trim());
        setVerificationPending(true);
        setCooldown(60);
        toast({
          title: 'Account created! 🎉',
          description: 'Please verify your email address to log in.',
        });
        return;
      }

      // If session exists (email confirmation disabled/auto-confirmed), log in directly
      toast({
        title: 'Account created! ❤️',
        description: 'Welcome to For My Pookie.',
      });

      const target = getSafeRedirect(redirectUrl, '');
      if (target) {
        router.replace(target);
        return;
      }

      if (role === 'receiver') router.replace('/receiver');
      else router.replace('/sender');
    } catch (err: any) {
      let message = err?.message ?? 'Please try again.';
      if (err?.message?.includes('weak_password') || err?.message?.includes('weak')) {
        message = 'That password is too common or weak. Please use at least 8 characters.';
      } else if (err?.message?.includes('already') || err?.message?.includes('registered')) {
        message = 'An account with this email already exists. Try logging in.';
      } else if (err?.message?.includes('Database error')) {
        message = 'Something went wrong on our end. Please try again.';
      }
      toast({
        title: 'Sign up failed',
        description: message,
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

        {verificationPending ? (
          <div className="glass rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-200/30 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-400 to-lavender-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
              <MailCheck className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-rose-700 mb-2">Account created successfully! 🎉</h1>
            <p className="text-sm text-rose-500 mb-6">
              Please check your email (<span className="font-semibold text-rose-700">{submittedEmail}</span>) and verify before signing in.
            </p>

            <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-4 text-xs text-rose-600/80 mb-6 text-left leading-relaxed">
              <p className="font-semibold text-rose-700 mb-1">Didn't receive the email?</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Check your Spam, Junk, or Promotions folder</li>
                <li>Wait 1-2 minutes for the email server to deliver</li>
                <li>Click below to resend the confirmation email</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending || cooldown > 0}
                className="w-full py-3 rounded-xl border border-rose-200 bg-white/80 hover:bg-white text-rose-600 font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending
                  ? 'Sending email...'
                  : cooldown > 0
                  ? `Resend available in ${cooldown}s`
                  : 'Resend verification email'}
              </button>

              <Link
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium text-sm block hover:shadow-lg hover:shadow-rose-300/40 transition-all text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-200/30">
            <h1 className="font-display text-2xl font-bold text-rose-700 mb-1">Create your account</h1>
            <p className="text-sm text-rose-400/70 mb-6">Start your love story journey.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-rose-200/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 outline-none transition text-rose-700 placeholder:text-rose-300/50 text-base sm:text-sm"
                  />
                </div>
              </div>

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

              <div>
                <label className="text-sm font-medium text-rose-600 mb-1.5 block">I am the...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('sender')}
                    className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      role === 'sender'
                        ? 'border-rose-400 bg-rose-50 text-rose-600'
                        : 'border-rose-200/50 bg-white/40 text-rose-400/60'
                    }`}
                  >
                    Story Creator💌
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('receiver')}
                    className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      role === 'receiver'
                        ? 'border-rose-400 bg-rose-50 text-rose-600'
                        : 'border-rose-200/50 bg-white/40 text-rose-400/60'
                    }`}
                  >
                    Story Receiver💖
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg hover:shadow-rose-300/40 transition-all disabled:opacity-50 text-base sm:text-sm"
              >
                {loading ? 'Creating account...' : 'Sign Up ❤️'}
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

            {/* Google Sign Up */}
            <GoogleButton
              redirectUrl={redirectUrl}
              role={role}
              text="Continue with Google"
            />

            <p className="mt-6 text-center text-sm text-rose-400/60">
              Already have an account?{' '}
              <Link
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                className="text-rose-500 hover:text-rose-600 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        )}

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
