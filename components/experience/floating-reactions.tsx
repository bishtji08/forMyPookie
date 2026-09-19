'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { playPop, playCelebration } from '@/lib/audio-effects';

interface Particle {
  id: number;
  emoji: string;
  x: number; // percentage
  size: number;
}

const REACTIONS = [
  { emoji: '🥺', label: 'Aww' },
  { emoji: '❤️', label: 'Love you' },
  { emoji: '😭', label: 'Tears' },
  { emoji: '🍪', label: 'Snacks' },
  { emoji: '🌸', label: 'Petals' },
];

export function FloatingReactions({ isDark = false }: { isDark?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [counter, setCounter] = useState(0);

  const spawnParticle = (emoji: string, count = 1) => {
    playPop();
    const newItems: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: Date.now() + Math.random(),
        emoji,
        x: 15 + Math.random() * 70,
        size: 24 + Math.random() * 16,
      });
    }

    setParticles((prev) => [...prev, ...newItems]);
    setCounter((prev) => prev + count);

    // Auto cleanup after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newItems.some((n) => n.id === p.id)));
    }, 2800);
  };

  const triggerShowerPetals = () => {
    playCelebration();
    const petals = ['🌸', '🌺', '🌹', '❤️', '✨'];
    const newItems: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newItems.push({
        id: Date.now() + Math.random() + i,
        emoji: petals[Math.floor(Math.random() * petals.length)],
        x: Math.random() * 95,
        size: 20 + Math.random() * 18,
      });
    }

    setParticles((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newItems.some((n) => n.id === p.id)));
    }, 3200);
  };

  return (
    <>
      {/* Floating Particles Canvas */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                y: '90vh',
                x: `${p.x}vw`,
                scale: 0.6,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: '-10vh',
                x: `${p.x + (Math.random() - 0.5) * 15}vw`,
                scale: [0.6, 1.2, 0.9],
                rotate: (Math.random() - 0.5) * 60,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.4 + Math.random() * 0.8,
                ease: 'easeOut',
              }}
              style={{ fontSize: `${p.size}px` }}
              className="absolute select-none filter drop-shadow-md"
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Interactive Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full backdrop-blur-md shadow-lg border transition-all ${
            isDark
              ? 'bg-black/60 border-white/20 text-white shadow-pink-500/10'
              : 'bg-white/90 border-rose-200/80 text-rose-800 shadow-rose-300/30'
          }`}
        >
          <span className="text-[11px] font-medium text-rose-400 hidden sm:inline mr-1">
            Tap to react:
          </span>

          {REACTIONS.map((r) => (
            <motion.button
              key={r.label}
              whileHover={{ scale: 1.25, y: -2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => spawnParticle(r.emoji)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-base sm:text-lg hover:bg-rose-50/50 active:scale-90 transition select-none"
              title={r.label}
              aria-label={r.label}
            >
              {r.emoji}
            </motion.button>
          ))}

          <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/20' : 'bg-rose-200'}`} />

          {/* Shower Petals Button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={triggerShowerPetals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-xs"
            title="Shower Rose Petals"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shower Petals</span>
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
