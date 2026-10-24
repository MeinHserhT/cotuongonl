'use client';

import React from 'react';
import {
  Menu,
  UserCircle2,
  Share2,
  Check,
  User as UserIcon,
  Swords
} from 'lucide-react';
import { getRankTier } from '@/lib/xiangqi-types';
import { User } from 'firebase/auth';
import { DayNightSwitch } from '@/components/ui/DayNightSwitch';
import { BrandLogo } from '@/components/BrandLogo';

interface GameHeaderProps {
  colorMode?: 'dark' | 'light';
  onToggleColorMode?: () => void;
  onShareRoom: () => void;
  copiedShareLink: boolean;
  onOpenAuthModal: () => void;
  onOpenProfileDrawer: () => void;
  onOpenOnlineLobby: () => void;
  onOpenMenu: () => void;
  user: User | null;
  userElo?: number;
  userName?: string;
  isOnlineGame?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = React.memo(({
  colorMode = 'dark',
  onToggleColorMode,
  onShareRoom,
  copiedShareLink,
  onOpenAuthModal,
  onOpenProfileDrawer,
  onOpenOnlineLobby,
  onOpenMenu,
  user,
  userElo = 1200,
  userName,
  isOnlineGame
}) => {
  const isDark = colorMode === 'dark';
  const rankTier = getRankTier(userElo, isDark);

  return (
    <header
      className={`w-full max-w-5xl mx-auto mb-2.5 sm:mb-3 flex items-center justify-between gap-1.5 sm:gap-4 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl border transition-colors ${
        isDark
          ? 'bg-[#1F1812] border-[#36291E] text-[#EFE6D5]'
          : 'bg-[#FFFFFF] border-[#D5DFDB] text-[#132226] shadow-2xs'
      }`}
    >
      {/* Zone 1: Single-line Brand Wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0 min-w-0">
        <BrandLogo className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
        <span className="font-heading font-bold text-xs sm:text-base tracking-tight whitespace-nowrap truncate">
          Cờ Tướng<span className="hidden min-[420px]:inline"> Master</span>
        </span>
      </div>

      {/* Zone 2: Clean Single-Line Navigation & Workspace Utilities */}
      <nav className="flex items-center gap-1 sm:gap-2.5 text-xs sm:text-sm font-medium shrink-0">
        <button
          type="button"
          onClick={onOpenOnlineLobby}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 min-h-[36px] rounded-lg border font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
            isDark
              ? 'bg-[#120E0A] hover:bg-[#2A2018] border-[#36291E] text-[#EFE6D5]'
              : 'bg-[#EEF2F0] hover:bg-[#E6ECEA] border-[#D5DFDB] text-[#132226]'
          }`}
          title="Phòng Đấu Trực Tuyến & Ghép Cặp"
        >
          <Swords className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
          <span>Phòng Đấu</span>
        </button>

        <div className="hidden min-[370px]:flex items-center justify-center shrink-0">
          <DayNightSwitch
            isDark={isDark}
            onToggle={onToggleColorMode || (() => {})}
            size="sm"
          />
        </div>

        {isOnlineGame && (
          <button
            type="button"
            onClick={onShareRoom}
            className={`p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0 touch-manipulation ${
              isDark
                ? 'bg-[#120E0A] hover:bg-[#2A2018] border-[#36291E] text-[#EFE6D5]'
                : 'bg-[#EEF2F0] hover:bg-[#E6ECEA] border-[#D5DFDB] text-[#132226]'
            }`}
            title="Sao chép link mời phòng"
          >
            {copiedShareLink ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Share2 className={`w-4 h-4 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
            )}
          </button>
        )}
      </nav>

      {/* Zone 3: Primary User Action & Settings Trigger */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {user ? (
          <button
            type="button"
            onClick={onOpenProfileDrawer}
            className={`flex items-center gap-2 px-2 sm:px-2.5 py-1.5 min-h-[36px] rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
              isDark
                ? 'bg-[#120E0A] hover:bg-[#2A2018] border-[#36291E] text-[#EFE6D5]'
                : 'bg-[#EEF2F0] hover:bg-[#E6ECEA] border-[#D5DFDB] text-[#132226]'
            }`}
            title="Xem hồ sơ & Lịch sử ván đấu"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-semibold text-xs border shrink-0 ${
                isDark
                  ? 'bg-[#D97706]/20 text-[#D97706] border-[#D97706]/40'
                  : 'bg-[#0F766E]/15 text-[#0F766E] border-[#0F766E]/40'
              }`}
            >
              {userName?.charAt(0).toUpperCase() || <UserIcon className="w-3 h-3" />}
            </div>
            <span className="hidden md:inline text-xs font-semibold truncate max-w-[110px]">
              {userName || 'Kỳ Thủ'}
            </span>
            <span
              className={`hidden lg:inline text-xs font-mono tabular-nums ${
                isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'
              }`}
            >
              · {userElo} · {rankTier.tier}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-lg text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
              isDark
                ? 'bg-[#D97706] hover:bg-amber-500'
                : 'bg-[#0F766E] hover:bg-teal-600'
            }`}
            title="Đăng nhập để lưu điểm Elo và bảng xếp hạng"
          >
            <UserCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Đăng nhập</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenMenu}
          className={`p-1.5 min-h-[36px] min-w-[36px] rounded-lg border transition-colors cursor-pointer flex items-center justify-center shrink-0 touch-manipulation ${
            isDark
              ? 'bg-[#120E0A] hover:bg-[#2A2018] border-[#36291E] text-[#EFE6D5]'
              : 'bg-[#EEF2F0] hover:bg-[#E6ECEA] border-[#D5DFDB] text-[#132226]'
          }`}
          title="Menu cài đặt"
          aria-label="Menu cài đặt"
        >
          <Menu className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </header>
  );
});

GameHeader.displayName = 'GameHeader';
