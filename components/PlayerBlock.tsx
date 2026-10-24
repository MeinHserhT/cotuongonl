'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Timer, ShieldAlert, Eye, Flame } from 'lucide-react';
import { PIECES, BoardTheme, getRankTier } from '@/lib/xiangqi-types';

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
  orientation?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

export const PlayerBlock = React.memo(function PlayerBlock({
  isActive,
  isRed,
  avatarChar,
  title,
  badgeLabel,
  capturedPieces = [],
  timer,
  timeLimit,
  formatSec,
  elo,
  theme = 'imperial',
  isTimerRunning = true,
  turnTimer,
  moveTimeLimit = 60,
  isCheck = false,
  isInspecting = false,
  inspectMoveIndex = null,
  onExitInspect,
  opponentDisconnected = false,
  opponentGraceSeconds = 30,
  colorMode = 'dark',
  orientation = 'horizontal',
  style,
  className
}: PlayerBlockProps) {
  const isDark = colorMode !== 'light';
  const isZen = theme === 'zen';
  const hasTurnTimer = typeof turnTimer === 'number';
  const isTurnTimerUrgent = isActive && isTimerRunning && hasTurnTimer && turnTimer <= 15;
  const isMainTimerUrgent = isActive && isTimerRunning && timeLimit > 0 && timer <= 15;
  const isUrgent15s = isTurnTimerUrgent || isMainTimerUrgent;

  const thinkingRemaining = hasTurnTimer ? turnTimer : timer;
  const thinkingTotal = hasTurnTimer ? moveTimeLimit : timeLimit;
  const thinkingPct =
    thinkingTotal > 0 ? Math.max(0, Math.min(100, (thinkingRemaining / thinkingTotal) * 100)) : 100;

  const rank = elo ? getRankTier(elo, isDark) : null;
  const isVertical = orientation === 'vertical';

  const containerThemeClass = isUrgent15s
    ? isDark
      ? 'bg-[#2A1010] border-red-500 ring-1 ring-red-500/70 text-[#EFE6D5]'
      : 'bg-red-50 border-red-600 ring-1 ring-red-500/60 text-[#132226]'
    : isDark
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
    : 'bg-[#FFFFFF]/90 border-[#D5DFDB] text-[#4A6368]';

  if (isVertical) {
    return (
      <div
        style={style}
        className={`relative self-center h-full max-h-[96dvh] w-fit min-w-[98px] sm:min-w-[112px] max-w-[128px] rounded-xl border flex flex-col justify-between transition-colors duration-150 overflow-hidden shrink-0 ${containerThemeClass} ${className || ''}`}
      >
        <div className="flex flex-col w-full min-w-0 shrink-0">
          {isInspecting && typeof inspectMoveIndex === 'number' && (
            <div
              className={`w-full px-2 py-1 border-b flex flex-col items-center gap-1 text-[10px] z-20 shrink-0 text-center ${
                isDark
                  ? 'bg-[#120E0A] border-[#36291E] text-[#EFE6D5]'
                  : 'bg-[#EEF2F0] border-[#D5DFDB] text-[#132226]'
              }`}
            >
              <div className="flex items-center gap-1 font-medium">
                <Eye className={`w-3 h-3 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                <span>
                  Nước <strong className="font-mono tabular-nums">{inspectMoveIndex + 1}</strong>
                </span>
              </div>
              {onExitInspect && (
                <button
                  type="button"
                  onClick={onExitInspect}
                  className={`w-full px-1.5 py-0.5 rounded text-white font-semibold text-[10px] transition-colors cursor-pointer truncate ${
                    isDark ? 'bg-[#D97706] hover:bg-amber-500' : 'bg-[#0F766E] hover:bg-teal-600'
                  }`}
                >
                  Về hiện tại
                </button>
              )}
            </div>
          )}

          {opponentDisconnected && (
            <div
              className={`w-full px-2 py-1 border-b flex items-center justify-center text-[10px] z-20 shrink-0 text-center ${
                isDark
                  ? 'bg-red-950/80 border-red-500/30 text-red-200'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <span className="font-medium flex flex-col items-center gap-0.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>
                  Mất kết nối (<span className="font-mono tabular-nums">{opponentGraceSeconds}s</span>)
                </span>
              </span>
            </div>
          )}

          {/* Identity & Status Column */}
          <div className="w-full px-2.5 py-2 flex flex-col items-center text-center gap-1.5 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border shrink-0 transition-colors ${
                isRed
                  ? 'bg-[#FDF6E9] border-red-700/70 text-[#B91C1C]'
                  : 'bg-[#F4F1EA] border-[#36291E] text-[#132226]'
              } ${
                isActive
                  ? isRed
                    ? 'ring-2 ring-red-500/50'
                    : isDark
                    ? 'ring-2 ring-[#D97706]/60'
                    : 'ring-2 ring-[#0F766E]/55'
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

            <div className="flex flex-col items-center min-w-0 w-full gap-0.5">
              <h3
                className={`text-xs font-semibold truncate leading-tight max-w-[108px] ${
                  isDark ? 'text-[#EFE6D5]' : 'text-[#132226]'
                }`}
                title={title}
              >
                {title}
              </h3>

              <div
                className={`flex flex-wrap items-center justify-center gap-x-1 gap-y-0 text-[10px] leading-tight w-full ${
                  isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'
                }`}
              >
                {badgeLabel && badgeLabel !== title && (
                  <span className="truncate max-w-full">{badgeLabel}</span>
                )}
                {rank && elo ? (
                  <span className={`font-mono tabular-nums font-semibold ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`}>
                    {elo} Elo
                  </span>
                ) : null}
              </div>

              {/* Turn / Check State Indicator (No decorative pulsing dots) */}
              <div className="flex items-center justify-center text-[10px] sm:text-[11px] mt-0.5 w-full">
                {isActive ? (
                  isCheck ? (
                    <span className="inline-flex items-center gap-1 font-bold text-red-500 text-center leading-tight">
                      <ShieldAlert className="w-3 h-3 shrink-0" />
                      <span>Chiếu tướng!</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 font-semibold truncate ${
                        isUrgent15s
                          ? 'text-red-500 font-bold'
                          : isRed
                          ? isDark
                            ? 'text-red-400'
                            : 'text-red-600'
                          : isDark
                          ? 'text-[#D97706]'
                          : 'text-[#0F766E]'
                      }`}
                    >
                      <span>Đến lượt</span>
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
        </div>

        {/* Integrated Captured Pieces Tray (when vh < vw) */}
        <div
          className={`flex-1 w-full min-h-0 border-t px-1.5 py-2 flex flex-col items-center justify-start overflow-hidden ${
            isDark ? 'border-[#36291E] bg-[#120E0A]/35' : 'border-[#D5DFDB] bg-[#EEF2F0]/40'
          }`}
        >
          <div className="w-full px-1 pb-1.5 flex items-center justify-between text-[10px] leading-none shrink-0">
            <span className={isDark ? 'text-[#9C8A74]' : 'text-[#4A6368]'}>Quân ăn</span>
            {capturedPieces.length > 0 && (
              <span className={`font-mono tabular-nums font-bold ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`}>
                +{capturedPieces.length}
              </span>
            )}
          </div>

          <div className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none flex flex-wrap items-start justify-center content-start gap-1.5 py-0.5">
            {capturedPieces.length > 0 ? (
              <AnimatePresence initial={false}>
                {capturedPieces.map((code, index) => {
                  const piece = PIECES[code];
                  if (!piece) return null;
                  const isRedPiece = piece.color === 'r';
                  const isLatest = index === capturedPieces.length - 1;
                  const isHidden = code === 'r_u' || code === 'b_u';

                  if (isHidden) {
                    return (
                      <motion.div
                        key={`vp-cap-${code}-${index}`}
                        initial={{ scale: 0, opacity: 0, y: 12 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 24, mass: 0.75 }}
                        className={`relative shrink-0 flex items-center justify-center ${isLatest ? 'z-25' : ''}`}
                        title="Quân úp bí ẩn (chưa lật mở)"
                      >
                        <div
                          className={`w-[23px] h-[23px] sm:w-[25px] sm:h-[25px] rounded-full flex items-center justify-center select-none font-serif font-black text-[10px] border-[1.5px] shadow-2xs ${
                            isLatest ? 'ring-2 ring-amber-400/90' : ''
                          } ${
                            isRedPiece
                              ? 'bg-[radial-gradient(circle_at_35%_25%,#3a1515_0%,#240b0b_70%,#150505_100%)] text-amber-300 border-red-700/80'
                              : 'bg-[radial-gradient(circle_at_35%_25%,#1f242d_0%,#14171f_70%,#090a0e_100%)] text-slate-300 border-slate-600/80'
                          }`}
                        >
                          <div className="absolute inset-[1.5px] rounded-full border border-dashed border-amber-500/30 pointer-events-none" />
                          <span>?</span>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={`vp-cap-${code}-${index}`}
                      initial={{ scale: 0, opacity: 0, y: 12 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 24, mass: 0.75 }}
                      className={`relative shrink-0 flex items-center justify-center ${isLatest ? 'z-25' : ''}`}
                      title={`${piece.nameVn} (Ăn ở nước #${index + 1})`}
                    >
                      <div
                        className={`w-[23px] h-[23px] sm:w-[25px] sm:h-[25px] rounded-full flex items-center justify-center select-none font-serif font-black text-[10.5px] sm:text-[11.5px] border-[1.5px] shadow-2xs ${
                          isLatest ? 'ring-2 ring-amber-400/90' : ''
                        } ${
                          isRedPiece
                            ? isZen
                              ? 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#fef2f2_65%,#fed7aa_100%)] text-[#b91c1c] border-amber-300'
                              : 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#fef2f2_65%,#fecaca_100%)] text-[#dc2626] border-red-300'
                            : isZen
                            ? 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#f1f5f9_65%,#94a3b8_100%)] text-[#0f172a] border-slate-300'
                            : 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#f8fafc_65%,#cbd5e1_100%)] text-[#0f172a] border-slate-300'
                        }`}
                        style={{
                          textShadow: isRedPiece
                            ? '0 0.5px 1px rgba(255,255,255,0.9), 0 -0.5px 1px rgba(185,28,28,0.4)'
                            : '0 0.5px 1px rgba(255,255,255,0.9), 0 -0.5px 1px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="absolute inset-[1.5px] rounded-full border border-slate-300/35 pointer-events-none" />
                        <span
                          className="font-piece font-bold"
                          style={{
                            fontFamily:
                              '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif'
                          }}
                        >
                          {piece.nameCn}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : null}
          </div>
        </div>

        {/* Distinct Clock / Thinking Time Module */}
        <div
          className={`w-full p-1.5 sm:p-2 border-t flex flex-col gap-1.5 font-mono tabular-nums shrink-0 transition-colors ${
            isUrgent15s
              ? isDark
                ? 'border-red-500/80 bg-red-950/60'
                : 'border-red-400 bg-red-100/80'
              : isDark
              ? 'border-[#36291E] bg-[#120E0A]/65'
              : 'border-[#D5DFDB] bg-[#EEF2F0]/75'
          }`}
        >
          <div
            className={`relative w-full rounded-lg border px-2 py-1.5 flex flex-col items-center justify-center overflow-hidden transition-colors duration-150 ${
              isUrgent15s
                ? 'bg-red-600 border-amber-300 text-white'
                : isActive
                ? isDark
                  ? isRed
                    ? 'bg-[#1B120E] border-red-500/80 text-[#EFE6D5]'
                    : 'bg-[#1B140E] border-[#D97706] text-[#EFE6D5]'
                  : isRed
                  ? 'bg-white border-red-500 text-[#132226] shadow-2xs'
                  : 'bg-white border-[#0F766E] text-[#132226] shadow-2xs'
                : isDark
                ? 'bg-[#120E0A]/80 border-[#36291E] text-[#9C8A74]'
                : 'bg-white/70 border-[#D5DFDB] text-[#4A6368]'
            }`}
            title={
              !isTimerRunning
                ? 'Thời gian sẽ bắt đầu tính sau khi đi nước cờ đầu tiên'
                : hasTurnTimer
                ? `Thời gian suy nghĩ nước đi: còn ${turnTimer}s / ${moveTimeLimit}s`
                : 'Thời gian suy nghĩ'
            }
          >
            <div className="flex items-center justify-center gap-1 text-[10px] font-sans font-medium leading-none mb-0.5">
              {isUrgent15s ? (
                <>
                  <Flame className="w-3 h-3 text-amber-300 shrink-0" />
                  <span className="text-amber-200 font-semibold">Sắp hết giờ</span>
                </>
              ) : (
                <>
                  <Timer
                    className={`w-3 h-3 shrink-0 ${
                      isActive
                        ? isRed
                          ? 'text-red-500'
                          : isDark
                          ? 'text-[#D97706]'
                          : 'text-[#0F766E]'
                        : 'opacity-60'
                    }`}
                  />
                  <span className="opacity-80">{hasTurnTimer ? 'Nước đi' : 'Suy nghĩ'}</span>
                </>
              )}
            </div>

            <div
              className={`font-mono tabular-nums font-bold leading-none tracking-tight ${
                isUrgent15s
                  ? 'text-lg sm:text-xl text-white'
                  : isActive
                  ? 'text-base sm:text-lg'
                  : 'text-sm sm:text-base opacity-80'
              }`}
            >
              {hasTurnTimer
                ? `${turnTimer}s`
                : timeLimit > 0
                ? timer <= 15 && isActive && isTimerRunning
                  ? `${timer}s`
                  : formatSec(timer)
                : '∞'}
            </div>

            {isActive && thinkingTotal > 0 && (
              <div
                className={`w-full h-1 rounded-full mt-1.5 overflow-hidden ${
                  isUrgent15s
                    ? 'bg-red-950/70'
                    : isDark
                    ? 'bg-[#36291E]'
                    : 'bg-[#D5DFDB]'
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isUrgent15s
                      ? 'bg-amber-300'
                      : isRed
                      ? 'bg-red-500'
                      : isDark
                      ? 'bg-[#D97706]'
                      : 'bg-[#0F766E]'
                  }`}
                  style={{ width: `${thinkingPct}%` }}
                />
              </div>
            )}
          </div>

          {hasTurnTimer && (
            <div
              className={`w-full inline-flex items-center justify-between gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                isMainTimerUrgent
                  ? 'bg-red-600 border-amber-300 text-white'
                  : isDark
                  ? 'bg-[#120E0A] border-[#36291E] text-[#B8A996]'
                  : 'bg-white/80 border-[#D5DFDB] text-[#4A6368]'
              }`}
              title="Tổng thời gian trận đấu"
            >
              <Clock className="w-3 h-3 shrink-0 opacity-75" />
              <span>{timeLimit > 0 ? formatSec(timer) : '∞'}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`relative w-full rounded-xl border flex flex-col transition-colors duration-150 min-h-[48px] overflow-hidden ${containerThemeClass} ${className || ''}`}
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

      {/* Opponent Disconnected Strip */}
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

      {/* Player + Clock Row */}
      <div className="w-full px-2.5 sm:px-3 py-1.5 flex items-center justify-between gap-2 sm:gap-2.5 min-w-0">
        {/* Left: Traditional Piece Disc + Player Metadata */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border shrink-0 transition-colors ${
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

          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1 min-w-0 truncate">
              <h3
                className={`text-xs sm:text-sm font-semibold truncate ${
                  isDark ? 'text-[#EFE6D5]' : 'text-[#132226]'
                }`}
                title={title}
              >
                {title}
              </h3>

              <div
                className={`flex items-center gap-1 text-[11px] truncate shrink-0 ${
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
                    <span aria-hidden="true" className="hidden sm:inline">·</span>
                    <span className={`hidden sm:inline font-mono tabular-nums font-semibold ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`}>
                      {elo}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Turn / Check State Indicator (No decorative pulsing dots) */}
            <div className="flex items-center gap-1 text-[11px] leading-tight mt-0.5 min-w-0">
              {isActive ? (
                isCheck ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-red-500 truncate">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span>Chiếu tướng!</span>
                  </span>
                ) : isUrgent15s ? (
                  <span className="inline-flex items-center gap-1 font-bold text-red-500 truncate">
                    <Flame className="w-3 h-3 shrink-0" />
                    <span>Còn {thinkingRemaining}s!</span>
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 font-semibold truncate ${
                      isRed
                        ? isDark
                          ? 'text-red-400'
                          : 'text-red-600'
                        : isDark
                        ? 'text-[#D97706]'
                        : 'text-[#0F766E]'
                    }`}
                  >
                    <span>Đến lượt</span>
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

        {/* Right: High-Visibility Tabular Digital Clocks */}
        <div className="shrink-0 flex items-center gap-1.5 font-mono tabular-nums">
          <div
            className={`relative min-w-[78px] sm:min-w-[92px] px-2.5 py-1 rounded-lg border flex flex-col items-center justify-center overflow-hidden transition-colors duration-150 shrink-0 ${
              isUrgent15s
                ? 'bg-red-600 border-amber-300 text-white'
                : isActive
                ? isDark
                  ? isRed
                    ? 'bg-[#120E0A] border-red-500/80 text-[#EFE6D5]'
                    : 'bg-[#120E0A] border-[#D97706] text-[#EFE6D5]'
                  : isRed
                  ? 'bg-[#EEF2F0] border-red-500 text-[#132226]'
                  : 'bg-[#EEF2F0] border-[#0F766E] text-[#132226]'
                : isDark
                ? 'bg-[#120E0A]/75 border-[#36291E] text-[#9C8A74]'
                : 'bg-[#EEF2F0]/75 border-[#D5DFDB] text-[#4A6368]'
            }`}
            title={
              !isTimerRunning
                ? 'Thời gian sẽ bắt đầu tính sau khi đi nước cờ đầu tiên'
                : hasTurnTimer
                ? `Thời gian suy nghĩ nước đi: còn ${turnTimer}s / ${moveTimeLimit}s`
                : 'Thời gian suy nghĩ'
            }
          >
            <div className="flex items-center gap-1 text-[9.5px] font-sans font-medium leading-none mb-0.5">
              {isUrgent15s ? (
                <>
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
                  <span className="text-amber-200 font-semibold">≤15s</span>
                </>
              ) : (
                <>
                  <Timer
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${
                      isActive
                        ? isRed
                          ? 'text-red-500'
                          : isDark
                          ? 'text-[#D97706]'
                          : 'text-[#0F766E]'
                        : 'opacity-65'
                    }`}
                  />
                  <span className="opacity-80">{hasTurnTimer ? 'Nước đi' : 'Suy nghĩ'}</span>
                </>
              )}
            </div>

            <div
              className={`font-mono tabular-nums font-bold leading-none tracking-tight ${
                isUrgent15s
                  ? 'text-sm sm:text-base text-white'
                  : 'text-xs sm:text-sm'
              }`}
            >
              {hasTurnTimer
                ? `${turnTimer}s`
                : timeLimit > 0
                ? timer <= 15 && isActive && isTimerRunning
                  ? `${timer}s`
                  : formatSec(timer)
                : '∞'}
            </div>

            {isActive && thinkingTotal > 0 && (
              <div
                className={`w-full h-1 rounded-full mt-1 overflow-hidden ${
                  isUrgent15s
                    ? 'bg-red-950/70'
                    : isDark
                    ? 'bg-[#36291E]'
                    : 'bg-[#D5DFDB]'
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isUrgent15s
                      ? 'bg-amber-300'
                      : isRed
                      ? 'bg-red-500'
                      : isDark
                      ? 'bg-[#D97706]'
                      : 'bg-[#0F766E]'
                  }`}
                  style={{ width: `${thinkingPct}%` }}
                />
              </div>
            )}
          </div>

          {hasTurnTimer && (
            <div
              className={`inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg border transition-colors shrink-0 ${
                isMainTimerUrgent
                  ? 'bg-red-600 border-amber-300 text-white'
                  : isDark
                  ? 'bg-[#120E0A] border-[#36291E] text-[#B8A996]'
                  : 'bg-[#EEF2F0] border-[#D5DFDB] text-[#4A6368]'
              }`}
              title="Tổng thời gian trận đấu"
            >
              <span className="text-[9.5px] font-sans font-medium opacity-75 leading-none mb-0.5">
                Tổng giờ
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-bold leading-none">
                <Clock className="w-2.5 h-2.5 shrink-0 opacity-75" />
                <span>{timeLimit > 0 ? formatSec(timer) : '∞'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});


