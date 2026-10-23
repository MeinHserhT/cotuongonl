'use client';

import React from 'react';
import {
  Flame,
  Lightbulb,
  RotateCcw,
  Undo2,
  ArrowRight,
  ListFilter,
  X,
  CheckCircle2,
  AlertCircle,
  Star,
  Loader2,
  Cpu
} from 'lucide-react';
import { XiangqiPuzzle } from '@/lib/xiangqi-puzzles';

export interface PuzzleBannerProps {
  puzzle: XiangqiPuzzle;
  redMovesUsed: number;
  status: 'solving' | 'ai-thinking' | 'wrong' | 'solved';
  statusMessage: string | null;
  earnedStars: number;
  hintsUsed: number;
  isHintLoading?: boolean;
  canUndo?: boolean;
  onHint: () => void;
  onUndo: () => void;
  onRetry: () => void;
  onNextPuzzle: () => void;
  onOpenPuzzleList: () => void;
  onExitPuzzleMode: () => void;
  colorMode?: 'dark' | 'light';
}

export const PuzzleBanner: React.FC<PuzzleBannerProps> = React.memo(({
  puzzle,
  redMovesUsed,
  status,
  statusMessage,
  earnedStars,
  hintsUsed,
  isHintLoading = false,
  canUndo = false,
  onHint,
  onUndo,
  onRetry,
  onNextPuzzle,
  onOpenPuzzleList,
  onExitPuzzleMode,
  colorMode = 'dark'
}) => {
  const isDark = colorMode !== 'light';

  return (
    <div
      className={`w-full rounded-xl border p-2.5 sm:p-3 transition-colors shadow-md ${
        status === 'solved'
          ? isDark
            ? 'bg-emerald-950/60 border-emerald-500/60 text-slate-100'
            : 'bg-emerald-50 border-emerald-400 text-slate-900'
          : status === 'wrong'
          ? isDark
            ? 'bg-rose-950/60 border-rose-500/60 text-slate-100'
            : 'bg-rose-50 border-rose-400 text-slate-900'
          : isDark
          ? 'bg-[#151C28] border-amber-500/50 text-slate-100'
          : 'bg-amber-50/90 border-amber-300 text-slate-900'
      }`}
    >
      {/* Top Row: Puzzle Title + Move Quota Counter + Exit */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
              status === 'solved'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                : status === 'wrong'
                ? 'bg-rose-500/20 border-rose-400 text-rose-400'
                : 'bg-amber-500/20 border-amber-400 text-amber-400'
            }`}
          >
            {status === 'solved' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : status === 'ai-thinking' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Flame className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold tracking-tight truncate">
                Thế cờ: {puzzle.title}
              </span>
              <span className="text-xs opacity-40" aria-hidden="true">·</span>
              <span
                className={`text-[11px] font-semibold ${
                  isDark ? 'text-amber-300' : 'text-amber-800'
                }`}
              >
                {puzzle.difficultyLabel}
              </span>
            </div>
            <p
              className={`text-[11px] truncate flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <span>{puzzle.subtitle}</span>
              <span aria-hidden="true">·</span>
              <span>
                Nước Đỏ:{' '}
                <strong
                  className={`font-mono tabular-nums ${
                    redMovesUsed > puzzle.maxMoves && status !== 'solved'
                      ? 'text-rose-400'
                      : ''
                  }`}
                >
                  {redMovesUsed}/{puzzle.maxMoves}
                </strong>
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] opacity-85">
                <Cpu className="w-3 h-3 text-amber-400" />
                AI Kiện Tướng đối kháng
              </span>
            </p>
          </div>
        </div>

        {/* Right: Stars (if solved) + List + Exit */}
        <div className="flex items-center gap-1.5 shrink-0">
          {status === 'solved' && (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 mr-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= earnedStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onOpenPuzzleList}
            className={`px-2 py-1 min-h-[32px] rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
              isDark
                ? 'bg-[#0E131B] hover:bg-[#1E2738] border-[#28344B] text-slate-200'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
            }`}
            title="Danh sách 10 thế cờ kinh điển"
          >
            <ListFilter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Đổi thế</span>
          </button>

          <button
            type="button"
            onClick={onExitPuzzleMode}
            className={`p-1.5 min-h-[32px] min-w-[32px] rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 touch-manipulation ${
              isDark
                ? 'bg-[#0E131B] hover:bg-rose-950/60 border-[#28344B] text-slate-400 hover:text-rose-300'
                : 'bg-white hover:bg-rose-50 border-slate-300 text-slate-600 hover:text-rose-700'
            }`}
            title="Thoát chế độ Giải Cờ Thế"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Dynamic AI Feedback & Tactical Controls */}
      <div className="mt-2 pt-2 border-t border-slate-500/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium min-w-0 flex-1">
          {status === 'wrong' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
          {status === 'solved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          {status === 'ai-thinking' && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />}
          <span
            className={`line-clamp-2 ${
              status === 'solved'
                ? isDark
                  ? 'text-emerald-300 font-semibold'
                  : 'text-emerald-800 font-semibold'
                : status === 'wrong'
                ? isDark
                  ? 'text-rose-300 font-semibold'
                  : 'text-rose-800 font-semibold'
                : isDark
                ? 'text-amber-200/90'
                : 'text-amber-900'
            }`}
          >
            {statusMessage || 'Hãy đi nước cờ Đỏ để công sát — AI Kiện Tướng sẽ tự động đáp trả tối ưu!'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {status !== 'solved' && (
            <button
              type="button"
              disabled={status === 'ai-thinking' || isHintLoading}
              onClick={onHint}
              className={`px-2.5 py-1 min-h-[32px] rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation disabled:opacity-50 ${
                isDark
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                  : 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900'
              }`}
              title="Dùng AI Kiện Tướng tính nước công sát tối ưu kèm thuyết minh sát pháp"
            >
              {isHintLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Gợi ý AI {hintsUsed > 0 ? `(${hintsUsed})` : ''}</span>
            </button>
          )}

          {canUndo && status !== 'solved' && (
            <button
              type="button"
              disabled={status === 'ai-thinking'}
              onClick={onUndo}
              className={`px-2.5 py-1 min-h-[32px] rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation disabled:opacity-50 ${
                isDark
                  ? 'bg-[#0E131B] hover:bg-[#1E2738] border-[#28344B] text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
              title="Lùi lại nước vừa đi để thử hướng công sát khác"
            >
              <Undo2 className="w-3.5 h-3.5 shrink-0" />
              <span>Lùi nước</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRetry}
            className={`px-2.5 py-1 min-h-[32px] rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
              isDark
                ? 'bg-[#0E131B] hover:bg-[#1E2738] border-[#28344B] text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
            title="Khôi phục thế cờ ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Đi lại</span>
          </button>

          {status === 'solved' && (
            <button
              type="button"
              onClick={onNextPuzzle}
              className="px-3 py-1 min-h-[32px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation shadow-xs"
            >
              <span>Thế tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

PuzzleBanner.displayName = 'PuzzleBanner';
