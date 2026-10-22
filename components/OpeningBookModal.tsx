'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookOpen,
  Sparkles,
  Shield,
  Swords,
  ChevronRight,
  Flame,
  Info,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { OPENING_CATALOG, OpeningInfo } from '@/lib/xiangqi-openings';

interface OpeningBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOpening?: OpeningInfo | null;
  onSelectOpeningForNewGame?: (openingId: string) => void;
}

export function OpeningBookModal({
  isOpen,
  onClose,
  selectedOpening: initialOpening,
  onSelectOpeningForNewGame
}: OpeningBookModalProps) {
  const openingsList = Object.values(OPENING_CATALOG);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'attack' | 'defense' | 'tactical'>('all');

  const selected: OpeningInfo =
    (selectedId ? OPENING_CATALOG[selectedId] : null) || initialOpening || openingsList[0];

  if (!isOpen) return null;

  const filteredOpenings = openingsList.filter(op => {
    if (categoryFilter === 'attack') {
      return ['trung-phao', 'thuan-phao', 'nghich-phao', 'thiet-hoat-xa'].includes(op.id);
    }
    if (categoryFilter === 'defense') {
      return ['binh-phong-ma', 'phan-cung-ma', 'don-de-ma', 'phi-tuong-cuoc'].includes(op.id);
    }
    if (categoryFilter === 'tactical') {
      return ['tien-nhan-chi-lo', 'khoi-ma-cuoc', 'qua-cung-phao', 'si-giac-phao'].includes(op.id);
    }
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[82vh] flex flex-col bg-[#141a26] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-[#1c2436] via-[#20293d] to-[#1c2436] border-b border-[#2d374f]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 shadow-md">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-1.5">
                  <span>Cẩm Nang Khai Cuộc</span>
                  <span className="text-[9px] font-normal px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    Bách Khoa
                  </span>
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-[#171f2e] border-b border-[#263147] overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                  : 'bg-[#212b3e] text-neutral-300 hover:bg-[#2b374e]'
              }`}
            >
              Tất cả thế cờ ({openingsList.length})
            </button>
            <button
              onClick={() => setCategoryFilter('attack')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                categoryFilter === 'attack'
                  ? 'bg-red-500 text-white font-bold shadow-xs'
                  : 'bg-[#212b3e] text-neutral-300 hover:bg-[#2b374e]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Tấn công (Pháo Đầu, Nghịch Pháo...)
            </button>
            <button
              onClick={() => setCategoryFilter('defense')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                categoryFilter === 'defense'
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'bg-[#212b3e] text-neutral-300 hover:bg-[#2b374e]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Phòng thủ (Bình Phong, Phản Cung...)
            </button>
            <button
              onClick={() => setCategoryFilter('tactical')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                categoryFilter === 'tactical'
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-xs'
                  : 'bg-[#212b3e] text-neutral-300 hover:bg-[#2b374e]'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Chiến thuật (Tiên Nhân, Phi Tượng...)
            </button>
          </div>

          {/* Body: Left list, Right Detail */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Left Column: List of Openings */}
            <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-[#263147] overflow-y-auto max-h-56 md:max-h-none shrink-0 p-2 sm:p-3 space-y-1.5 bg-[#121722]/50">
              {filteredOpenings.map(op => {
                const isSelected = selected.id === op.id;
                return (
                  <button
                    key={op.id}
                    onClick={() => setSelectedId(op.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/10 border border-amber-500/60 shadow-md text-amber-200'
                        : 'bg-[#182030] hover:bg-[#212b3e] border border-transparent text-neutral-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate">
                          {op.nameVn}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {op.nameCn}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {op.tagline}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-amber-400 translate-x-0.5' : 'text-neutral-500 group-hover:text-neutral-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Selected Opening Details */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#141a26]">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#1c2436] to-[#161d2c] border border-amber-500/30 relative overflow-hidden">
                <div className="absolute top-1 right-2 text-2xl font-serif text-amber-500/10 pointer-events-none select-none">
                  {selected.nameCn}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-amber-300">
                        {selected.nameVn}
                      </h3>
                      <span className="text-xs font-semibold text-amber-400/80 font-serif">
                        ({selected.nameCn})
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 font-medium mt-0.5">
                      {selected.tagline}
                    </p>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold shrink-0">
                    Độ khó: {selected.difficultyToMaster}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Tổng quan & Bối cảnh chiến thuật
                </h4>
                <p className="text-xs leading-relaxed text-neutral-300 bg-[#182030] p-3 rounded-lg border border-[#273248]">
                  {selected.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Nguyên tắc & Đòn đánh trọng tâm
                </h4>
                <div className="bg-[#182030] p-3 rounded-lg border border-[#273248] space-y-2">
                  {selected.principles.map((pr, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  Đối sách & Cách khắc chế
                </h4>
                <p className="text-xs leading-relaxed text-neutral-300 bg-[#182030] p-3 rounded-lg border border-[#273248]">
                  {selected.counters}
                </p>
              </div>

              {onSelectOpeningForNewGame && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onSelectOpeningForNewGame(selected.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 text-neutral-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Luyện tập thế cờ này với AI</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
