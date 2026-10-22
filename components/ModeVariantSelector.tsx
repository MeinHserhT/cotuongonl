'use client';

import React from 'react';
import {
  Globe,
  Users,
  Bot,
  Swords,
  Layers,
  Trophy,
  User
} from 'lucide-react';
import { BotDifficulty, getRankTier } from '@/lib/xiangqi-types';

export interface VariantEloStats {
  elo: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface ModeVariantSelectorProps {
  variant: 'standard' | 'jieqi';
  onChangeVariant?: (variant: 'standard' | 'jieqi') => void;
  gameMode: 'pve-red' | 'pve-black' | 'pvp' | 'online' | null;
  onSelectOnline: () => void;
  onSelectPvP: () => void;
  onSelectPvE: (side: 'pve-red' | 'pve-black') => void;
  difficulty: BotDifficulty;
  onChangeDifficulty: (diff: BotDifficulty) => void;
  eloStandard?: number;
  eloJieqi?: number;
  statsStandard?: VariantEloStats;
  statsJieqi?: VariantEloStats;
  onOpenProfile?: () => void;
  onOpenLeaderboard?: () => void;
  hideModeButtons?: boolean;
  colorMode?: 'dark' | 'light';
}

export const ModeVariantSelector: React.FC<ModeVariantSelectorProps> = React.memo(({
  variant = 'standard',
  onChangeVariant,
  gameMode,
  onSelectOnline,
  onSelectPvP,
  onSelectPvE,
  difficulty,
  onChangeDifficulty,
  eloStandard = 1200,
  eloJieqi = 1200,
  statsStandard,
  statsJieqi,
  onOpenProfile,
  onOpenLeaderboard,
  hideModeButtons = false,
  colorMode = 'dark'
}) => {
  const isDark = colorMode !== 'light';
  const eloStd = eloStandard || 1200;
  const eloJq = eloJieqi || 1200;
  const tierStd = getRankTier(eloStd, isDark);
  const tierJq = getRankTier(eloJq, isDark);

  const statsStd = statsStandard || {
    elo: eloStd,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0
  };

  const statsJq = statsJieqi || {
    elo: eloJq,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. CHẾ ĐỘ ĐẤU ĐỐI KHÁNG & ĐỘ KHÓ AI */}
      {!hideModeButtons && (
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold tracking-tight ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Chế độ thi đấu
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Nút 1: Đấu Trực Tuyến */}
            <button
              type="button"
              onClick={onSelectOnline}
              className={`py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                gameMode === 'online'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : isDark
                  ? 'border-[#232D3F] bg-[#0E131B] text-slate-200 hover:bg-[#1C2536] hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="truncate">Đấu Trực Tuyến</span>
            </button>

            {/* Nút 2: Đấu 2 người (local) */}
            <button
              type="button"
              onClick={onSelectPvP}
              className={`py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                gameMode === 'pvp'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : isDark
                  ? 'border-[#232D3F] bg-[#0E131B] text-slate-200 hover:bg-[#1C2536] hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Đấu 2 Người</span>
            </button>

            {/* Nút 3: Đấu Với Máy */}
            <button
              type="button"
              onClick={() => {
                const randomSide = Math.random() < 0.5 ? 'pve-red' : 'pve-black';
                onSelectPvE(randomSide);
              }}
              className={`col-span-2 py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                gameMode?.startsWith('pve')
                  ? 'bg-amber-600 text-white border-amber-500'
                  : isDark
                  ? 'border-[#232D3F] bg-[#0E131B] text-slate-200 hover:bg-[#1C2536] hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Bot className="w-4 h-4 shrink-0" />
                <span className="truncate">Đấu Với Máy (AI)</span>
              </div>
              <span
                className={`text-xs font-normal shrink-0 ${
                  gameMode?.startsWith('pve')
                    ? 'text-amber-100'
                    : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {gameMode === 'pve-red'
                  ? 'Cầm Đỏ · Đi trước'
                  : gameMode === 'pve-black'
                  ? 'Cầm Đen · Đi sau'
                  : 'Ngẫu nhiên Đỏ / Đen'}
              </span>
            </button>
          </div>

          {/* Độ khó máy AI - Chỉ hiển thị khi chọn chế độ đấu với máy */}
          {gameMode?.startsWith('pve') && (
            <div className="pt-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Cấp độ AI
                </span>
              </div>

              <div
                className={`grid grid-cols-4 gap-1 p-1 rounded-lg border ${
                  isDark ? 'bg-[#0E131B] border-[#232D3F]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                {[
                  { id: 'easy' as const, label: 'Nhập môn', desc: 'Dành cho người mới tập chơi (Dễ)' },
                  { id: 'medium' as const, label: 'Cơ bản', desc: 'Phong trào cơ bản (Vừa)' },
                  { id: 'hard' as const, label: 'Cao thủ', desc: 'Trình độ cao thủ (Khó)' },
                  { id: 'master' as const, label: 'Kiện Tướng', desc: 'Cực hạn Kiện Tướng (Cao)' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onChangeDifficulty(d.id)}
                    className={`py-1.5 px-2 rounded-md text-center transition-colors cursor-pointer whitespace-nowrap shrink-0 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      difficulty === d.id
                        ? isDark
                          ? 'bg-amber-500 text-slate-950 font-semibold shadow-2xs'
                          : 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={d.desc}
                  >
                    <span className="truncate block">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. THỂ LOẠI CỜ & HỆ SỐ ELO (FLAT HAIRLINE SECTION - NO NESTED CARDS) */}
      <div
        className={`pt-2.5 border-t flex flex-col gap-2 shrink-0 ${
          isDark ? 'border-[#232D3F]' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-semibold tracking-tight ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Thể loại cờ &amp; Hệ số Elo
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'border-[#232D3F] bg-[#0E131B] text-slate-300 hover:bg-[#1C2536] hover:text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Hồ sơ</span>
              </button>
            )}
            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'border-[#232D3F] bg-[#0E131B] text-amber-400 hover:bg-[#1C2536]'
                    : 'border-slate-200 bg-slate-50 text-amber-700 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>Bảng xếp hạng</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean 2-column segmented variant selector */}
        <div className="grid grid-cols-2 gap-2">
          {/* CỜ NGỬA */}
          <button
            type="button"
            onClick={() => onChangeVariant?.('standard')}
            className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              variant === 'standard'
                ? isDark
                  ? 'border-amber-500/80 bg-[#1C2536] text-slate-100'
                  : 'border-amber-600 bg-amber-50/60 text-slate-900'
                : isDark
                ? 'border-[#232D3F] bg-[#0E131B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                <Swords
                  className={`w-3.5 h-3.5 shrink-0 ${
                    variant === 'standard'
                      ? isDark
                        ? 'text-amber-400'
                        : 'text-amber-700'
                      : 'text-slate-400'
                  }`}
                />
                <span>Cờ Ngửa</span>
              </span>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  variant === 'standard'
                    ? isDark
                      ? 'text-amber-400'
                      : 'text-amber-700 font-semibold'
                    : isDark
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {variant === 'standard' ? 'Đang chọn' : 'Chọn'}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-1 pt-0.5 font-mono tabular-nums">
              <span
                className={`text-base font-bold leading-none ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {eloStd} <span className="text-[11px] font-sans font-normal opacity-75">Elo</span>
              </span>
              <span className={`text-[11px] font-sans font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {tierStd.tier}
              </span>
            </div>

            <div
              className={`text-[11px] font-mono tabular-nums truncate ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>{statsStd.games} ván</span>
              <span aria-hidden="true"> · </span>
              <span>
                {statsStd.wins}T-{statsStd.draws}H-{statsStd.losses}B
              </span>
              <span aria-hidden="true"> · </span>
              <span>{statsStd.winRate}%</span>
            </div>
          </button>

          {/* CỜ ÚP */}
          <button
            type="button"
            onClick={() => onChangeVariant?.('jieqi')}
            className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              variant === 'jieqi'
                ? isDark
                  ? 'border-red-500/80 bg-[#1C2536] text-slate-100'
                  : 'border-red-600 bg-red-50/60 text-slate-900'
                : isDark
                ? 'border-[#232D3F] bg-[#0E131B] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                <Layers
                  className={`w-3.5 h-3.5 shrink-0 ${
                    variant === 'jieqi'
                      ? isDark
                        ? 'text-red-400'
                        : 'text-red-700'
                      : 'text-slate-400'
                  }`}
                />
                <span>Cờ Úp</span>
              </span>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  variant === 'jieqi'
                    ? isDark
                      ? 'text-red-400'
                      : 'text-red-700 font-semibold'
                    : isDark
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {variant === 'jieqi' ? 'Đang chọn' : 'Chọn'}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-1 pt-0.5 font-mono tabular-nums">
              <span
                className={`text-base font-bold leading-none ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {eloJq} <span className="text-[11px] font-sans font-normal opacity-75">Elo</span>
              </span>
              <span className={`text-[11px] font-sans font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {tierJq.tier}
              </span>
            </div>

            <div
              className={`text-[11px] font-mono tabular-nums truncate ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>{statsJq.games} ván</span>
              <span aria-hidden="true"> · </span>
              <span>
                {statsJq.wins}T-{statsJq.draws}H-{statsJq.losses}B
              </span>
              <span aria-hidden="true"> · </span>
              <span>{statsJq.winRate}%</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
});

ModeVariantSelector.displayName = 'ModeVariantSelector';
