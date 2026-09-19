'use client';

import React from 'react';

interface GlossyHeartProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function GlossyHeart({ size = 36, className = '', glow = true }: GlossyHeartProps) {
  // Use React.useId to ensure uniquely scoped SVG gradient & filter definitions
  const rawId = React.useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <span
      className={`inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Main 3D Spherical Radial Gradient with Vibrant Rose/Crimson Light */}
          <radialGradient
            id={`radialHeart_${id}`}
            cx="32%"
            cy="26%"
            r="68%"
            fx="28%"
            fy="22%"
          >
            <stop offset="0%" stopColor="#ff7096" />
            <stop offset="22%" stopColor="#f43f5e" />
            <stop offset="60%" stopColor="#e11d48" />
            <stop offset="85%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#7a0d2a" />
          </radialGradient>

          {/* Primary Gloss Specular Sheen (Top Left) */}
          <linearGradient id={`specular_${id}`} x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Soft Bottom-Right Ambient Rim Light */}
          <linearGradient id={`rim_${id}`} x1="100%" y1="100%" x2="30%" y2="30%">
            <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
          </linearGradient>

          {/* Diffuse Warm Drop Shadow */}
          {glow && (
            <filter id={`shadow_${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#e11d48" floodOpacity="0.3" />
            </filter>
          )}
        </defs>

        <g filter={glow ? `url(#shadow_${id})` : undefined}>
          {/* 3D Curved Heart Body */}
          <path
            d="M50 88.5 C24 70 8 52 8 32.5 C8 17.5 19.5 6 34 6 C42.5 6 48.5 10.5 50 15 C51.5 10.5 57.5 6 66 6 C80.5 6 92 17.5 92 32.5 C92 52 76 70 50 88.5 Z"
            fill={`url(#radialHeart_${id})`}
          />

          {/* Ambient Rim Sheen */}
          <path
            d="M50 88.5 C24 70 8 52 8 32.5 C8 17.5 19.5 6 34 6 C42.5 6 48.5 10.5 50 15 C51.5 10.5 57.5 6 66 6 C80.5 6 92 17.5 92 32.5 C92 52 76 70 50 88.5 Z"
            fill={`url(#rim_${id})`}
          />

          {/* Primary Gloss Highlight on Left Lobe */}
          <ellipse
            cx="32"
            cy="19"
            rx="12"
            ry="7"
            transform="rotate(-28 32 19)"
            fill={`url(#specular_${id})`}
          />

          {/* Secondary Soft Specular Sheen on Right Lobe */}
          <ellipse
            cx="67"
            cy="20"
            rx="6"
            ry="3.5"
            transform="rotate(22 67 20)"
            fill="#ffffff"
            opacity="0.45"
          />
        </g>
      </svg>
    </span>
  );
}
