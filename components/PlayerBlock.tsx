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

export function PlayerBlock({
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
            ? 'bg-[#1D1318] border-red-500 text-slate-100'
            : isActive
            ? isRed
              ? 'bg-[#151C28] border-red-500/80 text-slate-100'
              : 'bg-[#151C28] border-amber-500/80 text-slate-100'
            : 'bg-[#151C28]/80 border-[#232D3F] text-slate-300'
          : isActive && isCheck
          ? 'bg-red-50 border-red-600 text-slate-900'
          : isActive
          ? isRed
            ? 'bg-white border-red-500 text-slate-900 shadow-2xs'
            : 'bg-white border-amber-600 text-slate-900 shadow-2xs'
          : 'bg-white/85 border-slate-200 text-slate-700'
      }`}
    >
      {/* Inspection Header Strip */}
      {isInspecting && typeof inspectMoveIndex === 'number' && (
        <div
          className={`w-full px-3 py-1 border-b flex items-center justify-between text-xs z-20 shrink-0 ${
            isDark
              ? 'bg-amber-950/70 border-amber-500/30 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Đang xem lại nước thứ <strong className="font-mono tabular-nums">{inspectMoveIndex + 1}</strong>
            </span>
          </div>
          {onExitInspect && (
            <button
              type="button"
              onClick={onExitInspect}
              className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
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
                : 'bg-[#F4F1EA] border-slate-700 text-[#1E293B]'
            } ${
              isActive
                ? isRed
                  ? 'ring-2 ring-red-500/40'
                  : 'ring-2 ring-amber-500/40'
                : 'opacity-80'
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
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
                title={title}
              >
                {title}
              </h3>

              <div
                className={`flex items-center gap-1 text-xs truncate shrink-0 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
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
                    <span className="font-mono tabular-nums font-medium text-amber-500">
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
                        ? 'text-amber-400'
                        : 'text-amber-700'
                    }`}
                  >
                    Đến lượt đi
                  </span>
                )
              ) : (
                <span className={`truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
                    ? 'bg-[#0E131B] border-[#232D3F] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                  : turnTimer <= 10
                  ? isDark
                    ? 'bg-red-950/80 text-red-300 border-red-500'
                    : 'bg-red-50 text-red-700 border-red-400'
                  : isDark
                  ? 'bg-[#0E131B] text-amber-300 border-[#232D3F]'
                  : 'bg-slate-50 text-amber-800 border-slate-200'
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
                    ? 'bg-[#0E131B] border-red-500/50 text-red-300'
                    : 'bg-[#0E131B] border-amber-500/50 text-amber-300'
                  : isRed
                  ? 'bg-slate-50 border-red-300 text-red-700'
                  : 'bg-slate-50 border-amber-300 text-amber-800'
                : isDark
                ? 'bg-[#0E131B] border-[#232D3F] text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
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
}
