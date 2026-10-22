'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trophy,
  History,
  Bookmark,
  LogOut,
  Play,
  Trash2,
  Calendar,
  Flame,
  Award,
  Swords,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Drama
} from 'lucide-react';
import {
  UserProfileData,
  MatchRecordData,
  SavedGameData,
  fetchUserMatches,
  fetchUserSavedGames,
  deleteSavedGame
} from '@/lib/firebase';
import { getRankTier } from '@/lib/xiangqi-types';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData | null;
  onSignOut: () => void;
  onResumeGame?: (savedGame: SavedGameData) => void;
  onSaveCurrentGame?: () => void;
  refreshTrigger?: number;
  colorMode?: 'dark' | 'light';
}

export function UserProfileDrawer({
  isOpen,
  onClose,
  profile,
  onSignOut,
  onResumeGame,
  onSaveCurrentGame,
  refreshTrigger = 0,
  colorMode = 'dark'
}: UserProfileDrawerProps) {
  const isDark = colorMode !== 'light';
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'saved'>('stats');
  const [statsVariant, setStatsVariant] = useState<'standard' | 'jieqi'>('standard');
  const [matches, setMatches] = useState<MatchRecordData[]>([]);
  const [savedGames, setSavedGames] = useState<SavedGameData[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const loadHistory = async () => {
    if (!profile?.uid) return;
    setLoadingMatches(true);
    try {
      const data = await fetchUserMatches(profile.uid, 25);
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadSaved = async () => {
    if (!profile?.uid) return;
    setLoadingSaved(true);
    try {
      const data = await fetchUserSavedGames(profile.uid);
      setSavedGames(data);
    } catch (err) {
      console.error('Failed to load saved games:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const uid = profile?.uid;
    if (isOpen && uid) {
      fetchUserMatches(uid, 25)
        .then((data) => {
          if (!ignore) setMatches(data);
        })
        .catch((err) => console.error('Failed to load matches:', err));

      fetchUserSavedGames(uid)
        .then((data) => {
          if (!ignore) setSavedGames(data);
        })
        .catch((err) => console.error('Failed to load saved games:', err));
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, profile?.uid, refreshTrigger]);

  const handleDeleteSaved = async (id: string) => {
    if (!profile?.uid) return;
    try {
      await deleteSavedGame(profile.uid, id);
      setSavedGames(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to delete game:', err);
    }
  };

  if (!isOpen || !profile) return null;

  const eloStd = profile?.eloStandard ?? profile?.elo ?? 1200;
  const eloJq = profile?.eloJieqi ?? 1200;
  const rankStd = getRankTier(eloStd, isDark);
  const rankJq = getRankTier(eloJq, isDark);

  const currentVariantRank = statsVariant === 'jieqi' ? rankJq : rankStd;
  const currentVariantElo = statsVariant === 'jieqi' ? eloJq : eloStd;

  const currentVariantGames = statsVariant === 'jieqi' 
    ? (profile?.gamesPlayedJieqi ?? 0)
    : (profile?.gamesPlayedStandard ?? profile?.gamesPlayed ?? 0);
  const currentVariantWins = statsVariant === 'jieqi' 
    ? (profile?.winsJieqi ?? 0)
    : (profile?.winsStandard ?? profile?.wins ?? 0);
  const currentVariantLosses = statsVariant === 'jieqi' 
    ? (profile?.lossesJieqi ?? 0)
    : (profile?.lossesStandard ?? profile?.losses ?? 0);
  const currentVariantDraws = statsVariant === 'jieqi' 
    ? (profile?.drawsJieqi ?? 0)
    : (profile?.drawsStandard ?? profile?.draws ?? 0);
  const currentVariantWinRate = statsVariant === 'jieqi'
    ? (profile?.winRateJieqi ?? (currentVariantGames > 0 ? Math.round((currentVariantWins / currentVariantGames) * 100) : 0))
    : (profile?.winRateStandard ?? profile?.winRate ?? (currentVariantGames > 0 ? Math.round((currentVariantWins / currentVariantGames) * 100) : 0));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className={`relative w-full max-w-md h-full border-l shadow-2xl flex flex-col z-10 transition-colors ${
          isDark
            ? 'bg-[#161a24] border-[#2e374c] text-slate-100'
            : 'bg-[#faf6ee] border-[#d8cbba] text-neutral-900'
        }`}
      >
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark
            ? 'border-[#293245] bg-gradient-to-r from-[#1c2230] via-[#202737] to-[#1c2230]'
            : 'border-[#dfd3c3] bg-gradient-to-r from-[#f7f0e4] via-[#fdf8f0] to-[#f7f0e4]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 flex items-center justify-center font-piece text-2xl text-neutral-900 shadow-md">
              {profile.displayName?.charAt(0)?.toUpperCase() || '帥'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-extrabold text-base truncate max-w-[180px] ${
                  isDark ? 'text-slate-100' : 'text-neutral-900'
                }`}>
                  {profile.displayName || 'Kỳ thủ'}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                <span className={`font-bold flex items-center gap-1 ${
                  isDark ? 'text-amber-300' : 'text-amber-800'
                }`}>
                  <span>⚔️ Ngửa:</span>
                  <span>{eloStd}</span>
                </span>
                <span className={isDark ? 'text-slate-500' : 'text-neutral-400'}>·</span>
                <span className={`font-bold flex items-center gap-1 ${
                  isDark ? 'text-red-300' : 'text-red-800'
                }`}>
                  <span>🎭 Úp:</span>
                  <span>{eloJq}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`flex border-b px-3 pt-2 ${
          isDark
            ? 'border-[#293245] bg-[#12151e]'
            : 'border-[#dfd3c3] bg-[#f0e7d8]'
        }`}>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'stats'
                ? isDark
                  ? 'border-amber-400 text-amber-300'
                  : 'border-amber-700 text-amber-950 font-black'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-neutral-600 hover:text-neutral-950 font-semibold'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Thống Kê</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? isDark
                  ? 'border-amber-400 text-amber-300'
                  : 'border-amber-700 text-amber-950 font-black'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-neutral-600 hover:text-neutral-950 font-semibold'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử ({matches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'saved'
                ? isDark
                  ? 'border-amber-400 text-amber-300'
                  : 'border-amber-700 text-amber-950 font-black'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-neutral-600 hover:text-neutral-950 font-semibold'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Đã Lưu ({savedGames.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Side-by-side Split Cards for Cờ Ngửa (Brass Gold) & Cờ Úp (Cinnabar Red) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatsVariant('standard')}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    statsVariant === 'standard'
                      ? isDark
                        ? 'border-amber-500/80 bg-gradient-to-br from-[#241c14]/90 via-[#1b1511]/95 to-[#120f0c] shadow-[inset_0_1.5px_3.5px_rgba(0,0,0,0.5),0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                        : 'border-amber-600/80 bg-gradient-to-br from-[#fffdfa] via-[#fcf5e9] to-[#f6ebd6] shadow-[inset_0_1px_2.5px_rgba(217,119,6,0.08),0_2px_8px_rgba(217,119,6,0.15)] ring-1 ring-amber-600/30'
                      : isDark
                      ? 'border-[#382b1b]/70 bg-black/30 shadow-[inset_0_1px_2.5px_rgba(0,0,0,0.4)] opacity-80 hover:opacity-100 hover:border-amber-500/40'
                      : 'border-[#dfd3c3] bg-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] opacity-80 hover:opacity-100 hover:border-amber-600/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold flex items-center gap-1.5 font-serif ${
                      isDark ? 'text-amber-400' : 'text-amber-800'
                    }`}>
                      <Swords className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                      <span>Cờ Ngửa</span>
                    </span>
                    {statsVariant === 'standard' && (
                      <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDark ? 'bg-amber-400' : 'bg-amber-600'}`} />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono leading-none ${
                      isDark ? 'text-amber-300' : 'text-amber-900'
                    }`}>
                      {eloStd}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-neutral-600'}`}>Elo</span>
                  </div>
                  <span className={`text-[10px] font-medium mt-1 block truncate ${
                    isDark ? 'text-amber-400/90' : 'text-amber-800'
                  }`}>
                    {rankStd.badge} {rankStd.tier}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatsVariant('jieqi')}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    statsVariant === 'jieqi'
                      ? isDark
                        ? 'border-red-500/80 bg-gradient-to-br from-[#271316]/90 via-[#1c0d10]/95 to-[#12080a] shadow-[inset_0_1.5px_3.5px_rgba(0,0,0,0.5),0_0_12px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30'
                        : 'border-red-600/80 bg-gradient-to-br from-[#fffafa] via-[#fdf0f0] to-[#f9dede] shadow-[inset_0_1px_2.5px_rgba(220,38,38,0.08),0_2px_8px_rgba(220,38,38,0.15)] ring-1 ring-red-600/30'
                      : isDark
                      ? 'border-[#3a1d21]/70 bg-black/30 shadow-[inset_0_1px_2.5px_rgba(0,0,0,0.4)] opacity-80 hover:opacity-100 hover:border-red-500/40'
                      : 'border-[#dfd3c3] bg-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] opacity-80 hover:opacity-100 hover:border-red-600/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold flex items-center gap-1.5 font-serif ${
                      isDark ? 'text-red-400' : 'text-red-800'
                    }`}>
                      <Drama className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-rose-400' : 'text-red-600'}`} />
                      <span>Cờ Úp</span>
                    </span>
                    {statsVariant === 'jieqi' && (
                      <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDark ? 'bg-red-400' : 'bg-red-600'}`} />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono leading-none ${
                      isDark ? 'text-red-300' : 'text-red-900'
                    }`}>
                      {eloJq}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-neutral-600'}`}>Elo</span>
                  </div>
                  <span className={`text-[10px] font-medium mt-1 block truncate ${
                    isDark ? 'text-red-400/90' : 'text-red-800'
                  }`}>
                    {rankJq.badge} {rankJq.tier}
                  </span>
                </button>
              </div>

              {/* Main Rating Card with Soft Inner Shadow */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  statsVariant === 'jieqi'
                    ? isDark
                      ? 'bg-gradient-to-br from-[#251316]/90 via-[#1b0e11]/95 to-[#12090b] border-red-500/40 shadow-[inset_0_1.5px_3.5px_rgba(0,0,0,0.5)]'
                      : 'bg-gradient-to-br from-[#fffafa] via-[#fdf0f0] to-[#fbe6e6] border-red-500/40 shadow-[inset_0_1px_2px_rgba(220,38,38,0.08)]'
                    : isDark
                    ? 'bg-gradient-to-br from-[#221c14]/90 via-[#191510]/95 to-[#110e0c] border-amber-500/40 shadow-[inset_0_1.5px_3.5px_rgba(0,0,0,0.5)]'
                    : 'bg-gradient-to-br from-[#fffdfa] via-[#fcf5e9] to-[#f9eedc] border-amber-500/40 shadow-[inset_0_1px_2px_rgba(217,119,6,0.08)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDark ? 'text-slate-400' : 'text-neutral-700 font-bold'
                  }`}>
                    {statsVariant === 'jieqi' ? (
                      <>
                        <Drama className="w-3.5 h-3.5 text-rose-400" />
                        <span>Chi Tiết Hạng & Elo Cờ Úp</span>
                      </>
                    ) : (
                      <>
                        <Swords className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chi Tiết Hạng & Elo Cờ Ngửa</span>
                      </>
                    )}
                  </span>
                  <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                    statsVariant === 'jieqi'
                      ? isDark ? 'text-rose-400' : 'text-red-700'
                      : isDark ? 'text-amber-400' : 'text-amber-800'
                  }`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    {statsVariant === 'jieqi' ? 'Biến thể Cờ Úp' : 'Cờ Tướng Chính Quy'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-3xl font-black font-mono ${
                      statsVariant === 'jieqi'
                        ? isDark ? 'text-red-300' : 'text-red-900'
                        : isDark ? 'text-amber-300' : 'text-amber-900'
                    }`}>
                      {currentVariantElo}
                    </span>
                    <span className={`text-xs ml-1.5 font-medium ${isDark ? 'text-slate-400' : 'text-neutral-700 font-bold'}`}>Elo</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 ${currentVariantRank.colorClass}`}>
                    <span className="text-base">{currentVariantRank.badge}</span>
                    <span>{currentVariantRank.tier}</span>
                  </div>
                </div>

                {/* Progress bar to next threshold */}
                <div className={`mt-3 pt-3 border-t space-y-1 ${isDark ? 'border-white/5' : 'border-amber-900/10'}`}>
                  <div className={`flex justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-neutral-700 font-semibold'}`}>
                    <span>Tiến trình thăng hạng</span>
                    <span>{currentVariantElo} / {currentVariantRank.nextThreshold}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden shadow-inner border ${
                    isDark ? 'bg-[#121620] border-white/5' : 'bg-amber-200/40 border-amber-400/20'
                  }`}>
                    <div
                      className={`h-full transition-all duration-500 rounded-full shadow-xs ${
                        statsVariant === 'jieqi'
                          ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500'
                          : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300'
                      }`}
                      style={{ width: `${currentVariantRank.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-[#1b212d] border-[#2d374a]' : 'bg-white border-[#d8cbb8] shadow-xs'
                }`}>
                  <p className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-neutral-900'}`}>{currentVariantGames}</p>
                  <p className={`text-[10px] font-semibold uppercase mt-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-600'}`}>Trận</p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300 shadow-xs'
                }`}>
                  <p className={`text-lg font-black ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>{currentVariantWins}</p>
                  <p className={`text-[10px] font-semibold uppercase mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Thắng</p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-red-950/40 border-red-500/40' : 'bg-red-50 border-red-300 shadow-xs'
                }`}>
                  <p className={`text-lg font-black ${isDark ? 'text-red-400' : 'text-red-800'}`}>{currentVariantLosses}</p>
                  <p className={`text-[10px] font-semibold uppercase mt-0.5 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Thua</p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-amber-950/40 border-amber-500/40' : 'bg-amber-50 border-amber-300 shadow-xs'
                }`}>
                  <p className={`text-lg font-black ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>{currentVariantDraws}</p>
                  <p className={`text-[10px] font-semibold uppercase mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Hòa</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#1a202d] border-[#2d374a]' : 'bg-white border-[#d8cbb8] shadow-xs'
              }`}>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-neutral-900'}`}>
                    Tỷ lệ thắng ({statsVariant === 'jieqi' ? 'Cờ Úp' : 'Cờ Ngửa'}):
                  </span>
                  <span className={`font-black font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{currentVariantWinRate}%</span>
                </div>
                <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-[#121620]' : 'bg-neutral-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, currentVariantWinRate))}%` }}
                  />
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                isDark ? 'bg-amber-950/30 border-amber-500/30' : 'bg-amber-100/70 border-amber-300 shadow-xs'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200 text-amber-900'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className={`font-bold ${isDark ? 'text-amber-200' : 'text-amber-950'}`}>Điểm Elo tính riêng biệt</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-neutral-700 font-medium'}`}>Cờ Ngửa và Cờ Úp ghi nhận điểm số độc lập trên đám mây</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400 font-medium">Các trận đấu gần đây:</span>
                <button
                  onClick={loadHistory}
                  disabled={loadingMatches}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingMatches ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              {loadingMatches ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Đang tải lịch sử ván cờ...</span>
                </div>
              ) : matches.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <Swords className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Chưa có ván đấu nào được ghi lại.</p>
                  <p className="text-[11px] text-slate-500">Hãy thi đấu với máy hoặc đấu online để lưu thành tích!</p>
                </div>
              ) : (
                matches.map((m) => {
                  const isWin = m.result === 'win';
                  const isLoss = m.result === 'loss';
                  const dateStr = new Date(m.date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                        isDark
                          ? isWin
                            ? 'bg-emerald-950/25 border-emerald-500/40'
                            : isLoss
                            ? 'bg-red-950/25 border-red-500/40'
                            : 'bg-amber-950/25 border-amber-500/40'
                          : isWin
                          ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                          : isLoss
                          ? 'bg-red-50/90 border-red-300 shadow-xs'
                          : 'bg-amber-50/90 border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isWin
                              ? 'bg-emerald-500 text-neutral-950'
                              : isLoss
                              ? 'bg-red-500 text-white'
                              : 'bg-amber-500 text-neutral-950'
                          }`}
                        >
                          {isWin ? 'W' : isLoss ? 'L' : 'D'}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-100' : 'text-neutral-900 font-extrabold'}`}>
                            vs {m.opponentName}
                          </p>
                          <div className={`flex items-center gap-2 text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-600 font-medium'}`}>
                            <span>{m.opponentType === 'ai' ? 'Đấu Máy' : m.opponentType === 'online' ? 'Online' : 'Bạn bè'}</span>
                            <span>·</span>
                            <span>{m.movesCount} nước</span>
                            <span>·</span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold font-mono ${
                            isDark
                              ? m.eloChange > 0
                                ? 'text-emerald-400'
                                : m.eloChange < 0
                                ? 'text-red-400'
                                : 'text-slate-400'
                              : m.eloChange > 0
                              ? 'text-emerald-700 font-black'
                              : m.eloChange < 0
                              ? 'text-red-700 font-black'
                              : 'text-neutral-700 font-bold'
                          }`}
                        >
                          {m.eloChange > 0 ? `+${m.eloChange}` : m.eloChange}
                        </span>
                        <p className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-neutral-600'}`}>Elo: {m.finalElo}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-neutral-700 font-bold'}`}>Các ván cờ đã lưu:</span>
                <div className="flex items-center gap-2">
                  {onSaveCurrentGame && (
                    <button
                      onClick={() => {
                        onSaveCurrentGame();
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                        isDark
                          ? 'text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30'
                          : 'text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-400 font-semibold'
                      }`}
                      title="Lưu lại thế cờ ván hiện tại"
                    >
                      <Bookmark className="w-3 h-3 text-amber-500" />
                      <span>Lưu ván hiện tại</span>
                    </button>
                  )}
                  <button
                    onClick={loadSaved}
                    disabled={loadingSaved}
                    className={`text-xs flex items-center gap-1 cursor-pointer ${
                      isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-800 hover:text-amber-950 font-bold'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingSaved ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {loadingSaved ? (
                <div className={`py-12 text-center text-xs ${isDark ? 'text-slate-400' : 'text-neutral-600'}`}>
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Đang tải danh sách ván cờ...</span>
                </div>
              ) : savedGames.length === 0 ? (
                <div className={`py-12 text-center text-xs space-y-2 ${isDark ? 'text-slate-400' : 'text-neutral-600'}`}>
                  <Bookmark className={`w-8 h-8 mx-auto ${isDark ? 'text-slate-600' : 'text-neutral-400'}`} />
                  <p className="font-semibold">Chưa có ván cờ nào được lưu.</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-neutral-600'}`}>
                    Trong khi chơi, bạn có thể bấm &quot;Lưu ván cờ&quot; để tiếp tục sau!
                  </p>
                </div>
              ) : (
                savedGames.map((game) => {
                  const dateStr = new Date(game.updatedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={game.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isDark
                          ? 'bg-[#1a202d] border-[#2d374a] hover:border-amber-500/50'
                          : 'bg-white border-[#d8cbb8] hover:border-amber-600 shadow-xs'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-100' : 'text-neutral-900 font-extrabold'}`}>{game.name}</p>
                        <div className={`flex items-center gap-2 text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-600 font-medium'}`}>
                          <span>Lượt: Bên {game.turn === 'r' ? 'Đỏ' : 'Đen'}</span>
                          <span>·</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onResumeGame && (
                          <button
                            onClick={() => {
                              onResumeGame(game);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="Tiếp tục chơi ván này"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Tiếp tục</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSaved(game.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDark
                              ? 'text-slate-400 hover:text-red-400 hover:bg-red-950/40'
                              : 'text-neutral-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="Xóa ván cờ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-[#293245] bg-[#12151e]' : 'border-[#d8cbba] bg-[#f4ece0]'
        }`}>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-neutral-700 font-bold'}`}>
            {profile.isAnonymous ? 'Tài khoản Khách' : profile.email || 'Kỳ thủ'}
          </span>
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'border-red-500/50 bg-red-950/40 hover:bg-red-900/60 text-red-300'
                : 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700 shadow-xs'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
