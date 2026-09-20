'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, X, Volume2, VolumeX, Play, Pause, ArrowLeft, ArrowRight, MessageCircle, Star,
  Eye, User as UserIcon, Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import type {
  Experience, Memory, FunnyMoment, LoveReason, GalleryItem,
  ResponseStatus, ExperienceTheme
} from '@/lib/types';
import { THEME_CONFIG, normalizeTheme } from '@/lib/types';
import { Footer } from '@/components/footer';
import { isVideoUrl, isValidUUID } from '@/lib/utils';
import { ParchmentLetter } from '@/components/experience/parchment-letter';
import { InteractiveEnvelope } from '@/components/experience/interactive-envelope';
import { FloatingReactions } from '@/components/experience/floating-reactions';
import { formatCustomDateIdea } from '@/lib/date-ideas';
import { FloatingAmbientHearts } from '@/components/experience/floating-ambient-hearts';

// Simplified 6 Core Date Ideas
const SIMPLE_DATE_IDEAS = [
  { key: 'coffee', label: 'Coffee & Talk', emoji: '☕' },
  { key: 'temple visit', label: 'Temple Visit', emoji: '' },
  { key: 'movie', label: 'Movie', emoji: '🎬' },
  { key: 'walk', label: 'Sunset Walk', emoji: '🌅' },
  { key: 'surprise', label: 'Surprise Me', emoji: '✨' },
];

