'use client';

import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Moon,
  Palette,
  HelpCircle,
  Sliders,
  Check,
  Smartphone,
  BookOpen,
  Swords,
  Layers,
  ChevronRight
} from 'lucide-react';
import { BoardTheme } from '@/lib/xiangqi-types';
import { AggressiveToggle } from '@/components/ui/AggressiveToggle';
import { DayNightSwitch } from '@/components/ui/DayNightSwitch';

interface SettingsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'standard' | 'jieqi';
  onToggleVariant?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  enablePieceAnimations: boolean;
  onTogglePieceAnimations: () => void;
  enableHaptics?: boolean;
  onToggleHaptics?: () => void;
  enableWakeLock?: boolean;
  onToggleWakeLock?: () => void;
  colorMode: 'dark' | 'light';
  onToggleColorMode: () => void;
  boardTheme: BoardTheme;
  onSelectBoardTheme: (theme: BoardTheme) => void;
  onOpenRules?: () => void;
  onOpenOpeningBook?: () => void;
}

export const SettingsMenuModal: React.FC<SettingsMenuModalProps> = React.memo(({
  isOpen,
  onClose,
  variant = 'standard',
  onToggleVariant,
  isMuted,
  onToggleMute,
  enablePieceAnimations,
  onTogglePieceAnimations,
  enableHaptics = true,
  onToggleHaptics,
  enableWakeLock = true,
  onToggleWakeLock,
  colorMode,
  onToggleColorMode,
  boardTheme,
  onSelectBoardTheme,
  onOpenRules,
  onOpenOpeningBook
}) => {
  if (!isOpen) return null;

  const isDark = colorMode === 'dark';

  const themeOptions: { id: BoardTheme; label: string; swatchClass: string }[] = [
    {
      id: 'imperial',
      label: 'Hoàng Cung',
      swatchClass: 'bg-[#B57632] border-[#6E3B1E]'
    },
    {
      id: 'zen',
      label: 'Thiền Trà',
      swatchClass: 'bg-[#8C7558] border-[#4A3828]'
    },
    {
      id: 'marble',
      label: 'Cẩm Thạch',
      swatchClass: 'bg-[#0F766E] border-[#115E59]'
    },
    {
      id: 'lacquer',
      label: 'Sơn Mài',
      swatchClass: 'bg-[#450A0A] border-[#B45309]'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:justify-center pt-14 sm:pt-16 px-3 sm:px-4 pointer-events-none animate-in fade-in duration-150">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      <div
        className={`pointer-events-auto relative w-full max-w-[330px] sm:max-w-[350px] rounded-xl shadow-2xl border overflow-hidden flex flex-col transition-colors duration-150 ${
          isDark
            ? 'bg-[#1F1812] border-[#36291E] text-[#EFE6D5]'
            : 'bg-[#FFFFFF] border-[#D5DFDB] text-[#132226]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'bg-[#120E0A] border-[#36291E]' : 'bg-[#EEF2F0] border-[#D5DFDB]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className={`w-4 h-4 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
            <h2 className="font-heading font-semibold text-sm tracking-tight">
              Cài Đặt Trận Đấu
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#1F1812] hover:bg-[#2A2018] border-[#36291E] text-[#B8A996] hover:text-[#EFE6D5]'
                : 'bg-[#FFFFFF] hover:bg-[#E6ECEA] border-[#D5DFDB] text-[#4A6368] hover:text-[#132226]'
            }`}
            aria-label="Đóng menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hairline-divided sections (no nested cards-within-cards) */}
        <div
          className={`px-4 py-2 divide-y max-h-[80dvh] overflow-y-auto overscroll-contain ${
            isDark ? 'divide-[#36291E]' : 'divide-[#D5DFDB]'
          }`}
        >
          {/* 1. Thể loại cờ */}
          <div className="py-2.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`}>
                Thể loại cờ
              </span>
              <span className="font-semibold">
                {variant === 'jieqi' ? 'Cờ Úp' : 'Cờ Ngửa'}
              </span>
            </div>

            <div
              className={`grid grid-cols-2 gap-1 p-1 rounded-lg border ${
                isDark ? 'bg-[#120E0A] border-[#36291E]' : 'bg-[#EEF2F0] border-[#D5DFDB]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (variant !== 'standard') onToggleVariant?.();
                }}
                className={`py-1.5 px-2.5 rounded-md flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  variant === 'standard'
                    ? isDark
                      ? 'bg-[#2A2018] text-[#D97706] shadow-2xs'
                      : 'bg-[#FFFFFF] text-[#0F766E] shadow-2xs'
                    : isDark
                    ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                    : 'text-[#4A6368] hover:text-[#132226]'
                }`}
              >
                <Swords className="w-3.5 h-3.5 shrink-0" />
                <span>Cờ Ngửa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (variant !== 'jieqi') onToggleVariant?.();
                }}
                className={`py-1.5 px-2.5 rounded-md flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  variant === 'jieqi'
                    ? isDark
                      ? 'bg-[#2A2018] text-[#D97706] shadow-2xs'
                      : 'bg-[#FFFFFF] text-[#0F766E] shadow-2xs'
                    : isDark
                    ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                    : 'text-[#4A6368] hover:text-[#132226]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Cờ Úp</span>
              </button>
            </div>
          </div>

          {/* 2. Tùy chọn trải nghiệm (Clean flat rows) */}
          <div className="py-2 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isMuted ? (
                  <VolumeX className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#9C8A74]' : 'text-[#4A6368]'}`} />
                ) : (
                  <Volume2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                )}
                <span className="text-xs font-medium">Âm thanh</span>
              </div>
              <AggressiveToggle
                checked={!isMuted}
                onChange={onToggleMute}
                isDark={isDark}
                ariaLabel="Bật tắt âm thanh"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                <span className="text-xs font-medium">Hiệu ứng ăn cờ</span>
              </div>
              <AggressiveToggle
                checked={enablePieceAnimations}
                onChange={onTogglePieceAnimations}
                isDark={isDark}
                ariaLabel="Bật tắt hiệu ứng ăn cờ"
                size="sm"
              />
            </div>

            {onToggleHaptics && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                  <span className="text-xs font-medium">Rung phản hồi</span>
                </div>
                <AggressiveToggle
                  checked={enableHaptics}
                  onChange={onToggleHaptics}
                  isDark={isDark}
                  ariaLabel="Bật tắt rung phản hồi"
                  size="sm"
                />
              </div>
            )}

            {onToggleWakeLock && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Sun className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                  <span className="text-xs font-medium">Giữ sáng màn hình</span>
                </div>
                <AggressiveToggle
                  checked={enableWakeLock}
                  onChange={onToggleWakeLock}
                  isDark={isDark}
                  ariaLabel="Bật tắt giữ sáng màn hình"
                  size="sm"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isDark ? (
                  <Moon className="w-4 h-4 shrink-0 text-[#D97706]" />
                ) : (
                  <Sun className="w-4 h-4 shrink-0 text-[#0F766E]" />
                )}
                <span className="text-xs font-medium">Giao diện Sáng / Tối</span>
              </div>
              <DayNightSwitch
                isDark={isDark}
                onToggle={onToggleColorMode}
                size="sm"
              />
            </div>
          </div>

          {/* 3. Chất liệu Bàn Cờ */}
          <div className="py-2.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Palette className={`w-3.5 h-3.5 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
              <span className={`font-medium ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`}>
                Mặt bàn cờ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {themeOptions.map((opt) => {
                const isSelected = boardTheme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectBoardTheme(opt.id)}
                    className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between gap-1.5 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? isDark
                          ? 'bg-[#2A2018] border-[#D97706] text-[#EFE6D5] font-semibold'
                          : 'bg-[#0F766E]/10 border-[#0F766E] text-[#0F766E] font-semibold'
                        : isDark
                        ? 'bg-[#120E0A] border-[#36291E] text-[#B8A996] hover:text-[#EFE6D5] hover:bg-[#2A2018]'
                        : 'bg-[#EEF2F0] border-[#D5DFDB] text-[#4A6368] hover:text-[#132226] hover:bg-[#E6ECEA]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className={`w-2.5 h-2.5 rounded-full border shrink-0 ${opt.swatchClass}`} />
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Tài liệu & Hướng dẫn */}
          {(onOpenOpeningBook || onOpenRules) && (
            <div className="py-2 space-y-1">
              {onOpenOpeningBook && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOpeningBook();
                  }}
                  className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                    isDark
                      ? 'hover:bg-[#2A2018] text-[#EFE6D5]'
                      : 'hover:bg-[#EEF2F0] text-[#132226]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                    <span>Cẩm Nang Khai Cuộc</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`} />
                </button>
              )}

              {onOpenRules && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRules();
                  }}
                  className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                    isDark
                      ? 'hover:bg-[#2A2018] text-[#EFE6D5]'
                      : 'hover:bg-[#EEF2F0] text-[#132226]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className={`w-3.5 h-3.5 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                    <span>Hướng Dẫn Luật Cờ</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SettingsMenuModal.displayName = 'SettingsMenuModal';
