'use client';

import React from 'react';

export interface DayNightSwitchProps {
  isDark: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Day/Night Animated Switch from CodePen (ReGGae/pen/MWOjoRL)
 * Features morphing Sun with clouds in day mode, and Moon with craters, crescent shadow, and stars in night mode
 */
export const DayNightSwitch: React.FC<DayNightSwitchProps> = ({
  isDark,
  onToggle,
  size = 'md',
  className = '',
}) => {
  const fontSizes = {
    sm: '3.1px',
    md: '3.6px',
    lg: '4.8px',
  };

  return (
    <div className={`daynight-switch-wrapper ${className}`}>
      <span className="daynight-shadow">
        <button
          type="button"
          onClick={onToggle}
          className={`daynight-switch ${isDark ? 'is-active' : ''}`}
          style={{ '--font-size': fontSizes[size] } as React.CSSProperties}
          aria-label={isDark ? 'Chuyển sang chế độ Sáng (Ngày)' : 'Chuyển sang chế độ Tối (Đêm)'}
          title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
        >
          {/* Day clouds */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="switch__cloud --2"
            src="/switch/cloud-1.svg"
            alt=""
            aria-hidden="true"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="switch__cloud --1"
            src="/switch/cloud-2.svg"
            alt=""
            aria-hidden="true"
          />

          {/* Celestial body (Sun in Day, Moon in Night) */}
          <div className="switch__inner">
            <div className="switch-globe">
              {/* Moon texture with craters */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="switch-globe__moon"
                src="/switch/moon_1.png"
                alt=""
                aria-hidden="true"
              />
              {/* Crescent shadow mask */}
              <div className="switch-globe__circle" />
            </div>

            {/* Night starry sky */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="switch__stars"
              src="/switch/stars.svg"
              alt=""
              aria-hidden="true"
            />
          </div>
        </button>
      </span>
    </div>
  );
};

export default DayNightSwitch;
