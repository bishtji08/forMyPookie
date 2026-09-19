'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, X, Volume2, VolumeX, Play, Pause, Lock, ArrowLeft, ArrowRight, MessageCircle, Star,
  Eye, EyeOff, Mail, User as UserIcon, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type {
  Experience, Memory, FunnyMoment, LoveReason, GalleryItem,
  ResponseStatus, ExperienceTheme
} from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';
import { GoogleButton } from '@/components/auth/google-button';
import { Footer } from '@/components/footer';
import { isVideoUrl } from '@/lib/utils';
import { ParchmentLetter } from '@/components/experience/parchment-letter';
import { InteractiveEnvelope } from '@/components/experience/interactive-envelope';
import { FloatingReactions } from '@/components/experience/floating-reactions';
import { formatCustomDateIdea } from '@/lib/date-ideas';
import { GlossyHeart } from '@/components/experience/glossy-heart';
import { FloatingAmbientHearts } from '@/components/experience/floating-ambient-hearts';

// Simplified 6 Core Date Ideas
const SIMPLE_DATE_IDEAS = [
  { key: 'coffee', label: 'Coffee & Talk', emoji: '☕' },
  { key: 'dinner', label: 'Dinner Date', emoji: '🍕' },
  { key: 'movie', label: 'Movie Night', emoji: '🎬' },
  { key: 'stargazing', label: 'Stargazing Night', emoji: '🔭' },
  { key: 'walk', label: 'Sunset Walk', emoji: '🌅' },
  { key: 'surprise', label: 'Surprise Me', emoji: '✨' },
];

