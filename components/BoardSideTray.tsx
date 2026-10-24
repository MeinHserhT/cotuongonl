'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PIECES, BoardTheme } from '@/lib/xiangqi-types';

export interface BoardSideTrayProps {
  playerColor?: 'r' | 'b';
  playerName?: string;
  pieces: string[];
  theme?: BoardTheme;
  orientation?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
  colorMode?: 'dark' | 'light';
}

export const BoardSideTray = React.memo(function BoardSideTray({
  playerColor,
  pieces,
  theme = 'imperial',
  orientation = 'horizontal',
  style,
  className,
  colorMode = 'dark'
}: BoardSideTrayProps) {
  const isDark = colorMode !== 'light';
  const isZen = theme === 'zen';
  const isMarble = theme === 'marble';
  const isLacquer = theme === 'lacquer';
  const isRedHolder = playerColor === 'r';
  const isVertical = orientation === 'vertical';

  const traySurfaceClass = isDark
    ? isMarble
      ? 'border-[#24343D] bg-[#131F24]/95'
      : isLacquer
      ? 'border-[#78350f] bg-[#1a0505]/95'
      : 'border-[#36291E] bg-[#1F1812]/95'
    : isMarble
    ? 'border-[#0F766E]/35 bg-[#FFFFFF]/95'
    : isLacquer
    ? 'border-[#b45309] bg-[#2b0908]/95'
    : 'border-[#D5DFDB] bg-[#FFFFFF]/95 shadow-2xs';

  if (isVertical) {
    return (
      <div
        style={style}
        className={`self-stretch h-full min-h-0 w-9 sm:w-10 md:w-10.5 rounded-xl border py-2 sm:py-2.5 px-1 flex flex-col items-center justify-between select-none z-20 shrink-0 transition-colors duration-150 ${traySurfaceClass} ${className || ''}`}
      >
        {/* Top Explicit Side Label (No hue-only dot) */}
        <div
          className={`pb-1.5 mb-1 border-b shrink-0 w-full flex items-center justify-center text-[10px] font-semibold leading-none ${
            isDark ? 'border-[#36291E]' : 'border-[#D5DFDB]'
          } ${
            isRedHolder
              ? isDark
                ? 'text-red-400'
                : 'text-red-600'
              : isDark
              ? 'text-[#B8A996]'
              : 'text-[#4A6368]'
          }`}
          title={isRedHolder ? 'Quân bên Đỏ ăn được' : 'Quân bên Đen ăn được'}
        >
          <span>{isRedHolder ? 'Đỏ' : 'Đen'}</span>
        </div>

        {/* Captured Pieces Vertical List */}
        <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-start gap-1.5 sm:gap-2 overflow-y-auto overflow-x-hidden scrollbar-none py-1 px-0.5">
          {pieces.length > 0 ? (
            <AnimatePresence initial={false}>
              {pieces.map((code, index) => {
                const piece = PIECES[code];
                if (!piece) return null;
                const isRedPiece = piece.color === 'r';
                const isLatest = index === pieces.length - 1;
                const isHidden = code === 'r_u' || code === 'b_u';

                if (isHidden) {
                  return (
                    <motion.div
                      key={`v-cap-${code}-${index}`}
                      initial={{ scale: 0, opacity: 0, y: 16, rotate: -25 }}
                      animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 24,
                        mass: 0.75
                      }}
                      whileHover={{ scale: 1.12, zIndex: 30 }}
                      className={`relative shrink-0 flex items-center justify-center cursor-pointer ${
                        isLatest ? 'z-25' : ''
                      }`}
                      title="Quân úp bí ẩn (chưa lật mở)"
                    >
                      <div
                        className={`w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] md:w-[26px] md:h-[26px] rounded-full flex items-center justify-center select-none font-serif font-black text-[9px] sm:text-[10px] md:text-[10.5px] border-[1.5px] shadow-2xs transition-colors ${
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
                    key={`v-cap-${code}-${index}`}
                    initial={{ scale: 0, opacity: 0, y: 16, rotate: -25 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 24,
                      mass: 0.75
                    }}
                    whileHover={{ scale: 1.12, zIndex: 30 }}
                    className={`relative shrink-0 flex items-center justify-center cursor-pointer ${
                      isLatest ? 'z-25' : ''
                    }`}
                    title={`${piece.nameVn} (Ăn ở nước #${index + 1})`}
                  >
                    <div
                      className={`w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] md:w-[26px] md:h-[26px] rounded-full flex items-center justify-center select-none font-serif font-black text-[10px] sm:text-[11px] md:text-[11.5px] border-[1.5px] shadow-2xs transition-colors ${
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
                      <span className="font-piece font-bold" style={{ fontFamily: '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif' }}>
                        {piece.nameCn}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : null}
        </div>

        {/* Bottom Captured Pieces Count */}
        {pieces.length > 0 && (
          <div className={`pt-1.5 mt-1 border-t shrink-0 text-[10px] sm:text-[11px] font-mono tabular-nums font-bold text-center ${
            isDark ? 'border-[#36291E] text-[#D97706]' : 'border-[#D5DFDB] text-[#0F766E]'
          }`}>
            {pieces.length}
          </div>
        )}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div
      style={style}
      className={`w-full max-w-full h-9 sm:h-10 rounded-xl border px-2.5 sm:px-3 flex items-center justify-between select-none z-20 shrink-0 transition-colors duration-150 ${traySurfaceClass} ${className || ''}`}
    >
      <div
        className={`flex items-center gap-1.5 pr-2.5 mr-1 border-r shrink-0 text-[11px] font-semibold ${
          isDark ? 'border-[#36291E]' : 'border-[#D5DFDB]'
        } ${
          isRedHolder
            ? isDark
              ? 'text-red-400'
              : 'text-red-600'
            : isDark
            ? 'text-[#B8A996]'
            : 'text-[#4A6368]'
        }`}
        title={isRedHolder ? 'Quân bên Đỏ ăn được' : 'Quân bên Đen ăn được'}
      >
        <span>{isRedHolder ? 'Quân Đỏ ăn' : 'Quân Đen ăn'}</span>
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden scrollbar-none flex-nowrap py-0.5 px-1">
        {pieces.length > 0 ? (
          <AnimatePresence initial={false}>
            {pieces.map((code, index) => {
              const piece = PIECES[code];
              if (!piece) return null;
              const isRedPiece = piece.color === 'r';
              const isLatest = index === pieces.length - 1;

              return (
                <motion.div
                  key={`cap-${code}-${index}`}
                  initial={{ scale: 0, opacity: 0, x: 18, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 24,
                    mass: 0.75
                  }}
                  whileHover={{ scale: 1.15, zIndex: 30 }}
                  className={`relative shrink-0 flex items-center justify-center cursor-pointer ${
                    isLatest ? 'z-25' : ''
                  }`}
                  title={`${piece.nameVn} (Ăn ở nước #${index + 1})`}
                >
                  <div
                    className={`w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] md:w-[27px] md:h-[27px] rounded-full flex items-center justify-center select-none font-serif font-black text-[10px] sm:text-[11px] md:text-[12px] border-[1.5px] shadow-sm transition-all ${
                      isLatest
                        ? 'ring-2 ring-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        : ''
                    } ${
                      isRedPiece
                        ? isZen
                          ? 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#fef2f2_65%,#fed7aa_100%)] text-[#b91c1c] border-amber-300 shadow-[0_1px_3px_rgba(185,28,28,0.35)]'
                          : 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#fef2f2_65%,#fecaca_100%)] text-[#dc2626] border-red-300 shadow-[0_1px_3px_rgba(220,38,38,0.35)]'
                          : isZen
                          ? 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#f1f5f9_65%,#94a3b8_100%)] text-[#0f172a] border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.4)]'
                          : 'bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#f8fafc_65%,#cbd5e1_100%)] text-[#0f172a] border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.4)]'
                    }`}
                    style={{
                      textShadow: isRedPiece
                        ? '0 0.5px 1px rgba(255,255,255,0.9), 0 -0.5px 1px rgba(185,28,28,0.4)'
                        : '0 0.5px 1px rgba(255,255,255,0.9), 0 -0.5px 1px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div className="absolute inset-[1.5px] rounded-full border border-slate-300/35 pointer-events-none" />
                    <span className="font-piece font-bold" style={{ fontFamily: '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif' }}>
                      {piece.nameCn}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : null}
      </div>

      {pieces.length > 0 && (
        <div className={`pl-2 ml-1 border-l shrink-0 text-[10px] sm:text-[11px] font-mono tabular-nums font-bold ${
          isDark ? 'border-[#36291E] text-[#D97706]' : 'border-[#D5DFDB] text-[#0F766E]'
        }`}>
          {pieces.length}
        </div>
      )}
    </div>
  );
});
