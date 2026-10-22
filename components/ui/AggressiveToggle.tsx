'use client';

import React, { useState } from 'react';

export interface AggressiveToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
  ariaLabel?: string;
}

/**
 * Aggressive Bump Switch from CodePen (yexx/pen/yLvyxWP)
 * Features RGB chromatic aberration borders (red, lime, blue) and bounce animation
 */
export const AggressiveToggle: React.FC<AggressiveToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'sm',
  isDark = true,
  ariaLabel = 'Chuyển đổi',
}) => {
  const [hasToggled, setHasToggled] = useState(false);

  const handleToggle = () => {
    if (disabled) return;
    if (!hasToggled) setHasToggled(true);
    onChange(!checked);
  };

  const scaleClasses = {
    sm: 'scale-[0.62] origin-center -my-1 -mx-2',
    md: 'scale-[0.8] origin-center -my-0.5',
    lg: 'scale-100 origin-center',
  }[size];

  return (
    <div className="inline-flex items-center justify-center self-center shrink-0">
      <label
        className={`yexx-switch ${isDark ? 'is-dark' : 'is-light'} ${hasToggled ? 'has-toggled' : ''} ${scaleClasses} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-label={ariaLabel}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleToggle}
          hidden
        />
        <div className="switch__wrapper shadow-xs">
          <div className="switch__toggle" />
        </div>
      </label>
    </div>
  );
};

export default AggressiveToggle;