export default function LoveExperiencePage() {
  const { token } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  const [exp, setExp] = useState<Experience | null>(null);
  const [submittingDate, setSubmittingDate] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [funnyMoments, setFunnyMoments] = useState<FunnyMoment[]>([]);
  const [loveReasons, setLoveReasons] = useState<LoveReason[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [lightboxItem, setLightboxItem] = useState<{ url: string; caption?: string; isVideo?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [opened, setOpened] = useState(false);
  const [response, setResponse] = useState<ResponseStatus | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [customDateInput, setCustomDateInput] = useState('');
  const [dateNote, setDateNote] = useState('');
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [heartClicks, setHeartClicks] = useState(0);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Inline Auth State for locked screen
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authVerificationPending, setAuthVerificationPending] = useState(false);
  const [authCooldown, setAuthCooldown] = useState(0);
  const [authResending, setAuthResending] = useState(false);

  useEffect(() => {
    if (authCooldown <= 0) return;
    const timer = setInterval(() => {
      setAuthCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [authCooldown]);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmitting) return;
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both your email and password.');
      return;
    }
    setAuthSubmitting(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });
      if (error) throw error;

      // Connect receiver account to experience if not yet bound
      if (data.user && exp && !exp.receiver_id && data.user.id !== exp.sender_id) {
        const loggedUserId = data.user.id;
        await supabase
          .from('experiences')
          .update({
            receiver_id: loggedUserId,
            receiver_name: profile?.name || data.user.user_metadata?.name || authName.trim() || exp.receiver_name,
          })
          .eq('id', exp.id);
        setExp((prev) => (prev ? { ...prev, receiver_id: loggedUserId } : null));
      }

      toast({
        title: 'Unlocked! ❤️',
        description: 'Welcome to your love story.',
      });
    } catch (err: any) {
      const errLower = (err?.message || '').toLowerCase();
      if (errLower.includes('not confirmed') || errLower.includes('email_not_confirmed')) {
        setAuthVerificationPending(true);
        setAuthCooldown(60);
        setAuthError('Please verify your email address to log in. Check your inbox.');
      } else if (errLower.includes('invalid login') || errLower.includes('invalid_credentials') || errLower.includes('invalid_grant')) {
        setAuthError('Incorrect email or password. Please try again or create an account.');
      } else {
        setAuthError(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleInlineSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmitting) return;
    const finalName = (authName.trim() || exp?.receiver_name || 'My Pookie').trim();
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter your email and password.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthSubmitting(true);
    setAuthError(null);
    const tokenStr = Array.isArray(token) ? token[0] : token;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          data: { name: finalName, role: 'receiver' },
          emailRedirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback?redirect=/love/${tokenStr}&role=receiver`
            : undefined,
        },
      });
      if (error) throw error;

      if (data.user) {
        const newUserId = data.user.id;
        await supabase.from('profiles').upsert({
          id: newUserId,
          name: finalName,
          email: authEmail.trim(),
          role: 'receiver',
          status: 'active',
        });

        if (exp && !exp.receiver_id && newUserId !== exp.sender_id) {
          await supabase
            .from('experiences')
            .update({
              receiver_id: newUserId,
              receiver_name: finalName,
            })
            .eq('id', exp.id);
          setExp((prev) => (prev ? { ...prev, receiver_id: newUserId, receiver_name: finalName } : null));
        }
      }

      if (data.user && !data.session) {
        setAuthVerificationPending(true);
        setAuthCooldown(60);
        toast({
          title: 'Account created! 🎉',
          description: 'Please verify your email address to unlock.',
        });
        return;
      }

      toast({
        title: 'Account created & Unlocked! 💖',
        description: `Welcome, ${finalName}! Your letter is ready.`,
      });
    } catch (err: any) {
      let msg = err?.message || 'Sign up failed. Please try again.';
      if (msg.includes('already') || msg.includes('registered')) {
        msg = 'An account with this email already exists. Switch to Log In tab!';
        setAuthTab('login');
      }
      setAuthError(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleInlineResendVerification = async () => {
    if (authCooldown > 0 || authResending || !authEmail.trim()) return;
    setAuthResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: authEmail.trim(),
      });
      if (error) throw error;
      toast({
        title: 'Verification email resent! 💌',
        description: `Check your inbox at ${authEmail}.`,
      });
      setAuthCooldown(60);
    } catch (err: any) {
      toast({
        title: 'Failed to resend email',
        description: err?.message || 'Please wait a moment and try again.',
        variant: 'destructive',
      });
    } finally {
      setAuthResending(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    const tokenStr = Array.isArray(token) ? token[0] : token;
    if (!tokenStr) return;

    let isMounted = true;
    (async () => {
      setLoading(true);
      setNotFound(false);

      const { data: expData, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('secure_token', tokenStr)
        .maybeSingle();

      if (!isMounted) return;

      if (!expData || error) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setExp(expData as Experience);
      if (expData.receiver_name) {
        setAuthName(expData.receiver_name);
      }

      // Auto-connect receiver account if current user is logged in
      if (user && expData && user.id !== expData.sender_id && !expData.receiver_id) {
        const { error: updateErr } = await supabase.from('experiences').update({
          receiver_id: user.id,
          receiver_name: profile?.name || user.user_metadata?.name || expData.receiver_name,
        }).eq('id', expData.id);
        if (!updateErr) {
          expData.receiver_id = user.id;
        }
      }

      const [memRes, funnyRes, reasonsRes, galleryRes] = await Promise.all([
        supabase.from('memories').select('*').eq('experience_id', expData.id).order('sort_order'),
        supabase.from('funny_moments').select('*').eq('experience_id', expData.id).order('sort_order'),
        supabase.from('love_reasons').select('*').eq('experience_id', expData.id).order('sort_order'),
        supabase.from('gallery_items').select('*').eq('experience_id', expData.id).order('sort_order'),
      ]);

      if (!isMounted) return;

      setMemories((memRes.data as Memory[]) || []);
      setFunnyMoments((funnyRes.data as FunnyMoment[]) || []);
      setLoveReasons((reasonsRes.data as LoveReason[]) || []);
      setGallery((galleryRes.data as GalleryItem[]) || []);
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [token, user, profile, authLoading]);

  const handleOpen = async () => {
    setOpened(true);
    if (exp && !exp.is_opened) {
      await supabase.from('experiences').update({
        is_opened: true,
        opened_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      }).eq('id', exp.id);

      // Notify sender
      if (exp.sender_id) {
        await supabase.from('notifications').insert({
          user_id: exp.sender_id,
          type: 'opened',
          title: `${exp.receiver_name || 'Your pookie'} opened your letter! 💌`,
          body: 'She opened the experience.',
          experience_id: exp.id,
        });
      }
    } else if (exp) {
      await supabase.from('experiences').update({
        last_accessed_at: new Date().toISOString(),
      }).eq('id', exp.id);
    }

    // Play music if available
    if (exp?.music_url && audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().then(() => {
        setPlaying(true);
        setMuted(false);
      }).catch(() => {});
    }
  };

  const handleResponse = async (resp: ResponseStatus) => {
    setResponse(resp);
    if (!exp) return;

    await supabase.from('experiences').update({ response_status: resp }).eq('id', exp.id);

    await supabase.from('responses').insert({
      experience_id: exp.id,
      response: resp,
      note: resp === 'maybe' ? dateNote : null,
    });

    // Notify sender
    if (exp.sender_id) {
      const respText = resp === 'yes' ? 'YES 😭❤️' : resp === 'maybe' ? 'MAYBE' : 'NO';
      await supabase.from('notifications').insert({
        user_id: exp.sender_id,
        type: 'response',
        title: `${exp.receiver_name || 'Your pookie'} said ${respText}!`,
        body: resp === 'yes' ? 'She said yes!' : resp === 'maybe' ? 'She needs some time.' : 'She said no. Respect her decision.',
        experience_id: exp.id,
      });
    }
  };

  const handleDateSubmit = async (skip = false) => {
    if (!exp) return;
    setSubmittingDate(true);
    try {
      if (!skip && selectedActivity) {
        await supabase.from('date_requests').insert({
          experience_id: exp.id,
          activity: selectedActivity,
          notes: dateNote,
        });

        // Notify sender
        if (exp.sender_id) {
          await supabase.from('notifications').insert({
            user_id: exp.sender_id,
            type: 'response',
            title: `${exp.receiver_name || 'Your pookie'} chose a date! 🥂`,
            body: `She picked: ${selectedActivity}${dateNote ? ` - Note: "${dateNote}"` : ''}`,
            experience_id: exp.id,
          });
        }

        setDateConfirmed(true);
        toast({
          title: 'Date request sent! ❤️',
          description: "It's a date! Your response has been sent to him.",
        });
        return;
      }

      toast({
        title: skip ? 'Response confirmed! ❤️' : 'Date request sent! ❤️',
        description: 'Redirecting to your dashboard...',
      });
      setRedirecting(true);
      setTimeout(() => {
        router.push(profile?.role === 'sender' ? '/sender' : '/receiver');
      }, 1200);
    } catch {
      router.push(profile?.role === 'sender' ? '/sender' : '/receiver');
    } finally {
      setSubmittingDate(false);
    }
  };

  const handleHeartClick = () => {
    const newCount = heartClicks + 1;
    setHeartClicks(newCount);
    if (newCount >= 5) {
      setEasterEgg('Okay okay, you found the secret 😂');
      setTimeout(() => setEasterEgg(null), 3000);
      setHeartClicks(0);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(audioRef.current.muted);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] via-[#f8eaff] to-[#fffaf5]">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mb-4"
          >
            <Heart className="w-16 h-16 text-rose-400 fill-rose-300/30 mx-auto" />
          </motion.div>
          <div className="space-y-2">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-rose-400 font-handwritten text-xl">Collecting our memories… ❤️</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-rose-400/60 font-handwritten text-lg">Preparing something for pookie…</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} className="text-rose-400/40 font-handwritten text-lg">Okay… I'm nervous.</motion.p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fff1f5] to-[#f8eaff]">
        <div className="text-center px-6">
          <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-rose-600 mb-2">This link isn't valid</h1>
          <p className="text-rose-400/60">The experience may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, require signup or login first
  if (!user) {
    const tokenStr = Array.isArray(token) ? token[0] : token;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fbf2fc] via-[#faebf7] to-[#fff5ea] px-4 py-12 relative overflow-hidden">
        {/* Floating ambient hearts */}
        <FloatingAmbientHearts theme="pink-dream" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md relative z-10 w-full p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl border border-rose-100/80"
        >
          {/* Glowing locked envelope with 3D heart */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mx-auto mb-5 w-24 h-16 sm:w-28 sm:h-20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-pink-200 to-purple-200 rounded-2xl shadow-xl shadow-rose-200/50" />
            <div className="absolute top-0 left-0 right-0 h-0 border-l-[48px] sm:border-l-[56px] border-r-[48px] sm:border-r-[56px] border-b-[30px] sm:border-b-[36px] border-l-transparent border-r-transparent border-b-rose-100/90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                <Lock className="w-5 h-5 text-rose-500" />
              </div>
            </div>
          </motion.div>

          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-600 text-xs font-semibold mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Private Love Letter
            </div>

            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#3f1d2e] tracking-tight mb-1">
              For {exp?.receiver_name || 'My Pookie'} ❤️
            </h1>

            {exp?.receiver_nickname && (
              <p className="font-handwritten text-xl text-rose-600 mb-1">
                &ldquo;To my {exp.receiver_nickname}&rdquo;
              </p>
            )}

            <p className="text-xs text-[#8f6479] mt-1 leading-relaxed">
              {exp?.sender_name ? `${exp.sender_name} made a secret love story just for you.` : 'A secret love story was made just for you.'}
              <br />
              <span className="font-medium text-rose-700">Please log in or create an account to unlock and open.</span>
            </p>
          </div>

          {/* Auth Tab Switcher */}
          <div className="flex bg-rose-100/60 p-1 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                authTab === 'login'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-rose-900/60 hover:text-rose-900'
              }`}
            >
              ❤️ Log In
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('signup'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                authTab === 'signup'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-rose-900/60 hover:text-rose-900'
              }`}
            >
              💖 Create Account
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 leading-snug">{authError}</div>
            </div>
          )}

          {/* Verification Pending Notice */}
          {authVerificationPending && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <p className="font-semibold mb-1">Email verification sent! 💌</p>
              <p className="text-[11px] opacity-80 mb-2">Check your email ({authEmail}) and click the link to unlock your letter.</p>
              <button
                type="button"
                onClick={handleInlineResendVerification}
                disabled={authCooldown > 0 || authResending}
                className="text-xs font-bold text-rose-600 underline hover:text-rose-700 disabled:opacity-50"
              >
                {authResending ? 'Resending…' : authCooldown > 0 ? `Resend in ${authCooldown}s` : 'Resend Email'}
              </button>
            </div>
          )}

          {/* Tab 1: Log In Form */}
          {authTab === 'login' && (
            <form onSubmit={handleInlineLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-rose-900/70 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white/90 text-xs text-rose-950 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-900/70 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-rose-200 bg-white/90 text-xs text-rose-950 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600"
                  >
                    {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition transform hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {authSubmitting ? (
                  <span>Unlocking… ❤️</span>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Unlock Love Letter ❤️</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Create Account Form */}
          {authTab === 'signup' && (
            <form onSubmit={handleInlineSignUp} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-rose-900/70 uppercase tracking-wider mb-1">Your Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white/90 text-xs text-rose-950 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-900/70 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white/90 text-xs text-rose-950 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-900/70 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Choose a password (min 6 chars)"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-rose-200 bg-white/90 text-xs text-rose-950 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600"
                  >
                    {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition transform hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {authSubmitting ? (
                  <span>Creating Account… 💖</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Account & Unlock 💖</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Divider & Google Login */}
          <div className="mt-4 pt-3 border-t border-rose-100/80">
            <GoogleButton
              redirectUrl={`/love/${tokenStr}`}
              role="receiver"
              text="Unlock with Google"
            />
          </div>

          <p className="text-[#8f6479]/70 text-[11px] text-center mt-3 flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>Private & encrypted. Only authorized receiver can view.</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // If user is logged in with a different account that is not the sender and not the bound receiver
  if (user && exp?.receiver_id && user.id !== exp.receiver_id && user.id !== exp.sender_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fbf2fc] via-[#faebf7] to-[#fff5ea] px-4 relative overflow-hidden">
        <FloatingAmbientHearts theme="pink-dream" />
        <div className="text-center max-w-md w-full p-8 rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl border border-rose-100 relative z-10">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#3f1d2e] mb-2">Private Love Letter</h2>
          <p className="text-sm text-[#8f6479] mb-6 leading-relaxed">
            This love letter was created specifically for <strong>{exp.receiver_name}</strong> and is bound to their account. You are currently signed in as <strong>{profile?.name || user.email}</strong>.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition hover:scale-[1.02] cursor-pointer"
          >
            Switch Account / Log In with {exp.receiver_name}&apos;s Email
          </button>
        </div>
      </div>
    );
  }

  const theme = (exp?.theme as ExperienceTheme) || 'pink-dream';
  const cfg = THEME_CONFIG[theme] || THEME_CONFIG['pink-dream'];
  const isDark = theme === 'lavender-night' || theme === 'starry-romance';
  const themeConfig = cfg;
  const subColor = cfg.subColor;
  const isSender = Boolean(user && exp && user.id === exp.sender_id);

  if (!opened) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${cfg.unopenedBg} px-4 relative overflow-hidden`}>
        {/* Sender Preview Notice Banner */}
        {isSender && (
          <div className="fixed top-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-amber-500/95 text-white text-xs font-medium px-4 py-2 rounded-2xl shadow-xl border border-amber-300 flex items-center gap-2 max-w-xl">
              <span className="text-base">👁️</span>
              <span className="flex-1 text-[11px] leading-tight">
                <strong>Sender Preview Mode:</strong> You are logged in as sender. On your receiver&apos;s device, this letter is locked until she logs in or signs up.
              </span>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer"
              >
                Test Logged Out
              </button>
            </div>
          </div>
        )}

        {/* Floating top navigation if logged in */}
        {user && !isSender && (
          <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
            <Link
              href={profile?.role === 'sender' ? '/sender' : '/receiver'}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-rose-700 text-xs font-medium shadow-md backdrop-blur-md border border-rose-200/60 transition hover:scale-105"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{profile?.role === 'sender' ? 'Sender Dashboard' : 'Receiver Dashboard'}</span>
            </Link>
          </div>
        )}

        {/* Dreamy floating 3D hearts & romantic background elements */}
        <FloatingAmbientHearts theme={theme} />

        <InteractiveEnvelope
          receiverName={exp?.receiver_name || 'My Pookie'}
          senderName={exp?.sender_name || 'Someone special'}
          subtitle="a little something I made with my whole heart"
          theme={theme}
          onOpen={handleOpen}
        />

        {exp?.music_url && <audio ref={audioRef} src={exp.music_url} loop />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.openedBg} ${cfg.textColor} relative`}>
      {exp?.music_url && <audio ref={audioRef} src={exp.music_url} loop />}

      {/* Sender Preview Notice Banner */}
      {isSender && (
        <div className="fixed top-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-amber-500/95 text-white text-xs font-medium px-4 py-2 rounded-2xl shadow-xl border border-amber-300 flex items-center gap-2 max-w-xl">
            <span className="text-base">👁️</span>
            <span className="flex-1 text-[11px] leading-tight">
              <strong>Sender Preview Mode:</strong> You are logged in as sender. On your receiver&apos;s device, this letter is locked until she logs in or signs up.
            </span>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer"
            >
              Test Logged Out
            </button>
          </div>
        </div>
      )}

      {/* Floating navigation to dashboard & chat */}
      {user && !isSender && (
        <div className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
          <Link
            href={profile?.role === 'sender' ? '/sender' : '/receiver'}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-rose-600 text-xs font-semibold shadow-md backdrop-blur-md border border-rose-100 transition hover:scale-105"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{profile?.role === 'sender' ? 'Sender Dashboard' : 'Receiver Dashboard'}</span>
          </Link>
          {profile?.role === 'receiver' && (
            <Link
              href="/receiver/messages"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-md backdrop-blur-md transition hover:scale-105"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </Link>
          )}
        </div>
      )}

      {/* Music controls */}
      {exp?.music_url && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <button onClick={toggleMusic} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:shadow-lg transition">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:shadow-lg transition">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Easter egg toast */}
      <AnimatePresence>
        {easterEgg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-rose-600 font-medium text-sm"
          >
            {easterEgg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continuous background floating 3D hearts & dreamy romantic particles */}
      <FloatingAmbientHearts theme={theme} />

      {/* Floating Reaction Dock */}
      <FloatingReactions isDark={isDark} />

      {/* Content sections: Single Cohesive Flow matching preview.html */}
      <div className="relative z-10 pt-20 pb-16 px-4 sm:px-8 w-full max-w-3xl mx-auto space-y-12">
        
        {/* 1. THE APOLOGY MESSAGE (If provided by sender) */}
        {exp?.apology_message && (
          <section>
            <ParchmentLetter
              badge="From the bottom of my heart"
              title="Things I Should Have Said Properly…"
              senderName={exp.sender_name}
              receiverName={exp.receiver_name}
              content={exp.apology_message}
              theme={theme}
              isDark={isDark}
              accentColor={cfg.accent}
            />
          </section>
        )}

        {/* 2. THE LOVE LETTER & FINAL MESSAGE */}
        {(exp?.love_letter || !exp?.apology_message) && (
          <section>
            <ParchmentLetter
              badge="Beyond any fight, there is us"
              title="What You Truly Mean To Me ❤️"
              senderName={exp?.sender_name}
              receiverName={exp?.receiver_name}
              content={exp?.love_letter || "Before this little fight, there was an entire story called us. You mean the world to me and I love you with all my heart."}
              secretNote={exp?.final_letter || "P.S. Whatever happens, you deserve the sweetest smile today. You will always be special to me. ❤️"}
              theme={theme}
              isDark={isDark}
              accentColor={cfg.accent}
            />
          </section>
        )}

        {/* 3. OUR FAVORITE MEMORIES 📸 (Polaroids) */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-6">
              <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Remember these moments?</p>
              <h3 className={`font-serif-display text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
                Our Favorite Memories 📸
              </h3>
            </div>

            {/* If sender uploaded custom memories, display them */}
            {memories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {memories.map((mem, i) => {
                  const isVid = mem.media_url ? isVideoUrl(mem.media_url) : false;
                  return (
                    <motion.div
                      key={mem.id || i}
                      whileHover={{ scale: 1.04, rotate: 0 }}
                      className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-black/10 dark:border-white/10 transition-all text-left relative cursor-pointer ${
                        i % 3 === 0 ? 'transform -rotate-1' : i % 3 === 1 ? 'transform rotate-2' : 'transform -rotate-2'
                      }`}
                      onClick={() => {
                        if (mem.media_url) {
                          setLightboxItem({ url: mem.media_url, caption: mem.caption || mem.title, isVideo: isVid });
                        }
                      }}
                    >
                      <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs rotate-2 pointer-events-none`} />
                      <div className={`w-full h-36 rounded-xl overflow-hidden mb-3 ${cfg.polaroidInnerBg} flex items-center justify-center`}>
                        {mem.media_url ? (
                          isVid ? (
                            <video src={mem.media_url} playsInline preload="metadata" className="w-full h-full object-cover" />
                          ) : (
                            <img src={mem.media_url} alt={mem.title} className="w-full h-full object-cover" loading="lazy" />
                          )
                        ) : (
                          <span className="text-3xl">{i === 0 ? '☕' : i === 1 ? '⛰️' : '🍕'}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-0.5">{mem.title}</h4>
                      {mem.date && <p className="text-[11px] text-slate-400 font-mono mb-1">{mem.date}{mem.location ? ` · ${mem.location}` : ''}</p>}
                      {mem.caption && (
                        <p className={`font-script text-base ${cfg.subColor} leading-snug`}>
                          {mem.caption}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Fallback default memories matching preview.html */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.04, rotate: 0 }}
                  className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-black/10 dark:border-white/10 transform -rotate-1 transition-all text-left relative"
                >
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs rotate-2 pointer-events-none`} />
                  <div className={`h-32 sm:h-36 ${cfg.polaroidInnerBg} rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner`}>
                    ☕
                  </div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">The First Date</p>
                  <p className={`font-script text-base ${cfg.subColor} leading-snug`}>
                    Spilled coffee & still got your number
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.04, rotate: 0 }}
                  className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-black/10 dark:border-white/10 transform rotate-2 transition-all text-left relative"
                >
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs -rotate-2 pointer-events-none`} />
                  <div className={`h-32 sm:h-36 ${cfg.polaroidInnerBg} rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner`}>
                    ⛰️
                  </div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">Mountain Trip</p>
                  <p className={`font-script text-base ${cfg.subColor} leading-snug`}>
                    You made me take 400 photos & I loved it
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.04, rotate: 0 }}
                  className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-black/10 dark:border-white/10 transform -rotate-2 transition-all text-left relative"
                >
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs rotate-1 pointer-events-none`} />
                  <div className={`h-32 sm:h-36 ${cfg.polaroidInnerBg} rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner`}>
                    🍕
                  </div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">Pizza Disaster</p>
                  <p className={`font-script text-base ${cfg.subColor} leading-snug`}>
                    Burned pasta, best pizza ever
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </section>

        {/* 4. PHOTO GALLERY 🖼️ (If uploaded by sender) */}
        {gallery.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-6">
                <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Proof we belong together</p>
                <h3 className={`font-serif-display text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
                  Evidence That We Are Cute 🖼️
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gallery.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setLightboxItem({ url: item.media_url, caption: item.caption, isVideo: item.media_type === 'video' })}
                    className="relative rounded-2xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10 group cursor-pointer aspect-4/3 bg-black/10"
                  >
                    {item.media_type === 'video' ? (
                      <video src={item.media_url} playsInline preload="metadata" className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.caption || 'Memory'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                    {item.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-left">
                        <p className="font-script text-white text-base leading-snug drop-shadow-sm">
                          {item.caption}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* 5. FUNNY MOMENTS & INSIDE JOKES 😂 (If added by sender) */}
        {funnyMoments.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-6">
                <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Inside jokes only we understand</p>
                <h3 className={`font-serif-display text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
                  Our Shared Brain Cells 😂❤️
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {funnyMoments.map((f) => (
                  <motion.div
                    key={f.id}
                    whileHover={{ y: -3 }}
                    className={`rounded-2xl p-5 border shadow-md transition-all text-left ${cfg.jokeCardBg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif-display text-base font-bold">{f.title}</h4>
                      <span className="text-xl">😜</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                      {f.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* 6. REASONS I LOVE YOU ❤️ (If added by sender) */}
        {loveReasons.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-6">
                <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Since we&apos;re here…</p>
                <h3 className={`font-serif-display text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
                  Reasons I Love You ❤️
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loveReasons.map((r) => (
                  <motion.div
                    key={r.id}
                    whileHover={{ y: -3 }}
                    className={`rounded-2xl p-5 border shadow-md transition-all text-left ${cfg.jokeCardBg}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-serif-display text-base font-bold">{r.title}</h4>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                      {r.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* 7. THE INVITATION & SIMPLIFIED DATE PICKER (4-6 options + manual enter) */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl p-6 sm:p-10 text-center border shadow-2xl transition-all relative ${cfg.inviteBg}`}
          >
            <h3 className={`font-serif-display text-3xl sm:text-4xl font-bold mb-2 tracking-tight ${cfg.titleColor}`}>
              Can I take you out?
            </h3>
            <p className={`text-sm opacity-80 mb-6 font-script text-2xl ${cfg.subColor}`}>
              Coffee? Dinner? A walk? You choose.
            </p>

            {/* 3 Response Choice Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-6">
              <button
                type="button"
                onClick={() => handleResponse('yes')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-base shadow-lg transition-all transform hover:scale-[1.02] ${
                  response === 'yes'
                    ? `${cfg.buttonPrimary} ring-2 ring-offset-2`
                    : cfg.buttonPrimary
                }`}
              >
                ❤️ YES
              </button>
              <button
                type="button"
                onClick={() => handleResponse('maybe')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-base shadow-lg transition-all transform hover:scale-[1.02] ${
                  response === 'maybe'
                    ? 'bg-amber-500 text-white ring-2 ring-amber-400 ring-offset-2'
                    : 'bg-amber-500/90 hover:bg-amber-500 text-white'
                }`}
              >
                🥺 MAYBE
              </button>
              <button
                type="button"
                onClick={() => handleResponse('no')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-base border shadow-sm transition-all transform hover:scale-[1.02] ${
                  response === 'no'
                    ? 'bg-slate-700 text-white ring-2 ring-slate-400 ring-offset-2'
                    : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                    : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                🤍 NO
              </button>
            </div>

            {/* INLINE EXPANSION: On YES (Clean 4-6 ideas + manual enter) */}
            <AnimatePresence>
              {response === 'yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-4 p-5 sm:p-6 rounded-2xl border text-left ${cfg.dateBoxBg}`}>
                    {dateConfirmed ? (
                      <div className="text-center py-4">
                        <div className="text-4xl mb-2">🎉🥂✨</div>
                        <h4 className={`font-serif-display text-2xl font-bold mb-1 ${cfg.subColor}`}>
                          It&apos;s a Date!
                        </h4>
                        <p className={`text-sm mb-4 ${isDark ? 'text-purple-200' : 'text-slate-600'}`}>
                          Your date response has been sent to him!{' '}
                          {selectedActivity && (
                            <span className={`font-bold block mt-1 ${cfg.subColor}`}>
                              Activity: {formatCustomDateIdea(selectedActivity).emoji} {formatCustomDateIdea(selectedActivity).label}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Link
                            href={profile?.role === 'sender' ? '/sender' : '/receiver'}
                            className={`px-5 py-2.5 rounded-xl ${cfg.buttonPrimary} text-xs font-semibold shadow transition inline-flex items-center justify-center gap-1.5`}
                          >
                            <span>Go to Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          {profile?.role === 'receiver' && (
                            <Link
                              href="/receiver/messages"
                              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-md backdrop-blur-md transition hover:scale-105"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => setDateConfirmed(false)}
                            className={`px-4 py-2 rounded-xl text-xs hover:underline ${cfg.subColor}`}
                          >
                            Change Date
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                            <span>🥂</span>
                            <span>Pick Our Date Activity</span>
                          </p>
                          <span className={`text-[11px] font-script text-lg ${cfg.subColor}`}>
                            She said yes! ❤️
                          </span>
                        </div>

                        {/* Simplified 4-6 Date Ideas Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                          {(() => {
                            const offeredKeys = exp?.date_options || [];
                            const dateList = offeredKeys.length > 0
                              ? offeredKeys.slice(0, 6).map((k) => {
                                  const info = formatCustomDateIdea(k);
                                  return { key: k, label: info.label, emoji: info.emoji };
                                })
                              : SIMPLE_DATE_IDEAS;

                            return dateList.map((item) => {
                              const isSelected = selectedActivity === item.key;
                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={() => setSelectedActivity(item.key)}
                                  className={`p-3 rounded-2xl text-xs font-semibold text-center transition-all flex flex-col items-center justify-center gap-1.5 border relative ${
                                    isSelected ? cfg.dateCardActive : cfg.dateCardBg
                                  }`}
                                >
                                  <span className="text-2xl">{item.emoji}</span>
                                  <span className="leading-tight">{item.label}</span>
                                </button>
                              );
                            });
                          })()}
                        </div>

                        {/* Custom Date Input */}
                        <div className="mb-4 pt-2 border-t border-black/10 dark:border-white/10">
                          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 opacity-75">
                            Or Suggest Your Own Date Idea ✨
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={customDateInput}
                              onChange={(e) => setCustomDateInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (customDateInput.trim()) {
                                    setSelectedActivity(customDateInput.trim());
                                    setCustomDateInput('');
                                  }
                                }
                              }}
                              placeholder="e.g. Stargazing on the roof 🔭, Baking together 🍪"
                              className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none border focus:ring-2 ${cfg.inputBg}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customDateInput.trim()) {
                                  setSelectedActivity(customDateInput.trim());
                                  setCustomDateInput('');
                                }
                              }}
                              disabled={!customDateInput.trim()}
                              className={`px-4 py-2.5 rounded-xl ${cfg.buttonPrimary} text-xs font-semibold disabled:opacity-40 transition shadow-xs`}
                            >
                              Pick
                            </button>
                          </div>
                        </div>

                        {selectedActivity && (
                          <div className="mb-4 p-3.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <p className={`text-xs font-semibold ${cfg.subColor}`}>
                                Chosen Date:{' '}
                                <span className="font-bold">
                                  {formatCustomDateIdea(selectedActivity).emoji} {formatCustomDateIdea(selectedActivity).label}
                                </span>
                              </p>
                              <button
                                type="button"
                                onClick={() => setSelectedActivity(null)}
                                className={`text-[11px] hover:underline ${cfg.subColor}`}
                              >
                                Clear
                              </button>
                            </div>
                            <textarea
                              value={dateNote}
                              onChange={(e) => setDateNote(e.target.value)}
                              placeholder="Add a sweet note for him (optional)..."
                              rows={2}
                              className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none border resize-none focus:ring-2 ${cfg.inputBg}`}
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDateSubmit(false)}
                            disabled={submittingDate || !selectedActivity}
                            className={`flex-1 py-2.5 px-4 rounded-xl ${cfg.buttonPrimary} font-bold text-xs shadow transition disabled:opacity-40 flex items-center justify-center gap-1.5`}
                          >
                            {submittingDate ? (
                              <span>Saving Date Request...</span>
                            ) : (
                              <span>Confirm Date Request ❤️</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setResponse(null)}
                            className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border transition ${
                              isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Back
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* INLINE EXPANSION: On MAYBE */}
              {response === 'maybe' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-4 p-5 sm:p-6 rounded-2xl border text-left ${
                    isDark
                      ? 'bg-amber-950/50 border-amber-400/30 text-white'
                      : 'bg-amber-50/80 border-amber-200 text-slate-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🥺❤️</span>
                      <h4 className="font-serif-display text-xl font-bold text-amber-500">
                        That&apos;s completely okay
                      </h4>
                    </div>
                    <p className={`text-xs sm:text-sm mb-3 leading-relaxed ${isDark ? 'text-amber-200/90' : 'text-slate-600'}`}>
                      Take all the time you need, pookie. There is zero pressure. You don&apos;t have to decide right now.
                    </p>
                    <textarea
                      value={dateNote}
                      onChange={(e) => setDateNote(e.target.value)}
                      placeholder="Leave a reassuring note for him (optional)..."
                      rows={2}
                      className={`w-full px-3 py-2 rounded-xl text-xs outline-none border resize-none mb-3 focus:ring-2 focus:ring-amber-400 ${
                        isDark ? 'bg-white/10 border-white/20 text-white placeholder-white/40' : 'bg-white border-amber-200 text-slate-800'
                      }`}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (dateNote && exp) {
                            await supabase.from('responses').insert({
                              experience_id: exp.id,
                              response: 'maybe',
                              note: dateNote,
                            });
                          }
                          toast({ title: 'Note saved ❤️', description: 'Thank you for your honesty.' });
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow transition"
                      >
                        Save Note
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponse(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-amber-300 text-amber-600 hover:bg-amber-100 transition"
                      >
                        Change Response
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* INLINE EXPANSION: On NO */}
              {response === 'no' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-4 p-5 sm:p-6 rounded-2xl border text-left ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🤍</span>
                      <h4 className="font-serif-display text-xl font-bold text-slate-400">
                        I understand completely
                      </h4>
                    </div>
                    <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Thank you for reading everything. I genuinely mean the apology and wanted to make you smile. Take care of yourself.
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setResponse(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white shadow transition"
                      >
                        Change Response
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Lightbox Viewer (when clicked on any memory or gallery item) */}
        <AnimatePresence>
          {lightboxItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxItem(null)}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-rose-300 transition p-2 rounded-full bg-white/10"
                onClick={() => setLightboxItem(null)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              {lightboxItem.isVideo ? (
                <video
                  src={lightboxItem.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[80vh] rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  src={lightboxItem.url}
                  alt={lightboxItem.caption || 'Enlarged photo'}
                  className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {lightboxItem.caption && (
                <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-script text-white text-lg sm:text-xl text-center px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full max-w-[90vw]">
                  {lightboxItem.caption}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer with easter egg heart */}
        <Footer
          isDark={isDark}
          accentColor={cfg.accent}
          tagline="Made with love, for you"
          onHeartClick={handleHeartClick}
          className="mt-8"
        />
      </div>
    </div>
  );
}
