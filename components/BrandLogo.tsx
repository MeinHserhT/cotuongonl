'use client';

import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = React.memo(({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="xi-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#161F30" />
          <stop offset="100%" stopColor="#0A0E17" />
        </linearGradient>
        <linearGradient id="xi-gold" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="xi-crimson" cx="36%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="55%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#690B0B" />
        </radialGradient>
      </defs>

      {/* Rounded Imperial Badge Base */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="url(#xi-bg)"
        stroke="url(#xi-gold)"
        strokeWidth="2"
      />

      {/* Subtle Nine-Palace Crosshair Lines */}
      <line x1="10" y1="10" x2="54" y2="54" stroke="#F59E0B" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="54" y1="10" x2="10" y2="54" stroke="#F59E0B" strokeOpacity="0.22" strokeWidth="1" />

      {/* 3D Piece Rim & Crimson Disc */}
      <circle cx="32" cy="33.5" r="23" fill="#451A03" />
      <circle cx="32" cy="31.5" r="23" fill="url(#xi-gold)" />
      <circle cx="32" cy="31.5" r="21" fill="url(#xi-crimson)" />
      <circle cx="32" cy="31.5" r="18" stroke="#FDE68A" strokeOpacity="0.85" strokeWidth="1.25" />

      {/* Specular Highlight */}
      <path
        d="M17 20 A19 19 0 0 1 47 20"
        stroke="#FCA5A5"
        strokeOpacity="0.4"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Carved Royal General Glyph */}
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FEF3C7"
        fontSize="23"
        fontWeight="700"
        style={{
          fontFamily:
            '"Iansui", "Ma Shan Zheng", "LXGW WenKai TC", "STKaiti", "KaiTi", "Noto Serif SC", serif',
        }}
      >
        帥
      </text>
    </svg>
  );
});

BrandLogo.displayName = 'BrandLogo';
