'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Swords,
  Copy,
  Check,
  RefreshCw,
  Users,
  PlusCircle,
  KeyRound,
  Share2,
  Clock,
  ShieldAlert,
  Loader2,
  Trophy,
  Flame,
  Eye,
  Drama
} from 'lucide-react';
import { PublicRoomSummary, RoomState, LeaderboardEntry } from '@/lib/multiplayer-types';
import { PieceColor, BoardTheme, getRankTier, GameVariant } from '@/lib/xiangqi-types';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicRooms: PublicRoomSummary[];
  leaderboard: LeaderboardEntry[];
  isLoadingRooms: boolean;
  isLoadingLeaderboard: boolean;
  onRefreshRooms: () => void;
  onRefreshLeaderboard: () => void;
  onCreateRoom: (hostName: string, hostColor: 'r' | 'b' | 'random', timeLimit: number, isPublic: boolean, isRanked?: boolean, playerElo?: number, variant?: GameVariant, matchmake?: boolean) => void;
  onJoinRoom: (roomCode: string, playerName: string, asSpectator?: boolean, playerElo?: number) => void;
  onLeaveRoom: () => void;
  roomState: RoomState | null;
  myColor: PieceColor | null;
  errorMessage: string | null;
  onClearError: () => void;
  isConnected?: boolean;
  onReconnect?: () => void;
  theme?: BoardTheme;
  userElo?: number;
  eloStandard?: number;
  eloJieqi?: number;
  defaultVariant?: GameVariant;
  initialTab?: 'lobby' | 'ranked' | 'create' | 'leaderboard' | 'code';
  colorMode?: 'dark' | 'light';
}

