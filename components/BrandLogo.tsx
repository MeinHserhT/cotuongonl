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
      {/* Simple Circular Brown Disc */}
      <circle cx="32" cy="32" r="30" fill="#5C3A21" stroke="#C89D66" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="25.5" stroke="#A67B4B" strokeWidth="1" strokeOpacity="0.55" />

      {/* Character 將 */}
      <text
        x="32"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FDF6E9"
        fontSize="32"
        fontWeight="700"
        style={{
          fontFamily:
            '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif',
        }}
      >
        將
      </text>
    </svg>
  );
});

BrandLogo.displayName = 'BrandLogo';
