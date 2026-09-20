'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sun, Moon, X } from 'lucide-react';
import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG, normalizeTheme } from '@/lib/types';
import { ParchmentLetter } from '@/components/experience/parchment-letter';
import { InteractiveEnvelope } from '@/components/experience/interactive-envelope';
import { FloatingAmbientHearts } from '@/components/experience/floating-ambient-hearts';

export default function DemoExperiencePage() {
  const [opened, setOpened] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ExperienceTheme>('light');
  const [answer, setAnswer] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [customDateInput, setCustomDateInput] = useState('');
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<{ url: string; caption?: string } | null>(null);

  const cfg = THEME_CONFIG[normalizeTheme(selectedTheme)] || THEME_CONFIG.light;

  const dateIdeas = [
    { label: 'Coffee & Talk', emoji: '☕' },
    { label: 'Dinner Date', emoji: '🍕' },
    { label: 'Movie Night', emoji: '🎬' },
    { label: 'Stargazing Night', emoji: '🔭' },
    { label: 'Sunset Walk', emoji: '🌅' },
    { label: 'Surprise Me', emoji: '✨' },
  ];

  const handleSelectDate = (labelWithEmoji: string) => {
    setSelectedDate(labelWithEmoji);
  };

  const handlePickCustom = () => {
    if (!customDateInput.trim()) return;
    setSelectedDate(`✨ ${customDateInput.trim()}`);
    setCustomDateInput('');
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-3 sm:p-6 font-sans-body min-h-screen">
      {/* Control Header & Theme Switcher Bar */}
      <div className="max-w-4xl mx-auto bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-2xl mb-6 sticky top-3 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>🎨 Live Relationship Experience Showcase</span>
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Light & Dark Modes
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Apology Letter • Love Letter • Polaroids • Gallery • Inside Jokes • Love Reasons • 6 Date Ideas
            </p>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setOpened(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                !opened ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              💌 Envelope
            </button>
            <button
              type="button"
              onClick={() => setOpened(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                opened ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              📖 Opened Story
            </button>
          </div>
        </div>

        {/* Theme Selector: Light vs Dark only */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => setSelectedTheme('light')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
              selectedTheme === 'light'
                ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-md ring-1 ring-amber-400/40'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-bold">☀️ Light Mode</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(Warm romantic stationery)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTheme('dark')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
              selectedTheme === 'dark'
                ? 'border-rose-400 bg-rose-500/20 text-rose-200 shadow-md ring-1 ring-rose-400/40'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Moon className="w-4 h-4 text-rose-300" />
            <span className="font-bold">🌙 Dark Mode</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(Cinematic night letter)</span>
          </button>
        </div>
      </div>

      {/* Main Showcase Container */}
      <div
        id="previewCanvas"
        className={`font-playfair max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border transition-all duration-500 relative min-h-[600px] flex flex-col justify-center ${cfg.canvasBg}`}
      >
        {/* Ambient Floating Hearts Background Layer */}
        <FloatingAmbientHearts theme={selectedTheme} />

        {/* VIEW 1: UNOPENED ENVELOPE (Interactive) */}
        {!opened ? (
          <InteractiveEnvelope
            receiverName="My Pookie"
            senderName="SomeOne Special"
            subtitle="a little something I made with my whole heart"
            theme={selectedTheme}
            onOpen={() => setOpened(true)}
          />
        ) : (
          /* VIEW 2: OPENED EXPERIENCE STORY (All Features) */
          <div className="py-12 px-4 sm:px-8 max-w-3xl mx-auto w-full space-y-12 relative z-10">
            {/* SECTION 1: The Apology Letter */}
            <div>
              <ParchmentLetter
                badge="From the bottom of my heart"
                title="Things I Should Have Said Properly…"
                senderName="SomeOne Special"
                receiverName="My Pookie"
                content="I'm sorry. Not the casual 'sorry yaar' kind. The real one.&#10;&#10;I know I messed up. I know I said the wrong thing at the wrong time. And I know that 'I was tired' or 'I was stressed' doesn't excuse making you feel hurt.&#10;&#10;You didn't deserve that. You deserved patience, gentleness, and better from me. And I genuinely promise to do better."
                theme={selectedTheme}
              />
            </div>

            {/* SECTION 2: The Love Letter & Secret Note */}
            <div>
              <ParchmentLetter
                badge="Beyond any fight, there is us"
                title="What You Truly Mean To Me ❤️"
                senderName="SomeOne Special"
                receiverName="My Pookie"
                receiverNickname="Pookie"
                content="Before this little fight, there was an entire story called us. The late-night calls where we talked about nothing for hours, laughing until our stomachs hurt, and all the quiet moments where I knew you were my favorite person in the entire world.&#10;&#10;I love you. Not the social media caption kind. The real, quiet, show-up-for-you kind of love."
                secretNote="P.S. Whatever happens, you deserve the sweetest smile today. Take all the time you need. You will always be special to me. ❤️"
                theme={selectedTheme}
              />
            </div>

            {/* SECTION 3: Our Favorite Memories 📸 (Polaroids) */}
            <div>
              <div className="text-center mb-6">
                <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Remember these moments?</p>
                <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold ${cfg.titleColor}`}>
                  Our Favorite Memories 📸
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Polaroid 1 */}
                <div
                  className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border-2 transition-all text-left relative transform -rotate-1 hover:rotate-0 ${
                    cfg.isDark ? 'border-slate-300/90 shadow-2xl shadow-black/80' : 'border-rose-200 shadow-xl shadow-rose-200/30'
                  }`}
                >
                  <div
                    className={`polaroid-tape absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 rounded-xs rotate-2 pointer-events-none shadow-xs ${cfg.tapeColor}`}
                  />
                  <div
                    className={`polaroid-inner h-32 sm:h-36 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner ${cfg.polaroidInnerBg}`}
                  >
                    ☕
                  </div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">The First Date</p>
                  <p className="font-script text-base text-[#E11D48] leading-snug font-semibold">
                    Spilled coffee & still got your number
                  </p>
                </div>

                {/* Polaroid 2 */}
                <div
                  className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border-2 transition-all text-left relative transform rotate-2 hover:rotate-0 ${
                    cfg.isDark ? 'border-slate-300/90 shadow-2xl shadow-black/80' : 'border-rose-200 shadow-xl shadow-rose-200/30'
                  }`}
                >
                  <div
                    className={`polaroid-tape absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 rounded-xs -rotate-2 pointer-events-none shadow-xs ${cfg.tapeColor}`}
                  />
                  <div
                    className={`polaroid-inner h-32 sm:h-36 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner ${cfg.polaroidInnerBg}`}
                  >
                    ⛰️
                  </div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">Mountain Trip</p>
                  <p className="font-script text-base text-[#E11D48] leading-snug font-semibold">
                    You made me take 400 photos & I loved it
                  </p>
                </div>

                {/* Polaroid 3 */}
                <div
                  className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border-2 transition-all text-left relative transform -rotate-2 hover:rotate-0 ${
                    cfg.isDark ? 'border-slate-300/90 shadow-2xl shadow-black/80' : 'border-rose-200 shadow-xl shadow-rose-200/30'
                  }`}
                >
                  <div
                    className={`polaroid-tape absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 rounded-xs rotate-1 pointer-events-none shadow-xs ${cfg.tapeColor}`}
                  />
                  <div
                    className={`polaroid-inner h-32 sm:h-36 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner ${cfg.polaroidInnerBg}`}
                  >
                    🍕
                  </div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">Pizza Disaster</p>
                  <p className="font-script text-base text-[#E11D48] leading-snug font-semibold">
                    Burned pasta, best pizza ever
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 4: Evidence That We Are Cute 🖼️ (Photo Gallery) */}
            <div>
              <div className="text-center mb-6">
                <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Evidence That You're</p>
                <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold ${cfg.titleColor}`}>
                  My Favorite Person to Look At 🖼️
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
                    fullUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
                    caption: 'That sunset walk by the beach 🌅',
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80',
                    fullUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80',
                    caption: "Laughing so hard we couldn't breathe 😂",
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
                    fullUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
                    caption: 'Every little coffee date with you ☕',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxItem({ url: item.fullUrl, caption: item.caption })}
                    className="relative rounded-2xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10 group cursor-pointer aspect-4/3 bg-black/10"
                  >
                    <img
                      src={item.url}
                      alt="Gallery"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-left">
                      <p className="font-script text-white text-base leading-snug">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: Inside Jokes 😂 */}
            <div>
              <div className="text-center mb-6">
                <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Inside jokes only we understand</p>
                <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold ${cfg.titleColor}`}>
                  Our Shared Brain Cells 😂❤️
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    title: 'The Autocorrect Incident',
                    emoji: '😜',
                    desc: 'You texted "I love you boob" instead of "I love you boo" and I will never let you forget it.',
                  },
                  {
                    title: 'The Dance Battle',
                    emoji: '💃',
                    desc: 'You challenged me to a dance battle, tripped on your own foot, and still declared yourself the winner.',
                  },
                  {
                    title: 'The Cooking Disaster',
                    emoji: '🍳',
                    desc: 'You tried to make pasta and set off the smoke alarm. We ordered pizza and it was the best night ever.',
                  },
                ].map((joke, idx) => (
                  <div
                    key={idx}
                    className={`joke-card rounded-2xl p-5 border shadow-md text-left transition hover:-translate-y-1 ${cfg.jokeCardBg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif-title text-base font-bold">{joke.title}</h4>
                      <span className="text-xl">{joke.emoji}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-80">{joke.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6: Reasons I Love You ❤️ */}
            <div>
              <div className="text-center mb-6">
                <p className={`font-script text-2xl ${cfg.subColor} mb-1`}>Since we&apos;re here…</p>
                <h3 className={`font-serif-title text-2xl sm:text-3xl font-bold ${cfg.titleColor}`}>
                  Reasons I Love You ❤️
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Your Real Laugh',
                    desc: 'Not the polite one. The one where your whole face scrunches up and you snort.',
                  },
                  {
                    title: 'Your Random Habits',
                    desc: 'You hum while you think. You talk to plants. You name your pillows. All of it.',
                  },
                  {
                    title: 'The Way You Care',
                    desc: 'You remember things I told you months ago, and check in on them every single time.',
                  },
                  {
                    title: 'You Being Exactly You',
                    desc: 'No explanations needed. Just you, exactly the way you are.',
                  },
                ].map((reason, idx) => (
                  <div
                    key={idx}
                    className={`reason-card rounded-2xl p-5 border shadow-md text-left transition hover:-translate-y-1 ${cfg.jokeCardBg}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-serif-title text-base font-bold">{reason.title}</h4>
                      <span className="text-amber-400 text-sm">★</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-80">{reason.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 7: The Invitation & Simplified 6-Card Date Picker */}
            <div id="inviteCard" className={`rounded-3xl p-6 sm:p-10 text-center border shadow-2xl ${cfg.inviteBg}`}>
              <h3 className={`font-serif-title text-3xl sm:text-4xl font-bold mb-2 ${cfg.titleColor}`}>
                Can I take you out?
              </h3>
              <p className={`text-sm opacity-80 mb-6 font-script text-2xl ${cfg.subColor}`}>
                Coffee? Dinner? A walk? You choose.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto mb-6">
                <button
                  type="button"
                  onClick={() => setAnswer('yes')}
                  className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-base text-white shadow-xl transition-all transform hover:scale-105 cursor-pointer ${
                    answer === 'yes'
                      ? `${cfg.buttonPrimary} ring-4 ${cfg.isDark ? 'ring-blue-400/50' : 'ring-rose-400/50'} scale-105`
                      : cfg.buttonPrimary
                  }`}
                >
                  ❤️ YES
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer('maybe')}
                  className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-base shadow-lg transition-all transform hover:scale-105 cursor-pointer border-2 ${
                    answer === 'maybe'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-300 ring-4 ring-amber-400/50 scale-105'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-amber-300/80'
                  }`}
                >
                  🥺 MAYBE
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer('no')}
                  className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-base border-2 shadow-md transition-all transform hover:scale-105 cursor-pointer ${
                    answer === 'no'
                      ? `${cfg.isDark ? 'bg-slate-700 border-slate-400 ring-4 ring-slate-400/50' : 'bg-slate-200 border-slate-400 ring-4 ring-slate-400/50'} scale-105`
                      : cfg.isDark
                      ? 'bg-[#131F37] hover:bg-[#1C2C4E] text-slate-200 border-slate-600 hover:border-slate-500'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  🤍 NO
                </button>
              </div>

              {/* SIMPLIFIED 6 DATE OPTIONS (Appears on YES) */}
              {answer === 'yes' && (
                <div className={`mt-4 p-5 sm:p-6 rounded-2xl border-2 text-left ${cfg.dateBoxBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                      <span>🥂</span>
                      <span>Pick Our Date Activity</span>
                    </p>
                    <span className={`text-[11px] font-script ${cfg.subColor} text-lg`}>
                      She said yes! ❤️
                    </span>
                  </div>

                  {/* 6 Clean Date Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                    {dateIdeas.map((idea, idx) => {
                      const isSelected = selectedDate === `${idea.emoji} ${idea.label}`;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectDate(`${idea.emoji} ${idea.label}`)}
                          className={`date-card p-3 rounded-2xl text-xs font-bold text-center transition-all flex flex-col items-center justify-center gap-1.5 border-2 cursor-pointer ${
                            isSelected ? cfg.dateCardActive : cfg.dateCardBg
                          }`}
                        >
                          <span className="text-2xl">{idea.emoji}</span>
                          <span className="leading-tight">{idea.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual Suggestion Input Box */}
                  <div className="mb-4 pt-2 border-t border-black/10 dark:border-white/10">
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 opacity-75">
                      Or Suggest Your Own Date Idea ✨
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={customDateInput}
                        onChange={(e) => setCustomDateInput(e.target.value)}
                        placeholder="e.g. Stargazing on the roof 🔭, Baking together 🍪"
                        className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none border-2 focus:ring-2 ${cfg.inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={handlePickCustom}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition shadow-md cursor-pointer ${cfg.buttonPrimary}`}
                      >
                        Pick
                      </button>
                    </div>
                  </div>

                  {/* Selected feedback badge */}
                  {selectedDate && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-between">
                      <p className={`text-xs font-semibold ${cfg.subColor}`}>
                        Chosen: <span className="font-bold">{selectedDate}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className={`text-[11px] hover:underline cursor-pointer ${cfg.subColor}`}
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {dateConfirmed ? (
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs font-semibold text-center">
                      🎉 It&apos;s a Date! Your choice (&quot;{selectedDate}&quot;) has been sent to him!
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedDate) {
                          alert('Please pick a date idea first! ❤️');
                          return;
                        }
                        setDateConfirmed(true);
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs text-white shadow-lg transition text-center cursor-pointer ${cfg.buttonPrimary}`}
                    >
                      Confirm Date Request ❤️
                    </button>
                  )}
                </div>
              )}

              {/* Feedback on Maybe */}
              {answer === 'maybe' && (
                <div className="mt-4 p-5 sm:p-6 rounded-2xl border text-left bg-amber-50/80 border-amber-200 text-slate-800 dark:bg-amber-950/50 dark:border-amber-400/30 dark:text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🥺❤️</span>
                    <h4 className="font-serif-title text-xl font-bold text-amber-500">
                      That&apos;s completely okay
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                    Take all the time you need, pookie. There is zero pressure. You don&apos;t have to decide right now.
                  </p>
                </div>
              )}

              {/* Feedback on No */}
              {answer === 'no' && (
                <div className="mt-4 p-5 sm:p-6 rounded-2xl border text-left bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900/60 dark:border-slate-700 dark:text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🤍</span>
                    <h4 className="font-serif-title text-xl font-bold text-slate-400">
                      I understand completely
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                    Thank you for reading everything. I genuinely mean the apology and wanted to make you smile. Take care of yourself.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
          onClick={() => setLightboxItem(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxItem(null)}
            className="absolute top-4 right-4 text-white hover:text-rose-300 p-2 rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxItem.url}
            alt="Enlarged photo"
            className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxItem.caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-script text-white text-lg sm:text-xl text-center px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full max-w-[90vw]">
              {lightboxItem.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
