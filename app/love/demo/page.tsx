'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, RefreshCw, Palette
} from 'lucide-react';
import type { Experience, Memory, ResponseStatus, ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';
import { Footer } from '@/components/footer';
import { ParchmentLetter } from '@/components/experience/parchment-letter';
import { InteractiveEnvelope } from '@/components/experience/interactive-envelope';
import { FloatingReactions } from '@/components/experience/floating-reactions';
import { formatCustomDateIdea } from '@/lib/date-ideas';
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
  { id: '1', experience_id: 'demo', title: 'The First Date', date: '2023-01-15', location: 'Coffee Shop', media_url: '', media_type: 'image', caption: 'Spilled coffee & still got your number', category: 'first-date', sort_order: 0, created_at: '', updated_at: '' },
  { id: '2', experience_id: 'demo', title: 'Mountain Trip', date: '2023-06-20', location: 'Mountains', media_url: '', media_type: 'image', caption: 'You made me take 400 photos & I loved it', category: 'trips', sort_order: 1, created_at: '', updated_at: '' },
  { id: '3', experience_id: 'demo', title: 'Pizza Disaster', date: '2023-09-08', location: 'Home', media_url: '', media_type: 'image', caption: 'Burned pasta, best pizza ever', category: 'random', sort_order: 2, created_at: '', updated_at: '' },
];

