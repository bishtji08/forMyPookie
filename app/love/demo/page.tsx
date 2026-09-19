'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Star, RefreshCw, Palette, X, ArrowRight
} from 'lucide-react';
import type {
  Experience, Memory, FunnyMoment, LoveReason, GalleryItem,
  ResponseStatus, ExperienceTheme
} from '@/lib/types';
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
  receiver_name: 'Cutie Pie',
  receiver_nickname: 'Cuitee',
  sender_name: 'Anuj',
  relationship: 'Girlfriend',
  apology_message: "I'm sorry. Not the casual 'sorry yaar' kind. The real one.\n\nI know I messed up. I know I said the wrong thing at the wrong time. And I know that 'I was tired' or 'I was stressed' doesn't excuse it.\n\nYou didn't deserve that. You deserved better from me. And I promise to do better.",
  love_letter: "Before this little fight, there was an entire story called us. The late-night calls where we talked about nothing for hours, laughing until our stomachs hurt, and all the quiet moments where I knew you were my favorite person.\n\nI love you. Not the Instagram caption kind. The real, quiet, show-up-for-you kind.",
  final_letter: "P.S. Whatever your answer is, I just want you to smile today. Take all the time you need. You will always be special to me. ❤️",
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
  { id: '1', experience_id: 'demo', title: 'The First Date', date: '2023-01-15', location: 'Corner Café', media_url: null, media_type: 'image', caption: 'Spilled coffee & still got your number', category: 'first-date', sort_order: 0, created_at: '', updated_at: '' },
  { id: '2', experience_id: 'demo', title: 'Mountain Trip', date: '2023-06-20', location: 'High Peaks', media_url: null, media_type: 'image', caption: 'You made me take 400 photos & I loved it', category: 'trips', sort_order: 1, created_at: '', updated_at: '' },
  { id: '3', experience_id: 'demo', title: 'Pizza Disaster', date: '2023-09-08', location: 'Living Room', media_url: null, media_type: 'image', caption: 'Burned pasta, best pizza ever', category: 'random', sort_order: 2, created_at: '', updated_at: '' },
];

