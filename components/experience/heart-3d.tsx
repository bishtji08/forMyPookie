'use client';

import React from 'react';

interface Heart3DProps {
  size?: number;
  className?: string;
}

export function Heart3D({ size = 48, className = '' }: Heart3DProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={`shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <defs>
        <radialGradient id={`heartGrad_${id}`} cx="32%" cy="26%" r="68%">
          <stop offset="0%" stopColor="#ff7096" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
        <linearGradient id={`heartSpec_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d="M50 88.5 C24 70 8 52 8 32.5 C8 17.5 19.5 6 34 6 C42.5 6 48.5 10.5 50 15 C51.5 10.5 57.5 6 66 6 C80.5 6 92 17.5 92 32.5 C92 52 76 70 50 88.5 Z"
        fill={`url(#heartGrad_${id})`}
        filter="drop-shadow(0 8px 12px rgba(225,29,72,0.35))"
      />
      <ellipse
        cx="32"
        cy="19"
        rx="12"
        ry="7"
        transform="rotate(-28 32 19)"
        fill={`url(#heartSpec_${id})`}
      />
    </svg>
  );
}
