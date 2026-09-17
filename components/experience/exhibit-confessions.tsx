'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPop } from '@/lib/audio-effects';

interface ExhibitConfessionsProps {
  relationship?: string;
  senderName?: string;
  accentColor?: string;
}

const DEFAULT_CONFESSIONS = [
  { id: '1', emoji: '🤡', text: 'Said "I\'m fine" while very obviously not fine.' },
  { id: '2', emoji: '📵', text: 'Replied "hmm" to a paragraph you clearly spent effort on.' },
  { id: '3', emoji: '🧠', text: 'Chose being right over being kind. Terrible trade.' },
  { id: '4', emoji: '🍟', text: 'Ate the last fry. I know. I know.' },
  { id: '5', emoji: '💤', text: 'Fell asleep during the most emotional part of the movie.' },
  { id: '6', emoji: '📱', text: 'Got distracted when you were telling a super cute story.' },
];

export function ExhibitConfessions({
  relationship = 'Girlfriend',
  senderName,
  accentColor = '#e85d8d',
}: ExhibitConfessionsProps) {
  const [stamped, setStamped] = useState<Record<string, boolean>>({});

  // Dynamic role title (e.g. if relationship is Girlfriend, sender is Boyfriend)
  const relLower = relationship?.toLowerCase() || '';
  const roleTitle = relLower.includes('girl') || relLower.includes('wife')
    ? 'Boyfriend'
    : relLower.includes('boy') || relLower.includes('husband')
    ? 'Girlfriend'
    : senderName ? `${senderName}'s` : 'Partner';

  const handleStamp = (id: string) => {
    setStamped((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      playPop();
      return next;
    });
  };

  const guiltyCount = Object.values(stamped).filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl mx-auto text-center px-4">
      {/* Title matching Image 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#3d2730] mb-2">
          Exhibit A: My Stupid {roleTitle} Behaviour
        </h2>
        <p className="font-handwritten text-xl sm:text-2xl text-rose-500/80 italic mb-8">
          presented honestly, without a lawyer 📜⚖️
        </p>
      </motion.div>

      {/* Confession Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
        {DEFAULT_CONFESSIONS.map((item, idx) => {
          const isGuilty = !!stamped[item.id];
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleStamp(item.id)}
              className={`w-full group text-left px-5 py-4 rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 shadow-sm border ${
                isGuilty
                  ? 'bg-rose-50/90 border-rose-300/80 shadow-rose-200/50'
                  : 'bg-white/80 hover:bg-white border-white/80 hover:border-rose-100 shadow-rose-100/30'
              } backdrop-blur-md cursor-pointer`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <span className="text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform select-none">
                  {item.emoji}
                </span>
                <span className="text-sm sm:text-base font-normal text-rose-950/80 leading-snug">
                  {item.text}
                </span>
              </div>

              {/* Stamp Badge */}
              <div className="shrink-0 ml-2">
                <AnimatePresence mode="wait">
                  {isGuilty ? (
                    <motion.div
                      key="guilty"
                      initial={{ scale: 2, rotate: -15, opacity: 0 }}
                      animate={{ scale: 1, rotate: -6, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="px-2.5 py-0.5 rounded border-2 border-red-500/90 text-red-600 font-extrabold text-[11px] uppercase tracking-wider bg-red-50 shadow-sm select-none"
                    >
                      GUILTY ⚖️
                    </motion.div>
                  ) : (
                    <span className="text-[11px] text-rose-300 font-handwritten group-hover:text-rose-500 transition-colors select-none">
                      tap to stamp
                    </span>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Tally & Verdict Footer matching Image 1 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-8 space-y-2"
      >
        {guiltyCount > 0 && (
          <p className="text-xs text-rose-400 font-medium tracking-wide uppercase">
            {guiltyCount} of {DEFAULT_CONFESSIONS.length} charges convicted by jury
          </p>
        )}
        <p className="font-handwritten text-xl sm:text-2xl text-rose-600/90 font-medium">
          Verdict: guilty. Sentence: forever making it up to you.
        </p>
      </motion.div>
    </div>
  );
}
