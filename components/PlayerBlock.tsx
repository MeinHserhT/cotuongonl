'use client';

import React from 'react';
import { Clock, Timer, ShieldAlert, Eye } from 'lucide-react';
import { BoardTheme, getRankTier } from '@/lib/xiangqi-types';

export interface PlayerBlockProps {
  isActive: boolean;
  isRed: boolean;
  avatarChar: string;
  title: string;
  badgeLabel: string;
  capturedPieces: string[];
  timer: number;
  timeLimit: number;
  formatSec: (s: number) => string;
  elo?: number;
  theme?: BoardTheme;
  isTimerRunning?: boolean;
  turnTimer?: number;
  moveTimeLimit?: number;
  isCheck?: boolean;
  gameMode?: 'pve-red' | 'pve-black' | 'pvp' | 'online';
  otherPlayerName?: string;
  isInspecting?: boolean;
  inspectMoveIndex?: number | null;
  onExitInspect?: () => void;
  opponentDisconnected?: boolean;
  opponentGraceSeconds?: number;
  colorMode?: 'dark' | 'light';
}

export const PlayerBlock = React.memo(function PlayerBlock({
  isActive,
  isRed,
  avatarChar,
  title,
  badgeLabel,
  timer,
  timeLimit,
  formatSec,
  elo,
  isTimerRunning = true,
  turnTimer,
  moveTimeLimit = 60,
  isCheck = false,
  isInspecting = false,
  inspectMoveIndex = null,
  onExitInspect,
  opponentDisconnected = false,
  opponentGraceSeconds = 30,
  colorMode = 'dark'
}: PlayerBlockProps) {
  const isDark = colorMode !== 'light';
  const isUrgent = isActive && timer <= 10 && timeLimit > 0;
  const rank = elo ? getRankTier(elo, isDark) : null;

  return (
    <div
      className={`relative w-full rounded-xl border flex flex-col transition-colors duration-200 min-h-[52px] overflow-hidden ${
        isDark
          ? isActive && isCheck
            ? 'bg-[#261412] border-red-500 text-[#EFE6D5]'
            : isActive
            ? isRed
              ? 'bg-[#1F1812] border-red-500/85 text-[#EFE6D5]'
              : 'bg-[#1F1812] border-[#D97706] text-[#EFE6D5]'
            : 'bg-[#1F1812]/90 border-[#36291E] text-[#B8A996]'
          : isActive && isCheck
          ? 'bg-red-50 border-red-600 text-[#132226]'
          : isActive
          ? isRed
            ? 'bg-[#FFFFFF] border-red-500 text-[#132226] shadow-2xs'
            : 'bg-[#FFFFFF] border-[#0F766E] text-[#132226] shadow-2xs'
          : 'bg-[#FFFFFF]/90 border-[#D5DFDB] text-[#4A6368]'
      }`}
    >
      {/* Inspection Header Strip */}
      {isInspecting && typeof inspectMoveIndex === 'number' && (
        <div
          className={`w-full px-3 py-1 border-b flex items-center justify-between text-xs z-20 shrink-0 ${
            isDark
              ? 'bg-[#120E0A] border-[#36291E] text-[#EFE6D5]'
              : 'bg-[#EEF2F0] border-[#D5DFDB] text-[#132226]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Eye className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
            <span>
              Đang xem lại nước thứ <strong className="font-mono tabular-nums">{inspectMoveIndex + 1}</strong>
            </span>
          </div>
          {onExitInspect && (
            <button
              type="button"
              onClick={onExitInspect}
              className={`px-2 py-0.5 rounded text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                isDark ? 'bg-[#D97706] hover:bg-amber-500' : 'bg-[#0F766E] hover:bg-teal-600'
              }`}
            >
              Về nước hiện tại
            </button>
          )}
        </div>
      )}

      {/* Opponent Disconnected Strip (Online mode) */}
      {opponentDisconnected && (
        <div
          className={`w-full px-3 py-1 border-b flex items-center justify-between text-xs z-20 shrink-0 ${
            isDark
              ? 'bg-red-950/80 border-red-500/30 text-red-200'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span className="font-medium text-xs flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>
              Đối thủ mất kết nối · Chờ kết nối lại (<span className="font-mono tabular-nums">{opponentGraceSeconds}s</span>)
            </span>
          </span>
        </div>
      )}

      {/* Main Player HUD Row */}
      <div className="w-full px-3 py-2 flex items-center justify-between gap-3 min-w-0">
        {/* Left: Traditional Piece Disc + Unboxed Player Metadata */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 transition-colors ${
              isRed
                ? 'bg-[#FDF6E9] border-red-700/70 text-[#B91C1C]'
                : 'bg-[#F4F1EA] border-[#36291E] text-[#132226]'
            } ${
              isActive
                ? isRed
                  ? 'ring-2 ring-red-500/40'
                  : isDark
                  ? 'ring-2 ring-[#D97706]/50'
                  : 'ring-2 ring-[#0F766E]/45'
                : 'opacity-85'
            }`}
          >
            <span
              className="font-piece font-bold leading-none"
              style={{
                fontFamily:
                  '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif'
              }}
            >
              {avatarChar || (isRed ? '帥' : '將')}
            </span>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            {/* Single-line Name + Unboxed Metadata */}
            <div className="flex items-baseline gap-1.5 min-w-0 truncate">
              <h3
                className={`text-sm font-semibold truncate ${
                  isDark ? 'text-[#EFE6D5]' : 'text-[#132226]'
                }`}
                title={title}
              >
                {title}
              </h3>

              <div
                className={`flex items-center gap-1 text-xs truncate shrink-0 ${
                  isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'
                }`}
              >
                {badgeLabel && badgeLabel !== title && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{badgeLabel}</span>
                  </>
                )}
                {rank && elo ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className={`font-mono tabular-nums font-semibold ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`}>
                      {elo} Elo
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline">
                      ·
                    </span>
                    <span className="hidden sm:inline">{rank.tier}</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Turn / Check State Indicator (Unboxed text + functional icon) */}
            <div className="flex items-center gap-1.5 text-xs mt-0.5 min-w-0">
              {isActive ? (
                isCheck ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-red-500 truncate">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Đang bị chiếu tướng!</span>
                  </span>
                ) : (
                  <span
                    className={`font-semibold truncate ${
                      isRed
                        ? isDark
                          ? 'text-red-400'
                          : 'text-red-600'
                        : isDark
                        ? 'text-[#D97706]'
                        : 'text-[#0F766E]'
                    }`}
                  >
                    Đến lượt đi
                  </span>
                )
              ) : (
                <span className={`truncate ${isDark ? 'text-[#9C8A74]' : 'text-[#4A6368]'}`}>
                  Đợi lượt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Tabular Digital Clocks */}
        <div className="shrink-0 flex items-center gap-2 font-mono tabular-nums">
          {/* 60s Move Countdown */}
          {isActive && typeof turnTimer === 'number' && (
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
                !isTimerRunning
                  ? isDark
                    ? 'bg-[#120E0A] border-[#36291E] text-[#B8A996]'
                    : 'bg-[#EEF2F0] border-[#D5DFDB] text-[#4A6368]'
                  : turnTimer <= 10
                  ? isDark
                    ? 'bg-red-950/80 text-red-300 border-red-500'
                    : 'bg-red-50 text-red-700 border-red-400'
                  : isDark
                  ? 'bg-[#120E0A] text-[#D97706] border-[#36291E]'
                  : 'bg-[#EEF2F0] text-[#0F766E] border-[#D5DFDB]'
              }`}
              title={`Thời gian nước đi này: còn ${turnTimer}s / ${moveTimeLimit}s`}
            >
              <Timer className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{turnTimer}s</span>
            </div>
          )}

          {/* Total Match Clock */}
          <div
            className={`inline-flex items-center gap-1.5 text-sm sm:text-base font-bold px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
              isActive
                ? isUrgent
                  ? isDark
                    ? 'bg-red-950/80 border-red-500 text-red-300'
                    : 'bg-red-50 border-red-500 text-red-700'
                  : isDark
                  ? isRed
                    ? 'bg-[#120E0A] border-red-500/60 text-red-300'
                    : 'bg-[#120E0A] border-[#D97706]/70 text-[#EFE6D5]'
                  : isRed
                  ? 'bg-[#EEF2F0] border-red-300 text-red-700'
                  : 'bg-[#EEF2F0] border-[#0F766E]/60 text-[#0F766E]'
                : isDark
                ? 'bg-[#120E0A] border-[#36291E] text-[#B8A996]'
                : 'bg-[#EEF2F0] border-[#D5DFDB] text-[#4A6368]'
            }`}
            title={
              !isTimerRunning
                ? 'Thời gian sẽ bắt đầu tính sau khi đi nước cờ đầu tiên'
                : 'Tổng thời gian trận đấu'
            }
          >
            <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span>{timeLimit > 0 ? formatSec(timer) : '∞'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
