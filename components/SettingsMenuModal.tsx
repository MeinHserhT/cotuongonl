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
  BookOpen
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

  const themeOptions: { id: BoardTheme; label: string; activeGradient: string }[] = [
    {
      id: 'imperial',
      label: 'Hoàng Cung',
      activeGradient: 'bg-gradient-to-r from-[#8f4e13] to-[#ad6a28] border-amber-400 text-amber-100 shadow-xs'
    },
    {
      id: 'zen',
      label: 'Thiền Trà',
      activeGradient: 'bg-gradient-to-r from-[#6e4922] to-[#8f6437] border-amber-400 text-amber-100 shadow-xs'
    },
    {
      id: 'marble',
      label: 'Cẩm Thạch',
      activeGradient: 'bg-gradient-to-r from-[#115e59] to-[#0f766e] border-teal-300 text-teal-50 shadow-xs'
    },
    {
      id: 'lacquer',
      label: 'Sơn Mài',
      activeGradient: 'bg-gradient-to-r from-[#3b120e] to-[#691e16] border-amber-400 text-amber-200 shadow-xs'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:justify-center pt-14 sm:pt-16 px-3 sm:px-4 pointer-events-none animate-in fade-in duration-150">
      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Khung menu gọn gàng, padding và text nhỏ, KHÔNG FULLSCREEN */}
      <div
        className={`pointer-events-auto relative w-full max-w-[320px] sm:max-w-[340px] rounded-2xl shadow-2xl border overflow-hidden flex flex-col text-neutral-100 transition-all ${
          isDark
            ? 'bg-[#161b26]/98 border-[#2e394f] shadow-black/80'
            : 'bg-[#faf6ee]/98 border-[#d2c5b0] text-neutral-900 shadow-stone-500/30'
        }`}
      >
        {/* Header nhỏ gọn */}
        <div
          className={`flex items-center justify-between px-3.5 py-2.5 border-b ${
            isDark ? 'bg-[#121622] border-[#263145]' : 'bg-[#f1eae0] border-[#d8cdbd]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <h2 className={`font-serif font-bold text-xs sm:text-sm tracking-wide ${
              isDark ? 'text-amber-300' : 'text-amber-900'
            }`}>
              Cài Đặt &amp; Menu
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#1d2433] hover:bg-[#283246] border-[#313e56] text-neutral-300'
                : 'bg-white hover:bg-neutral-100 border-[#d2c5b0] text-neutral-700'
            }`}
            aria-label="Đóng menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nội dung danh sách cài đặt */}
        <div className="p-2.5 sm:p-3 space-y-2 max-h-[80dvh] overflow-y-auto overscroll-contain">
          {/* 0. Chế độ Thể loại: Cờ Tướng (Sáng) / Cờ Úp */}
          <div
            className={`p-2 rounded-xl border space-y-1.5 ${
              isDark ? 'bg-[#1c2333]/90 border-[#2a364d]' : 'bg-white border-[#e0d6c4]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span>🎭</span>
                <span>Chế độ chơi Cờ</span>
              </span>
              <span className={`text-[10px] font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                {variant === 'jieqi' ? 'Cờ Úp (Jieqi)' : 'Cờ Ngửa'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (variant !== 'standard') onToggleVariant?.();
                }}
                className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 font-bold text-[11px] transition-all cursor-pointer ${
                  variant === 'standard'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-400 text-white shadow-xs'
                    : isDark
                    ? 'bg-[#141924] border-[#29354b] text-neutral-400 hover:bg-[#1f283a]'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <span>⚔️ Cờ Ngửa</span>
                {variant === 'standard' && <Check className="w-3 h-3 text-white ml-auto" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (variant !== 'jieqi') onToggleVariant?.();
                }}
                className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 font-bold text-[11px] transition-all cursor-pointer ${
                  variant === 'jieqi'
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 border-rose-400 text-white shadow-xs animate-pulse'
                    : isDark
                    ? 'bg-[#141924] border-[#29354b] text-neutral-400 hover:bg-[#1f283a]'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <span>🎭 Cờ Úp</span>
                {variant === 'jieqi' && <Check className="w-3 h-3 text-white ml-auto" />}
              </button>
            </div>
          </div>

          {/* 1. Âm thanh */}
          <div
            className={`px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 ${
              isDark ? 'bg-[#1c2333]/90 border-[#2a364d]' : 'bg-white border-[#e0d6c4]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-neutral-400 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">Âm thanh</div>
              </div>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <AggressiveToggle
                checked={!isMuted}
                onChange={onToggleMute}
                isDark={isDark}
                ariaLabel="Bật tắt âm thanh"
                size="sm"
              />
            </div>
          </div>

          {/* 2. Hiệu ứng quân cờ (Xe - Pháo - Mã) */}
          <div
            className={`px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 ${
              isDark ? 'bg-[#1c2333]/90 border-[#2a364d]' : 'bg-white border-[#e0d6c4]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">Hiệu ứng ăn cờ</div>
              </div>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <AggressiveToggle
                checked={enablePieceAnimations}
                onChange={onTogglePieceAnimations}
                isDark={isDark}
                ariaLabel="Bật tắt hiệu ứng ăn cờ"
                size="sm"
              />
            </div>
          </div>

          {/* 2b. Trải nghiệm Di động: Rung phản hồi & Giữ sáng màn hình */}
          {onToggleHaptics && (
            <div
              className={`px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 ${
                isDark ? 'bg-[#1c2333]/90 border-[#2a364d]' : 'bg-white border-[#e0d6c4]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">Rung phản hồi (Haptics)</div>
                </div>
              </div>

              <div className="flex items-center justify-center shrink-0">
                <AggressiveToggle
                  checked={enableHaptics}
                  onChange={onToggleHaptics}
                  isDark={isDark}
                  ariaLabel="Bật tắt rung phản hồi"
                  size="sm"
                />
              </div>
            </div>
          )}

          {onToggleWakeLock && (
            <div
              className={`px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 ${
                isDark ? 'bg-[#1c2333]/90 border-[#2a364d]' : 'bg-white border-[#e0d6c4]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">Giữ sáng màn hình</div>
                </div>
              </div>

              <div className="flex items-center justify-center shrink-0">
                <AggressiveToggle
                  checked={enableWakeLock}
                  onChange={onToggleWakeLock}
                  isDark={isDark}
                  ariaLabel="Bật tắt giữ sáng màn hình"
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* 3. Giao diện Tối / Sáng */}
          <div
            className={`px-2.5 py-2 rounded-xl border flex items-center justify-between gap-3 ${
              isDark ? 'bg-[#1c2333]/90 border-[#2a364d]' : 'bg-white border-[#e0d6c4]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                  isDark
                    ? 'bg-slate-800/80 border-sky-500/40 text-sky-300'
                    : 'bg-amber-100/90 border-amber-300 text-amber-700'
                }`}
              >
                {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">Giao diện</div>
              </div>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <DayNightSwitch
                isDark={isDark}
                onToggle={onToggleColorMode}
                size="sm"
              />
            </div>
          </div>

          {/* 4. Chất liệu Bàn Cờ (4 chủ đề: Hoàng Cung, Thiền Trà, Cẩm Thạch, Sơn Mài) */}
          <div
            className={`p-2 rounded-xl border space-y-1.5 ${
              isDark ? 'bg-[#1c2333]/90 border-[#2a364d]' : 'bg-white border-[#e0d6c4]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Mặt bàn cờ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectBoardTheme(opt.id)}
                  className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 font-bold text-[11px] transition-all cursor-pointer ${
                    boardTheme === opt.id
                      ? opt.activeGradient
                      : isDark
                      ? 'bg-[#141924] border-[#29354b] text-neutral-400 hover:bg-[#1f283a]'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  {boardTheme === opt.id && <Check className="w-3 h-3 text-white ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Phím tắt mở nhanh tính năng (Khai Cuộc, Luật Cờ) */}
          <div className="pt-1 space-y-1.5">
            {onOpenOpeningBook && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOpeningBook();
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#1b2333] hover:bg-[#253046] border-[#2e3b52] text-amber-300'
                    : 'bg-white hover:bg-neutral-50 border-[#dfd5c4] text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cẩm Nang Khai Cuộc</span>
                </div>
                <span className="text-[10px] text-neutral-400">→</span>
              </button>
            )}

            {onOpenRules && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRules();
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#1b2333] hover:bg-[#253046] border-[#2e3b52] text-amber-300'
                    : 'bg-white hover:bg-neutral-50 border-[#dfd5c4] text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hướng Dẫn Luật Cờ</span>
                </div>
                <span className="text-[10px] text-neutral-400">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsMenuModal.displayName = 'SettingsMenuModal';
