'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type HapticPatternType =
  | 'select'
  | 'move'
  | 'capture'
  | 'check'
  | 'victory'
  | 'defeat'
  | 'error';

const HAPTIC_PATTERNS: Record<HapticPatternType, number | number[]> = {
  select: 8,
  move: 15,
  capture: [25, 30, 42],
  check: [40, 35, 85],
  victory: [45, 45, 60, 45, 130],
  defeat: [60, 70, 50],
  error: [25, 40, 25]
};

/**
 * Triggers tactile vibration on supported mobile browsers.
 * Safely no-ops on desktop or iOS Safari where navigator.vibrate is unavailable.
 */
export function triggerHaptic(type: HapticPatternType, enabled: boolean = true): void {
  if (!enabled || typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(HAPTIC_PATTERNS[type] ?? 12);
    }
  } catch {
    // Ignore errors on restricted webviews or unsupported devices
  }
}

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

/**
 * Manages the Screen Wake Lock API to keep mobile screens awake during active games.
 * Automatically re-acquires the lock when returning to the tab.
 */
export function useScreenWakeLock(enabled: boolean, isGameActive: boolean) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // Ignore release errors
      }
      sentinelRef.current = null;
      setIsLocked(false);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (
      !enabled ||
      !isGameActive ||
      typeof document === 'undefined' ||
      document.visibilityState !== 'visible' ||
      typeof navigator === 'undefined' ||
      !('wakeLock' in navigator)
    ) {
      return;
    }

    if (sentinelRef.current && !sentinelRef.current.released) {
      setIsLocked(true);
      return;
    }

    try {
      const navWithWakeLock = navigator as Navigator & {
        wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
      };
      const sentinel = await navWithWakeLock.wakeLock?.request('screen');
      if (sentinel) {
        sentinelRef.current = sentinel;
        setIsLocked(!sentinel.released);
        sentinel.addEventListener('release', () => {
          setIsLocked(false);
        });
      }
    } catch {
      setIsLocked(false);
    }
  }, [enabled, isGameActive]);

  useEffect(() => {
    if (enabled && isGameActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && isGameActive) {
        requestWakeLock();
      }
    };

    const handleFirstInteraction = () => {
      if (enabled && isGameActive && !sentinelRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [enabled, isGameActive, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    isSupported,
    isLocked
  };
}
