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
import { ParchmentLetter } from '@/components/experience/parchment-letter';
import { InteractiveEnvelope } from '@/components/experience/interactive-envelope';
import { FloatingReactions } from '@/components/experience/floating-reactions';
import { PRESET_DATE_IDEAS, DATE_CATEGORIES, formatCustomDateIdea } from '@/lib/date-ideas';
import { GlossyHeart } from '@/components/experience/glossy-heart';
import { FloatingAmbientHearts } from '@/components/experience/floating-ambient-hearts';

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
  const [customDateInput, setCustomDateInput] = useState('');
  const [dateCategory, setDateCategory] = useState<string>('all');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fbf2fc] via-[#faebf7] to-[#fff5ea] px-4 relative overflow-hidden">
        {/* Floating hearts */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ y: '105vh', x: `${8 + i * 9}%`, opacity: 0 }}
              animate={{ y: '-10vh', opacity: [0, 0.35, 0] }}
              transition={{ duration: 7 + i, repeat: Infinity, delay: i * 0.4 }}
            >
              <GlossyHeart size={18 + (i % 3) * 6} glow={false} className="opacity-30" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md relative z-10 w-full p-8 rounded-3xl bg-white/85 backdrop-blur-md shadow-2xl border border-white/90"
        >
          {/* Glowing locked envelope with 3D heart */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative mx-auto mb-6 w-28 h-20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-pink-200 to-purple-200 rounded-2xl shadow-xl shadow-rose-200/50" />
            <div className="absolute top-0 left-0 right-0 h-0 border-l-[56px] border-r-[56px] border-b-[36px] border-l-transparent border-r-transparent border-b-rose-100/90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                <Lock className="w-5 h-5 text-rose-500" />
              </div>
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Private Love Letter
          </div>

          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#3f1d2e] mb-2 tracking-tight">
            For {exp?.receiver_name || 'My Pookie'} ❤️
          </h1>

          {exp?.receiver_nickname && (
            <p className="font-handwritten text-2xl text-rose-600 mb-2">
              &ldquo;To my {exp.receiver_nickname}&rdquo;
            </p>
          )}

          <p className="text-[#3f1d2e]/80 mb-2 font-body text-sm leading-relaxed">
            {exp?.sender_name ? `${exp.sender_name} made a secret love story just for you.` : 'Someone made a secret love story just for you.'}
          </p>

          <p className="text-[#8f6479] text-xs mb-6 font-body leading-relaxed">
            This letter is private & protected. Please log in or create an account to unlock your love letter, view memories, and reply in private chat.
          </p>

          {/* Auth Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/login?redirect=/love/${tokenStr}`}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-xs"
            >
              <Heart className="w-4 h-4 fill-current" /> Log in to Unlock
            </Link>
            <Link
              href={`/signup?redirect=/love/${tokenStr}&name=${encodeURIComponent(exp?.receiver_name || '')}&role=receiver`}
              className="flex-1 py-3 px-5 rounded-2xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 text-xs shadow-2xs"
            >
              Sign Up 💖
            </Link>
          </div>

          <div className="mt-4">
            <GoogleButton
              redirectUrl={`/love/${tokenStr}`}
              role="receiver"
              text="Unlock with Google"
            />
          </div>

          <p className="text-[#8f6479]/70 text-[11px] mt-4">
            🔒 Only authorized accounts can view this love letter.
          </p>
        </motion.div>
      </div>
    );
  }

  const theme = (exp?.theme as ExperienceTheme) || 'pink-dream';
  const cfg = THEME_CONFIG[theme] || THEME_CONFIG['pink-dream'];
  const isDark = theme === 'lavender-night' || theme === 'starry-romance';
  const themeConfig = cfg;
  const subColor = cfg.subColor;

  if (!opened) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${cfg.unopenedBg} px-4 relative overflow-hidden`}>
        {/* Floating top navigation if logged in */}
        {user && (
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

  const dateOptions = [
    { key: 'coffee', label: 'Coffee', icon: Coffee },
    { key: 'dinner', label: 'Dinner', icon: Utensils },
    { key: 'movie', label: 'Movie', icon: Film },
    { key: 'walk', label: 'Walk', icon: Moon },
    { key: 'drive', label: 'Long Drive', icon: Car },
    { key: 'surprise', label: 'Surprise me', icon: Sparkles },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.openedBg} ${cfg.textColor} relative`}>
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

      {/* Continuous background floating 3D hearts & dreamy romantic particles */}
      <FloatingAmbientHearts theme={theme} />

      {/* Floating Reaction Dock */}
      <FloatingReactions isDark={isDark} />

      {/* Content sections */}
      <div className="relative z-10">
        {/* Primary Love / Apology Letter in Realistic Parchment Stationery */}
        <Section>
          <ParchmentLetter
            title={exp?.apology_message ? 'Things I should have said properly…' : 'A Letter From My Heart…'}
            senderName={exp?.sender_name}
            receiverName={exp?.receiver_name}
            content={exp?.apology_message || exp?.love_letter || exp?.final_letter || "I'm sorry. Not the casual sorry yaar kind. The real one. You mean the world to me."}
            secretNote={exp?.final_letter || "P.S. You mean the world to me. Whatever your answer is, I just want you to smile today. Take all the time you need. ❤️"}
            isDark={isDark}
            accentColor={cfg.accent}
          />
        </Section>

        {/* Funny Boyfriend Court */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className={`font-handwritten text-2xl sm:text-3xl ${cfg.subColor} mb-2 text-center`}>A completely unbiased investigation…</p>
            <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center tracking-tight ${cfg.titleColor}`}>
              THE PEOPLE VS. {exp?.sender_name?.toUpperCase() || '[SENDER]'}
            </h2>
            <div className={`rounded-3xl p-6 md:p-8 max-w-xl mx-auto shadow-xl border ${
              isDark ? 'bg-[#181126]/90 border-purple-400/30' : 'bg-white/90 border-rose-100'
            }`}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: cfg.accent }}>CHARGES:</p>
              <div className="space-y-2 mb-6">
                {['Being stupid', 'Saying the wrong thing', 'Making pookie angry', 'Having zero brain cells'].map((charge, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-purple-500/20' : 'border-rose-100'}`}
                  >
                    <span className="text-base sm:text-lg">{charge}</span>
                    <span className="text-xl sm:text-2xl">✅</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-base sm:text-lg font-semibold">Loving pookie 1000%</span>
                  <span className="text-xl sm:text-2xl">❤️</span>
                </motion.div>
              </div>
              <div className="text-center space-y-2 pt-2 border-t border-rose-200/30">
                <p className="text-2xl font-bold" style={{ color: cfg.accent }}>VERDICT: GUILTY.</p>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: cfg.accent }}>PUNISHMENT:</p>
                <div className={`space-y-1.5 text-sm sm:text-base ${isDark ? 'text-purple-200/90' : 'text-slate-700'}`}>
                  <p>Must apologize properly</p>
                  <p>Must bring snacks 🍫</p>
                  <p>Must listen without arguing</p>
                  <p>Must give unlimited hugs <span className="text-xs italic">(if she wants them)</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* Memory Timeline */}
        {memories.length > 0 && (
          <Section>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
              <p className={`font-handwritten text-2xl sm:text-3xl ${cfg.subColor} mb-2`}>But then I remembered something…</p>
              <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight ${cfg.titleColor}`}>
                Before this stupid little fight,
              </h2>
              <p className={`font-body text-base sm:text-lg ${cfg.subColor} mb-12`}>there was an entire story called us.</p>
              <div className="max-w-2xl mx-auto space-y-8">
                {memories.map((mem, i) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, y: 50, rotate: i % 2 === 0 ? -3 : 3 }}
                    whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -2 : 2 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ scale: 1.03, rotate: 0 }}
                    onDoubleClick={() => {
                      setEasterEgg('Certified couple moment ❤️');
                      setTimeout(() => setEasterEgg(null), 3000);
                    }}
                    className="relative bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-rose-100/60 mx-auto max-w-sm text-left"
                  >
                    {/* Tape sticker */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-rose-200/60 rounded-sm rotate-2" />
                    {mem.media_url && (
                      <div className="w-full h-48 rounded-xl overflow-hidden mb-3 bg-rose-50">
                        {mem.media_type === 'video' || isVideoUrl(mem.media_url) ? (
                          <video src={mem.media_url} controls playsInline preload="metadata" className="w-full h-full object-cover" />
                        ) : (
                          <img src={mem.media_url} alt={mem.title} className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                    )}
                    <h3 className="font-serif-display text-lg font-bold text-rose-900 mb-1">{mem.title}</h3>
                    {mem.date && <p className="text-xs text-rose-400 font-mono">{mem.date}{mem.location ? ` · ${mem.location}` : ''}</p>}
                    {mem.caption && <p className="font-handwritten text-lg text-rose-600 mt-2">{mem.caption}</p>}
                    <div className="absolute bottom-2 right-2 text-rose-300/40">
                      <Heart className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <Section>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
              <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight ${cfg.titleColor}`}>
                Evidence that we are actually cute together.
              </h2>
              <p className={`font-body text-sm sm:text-base ${cfg.subColor} mb-8`}>Click any photo to see it bigger.</p>

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

        {/* Funny Moments */}
        {funnyMoments.length > 0 && (
          <Section>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
              <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight ${cfg.titleColor}`}>
                Our shared brain cell collection 🧠❤️
              </h2>
              <p className={`font-body text-sm sm:text-base ${cfg.subColor} mb-8`}>Inside jokes that only we get.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {funnyMoments.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl p-5 border text-left shadow-md transition-all ${
                      isDark
                        ? 'bg-[#181126]/90 border-purple-400/30 text-white'
                        : 'bg-white/90 border-rose-100 text-slate-800'
                    }`}
                  >
                    {f.image_url && (
                      isVideoUrl(f.image_url) ? (
                        <video
                          src={f.image_url}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-44 rounded-xl object-cover mb-3"
                        />
                      ) : (
                        <img src={f.image_url} alt={f.title} className="w-full h-36 rounded-xl object-cover mb-3" loading="lazy" />
                      )
                    )}
                    <h3 className={`font-serif-display text-lg font-bold mb-1 ${isDark ? 'text-purple-200' : 'text-rose-900'}`}>{f.title}</h3>
                    <p className={`text-sm ${isDark ? 'text-purple-100/80' : 'text-slate-600'}`}>{f.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Section>
        )}

        {/* Things I Love About You */}
        {loveReasons.length > 0 && (
          <Section>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
              <p className={`font-handwritten text-2xl sm:text-3xl ${cfg.subColor} mb-2`}>Since we're here…</p>
              <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-8 tracking-tight ${cfg.titleColor}`}>
                Let me remind you.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {loveReasons.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className={`rounded-2xl p-5 text-left relative border shadow-md transition-all ${
                      isDark
                        ? 'bg-[#181126]/90 border-purple-400/30 text-white'
                        : 'bg-white/90 border-rose-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-serif-display text-lg font-bold ${isDark ? 'text-purple-200' : 'text-rose-900'}`}>{r.title}</h3>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    {r.image_url && (
                      isVideoUrl(r.image_url) ? (
                        <video
                          src={r.image_url}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-36 rounded-xl object-cover mb-3"
                        />
                      ) : (
                        <img
                          src={r.image_url}
                          alt={r.title}
                          className="w-full h-36 rounded-xl object-cover mb-3"
                          loading="lazy"
                        />
                      )
                    )}
                    <p className={`text-sm ${isDark ? 'text-purple-100/80' : 'text-slate-600'} leading-relaxed`}>{r.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Section>
        )}

        {/* Love Meter */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-8 tracking-tight ${cfg.titleColor}`}>
              How much do I love you?
            </h2>
            <div className={`rounded-3xl p-6 sm:p-8 max-w-md mx-auto border shadow-xl ${
              isDark ? 'bg-[#181126]/90 border-purple-400/30' : 'bg-white/90 border-rose-100'
            }`}>
              {!loveMeterDone ? (
                <>
                  <div className="text-5xl sm:text-6xl font-bold mb-4 font-serif-display text-rose-500">
                    {loveMeterValue}% ❤️
                  </div>
                  <div className="w-full h-3.5 bg-rose-100/50 rounded-full overflow-hidden mb-5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                      animate={{ width: `${loveMeterValue}%` }}
                    />
                  </div>
                  {!loveMeterCalculating && loveMeterValue === 0 && (
                    <button
                      onClick={calculateLove}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-xs shadow-md hover:shadow-lg transition"
                    >
                      Calculate My Love ✨
                    </button>
                  )}
                  {loveMeterCalculating && (
                    <p className="text-xs text-rose-400 animate-pulse font-medium">Calculating infinite love…</p>
                  )}
                </>
              ) : (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <motion.p
                    animate={{ x: [0, -2, 2, 0] }}
                    transition={{ duration: 0.3, repeat: 3 }}
                    className="text-sm font-bold text-rose-500 mb-1"
                  >
                    LOVE LIMIT EXCEEDED
                  </motion.p>
                  <p className="text-lg font-serif-display font-semibold mb-3" style={{ color: cfg.accent }}>
                    Cannot be measured in numbers.
                  </p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="text-6xl font-bold font-serif-display text-rose-500"
                  >
                    ∞ ❤️
                  </motion.p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </Section>

        {/* Mini Game */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className={`font-serif-display text-2xl sm:text-3xl font-bold mb-4 ${cfg.titleColor}`}>
              Quick question…
            </h2>
            <p className={`text-base sm:text-lg ${cfg.subColor} mb-6`}>Who is the cutest person in this relationship?</p>
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
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                      : isDark
                        ? 'bg-[#181126]/80 text-purple-200 border border-purple-500/20 hover:bg-[#181126]'
                        : 'bg-white/80 text-slate-700 border border-rose-200 hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {gameAnswer && gameAnswer !== 'obviously-you' && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-lg font-handwritten" style={{ color: cfg.accent }}>
                  Incorrect answer 😂
                </motion.p>
              )}
              {gameAnswer === 'obviously-you' && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-lg font-handwritten" style={{ color: cfg.accent }}>
                  Correct! ❤️
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </Section>

        {/* Final Invitation */}
        {!response && (
          <Section>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center">
              <h2 className={`font-serif-display text-3xl sm:text-5xl font-bold mb-4 tracking-tight ${cfg.titleColor}`}>
                So… can I ask you one tiny thing?
              </h2>
              <p className="font-handwritten text-3xl mb-2" style={{ color: cfg.accent }}>Can I take you out?</p>
              <p className={`font-body text-sm ${cfg.subColor} mb-10`}>Coffee? Dinner? A walk? You choose.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <button
                  onClick={() => handleResponse('yes')}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-lg hover:shadow-xl hover:shadow-rose-300/40 transition-all hover:scale-105"
                >
                  ❤️ YES
                  <p className="text-xs font-normal mt-1 opacity-80">Okay, let's go.</p>
                </button>
                <button
                  onClick={() => handleResponse('maybe')}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-300 text-white font-bold text-lg hover:shadow-xl hover:shadow-amber-300/40 transition-all hover:scale-105"
                >
                  🥺 MAYBE
                  <p className="text-xs font-normal mt-1 opacity-80">I need a little time.</p>
                </button>
                <button
                  onClick={() => handleResponse('no')}
                  className="flex-1 py-4 rounded-2xl bg-white/60 border border-rose-200 text-rose-600 font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
                >
                  🤍 NO
                  <p className="text-xs font-normal mt-1 opacity-60">Not right now.</p>
                </button>
              </div>

              {/* Direct link to dashboard after reading */}
              {user && (
                <div className="mt-8">
                  <button
                    onClick={() => router.push(profile?.role === 'sender' ? '/sender' : '/receiver')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/80 hover:bg-white text-rose-600 font-medium text-xs shadow-sm border border-rose-200/50 backdrop-blur-sm transition hover:scale-105"
                  >
                    <span>Done reading? Return to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          </Section>
        )}

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
                  <div className="glass rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-100/80 bg-white/95 max-h-[85vh] overflow-y-auto">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-rose-700 mb-1">Our Next Date? 🥂</h3>
                    <p className="text-xs text-rose-400/80 mb-4">Pick an activity, suggest your own special date, or continue to dashboard.</p>

                    {/* Category Filter Pills */}
                    <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                      <button
                        type="button"
                        onClick={() => setDateCategory('all')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                          dateCategory === 'all'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60'
                        }`}
                      >
                        🌟 All
                      </button>
                      {Object.entries(DATE_CATEGORIES).map(([catKey, cat]) => (
                        <button
                          type="button"
                          key={catKey}
                          onClick={() => setDateCategory(catKey)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                            dateCategory === catKey
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60'
                          }`}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Date Ideas Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {(() => {
                        // Options prioritized: sender's offered options + preset catalog
                        const offeredKeys = exp?.date_options || [];
                        const pool = PRESET_DATE_IDEAS.filter(
                          (p) => dateCategory === 'all' || p.category === dateCategory
                        );

                        // If all category, also prepend any custom non-preset options offered by sender
                        const customOffered = dateCategory === 'all'
                          ? offeredKeys.filter((k) => !PRESET_DATE_IDEAS.some((p) => p.key === k))
                          : [];

                        return (
                          <>
                            {customOffered.map((cOpt) => {
                              const info = formatCustomDateIdea(cOpt);
                              const isSelected = selectedActivity === cOpt;
                              return (
                                <button
                                  key={cOpt}
                                  type="button"
                                  onClick={() => setSelectedActivity(cOpt)}
                                  className={`p-2.5 rounded-2xl transition-all border text-left flex flex-col justify-between ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md border-transparent scale-[1.03]'
                                      : 'bg-rose-50/70 text-rose-700 hover:bg-rose-100/80 border-rose-200'
                                  }`}
                                >
                                  <span className="text-xl mb-1">{info.emoji}</span>
                                  <span className="text-xs font-semibold leading-tight">{info.label}</span>
                                </button>
                              );
                            })}
                            {pool.map((opt) => {
                              const isSelected = selectedActivity === opt.key;
                              const isOfferedBySender = offeredKeys.includes(opt.key);
                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() => setSelectedActivity(opt.key)}
                                  className={`p-2.5 rounded-2xl transition-all border text-left flex flex-col justify-between relative ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md border-transparent scale-[1.03]'
                                      : isOfferedBySender
                                      ? 'bg-white text-rose-800 hover:bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                                      : 'bg-white/80 text-rose-600 hover:bg-rose-50 border-rose-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full mb-1">
                                    <span className="text-xl">{opt.emoji}</span>
                                    {isOfferedBySender && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 uppercase">
                                        His Pick
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                                </button>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>

                    {/* Suggest Our Own Custom Date Idea */}
                    <div className="mb-4 pt-3 border-t border-rose-100/80">
                      <label className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1.5 text-left">
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
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-rose-200 outline-none text-rose-800 text-xs focus:ring-2 focus:ring-rose-300"
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
                          className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs transition disabled:opacity-40"
                        >
                          Pick
                        </button>
                      </div>
                    </div>

                    {selectedActivity && (
                      <div className="mb-4 text-left p-3 rounded-xl bg-rose-50/80 border border-rose-200/80">
                        <p className="text-xs font-semibold text-rose-700 mb-1">
                          Chosen Date: <span className="font-bold">{formatCustomDateIdea(selectedActivity).emoji} {formatCustomDateIdea(selectedActivity).label}</span>
                        </p>
                        <textarea
                          value={dateNote}
                          onChange={(e) => setDateNote(e.target.value)}
                          placeholder="Add a sweet note or time for him (optional)..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 outline-none text-rose-700 text-xs resize-none focus:ring-2 focus:ring-rose-300"
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => handleDateSubmit(false)}
                        disabled={submittingDate || redirecting || !selectedActivity}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
                      >
                        {submittingDate ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending Date Request...</span>
                          </>
                        ) : redirecting ? (
                          <span>Redirecting to Dashboard... ❤️</span>
                        ) : (
                          <span>Confirm Date Request ❤️</span>
                        )}
                      </button>

                      <button
                        onClick={() => handleDateSubmit(true)}
                        disabled={submittingDate || redirecting}
                        className="py-3 px-4 rounded-xl bg-white/90 text-rose-600 font-semibold hover:bg-white text-xs border border-rose-200/70 shadow-2xs transition flex items-center justify-center gap-1"
                      >
                        <span>Skip to Dashboard</span>
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
          accentColor={cfg.accent}
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
