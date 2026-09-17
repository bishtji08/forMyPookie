'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Flame, Infinity as InfinityIcon } from 'lucide-react';
import { playHarp, playCelebration } from '@/lib/audio-effects';

interface InteractiveLoveMeterProps {
  accentColor?: string;
  subColor?: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  scale: number;
  color: string;
}

export function InteractiveLoveMeter({
  accentColor = '#e85d8d',
  subColor = 'text-rose-400/70',
}: InteractiveLoveMeterProps) {
  const [level, setLevel] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [isOverflow, setIsOverflow] = useState(false);

  const colors = ['#ff4d88', '#e85d8d', '#b794f6', '#ff70a6', '#ff9770'];

  const handleAddLove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const nextClicks = clicks + 1;
    setClicks(nextClicks);

    // Escalate increment
    const increment = nextClicks < 5 ? 20 : nextClicks < 10 ? 45 : 150;
    const nextLevel = level + increment;
    setLevel(nextLevel);

    playHarp(nextLevel / 60);

    // Spawn 2-3 floating hearts
    const newHearts: FloatingHeart[] = Array.from({ length: 2 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: clickX + (Math.random() * 40 - 20),
      y: clickY,
      scale: 0.8 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1400);

    if (nextLevel >= 1000 && !isOverflow) {
      setIsOverflow(true);
      playCelebration();
    }
  };

  const getCommentary = () => {
    if (level === 0) return 'Tap the button to test your love capacity…';
    if (level <= 25) return 'Warming up the engines… 🚀';
    if (level <= 60) return 'Dangerously cute territory detected 🥺';
    if (level <= 99) return 'Approaching maximum pookie capacity… 📈';
    if (level === 100) return '100% capacity reached! But wait… don’t stop.';
    if (level <= 300) return 'Scientifically hazardous levels of affection ⚠️';
    if (level <= 600) return 'System overheating from pure love 🌡️';
    if (level < 1000) return 'Calculators have literally caught fire 🔥';
    return 'CRITICAL OVERFLOW: Too much love detected! Result: ∞ ❤️';
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center px-4 relative">
      {/* Title & Subtitle matching Image 5 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#3d2730] mb-2">
          Official Love Meter
        </h2>
        <p className="font-handwritten text-xl sm:text-2xl text-rose-500/80 italic mb-8">
          warning: this thing does not stop 📈❤️
        </p>
      </motion.div>

      {/* Love Meter Card matching Image 5 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-lg shadow-rose-200/30 border border-white/90 text-left overflow-hidden"
      >
        {/* Floating Heart Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: h.y, x: h.x, scale: h.scale }}
              animate={{ opacity: 0, y: h.y - 180, scale: h.scale * 1.4 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className="absolute pointer-events-none"
            >
              <Heart className="w-6 h-6 fill-current" style={{ color: h.color }} />
            </motion.div>
          ))}
        </div>

        {/* Header inside Card: "love level" on left, Percentage on right */}
        <div className="flex items-baseline justify-between mb-3 px-1">
          <span className="font-serif italic text-base sm:text-lg text-rose-950/60 font-medium">
            love level
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-rose-600/90 tracking-tight">
            {isOverflow ? '∞%' : `${level}%`}
          </span>
        </div>

        {/* Progress Bar Track matching Image 5 */}
        <div className="w-full h-5 sm:h-6 bg-purple-100/50 rounded-full overflow-hidden p-1 shadow-inner relative mb-8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-300 via-pink-400 to-purple-400 shadow-sm"
            animate={{ width: isOverflow ? '100%' : `${Math.min(level, 100)}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>

        {/* Big Action Button matching Image 5 */}
        <div className="text-center relative z-10">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleAddLove}
            className="group px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 text-white font-medium text-base sm:text-lg shadow-md shadow-pink-300/40 hover:shadow-lg hover:shadow-pink-300/60 transition-all inline-flex items-center gap-2 select-none"
          >
            <span>add more love</span>
            <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
          </motion.button>
        </div>

        {/* Milestone Commentary */}
        <div className="mt-6 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={getCommentary()}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`font-handwritten text-lg sm:text-xl ${
                isOverflow ? 'text-rose-600 font-bold' : 'text-rose-400/80'
              }`}
            >
              {getCommentary()}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
