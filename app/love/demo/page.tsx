'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Star, X, Coffee, Utensils, Film, Moon, Car, Eye,
  Volume2, VolumeX, Play, Pause
} from 'lucide-react';
import type { Experience, Memory, FunnyMoment, LoveReason, GalleryItem, ResponseStatus, ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';
import { Footer } from '@/components/footer';

const demoExp: Experience = {
  id: 'demo',
  secure_token: 'demo',
  sender_id: '',
  receiver_id: null,
  receiver_name: 'Pookie',
  receiver_nickname: 'Pooks',
  sender_name: 'Your Boy',
  relationship: 'Girlfriend',
  apology_message: "I'm sorry. Not the casual 'sorry yaar' kind. The real one.\n\nI know I messed up. I know I said the wrong thing at the wrong time. And I know that 'I was tired' or 'I was stressed' doesn't excuse it.\n\nYou didn't deserve that. You deserved better from me. And I want to do better.",
  love_letter: "Before this stupid little fight, there was an entire story called us.\n\nThere were late-night calls where we talked about nothing for hours. There was the time you laughed so hard at my terrible joke that milk came out of your nose (I promised I'd never bring that up again, but here we are).\n\nThere was the first time I realized I loved you. Not the dramatic movie moment — it was a Tuesday afternoon and you were eating a sandwich and complaining about your boss, and I thought, 'Yeah. This is the person I want to hear complain about sandwiches for the rest of my life.'\n\nI love you. Not the Instagram caption kind. The real, quiet, show-up-at-2am kind.",
  final_letter: "One last thing...\n\nI'm not asking you to forget what happened. I'm asking you to let me earn better.\n\nI love you. I respect your feelings. And whatever you decide — yes, maybe, or no — I'll respect that too.\n\nYou're not obligated to say yes. You're not obligated to forgive me right now. You're only obligated to take care of yourself.\n\nI just wanted you to know that I tried. Properly, this time.",
  theme: 'pink-dream',
  music_url: null,
  status: 'active',
  is_opened: false,
  opened_at: null,
  last_accessed_at: null,
  response_status: null,
  date_options: ['coffee', 'dinner', 'movie', 'walk', 'drive', 'surprise'],
  expires_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoMemories: Memory[] = [
  { id: '1', experience_id: 'demo', title: 'The First Time We Met', date: '2023-01-15', location: 'Coffee Shop', media_url: '', media_type: 'image', caption: 'You spilled coffee on me and I still asked for your number', category: 'first-date', sort_order: 0, created_at: '', updated_at: '' },
  { id: '2', experience_id: 'demo', title: 'Our First Trip', date: '2023-06-20', location: 'Mountains', media_url: '', media_type: 'image', caption: 'You made me take 400 photos and I loved every single one', category: 'trips', sort_order: 1, created_at: '', updated_at: '' },
  { id: '3', experience_id: 'demo', title: 'That Random Tuesday', date: '2023-09-08', location: 'Home', media_url: '', media_type: 'image', caption: 'We did absolutely nothing and it was perfect', category: 'random', sort_order: 2, created_at: '', updated_at: '' },
];

const demoFunny: FunnyMoment[] = [
  { id: '1', experience_id: 'demo', title: 'The Autocorrect Incident', description: 'You texted "I love you boob" instead of "I love you boo" and I have never let you forget it.', image_url: '', date: null, sort_order: 0, created_at: '' },
  { id: '2', experience_id: 'demo', title: 'The Dance Battle', description: 'You challenged me to a dance battle, tripped on your own foot, and still declared yourself the winner.', image_url: '', date: null, sort_order: 1, created_at: '' },
  { id: '3', experience_id: 'demo', title: 'The Cooking Disaster', description: 'You tried to make pasta and set off the smoke alarm. We ordered pizza. It was the best pizza of our lives.', image_url: '', date: null, sort_order: 2, created_at: '' },
];

const demoReasons: LoveReason[] = [
  { id: '1', experience_id: 'demo', title: 'Your Laugh', description: 'The real one. Not the polite one. The one where your whole face scrunches up.', image_url: '', sort_order: 0, created_at: '' },
  { id: '2', experience_id: 'demo', title: 'Your Random Habits', description: 'You hum while you think. You talk to plants. You name your pillows. All of it.', image_url: '', sort_order: 1, created_at: '' },
  { id: '3', experience_id: 'demo', title: 'The Way You Care', description: 'You remember things I told you once, months ago, and ask about them. Every time.', image_url: '', sort_order: 2, created_at: '' },
  { id: '4', experience_id: 'demo', title: 'You Being You', description: 'No explanation needed. Just you.', image_url: '', sort_order: 3, created_at: '' },
];

export default function DemoExperiencePage() {
  const [opened, setOpened] = useState(false);
  const [response, setResponse] = useState<ResponseStatus | null>(null);
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [loveMeterValue, setLoveMeterValue] = useState(0);
  const [loveMeterCalculating, setLoveMeterCalculating] = useState(false);
  const [loveMeterDone, setLoveMeterDone] = useState(false);
  const [gameAnswer, setGameAnswer] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const handleOpen = () => setOpened(true);

  const handleResponse = (resp: ResponseStatus) => {
    setResponse(resp);
    if (resp === 'yes') setTimeout(() => setShowDateSelection(true), 2000);
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

  const theme = demoExp.theme;
  const themeConfig = THEME_CONFIG[theme];
  const isDark = false;
  const bgColor = 'text-rose-700';
  const subColor = 'text-rose-400/70';

  const dateOptions = [
    { key: 'coffee', label: 'Coffee', icon: Coffee },
    { key: 'dinner', label: 'Dinner', icon: Utensils },
    { key: 'movie', label: 'Movie', icon: Film },
    { key: 'walk', label: 'Walk', icon: Moon },
    { key: 'drive', label: 'Long Drive', icon: Car },
    { key: 'surprise', label: 'Surprise me', icon: Sparkles },
  ];

  if (!opened) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] via-[#2d1b4e] to-[#1a1a2e] px-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute text-rose-300/20" initial={{ y: '100vh', x: `${10 + i * 12}%`, opacity: 0 }} animate={{ y: '-10vh', opacity: [0, 0.4, 0] }} transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.5 }}>
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-center max-w-lg relative z-10">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="relative mx-auto mb-8">
            <div className="w-32 h-24 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-lavender-400 rounded-lg shadow-2xl shadow-rose-500/30" />
              <div className="absolute top-0 left-0 right-0 h-0 border-l-[64px] border-r-[64px] border-b-[40px] border-l-transparent border-r-transparent border-b-rose-300/80" />
              <div className="absolute inset-0 flex items-center justify-center"><Heart className="w-10 h-10 text-white fill-white/30" /></div>
            </div>
          </motion.div>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-3">Pookie… I made something for you.</h1>
          <p className="text-white/60 mb-8 font-body">Please give me 2 minutes. No pressure. Just me trying to say what I couldn't properly say.</p>
          <button onClick={handleOpen} className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-rose-400 to-lavender-400 text-white text-lg font-medium hover:shadow-2xl hover:shadow-rose-500/40 transition-all hover:scale-105">
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" /> Open it? 💌
          </button>
          <p className="text-white/30 text-xs mt-8">This is a demo experience. Create your own at For My Pookie.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeConfig.gradient} ${bgColor}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute" initial={{ y: '100vh', x: `${Math.random() * 100}%`, opacity: 0 }} animate={{ y: '-10vh', opacity: [0, 0.15, 0] }} transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.5 }}>
            <Heart className="w-4 h-4 fill-current" style={{ color: themeConfig.accent }} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Intro */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className={`font-handwritten text-2xl ${subColor} mb-2`}>Hey,</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6" style={{ color: themeConfig.accent }}>{demoExp.receiver_name} ❤️</h1>
            <p className={`font-body text-lg ${subColor} mb-8`}>Before anything else…</p>
            <motion.h2 initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }} className="font-display text-5xl md:text-7xl font-bold mb-4">I'm sorry.</motion.h2>
            <p className={`font-body text-lg ${subColor} max-w-xl mx-auto`}>Not the casual "sorry yaar" kind. The real one.</p>
          </motion.div>
        </Section>

        {/* Apology */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: themeConfig.accent }}>Things I should have said properly…</h2>
            <div className="glass rounded-2xl p-6 md:p-10 max-w-2xl mx-auto">
              <p className="font-serif-body text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-center text-rose-700">{demoExp.apology_message}</p>
            </div>
          </motion.div>
        </Section>

        {/* Funny Court */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className={`font-handwritten text-2xl ${subColor} mb-2`}>A completely unbiased investigation…</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: themeConfig.accent }}>THE PEOPLE VS. YOUR BOY</h2>
            <div className="glass rounded-2xl p-6 md:p-8 max-w-xl mx-auto">
              <p className="text-sm font-medium mb-4" style={{ color: themeConfig.accent }}>CHARGES:</p>
              <div className="space-y-2 mb-6">
                {['Being stupid', 'Saying the wrong thing', 'Making pookie angry', 'Having zero brain cells'].map((charge, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between py-2 border-b border-rose-200/30">
                    <span className="text-lg">{charge}</span><span className="text-2xl">✅</span>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex items-center justify-between py-2">
                  <span className="text-lg">Loving pookie 1000%</span><span className="text-2xl">❤️</span>
                </motion.div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold" style={{ color: themeConfig.accent }}>VERDICT: GUILTY.</p>
                <p className="text-sm font-medium" style={{ color: themeConfig.accent }}>PUNISHMENT:</p>
                <p>Must apologize properly</p><p>Must bring snacks</p><p>Must listen without arguing</p>
                <p>Must give unlimited hugs <span className="text-sm italic">if she wants them</span></p>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* Memory Timeline */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className={`font-handwritten text-2xl ${subColor} mb-2`}>But then I remembered something…</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: themeConfig.accent }}>Before this stupid little fight,</h2>
            <p className={`font-body text-lg ${subColor} mb-12`}>there was an entire story called us.</p>
            <div className="max-w-2xl mx-auto space-y-8">
              {demoMemories.map((mem, i) => (
                <motion.div key={mem.id} initial={{ opacity: 0, y: 50, rotate: i % 2 === 0 ? -3 : 3 }} whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -2 : 2 }} viewport={{ once: true }} whileHover={{ scale: 1.03, rotate: 0 }} className="relative bg-white rounded-lg p-4 polaroid-shadow mx-auto max-w-sm">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-rose-200/60 rounded-sm rotate-2" />
                  <div className="w-full h-48 rounded overflow-hidden mb-3 bg-gradient-to-br from-rose-100 to-lavender-100 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-rose-300/40" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-rose-700 mb-1">{mem.title}</h3>
                  <p className="text-xs text-rose-400/60">{mem.date} · {mem.location}</p>
                  <p className="font-handwritten text-lg text-rose-500 mt-2">{mem.caption}</p>
                  <div className="absolute bottom-2 right-2 text-rose-300/40"><Heart className="w-4 h-4" /></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* Funny Moments */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: themeConfig.accent }}>Our shared brain cell collection 🧠❤️</h2>
            <p className={`font-body text-sm ${subColor} mb-8`}>Inside jokes that only we get.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {demoFunny.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-5">
                  <h3 className="font-display text-lg font-semibold mb-1" style={{ color: themeConfig.accent }}>{f.title}</h3>
                  <p className={`text-sm ${subColor}`}>{f.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* Love Reasons */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className={`font-handwritten text-2xl ${subColor} mb-2`}>Since we're here…</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: themeConfig.accent }}>Let me remind you.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {demoReasons.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }} className="glass rounded-2xl p-5 text-center relative">
                  <div className="absolute top-2 right-2"><Star className="w-4 h-4 text-rose-300/40" /></div>
                  <h3 className="font-display text-lg font-semibold mb-2" style={{ color: themeConfig.accent }}>{r.title}</h3>
                  <p className={`text-sm ${subColor}`}>{r.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* Love Meter */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: themeConfig.accent }}>How much do I love you?</h2>
            <div className="glass rounded-2xl p-8 max-w-md mx-auto">
              {!loveMeterDone ? (
                <>
                  <div className="text-6xl font-bold mb-4" style={{ color: themeConfig.accent }}>{loveMeterValue}% ❤️</div>
                  <div className="w-full h-4 bg-rose-100/30 rounded-full overflow-hidden mb-4">
                    <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${themeConfig.accent}, #ff6fa8)` }} animate={{ width: `${loveMeterValue}%` }} />
                  </div>
                  {!loveMeterCalculating && loveMeterValue === 0 && <button onClick={calculateLove} className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-medium hover:shadow-lg transition">Calculate my love.</button>}
                  {loveMeterCalculating && <p className="text-sm animate-pulse" style={{ color: themeConfig.accent }}>Calculating…</p>}
                </>
              ) : (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <motion.p animate={{ x: [0, -2, 2, 0] }} transition={{ duration: 0.3, repeat: 3 }} className="text-2xl font-bold text-red-500 mb-2">ERROR</motion.p>
                  <p className="text-lg mb-4" style={{ color: themeConfig.accent }}>Love limit exceeded.</p>
                  <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="text-6xl font-bold" style={{ color: themeConfig.accent }}>∞ ❤️</motion.p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </Section>

        {/* Mini Game */}
        <Section>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6" style={{ color: themeConfig.accent }}>Quick question…</h2>
            <p className={`text-lg ${subColor} mb-6`}>Who is the cutest person in this relationship?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              {[{ label: 'Me 😎', value: 'me' }, { label: 'You 🥺', value: 'you' }, { label: 'Obviously you 🙄❤️', value: 'obviously-you' }].map((opt) => (
                <button key={opt.value} onClick={() => setGameAnswer(opt.value)} className={`px-5 py-3 rounded-xl font-medium transition-all ${gameAnswer === opt.value ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-lg' : `glass ${subColor} hover:shadow-md`}`}>{opt.label}</button>
              ))}
            </div>
            <AnimatePresence>
              {gameAnswer && gameAnswer !== 'obviously-you' && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-lg font-handwritten" style={{ color: themeConfig.accent }}>Incorrect answer 😂</motion.p>}
              {gameAnswer === 'obviously-you' && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-lg font-handwritten" style={{ color: themeConfig.accent }}>Correct! ❤️</motion.p>}
            </AnimatePresence>
          </motion.div>
        </Section>

        {/* Rewind */}
        <Section dark>
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] -mx-4 px-4 py-20 md:py-32 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-8">If I could go back…</h2>
              <div className="space-y-4 max-w-lg mx-auto">
                {["I'd go back…", "To that moment…", "And choose my words more carefully.", "I can't change what happened.", "But I can choose what I do next."].map((text, i) => (
                  <motion.p key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.3 }} className="font-serif-body text-xl md:text-2xl text-white/80">{text}</motion.p>
                ))}
                <motion.p initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.8, duration: 0.8 }} className="font-display text-3xl md:text-4xl font-bold text-rose-400 pt-4">And I choose to do better.</motion.p>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* Final Letter */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className={`font-handwritten text-2xl ${subColor} mb-2`}>One last thing…</p>
            <div className="glass rounded-2xl p-6 md:p-10 max-w-2xl mx-auto">
              <p className="font-serif-body text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-center text-rose-700">{demoExp.final_letter}</p>
            </div>
          </motion.div>
        </Section>

        {/* Invitation */}
        {!response && (
          <Section>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: themeConfig.accent }}>So… can I ask you one tiny thing?</h2>
              <p className="font-handwritten text-3xl mb-2" style={{ color: themeConfig.accent }}>Can I take you out?</p>
              <p className={`font-body text-sm ${subColor} mb-10`}>Coffee? Dinner? A walk? You choose.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <button onClick={() => handleResponse('yes')} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-lg hover:shadow-xl hover:shadow-rose-300/40 transition-all hover:scale-105">
                  ❤️ YES<p className="text-xs font-normal mt-1 opacity-80">Okay, let's go.</p>
                </button>
                <button onClick={() => handleResponse('maybe')} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-300 text-white font-bold text-lg hover:shadow-xl hover:shadow-amber-300/40 transition-all hover:scale-105">
                  🥺 MAYBE<p className="text-xs font-normal mt-1 opacity-80">I need a little time.</p>
                </button>
                <button onClick={() => handleResponse('no')} className="flex-1 py-4 rounded-2xl bg-white/60 border border-rose-200 text-rose-600 font-bold text-lg hover:shadow-lg transition-all hover:scale-105">
                  🤍 NO<p className="text-xs font-normal mt-1 opacity-60">Not right now.</p>
                </button>
              </div>
            </motion.div>
          </Section>
        )}

        {/* Response screens */}
        <AnimatePresence>
          {response === 'yes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-rose-100/90 to-lavender-100/90 backdrop-blur-sm p-4">
              {[...Array(20)].map((_, i) => (
                <motion.div key={i} className="absolute" initial={{ y: -100, x: `${Math.random() * 100}%`, rotate: 0, opacity: 1 }} animate={{ y: '100vh', rotate: 360, opacity: [1, 1, 0] }} transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}>
                  {i % 3 === 0 ? <Heart className="w-6 h-6 fill-rose-400 text-rose-400" /> : i % 3 === 1 ? <Sparkles className="w-5 h-5 text-amber-400" /> : <Star className="w-5 h-5 fill-amber-300 text-amber-300" />}
                </motion.div>
              ))}
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center max-w-lg relative z-10">
                <h1 className="font-display text-4xl md:text-6xl font-bold text-rose-600 mb-4">SHE SAID YES 😭❤️</h1>
                {showDateSelection && (
                  <div className="glass rounded-2xl p-6 mt-6">
                    <h3 className="font-display text-xl font-semibold text-rose-700 mb-4">Our date?</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dateOptions.map((opt) => (
                        <button key={opt.key} onClick={() => setSelectedActivity(opt.key)} className={`p-4 rounded-xl transition-all ${selectedActivity === opt.key ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-lg' : 'bg-white/60 text-rose-600 hover:bg-rose-50'}`}>
                          <opt.icon className="w-5 h-5 mx-auto mb-1" /><p className="text-sm font-medium">{opt.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
          {response === 'maybe' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-amber-50/90 to-orange-50/90 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center max-w-lg">
                <Heart className="w-16 h-16 text-amber-400 mx-auto mb-6 fill-amber-300/30" />
                <h1 className="font-display text-3xl md:text-4xl font-bold text-amber-600 mb-4">That's okay ❤️</h1>
                <p className="font-body text-lg text-amber-500/80 mb-2">Take your time, pookie.</p>
                <p className="font-body text-lg text-amber-500/80">You don't have to decide right now.</p>
              </motion.div>
            </motion.div>
          )}
          {response === 'no' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-gray-50/90 to-rose-50/90 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center max-w-lg">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-6 fill-gray-300/30" />
                <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-600 mb-4">I understand ❤️</h1>
                <p className="font-body text-lg text-gray-500 mb-2">Thank you for reading everything.</p>
                <p className="font-body text-lg text-gray-500 mb-2">I genuinely mean the apology.</p>
                <p className="font-body text-lg text-gray-500">Take care of yourself, okay?</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer
          isDark={false}
          accentColor={themeConfig.accent}
          tagline="This was a demo • From my heart, to yours"
          className="mt-12"
        />
      </div>
    </div>
  );
}

function Section({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-4xl">{children}</div>
    </section>
  );
}
