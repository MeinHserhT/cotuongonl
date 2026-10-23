'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Trophy,
  Star,
  Flame,
  Play,
  CheckCircle2,
  Filter,
  Sparkles,
  Swords
} from 'lucide-react';
import {
  XIANGQI_PUZZLES,
  XiangqiPuzzle,
  PuzzleDifficulty,
  PuzzleProgressMap
} from '@/lib/xiangqi-puzzles';

export interface PuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePuzzleId: string | null;
  progressMap: PuzzleProgressMap;
  onSelectPuzzle: (puzzle: XiangqiPuzzle) => void;
  colorMode?: 'dark' | 'light';
}

const DIFFICULTY_FILTERS: { id: 'all' | PuzzleDifficulty; label: string }[] = [
  { id: 'all', label: 'Tất cả (10)' },
  { id: 'easy', label: 'Nhập Môn' },
  { id: 'medium', label: 'Trung Cấp' },
  { id: 'hard', label: 'Cao Thủ' },
  { id: 'master', label: 'Danh Cục' }
];

export const PuzzleModal: React.FC<PuzzleModalProps> = React.memo(({
  isOpen,
  onClose,
  activePuzzleId,
  progressMap,
  onSelectPuzzle,
  colorMode = 'dark'
}) => {
  const [selectedDiff, setSelectedDiff] = useState<'all' | PuzzleDifficulty>('all');

  const filteredPuzzles = useMemo(() => {
    if (selectedDiff === 'all') return XIANGQI_PUZZLES;
    return XIANGQI_PUZZLES.filter((p) => p.difficulty === selectedDiff);
  }, [selectedDiff]);

  const { solvedCount, totalStars, maxStars } = useMemo(() => {
    let solved = 0;
    let stars = 0;
    for (const p of XIANGQI_PUZZLES) {
      const prog = progressMap[p.id];
      if (prog?.solved) {
        solved++;
        stars += prog.stars || 0;
      }
    }
    return {
      solvedCount: solved,
      totalStars: stars,
      maxStars: XIANGQI_PUZZLES.length * 3
    };
  }, [progressMap]);

  if (!isOpen) return null;

  const isDark = colorMode !== 'light';

  const getDiffBadgeClasses = (diff: PuzzleDifficulty) => {
    switch (diff) {
      case 'easy':
        return isDark
          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
          : 'bg-emerald-50 border-emerald-300 text-emerald-800';
      case 'medium':
        return isDark
          ? 'bg-sky-950/80 border-sky-500/40 text-sky-300'
          : 'bg-sky-50 border-sky-300 text-sky-800';
      case 'hard':
        return isDark
          ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
          : 'bg-amber-50 border-amber-300 text-amber-800';
      case 'master':
        return isDark
          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          : 'bg-rose-50 border-rose-300 text-rose-800';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl max-h-[88dvh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#141A26] border-[#263248] text-slate-100'
            : 'bg-[#FAF7F0] border-[#D6C9B5] text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-[#101520] border-[#232D3F]' : 'bg-[#F2ECE1] border-[#DED2C0]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-amber-100 border-amber-400 text-amber-800'
              }`}
            >
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Giải Cờ Thế Kinh Điển &amp; Sát Pháp
              </h2>
              <p className={`text-[11px] sm:text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Luyện tuyệt kỹ sát chiêu thực chiến — Cầm Đỏ đi tiên chiếu bí
              </p>
            </div>
          </div>

          {/* Progress Summary + Close */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                isDark
                  ? 'bg-[#192132] border-[#2A3750] text-amber-300'
                  : 'bg-white border-[#DED2C0] text-amber-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{solvedCount}/{XIANGQI_PUZZLES.length}</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-0.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {totalStars}/{maxStars}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#1A2233] hover:bg-[#242F46] border-[#2E3C56] text-slate-300'
                  : 'bg-white hover:bg-slate-100 border-[#D2C5B0] text-slate-700'
              }`}
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className={`px-3 sm:px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
            isDark ? 'bg-[#121722] border-[#222B3C]' : 'bg-[#F6F1E7] border-[#E4DAC8]'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-1" />
          {DIFFICULTY_FILTERS.map((f) => {
            const active = selectedDiff === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedDiff(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  active
                    ? 'bg-amber-600 border-amber-400 text-white shadow-2xs'
                    : isDark
                    ? 'bg-[#192130] hover:bg-[#222C40] border-[#2A364E] text-slate-300'
                    : 'bg-white hover:bg-amber-50 border-[#D8CBB8] text-slate-700'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Puzzle Grid */}
        <div className="p-3 sm:p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {filteredPuzzles.map((puzzle, index) => {
            const prog = progressMap[puzzle.id];
            const isSolved = !!prog?.solved;
            const stars = prog?.stars || 0;
            const isCurrent = activePuzzleId === puzzle.id;

            return (
              <div
                key={puzzle.id}
                onClick={() => {
                  onSelectPuzzle(puzzle);
                  onClose();
                }}
                className={`group relative rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                  isCurrent
                    ? isDark
                      ? 'bg-[#1E273B] border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-amber-50/90 border-amber-500 ring-1 ring-amber-500/40'
                    : isDark
                    ? 'bg-[#182030]/90 hover:bg-[#1E283C] border-[#28344B]'
                    : 'bg-white hover:bg-amber-50/40 border-[#E0D5C3] shadow-2xs'
                }`}
              >
                <div>
                  {/* Top Row: Badge + Stars */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDiffBadgeClasses(
                        puzzle.difficulty
                      )}`}
                    >
                      <Swords className="w-3 h-3 shrink-0" />
                      {puzzle.difficultyLabel} · {puzzle.maxMoves} nước
                    </span>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : isDark
                              ? 'text-slate-700'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight group-hover:text-amber-400 transition-colors">
                      {index + 1}. {puzzle.title}
                    </h3>
                    {isSolved && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div
                    className={`text-[11px] font-medium mb-1 ${
                      isDark ? 'text-amber-300/80' : 'text-amber-800'
                    }`}
                  >
                    {puzzle.subtitle}
                  </div>
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {puzzle.lore}
                  </p>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-500/20">
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    {puzzle.subtitle}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950'
                        : isSolved
                        ? isDark
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                          : 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-600 group-hover:bg-amber-500 text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {isCurrent ? 'Đang giải' : isSolved ? 'Giải lại' : 'Phá thế'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

PuzzleModal.displayName = 'PuzzleModal';
