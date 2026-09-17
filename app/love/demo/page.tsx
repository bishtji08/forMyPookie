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
import { ExhibitConfessions } from '@/components/experience/exhibit-confessions';
import { PolaroidsTimeline } from '@/components/experience/polaroids-timeline';
import { CertifiedNonsense } from '@/components/experience/certified-nonsense';
import { LoveReasonsCards } from '@/components/experience/love-reasons-cards';
import { InteractiveLoveMeter } from '@/components/experience/interactive-love-meter';
import { PlayfulInvitation } from '@/components/experience/playful-invitation';

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
    <div className="min-h-screen bg-gradient-to-b from-[#fff6ef] via-[#ffeaf0] to-[#f4e8fd] text-[#3d2730] relative selection:bg-rose-200 selection:text-rose-900">
      {/* Floating 3D pastel hearts & golden stars background */}
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

      <div className="relative z-10">
        {/* Intro */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <p className={`font-handwritten text-3xl sm:text-4xl ${subColor} mb-2`}>Hey,</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-[#3d2730]">
              {demoExp.receiver_name} ❤️
            </h1>
            <p className={`font-body text-base sm:text-lg ${subColor} mb-8`}>Before anything else…</p>
            <motion.h2 initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }} className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-rose-600 mb-4">
              I'm sorry.
            </motion.h2>
            <p className={`font-body text-base sm:text-lg ${subColor} max-w-xl mx-auto`}>
              Not the casual &ldquo;sorry yaar&rdquo; kind. The real one.
            </p>
          </motion.div>
        </Section>

        {/* Apology */}
        <Section>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#3d2730] mb-6 text-center">
              Things I should have said properly…
            </h2>
            <div className="rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto shadow-lg shadow-rose-200/20 border border-white/90 bg-white/80 backdrop-blur-md text-[#4a2e39]">
              <p className="font-serif text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap text-center">
                {demoExp.apology_message}
              </p>
            </div>
          </motion.div>
        </Section>

        {/* Exhibit A: My Stupid Behaviour (Image 1 reference) */}
        <Section>
          <ExhibitConfessions
            relationship="Girlfriend"
            senderName={demoExp.sender_name}
            accentColor={themeConfig.accent}
          />
        </Section>

        {/* Us, in Polaroids (Image 2 reference) */}
        <Section>
          <PolaroidsTimeline
            memories={demoMemories}
            accentColor={themeConfig.accent}
            subColor={subColor}
          />
        </Section>

        {/* Certified Nonsense (Image 3 reference) */}
        <Section>
          <CertifiedNonsense
            funnyMoments={demoFunny}
            accentColor={themeConfig.accent}
            subColor={subColor}
          />
        </Section>

        {/* Things I Love About You (Image 4 reference) */}
        <Section>
          <LoveReasonsCards
            loveReasons={demoReasons}
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

        {/* Playful Invitation (Runaway NO & Celebratory YES) */}
        <Section>
          <PlayfulInvitation
            receiverName={demoExp.receiver_name}
            senderName={demoExp.sender_name}
            onResponse={handleResponse}
            response={response}
          />
        </Section>

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
