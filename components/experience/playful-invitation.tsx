'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import type { ResponseStatus } from '@/lib/types';
import { playCelebration, playPop } from '@/lib/audio-effects';

interface PlayfulInvitationProps {
  receiverName?: string;
  senderName?: string;
  onResponse: (resp: ResponseStatus) => void;
  response: ResponseStatus | null;
  onDoneReading?: () => void;
}

const NO_BUTTON_QUIPS = [
  'Wait! What about snacks? 🍪',
  'Error: "NO" is undergoing maintenance 🛠️',
  'Are you sure? What about dessert? 🍰',
  'Recalculating… please select YES ❤️',
  'Clicking NO requires 3-5 business days processing 📋',
  'Wait, you meant YES right? 🥺',
];

export function PlayfulInvitation({
  receiverName = 'Pookie',
  senderName = 'Your Boy',
  onResponse,
  response,
  onDoneReading,
}: PlayfulInvitationProps) {
  const [noHoverCount, setNoHoverCount] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });

  const handleNoInteraction = () => {
    playPop();
    const nextCount = noHoverCount + 1;
    setNoHoverCount(nextCount);

    // Random evasive offset
    const randomX = (Math.random() - 0.5) * 160;
    const randomY = (Math.random() - 0.5) * 80;
    setNoOffset({ x: randomX, y: randomY });
  };

  const handleYes = () => {
    playCelebration();
    onResponse('yes');
  };

  const currentNoQuip = NO_BUTTON_QUIPS[noHoverCount % NO_BUTTON_QUIPS.length];

  return (
    <div className="w-full max-w-3xl mx-auto text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#3d2730] mb-3">
          So… can I ask you one tiny thing?
        </h2>
        <p className="font-handwritten text-3xl sm:text-4xl text-rose-500 font-semibold mb-2">
          Can I take you out, {receiverName}?
        </p>
        <p className="font-body text-sm sm:text-base text-rose-400/80 mb-10">
          Coffee? Dinner? A walk? You choose everything.
        </p>

        {/* Buttons Row */}
        {!response && (
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            {/* YES Button with increasing scale if NO was attempted */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              style={{
                transform: `scale(${1 + Math.min(noHoverCount * 0.05, 0.3)})`,
              }}
              onClick={handleYes}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-lg shadow-lg shadow-rose-300/40 hover:shadow-xl hover:shadow-rose-400/50 transition-all select-none"
            >
              <span className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 fill-white" /> YES
              </span>
              <p className="text-xs font-normal text-rose-100 mt-0.5">Okay, let&apos;s go.</p>
            </motion.button>

            {/* MAYBE Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onResponse('maybe')}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 text-white font-bold text-lg shadow-md shadow-amber-200/40 hover:shadow-lg transition-all select-none"
            >
              <span>🥺 MAYBE</span>
              <p className="text-xs font-normal text-amber-100 mt-0.5">I need a little time.</p>
            </motion.button>

            {/* NO Button (Evasive / Playful) */}
            <motion.button
              type="button"
              animate={{ x: noOffset.x, y: noOffset.y }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onMouseEnter={handleNoInteraction}
              onClick={() => {
                if (noHoverCount < 3) {
                  handleNoInteraction();
                } else {
                  onResponse('no');
                }
              }}
              className="w-full sm:flex-1 py-4 px-4 rounded-2xl bg-white/70 hover:bg-white border border-rose-200/60 text-rose-600 font-bold text-lg shadow-sm hover:shadow-md transition-all select-none"
            >
              <span>🤍 NO</span>
              <p className="text-[11px] font-normal text-rose-400 mt-0.5">
                {noHoverCount > 0 ? currentNoQuip : 'Not right now.'}
              </p>
            </motion.button>
          </div>
        )}

        {/* Quip notice when NO is hovered/clicked */}
        <AnimatePresence>
          {noHoverCount > 0 && !response && (
            <motion.p
              key={currentNoQuip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-handwritten text-lg text-rose-500 mt-4"
            >
              {currentNoQuip}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Dashboard link button */}
        {onDoneReading && (
          <div className="mt-12">
            <button
              onClick={onDoneReading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/80 hover:bg-white text-rose-600 font-medium text-xs shadow-sm border border-rose-200/50 backdrop-blur-sm transition hover:scale-105"
            >
              <span>Done reading? Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