export default function LoveExperiencePage() {
  const params = useParams();
  const rawParam = (params?.id || params?.token) as string | string[] | undefined;
  const idOrToken = (Array.isArray(rawParam) ? rawParam[0] : rawParam || '').trim();

  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  const [exp, setExp] = useState<Experience | null>(null);
  const [submittingDate, setSubmittingDate] = useState(false);
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
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [heartClicks, setHeartClicks] = useState(0);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // If URL has opened=true and user is authenticated, open the letter automatically
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.location.search.includes('opened=true')) {
      setOpened(true);
    }
  }, [user]);

  // Autoplay music when letter is opened or loaded opened
  useEffect(() => {
    if (opened && exp?.music_url && audioRef.current) {
      audioRef.current.muted = false;
      setMuted(false);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
          })
          .catch((err) => {
            console.log('Autoplay waiting for first touch/click:', err);
            const resumeAudio = () => {
              if (audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current.play().then(() => {
                  setPlaying(true);
                  setMuted(false);
                }).catch(() => { });
              }
              window.removeEventListener('click', resumeAudio);
              window.removeEventListener('touchstart', resumeAudio);
            };
            window.addEventListener('click', resumeAudio, { once: true });
            window.addEventListener('touchstart', resumeAudio, { once: true });
          });
      }
    }
  }, [opened, exp?.music_url]);

  useEffect(() => {
    if (authLoading) return;
    if (!idOrToken) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let isMounted = true;
    (async () => {
      setLoading(true);
      setNotFound(false);

      if (!isValidUUID(idOrToken)) {
        if (!isMounted) return;
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: expData, error } = await supabase
        .from('experiences')
        .select('*')
        .or(`id.eq.${idOrToken},secure_token.eq.${idOrToken}`)
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

      // If URL has ?opened=true and user is authenticated, open immediately
      if (user && typeof window !== 'undefined' && window.location.search.includes('opened=true')) {
        setOpened(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [idOrToken, user, profile, authLoading]);

  const handleOpen = async () => {
    if (!user) {
      setAuthPrompt(
        `A private love letter from ${exp?.sender_name || 'your sender'} is sealed inside for ${exp?.receiver_name || 'you'}. Please sign up or log in as the receiver to unlock the envelope and read what's inside! 💌`
      );
      return;
    }

    setOpened(true);

    if (audioRef.current && exp?.music_url) {
      audioRef.current.muted = false;
      setMuted(false);
      audioRef.current.play().then(() => setPlaying(true)).catch((e) => console.log('Audio play in handleOpen:', e));
    }

    if (exp && !exp.is_opened && user) {
      await supabase.from('experiences').update({
        is_opened: true,
        opened_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      }).eq('id', exp.id);

      if (exp.sender_id) {
        await supabase.from('notifications').insert({
          user_id: exp.sender_id,
          type: 'opened',
          title: `${exp.receiver_name || 'Your pookie'} opened your letter! 💌`,
          body: 'She opened the experience.',
          experience_id: exp.id,
        });
      }
    }
  };

  const handleResponse = async (resp: ResponseStatus) => {
    setResponse(resp);
    if (!exp) return;

    if (!user) {
      const respText = resp === 'yes' ? 'YES ❤️' : resp === 'maybe' ? 'MAYBE 🥺' : 'NO 🤍';
      setAuthPrompt(
        `You selected "${respText}". To send your response to ${exp.sender_name || 'your pookie'} and chat, please log in or create an account! 💌`
      );
      return;
    }

    await supabase.from('experiences').update({ response_status: resp }).eq('id', exp.id);

    await supabase.from('responses').insert({
      experience_id: exp.id,
      response: resp,
      note: resp === 'maybe' ? dateNote : null,
      receiver_id: user.id,
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

    if (!user) {
      setAuthPrompt(
        `To confirm your chosen date activity and chat with ${exp.sender_name || 'your pookie'}, please log in or sign up! 🥂`
      );
      return;
    }

    setSubmittingDate(true);
    try {
      if (!skip && selectedActivity) {
        await supabase.from('date_requests').insert({
          experience_id: exp.id,
          activity: selectedActivity,
          notes: dateNote,
          receiver_id: user.id,
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

      setDateConfirmed(true);
      toast({
        title: 'Response saved! ❤️',
        description: 'Thank you for your response.',
      });
    } catch {
      setDateConfirmed(true);
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
      audioRef.current.muted = false;
      setMuted(false);
      audioRef.current.play().then(() => setPlaying(true)).catch(() => { });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !audioRef.current.muted;
    audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted && audioRef.current.paused) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => { });
    }
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
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} className="text-rose-400/40 font-handwritten text-lg">Okay… I&apos;m nervous.</motion.p>
          </div>
        </div>
      </div>
    );
  }

  // Friendly Application-Level "Link Not Found or Expired" Page
  if (notFound || !exp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF7F2] via-[#F6F1EA] to-[#F1EAE0] px-4 py-12 relative overflow-hidden">
        <FloatingAmbientHearts theme="light" />
        <div className="relative z-10 max-w-md w-full glass rounded-3xl p-8 text-center shadow-xl border border-[#E8DFC8]/80 bg-white/90">
          <div className="w-16 h-16 rounded-full bg-rose-100/80 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-200/50" />
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-rose-800 mb-3">
            Link Not Found or Expired
          </h1>
          <p className="text-sm text-rose-600/70 mb-6 leading-relaxed">
            This love letter might have been moved, expired, or the link you followed is incorrect. Please check with your partner for the updated link.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition hover:scale-[1.02]"
            >
              Go to Homepage
            </Link>
            <Link
              href="/love/demo"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/70 hover:bg-white text-rose-600 text-xs font-medium border border-rose-200/60 transition"
            >
              See Example Experience
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in with a different account that is not the sender and not the bound receiver
  if (user && exp?.receiver_id && user.id !== exp.receiver_id && user.id !== exp.sender_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF7F2] via-[#F6F1EA] to-[#F1EAE0] px-4 relative overflow-hidden">
        <FloatingAmbientHearts theme="light" />
        <div className="text-center max-w-md w-full p-8 rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl border border-[#E8DFC8] relative z-10">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-rose-800 mb-2">Private Love Letter</h2>
          <p className="text-sm text-rose-600/80 mb-6 leading-relaxed">
            This love letter was created specifically for <strong>{exp.receiver_name || 'someone else'}</strong> and is bound to their account. You are currently signed in as <strong>{profile?.name || user.email}</strong>.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition hover:scale-[1.02] cursor-pointer"
          >
            Switch Account / Log In
          </button>
        </div>
      </div>
    );
  }

  const theme = normalizeTheme(exp?.theme);
  const cfg = THEME_CONFIG[theme] || THEME_CONFIG.light;
  const isDark = cfg.isDark;
  const isSender = Boolean(user && exp && user.id === exp.sender_id);

  return (
    <>
      {exp?.music_url && (
        <audio
          ref={audioRef}
          src={exp.music_url}
          loop
          autoPlay
          playsInline
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}

      {/* Persistent floating music controls */}
      {exp?.music_url && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMusic}
            aria-label={playing ? 'Pause Music' : 'Play Music'}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center text-rose-500 shadow-lg hover:scale-105 transition cursor-pointer border border-rose-200/50 dark:border-slate-700"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute Music' : 'Mute Music'}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center text-rose-500 shadow-lg hover:scale-105 transition cursor-pointer border border-rose-200/50 dark:border-slate-700"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {(!opened || !user) ? (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${cfg.unopenedBg} px-4 relative overflow-hidden`}>
          {/* Sender Preview Notice Banner */}
          {isSender && (
            <div className="fixed top-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
              <div className="pointer-events-auto bg-amber-500/95 text-white text-xs font-medium px-4 py-2 rounded-2xl shadow-xl border border-amber-300 flex items-center gap-2 max-w-xl">
                <span className="text-base">👁️</span>
                <span className="flex-1 text-[11px] leading-tight">
                  <strong>Sender Preview Mode:</strong> You are previewing your created letter. Receivers can open this link directly.
                </span>
              </div>
            </div>
          )}

          {/* Top Navigation */}
          <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
            {user && !isSender ? (
              <Link
                href={profile?.role === 'sender' ? '/sender' : '/receiver'}
                className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-rose-700 text-xs font-medium shadow-md backdrop-blur-md border border-rose-200/60 transition hover:scale-105"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{profile?.role === 'sender' ? 'Sender Dashboard' : 'Receiver Dashboard'}</span>
              </Link>
            ) : <div />}

            {!user && (
              <div className="pointer-events-auto flex items-center gap-2">
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true`)}`}
                  className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold shadow-md backdrop-blur-md border border-slate-200/60 transition hover:scale-105"
                >
                  Log In
                </Link>
                <Link
                  href={`/signup?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true`)}&role=receiver`}
                  className={`px-3.5 py-1.5 rounded-full ${cfg.buttonPrimary} text-xs font-semibold shadow-md backdrop-blur-md transition hover:scale-105`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Dreamy floating 3D hearts & romantic background elements */}
          <FloatingAmbientHearts theme={theme} />

          <InteractiveEnvelope
            receiverName={exp?.receiver_name || 'My Pookie'}
            senderName={exp?.sender_name || 'Someone special'}
            subtitle="a little something I made with my whole heart"
            theme={theme}
            isLocked={!user}
            onOpenAudio={() => {
              if (audioRef.current && exp?.music_url) {
                audioRef.current.muted = false;
                setMuted(false);
                audioRef.current.play().then(() => setPlaying(true)).catch((e) => console.log('Envelope open play error:', e));
              }
            }}
            onOpen={handleOpen}
          />

          {/* Guest Receiver Authentication Unlock Modal */}
          <AnimatePresence>
            {authPrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setAuthPrompt(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className={`max-w-md w-full rounded-3xl p-6 sm:p-8 text-center border shadow-2xl relative ${isDark ? 'bg-[#0C1527] text-white border-[#1E3A5F]' : 'bg-white text-slate-900 border-rose-200'
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setAuthPrompt(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Private Love Letter Sealed Inside</span>
                  </div>

                  <h3 className="font-serif-title text-2xl font-bold mb-2">
                    For {exp?.receiver_name || 'My Pookie'} 💌
                  </h3>

                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed mb-6">
                    {authPrompt}
                  </p>

                  <div className="space-y-3">
                    <Link
                      href={`/signup?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true`)}&role=receiver`}
                      className={`w-full py-3.5 px-4 rounded-xl ${cfg.buttonPrimary} text-xs font-bold shadow-lg transition flex items-center justify-center gap-2`}
                    >
                      <span>Sign Up to Unlock Letter (Receiver)</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true`)}`}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <span>Already have an account? Log In</span>
                    </Link>
                  </div>

                  <p className="mt-4 text-[11px] opacity-60">
                    Signing up as receiver connects you directly to {exp?.sender_name || 'your sender'}&apos;s letter ❤️
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className={`min-h-screen bg-gradient-to-b ${cfg.openedBg} ${cfg.textColor} relative`}>
          {/* Sender Preview Notice Banner */}
          {isSender && (
            <div className="fixed top-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
              <div className="pointer-events-auto bg-amber-500/95 text-white text-xs font-medium px-4 py-2 rounded-2xl shadow-xl border border-amber-300 flex items-center gap-2 max-w-xl">
                <span className="text-base">👁️</span>
                <span className="flex-1 text-[11px] leading-tight">
                  <strong>Sender Preview Mode:</strong> You are previewing this letter. Receivers can open and view it directly.
                </span>
              </div>
            </div>
          )}

          {/* Floating navigation bar */}
          <div className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
            {user && !isSender ? (
              <Link
                href={profile?.role === 'sender' ? '/sender' : '/receiver'}
                className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-rose-600 text-xs font-semibold shadow-md backdrop-blur-md border border-rose-100 transition hover:scale-105"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{profile?.role === 'sender' ? 'Sender Dashboard' : 'Receiver Dashboard'}</span>
              </Link>
            ) : <div />}

            <div className="pointer-events-auto flex items-center gap-2">
              {user && profile?.role === 'receiver' && (
                <Link
                  href="/receiver/messages"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-md backdrop-blur-md transition hover:scale-105"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </Link>
              )}

              {!user && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true`)}`}
                    className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold shadow-md backdrop-blur-md border border-slate-200 transition hover:scale-105"
                  >
                    Log In
                  </Link>
                  <Link
                    href={`/signup?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true`)}&role=receiver`}
                    className={`px-3.5 py-1.5 rounded-full ${cfg.buttonPrimary} text-xs font-semibold shadow-md backdrop-blur-md transition hover:scale-105`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

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

          {/* Content sections: Single Cohesive Flow */}
          <div className="relative z-10 pt-20 pb-16 px-4 sm:px-8 w-full max-w-3xl mx-auto space-y-12">

            {/* 1. THE APOLOGY MESSAGE (If provided by sender) */}
            {exp?.apology_message && (
              <section>
                <ParchmentLetter
                  badge="From the bottom of my heart"
                  title="Things I Should Have Said Properly…"
                  senderName={exp.sender_name}
                  receiverName={exp.receiver_name}
                  receiverNickname={exp?.receiver_nickname}
                  content={exp.apology_message}
                  showSignature={true}
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
                  receiverNickname={exp?.receiver_nickname}
                  content={exp?.love_letter || "Before this little fight, there was an entire story called us. You mean the world to me and I love you with all my heart."}
                  secretNote={exp?.final_letter || "P.S. Whatever happens, you deserve the sweetest smile today. You will always be special to me. ❤️"}
                  showSignature={false}
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
                  <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Always Remember</p>
                  <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
                    Your are my Favorite Memories 📸
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
                          className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border-2 transition-all text-left relative cursor-pointer ${isDark ? 'border-slate-300/90 shadow-2xl shadow-black/80' : 'border-rose-200 shadow-xl shadow-rose-200/30'
                            } ${i % 3 === 0 ? 'transform -rotate-1' : i % 3 === 1 ? 'transform rotate-2' : 'transform -rotate-2'
                            }`}
                          onClick={() => {
                            if (mem.media_url) {
                              setLightboxItem({ url: mem.media_url, caption: mem.caption || mem.title, isVideo: isVid });
                            }
                          }}
                        >
                          <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs rotate-2 pointer-events-none shadow-xs`} />
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
                          {mem.date && <p className="text-[11px] font-mono mb-1 text-slate-400">{mem.date}{mem.location ? ` · ${mem.location}` : ''}</p>}
                          {mem.caption && (
                            <p className="font-script text-base text-[#E11D48] leading-snug font-semibold">
                              {mem.caption}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback default memories matching preview */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.04, rotate: 0 }}
                      className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border-2 transform -rotate-1 transition-all text-left relative ${isDark ? 'border-slate-300/90 shadow-2xl shadow-black/80' : 'border-rose-200 shadow-xl shadow-rose-200/30'
                        }`}
                    >
                      <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs rotate-2 pointer-events-none shadow-xs`} />
                      <div className={`h-32 sm:h-36 ${cfg.polaroidInnerBg} rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner`}>
                        ☕
                      </div>
                      <p className="font-bold text-sm text-slate-900 mb-0.5">The First Date</p>
                      <p className="font-script text-base text-[#E11D48] leading-snug font-semibold">
                        Spilled coffee & still got your number
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.04, rotate: 0 }}
                      className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border-2 transform rotate-2 transition-all text-left relative ${isDark ? 'border-slate-300/90 shadow-2xl shadow-black/80' : 'border-rose-200 shadow-xl shadow-rose-200/30'
                        }`}
                    >
                      <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs -rotate-2 pointer-events-none shadow-xs`} />
                      <div className={`h-32 sm:h-36 ${cfg.polaroidInnerBg} rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner`}>
                        ⛰️
                      </div>
                      <p className="font-bold text-sm text-slate-900 mb-0.5">Mountain Trip</p>
                      <p className="font-script text-base text-[#E11D48] leading-snug font-semibold">
                        You made me take 400 photos & I loved it
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.04, rotate: 0 }}
                      className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border-2 transform -rotate-2 transition-all text-left relative ${isDark ? 'border-slate-300/90 shadow-2xl shadow-black/80' : 'border-rose-200 shadow-xl shadow-rose-200/30'
                        }`}
                    >
                      <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs rotate-1 pointer-events-none shadow-xs`} />
                      <div className={`h-32 sm:h-36 ${cfg.polaroidInnerBg} rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner`}>
                        🍕
                      </div>
                      <p className="font-bold text-sm text-slate-900 mb-0.5">Pizza Disaster</p>
                      <p className="font-script text-base text-[#E11D48] leading-snug font-semibold">
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
                    <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Evidence That You're</p>
                    <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
                      My Favorite Person to Look At 🖼️
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {gallery.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setLightboxItem({ url: item.media_url, caption: item.caption, isVideo: item.media_type === 'video' })}
                        className={`relative rounded-2xl overflow-hidden shadow-xl border-2 transition-all duration-300 group cursor-pointer aspect-4/3 ${isDark ? 'border-[#38BDF8]/40 hover:border-[#60A5FA] bg-black/40 shadow-black/80' : 'border-rose-200 hover:border-rose-300 bg-rose-50/50 shadow-rose-100/60'
                          }`}
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
                    <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>The Jokes Only We Get😂❤️</p>
                    <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
                      Because somehow, the most random things become the funniest with you.
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
                          <h4 className="font-serif-title text-base font-bold">{f.title}</h4>
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
                    <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold tracking-tight ${cfg.titleColor}`}>
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
                          <h4 className="font-serif-title text-base font-bold">{r.title}</h4>
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
                <h3 className={`font-serif-title text-3xl sm:text-4xl font-bold mb-2 tracking-tight ${cfg.titleColor}`}>
                  Can I take you out?
                </h3>
                <p className={`text-sm opacity-80 mb-6 font-script text-2xl ${cfg.subColor}`}>
                  Coffee? Movie? A walk? You choose.
                </p>

                {/* 3 Response Choice Buttons */}
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto mb-6">
                  <button
                    type="button"
                    onClick={() => handleResponse('yes')}
                    className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-base text-white shadow-xl transition-all transform hover:scale-105 cursor-pointer ${response === 'yes'
                      ? `${cfg.buttonPrimary} ring-4 ${isDark ? 'ring-blue-400/50' : 'ring-rose-400/50'} scale-105`
                      : cfg.buttonPrimary
                      }`}
                  >
                    ❤️ YES
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResponse('maybe')}
                    className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-base shadow-lg transition-all transform hover:scale-105 cursor-pointer border-2 ${response === 'maybe'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-300 ring-4 ring-amber-400/50 scale-105'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-amber-300/80'
                      }`}
                  >
                    🥺 MAYBE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResponse('no')}
                    className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-base border-2 shadow-md transition-all transform hover:scale-105 cursor-pointer ${response === 'no'
                      ? `${isDark ? 'bg-slate-700 border-slate-400 ring-4 ring-slate-400/50' : 'bg-slate-200 border-slate-400 ring-4 ring-slate-400/50'} scale-105`
                      : isDark
                        ? 'bg-[#131F37] hover:bg-[#1C2C4E] text-slate-200 border-slate-600 hover:border-slate-500'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                  >
                    🤍 NO
                  </button>
                </div>

                {/* INLINE EXPANSION: On YES */}
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
                            <h4 className={`font-serif-title text-2xl font-bold mb-1 ${cfg.subColor}`}>
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
                              {user ? (
                                <>
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
                                </>
                              ) : (
                                <Link
                                  href={`/signup?redirect=/love/${idOrToken}&role=receiver`}
                                  className={`px-5 py-2.5 rounded-xl ${cfg.buttonPrimary} text-xs font-semibold shadow transition inline-flex items-center justify-center gap-1.5`}
                                >
                                  <span>Create Account & Chat</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => setDateConfirmed(false)}
                                className={`px-4 py-2 rounded-xl text-xs hover:underline cursor-pointer ${cfg.subColor}`}
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
                                      className={`p-3 rounded-2xl text-xs font-bold text-center transition-all flex flex-col items-center justify-center gap-1.5 border-2 relative cursor-pointer ${isSelected ? cfg.dateCardActive : cfg.dateCardBg
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
                                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none border-2 focus:ring-2 ${cfg.inputBg}`}
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
                                  className={`px-4 py-2.5 rounded-xl ${cfg.buttonPrimary} text-xs font-extrabold text-white disabled:opacity-40 transition shadow-md cursor-pointer`}
                                >
                                  Pick
                                </button>
                              </div>
                            </div>

                            {selectedActivity && (
                              <div className="mb-4 p-3.5 rounded-xl border-2 border-rose-300 dark:border-blue-500/40 bg-black/5 dark:bg-white/5">
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
                                    className={`text-[11px] hover:underline cursor-pointer ${cfg.subColor}`}
                                  >
                                    Clear
                                  </button>
                                </div>
                                <textarea
                                  value={dateNote}
                                  onChange={(e) => setDateNote(e.target.value)}
                                  placeholder="Add a sweet note for him (optional)..."
                                  rows={2}
                                  className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none border-2 resize-none focus:ring-2 ${cfg.inputBg}`}
                                />
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleDateSubmit(false)}
                                disabled={submittingDate || !selectedActivity}
                                className={`flex-1 py-3 px-4 rounded-xl ${cfg.buttonPrimary} font-extrabold text-xs text-white shadow-lg transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer`}
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
                                className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
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
                      <div className={`mt-4 p-5 sm:p-6 rounded-2xl border text-left ${isDark
                        ? 'bg-amber-950/50 border-amber-400/30 text-white'
                        : 'bg-amber-50/80 border-amber-200 text-slate-800'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🥺❤️</span>
                          <h4 className="font-serif-title text-xl font-bold text-amber-500">
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
                          className={`w-full px-3 py-2 rounded-xl text-xs outline-none border resize-none mb-3 focus:ring-2 focus:ring-amber-400 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-white/40' : 'bg-white border-amber-200 text-slate-800'
                            }`}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user) {
                                setAuthPrompt(`To save your note and send it to ${exp?.sender_name || 'your pookie'}, please log in or sign up! 💌`);
                                return;
                              }
                              if (dateNote && exp) {
                                await supabase.from('responses').insert({
                                  experience_id: exp.id,
                                  response: 'maybe',
                                  note: dateNote,
                                  receiver_id: user.id,
                                });
                              }
                              toast({ title: 'Note saved ❤️', description: 'Thank you for your honesty.' });
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow transition cursor-pointer"
                          >
                            Save Note
                          </button>
                          <button
                            type="button"
                            onClick={() => setResponse(null)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold border border-amber-300 text-amber-600 hover:bg-amber-100 transition cursor-pointer"
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
                      <div className={`mt-4 p-5 sm:p-6 rounded-2xl border text-left ${isDark
                        ? 'bg-slate-900/60 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🤍</span>
                          <h4 className="font-serif-title text-xl font-bold text-slate-400">
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
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white shadow transition cursor-pointer"
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

            {/* Lightbox Viewer */}
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
                    className="absolute top-4 right-4 text-white hover:text-rose-300 transition p-2 rounded-full bg-white/10 cursor-pointer"
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

            {/* Guest Receiver Authentication Modal */}
            <AnimatePresence>
              {authPrompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
                  onClick={() => setAuthPrompt(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`max-w-md w-full rounded-3xl p-6 sm:p-8 text-center border shadow-2xl relative ${isDark ? 'bg-[#0C1527] text-white border-[#1E3A5F]' : 'bg-white text-slate-900 border-rose-200'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setAuthPrompt(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="w-14 h-14 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                    </div>

                    <h3 className="font-serif-title text-2xl font-bold mb-2">
                      Send Response to Your Pookie
                    </h3>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed mb-6">
                      {authPrompt}
                    </p>

                    <div className="space-y-2.5">
                      <Link
                        href={`/signup?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true&response=${response || ''}&activity=${selectedActivity || ''}`)}&role=receiver`}
                        className={`w-full py-3 px-4 rounded-xl ${cfg.buttonPrimary} text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5`}
                      >
                        <span>Sign Up to Reply & Chat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/love/${idOrToken}?opened=true&response=${response || ''}&activity=${selectedActivity || ''}`)}`}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <span>Already have an account? Log In</span>
                      </Link>
                    </div>
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
              className="mt-8"
            />
          </div>
        </div>
      )}
    </>
  );
}