export default function DemoExperiencePage() {
  const [opened, setOpened] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ExperienceTheme>('pink-dream');
  const [response, setResponse] = useState<ResponseStatus | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [customDateInput, setCustomDateInput] = useState('');
  const [dateConfirmed, setDateConfirmed] = useState(false);

  const handleOpen = () => setOpened(true);

  const handleResponse = (resp: ResponseStatus) => {
    setResponse(resp);
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

  // OPENED VIEW (Matches preview.html exactly: 3 clean, non-bloated romantic sections)
  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.openedBg} ${cfg.textColor} transition-colors duration-500 relative`}>
      {themeSwitcherBar}

      {/* Continuous ambient background floating hearts */}
      <FloatingAmbientHearts theme={selectedTheme} />

      {/* Floating Reaction Dock */}
      <FloatingReactions isDark={isDark} />

      <div className="relative z-10 pt-20 pb-16 px-4 sm:px-8 w-full max-w-3xl mx-auto space-y-12">
        
        {/* SECTION 1: The Heartfelt Stationery Letter */}
        <section>
          <ParchmentLetter
            badge="To the love of my life"
            title="Things I Should Have Said Properly…"
            senderName={demoExp.sender_name}
            receiverName={demoExp.receiver_name}
            content={demoExp.apology_message}
            secretNote="P.S. You deserve the sweetest smile today. No matter what, thank you for being the most special part of my life. ❤️"
            theme={selectedTheme}
            isDark={isDark}
            accentColor={cfg.accent}
          />
        </section>

        {/* SECTION 2: Sweet Memories & Inside Jokes (Compact, Non-Bloated) */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className={`font-serif-display text-2xl sm:text-3xl font-bold text-center mb-6 tracking-tight ${cfg.titleColor}`}>
              Our Favorite Memories 📸
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Polaroid 1 */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 0 }}
                className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-rose-100/70 transform -rotate-1 transition-all text-left relative"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 bg-rose-200/60 rounded-xs rotate-2 pointer-events-none" />
                <div className="h-32 sm:h-36 bg-rose-100/70 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner">
                  ☕
                </div>
                <p className="font-bold text-sm text-rose-950 mb-0.5">The First Date</p>
                <p className="font-script text-base text-rose-600 leading-snug">
                  Spilled coffee & still got your number
                </p>
              </motion.div>

              {/* Polaroid 2 */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 0 }}
                className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-rose-100/70 transform rotate-2 transition-all text-left relative"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 bg-purple-200/60 rounded-xs -rotate-2 pointer-events-none" />
                <div className="h-32 sm:h-36 bg-purple-100/70 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner">
                  ⛰️
                </div>
                <p className="font-bold text-sm text-rose-950 mb-0.5">Mountain Trip</p>
                <p className="font-script text-base text-rose-600 leading-snug">
                  You made me take 400 photos & I loved it
                </p>
              </motion.div>

              {/* Polaroid 3 */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 0 }}
                className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-rose-100/70 transform -rotate-2 transition-all text-left relative"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 bg-amber-200/60 rounded-xs rotate-1 pointer-events-none" />
                <div className="h-32 sm:h-36 bg-amber-100/70 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner">
                  🍕
                </div>
                <p className="font-bold text-sm text-rose-950 mb-0.5">Pizza Disaster</p>
                <p className="font-script text-base text-rose-600 leading-snug">
                  Burned pasta, best pizza ever
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 3: The Invitation & Inline Date Picker */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl p-6 sm:p-10 text-center border shadow-2xl transition-all relative ${cfg.cardBg}`}
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
                    ? 'bg-rose-500 text-white ring-2 ring-rose-400 ring-offset-2'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
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
                  <div className={`mt-4 p-5 sm:p-6 rounded-2xl border text-left ${
                    isDark
                      ? 'bg-purple-950/60 border-purple-400/30 text-white'
                      : 'bg-rose-50/70 border-rose-200/80 text-slate-800'
                  }`}>
                    {dateConfirmed ? (
                      <div className="text-center py-4">
                        <div className="text-4xl mb-2">🎉🥂✨</div>
                        <h4 className="font-serif-display text-2xl font-bold text-rose-500 mb-1">
                          It&apos;s a Date!
                        </h4>
                        <p className={`text-sm mb-4 ${isDark ? 'text-purple-200' : 'text-slate-600'}`}>
                          You chose:{' '}
                          <span className="font-bold text-rose-500">
                            {selectedActivity
                              ? `${formatCustomDateIdea(selectedActivity).emoji} ${formatCustomDateIdea(selectedActivity).label}`
                              : 'A special surprise!'}
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setDateConfirmed(false);
                            setSelectedActivity(null);
                          }}
                          className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow transition"
                        >
                          Change Date Idea
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                            <span>🥂</span>
                            <span>Pick Our Date Activity</span>
                          </p>
                          <span className="text-[11px] font-script text-rose-500 text-lg">
                            She said yes! ❤️
                          </span>
                        </div>

                        {/* Date Ideas Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                          {[
                            { key: 'coffee', label: 'Coffee Date', emoji: '☕' },
                            { key: 'dinner', label: 'Dinner & Wine', emoji: '🍕' },
                            { key: 'movie', label: 'Movie Night', emoji: '🎬' },
                            { key: 'stargazing', label: 'Stargazing', emoji: '🔭' },
                            { key: 'walk', label: 'Sunset Walk', emoji: '🌅' },
                            { key: 'drive', label: 'Late Drive', emoji: '🚗' },
                            { key: 'cook', label: 'Cook Together', emoji: '🍝' },
                            { key: 'surprise', label: 'Surprise Me', emoji: '✨' },
                          ].map((item) => {
                            const isSelected = selectedActivity === item.key;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => setSelectedActivity(item.key)}
                                className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all flex flex-col items-center justify-center gap-1 border ${
                                  isSelected
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-[1.03]'
                                    : isDark
                                    ? 'bg-white/5 text-purple-100 hover:bg-white/10 border-purple-400/20'
                                    : 'bg-white text-slate-700 hover:bg-rose-100/60 border-rose-200/80'
                                }`}
                              >
                                <span className="text-lg">{item.emoji}</span>
                                <span className="leading-tight">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Date Input */}
                        <div className="mb-4 pt-2 border-t border-black/10 dark:border-white/10">
                          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-75">
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
                              placeholder="e.g. Picnic by the lake, Bookstore date..."
                              className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none border focus:ring-2 focus:ring-rose-400 ${
                                isDark
                                  ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                                  : 'bg-white border-rose-200 text-slate-800 placeholder-slate-400'
                              }`}
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
                              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold disabled:opacity-40 transition"
                            >
                              Pick
                            </button>
                          </div>
                        </div>

                        {selectedActivity && (
                          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-between">
                            <p className="text-xs font-semibold text-rose-500">
                              Selected: <span className="font-bold">{formatCustomDateIdea(selectedActivity).emoji} {formatCustomDateIdea(selectedActivity).label}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setSelectedActivity(null)}
                              className="text-[11px] text-rose-400 hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDateConfirmed(true)}
                            disabled={!selectedActivity}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow transition disabled:opacity-40"
                          >
                            Confirm Date (Demo) ❤️
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
                    <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? 'text-amber-200/90' : 'text-slate-600'}`}>
                      Take all the time you need, pookie. There is zero pressure. You don&apos;t have to decide right now.
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setResponse(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow transition"
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

        {/* Footer */}
        <Footer
          isDark={isDark}
          accentColor={cfg.accent}
          tagline="This was a demo • From my heart, to yours"
          className="mt-8"
        />
      </div>
    </div>
  );
}
