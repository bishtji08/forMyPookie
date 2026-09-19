'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Star, Coffee, Utensils, Film, Moon, Car,
  RefreshCw, Palette
} from 'lucide-react';
import type { Experience, Memory, FunnyMoment, LoveReason, ResponseStatus, ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';
import { Footer } from '@/components/footer';
import { ParchmentLetter } from '@/components/experience/parchment-letter';
import { InteractiveEnvelope } from '@/components/experience/interactive-envelope';
import { FloatingReactions } from '@/components/experience/floating-reactions';
import { PRESET_DATE_IDEAS, DATE_CATEGORIES, formatCustomDateIdea } from '@/lib/date-ideas';
import { GlossyHeart } from '@/components/experience/glossy-heart';
import { FloatingAmbientHearts } from '@/components/experience/floating-ambient-hearts';

const demoExp: Experience = {
  id: 'demo',
  secure_token: 'demo',
  sender_id: '',
  receiver_id: null,
  receiver_name: 'Pookie',
  receiver_nickname: 'Pooks',
  sender_name: 'Your Boy',
  relationship: 'Girlfriend',
  apology_message: "I'm sorry. Not the casual 'sorry yaar' kind. The real one.\n\nI know I messed up. I know I said the wrong thing at the wrong time. And I know that 'I was tired' or 'I was stressed' doesn't excuse it.\n\nYou didn't deserve that. You deserved better from me. And I want to do better.\n\nBefore this stupid little fight, there was an entire story called us. The late-night calls where we talked about nothing for hours, laughing until our stomachs hurt, and all the quiet moments where I knew you were my favorite person.\n\nI love you. Not the Instagram caption kind. The real, quiet, show-up-for-you kind.",
  love_letter: '',
  final_letter: 'P.S. Whatever your answer is, I just want you to smile today. Take all the time you need. You will always be special to me. ❤️',
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
  { id: '1', experience_id: 'demo', title: 'The Autocorrect Incident', description: 'You texted "I love you boob" instead of "I love you boo" and I will never let you forget it.', image_url: '', date: null, sort_order: 0, created_at: '' },
  { id: '2', experience_id: 'demo', title: 'The Dance Battle', description: 'You challenged me to a dance battle, tripped on your own foot, and still declared yourself the winner.', image_url: '', date: null, sort_order: 1, created_at: '' },
  { id: '3', experience_id: 'demo', title: 'The Cooking Disaster', description: 'You tried to make pasta and set off the smoke alarm. We ordered pizza and it was the best night ever.', image_url: '', date: null, sort_order: 2, created_at: '' },
];

const demoReasons: LoveReason[] = [
  { id: '1', experience_id: 'demo', title: 'Your Laugh', description: 'The real one. Not the polite one. The one where your whole face scrunches up.', image_url: '', sort_order: 0, created_at: '' },
  { id: '2', experience_id: 'demo', title: 'Your Random Habits', description: 'You hum while you think. You talk to plants. You name your pillows. All of it.', image_url: '', sort_order: 1, created_at: '' },
  { id: '3', experience_id: 'demo', title: 'The Way You Care', description: 'You remember things I told you months ago, and ask about them every time.', image_url: '', sort_order: 2, created_at: '' },
  { id: '4', experience_id: 'demo', title: 'You Being You', description: 'No explanation needed. Just you, exactly as you are.', image_url: '', sort_order: 3, created_at: '' },
];

export default function DemoExperiencePage() {
  const [opened, setOpened] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ExperienceTheme>('pink-dream');
  const [response, setResponse] = useState<ResponseStatus | null>(null);
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [customDateInput, setCustomDateInput] = useState('');
  const [dateCategory, setDateCategory] = useState<string>('all');
  const [loveMeterValue, setLoveMeterValue] = useState(0);
  const [loveMeterCalculating, setLoveMeterCalculating] = useState(false);
  const [loveMeterDone, setLoveMeterDone] = useState(false);
  const [dateConfirmed, setDateConfirmed] = useState(false);

  const handleOpen = () => setOpened(true);

  const handleResponse = (resp: ResponseStatus) => {
    setResponse(resp);
    if (resp === 'yes') setTimeout(() => setShowDateSelection(true), 1500);
  };

  const calculateLove = () => {
    setLoveMeterCalculating(true);
    const values = [12, 35, 68, 92, 100];
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
        }, 400);
      }
    }, 300);
  };

  const cfg = THEME_CONFIG[selectedTheme] || THEME_CONFIG['pink-dream'];
  const isDark = cfg.isDark;

  // Floating Live Theme Switcher Bar
  const themeSwitcherBar = (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 shadow-2xl text-xs select-none max-w-[95vw] overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1 px-2 text-white/70 font-semibold text-[11px] whitespace-nowrap">
        <Palette className="w-3.5 h-3.5 text-rose-400" />
        <span className="hidden sm:inline">Theme:</span>
      </div>
      {(['pink-dream', 'lavender-night', 'sunset-love', 'minimal-cream', 'starry-romance'] as const).map((tKey) => (
        <button
          key={tKey}
          type="button"
          onClick={() => setSelectedTheme(tKey)}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedTheme === tKey
              ? 'bg-rose-500 text-white shadow-md scale-105'
              : 'text-white/75 hover:text-white hover:bg-white/10'
          }`}
        >
          {tKey === 'pink-dream' ? '🌸 Pink' : tKey === 'lavender-night' ? '🌙 Lavender' : tKey === 'sunset-love' ? '🌅 Sunset' : tKey === 'minimal-cream' ? '✨ Cream' : '🌌 Starry'}
        </button>
      ))}
      {opened && (
        <button
          type="button"
          onClick={() => setOpened(false)}
          className="ml-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium flex items-center gap-1 transition"
          title="Re-test envelope opening"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden md:inline">Envelope</span>
        </button>
      )}
    </div>
  );

  // UNOPENED VIEW (The Envelope Screen)
  if (!opened) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${cfg.unopenedBg} px-4 relative overflow-hidden transition-colors duration-500`}>
        {themeSwitcherBar}

        {/* Ambient floating 3D hearts & dreamy background elements */}
        <FloatingAmbientHearts theme={selectedTheme} />

        <InteractiveEnvelope
          receiverName={demoExp.receiver_name}
          senderName={demoExp.sender_name}
          subtitle="a little something I made with my whole heart"
          theme={selectedTheme}
          onOpen={handleOpen}
        />
      </div>
    );
  }

  // OPENED VIEW (Streamlined, non-repetitive love story)
  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.openedBg} ${cfg.textColor} transition-colors duration-500 relative`}>
      {themeSwitcherBar}

      {/* Continuous ambient background floating hearts */}
      <FloatingAmbientHearts theme={selectedTheme} />

      {/* Floating Reaction Dock */}
      <FloatingReactions isDark={isDark} />

      <div className="relative z-10 pt-16 sm:pt-20">
        
        {/* CHAPTER 1: The Heartfelt Stationery Letter */}
        <section className="min-h-[70vh] flex items-center justify-center px-4 py-12 md:py-16">
          <div className="w-full max-w-4xl">
            <ParchmentLetter
              title="Things I Should Have Said Properly…"
              senderName={demoExp.sender_name}
              receiverName={demoExp.receiver_name}
              content={demoExp.apology_message}
              secretNote="P.S. You deserve the best version of me, and I promise to give you exactly that. ❤️"
              isDark={isDark}
              accentColor={cfg.accent}
            />
          </div>
        </section>

        {/* CHAPTER 2: Our Memories & Polaroids */}
        <section className="min-h-[60vh] flex items-center justify-center px-4 py-12 md:py-16">
          <div className="w-full max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <p className={`font-handwritten text-2xl sm:text-3xl ${cfg.subColor} mb-2`}>Before this little fight…</p>
              <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight ${cfg.titleColor}`}>
                There was an entire story called us.
              </h2>
              <p className={`font-body text-sm sm:text-base ${cfg.subColor} mb-10 max-w-lg mx-auto`}>
                Moments that remind me why you will always be my favorite human.
              </p>

              {/* Polaroid Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {demoMemories.map((mem, i) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -2 : 2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -2 : 2 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.03, rotate: 0 }}
                    className="relative bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-rose-100/60 transition-all text-left"
                  >
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center text-4xl">
                      {i === 0 ? '☕' : i === 1 ? '⛰️' : '🍕'}
                    </div>
                    <h3 className="font-serif-display text-lg font-bold text-rose-900 mb-0.5">{mem.title}</h3>
                    <p className="text-[11px] text-rose-400 font-mono mb-2">{mem.date} · {mem.location}</p>
                    <p className="font-handwritten text-lg text-rose-600 leading-snug">{mem.caption}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CHAPTER 3: Reasons I Love You & Fun Inside Jokes */}
        <section className="min-h-[60vh] flex items-center justify-center px-4 py-12 md:py-16">
          <div className="w-full max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <p className={`font-handwritten text-2xl sm:text-3xl ${cfg.subColor} mb-2`}>Since we're here…</p>
              <h2 className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight ${cfg.titleColor}`}>
                Reasons I Love You ❤️
              </h2>
              <p className={`font-body text-sm sm:text-base ${cfg.subColor} mb-10 max-w-lg mx-auto`}>
                Inside jokes, little habits, and everything that makes you unique.
              </p>

              {/* Reasons & Funny Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
                {demoReasons.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -3 }}
                    className={`rounded-2xl p-5 text-left border shadow-md transition-all ${
                      isDark
                        ? 'bg-[#1a1228]/90 border-purple-400/30 text-white'
                        : 'bg-white/90 border-rose-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-serif-display text-lg font-bold ${isDark ? 'text-purple-200' : 'text-rose-800'}`}>
                        {r.title}
                      </h3>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <p className={`text-sm ${isDark ? 'text-purple-100/80' : 'text-slate-600'} leading-relaxed`}>
                      {r.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Love Meter Card */}
              <div className={`rounded-3xl p-6 sm:p-8 max-w-md mx-auto border shadow-xl ${
                isDark ? 'bg-[#181126]/90 border-purple-400/30' : 'bg-white/90 border-rose-100'
              }`}>
                <h4 className={`font-serif-display text-2xl font-bold mb-4 ${cfg.titleColor}`}>
                  How much do I love you?
                </h4>
                {!loveMeterDone ? (
                  <>
                    <div className="text-5xl sm:text-6xl font-bold mb-4 font-serif-display text-rose-500">
                      {loveMeterValue}% ❤️
                    </div>
                    <div className="w-full h-3.5 bg-rose-100 rounded-full overflow-hidden mb-5">
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
                    <p className="text-sm font-bold text-rose-500 mb-1">LOVE LIMIT EXCEEDED</p>
                    <p className="text-5xl font-bold text-rose-500 font-serif-display mb-1">∞</p>
                    <p className={`text-xs ${cfg.subColor}`}>Can't be measured. Never ending. ❤️</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CHAPTER 4: The Invitation & Date Selection */}
        {!response && (
          <section className="min-h-[60vh] flex items-center justify-center px-4 py-12 md:py-16">
            <div className="w-full max-w-2xl text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className={`font-serif-display text-3xl sm:text-5xl font-bold mb-3 tracking-tight ${cfg.titleColor}`}>
                  Can I take you out?
                </h2>
                <p className={`font-handwritten text-2xl sm:text-3xl ${cfg.subColor} mb-8`}>
                  Coffee? Dinner? A walk? You choose.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button
                    onClick={() => handleResponse('yes')}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-rose-500/30 transition-all hover:scale-105"
                  >
                    ❤️ YES
                    <p className="text-xs font-normal mt-0.5 opacity-90">Okay, let's go.</p>
                  </button>
                  <button
                    onClick={() => handleResponse('maybe')}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-lg hover:shadow-xl hover:shadow-amber-400/30 transition-all hover:scale-105"
                  >
                    🥺 MAYBE
                    <p className="text-xs font-normal mt-0.5 opacity-90">I need a little time.</p>
                  </button>
                  <button
                    onClick={() => handleResponse('no')}
                    className={`flex-1 py-4 rounded-2xl border font-bold text-lg hover:shadow-lg transition-all hover:scale-105 ${
                      isDark ? 'bg-white/10 border-white/20 text-white/80' : 'bg-white/80 border-rose-200 text-rose-600'
                    }`}
                  >
                    🤍 NO
                    <p className="text-xs font-normal mt-0.5 opacity-70">Not right now.</p>
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Response screens */}
        <AnimatePresence>
          {response === 'yes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="text-center max-w-md w-full relative z-10 py-6">
                <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-rose-400 mb-2">
                  SHE SAID YES 😭❤️
                </h1>
                <p className="text-white/80 text-sm mb-4">The best answer ever.</p>

                {showDateSelection && (
                  <div className="rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-100/80 bg-white text-slate-800 max-h-[85vh] overflow-y-auto">
                    {dateConfirmed ? (
                      <div className="p-4 text-center">
                        <div className="text-4xl mb-2">🎉🥂✨</div>
                        <h4 className="font-serif-display text-xl font-bold text-rose-700 mb-1">It's a Date!</h4>
                        <p className="text-sm text-rose-600 mb-4">
                          You picked: <span className="font-bold">{selectedActivity ? formatCustomDateIdea(selectedActivity).emoji + ' ' + formatCustomDateIdea(selectedActivity).label : 'A special surprise!'}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setResponse(null);
                            setShowDateSelection(false);
                            setDateConfirmed(false);
                            setSelectedActivity(null);
                          }}
                          className="py-2.5 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs transition shadow-sm"
                        >
                          Back to Experience
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-rose-700 mb-1">Our Next Date? 🥂</h3>
                        <p className="text-xs text-rose-400/80 mb-4">Pick an activity or suggest your own special idea.</p>

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
                            const offeredKeys = demoExp.date_options || [];
                            const pool = PRESET_DATE_IDEAS.filter(
                              (p) => dateCategory === 'all' || p.category === dateCategory
                            );
                            return pool.map((opt) => {
                              const isSelected = selectedActivity === opt.key;
                              const isOffered = offeredKeys.includes(opt.key);
                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() => setSelectedActivity(opt.key)}
                                  className={`p-2.5 rounded-2xl transition-all border text-left flex flex-col justify-between relative ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md border-transparent scale-[1.03]'
                                      : isOffered
                                      ? 'bg-white text-rose-800 hover:bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                                      : 'bg-white/80 text-rose-600 hover:bg-rose-50 border-rose-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full mb-1">
                                    <span className="text-xl">{opt.emoji}</span>
                                    {isOffered && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 uppercase">
                                        His Pick
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                                </button>
                              );
                            });
                          })()}
                        </div>

                        {/* Custom Date Input */}
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
                              placeholder="e.g. Stargazing on the roof 🔭"
                              className="flex-1 px-3 py-2 rounded-xl bg-white border border-rose-200 outline-none text-rose-800 text-xs focus:ring-2 focus:ring-rose-300"
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
                            <p className="text-xs font-semibold text-rose-700">
                              Chosen Date: <span className="font-bold">{formatCustomDateIdea(selectedActivity).emoji} {formatCustomDateIdea(selectedActivity).label}</span>
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDateConfirmed(true)}
                            disabled={!selectedActivity}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
                          >
                            Confirm Date (Demo) ❤️
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResponse(null);
                              setShowDateSelection(false);
                            }}
                            className="py-3 px-4 rounded-xl bg-white/90 text-rose-600 font-semibold hover:bg-white text-xs border border-rose-200/70 transition"
                          >
                            Close
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {response === 'maybe' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="text-center max-w-sm rounded-3xl p-8 bg-white text-slate-800 shadow-2xl border border-amber-200">
                <Heart className="w-12 h-12 text-amber-500 mx-auto mb-4 fill-amber-300" />
                <h3 className="font-serif-display text-2xl font-bold text-amber-700 mb-2">That's okay ❤️</h3>
                <p className="text-sm text-slate-600 mb-6">Take all the time you need, pookie. You don't have to decide right now.</p>
                <button
                  onClick={() => setResponse(null)}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}

          {response === 'no' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="text-center max-w-sm rounded-3xl p-8 bg-white text-slate-800 shadow-2xl border border-slate-200">
                <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4 fill-slate-200" />
                <h3 className="font-serif-display text-2xl font-bold text-slate-700 mb-2">I understand ❤️</h3>
                <p className="text-sm text-slate-600 mb-6">Thank you for reading everything. I genuinely mean the apology. Take care of yourself.</p>
                <button
                  onClick={() => setResponse(null)}
                  className="px-6 py-2.5 rounded-full bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold shadow transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer
          isDark={isDark}
          accentColor={cfg.accent}
          tagline="This was a demo • From my heart, to yours"
          className="mt-12"
        />
      </div>
    </div>
  );
}
