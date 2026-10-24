'use client';

import React, { useState } from 'react';
import {
  FileText,
  SlidersHorizontal,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Flag,
  Handshake,
  Swords,
  PlusCircle,
  LogOut,
  Copy,
  Check,
  Compass,
  Layers
} from 'lucide-react';
import { BotDifficulty, BoardTheme, MoveRecord, getRankTier } from '@/lib/xiangqi-types';
import { ChatMessage } from '@/lib/multiplayer-types';
import { ModeVariantSelector, VariantEloStats } from './ModeVariantSelector';

export type { VariantEloStats };

export interface UnifiedGameConsoleProps {
  // Variant
  variant?: 'standard' | 'jieqi';
  onChangeVariant?: (variant: 'standard' | 'jieqi') => void;

  // Dual Elo & Statistics
  eloStandard?: number;
  eloJieqi?: number;
  statsStandard?: VariantEloStats;
  statsJieqi?: VariantEloStats;
  onOpenProfile?: () => void;
  onOpenLeaderboard?: () => void;

  // Game Mode & Actions
  gameMode: 'pve-red' | 'pve-black' | 'pvp' | 'online' | null;
  onChangeGameMode: (mode: 'pve-red' | 'pve-black' | 'pvp' | 'online') => void;
  difficulty: BotDifficulty;
  onChangeDifficulty: (diff: BotDifficulty) => void;
  timeLimit: number;
  onChangeTimeLimit: (limit: number) => void;
  autoFlip: boolean;
  onToggleAutoFlip: (checked: boolean) => void;
  onUndo: () => void;
  canUndo: boolean;
  onResign: () => void;
  canResign: boolean;
  onNewGame: () => void;

  // Online specifics
  isOnlineGame: boolean;
  isGameOver: boolean;
  drawOfferedByOpponent?: boolean;
  onOfferDraw?: () => void;
  onAcceptDraw?: () => void;
  onLeaveRoom?: () => void;
  onRequestRematch?: () => void;
  rematchRequestedByOpponent?: boolean;
  myRematchRequested?: boolean;
  onCreateOnlineRoom?: () => void;

  // Moves & ScoreSheet
  moveHistory: MoveRecord[];
  inspectMoveIndex: number | null;
  onSelectMove: (index: number) => void;
  onExitInspect: () => void;
  theme?: BoardTheme;
  fenString: string;
  onCopyFen: () => void;
  copiedFen: boolean;

  // In-Game Chat (online mode)
  chatMessages?: ChatMessage[];
  onSendMessage?: (text: string, isQuick?: boolean) => void;
  spectatorCount?: number;
  isSpectator?: boolean;

  // UI & Theme
  colorMode?: 'dark' | 'light';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isHiddenBeforeDock?: boolean;
}

