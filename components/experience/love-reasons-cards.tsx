'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Star, Ticket } from 'lucide-react';
import type { LoveReason } from '@/lib/types';
import { isVideoUrl } from '@/lib/utils';
import { playChime, playCelebration } from '@/lib/audio-effects';

interface LoveReasonsCardsProps {
  loveReasons: LoveReason[];
  accentColor?: string;
  subColor?: string;
}

interface ReasonItem {
  id: string;
  title: string;
  image_url?: string | null;
}

const DEFAULT_REASONS: ReasonItem[] = [
  { id: '1', title: 'How gently you treat people who can\'t do anything for you.' },
  { id: '2', title: 'How hard you love, even when it\'s inconvenient or difficult.' },
  { id: '3', title: 'The real laugh you only do when something catches you completely off guard.' },
  { id: '4', title: 'How you remember the smallest things I told you months ago.' },
  { id: '5', title: 'Your random cute habits that you think nobody notices, but I notice all of them.' },
  { id: '6', title: 'Just you being you. Unfiltered, perfectly imperfect, my absolute favorite human.' },
];

export function LoveReasonsCards({
  loveReasons = [],
  accentColor = '#e85d8d',
  subColor = 'text-rose-400/70',
}: LoveReasonsCardsProps) {
  // Pre-reveal the first reason as an intuitive cue, or let user reveal all
  const [revealed, setRevealed] = useState<Record<string, boolean>>({
    '2': true, // sample revealed like Image 4
  });
  const [showCelebration, setShowCelebration] = useState(false);

  const items: ReasonItem[] = loveReasons.length > 0
    ? loveReasons.map((r, i) => ({
        id: r.id || `${i + 1}`,
        title: r.title || r.description,
        image_url: r.image_url,
      }))
    : DEFAULT_REASONS;

  const totalCount = items.length;
  const revealedCount = Object.values(revealed).filter(Boolean).length;

  const handleReveal = (id: string) => {
    if (revealed[id]) return; // already revealed
    playChime();
    setRevealed((prev) => {
      const updated = { ...prev, [id]: true };
      if (Object.values(updated).filter(Boolean).length >= totalCount) {
        setShowCelebration(true);
        playCelebration();
      }
      return updated;
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-center px-4">
      {/* Title & Subtitle matching Image 4 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#3d2730] mb-2">
          Things I Love About You
        </h2>
        <p className="font-handwritten text-xl sm:text-2xl text-rose-500/80 italic mb-8">
          tap a heart to read one ✨
        </p>
      </motion.div>

      {/* Progress Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-rose-200/60 shadow-xs mb-8">
        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
        <span className="text-xs font-medium text-rose-700">
          {revealedCount} of {totalCount} reasons discovered
        </span>
      </div>

      {/* 6 Cards Grid matching Image 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
        {items.map((item, idx) => {
          const isUnlocked = !!revealed[item.id];
          const hasMedia = Boolean(item.image_url);
          const isVideo = hasMedia && isVideoUrl(item.image_url);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleReveal(item.id)}
              className={`rounded-3xl p-6 min-h-[140px] transition-all duration-300 border flex flex-col justify-center cursor-pointer select-none relative overflow-hidden ${
                isUnlocked
                  ? 'bg-white shadow-md shadow-rose-200/30 border-rose-100 text-left'
                  : 'bg-white/70 hover:bg-white/90 shadow-sm border-white/80 hover:border-rose-100 text-left'
              } backdrop-blur-md`}
            >
              {/* Heart Icon Indicator matching Image 4 */}
              <div className="mb-2 flex items-center justify-between">
                <motion.div
                  animate={isUnlocked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isUnlocked ? (
                    <div className="relative">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500 drop-shadow-xs" />
                      <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
                    </div>
                  ) : (
                    <div className="p-0.5 rounded-full text-purple-300 hover:text-rose-400 transition-colors">
                      <Heart className="w-5 h-5 fill-purple-100 text-purple-300" />
                    </div>
                  )}
                </motion.div>

                {!isUnlocked && (
                  <span className="font-handwritten text-xs text-rose-300 uppercase tracking-widest">
                    tap me
                  </span>
                )}
              </div>

              {/* Card Body */}
              {isUnlocked ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm sm:text-base font-normal text-rose-950/85 leading-relaxed">
                    {item.title}
                  </p>

                  {hasMedia && (
                    <div className="mt-3 rounded-xl overflow-hidden max-h-32 border border-rose-100">
                      {isVideo ? (
                        <video src={item.image_url || undefined} controls playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.image_url || undefined} alt="Memory" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Unrevealed state with cursive label matching Image 4 */
                <p className="font-handwritten text-lg sm:text-xl text-rose-400/80 italic mt-auto">
                  reason #{idx + 1}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Grand Reward Voucher when all 6 unlocked */}
      <AnimatePresence>
        {revealedCount >= totalCount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 text-white shadow-xl shadow-rose-300/40 max-w-xl mx-auto text-center relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 opacity-15">
              <Ticket className="w-36 h-36" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> All Reasons Discovered!
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
              Lifetime VIP Pookie Coupon 🎟️❤️
            </h3>
            <p className="text-sm text-white/90 max-w-md mx-auto leading-relaxed">
              Valid for: Unlimited late-night hugs, zero arguments for 1 year, your choice of food anytime, and infinite forehead kisses.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
