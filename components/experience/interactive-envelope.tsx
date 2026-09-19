'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCelebration, playPop } from '@/lib/audio-effects';
import { GlossyHeart } from '@/components/experience/glossy-heart';

interface InteractiveEnvelopeProps {
  receiverName?: string;
  senderName?: string;
  subtitle?: string;
  onOpen: () => void;
}

export function InteractiveEnvelope({
  receiverName = 'My Pookie',
  senderName,
  subtitle = 'a little something I made with my whole heart',
  onOpen,
}: InteractiveEnvelopeProps) {
  const [opening, setOpening] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Normalize display name: if receiverName already starts with "my" or similar, keep clean
  const displayName = receiverName?.trim() || 'My Pookie';

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    playPop();
    setTimeout(() => playCelebration(), 250);
    setTimeout(() => {
      onOpen();
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 w-full max-w-xl mx-auto select-none py-6 sm:py-10">
      {/* Heading: "For My Pookie ❤️" matching the user's reference image */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center gap-3 sm:gap-4 mb-1.5 sm:mb-2 flex-wrap"
      >
        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#3f1d2e]">
          For {displayName.startsWith('My') || displayName.startsWith('my') ? displayName : `My ${displayName}`}
        </h1>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="cursor-pointer"
          onClick={handleClick}
        >
          <GlossyHeart size={44} className="sm:w-12 sm:h-12" />
        </motion.div>
      </motion.div>

      {/* Subtitle: "a little something I made with my whole heart" */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="font-body text-xs sm:text-sm md:text-base text-[#916b7f] font-light tracking-wider lowercase mb-8 sm:mb-12"
      >
        {subtitle}
      </motion.p>

      {/* Aesthetic Pastel Envelope Container */}
      <motion.div
        animate={
          opening
            ? { scale: [1, 1.04, 0.98], y: [0, -8, 12] }
            : { y: [0, -6, 0] }
        }
        transition={{
          y: { duration: 4, repeat: opening ? 0 : Infinity, ease: 'easeInOut' },
          scale: { duration: 0.6 },
        }}
        className="relative cursor-pointer group"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Soft Dreamy Pastel Glow underneath envelope */}
        <div className="absolute -inset-2 bg-gradient-to-r from-[#f8d4ee]/60 via-[#fde2f1]/60 to-[#ffe9dc]/60 rounded-[38px] blur-xl group-hover:blur-2xl transition duration-500 pointer-events-none" />

        {/* Envelope Body */}
        <div
          className="relative w-[300px] sm:w-[440px] md:w-[480px] h-[195px] sm:h-[275px] md:h-[295px] rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#fbf2fc] via-[#f7eaf8] to-[#f3e3f5] border border-white/95 overflow-hidden flex items-center justify-center"
          style={{
            boxShadow:
              '0 25px 60px -15px rgba(225, 175, 215, 0.55), 0 10px 25px -5px rgba(220, 160, 200, 0.35)',
          }}
        >
          {/* Subtle Inner Pocket Lining Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-200/20 via-transparent to-purple-200/20 pointer-events-none" />

          {/* Letter Peeking Out animation when opening */}
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={opening ? { y: -130, opacity: 1 } : { y: 0, opacity: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: 'easeOut' }}
            className="absolute inset-x-6 top-3 h-[88%] bg-[#fffdfa] rounded-2xl shadow-xl border border-rose-100/90 p-5 flex flex-col items-center justify-center z-10 pointer-events-none"
          >
            <p className="font-serif-display text-rose-800 text-lg sm:text-xl font-bold">
              For {displayName} ❤️
            </p>
            <div className="w-10 h-0.5 bg-rose-200 rounded-full my-1.5" />
            <p className="font-handwritten text-rose-500 text-base sm:text-lg">
              Unfolding our love story…
            </p>
          </motion.div>

          {/* Envelope Top V-Flap */}
          <motion.div
            animate={
              opening
                ? { rotateX: -180, opacity: 0 }
                : { rotateX: 0, opacity: 1 }
            }
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top center' }}
            className="absolute top-0 left-0 right-0 w-full z-20 pointer-events-none"
          >
            <svg
              viewBox="0 0 480 165"
              className="w-full h-auto filter drop-shadow-[0_5px_12px_rgba(195,130,180,0.22)]"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 L480,0 L248,156 Q240,162 232,156 L0,0 Z"
                fill="#faedf9"
              />
            </svg>
          </motion.div>

          {/* White Circular Seal Button with 3D Heart */}
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <motion.div
              animate={
                opening
                  ? { scale: [1, 1.45, 0], opacity: [1, 1, 0], rotate: 20 }
                  : { scale: hovered ? 1.1 : 1 }
              }
              transition={{ duration: 0.4 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-[0_6px_22px_rgba(215,135,175,0.4)] border-2 border-white flex items-center justify-center pointer-events-auto cursor-pointer group-hover:shadow-[0_8px_26px_rgba(215,135,175,0.55)] transition-shadow"
            >
              <GlossyHeart size={26} className="sm:w-7 sm:h-7" glow={false} />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* "tap to open" in romantic cursive script matching the reference image */}
      <motion.p
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className="font-handwritten text-xl sm:text-2xl text-[#d4789b] italic tracking-wide mt-6 sm:mt-8 select-none"
      >
        tap to open
      </motion.p>
    </div>
  );
}
