'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Star, X, Coffee, Utensils, Film, Moon, Car, Eye,
  Volume2, VolumeX, Play, Pause, ChevronDown, Lock, ArrowLeft, ArrowRight, MessageCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Experience, Memory, FunnyMoment, LoveReason, GalleryItem, ResponseStatus, ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';
import { GoogleButton } from '@/components/auth/google-button';
import { Footer } from '@/components/footer';
import { isVideoUrl } from '@/lib/utils';
import { ExhibitConfessions } from '@/components/experience/exhibit-confessions';
import { PolaroidsTimeline } from '@/components/experience/polaroids-timeline';
import { CertifiedNonsense } from '@/components/experience/certified-nonsense';
import { LoveReasonsCards } from '@/components/experience/love-reasons-cards';
import { InteractiveLoveMeter } from '@/components/experience/interactive-love-meter';
import { PlayfulInvitation } from '@/components/experience/playful-invitation';

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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [opened, setOpened] = useState(false);
  const [response, setResponse] = useState<ResponseStatus | null>(null);
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [dateNote, setDateNote] = useState('');
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [loveMeterValue, setLoveMeterValue] = useState(0);
  const [loveMeterCalculating, setLoveMeterCalculating] = useState(false);
  const [loveMeterDone, setLoveMeterDone] = useState(false);
  const [gameAnswer, setGameAnswer] = useState<string | null>(null);
  const [heartClicks, setHeartClicks] = useState(0);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

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

      const [memRes, funnyRes, loveRes, galleryRes] = await Promise.all([
        supabase.from('memories').select('*').eq('experience_id', expData.id).order('sort_order'),
        supabase.from('funny_moments').select('*').eq('experience_id', expData.id).order('sort_order'),
        supabase.from('love_reasons').select('*').eq('experience_id', expData.id).order('sort_order'),
        supabase.from('gallery_items').select('*').eq('experience_id', expData.id).order('sort_order'),
      ]);

      if (!isMounted) return;

      setMemories((memRes.data as Memory[]) || []);
      setFunnyMoments((funnyRes.data as FunnyMoment[]) || []);
      setLoveReasons((loveRes.data as LoveReason[]) || []);
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
    const respText = resp === 'yes' ? 'YES 😭❤️' : resp === 'maybe' ? 'MAYBE' : 'NO';
    await supabase.from('notifications').insert({
      user_id: exp.sender_id,
      type: 'response',
      title: `${exp.receiver_name || 'Your pookie'} said ${respText}!`,
      body: resp === 'yes' ? 'She said yes!' : resp === 'maybe' ? 'She needs some time.' : 'She said no. Respect her decision.',
      experience_id: exp.id,
    });

    if (resp === 'yes') {
      setTimeout(() => setShowDateSelection(true), 2000);
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
      }

      toast({
        title: skip ? 'Response confirmed! ❤️' : 'Date request sent! ❤️',
        description: 'Redirecting to your dashboard...',
      });
      setRedirecting(true);
      setTimeout(() => {
        router.push(profile?.role === 'sender' ? '/sender' : '/receiver');
      }, 1500);
    } catch {
      router.push(profile?.role === 'sender' ? '/sender' : '/receiver');
    } finally {
      setSubmittingDate(false);
    }
  };

  const calculateLove = () => {
    setLoveMeterCalculating(true);
    const values = [10, 27, 54, 89, 100];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < values.length) {
        setLoveMeterValue(values[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setLoveMeterValue(0);
          setLoveMeterCalculating(false);
          setLoveMeterDone(true);
        }, 500);
      }
    }, 400);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] via-[#2d1b4e] to-[#1a1a2e] px-4 relative overflow-hidden">
        {/* Floating hearts */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-rose-300/20"
              initial={{ y: '100vh', x: `${10 + i * 9}%`, opacity: 0 }}
              animate={{ y: '-10vh', opacity: [0, 0.4, 0] }}
              transition={{ duration: 7 + i, repeat: Infinity, delay: i * 0.4 }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-lg relative z-10 w-full"
        >
          {/* Glowing locked envelope */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative mx-auto mb-8 w-32 h-24"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-lavender-400 rounded-2xl shadow-2xl shadow-rose-500/40" />
            <div className="absolute top-0 left-0 right-0 h-0 border-l-[64px] border-r-[64px] border-b-[40px] border-l-transparent border-r-transparent border-b-rose-300/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/95 shadow-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-rose-500" />
              </div>
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Private Love Letter
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
            For {exp?.receiver_name || 'My Pookie'} ❤️
          </h1>

          {exp?.receiver_nickname && (
            <p className="font-handwritten text-2xl text-rose-300/90 mb-3">
              &ldquo;To my {exp.receiver_nickname}&rdquo;
            </p>
          )}

          <p className="text-white/70 mb-2 font-body text-base">
            {exp?.sender_name ? `${exp.sender_name} made a secret love story just for you.` : 'Someone made a secret love story just for you.'}
          </p>

          <p className="text-white/50 text-sm mb-8 font-body max-w-md mx-auto">
            This letter is private & protected. Please log in or create an account to unlock your love letter, view memories, and reply in private chat.
          </p>

          {/* Auth Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Link
              href={`/login?redirect=/love/${tokenStr}`}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-xl hover:shadow-rose-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
            >
              <Heart className="w-4 h-4 fill-current" /> Log in to Unlock
            </Link>
            <Link
              href={`/signup?redirect=/love/${tokenStr}&name=${encodeURIComponent(exp?.receiver_name || '')}&role=receiver`}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium backdrop-blur-md transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
            >
              Sign Up 💖
            </Link>
          </div>

          {/* Quick Google Unlock */}
          <div className="mt-3 max-w-sm mx-auto">
            <GoogleButton
              redirectUrl={`/love/${tokenStr}`}
              role="receiver"
              text="Unlock with Google"
            />
          </div>

          <p className="text-white/40 text-xs mt-6">
            🔒 Only authorized accounts can view this love letter.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!opened) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] via-[#2d1b4e] to-[#1a1a2e] px-4 relative">
        {/* Floating top navigation if logged in */}
        {user && (
          <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
            <Link
              href={profile?.role === 'sender' ? '/sender' : '/receiver'}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium shadow-md backdrop-blur-md border border-white/20 transition hover:scale-105"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{profile?.role === 'sender' ? 'Sender Dashboard' : 'Receiver Dashboard'}</span>
            </Link>
          </div>
        )}

        {/* Floating hearts */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-rose-300/20"
              initial={{ y: '100vh', x: `${10 + i * 12}%`, opacity: 0 }}
              animate={{ y: '-10vh', opacity: [0, 0.4, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.5 }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-lg"
        >
          {/* Animated envelope */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative mx-auto mb-8"
          >
            <div className="w-32 h-24 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-lavender-400 rounded-lg shadow-2xl shadow-rose-500/30" />
              <div className="absolute top-0 left-0 right-0 h-0 border-l-[64px] border-r-[64px] border-b-[40px] border-l-transparent border-r-transparent border-b-rose-300/80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white fill-white/30" />
              </div>
            </div>
          </motion.div>

          <h1 className="font-display text-3xl md:text-4xl text-white mb-3">
            Pookie… I made something for you.
          </h1>
          <p className="text-white/60 mb-8 font-body">
            Please give me 2 minutes. No pressure. Just me trying to say what I couldn't properly say.
          </p>

          <button
            onClick={handleOpen}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-rose-400 to-lavender-400 text-white text-lg font-medium hover:shadow-2xl hover:shadow-rose-500/40 transition-all hover:scale-105"
          >
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Open it? 💌
          </button>
        </motion.div>

        {exp?.music_url && <audio ref={audioRef} src={exp.music_url} loop />}
      </div>
    );
  }

  const theme = exp?.theme || 'pink-dream';
  const themeConfig = THEME_CONFIG[theme];
  const isDark = theme === 'lavender-night' || theme === 'starry-romance';
  const bgColor = isDark ? 'text-white' : 'text-rose-700';
  const subColor = isDark ? 'text-white/60' : 'text-rose-400/70';

  const dateOptions = [
    { key: 'coffee', label: 'Coffee', icon: Coffee },
    { key: 'dinner', label: 'Dinner', icon: Utensils },
    { key: 'movie', label: 'Movie', icon: Film },
    { key: 'walk', label: 'Walk', icon: Moon },
    { key: 'drive', label: 'Long Drive', icon: Car },
    { key: 'surprise', label: 'Surprise me', icon: Sparkles },
  ];

  return (
    <div className={`min-h-screen ${isDark ? `bg-gradient-to-b ${themeConfig.gradient}` : 'bg-gradient-to-b from-[#fff6ef] via-[#ffeaf0] to-[#f4e8fd]'} ${bgColor} relative selection:bg-rose-200 selection:text-rose-900`}>
      {exp?.music_url && <audio ref={audioRef} src={exp.music_url} loop />}

      {/* Floating navigation to dashboard & chat */}
      {user && (
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

      {/* Floating 3D pastel hearts & golden stars background */}
      {!reduceMotion && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute select-none"
              initial={{ y: '105vh', x: `${(i * 7 + 4) % 100}%`, opacity: 0, scale: 0.6 }}
              animate={{
                y: '-10vh',
                opacity: [0, 0.5, 0.7, 0.3, 0],
                scale: [0.6, 1, 0.85],
              }}
              transition={{ duration: 10 + (i % 5) * 3, repeat: Infinity, delay: i * 0.9 }}
            >
              {i % 4 === 0 ? (
                <span className="text-pink-400/50 text-xl">💖</span>
              ) : i % 4 === 1 ? (
                <span className="text-purple-300/50 text-lg">💜</span>
              ) : i % 4 === 2 ? (
                <span className="text-amber-300/60 text-base">✨</span>
              ) : (
                <span className="text-rose-300/50 text-sm">🤍</span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Content sections */}
      <div className="relative z-10">
        {/* Personalized Intro */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center">
            <p className={`font-handwritten text-3xl sm:text-4xl ${subColor} mb-2`}>Hey,</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-[#3d2730]">
              {exp?.receiver_name || 'Pookie'} ❤️
            </h1>
            <p className={`font-body text-base sm:text-lg ${subColor} mb-8`}>Before anything else…</p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-rose-600 mb-4"
            >
              I'm sorry.
            </motion.h2>
            <p className={`font-body text-base sm:text-lg ${subColor} max-w-xl mx-auto`}>
              Not the casual &ldquo;sorry yaar&rdquo; kind. The real one.
            </p>
          </motion.div>
        </Section>

        {/* Apology Letter */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#3d2730] mb-6 text-center">
              Things I should have said properly…
            </h2>
            <div className={`rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto shadow-lg shadow-rose-200/20 border border-white/90 ${isDark ? 'bg-white/5 text-white' : 'bg-white/80 backdrop-blur-md text-[#4a2e39]'}`}>
              <p className="font-serif text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap text-center">
                {exp?.apology_message || '[Your apology message will appear here.]'}
              </p>
            </div>
          </motion.div>
        </Section>

        {/* Exhibit A: My Stupid Behaviour (Image 1 reference) */}
        <Section>
          <ExhibitConfessions
            relationship={exp?.relationship}
            senderName={exp?.sender_name}
            accentColor={themeConfig.accent}
          />
        </Section>

        {/* Us, in Polaroids (Image 2 reference) */}
        <Section>
          <PolaroidsTimeline
            memories={memories}
            accentColor={themeConfig.accent}
            subColor={subColor}
          />
        </Section>

        {/* Gallery */}
        {gallery.length > 0 && (
          <Section>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: themeConfig.accent }}>
                Evidence that we are actually cute together.
              </h2>
              <p className={`font-body text-sm ${subColor} mb-8`}>Click any photo to see it bigger.</p>

              <div className="columns-2 md:columns-3 gap-4 max-w-4xl mx-auto">
                {gallery.map((item, i) => {
                  const isVideo = item.media_type === 'video' || isVideoUrl(item.media_url);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 6) * 0.05 }}
                      className="mb-4 break-inside-avoid cursor-pointer group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                      onClick={() => setLightboxIdx(i)}
                    >
                      {item.media_url ? (
                        isVideo ? (
                          <div className="relative w-full rounded-xl overflow-hidden bg-black/10">
                            <video
                              src={item.media_url}
                              playsInline
                              muted
                              preload="metadata"
                              className="w-full rounded-xl object-cover max-h-72 group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                              <Film className="w-3 h-3 text-rose-300" />
                              <span>Snap</span>
                            </div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                <Play className="w-4 h-4 text-rose-500 fill-rose-500 ml-0.5" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.media_url}
                            alt={item.caption || 'Memory photo'}
                            loading="lazy"
                            className="w-full rounded-xl object-cover group-hover:opacity-95 group-hover:scale-105 transition duration-300"
                          />
                        )
                      ) : (
                        <div className="w-full h-32 rounded-xl bg-rose-100 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-rose-300" />
                        </div>
                      )}
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
                          <p className="font-handwritten text-white text-base sm:text-lg drop-shadow">{item.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </Section>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIdx !== null && gallery[lightboxIdx] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIdx(null)}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-rose-300 transition p-2 rounded-full bg-white/10"
                onClick={() => setLightboxIdx(null)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              {gallery[lightboxIdx].media_type === 'video' || isVideoUrl(gallery[lightboxIdx].media_url) ? (
                <video
                  src={gallery[lightboxIdx].media_url}
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
                  src={gallery[lightboxIdx].media_url}
                  alt={gallery[lightboxIdx].caption}
                  className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {gallery[lightboxIdx].caption && (
                <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-handwritten text-white text-lg sm:text-xl text-center px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full max-w-[90vw]">
                  {gallery[lightboxIdx].caption}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certified Nonsense (Image 3 reference) */}
        <Section>
          <CertifiedNonsense
            funnyMoments={funnyMoments}
            accentColor={themeConfig.accent}
            subColor={subColor}
          />
        </Section>

        {/* Things I Love About You (Image 4 reference) */}
        <Section>
          <LoveReasonsCards
            loveReasons={loveReasons}
            accentColor={themeConfig.accent}
            subColor={subColor}
          />
        </Section>

        {/* Official Love Meter (Image 5 reference) */}
        <Section>
          <InteractiveLoveMeter
            accentColor={themeConfig.accent}
            subColor={subColor}
          />
        </Section>

        {/* Mini Game */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6" style={{ color: themeConfig.accent }}>
              Quick question…
            </h2>
            <p className={`text-lg ${subColor} mb-6`}>Who is the cutest person in this relationship?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              {[
                { label: 'Me 😎', value: 'me' },
                { label: 'You 🥺', value: 'you' },
                { label: 'Obviously you 🙄❤️', value: 'obviously-you' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGameAnswer(opt.value)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${
                    gameAnswer === opt.value
                      ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-lg'
                      : `glass ${isDark ? 'bg-white/5' : ''} ${subColor} hover:shadow-md`
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {gameAnswer && gameAnswer !== 'obviously-you' && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-lg font-handwritten" style={{ color: themeConfig.accent }}>
                  Incorrect answer 😂
                </motion.p>
              )}
              {gameAnswer === 'obviously-you' && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-lg font-handwritten" style={{ color: themeConfig.accent }}>
                  Correct! ❤️
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </Section>

        {/* Rewind Section */}
        <Section dark>
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] -mx-4 px-4 py-20 md:py-32 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <motion.h2
                initial={{ x: 100 }}
                whileInView={{ x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="font-display text-3xl md:text-5xl font-bold text-white mb-8"
              >
                If I could go back…
              </motion.h2>
              <div className="space-y-4 max-w-lg mx-auto">
                {[
                  "I'd go back…",
                  "To that moment…",
                  "And choose my words more carefully.",
                  "I can't change what happened.",
                  "But I can choose what I do next.",
                ].map((text, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.3 }}
                    className="font-serif-body text-xl md:text-2xl text-white/80"
                  >
                    {text}
                  </motion.p>
                ))}
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                  className="font-display text-3xl md:text-4xl font-bold text-rose-400 pt-4"
                >
                  And I choose to do better.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* Final Love Letter */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className={`font-handwritten text-2xl ${subColor} mb-2`}>One last thing…</p>
            <div className={`glass ${isDark ? 'bg-white/5' : ''} rounded-2xl p-6 md:p-10 max-w-2xl mx-auto`}>
              <p className="font-serif-body text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-center" style={{ color: isDark ? '#fff' : '#9d3d5c' }}>
                {exp?.final_letter || '[Your final love letter will appear here.]'}
              </p>
            </div>
          </motion.div>
        </Section>

        {/* Playful Invitation (Runaway NO & Celebratory YES) */}
        <Section>
          <PlayfulInvitation
            receiverName={exp?.receiver_name}
            senderName={exp?.sender_name}
            onResponse={handleResponse}
            response={response}
            onDoneReading={user ? () => router.push(profile?.role === 'sender' ? '/sender' : '/receiver') : undefined}
          />
        </Section>

        {/* Response screens */}
        <AnimatePresence>
          {response === 'yes' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-rose-100/95 to-lavender-100/95 backdrop-blur-md p-4 overflow-y-auto"
            >
              {/* Confetti hearts */}
              {!reduceMotion && [...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  initial={{ y: -100, x: `${Math.random() * 100}%`, rotate: 0, opacity: 1 }}
                  animate={{ y: '100vh', rotate: 360, opacity: [1, 1, 0] }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                >
                  {i % 3 === 0 ? <Heart className="w-6 h-6 fill-rose-400 text-rose-400" /> :
                   i % 3 === 1 ? <Sparkles className="w-5 h-5 text-amber-400" /> :
                   <Star className="w-5 h-5 fill-amber-300 text-amber-300" />}
                </motion.div>
              ))}
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center max-w-md w-full relative z-10 py-6">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-rose-600 mb-2">
                  SHE SAID YES 😭❤️
                </h1>
                <p className="text-rose-400 text-sm mb-4">The best answer ever.</p>

                {showDateSelection ? (
                  <div className="glass rounded-3xl p-6 shadow-2xl border border-rose-100/80 bg-white/85">
                    <h3 className="font-display text-xl font-semibold text-rose-700 mb-1">Our date?</h3>
                    <p className="text-xs text-rose-400/80 mb-4">Pick an activity or continue straight to your dashboard.</p>

                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      {(() => {
                        const matched = dateOptions.filter((o) => exp?.date_options?.includes(o.key));
                        const opts = (matched.length > 0) ? matched : dateOptions;
                        return opts.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setSelectedActivity(opt.key)}
                            className={`p-3 rounded-2xl transition-all border text-center ${
                              selectedActivity === opt.key
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md border-transparent scale-105'
                                : 'bg-white/80 text-rose-600 hover:bg-rose-50 border-rose-100'
                            }`}
                          >
                            <opt.icon className="w-5 h-5 mx-auto mb-1" />
                            <p className="text-xs font-medium truncate">{opt.label}</p>
                          </button>
                        ));
                      })()}
                    </div>

                    {selectedActivity && (
                      <textarea
                        value={dateNote}
                        onChange={(e) => setDateNote(e.target.value)}
                        placeholder="Add a sweet note or time (optional)..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 outline-none text-rose-700 text-xs mb-3 resize-none focus:ring-2 focus:ring-rose-300"
                      />
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => handleDateSubmit(false)}
                        disabled={submittingDate || redirecting}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:shadow-lg transition disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
                      >
                        {submittingDate ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : redirecting ? (
                          <span>Redirecting to Dashboard... ❤️</span>
                        ) : (
                          <span>Send Date Request ❤️</span>
                        )}
                      </button>

                      <button
                        onClick={() => handleDateSubmit(true)}
                        disabled={submittingDate || redirecting}
                        className="py-3 px-4 rounded-xl bg-white/90 text-rose-600 font-medium hover:bg-white text-xs border border-rose-200/70 shadow-sm transition flex items-center justify-center gap-1"
                      >
                        <span>Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-rose-500 font-body animate-pulse">Give me a second to celebrate… 🥳</p>
                )}
              </motion.div>
            </motion.div>
          )}

          {response === 'maybe' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-amber-50/95 to-orange-50/95 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="text-center max-w-md w-full bg-white/90 p-8 rounded-3xl shadow-xl border border-amber-100">
                <Heart className="w-16 h-16 text-amber-400 mx-auto mb-4 fill-amber-300/30" />
                <h1 className="font-display text-3xl font-bold text-amber-600 mb-2">That's okay ❤️</h1>
                <p className="font-body text-base text-amber-700/80 mb-1">Take your time, pookie.</p>
                <p className="font-body text-xs text-amber-600/70 mb-4">You don't have to decide right now. Your feelings are respected.</p>
                <textarea
                  value={dateNote}
                  onChange={(e) => setDateNote(e.target.value)}
                  placeholder="Leave a note for him (optional)..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 outline-none text-amber-800 text-xs resize-none mb-4"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={async () => {
                      if (dateNote && exp) {
                        await supabase.from('responses').insert({
                          experience_id: exp.id,
                          response: 'maybe',
                          note: dateNote,
                        });
                      }
                      toast({ title: 'Response saved ❤️', description: 'Redirecting to your dashboard...' });
                      router.push(profile?.role === 'sender' ? '/sender' : '/receiver');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-medium hover:shadow-lg transition text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Save & Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {response === 'no' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-gray-50/95 to-rose-50/95 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="text-center max-w-md w-full bg-white/90 p-8 rounded-3xl shadow-xl border border-gray-100">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4 fill-gray-300/30" />
                <h1 className="font-display text-3xl font-bold text-gray-600 mb-2">I understand ❤️</h1>
                <p className="font-body text-base text-gray-600 mb-1">Thank you for reading everything.</p>
                <p className="font-body text-xs text-gray-400 mb-6">I won't pressure you. Take good care of yourself.</p>
                <button
                  onClick={() => router.push(profile?.role === 'sender' ? '/sender' : '/receiver')}
                  className="py-3 px-6 rounded-xl bg-gray-700 text-white font-medium hover:bg-gray-800 transition text-xs inline-flex items-center gap-1.5"
                >
                  <span>Go to Receiver Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer with easter egg heart */}
        <Footer
          isDark={isDark}
          accentColor={themeConfig.accent}
          tagline="Made with love, for you"
          onHeartClick={handleHeartClick}
          className="mt-12"
        />
      </div>
    </div>
  );
}

function Section({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`min-h-[60vh] flex items-center justify-center px-4 py-16 md:py-24 ${dark ? '' : ''}`}>
      <div className="w-full max-w-4xl">{children}</div>
    </section>
  );
}
