'use client';

import React, { useRef, useState, useCallback } from 'react';
import { SlidersHorizontal, X, Play } from 'lucide-react';
import { BotDifficulty } from '@/lib/xiangqi-types';
import { ModeVariantSelector, VariantEloStats } from './ModeVariantSelector';

export interface StartGameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: 'standard' | 'jieqi';
  onChangeVariant: (variant: 'standard' | 'jieqi') => void;
  gameMode: 'pve-red' | 'pve-black' | 'pvp' | 'online' | null;
  onChangeGameMode: (mode: 'pve-red' | 'pve-black' | 'pvp' | 'online') => void;
  difficulty: BotDifficulty;
  onChangeDifficulty: (diff: BotDifficulty) => void;
  eloStandard?: number;
  eloJieqi?: number;
  statsStandard?: VariantEloStats;
  statsJieqi?: VariantEloStats;
  onOpenProfile?: () => void;
  onOpenLeaderboard?: () => void;
  onStartGame: () => void;
  onFlyToConsole?: () => void;
  colorMode?: 'dark' | 'light';
}

export const StartGameMenuModal: React.FC<StartGameMenuModalProps> = React.memo(({
  isOpen,
  onClose,
  variant = 'standard',
  onChangeVariant,
  gameMode,
  onChangeGameMode,
  difficulty,
  onChangeDifficulty,
  eloStandard = 1200,
  eloJieqi = 1200,
  statsStandard,
  statsJieqi,
  onOpenProfile,
  onOpenLeaderboard,
  onStartGame,
  onFlyToConsole,
  colorMode = 'dark'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlyingOut, setIsFlyingOut] = useState(false);
  const [flyCoords, setFlyCoords] = useState<{ dx: number; dy: number; scale: number } | null>(null);

  const triggerFlyToConsole = useCallback(
    (onComplete: () => void) => {
      if (isFlyingOut) return;

      let dx = 0;
      let dy = typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.58) : 420;
      let scale = 0.88;

      if (cardRef.current && typeof window !== 'undefined') {
        const cardRect = cardRef.current.getBoundingClientRect();
        const targetEl = document.getElementById('game-console-dock');
        if (targetEl) {
          const targetRect = targetEl.getBoundingClientRect();
          if (targetRect.width > 0 && targetRect.height > 0) {
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + Math.min(targetRect.height, cardRect.height) / 2;

            dx = Math.round(targetCenterX - cardCenterX);
            const rawDy = Math.round(targetCenterY - cardCenterY);

            const maxVisibleDy = Math.round(window.innerHeight - cardRect.top - 20);
            if (targetRect.top > window.innerHeight * 0.85) {
              dy = Math.max(240, Math.min(rawDy, maxVisibleDy));
            } else {
              dy = rawDy;
            }

            scale = Math.max(0.78, Math.min(0.96, Number((targetRect.width / cardRect.width).toFixed(2))));
          }
        }
      }

      setFlyCoords({ dx, dy, scale });
      setIsFlyingOut(true);
      onFlyToConsole?.();

      setTimeout(() => {
        setIsFlyingOut(false);
        setFlyCoords(null);
        onComplete();
      }, 520);
    },
    [isFlyingOut, onFlyToConsole]
  );

  if (!isOpen && !isFlyingOut) return null;

  const isDark = colorMode !== 'light';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 select-none transition-opacity duration-500 ${
        isFlyingOut
          ? 'bg-black/0 pointer-events-none'
          : 'bg-black/60 backdrop-blur-xs animate-in fade-in duration-200'
      }`}
      onClick={() => triggerFlyToConsole(onClose)}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={
          isFlyingOut && flyCoords
            ? {
                transform: `translate3d(${flyCoords.dx}px, ${flyCoords.dy}px, 0) scale(${flyCoords.scale})`,
                opacity: 0,
                transition:
                  'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease-out 340ms',
                pointerEvents: 'none'
              }
            : {
                transform: 'translate3d(0px, 0px, 0px) scale(1)',
                opacity: 1
              }
        }
        className={`relative w-full max-w-[420px] sm:max-w-[440px] rounded-xl border shadow-xl flex flex-col overflow-hidden ${
          !isFlyingOut ? 'animate-in zoom-in-95 duration-200' : 'ring-1 ring-amber-500'
        } ${
          isDark
            ? 'bg-[#151C28] border-[#232D3F] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between shrink-0 gap-2 ${
            isDark ? 'border-[#232D3F]' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <SlidersHorizontal className={`w-4 h-4 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold tracking-tight leading-snug whitespace-nowrap truncate">
                Chọn Chế Độ Chơi
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => triggerFlyToConsole(onClose)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-[#232D3F] bg-[#0E131B] text-slate-400 hover:text-white hover:bg-[#1C2536]'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 max-h-[82dvh] overscroll-contain overflow-y-auto">
          <ModeVariantSelector
            variant={variant}
            onChangeVariant={onChangeVariant}
            gameMode={gameMode}
            onSelectOnline={() => {
              triggerFlyToConsole(() => {
                onClose();
                onChangeGameMode('online');
              });
            }}
            onSelectPvP={() => onChangeGameMode('pvp')}
            onSelectPvE={(side) => onChangeGameMode(side)}
            difficulty={difficulty}
            onChangeDifficulty={onChangeDifficulty}
            eloStandard={eloStandard}
            eloJieqi={eloJieqi}
            statsStandard={statsStandard}
            statsJieqi={statsJieqi}
            onOpenProfile={
              onOpenProfile
                ? () => {
                    triggerFlyToConsole(() => {
                      onClose();
                      onOpenProfile();
                    });
                  }
                : undefined
            }
            onOpenLeaderboard={
              onOpenLeaderboard
                ? () => {
                    triggerFlyToConsole(() => {
                      onClose();
                      onOpenLeaderboard();
                    });
                  }
                : undefined
            }
            colorMode={colorMode}
          />

          {/* Primary Start Action */}
          <button
            type="button"
            onClick={() => {
              if (!gameMode) {
                onStartGame();
                return;
              }
              triggerFlyToConsole(onStartGame);
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>Bắt Đầu Vào Ván</span>
          </button>
        </div>
      </div>
    </div>
  );
});

StartGameMenuModal.displayName = 'StartGameMenuModal';