const demoGallery: GalleryItem[] = [
  { id: '1', experience_id: 'demo', media_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80', media_type: 'image', caption: 'That sunset walk by the beach 🌅', category: 'trips', sort_order: 0, created_at: '' },
  { id: '2', experience_id: 'demo', media_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80', media_type: 'image', caption: 'Laughing so hard we couldn\'t breathe 😂', category: 'random', sort_order: 1, created_at: '' },
  { id: '3', experience_id: 'demo', media_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80', media_type: 'image', caption: 'Every little coffee date with you ☕', category: 'first-date', sort_order: 2, created_at: '' },
];

const demoFunny: FunnyMoment[] = [
  { id: '1', experience_id: 'demo', title: 'The Autocorrect Incident', description: 'You texted "I love you boob" instead of "I love you boo" and I will never let you forget it.', image_url: null, date: null, sort_order: 0, created_at: '' },
  { id: '2', experience_id: 'demo', title: 'The Dance Battle', description: 'You challenged me to a dance battle, tripped on your own foot, and still declared yourself the winner.', image_url: null, date: null, sort_order: 1, created_at: '' },
  { id: '3', experience_id: 'demo', title: 'The Cooking Disaster', description: 'You tried to make pasta and set off the smoke alarm. We ordered pizza and it was the best night ever.', image_url: null, date: null, sort_order: 2, created_at: '' },
];

const demoReasons: LoveReason[] = [
  { id: '1', experience_id: 'demo', title: 'Your Real Laugh', description: 'Not the polite one. The one where your whole face scrunches up and you snort.', image_url: null, sort_order: 0, created_at: '' },
  { id: '2', experience_id: 'demo', title: 'Your Random Habits', description: 'You hum while you think. You talk to plants. You name your pillows. All of it.', image_url: null, sort_order: 1, created_at: '' },
  { id: '3', experience_id: 'demo', title: 'The Way You Care', description: 'You remember things I told you months ago, and check in on them every single time.', image_url: null, sort_order: 2, created_at: '' },
  { id: '4', experience_id: 'demo', title: 'You Being Exactly You', description: 'No explanations needed. Just you, exactly the way you are.', image_url: null, sort_order: 3, created_at: '' },
];

// Simplified 6 Core Date Ideas
const SIMPLE_DATE_IDEAS = [
  { key: 'coffee', label: 'Coffee & Talk', emoji: '☕' },
  { key: 'dinner', label: 'Dinner Date', emoji: '🍕' },
  { key: 'movie', label: 'Movie Night', emoji: '🎬' },
  { key: 'stargazing', label: 'Stargazing Night', emoji: '🔭' },
  { key: 'walk', label: 'Sunset Walk', emoji: '🌅' },
  { key: 'surprise', label: 'Surprise Me', emoji: '✨' },
];

export default function DemoExperiencePage() {
  const [opened, setOpened] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ExperienceTheme>('pink-dream');
  const [response, setResponse] = useState<ResponseStatus | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [customDateInput, setCustomDateInput] = useState('');
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<{ url: string; caption?: string } | null>(null);

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

        {/* Ambient floating 3D hearts background */}
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

  // OPENED VIEW: Complete, cohesive story adapting across all themes
  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.openedBg} ${cfg.textColor} transition-colors duration-500 relative`}>
      {themeSwitcherBar}

      {/* Continuous ambient background floating hearts */}
      <FloatingAmbientHearts theme={selectedTheme} />

      {/* Floating Reaction Dock */}
      <FloatingReactions isDark={isDark} />

      <div className="relative z-10 pt-20 pb-16 px-4 sm:px-8 w-full max-w-3xl mx-auto space-y-12">
        
        {/* 1. THE APOLOGY MESSAGE (If provided by sender) */}
        {demoExp.apology_message && (
          <section>
            <ParchmentLetter
              badge="From the bottom of my heart"
              title="Things I Should Have Said Properly…"
              senderName={demoExp.sender_name}
              receiverName={demoExp.receiver_name}
              content={demoExp.apology_message}
              theme={selectedTheme}
              isDark={isDark}
              accentColor={cfg.accent}
            />
          </section>
        )}

        {/* 2. THE LOVE LETTER & FINAL MESSAGE (If provided by sender) */}
        {demoExp.love_letter && (
          <section>
            <ParchmentLetter
              badge="Beyond any fight, there is us"
              title="What You Truly Mean To Me ❤️"
              senderName={demoExp.sender_name}
              receiverName={demoExp.receiver_name}
              content={demoExp.love_letter}
              secretNote={demoExp.final_letter || undefined}
              theme={selectedTheme}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {demoMemories.map((mem, i) => (
                <motion.div
                  key={mem.id}
                  whileHover={{ scale: 1.04, rotate: 0 }}
                  className={`bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-black/10 dark:border-white/10 transition-all text-left relative ${
                    i === 0 ? 'transform -rotate-1' : i === 1 ? 'transform rotate-2' : 'transform -rotate-2'
                  }`}
                >
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-5 ${cfg.tapeColor} rounded-xs rotate-2 pointer-events-none`} />
                  <div className={`h-32 sm:h-36 ${cfg.polaroidInnerBg} rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner`}>
                    {i === 0 ? '☕' : i === 1 ? '⛰️' : '🍕'}
                  </div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">{mem.title}</p>
                  <p className={`font-script text-base ${cfg.subColor} leading-snug`}>
                    {mem.caption}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 4. PHOTO GALLERY 🖼️ (Evidence we're actually cute together) */}
        {demoGallery.length > 0 && (
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
                {demoGallery.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setLightboxItem({ url: item.media_url, caption: item.caption })}
                    className="relative rounded-2xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10 group cursor-pointer aspect-4/3 bg-black/10"
                  >
                    <img
                      src={item.media_url}
                      alt={item.caption || 'Memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
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

        {/* 5. FUNNY MOMENTS & INSIDE JOKES 😂 */}
        {demoFunny.length > 0 && (
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
                {demoFunny.map((f) => (
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

        {/* 6. REASONS I LOVE YOU ❤️ */}
        {demoReasons.length > 0 && (
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
                {demoReasons.map((r) => (
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

            {/* INLINE EXPANSION: On YES (Clean 6 ideas + manual enter) */}
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
                          You chose:{' '}
                          <span className={`font-bold ${cfg.subColor}`}>
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
                          className={`px-5 py-2 rounded-xl ${cfg.buttonPrimary} text-xs font-semibold shadow transition`}
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
                          <span className={`text-[11px] font-script text-lg ${cfg.subColor}`}>
                            She said yes! ❤️
                          </span>
                        </div>

                        {/* Exactly 6 Clean Date Ideas */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                          {SIMPLE_DATE_IDEAS.map((item) => {
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
                          })}
                        </div>

                        {/* Manual Date Suggestion Box */}
                        <div className="mb-4 pt-3 border-t border-black/10 dark:border-white/10">
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
                                Selected: <span className="font-bold">{formatCustomDateIdea(selectedActivity).emoji} {formatCustomDateIdea(selectedActivity).label}</span>
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
                              placeholder="Add a sweet note for him (optional)..."
                              rows={2}
                              className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none border resize-none focus:ring-2 ${cfg.inputBg}`}
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDateConfirmed(true)}
                            disabled={!selectedActivity}
                            className={`flex-1 py-2.5 px-4 rounded-xl ${cfg.buttonPrimary} font-bold text-xs shadow transition disabled:opacity-40`}
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

        {/* Lightbox for Gallery Photos */}
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
                type="button"
                className="absolute top-4 right-4 text-white hover:text-rose-300 transition p-2 rounded-full bg-white/10"
                onClick={() => setLightboxItem(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                src={lightboxItem.url}
                alt={lightboxItem.caption || 'Memory'}
                className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              {lightboxItem.caption && (
                <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-script text-white text-lg sm:text-xl text-center px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full max-w-[90vw]">
                  {lightboxItem.caption}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