export function OnlineLobbyModal({
  isOpen,
  onClose,
  publicRooms,
  leaderboard,
  isLoadingRooms,
  isLoadingLeaderboard,
  onRefreshRooms,
  onRefreshLeaderboard,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  roomState,
  myColor,
  errorMessage,
  onClearError,
  isConnected = true,
  onReconnect,
  theme = 'imperial',
  userElo,
  eloStandard,
  eloJieqi,
  defaultVariant = 'standard',
  initialTab,
  colorMode = 'dark'
}: OnlineLobbyModalProps) {
  const isDark = colorMode !== 'light';
  const [activeTab, setActiveTab] = useState<'lobby' | 'ranked' | 'create' | 'leaderboard' | 'code'>(() => initialTab || 'ranked');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(initialTab || 'ranked');
    }
  }
  const [isJoining, setIsJoining] = useState(false);
  const [playerName, setPlayerName] = useState('Kỳ Thủ Lạc Hồng');
  const [playerElo, setPlayerElo] = useState<number>(1200);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedName = localStorage.getItem('xq_player_name');
        if (savedName) setPlayerName(savedName);
        const savedElo = localStorage.getItem('xq_player_elo');
        if (savedElo) setPlayerElo(parseInt(savedElo, 10));
      } catch {
        // ignore
      }
    });
  }, []);

  const currentEloStd = eloStandard ?? userElo ?? playerElo;
  const currentEloJq = eloJieqi ?? 1200;
  const rankStd = getRankTier(currentEloStd, isDark);
  const rankJq = getRankTier(currentEloJq, isDark);

  const [rankedVariant, setRankedVariant] = useState<GameVariant>(() => defaultVariant || 'standard');
  const [leaderboardVariant, setLeaderboardVariant] = useState<GameVariant>(() => defaultVariant || 'standard');
  const [selectedVariant, setSelectedVariant] = useState<GameVariant>(() => defaultVariant || 'standard');

  const activeRankedElo = rankedVariant === 'jieqi' ? currentEloJq : currentEloStd;
  const currentElo = activeRankedElo;
  const myRank = rankedVariant === 'jieqi' ? rankJq : rankStd;

  const [hostColor, setHostColor] = useState<'r' | 'b' | 'random'>('random');
  const [timeLimit, setTimeLimit] = useState<number>(900);
  const [isPublic, setIsPublic] = useState(true);
  const [isRanked, setIsRanked] = useState(true);
  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [searchSeconds, setSearchSeconds] = useState(0);

  const isZen = theme === 'zen';
  const isWaitingRoom = roomState !== null && !roomState.isGameStarted && !roomState.isGameOver;
  const isRankedSearching = isSearchingMatch || (activeTab === 'ranked' && isWaitingRoom);

  useEffect(() => {
    if (errorMessage || roomState) {
      const timer = setTimeout(() => setIsJoining(false), 0);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, roomState]);

  useEffect(() => {
    if (!isOpen || errorMessage || roomState?.isGameStarted) {
      const timer = setTimeout(() => {
        setIsSearchingMatch(false);
        setSearchSeconds(0);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, errorMessage, roomState?.isGameStarted]);

  useEffect(() => {
    if (!isRankedSearching) return;
    const interval = setInterval(() => {
      setSearchSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRankedSearching]);

  const handleNameChange = (val: string) => {
    setPlayerName(val);
    try {
      localStorage.setItem('xq_player_name', val);
    } catch {
      // ignore
    }
  };

  const handleCodeChange = (raw: string) => {
    const match = raw.match(/room=([A-Za-z0-9]{6})/i);
    if (match) {
      setInputCode(match[1].toUpperCase());
      return;
    }
    const cleaned = raw.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
    setInputCode(cleaned);
  };

  const handleJoin = (asSpectator = false) => {
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 6 || isJoining) return;
    setIsJoining(true);
    onClearError();
    onJoinRoom(code, playerName, asSpectator, currentElo);
    setTimeout(() => setIsJoining(false), 5000);
  };

  const copyTextSafe = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else if (typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {}
    }
  };

  const handleCopyCode = (code: string) => {
    copyTextSafe(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
    copyTextSafe(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    if (typeof navigator !== 'undefined' && navigator.share && window.matchMedia('(max-width: 767px)').matches) {
      navigator.share({
        title: 'Cờ Tướng - Xiangqi Master',
        text: `Mời bạn vào bàn cờ #${code} đấu Cờ Tướng cùng mình!`,
        url
      }).catch(() => {});
    }
  };

  if (!isOpen) return null;

  const formatSearchTimer = (secs: number) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    const rem = (secs % 60).toString().padStart(2, '0');
    return `${mins}:${rem}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4">
      <div
        className={`relative w-full max-w-xl rounded-xl border shadow-2xl flex flex-col max-h-[90dvh] overscroll-contain overflow-hidden ${
          isDark
            ? 'border-[#232D3F] bg-[#151C28] text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-amber-900/30' : 'border-amber-800/15'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isDark
                ? isZen ? 'bg-amber-950/40 border-amber-700/40 text-amber-300' : 'bg-red-950/80 border-red-700/50 text-red-400'
                : isZen ? 'bg-amber-100 border-amber-600/30 text-amber-900' : 'bg-red-100 border-red-600/30 text-red-800'
            }`}>
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-serif font-bold tracking-wide ${
                  isDark ? 'text-amber-200' : 'text-amber-950'
                }`}>
                  Đấu Cờ Tướng Trực Tuyến
                </h2>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-neutral-700 hover:text-neutral-950 hover:bg-black/5'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-2.5 p-2.5 rounded-xl bg-red-950/80 border border-red-800/60 text-xs text-red-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={onClearError} className="text-red-400 hover:text-red-100 font-bold px-1">
              ✕
            </button>
          </div>
        )}

        {isWaitingRoom && activeTab !== 'ranked' ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center animate-spin text-amber-400">
              <Loader2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className={`text-base sm:text-lg font-serif font-bold ${
                isDark ? 'text-amber-100' : 'text-amber-950 font-black'
              }`}>
                Đang chờ đối thủ vào bàn...
              </h3>
              <p className={`text-xs max-w-sm ${
                isDark ? 'text-slate-400' : 'text-neutral-700 font-medium'
              }`}>
                Hãy chia sẻ mã phòng hoặc gửi link mời cho bạn bè để bắt đầu trận đấu!
              </p>
            </div>

            <div className={`w-full max-w-sm p-4 rounded-xl border flex flex-col items-center gap-2.5 ${
              isDark ? 'border-amber-800/40 bg-black/40' : 'border-[#d8cbb8] bg-white shadow-xs'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                isDark ? 'text-amber-300/70' : 'text-amber-800'
              }`}>
                Mã phòng của bạn
              </span>
              <div className={`text-3xl sm:text-4xl font-mono font-black tracking-widest ${
                isDark ? 'text-amber-300' : 'text-amber-900'
              }`}>
                {roomState.roomCode}
              </div>

              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  onClick={() => handleCopyCode(roomState.roomCode)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'border-amber-700/50 bg-amber-900/30 hover:bg-amber-800/40 text-amber-200'
                      : 'border-amber-700/40 bg-amber-50 hover:bg-amber-100 text-amber-900'
                  }`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Đã sao chép' : 'Sao chép mã'}</span>
                </button>
                <button
                  onClick={() => handleCopyLink(roomState.roomCode)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'border-amber-600/50 bg-amber-600/30 hover:bg-amber-600/40 text-amber-100'
                      : 'border-amber-700/50 bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã chép link' : 'Gửi link mời'}</span>
                </button>
              </div>
            </div>

            <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-neutral-700 font-medium'}`}>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Thời gian: <strong className={isDark ? "text-slate-200" : "text-neutral-900 font-bold"}>15 phút cố định (60s/nước)</strong>
              </span>
              <span>·</span>
              <span>
                Cầm quân: <strong className={myColor === 'r' ? (isDark ? 'text-red-400' : 'text-red-700 font-bold') : (isDark ? 'text-slate-300' : 'text-neutral-900 font-bold')}>{myColor === 'r' ? 'Quân Đỏ' : 'Quân Đen'}</strong>
              </span>
            </div>

            <button
              onClick={onLeaveRoom}
              className={`py-2 px-6 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-red-900/60 bg-red-950/40 hover:bg-red-900/50 text-red-300'
                  : 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700'
              }`}
            >
              Hủy phòng chờ
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`px-3 sm:px-4 pt-2.5 pb-2 border-b grid grid-cols-5 gap-1 sm:gap-1.5 shrink-0 w-full ${
              isDark ? 'border-amber-900/20 bg-transparent' : 'border-[#e2d5c1] bg-[#f7efe2]/60'
            }`}>
              <button
                onClick={() => setActiveTab('ranked')}
                className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer w-full text-center ${
                  activeTab === 'ranked'
                    ? isDark
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200 shadow-sm'
                      : 'bg-red-600 text-white border border-red-600 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-black/5 border border-[#dfd2be] bg-white/70'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'ranked' ? (isDark ? 'text-rose-400' : 'text-white') : (isDark ? 'text-rose-400' : 'text-red-600')}`} />
                <span className="truncate">Xếp Hạng</span>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer w-full text-center ${
                  activeTab === 'create'
                    ? isDark
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 shadow-sm'
                      : 'bg-amber-700 text-white border border-amber-700 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-black/5 border border-[#dfd2be] bg-white/70'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Tạo phòng</span>
              </button>
              <button
                onClick={() => setActiveTab('lobby')}
                className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer w-full text-center ${
                  activeTab === 'lobby'
                    ? isDark
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 shadow-sm'
                      : 'bg-amber-700 text-white border border-amber-700 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-black/5 border border-[#dfd2be] bg-white/70'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Phòng chờ</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  onRefreshLeaderboard();
                }}
                className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer w-full text-center ${
                  activeTab === 'leaderboard'
                    ? isDark
                      ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 shadow-sm'
                      : 'bg-amber-700 text-white border border-amber-700 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-black/5 border border-[#dfd2be] bg-white/70'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'leaderboard' ? (isDark ? 'text-yellow-400' : 'text-white') : (isDark ? 'text-yellow-400' : 'text-amber-700')}`} />
                <span className="truncate">BXH</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer w-full text-center ${
                  activeTab === 'code'
                    ? isDark
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 shadow-sm'
                      : 'bg-amber-700 text-white border border-amber-700 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-black/5 border border-[#dfd2be] bg-white/70'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Nhập mã</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {activeTab === 'lobby' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Các bàn cờ đang mở tìm đối thủ hoặc đang thi đấu:</span>
                    <button
                      onClick={onRefreshRooms}
                      disabled={isLoadingRooms}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingRooms ? 'animate-spin' : ''}`} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  {publicRooms.length > 0 ? (
                    <div className="space-y-2.5">
                      {publicRooms.map((room) => {
                        const isFull = room.openSide === null;
                        return (
                          <div
                            key={room.roomCode}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isDark
                                ? 'border-amber-900/30 bg-black/35 hover:border-amber-700/50'
                                : 'border-[#d8cbb8] bg-white hover:border-amber-600 shadow-xs'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm truncate ${isDark ? 'text-slate-100' : 'text-neutral-900'}`}>
                                  {room.hostName}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                  room.variant === 'jieqi'
                                    ? isDark ? 'bg-rose-950/60 text-rose-300 border-rose-700/50' : 'bg-red-50 text-red-800 border-red-200'
                                    : isDark ? 'bg-amber-950/60 text-amber-300 border-amber-700/50' : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}>
                                  {room.variant === 'jieqi' ? 'Cờ Úp' : 'Cờ Ngửa'}
                                </span>
                                <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border ${
                                  isDark
                                    ? 'bg-slate-800 text-amber-300 border-slate-700'
                                    : 'bg-slate-100 text-amber-900 border-slate-200 font-bold'
                                }`}>
                                  {room.hostElo} Elo
                                </span>
                                {room.isRanked && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                                    isDark ? 'bg-rose-950/60 text-rose-300 border-rose-800/40' : 'bg-red-50 text-red-800 border-red-200'
                                  }`}>
                                    Xếp Hạng
                                  </span>
                                )}
                              </div>
                              <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-neutral-600 font-medium'}`}>
                                <span className={`flex items-center gap-1 font-mono tabular-nums ${isDark ? 'text-amber-200/90' : 'text-amber-900 font-bold'}`}>
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  15 phút · 60s/nước
                                </span>
                                <span>·</span>
                                {isFull ? (
                                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                    Đang thi đấu
                                  </span>
                                ) : (
                                  <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-semibold'}>
                                    Bốc thăm màu quân (50/50)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {!isFull && (
                                <button
                                  disabled={isJoining}
                                  onClick={() => {
                                    setIsJoining(true);
                                    onClearError();
                                    onJoinRoom(room.roomCode, playerName, false, currentElo);
                                    setTimeout(() => setIsJoining(false), 5000);
                                  }}
                                  className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                  Vào chơi
                                </button>
                              )}
                              <button
                                disabled={isJoining}
                                onClick={() => {
                                  setIsJoining(true);
                                  onClearError();
                                  onJoinRoom(room.roomCode, playerName, true, currentElo);
                                  setTimeout(() => setIsJoining(false), 5000);
                                }}
                                className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isDark
                                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                                    : 'border-[#cfc1ac] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold'
                                }`}
                                title="Vào xem trận đấu với tư cách khán giả"
                              >
                                <Eye className="w-3.5 h-3.5 text-sky-500" />
                                <span className="hidden sm:inline">Xem</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                      <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                        isDark ? 'border-amber-900/40 bg-black/40 text-slate-500' : 'border-[#d8cbb8] bg-white text-neutral-400 shadow-xs'
                      }`}>
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-neutral-900'}`}>Chưa có phòng công khai nào</p>
                        <p className={`text-xs max-w-xs ${isDark ? 'text-slate-500' : 'text-neutral-600 font-medium'}`}>
                          Tạo bàn cờ mới hoặc vào hàng chờ Xếp Hạng để ghép trận ngay!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('create')}
                        className={`py-1.5 px-4 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          isDark
                            ? 'border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-900/40'
                            : 'border-amber-600 bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 shadow-xs'
                        }`}
                      >
                        Tạo bàn cờ ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ranked' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span>Chọn Thể Loại Đấu Xếp Hạng & Điểm Elo Riêng</span>
                    </div>

                    {/* Hai thẻ Elo riêng biệt: Cờ Ngửa (Brass Gold) & Cờ Úp (Cinnabar Red) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* THẺ 1: CỜ NGỬA */}
                      <button
                        type="button"
                        onClick={() => setRankedVariant('standard')}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                          rankedVariant === 'standard'
                            ? isDark
                              ? 'border-amber-500/90 bg-gradient-to-br from-[#271d14] via-[#1c140e] to-[#120d09] shadow-[inset_0_1.5px_3.5px_rgba(0,0,0,0.5),0_0_14px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
                              : 'border-amber-600/90 bg-gradient-to-br from-[#fffdfa] via-[#fcf5e9] to-[#f6ebd6] shadow-[inset_0_1px_2.5px_rgba(217,119,6,0.08),0_2px_8px_rgba(217,119,6,0.15)] ring-1 ring-amber-600/40'
                            : isDark
                            ? 'border-[#3a2c1b]/70 bg-black/35 shadow-[inset_0_1px_2.5px_rgba(0,0,0,0.4)] opacity-75 hover:opacity-100 hover:border-amber-500/40'
                            : 'border-[#dfd3c3] bg-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] opacity-75 hover:opacity-100 hover:border-amber-600/40'
                        }`}
                      >
                        {rankedVariant === 'standard' && (
                          <div className="absolute -top-6 -right-6 w-14 h-14 bg-amber-500/15 rounded-full blur-md pointer-events-none" />
                        )}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold flex items-center gap-1.5 font-serif ${
                            isDark ? 'text-amber-400' : 'text-amber-800'
                          }`}>
                            <Swords className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                            <span>Cờ Ngửa</span>
                          </span>
                          {rankedVariant === 'standard' ? (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide shadow-xs flex items-center gap-1 ${
                              isDark ? 'bg-amber-500 text-black' : 'bg-amber-600 text-white'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDark ? 'bg-black' : 'bg-white'}`} />
                              <span>Đang Chọn</span>
                            </span>
                          ) : (
                            <span className={`text-[9px] font-semibold underline ${
                              isDark ? 'text-amber-400/80 hover:text-amber-300 decoration-amber-500/40' : 'text-amber-800 hover:text-amber-900 decoration-amber-700/40'
                            }`}>
                              Chọn đấu
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline justify-between mb-1">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black font-mono leading-none ${
                              isDark ? 'text-amber-300' : 'text-amber-900'
                            }`}>
                              {currentEloStd}
                            </span>
                            <span className={`text-[10px] font-sans ${isDark ? 'text-slate-400' : 'text-neutral-600'}`}>Elo</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${rankStd.colorClass}`}>
                            <span>{rankStd.badge}</span>
                            <span>{rankStd.tier}</span>
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <div className={`flex justify-between text-[9px] ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            <span>Tiến trình</span>
                            <span>{currentEloStd} / {rankStd.nextThreshold}</span>
                          </div>
                          <div className={`h-1.5 rounded-full overflow-hidden border shadow-inner ${
                            isDark ? 'bg-black/50 border-white/5' : 'bg-amber-200/50 border-amber-400/20'
                          }`}>
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full transition-all duration-300"
                              style={{ width: `${rankStd.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </button>

                      {/* THẺ 2: CỜ ÚP */}
                      <button
                        type="button"
                        onClick={() => setRankedVariant('jieqi')}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                          rankedVariant === 'jieqi'
                            ? isDark
                              ? 'border-red-500/90 bg-gradient-to-br from-[#2a1317] via-[#1d0d10] to-[#12080a] shadow-[inset_0_1.5px_3.5px_rgba(0,0,0,0.5),0_0_14px_rgba(239,68,68,0.2)] ring-1 ring-red-500/40'
                              : 'border-red-600/90 bg-gradient-to-br from-[#fffafa] via-[#fdf0f0] to-[#f9dede] shadow-[inset_0_1px_2.5px_rgba(220,38,38,0.08),0_2px_8px_rgba(220,38,38,0.15)] ring-1 ring-red-600/40'
                            : isDark
                            ? 'border-[#3d1c21]/70 bg-black/35 shadow-[inset_0_1px_2.5px_rgba(0,0,0,0.4)] opacity-75 hover:opacity-100 hover:border-red-500/40'
                            : 'border-[#dfd3c3] bg-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] opacity-75 hover:opacity-100 hover:border-red-600/40'
                        }`}
                      >
                        {rankedVariant === 'jieqi' && (
                          <div className="absolute -top-6 -right-6 w-14 h-14 bg-red-500/15 rounded-full blur-md pointer-events-none" />
                        )}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold flex items-center gap-1.5 font-serif ${
                            isDark ? 'text-red-400' : 'text-red-800'
                          }`}>
                            <Drama className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-rose-400' : 'text-red-600'}`} />
                            <span>Cờ Úp</span>
                          </span>
                          {rankedVariant === 'jieqi' ? (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-wide shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>Đang Chọn</span>
                            </span>
                          ) : (
                            <span className={`text-[9px] font-semibold underline ${
                              isDark ? 'text-red-400/80 hover:text-red-300 decoration-red-500/40' : 'text-red-800 hover:text-red-900 decoration-red-700/40'
                            }`}>
                              Chọn đấu
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline justify-between mb-1">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black font-mono leading-none ${
                              isDark ? 'text-red-300' : 'text-red-900'
                            }`}>
                              {currentEloJq}
                            </span>
                            <span className={`text-[10px] font-sans ${isDark ? 'text-slate-400' : 'text-neutral-600'}`}>Elo</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${rankJq.colorClass}`}>
                            <span>{rankJq.badge}</span>
                            <span>{rankJq.tier}</span>
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <div className={`flex justify-between text-[9px] ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            <span>Tiến trình</span>
                            <span>{currentEloJq} / {rankJq.nextThreshold}</span>
                          </div>
                          <div className={`h-1.5 rounded-full overflow-hidden border shadow-inner ${
                            isDark ? 'bg-black/50 border-white/5' : 'bg-red-200/50 border-red-400/20'
                          }`}>
                            <div
                              className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 rounded-full transition-all duration-300"
                              style={{ width: `${rankJq.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-neutral-900 font-bold'}`}>Tên hiển thị thi đấu</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      maxLength={24}
                      className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-black/40 border border-amber-900/40 text-slate-100 focus:border-amber-500 placeholder-slate-500'
                          : 'bg-white border border-[#cfc1ac] text-neutral-900 focus:border-amber-600 shadow-xs placeholder-neutral-400 font-medium'
                      }`}
                      placeholder="Nhập tên..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isRankedSearching) {
                        setIsSearchingMatch(false);
                        setSearchSeconds(0);
                        onLeaveRoom();
                      } else {
                        onClearError();
                        setSearchSeconds(0);
                        setIsSearchingMatch(true);
                        onCreateRoom(playerName, 'random', 900, true, true, activeRankedElo, rankedVariant, true);
                      }
                    }}
                    className={`relative overflow-hidden w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md ${
                      isRankedSearching
                        ? rankedVariant === 'jieqi'
                          ? 'bg-gradient-to-r from-rose-900 via-red-700 to-rose-900 text-white ring-2 ring-rose-400/90 shadow-[0_0_24px_rgba(244,63,94,0.55)]'
                          : 'bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 text-slate-950 ring-2 ring-amber-300/90 shadow-[0_0_24px_rgba(245,158,11,0.55)]'
                        : rankedVariant === 'jieqi'
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_4px_16px_rgba(225,29,72,0.4)]'
                        : isDark
                        ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow-[0_4px_16px_rgba(217,119,6,0.4)]'
                        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-white shadow-[0_4px_16px_rgba(217,119,6,0.3)]'
                    }`}
                  >
                    {isRankedSearching ? (
                      <>
                        <span className="flex items-center justify-center gap-2">
                          <span className="relative flex h-4 w-4 items-center justify-center">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              rankedVariant === 'jieqi' ? 'bg-rose-200' : 'bg-amber-950'
                            }`} />
                            <Loader2 className={`w-4 h-4 animate-spin ${
                              rankedVariant === 'jieqi' ? 'text-white' : 'text-slate-950'
                            }`} />
                          </span>
                          <span className={rankedVariant === 'jieqi' ? 'text-white' : 'text-slate-950'}>
                            {`Đang Tìm Đối Thủ ${rankedVariant === 'jieqi' ? 'Cờ Úp' : 'Cờ Ngửa'}... (${formatSearchTimer(searchSeconds)})`}
                          </span>
                        </span>
                        <span className={`text-[11px] font-semibold tracking-wide ${
                          rankedVariant === 'jieqi' ? 'text-rose-100/95' : 'text-slate-900/90'
                        }`}>
                          {roomState?.roomCode
                            ? `Máy chủ đã mở bàn chờ #${roomState.roomCode} · Quét Elo ${Math.max(800, activeRankedElo - 100 - Math.min(300, searchSeconds * 15))}–${activeRankedElo + 100 + Math.min(300, searchSeconds * 15)} (Nhấn để Hủy)`
                            : 'Đang phát tín hiệu lên máy chủ ghép trận... (Nhấn để Hủy)'}
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Flame className={`w-4 h-4 ${rankedVariant === 'jieqi' || !isDark ? 'text-white' : 'text-slate-950'}`} />
                        <span className={rankedVariant === 'jieqi' || !isDark ? 'text-white' : 'text-slate-950'}>
                          {rankedVariant === 'jieqi'
                            ? `Tìm Trận Đấu Xếp Hạng Cờ Úp (${currentEloJq} Elo)`
                            : `Tìm Trận Đấu Xếp Hạng Cờ Ngửa (${currentEloStd} Elo)`}
                        </span>
                      </span>
                    )}
                  </button>

                  {isRankedSearching && (
                    <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                      isDark
                        ? 'border-amber-500/40 bg-black/50 text-slate-200'
                        : 'border-amber-600/40 bg-amber-50/90 text-neutral-800'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                          <span className={isDark ? 'text-emerald-300' : 'text-emerald-800'}>
                            {roomState?.roomCode
                              ? `Hàng chờ máy chủ hoạt động · Mã bàn: #${roomState.roomCode}`
                              : 'Đang đồng bộ hàng chờ máy chủ...'}
                          </span>
                        </div>
                        {roomState?.roomCode && (
                          <button
                            type="button"
                            onClick={() => handleCopyCode(roomState.roomCode)}
                            className={`px-2 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                              isDark
                                ? 'border-amber-700/60 bg-amber-900/40 text-amber-200 hover:bg-amber-800/50'
                                : 'border-amber-600/40 bg-white text-amber-900 hover:bg-amber-100'
                            }`}
                          >
                            {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCode ? 'Đã chép mã' : `Chép mã #${roomState.roomCode}`}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'create' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-neutral-900 font-bold'}`}>Tên của bạn</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      maxLength={24}
                      className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-black/40 border border-amber-900/40 text-slate-100 focus:border-amber-500 placeholder-slate-500'
                          : 'bg-white border border-[#cfc1ac] text-neutral-900 focus:border-amber-600 shadow-xs placeholder-neutral-400 font-medium'
                      }`}
                      placeholder="Nhập tên..."
                    />
                  </div>

                  {/* Lựa chọn thể loại: Cờ Tướng (Sáng) hoặc Cờ Úp */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold flex items-center justify-between ${
                      isDark ? 'text-amber-300' : 'text-amber-950 font-bold'
                    }`}>
                      <span>Thể loại cờ</span>
                    </label>
                    <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${
                      isDark ? 'bg-black/40 border-amber-900/40' : 'bg-[#ede3d4] border-[#cfc1ac]'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setSelectedVariant('standard')}
                        className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedVariant === 'standard'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            : 'text-neutral-700 hover:text-neutral-950 hover:bg-black/5 font-semibold'
                        }`}
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Cờ Ngửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedVariant('jieqi')}
                        className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedVariant === 'jieqi'
                            ? 'bg-red-600 text-white shadow-xs'
                            : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            : 'text-neutral-700 hover:text-neutral-950 hover:bg-black/5 font-semibold'
                        }`}
                      >
                        <Drama className="w-3.5 h-3.5" />
                        <span>Cờ Úp</span>
                      </button>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDark ? 'border-[#232D3F] bg-[#0E131B]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="space-y-0.5">
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-neutral-900 font-bold'}`}>Phòng công khai</span>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-neutral-600 font-medium'}`}>Hiển thị trong sảnh chờ trực tuyến</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => onCreateRoom(playerName, 'random', 900, isPublic, true, currentElo, selectedVariant)}
                    className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" />
                    <span>{selectedVariant === 'jieqi' ? 'Tạo phòng Cờ Úp (15 phút, 60s/nước)' : 'Tạo phòng Cờ Ngửa (15 phút, 60s/nước)'}</span>
                  </button>
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div className="space-y-3">
                  {/* Lựa chọn xem BXH Cờ Ngửa hay Cờ Úp */}
                  <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${
                    isDark ? 'bg-black/40 border-amber-900/40' : 'bg-[#ede3d4] border-[#cfc1ac]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setLeaderboardVariant('standard')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        leaderboardVariant === 'standard'
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          : 'text-neutral-700 hover:text-neutral-950 hover:bg-black/5 font-semibold'
                      }`}
                    >
                      <Swords className={`w-3.5 h-3.5 ${leaderboardVariant === 'standard' ? 'text-white' : isDark ? 'text-amber-300' : 'text-amber-800'}`} />
                      <span>BXH Cờ Ngửa ({currentEloStd})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardVariant('jieqi')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        leaderboardVariant === 'jieqi'
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          : 'text-neutral-700 hover:text-neutral-950 hover:bg-black/5 font-semibold'
                      }`}
                    >
                      <Drama className={`w-3.5 h-3.5 ${leaderboardVariant === 'jieqi' ? 'text-white' : isDark ? 'text-rose-300' : 'text-red-700'}`} />
                      <span>BXH Cờ Úp ({currentEloJq})</span>
                    </button>
                  </div>

                  <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-neutral-700 font-medium'}`}>
                    <span className="flex items-center gap-1.5 font-bold">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                      <span>
                        {leaderboardVariant === 'jieqi'
                          ? 'Bảng vàng Cao Thủ Cờ Úp Toàn Server'
                          : 'Bảng vàng Cao Thủ Cờ Ngửa Toàn Server'}
                      </span>
                    </span>
                    <button
                      onClick={onRefreshLeaderboard}
                      disabled={isLoadingLeaderboard}
                      className={`flex items-center gap-1 font-bold disabled:opacity-50 cursor-pointer ${
                        isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-800 hover:text-amber-950'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  <div className={`border rounded-xl overflow-hidden ${
                    isDark ? 'border-amber-900/40 bg-black/40' : 'border-[#d8cbb8] bg-white shadow-xs'
                  }`}>
                    <div className={`grid grid-cols-[36px_1fr_80px_70px] py-2 px-3 text-[10px] font-bold uppercase tracking-wider border-b ${
                      isDark ? 'text-neutral-400 border-amber-900/30 bg-[#161210]' : 'text-neutral-700 border-[#d8cbb8] bg-[#f7efe2]'
                    }`}>
                      <span className="text-center">Hạng</span>
                      <span>Kỳ thủ</span>
                      <span className="text-center">Điểm Elo</span>
                      <span className="text-right">Thắng/Bại</span>
                    </div>

                    <div className={`max-h-60 overflow-y-auto divide-y text-xs ${
                      isDark ? 'divide-white/5' : 'divide-neutral-200'
                    }`}>
                      {(() => {
                        const filtered = leaderboard.filter((item) => {
                          if (item.variant) return item.variant === leaderboardVariant;
                          return leaderboardVariant === 'standard';
                        });
                        const fallbackJieqi: LeaderboardEntry[] = [
                          { rank: 1, name: 'Lại Lý Huynh (Úp Vương)', elo: 2450, tier: 'Kỳ Vương', wins: 192, losses: 18, draws: 30, winRate: 88, variant: 'jieqi' },
                          { rank: 2, name: 'Hà Văn Tiến', elo: 2380, tier: 'Kỳ Vương', wins: 165, losses: 24, draws: 35, winRate: 84, variant: 'jieqi' },
                          { rank: 3, name: 'Chu Tuấn Hải', elo: 2260, tier: 'Kiện Tướng', wins: 148, losses: 32, draws: 40, winRate: 77, variant: 'jieqi' },
                          { rank: 4, name: 'Nguyễn Hoàng Kiên', elo: 2210, tier: 'Kiện Tướng', wins: 135, losses: 38, draws: 32, winRate: 74, variant: 'jieqi' },
                          { rank: 5, name: 'Uông Dương Bắc', elo: 2090, tier: 'Kiện Tướng', wins: 122, losses: 40, draws: 28, winRate: 72, variant: 'jieqi' },
                          { rank: 6, name: 'Đặng Hữu Trang', elo: 1980, tier: 'Cao Thủ', wins: 104, losses: 36, draws: 22, winRate: 70, variant: 'jieqi' },
                          { rank: 7, name: 'Trần Quyết Thắng', elo: 1840, tier: 'Cao Thủ', wins: 91, losses: 44, draws: 18, winRate: 64, variant: 'jieqi' },
                          { rank: 8, name: 'Phí Trọng Hiếu', elo: 1710, tier: 'Kỳ Thủ', wins: 76, losses: 35, draws: 16, winRate: 63, variant: 'jieqi' },
                          { rank: 9, name: 'Lạc Hồng Úp Sĩ', elo: 1420, tier: 'Tập Sự', wins: 38, losses: 22, draws: 9, winRate: 58, variant: 'jieqi' },
                          { rank: 10, name: 'Kỳ Hiệp Tràng An', elo: 1280, tier: 'Tập Sự', wins: 22, losses: 16, draws: 5, winRate: 55, variant: 'jieqi' }
                        ];
                        const list = filtered.length > 0 ? filtered : (leaderboardVariant === 'jieqi' ? fallbackJieqi : leaderboard);
                        return list.map((item, idx) => {
                          const rankInfo = getRankTier(item.elo, isDark);
                          return (
                            <div
                              key={`${item.name}-${idx}`}
                              className={`grid grid-cols-[36px_1fr_80px_70px] py-2 px-3 items-center transition-colors ${
                                isDark ? 'hover:bg-white/5' : 'hover:bg-amber-500/10'
                              }`}
                            >
                              <span className="text-center font-bold font-mono tabular-nums">
                                #{idx + 1}
                              </span>
                              <div className="truncate">
                                <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-neutral-900 font-bold'}`}>{item.name}</span>
                                <span className={`block text-[10px] ${isDark ? 'text-slate-400' : 'text-neutral-600 font-medium'}`}>
                                  {rankInfo.tier} · {item.winRate}% thắng
                                </span>
                              </div>
                              <span className={`text-center font-mono font-bold ${
                                leaderboardVariant === 'jieqi'
                                  ? isDark ? 'text-rose-300' : 'text-red-700'
                                  : isDark ? 'text-amber-300' : 'text-amber-800'
                              }`}>
                                {item.elo}
                              </span>
                              <span className={`text-right font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-neutral-600 font-semibold'}`}>
                                <span className={isDark ? "text-emerald-400" : "text-emerald-700"}>{item.wins}</span>/<span className={isDark ? "text-rose-400" : "text-red-700"}>{item.losses}</span>
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-neutral-900 font-bold'}`}>Tên của bạn</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      maxLength={24}
                      className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-black/40 border border-amber-900/40 text-slate-100 focus:border-amber-500 placeholder-slate-500'
                          : 'bg-white border border-[#cfc1ac] text-neutral-900 focus:border-amber-600 shadow-xs placeholder-neutral-400 font-medium'
                      }`}
                      placeholder="Nhập tên..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-neutral-900 font-bold'}`}>Mã phòng (6 ký tự)</label>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputCode.length === 6 && !isJoining) {
                          handleJoin(false);
                        }
                      }}
                      maxLength={6}
                      className={`w-full px-4 py-3 rounded-xl font-mono text-2xl font-bold tracking-widest text-center uppercase focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-black/50 border border-amber-800/40 text-amber-300 focus:border-amber-400 placeholder:text-slate-600'
                          : 'bg-white border-2 border-amber-600/50 text-amber-950 focus:border-amber-600 shadow-sm placeholder:text-neutral-400'
                      }`}
                      placeholder="ABC123"
                    />
                    <p className={`text-[11px] text-center ${isDark ? 'text-slate-400' : 'text-neutral-600 font-medium'}`}>
                      Nhập mã 6 ký tự hoặc dán trực tiếp đường link mời
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={inputCode.length !== 6 || isJoining}
                      onClick={() => handleJoin(false)}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-40 cursor-pointer"
                    >
                      {isJoining ? 'Đang vào...' : 'Vào thi đấu'}
                    </button>
                    <button
                      disabled={inputCode.length !== 6 || isJoining}
                      onClick={() => handleJoin(true)}
                      className={`py-2.5 rounded-xl font-bold text-xs shadow-md disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                          : 'bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-400'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      <span>Vào xem trận</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