export function UnifiedGameConsole({
  variant = 'standard',
  onChangeVariant,
  eloStandard = 1200,
  eloJieqi = 1200,
  statsStandard,
  statsJieqi,
  onOpenProfile,
  onOpenLeaderboard,
  gameMode,
  onChangeGameMode,
  difficulty,
  onChangeDifficulty,
  timeLimit,
  onChangeTimeLimit,
  autoFlip,
  onToggleAutoFlip,
  onUndo,
  canUndo,
  onResign,
  canResign,
  onNewGame,
  isOnlineGame,
  isGameOver,
  drawOfferedByOpponent,
  onOfferDraw,
  onAcceptDraw,
  onLeaveRoom,
  onRequestRematch,
  rematchRequestedByOpponent = false,
  myRematchRequested = false,
  onCreateOnlineRoom,
  moveHistory,
  inspectMoveIndex,
  onSelectMove,
  onExitInspect,
  onCopyFen,
  copiedFen,
  chatMessages = [],
  onSendMessage,
  spectatorCount = 0,
  colorMode = 'dark',
  isCollapsed = false,
  onToggleCollapse,
  isHiddenBeforeDock = false
}: UnifiedGameConsoleProps) {
  const isDark = colorMode !== 'light';
  const [activeTab, setActiveTab] = useState<'moves' | 'controls' | 'chat'>('controls');
  const [notationMode, setNotationMode] = useState<'full' | 'short'>('full');
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Paired moves for notation table
  const pairedMoves: { index: number; red?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairedMoves.push({
      index: Math.floor(i / 2) + 1,
      red: moveHistory[i],
      black: moveHistory[i + 1]
    });
  }

  const currentIndex = inspectMoveIndex !== null ? inspectMoveIndex : moveHistory.length - 1;

  const eloStd = eloStandard || 1200;
  const eloJq = eloJieqi || 1200;
  const tierStd = getRankTier(eloStd, isDark);
  const tierJq = getRankTier(eloJq, isDark);

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    const txt = chatInput.trim();
    if (!txt || !onSendMessage) return;
    onSendMessage(txt, false);
    setChatInput('');
  };

  return (
    <div
      className={`relative mx-auto rounded-xl border flex flex-col transition-all duration-150 ease-out select-none overflow-hidden shrink-0 ${
        isCollapsed
          ? 'w-full max-w-[420px] lg:w-12 lg:max-w-[48px] lg:min-h-[480px]'
          : 'w-full max-w-[440px] lg:w-[440px] lg:max-w-[460px] xl:max-w-[480px] h-auto'
      } ${
        isHiddenBeforeDock
          ? 'opacity-0 invisible pointer-events-none scale-95'
          : 'opacity-100 visible scale-100'
      } ${
        isDark
          ? 'bg-[#1F1812] border-[#36291E] text-[#EFE6D5]'
          : 'bg-[#FFFFFF] border-[#D5DFDB] text-[#132226] shadow-xs'
      }`}
    >
      {isCollapsed ? (
        <div className="w-full h-full lg:min-h-[480px] flex flex-row lg:flex-col items-center justify-between lg:justify-start gap-2 lg:gap-3 py-2 lg:py-3 px-3 lg:px-1 animate-in fade-in duration-150">
          <button
            onClick={onToggleCollapse}
            className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark ? 'hover:bg-[#2A2018] text-[#D97706]' : 'hover:bg-[#EEF2F0] text-[#0F766E]'
            }`}
            title="Mở rộng bảng điều khiển"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-semibold lg:hidden">Mở bảng điều khiển</span>
          </button>

          <div className="flex flex-row lg:flex-col items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('moves');
                onToggleCollapse?.();
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'moves'
                  ? isDark
                    ? 'bg-[#2A2018] text-[#D97706]'
                    : 'bg-[#EEF2F0] text-[#0F766E]'
                  : isDark
                  ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                  : 'text-[#4A6368] hover:text-[#132226]'
              }`}
              title="Biên bản ván đấu"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTab('controls');
                onToggleCollapse?.();
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'controls'
                  ? isDark
                    ? 'bg-[#2A2018] text-[#D97706]'
                    : 'bg-[#EEF2F0] text-[#0F766E]'
                  : isDark
                  ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                  : 'text-[#4A6368] hover:text-[#132226]'
              }`}
              title="Thao tác & Cài đặt"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {isOnlineGame && (
              <button
                onClick={() => {
                  setActiveTab('chat');
                  onToggleCollapse?.();
                }}
                className={`p-2 rounded-lg relative transition-colors cursor-pointer ${
                  activeTab === 'chat'
                    ? isDark
                      ? 'bg-[#2A2018] text-[#D97706]'
                      : 'bg-[#EEF2F0] text-[#0F766E]'
                    : isDark
                    ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                    : 'text-[#4A6368] hover:text-[#132226]'
                }`}
                title="Trò chuyện"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full lg:w-[438px] flex flex-col animate-in fade-in duration-150">
          {/* 1. Header with Segmented Navigation & Collapse Trigger */}
          <div
            className={`px-3 py-2.5 border-b flex items-center justify-between shrink-0 gap-2 ${
              isDark ? 'border-[#36291E]' : 'border-[#D5DFDB]'
            }`}
          >
        <div
          className={`flex items-center p-1 rounded-lg border text-xs font-semibold ${
            isDark ? 'bg-[#120E0A] border-[#36291E]' : 'bg-[#EEF2F0] border-[#D5DFDB]'
          }`}
        >
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'controls'
                ? isDark
                  ? 'bg-[#2A2018] text-[#D97706] font-semibold shadow-2xs'
                  : 'bg-[#FFFFFF] text-[#0F766E] font-semibold shadow-2xs'
                : isDark
                ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                : 'text-[#4A6368] hover:text-[#132226]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>Điều khiển</span>
          </button>

          <button
            onClick={() => setActiveTab('moves')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'moves'
                ? isDark
                  ? 'bg-[#2A2018] text-[#D97706] font-semibold shadow-2xs'
                  : 'bg-[#FFFFFF] text-[#0F766E] font-semibold shadow-2xs'
                : isDark
                ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                : 'text-[#4A6368] hover:text-[#132226]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Biên bản</span>
          </button>

          {isOnlineGame && (
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'chat'
                  ? isDark
                    ? 'bg-[#2A2018] text-[#D97706] font-semibold shadow-2xs'
                    : 'bg-[#FFFFFF] text-[#0F766E] font-semibold shadow-2xs'
                  : isDark
                  ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                  : 'text-[#4A6368] hover:text-[#132226]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Chat</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                isDark
                  ? 'border-[#36291E] bg-[#120E0A] text-[#B8A996] hover:text-[#EFE6D5] hover:bg-[#2A2018]'
                  : 'border-[#D5DFDB] bg-[#EEF2F0] text-[#4A6368] hover:text-[#132226] hover:bg-[#E6ECEA]'
              }`}
              title="Thu gọn bảng điều khiển"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Consolidated Settings Popover Drawer */}
      {showSettingsPopover && (
        <div
          className={`absolute top-12 right-2 left-2 z-40 p-3.5 rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-[#1F1812] border-[#36291E] text-[#EFE6D5]'
              : 'bg-[#FFFFFF] border-[#D5DFDB] text-[#132226]'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 mb-2.5 border-b ${
              isDark ? 'border-[#36291E]' : 'border-[#D5DFDB]'
            }`}
          >
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Compass className={`w-3.5 h-3.5 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
              <span>Thiết lập ván đấu &amp; Biến thể</span>
            </span>
            <button
              onClick={() => setShowSettingsPopover(false)}
              className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-colors ${
                isDark
                  ? 'text-[#B8A996] hover:text-[#EFE6D5] hover:bg-[#2A2018]'
                  : 'text-[#4A6368] hover:text-[#132226] hover:bg-[#EEF2F0]'
              }`}
            >
              Đóng
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`}>
                Biến thể cờ
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeVariant?.('standard')}
                  className={`py-1.5 px-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    variant === 'standard'
                      ? isDark
                        ? 'bg-[#D97706] text-white border-[#D97706]'
                        : 'bg-[#0F766E] text-white border-[#0F766E]'
                      : isDark
                      ? 'border-[#36291E] text-[#EFE6D5] hover:bg-[#2A2018]'
                      : 'border-[#D5DFDB] text-[#132226] hover:bg-[#E6ECEA] bg-[#EEF2F0]'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Cờ Ngửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeVariant?.('jieqi')}
                  className={`py-1.5 px-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    variant === 'jieqi'
                      ? isDark
                        ? 'bg-[#D97706] text-white border-[#D97706]'
                        : 'bg-[#0F766E] text-white border-[#0F766E]'
                      : isDark
                      ? 'border-[#36291E] text-[#EFE6D5] hover:bg-[#2A2018]'
                      : 'border-[#D5DFDB] text-[#132226] hover:bg-[#E6ECEA] bg-[#EEF2F0]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cờ Úp</span>
                </button>
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`}>
                Thời gian mỗi bên
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'Không', value: 0 },
                  { label: '5 phút', value: 300 },
                  { label: '10 phút', value: 600 },
                  { label: '15 phút', value: 900 }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => onChangeTimeLimit(item.value)}
                    className={`py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                      timeLimit === item.value
                        ? isDark
                          ? 'bg-[#D97706] text-white border-[#D97706] font-semibold'
                          : 'bg-[#0F766E] text-white border-[#0F766E] font-semibold'
                        : isDark
                        ? 'border-[#36291E] text-[#EFE6D5] hover:bg-[#2A2018]'
                        : 'border-[#D5DFDB] text-[#132226] hover:bg-[#E6ECEA] bg-[#EEF2F0]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {gameMode === 'pvp' && (
              <label className="flex items-center justify-between cursor-pointer pt-1">
                <span className={isDark ? 'text-[#EFE6D5]' : 'text-[#132226] font-medium'}>
                  Tự động xoay bàn theo lượt
                </span>
                <input
                  type="checkbox"
                  checked={autoFlip}
                  onChange={(e) => onToggleAutoFlip(e.target.checked)}
                  className="rounded text-[#D97706] focus:ring-[#D97706] w-4 h-4 cursor-pointer"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* 3. Primary Action Bar */}
      <div
        className={`px-3 py-2 border-b shrink-0 ${
          isOnlineGame
            ? 'flex items-center justify-between gap-2'
            : 'grid grid-cols-3 gap-2'
        } ${
          isDark ? 'border-[#36291E] bg-[#120E0A]/75' : 'border-[#D5DFDB] bg-[#EEF2F0]/80'
        }`}
      >
        {isOnlineGame ? (
          <>
            {drawOfferedByOpponent ? (
              <button
                onClick={onAcceptDraw}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Handshake className="w-3.5 h-3.5 shrink-0" />
                <span>Đồng ý hòa</span>
              </button>
            ) : (
              <button
                onClick={onOfferDraw}
                disabled={isGameOver}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40 ${
                  isDark
                    ? 'border-[#36291E] bg-[#1F1812] text-[#EFE6D5] hover:bg-[#2A2018]'
                    : 'border-[#D5DFDB] bg-[#FFFFFF] text-[#132226] hover:bg-[#E6ECEA]'
                }`}
              >
                <Handshake className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
                <span>Cầu hòa</span>
              </button>
            )}

            <button
              onClick={onResign}
              disabled={!canResign}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40 ${
                isDark
                  ? 'border-red-900/50 bg-red-950/30 text-red-300 hover:bg-red-950/50'
                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Xin thua</span>
            </button>

            {isGameOver && (
              <button
                onClick={onRequestRematch}
                disabled={myRematchRequested}
                className={`flex-1 py-2 px-3 rounded-lg text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40 ${
                  isDark ? 'bg-[#D97706] hover:bg-amber-500' : 'bg-[#0F766E] hover:bg-teal-600'
                }`}
              >
                <Swords className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {rematchRequestedByOpponent ? 'Chấp nhận đấu lại' : 'Đấu lại'}
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`w-full py-2 px-2.5 rounded-lg border text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                isDark
                  ? 'border-[#36291E] bg-[#1F1812] text-[#EFE6D5] hover:bg-[#2A2018]'
                  : 'border-[#D5DFDB] bg-[#FFFFFF] text-[#132226] hover:bg-[#E6ECEA]'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`} />
              <span className="truncate">Hoãn nước</span>
            </button>

            <button
              onClick={onResign}
              disabled={!canResign}
              className={`w-full py-2 px-2.5 rounded-lg border text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                isDark
                  ? 'border-red-900/50 bg-red-950/30 text-red-300 hover:bg-red-950/50'
                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">Xin thua</span>
            </button>

            <button
              onClick={onNewGame}
              className={`w-full py-2 px-2.5 rounded-lg text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                isDark ? 'bg-[#D97706] hover:bg-amber-500' : 'bg-[#0F766E] hover:bg-teal-600'
              }`}
            >
              <Swords className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ván mới</span>
            </button>
          </>
        )}
      </div>

      {/* 4. Tab Body Area */}
      <div className="flex-initial h-auto flex flex-col p-3.5 overflow-hidden">
        {/* TAB 1: BIÊN BẢN & NƯỚC ĐI */}
        {activeTab === 'moves' && (
          <div className="flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${isDark ? 'text-[#EFE6D5]' : 'text-[#132226]'}`}>
                  Lịch sử ({moveHistory.length} nước)
                </span>
                {inspectMoveIndex !== null && (
                  <button
                    onClick={onExitInspect}
                    className={`text-[11px] px-2 py-0.5 rounded font-mono cursor-pointer ${
                      isDark
                        ? 'bg-[#D97706]/20 text-[#EFE6D5] border border-[#D97706]/50 hover:bg-[#D97706] hover:text-white'
                        : 'bg-[#0F766E]/15 text-[#0F766E] border border-[#0F766E]/40 hover:bg-[#0F766E] hover:text-white'
                    }`}
                  >
                    Về nước hiện tại
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <div
                  className={`flex items-center rounded-md p-0.5 text-[11px] border ${
                    isDark ? 'bg-[#120E0A] border-[#36291E]' : 'bg-[#EEF2F0] border-[#D5DFDB]'
                  }`}
                >
                  <button
                    onClick={() => setNotationMode('full')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                      notationMode === 'full'
                        ? isDark
                          ? 'bg-[#2A2018] text-[#D97706] font-semibold'
                          : 'bg-[#FFFFFF] text-[#0F766E] font-semibold shadow-2xs'
                        : isDark
                        ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                        : 'text-[#4A6368] hover:text-[#132226]'
                    }`}
                  >
                    Đầy đủ
                  </button>
                  <button
                    onClick={() => setNotationMode('short')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                      notationMode === 'short'
                        ? isDark
                          ? 'bg-[#2A2018] text-[#D97706] font-semibold'
                          : 'bg-[#FFFFFF] text-[#0F766E] font-semibold shadow-2xs'
                        : isDark
                        ? 'text-[#B8A996] hover:text-[#EFE6D5]'
                        : 'text-[#4A6368] hover:text-[#132226]'
                    }`}
                  >
                    Ngắn
                  </button>
                </div>

                <button
                  onClick={onCopyFen}
                  className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[#36291E] bg-[#120E0A] text-[#EFE6D5] hover:bg-[#2A2018]'
                      : 'border-[#D5DFDB] bg-[#EEF2F0] text-[#132226] hover:bg-[#E6ECEA]'
                  }`}
                  title="Sao chép FEN"
                >
                  {copiedFen ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className={`w-3.5 h-3.5 ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`} />
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Notation Table */}
            <div
              className={`h-[300px] sm:h-[340px] overflow-y-auto rounded-lg border p-1.5 font-mono tabular-nums text-xs divide-y scrollbar-thin ${
                isDark
                  ? 'bg-[#120E0A] border-[#36291E] divide-[#36291E]/60'
                  : 'bg-[#EEF2F0] border-[#D5DFDB] divide-[#D5DFDB]/70'
              }`}
            >
              {pairedMoves.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center gap-2">
                  <div className={`text-xs font-sans font-semibold ${isDark ? 'text-[#EFE6D5]' : 'text-[#132226]'}`}>
                    {variant === 'jieqi' ? 'Ván Đấu Cờ Úp' : 'Ván Đấu Cờ Ngửa'}
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">
                      {variant === 'jieqi' ? eloJq : eloStd} Elo
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>{variant === 'jieqi' ? tierJq.tier : tierStd.tier}</span>
                  </div>
                  <p className={`text-xs font-sans ${isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}`}>
                    Chưa có nước đi nào. Chọn quân cờ trên bàn để khai cuộc.
                  </p>
                </div>
              ) : (
                pairedMoves.map((pair) => {
                  const redIdx = (pair.index - 1) * 2;
                  const blackIdx = redIdx + 1;
                  const isRedActive = currentIndex === redIdx;
                  const isBlackActive = currentIndex === blackIdx;

                  return (
                    <div
                      key={pair.index}
                      className={`flex items-center py-1 px-2 ${
                        isDark ? 'hover:bg-[#1F1812]' : 'hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <span
                        className={`w-8 shrink-0 text-xs tabular-nums ${
                          isDark ? 'text-[#9C8A74]' : 'text-[#4A6368]'
                        }`}
                      >
                        {pair.index}.
                      </span>

                      <button
                        onClick={() => onSelectMove(redIdx)}
                        className={`flex-1 text-left px-2 py-0.5 rounded transition-colors cursor-pointer truncate ${
                          isRedActive
                            ? isDark
                              ? 'bg-red-950/60 text-red-300 font-semibold'
                              : 'bg-red-100 text-red-900 font-semibold'
                            : isDark
                            ? 'text-red-400 hover:bg-[#2A2018]'
                            : 'text-red-700 hover:bg-red-50'
                        }`}
                      >
                        {pair.red
                          ? notationMode === 'full'
                            ? pair.red.notation.vn
                            : pair.red.notation.vnShort
                          : '-'}
                      </button>

                      <button
                        onClick={() => pair.black && onSelectMove(blackIdx)}
                        disabled={!pair.black}
                        className={`flex-1 text-left px-2 py-0.5 rounded transition-colors truncate ${
                          pair.black
                            ? isBlackActive
                              ? isDark
                                ? 'bg-[#2A2018] text-[#D97706] font-semibold cursor-pointer'
                                : 'bg-[#0F766E]/15 text-[#0F766E] font-semibold cursor-pointer'
                              : isDark
                              ? 'text-[#EFE6D5] hover:bg-[#2A2018] cursor-pointer'
                              : 'text-[#132226] hover:bg-[#E6ECEA] cursor-pointer'
                            : isDark
                            ? 'text-[#9C8A74]'
                            : 'text-[#4A6368]'
                        }`}
                      >
                        {pair.black
                          ? notationMode === 'full'
                            ? pair.black.notation.vn
                            : pair.black.notation.vnShort
                          : ''}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ĐIỀU KHIỂN & CHỌN CHẾ ĐỘ CHƠI */}
        {activeTab === 'controls' && (
          <div className="flex flex-col gap-3 select-none">
            {isOnlineGame && (
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 shrink-0 ${
                  isDark ? 'bg-[#120E0A] border-[#36291E]' : 'bg-[#EEF2F0] border-[#D5DFDB]'
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="truncate text-xs">
                    <span className="font-semibold">Phòng trực tuyến</span>
                    {spectatorCount > 0 && (
                      <span className={isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'}>
                        {' '}
                        · Khán giả: {spectatorCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {onCreateOnlineRoom && (
                    <button
                      onClick={onCreateOnlineRoom}
                      className={`py-1 px-2.5 rounded-md text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        isDark ? 'bg-[#D97706] hover:bg-amber-500' : 'bg-[#0F766E] hover:bg-teal-600'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tạo phòng</span>
                    </button>
                  )}
                  {onLeaveRoom && (
                    <button
                      onClick={onLeaveRoom}
                      className={`py-1 px-2.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        isDark
                          ? 'border-[#36291E] text-[#EFE6D5] hover:bg-[#2A2018]'
                          : 'border-[#D5DFDB] text-[#132226] hover:bg-[#E6ECEA]'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Rời phòng</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <ModeVariantSelector
              variant={variant}
              onChangeVariant={onChangeVariant}
              gameMode={gameMode}
              onSelectOnline={() => onChangeGameMode('online')}
              onSelectPvP={() => onChangeGameMode('pvp')}
              onSelectPvE={(side) => onChangeGameMode(side)}
              difficulty={difficulty}
              onChangeDifficulty={onChangeDifficulty}
              eloStandard={eloStandard}
              eloJieqi={eloJieqi}
              statsStandard={statsStandard}
              statsJieqi={statsJieqi}
              onOpenProfile={onOpenProfile}
              onOpenLeaderboard={onOpenLeaderboard}
              hideModeButtons={isOnlineGame}
              colorMode={colorMode}
            />
          </div>
        )}

        {/* TAB 3: CHAT TRỰC TUYẾN */}
        {activeTab === 'chat' && isOnlineGame && (
          <div className="flex flex-col space-y-2">
            <div
              className={`h-[280px] sm:h-[320px] overflow-y-auto rounded-lg border p-2.5 space-y-2 text-xs scrollbar-thin ${
                isDark ? 'bg-[#120E0A] border-[#36291E]' : 'bg-[#EEF2F0] border-[#D5DFDB]'
              }`}
            >
              {chatMessages.length === 0 ? (
                <div
                  className={`h-full flex items-center justify-center text-xs text-center p-3 ${
                    isDark ? 'text-[#B8A996]' : 'text-[#4A6368]'
                  }`}
                >
                  Chưa có tin nhắn trong phòng. Hãy gửi lời chào đến đối thủ.
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="flex flex-col text-xs">
                    <span className={`font-semibold text-[11px] ${isDark ? 'text-[#D97706]' : 'text-[#0F766E]'}`}>
                      {msg.senderName}
                    </span>
                    <span className={isDark ? 'text-[#EFE6D5]' : 'text-[#132226]'}>{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-1.5 pt-1 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-[#120E0A] border-[#36291E] text-[#EFE6D5] placeholder-[#9C8A74] focus:border-[#D97706]'
                    : 'bg-[#FFFFFF] border-[#D5DFDB] text-[#132226] placeholder-[#4A6368] focus:border-[#0F766E]'
                }`}
              />
              <button
                type="submit"
                className={`px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isDark ? 'bg-[#D97706] hover:bg-amber-500' : 'bg-[#0F766E] hover:bg-teal-600'
                }`}
              >
                Gửi
              </button>
            </form>
          </div>
        )}
      </div>
        </div>
      )}
    </div>
  );
}
