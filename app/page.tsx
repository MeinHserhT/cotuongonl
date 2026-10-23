'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PieceColor, Move, BOARD_THEME_LABELS } from '@/lib/xiangqi-types';
import { AudioEngine } from '@/lib/audio';
import { boardToFen } from '@/lib/xiangqi-openings';
import { useAuth } from '@/hooks/useAuth';
import { useXiangqiSocket } from '@/hooks/useXiangqiSocket';
import { recordMatchProgress, saveGameState, SavedGameData } from '@/lib/firebase';
import { useXiangqiGame } from '@/hooks/useXiangqiGame';
import { useScreenWakeLock } from '@/lib/mobile-ergonomics';

import dynamic from 'next/dynamic';

// Modular UI Components
import { GameHeader } from '@/components/GameHeader';
import { XiangqiBoard } from '@/components/XiangqiBoard';
import { UnifiedGameConsole } from '@/components/UnifiedGameConsole';
import { GameOverModal, RulesModal, ResignModal, DrawOfferModal } from '@/components/GameModals';
import { BoardSideTray } from '@/components/BoardSideTray';
import { PlayerBlock } from '@/components/PlayerBlock';
import { StartGameMenuModal } from '@/components/StartGameMenuModal';

// Dynamic lazy-loaded modals to minimize initial bundle size and boost Core Web Vitals (FCP/LCP)
const OnlineLobbyModal = dynamic(
  () => import('@/components/OnlineLobbyModal').then((m) => m.OnlineLobbyModal),
  { ssr: false }
);
const AuthModal = dynamic(
  () => import('@/components/AuthModal').then((m) => m.AuthModal),
  { ssr: false }
);
const UserProfileDrawer = dynamic(
  () => import('@/components/UserProfileDrawer').then((m) => m.UserProfileDrawer),
  { ssr: false }
);
const SaveGameModal = dynamic(
  () => import('@/components/SaveGameModal').then((m) => m.SaveGameModal),
  { ssr: false }
);
const OpeningBookModal = dynamic(
  () => import('@/components/OpeningBookModal').then((m) => m.OpeningBookModal),
  { ssr: false }
);
const SettingsMenuModal = dynamic(
  () => import('@/components/SettingsMenuModal').then((m) => m.SettingsMenuModal),
  { ssr: false }
);

export default function XiangqiPage() {
  const audio = useRef<AudioEngine | null>(null);

  // Initialize Web Audio Engine once on first client interaction
  useEffect(() => {
    if (!audio.current && typeof window !== 'undefined') {
      audio.current = new AudioEngine();
    }
    const handleGesture = () => {
      audio.current?.init();
    };
    window.addEventListener('click', handleGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const handleToggleMute = useCallback(() => {
    if (audio.current) {
      audio.current.init();
      audio.current.muted = !audio.current.muted;
      setSoundMuted(audio.current.muted);
    }
  }, []);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const socketRef = useRef<ReturnType<typeof useXiangqiSocket> | null>(null);
  const handleLocalMove = useCallback((m: Move) => {
    if (socketRef.current?.roomState?.isGameStarted) {
      socketRef.current.makeMove(m);
    }
  }, []);

  const handleWrongTurnClick = useCallback((clickedColor: PieceColor, currentTurn: PieceColor) => {
    if (currentTurn === 'r' && clickedColor === 'b') {
      showToast('Lượt của Quân Đỏ (Tiên) đi trước! Hãy chọn quân Đỏ.');
    } else if (currentTurn === 'b' && clickedColor === 'r') {
      showToast('Lượt của Quân Đen (Hậu)! Hãy chọn quân Đen.');
    }
  }, [showToast]);

  const handlePerpetualCheckWarning = useCallback((count: number, color: PieceColor) => {
    showToast(`Cảnh báo: Bên ${color === 'r' ? 'Đỏ' : 'Đen'} đã chiếu lần thứ ${count} cùng vị trí! Chiếu quá 3 lần sẽ bị tính Hòa.`);
  }, [showToast]);

  // Start Game Mode Selection Pop-up (opens automatically every time the page is freshly entered)
  const [startMenuOpen, setStartMenuOpen] = useState<boolean>(true);
  const [hasSelectedMode, setHasSelectedMode] = useState<boolean>(false);
  const [isConsoleDocked, setIsConsoleDocked] = useState<boolean>(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);
  const [consoleDockHighlight, setConsoleDockHighlight] = useState<boolean>(false);
  const dockHighlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFlyToConsole = useCallback(() => {
    if (dockHighlightTimeoutRef.current) clearTimeout(dockHighlightTimeoutRef.current);
    setTimeout(() => {
      setIsConsoleDocked(true);
      setConsoleDockHighlight(true);
      setTimeout(() => {
        setIsConsoleCollapsed(true);
      }, 60);
      dockHighlightTimeoutRef.current = setTimeout(() => {
        setConsoleDockHighlight(false);
      }, 900);
    }, 340);
  }, []);

  const recordMatchOutcomeRef = useRef<((result: 'win' | 'loss' | 'draw', turnsCount: number) => void) | null>(null);
  const handleLocalGameEnd = useCallback((result: 'win' | 'loss' | 'draw', turnsCount: number) => {
    recordMatchOutcomeRef.current?.(result, turnsCount);
  }, []);

  // Primary Xiangqi Local Game Engine
  const game = useXiangqiGame(audio, {
    isPaused: startMenuOpen || !hasSelectedMode,
    onMove: handleLocalMove,
    onWrongTurnClick: handleWrongTurnClick,
    onPerpetualCheckWarning: handlePerpetualCheckWarning,
    onGameEnd: handleLocalGameEnd
  });

  // Keep mobile screen awake during active match
  useScreenWakeLock(game.enableWakeLock, !game.isGameOver && hasSelectedMode);

  // Firebase Auth & Cloud Storage
  const {
    user,
    profile,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInGuest,
    signOutUser,
    resetPassword,
    refreshProfile
  } = useAuth();

  // Modals & Drawers Visibility State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState<boolean>(false);
  const [saveGameModalOpen, setSaveGameModalOpen] = useState<boolean>(false);
  const [refreshProfileTrigger, setRefreshProfileTrigger] = useState<number>(0);
  const [openingBookModalOpen, setOpeningBookModalOpen] = useState<boolean>(false);
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [resignModalOpen, setResignModalOpen] = useState<boolean>(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [lobbyInitialTab, setLobbyInitialTab] = useState<'lobby' | 'ranked' | 'create' | 'leaderboard' | 'code'>('ranked');
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<'dark' | 'light'>('dark');

  // Dual Elo state for local/guest and sync
  const [localEloStandard, setLocalEloStandard] = useState<number>(1200);
  const [localEloJieqi, setLocalEloJieqi] = useState<number>(1200);
  const [localStatsStandard, setLocalStatsStandard] = useState({ games: 0, wins: 0, losses: 0, draws: 0 });
  const [localStatsJieqi, setLocalStatsJieqi] = useState({ games: 0, wins: 0, losses: 0, draws: 0 });

  // Client-side hydration sync for saved preferences and URL query parameters
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedMode = localStorage.getItem('xiangqi_color_mode');
        if (savedMode === 'light' || savedMode === 'dark') {
          setColorMode(savedMode);
        }
        const savedStd = localStorage.getItem('xq_player_elo_standard') || localStorage.getItem('xq_player_elo');
        if (savedStd) setLocalEloStandard(parseInt(savedStd, 10));
        const savedJq = localStorage.getItem('xq_player_elo_jieqi');
        if (savedJq) setLocalEloJieqi(parseInt(savedJq, 10));
        const statsStd = localStorage.getItem('xq_player_stats_standard');
        if (statsStd) setLocalStatsStandard(JSON.parse(statsStd));
        const statsJq = localStorage.getItem('xq_player_stats_jieqi');
        if (statsJq) setLocalStatsJieqi(JSON.parse(statsJq));

        const params = new URLSearchParams(window.location.search);
        if (params.get('room')) {
          setStartMenuOpen(false);
          setIsOnlineModalOpen(true);
        }
      } catch {
        // ignore
      }
    });
  }, []);

  // Synchronize high-contrast theme attributes to html/body elements
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', colorMode);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(colorMode);
    }
  }, [colorMode]);

  const handleToggleColorMode = useCallback(() => {
    setColorMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('xiangqi_color_mode', next);
      } catch {}
      return next;
    });
  }, []);

  // Remote Move Handler for Multiplayer Socket
  const handleRemoteMove = useCallback((m: Move) => {
    game.executeMove(m, false, true);
  }, [game]);

  // Online Multiplayer WebSocket Hook
  const socket = useXiangqiSocket(handleRemoteMove);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  const recordedOnlineMatchIdRef = useRef<string | null>(null);
  const dismissedOnlineModalMatchRef = useRef<string | null>(null);

  // Synchronize Online Socket Room State into Game
  useEffect(() => {
    if (!socket.roomState || !socket.roomState.isGameStarted) {
      recordedOnlineMatchIdRef.current = null;
      dismissedOnlineModalMatchRef.current = null;
      return;
    }
    const rs = socket.roomState;
    const myC = socket.myColor;
    const g = gameRef.current;

    g.setGameMode('online');
    if (rs.variant && rs.variant !== g.variant) {
      g.setVariant(rs.variant);
    }
    queueMicrotask(() => {
      setHasSelectedMode(true);
      setIsOnlineModalOpen(false);
    });
    if (rs.moveHistory.length === 0 && !rs.isGameOver) {
      queueMicrotask(() => setIsConsoleCollapsed(true));
      setTimeout(() => {
        if (boardStageRef.current) {
          boardStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    }

    if (!g.animatingPiece) {
      g.setBoard(rs.board.map(r => [...r]));
    }
    g.setTurn(rs.turn);
    g.setMoveHistory(rs.moveHistory);
    g.setIsGameOver(rs.isGameOver);

    // Extract captured records with true identity and perspective
    const newCaps: import('@/hooks/useXiangqiGame').CapturedPieceRecord[] = [];
    for (let i = 0; i < rs.moveHistory.length; i++) {
      const rec = rs.moveHistory[i];
      if (rec.captured) {
        newCaps.push({
          id: `online_${i}_${rec.captured}`,
          actualCode: rec.capturedActual || rec.captured,
          capturedBy: (i % 2 === 0) ? 'r' : 'b',
          wasHidden: rec.captured.endsWith('_u')
        });
      }
    }
    g.setCapturedRecords(newCaps);

    if (myC) {
      g.setIsFlipped(myC === 'b');
    }

    if (rs.isGameOver && rs.winner) {
      const winner = rs.winner;
      const delta = myC === 'r' ? rs.redEloDelta : rs.blackEloDelta;
      const matchKey = `${rs.roomCode}_${rs.moveHistory.length}_${winner}`;

      // Cập nhật và lưu điểm Elo cho trận đấu online
      if (recordedOnlineMatchIdRef.current !== matchKey && typeof delta === 'number') {
        recordedOnlineMatchIdRef.current = matchKey;

        // Cập nhật và lưu điểm Elo cho trận đấu online theo đúng thể loại cờ
        const matchVariant = rs.variant || g.variant;
        const isJieqi = matchVariant === 'jieqi';

        if (isJieqi) {
          const currentLocalElo = profile?.eloJieqi || localEloJieqi;
          const nextElo = Math.max(800, currentLocalElo + delta);
          try {
            localStorage.setItem('xq_player_elo_jieqi', nextElo.toString());
            const statsStr = localStorage.getItem('xq_player_stats_jieqi');
            const stats = statsStr ? JSON.parse(statsStr) : { games: 0, wins: 0, losses: 0, draws: 0 };
            stats.games++;
            if (winner === myC) stats.wins++;
            else if (winner === 'draw') stats.draws++;
            else stats.losses++;
            localStorage.setItem('xq_player_stats_jieqi', JSON.stringify(stats));
            queueMicrotask(() => {
              setLocalEloJieqi(nextElo);
              setLocalStatsJieqi(stats);
            });
          } catch {
            queueMicrotask(() => setLocalEloJieqi(nextElo));
          }
        } else {
          const currentLocalElo = profile?.eloStandard || profile?.elo || localEloStandard;
          const nextElo = Math.max(800, currentLocalElo + delta);
          try {
            localStorage.setItem('xq_player_elo_standard', nextElo.toString());
            localStorage.setItem('xq_player_elo', nextElo.toString());
            const statsStr = localStorage.getItem('xq_player_stats_standard');
            const stats = statsStr ? JSON.parse(statsStr) : { games: 0, wins: 0, losses: 0, draws: 0 };
            stats.games++;
            if (winner === myC) stats.wins++;
            else if (winner === 'draw') stats.draws++;
            else stats.losses++;
            localStorage.setItem('xq_player_stats_standard', JSON.stringify(stats));
            queueMicrotask(() => {
              setLocalEloStandard(nextElo);
              setLocalStatsStandard(stats);
            });
          } catch {
            queueMicrotask(() => setLocalEloStandard(nextElo));
          }
        }

        // Lưu kết quả vào Firestore nếu đã đăng nhập
        if (user) {
          const oppPlayer = myC === 'r' ? rs.blackPlayer : rs.redPlayer;
          const resType = winner === 'draw' ? 'draw' : winner === myC ? 'win' : 'loss';
          recordMatchProgress(user.uid, {
            opponentName: oppPlayer?.name || 'Kỳ thủ Online',
            opponentType: 'online',
            playerColor: myC || 'r',
            result: resType,
            movesCount: rs.moveHistory.length,
            durationSeconds: rs.timeLimit,
            date: new Date().toISOString(),
            eloChange: delta,
            variant: isJieqi ? 'jieqi' : 'standard'
          }).then(() => {
            refreshProfile();
          }).catch(err => {
            console.error('Lỗi cập nhật Elo trận online lên Firestore:', err);
          });
        }
      }

      // Hiển thị modal kết thúc ván nếu người chơi chưa chủ động đóng popup
      if (dismissedOnlineModalMatchRef.current !== matchKey) {
        if (winner === 'draw') {
          audio.current?.playDraw();
          g.setModalData({
            title: 'Hòa Cờ',
            desc: rs.gameOverReason || 'Hai bên đã đồng ý hòa ván đấu.',
            icon: '🤝',
            resultType: 'draw',
            eloDelta: delta
          });
        } else if (winner === myC) {
          audio.current?.playVictory();
          g.triggerBoardShake('check');
          g.setModalData({
            title: 'Chiến Thắng!',
            desc: rs.gameOverReason || 'Bạn đã giành chiến thắng vẻ vang!',
            icon: '🏆',
            resultType: 'victory',
            eloDelta: delta
          });
        } else {
          audio.current?.playDefeat();
          g.setModalData({
            title: 'Thất Bại',
            desc: rs.gameOverReason || 'Đối thủ đã giành chiến thắng.',
            icon: '🍂',
            resultType: 'defeat',
            eloDelta: delta
          });
        }
      }
    } else {
      recordedOnlineMatchIdRef.current = null;
      dismissedOnlineModalMatchRef.current = null;
      g.setModalData(null);
    }
  }, [socket.roomState, socket.myColor, user, profile?.elo, profile?.eloStandard, profile?.eloJieqi, localEloStandard, localEloJieqi, refreshProfile]);

  // Resilient cross-browser clipboard helper for mobile Safari / Android WebViews
  const copyToClipboard = useCallback(async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback below
      }
    }
    if (typeof document !== 'undefined') {
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
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  // FEN String & Copy State
  const [copiedFen, setCopiedFen] = useState<boolean>(false);
  const currentFen = useMemo(() => boardToFen(game.displayBoard, game.turn), [game.displayBoard, game.turn]);
  const handleCopyFen = useCallback(() => {
    copyToClipboard(currentFen);
    setCopiedFen(true);
    showToast('Đã sao chép chuỗi thế cờ FEN!');
    setTimeout(() => setCopiedFen(false), 2000);
  }, [currentFen, copyToClipboard, showToast]);

  // Share Room Link (Supports native mobile Web Share API + Clipboard fallback)
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const handleShareRoom = useCallback(() => {
    if (typeof window !== 'undefined' && socket.roomState?.roomCode) {
      const shareUrl = `${window.location.origin}?room=${socket.roomState.roomCode}`;
      copyToClipboard(shareUrl);
      setCopiedShareLink(true);
      showToast('Đã sao chép liên kết mời vào phòng chơi!');
      setTimeout(() => setCopiedShareLink(false), 2500);
      if (typeof navigator !== 'undefined' && navigator.share && window.matchMedia('(max-width: 767px)').matches) {
        navigator.share({
          title: 'Cờ Tướng - Xiangqi Master',
          text: `Mời bạn vào bàn cờ #${socket.roomState.roomCode} đấu Cờ Tướng cùng mình!`,
          url: shareUrl
        }).catch(() => {});
      }
    }
  }, [socket.roomState, copyToClipboard, showToast]);

  // Record Match Outcome to Firebase & Local Storage
  const recordMatchOutcome = useCallback(async (result: 'win' | 'loss' | 'draw', turnsCount: number) => {
    const oppType: 'ai' | 'pvp' | 'online' =
      game.gameMode === 'online' ? 'online' : game.gameMode === 'pvp' ? 'pvp' : 'ai';
    const eloDelta = result === 'win' ? 15 : result === 'loss' ? -12 : 2;
    const isJq = game.variant === 'jieqi';

    // Cập nhật điểm Elo & thống kê cục bộ (cho cả khách và tài khoản)
    try {
      if (isJq) {
        const cur = profile?.eloJieqi || localEloJieqi;
        const next = Math.max(800, cur + eloDelta);
        setLocalEloJieqi(next);
        localStorage.setItem('xq_player_elo_jieqi', next.toString());
        const statsStr = localStorage.getItem('xq_player_stats_jieqi');
        const stats = statsStr ? JSON.parse(statsStr) : { games: 0, wins: 0, losses: 0, draws: 0 };
        stats.games++;
        if (result === 'win') stats.wins++;
        else if (result === 'loss') stats.losses++;
        else stats.draws++;
        localStorage.setItem('xq_player_stats_jieqi', JSON.stringify(stats));
        setLocalStatsJieqi(stats);
      } else {
        const cur = profile?.eloStandard || profile?.elo || localEloStandard;
        const next = Math.max(800, cur + eloDelta);
        setLocalEloStandard(next);
        localStorage.setItem('xq_player_elo_standard', next.toString());
        localStorage.setItem('xq_player_elo', next.toString());
        const statsStr = localStorage.getItem('xq_player_stats_standard');
        const stats = statsStr ? JSON.parse(statsStr) : { games: 0, wins: 0, losses: 0, draws: 0 };
        stats.games++;
        if (result === 'win') stats.wins++;
        else if (result === 'loss') stats.losses++;
        else stats.draws++;
        localStorage.setItem('xq_player_stats_standard', JSON.stringify(stats));
        setLocalStatsStandard(stats);
      }
    } catch {}

    if (!user) return;
    try {
      await recordMatchProgress(user.uid, {
        opponentName:
          game.gameMode === 'online'
            ? 'Kỳ thủ Online'
            : game.gameMode === 'pvp'
            ? 'Người chơi 2'
            : `Máy (${game.difficulty})`,
        opponentType: oppType,
        difficulty: game.difficulty,
        playerColor: game.turn,
        result,
        movesCount: turnsCount,
        durationSeconds: 120,
        date: new Date().toISOString(),
        eloChange: eloDelta,
        variant: isJq ? 'jieqi' : 'standard'
      });
      setRefreshProfileTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Lỗi lưu kết quả trận đấu:', err);
    }
  }, [user, game.gameMode, game.difficulty, game.turn, game.variant, profile, localEloStandard, localEloJieqi]);

  useEffect(() => {
    recordMatchOutcomeRef.current = recordMatchOutcome;
  }, [recordMatchOutcome]);

  // Tự động thu nhỏ bảng điều khiển bên phải khi bắt đầu/đang trong trận đấu và mở rộng lại khi kết thúc trận đấu
  useEffect(() => {
    if (game.isGameOver) {
      queueMicrotask(() => setIsConsoleCollapsed(false));
    } else if (!startMenuOpen && (hasSelectedMode || game.moveHistory.length > 0)) {
      queueMicrotask(() => setIsConsoleCollapsed(true));
    }
  }, [game.isGameOver, startMenuOpen, hasSelectedMode, game.moveHistory.length]);

  // GameOverModal Action Handlers (Bảo đảm không bị đơ hoặc kẹt lặp lại)
  const handleCloseGameOverModal = useCallback(() => {
    if (socket.roomState) {
      const matchKey = `${socket.roomState.roomCode}_${socket.roomState.moveHistory.length}_${socket.roomState.winner}`;
      dismissedOnlineModalMatchRef.current = matchKey;
    }
    game.setModalData(null);
  }, [socket.roomState, game]);

  const handleGameOverNewGame = useCallback(() => {
    if (socket.roomState) {
      const matchKey = `${socket.roomState.roomCode}_${socket.roomState.moveHistory.length}_${socket.roomState.winner}`;
      dismissedOnlineModalMatchRef.current = matchKey;
      socket.leaveRoom();
    }
    game.setModalData(null);
    setIsConsoleCollapsed(true);

    if (game.gameMode === 'online') {
      game.setGameMode('pve-red');
      game.startNewGame('pve-red');
      showToast('Đã bắt đầu ván mới với máy');
    } else {
      game.startNewGame();
      showToast('Đã bắt đầu ván cờ mới!');
    }
    setTimeout(() => {
      if (boardStageRef.current) {
        boardStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  }, [socket, game, showToast]);

  const handleGameOverRematch = useCallback(() => {
    if (socket.roomState) {
      const matchKey = `${socket.roomState.roomCode}_${socket.roomState.moveHistory.length}_${socket.roomState.winner}`;
      dismissedOnlineModalMatchRef.current = matchKey;
    }
    socket.requestRematch();
    showToast('Đã gửi lời mời đấu lại tới đối thủ!');
  }, [socket, showToast]);

  const handleCreateOnlineRoom = useCallback(() => {
    if (socket.roomState) {
      const matchKey = `${socket.roomState.roomCode}_${socket.roomState.moveHistory.length}_${socket.roomState.winner}`;
      dismissedOnlineModalMatchRef.current = matchKey;
      socket.leaveRoom();
    }
    game.setModalData(null);
    game.startNewGame('online');
    setLobbyInitialTab('create');
    setIsOnlineModalOpen(true);
  }, [socket, game]);

  // Online rematch states
  const rematchRequested = socket.roomState?.rematchRequested || null;
  const rematchRequestedByOpponent = !!(rematchRequested && rematchRequested !== socket.myColor);
  const myRematchRequested = !!(rematchRequested && rematchRequested === socket.myColor);

  // Save / Resume Game Cloud Actions
  const handleSaveGame = async (name: string) => {
    if (!user) {
      setAuthModalOpen(true);
      throw new Error('Vui lòng đăng nhập để lưu ván cờ.');
    }
    await saveGameState(user.uid, {
      name,
      gameMode: game.gameMode,
      turn: game.turn,
      boardJson: JSON.stringify(game.board),
      movesJson: JSON.stringify(game.moveHistory),
      capturedRed: game.capturedRed,
      capturedBlack: game.capturedBlack,
      difficulty: game.difficulty,
      timeLimit: game.timeLimit
    });
    setRefreshProfileTrigger(prev => prev + 1);
    showToast(`Đã lưu ván cờ "${name}" lên đám mây!`);
  };

  const handleResumeSavedGame = (savedGame: SavedGameData) => {
    try {
      const loadedBoard = JSON.parse(savedGame.boardJson);
      const loadedMoves = JSON.parse(savedGame.movesJson);
      game.setBoard(loadedBoard);
      game.setMoveHistory(loadedMoves);
      game.setTurn(savedGame.turn);
      const restoredCaps: import('@/hooks/useXiangqiGame').CapturedPieceRecord[] = [];
      (savedGame.capturedRed || []).forEach((c, idx) => {
        restoredCaps.push({
          id: `saved_r_${idx}`,
          actualCode: c,
          capturedBy: 'b',
          wasHidden: false
        });
      });
      (savedGame.capturedBlack || []).forEach((c, idx) => {
        restoredCaps.push({
          id: `saved_b_${idx}`,
          actualCode: c,
          capturedBy: 'r',
          wasHidden: false
        });
      });
      game.setCapturedRecords(restoredCaps);
      setHasSelectedMode(true);
      game.setGameMode(savedGame.gameMode as any || 'pve-red');
      if (savedGame.difficulty) game.setDifficulty(savedGame.difficulty as any);
      if (savedGame.timeLimit) game.setTimeLimit(savedGame.timeLimit);
      game.setIsGameOver(false);
      game.setModalData(null);
      setIsConsoleCollapsed(true);
      setUserDrawerOpen(false);
      showToast(`Đã mở lại ván cờ "${savedGame.name}"!`);
      setTimeout(() => {
        if (boardStageRef.current) {
          boardStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } catch (err) {
      console.error('Lỗi nạp ván cờ:', err);
      showToast('Không thể nạp ván cờ đã lưu.');
    }
  };

  // Flexible BoardSideTray position based on viewport ratio (requires >= 640px width so mobile virtual keyboard doesn't crush the board)
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  useEffect(() => {
    const handleOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsLandscape(window.innerWidth >= 640 && window.innerHeight < window.innerWidth);
      }
    };
    handleOrientation();
    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  // Measure chessboard dimensions to ensure BoardSideTray matches board length (height) on sides, and board width on top/bottom
  const boardStageRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const scrollToBoard = useCallback(() => {
    setTimeout(() => {
      if (boardStageRef.current) {
        boardStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  }, []);

  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el) {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (w > 0 && h > 0) {
          setBoardSize(prev => {
            if (prev.width === w && prev.height === h) return prev;
            return { width: w, height: h };
          });
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(el);

    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Player Names & Info
  const isRedAtBottom = !game.isFlipped;
  const bottomPlayerName =
    game.gameMode === 'online'
      ? (isRedAtBottom ? socket.roomState?.redPlayer?.name : socket.roomState?.blackPlayer?.name) || 'Bạn'
      : isRedAtBottom
      ? (game.gameMode === 'pvp' ? 'Người chơi 1 (Đỏ)' : (user?.displayName || 'Bạn'))
      : (game.gameMode === 'pvp' ? 'Người chơi 2 (Đen)' : (game.gameMode === 'pve-black' ? `Máy (${game.difficulty.toUpperCase()})` : 'P2'));

  const topPlayerName =
    game.gameMode === 'online'
      ? (!isRedAtBottom ? socket.roomState?.redPlayer?.name : socket.roomState?.blackPlayer?.name) || 'Đối thủ'
      : !isRedAtBottom
      ? (game.gameMode === 'pvp' ? 'Người chơi 1 (Đỏ)' : (user?.displayName || 'Bạn'))
      : (game.gameMode === 'pvp' ? 'Người chơi 2 (Đen)' : (game.gameMode === 'pve-red' ? `Máy (${game.difficulty.toUpperCase()})` : 'P2'));

  const bottomTimerValue = game.gameMode === 'online'
    ? (isRedAtBottom ? socket.roomState?.redTimer || 0 : socket.roomState?.blackTimer || 0)
    : game.bottomTimer;

  const topTimerValue = game.gameMode === 'online'
    ? (!isRedAtBottom ? socket.roomState?.redTimer || 0 : socket.roomState?.blackTimer || 0)
    : game.topTimer;

  // Dual Elo calculations for Cờ Ngửa and Cờ Úp
  const eloStd = profile?.eloStandard ?? profile?.elo ?? localEloStandard;
  const eloJq = profile?.eloJieqi ?? localEloJieqi;
  const activeUserElo = game.variant === 'jieqi' ? eloJq : eloStd;

  const statsStandardData = {
    elo: eloStd,
    games: profile?.gamesPlayedStandard ?? profile?.gamesPlayed ?? localStatsStandard.games,
    wins: profile?.winsStandard ?? profile?.wins ?? localStatsStandard.wins,
    losses: profile?.lossesStandard ?? profile?.losses ?? localStatsStandard.losses,
    draws: profile?.drawsStandard ?? profile?.draws ?? localStatsStandard.draws,
    winRate: profile?.winRateStandard ?? profile?.winRate ?? ((profile?.gamesPlayedStandard ?? localStatsStandard.games) > 0 ? Math.round(((profile?.winsStandard ?? localStatsStandard.wins) / (profile?.gamesPlayedStandard ?? localStatsStandard.games)) * 100) : 0),
  };

  const statsJieqiData = {
    elo: eloJq,
    games: profile?.gamesPlayedJieqi ?? localStatsJieqi.games,
    wins: profile?.winsJieqi ?? localStatsJieqi.wins,
    losses: profile?.lossesJieqi ?? localStatsJieqi.losses,
    draws: profile?.drawsJieqi ?? localStatsJieqi.draws,
    winRate: profile?.winRateJieqi ?? ((profile?.gamesPlayedJieqi ?? localStatsJieqi.games) > 0 ? Math.round(((profile?.winsJieqi ?? localStatsJieqi.wins) / (profile?.gamesPlayedJieqi ?? localStatsJieqi.games)) * 100) : 0),
  };

  return (
    <div
      suppressHydrationWarning
      data-theme={colorMode}
      className={`min-h-screen min-h-[100dvh] flex flex-col pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] px-[max(0.5rem,env(safe-area-inset-left))] sm:p-4 select-none overflow-x-hidden font-sans transition-colors duration-200 ${colorMode} ${
        colorMode === 'dark'
          ? 'bg-[#0E131B] text-slate-100'
          : 'bg-[#F4F5F7] text-slate-900'
      }`}
    >
      {/* Top Application Header */}
      <GameHeader
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
        onShareRoom={handleShareRoom}
        copiedShareLink={copiedShareLink}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenProfileDrawer={() => setUserDrawerOpen(true)}
        onOpenOnlineLobby={() => {
          setLobbyInitialTab('ranked');
          setIsOnlineModalOpen(true);
        }}
        onOpenMenu={() => setSettingsModalOpen(true)}
        user={user}
        userElo={activeUserElo}
        userName={user?.displayName || profile?.displayName || 'Kỳ Thủ'}
        isOnlineGame={game.gameMode === 'online'}
      />

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-3 sm:gap-4 lg:gap-6 px-1.5 sm:px-4">
        {/* Left Column: Board & Players */}
        <div ref={boardStageRef} className="w-full max-w-[640px] sm:max-w-[680px] lg:max-w-[720px] flex flex-col items-center shrink-0 gap-2 sm:gap-2.5">
          {/* Top Player Block */}
          <div className="w-full">
            <PlayerBlock
              isActive={game.turn === (isRedAtBottom ? 'b' : 'r') && !game.isGameOver}
              isRed={!isRedAtBottom}
              avatarChar={!isRedAtBottom ? '帥' : '將'}
              title={topPlayerName}
              badgeLabel={
                game.gameMode === 'online'
                  ? 'Đối thủ'
                  : game.gameMode === 'pvp'
                  ? (!isRedAtBottom ? 'P1' : 'P2')
                  : game.gameMode.startsWith('pve') && !isRedAtBottom
                  ? `Máy (${game.difficulty.toUpperCase()})`
                  : 'P2'
              }
              capturedPieces={isRedAtBottom ? game.capturedRed : game.capturedBlack}
              timer={topTimerValue}
              timeLimit={game.gameMode === 'online' ? (socket.roomState?.timeLimit || 900) : game.timeLimit}
              formatSec={(s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`}
              elo={game.gameMode === 'online' ? (isRedAtBottom ? socket.roomState?.blackPlayer?.elo : socket.roomState?.redPlayer?.elo) : activeUserElo}
              theme={game.theme}
              isTimerRunning={!game.isGameOver && (game.gameMode === 'online' ? ((socket.roomState?.moveHistory?.length ?? 0) > 0) : (game.timeLimit > 0 && game.moveHistory.length > 0))}
              turnTimer={game.gameMode === 'online' ? socket.roomState?.turnTimer : undefined}
              moveTimeLimit={game.gameMode === 'online' ? (socket.roomState?.moveTimeLimit || 60) : 60}
              isCheck={game.isCheck && game.turn === (isRedAtBottom ? 'b' : 'r')}
              gameMode={game.gameMode}
              otherPlayerName={bottomPlayerName}
              colorMode={colorMode}
            />
          </div>



          {/* Top Captured Tray (when in portrait/compact screen: width == board width) */}
          {!isLandscape && (
            <div className="w-full flex justify-center">
              <BoardSideTray
                playerColor={isRedAtBottom ? 'b' : 'r'}
                playerName={topPlayerName}
                pieces={isRedAtBottom ? game.capturedRed : game.capturedBlack}
                theme={game.theme}
                orientation="horizontal"
                style={boardSize.width > 0 ? { width: `${boardSize.width}px` } : undefined}
                className="max-w-[560px] sm:max-w-[600px] md:max-w-[640px]"
                colorMode={colorMode}
              />
            </div>
          )}

          {/* Chessboard & Side Trays */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
            {isLandscape && (
              <BoardSideTray
                playerColor={isRedAtBottom ? 'b' : 'r'}
                playerName={topPlayerName}
                pieces={isRedAtBottom ? game.capturedRed : game.capturedBlack}
                theme={game.theme}
                orientation="vertical"
                style={boardSize.height > 0 ? { height: `${boardSize.height}px` } : undefined}
                colorMode={colorMode}
              />
            )}

            <XiangqiBoard
              boardRef={boardContainerRef}
              board={game.displayBoard}
              theme={game.theme}
              isFlipped={game.isFlipped}
              selectedSquare={game.selectedSquare}
              validMoves={game.validMoves}
              lastMove={
                game.inspectMoveIndex !== null && game.moveHistory[game.inspectMoveIndex]
                  ? game.moveHistory[game.inspectMoveIndex].move
                  : game.lastMove
              }
              turn={game.turn}
              isCheck={game.isCheck}
              isInspecting={game.inspectMoveIndex !== null}
              disabled={
                game.isAiThinking ||
                (game.gameMode === 'online' && (
                  !socket.roomState?.isGameStarted ||
                  game.turn !== socket.myColor ||
                  socket.isSpectator
                ))
              }
              onSquareClick={game.handleSquareClick}
              onExecuteMove={game.executeMove}
              animatingPiece={game.animatingPiece}
              animatingPieceRef={game.animatingPieceRef}
              landingEffect={game.landingEffect}
              boardShake={game.enableHaptics ? game.boardShake : null}
              cannonJumpAnim={game.cannonJumpAnim}
              onCannonImpact={() => {
                game.triggerBoardShake('capture');
              }}
              onCannonComplete={() => game.setCannonJumpAnim(null)}
              chariotChargeAnim={game.chariotChargeAnim}
              onChariotImpact={() => {
                game.triggerBoardShake('capture');
              }}
              onChariotComplete={() => game.setChariotChargeAnim(null)}
              horseKickAnim={game.horseKickAnim}
              onHorseImpact={() => {
                game.triggerBoardShake('capture');
              }}
              onHorseComplete={() => game.setHorseKickAnim(null)}
              justRevealedSquare={game.justRevealedSquare}
            />

            {isLandscape && (
              <BoardSideTray
                playerColor={isRedAtBottom ? 'r' : 'b'}
                playerName={bottomPlayerName}
                pieces={isRedAtBottom ? game.capturedBlack : game.capturedRed}
                theme={game.theme}
                orientation="vertical"
                style={boardSize.height > 0 ? { height: `${boardSize.height}px` } : undefined}
                colorMode={colorMode}
              />
            )}
          </div>

          {/* Bottom Captured Tray (when in portrait/compact screen: width == board width) */}
          {!isLandscape && (
            <div className="w-full flex justify-center">
              <BoardSideTray
                playerColor={isRedAtBottom ? 'r' : 'b'}
                playerName={bottomPlayerName}
                pieces={isRedAtBottom ? game.capturedBlack : game.capturedRed}
                theme={game.theme}
                orientation="horizontal"
                style={boardSize.width > 0 ? { width: `${boardSize.width}px` } : undefined}
                className="max-w-[560px] sm:max-w-[600px] md:max-w-[640px]"
                colorMode={colorMode}
              />
            </div>
          )}

          {/* Bottom Player Block - Khung kết hợp bên dưới */}
          <div className="w-full">
            <PlayerBlock
              isActive={game.turn === (isRedAtBottom ? 'r' : 'b') && !game.isGameOver}
              isRed={isRedAtBottom}
              avatarChar={isRedAtBottom ? '帥' : '將'}
              title={bottomPlayerName}
              badgeLabel={
                game.gameMode === 'online'
                  ? 'Bạn'
                  : game.gameMode === 'pvp'
                  ? (isRedAtBottom ? 'P1' : 'P2')
                  : isRedAtBottom
                  ? 'Bạn'
                  : `Máy (${game.difficulty.toUpperCase()})`
              }
              capturedPieces={isRedAtBottom ? game.capturedBlack : game.capturedRed}
              timer={bottomTimerValue}
              timeLimit={game.gameMode === 'online' ? (socket.roomState?.timeLimit || 900) : game.timeLimit}
              formatSec={(s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`}
              elo={game.gameMode === 'online' ? (isRedAtBottom ? socket.roomState?.redPlayer?.elo : socket.roomState?.blackPlayer?.elo) : activeUserElo}
              theme={game.theme}
              isTimerRunning={!game.isGameOver && (game.gameMode === 'online' ? ((socket.roomState?.moveHistory?.length ?? 0) > 0) : (game.timeLimit > 0 && game.moveHistory.length > 0))}
              turnTimer={game.gameMode === 'online' ? socket.roomState?.turnTimer : undefined}
              moveTimeLimit={game.gameMode === 'online' ? (socket.roomState?.moveTimeLimit || 60) : 60}
              isCheck={game.isCheck && game.turn === (isRedAtBottom ? 'r' : 'b')}
              gameMode={game.gameMode}
              otherPlayerName={topPlayerName}
              isInspecting={game.inspectMoveIndex !== null}
              inspectMoveIndex={game.inspectMoveIndex}
              onExitInspect={() => game.setInspectMoveIndex(null)}
              opponentDisconnected={socket.opponentDisconnected}
              opponentGraceSeconds={socket.opponentGraceSeconds}
              colorMode={colorMode}
            />
          </div>

        </div>

        {/* Right Column: Unified Single-Card Game Console */}
        <div
          id="game-console-dock"
          className={`transition-all duration-150 ease-out flex justify-center shrink-0 self-center lg:self-start mx-auto lg:mx-0 rounded-xl ${
            isConsoleCollapsed
              ? 'w-full max-w-[420px] lg:w-12 lg:max-w-[48px]'
              : 'w-full max-w-[420px] lg:w-[440px] lg:max-w-[440px]'
          } ${
            consoleDockHighlight
              ? 'ring-2 ring-amber-500 scale-[1.01]'
              : ''
          }`}
        >
          <UnifiedGameConsole
            variant={game.variant}
            onChangeVariant={(newV) => {
              game.handleToggleVariant(newV);
              setIsConsoleCollapsed(true);
              showToast(`Đã chuyển sang chế độ ${newV === 'jieqi' ? 'Cờ Úp (Jieqi)' : 'Cờ Ngửa'}!`);
              scrollToBoard();
            }}
            eloStandard={eloStd}
            eloJieqi={eloJq}
            statsStandard={statsStandardData}
            statsJieqi={statsJieqiData}
            onOpenProfile={() => setUserDrawerOpen(true)}
            onOpenLeaderboard={() => {
              setLobbyInitialTab('leaderboard');
              setIsOnlineModalOpen(true);
            }}
            gameMode={hasSelectedMode ? game.gameMode : null}
            onChangeGameMode={(m) => {
              setHasSelectedMode(true);
              if (m === 'online') {
                setLobbyInitialTab('ranked');
                setIsOnlineModalOpen(true);
              } else {
                if (game.gameMode === 'online') socket.leaveRoom();
                game.setGameMode(m);
                game.startNewGame(m);
                setIsConsoleCollapsed(true);
                scrollToBoard();
              }
            }}
            difficulty={game.difficulty}
            onChangeDifficulty={(d) => {
              game.setDifficulty(d);
              showToast(`Đã đổi độ khó AI: ${d.toUpperCase()}`);
              scrollToBoard();
            }}
            timeLimit={game.timeLimit}
            onChangeTimeLimit={(t) => {
              game.setTimeLimit(t);
              game.startNewGame();
              setIsConsoleCollapsed(true);
              scrollToBoard();
            }}
            autoFlip={game.autoFlip}
            onToggleAutoFlip={game.setAutoFlip}
            onUndo={game.handleUndo}
            canUndo={game.moveHistory.length > 0 && !game.isAiThinking && !game.isGameOver}
            onResign={() => {
              if (game.gameMode === 'online') {
                setResignModalOpen(true);
              } else {
                game.setIsGameOver(true);
                setIsConsoleCollapsed(false);
                audio.current?.playDefeat();
                game.setModalData({
                  title: 'Đầu Hàng',
                  desc: `Bên ${game.turn === 'r' ? 'Đỏ' : 'Đen'} đã xin hàng.`,
                  icon: '🏳️'
                });
                recordMatchOutcome('loss', Math.ceil(game.moveHistory.length / 2));
              }
            }}
            canResign={!game.isGameOver}
            onNewGame={handleGameOverNewGame}
            isOnlineGame={game.gameMode === 'online'}
            isGameOver={game.isGameOver}
            drawOfferedByOpponent={socket.incomingDrawOffer}
            onOfferDraw={() => socket.offerDraw()}
            onAcceptDraw={() => socket.respondDraw(true)}
            onLeaveRoom={() => {
              socket.leaveRoom();
              game.setGameMode('pve-red');
              game.startNewGame('pve-red');
              setIsConsoleCollapsed(true);
            }}
            onRequestRematch={handleGameOverRematch}
            rematchRequestedByOpponent={rematchRequestedByOpponent}
            myRematchRequested={myRematchRequested}
            onCreateOnlineRoom={handleCreateOnlineRoom}
            moveHistory={game.moveHistory}
            inspectMoveIndex={game.inspectMoveIndex}
            onSelectMove={(idx) => game.setInspectMoveIndex(idx)}
            onExitInspect={() => game.setInspectMoveIndex(null)}
            theme={game.theme}
            fenString={currentFen}
            onCopyFen={handleCopyFen}
            copiedFen={copiedFen}
            chatMessages={socket.chatMessages}
            onSendMessage={(txt, isQuick) => socket.sendChat(txt, isQuick)}
            spectatorCount={socket.roomState?.spectators.length}
            isSpectator={socket.isSpectator}
            colorMode={colorMode}
            isCollapsed={isConsoleCollapsed}
            onToggleCollapse={() => setIsConsoleCollapsed(prev => !prev)}
            isHiddenBeforeDock={!isConsoleDocked && startMenuOpen}
          />
        </div>
      </main>

      {/* Game Modals & Drawers */}
      <StartGameMenuModal
        isOpen={startMenuOpen}
        onClose={() => {
          setIsConsoleDocked(true);
          setStartMenuOpen(false);
          setIsConsoleCollapsed(true);
        }}
        variant={game.variant}
        onChangeVariant={(newV) => {
          game.handleToggleVariant(newV);
        }}
        gameMode={hasSelectedMode ? game.gameMode : null}
        onChangeGameMode={(m) => {
          setHasSelectedMode(true);
          if (m === 'online') {
            setStartMenuOpen(false);
            setIsConsoleCollapsed(true);
            setLobbyInitialTab('ranked');
            setIsOnlineModalOpen(true);
          } else {
            if (game.gameMode === 'online') socket.leaveRoom();
            game.setGameMode(m);
            game.startNewGame(m);
            setIsConsoleCollapsed(true);
          }
        }}
        difficulty={game.difficulty}
        onChangeDifficulty={(d) => {
          game.setDifficulty(d);
        }}
        eloStandard={eloStd}
        eloJieqi={eloJq}
        statsStandard={statsStandardData}
        statsJieqi={statsJieqiData}
        onOpenProfile={() => setUserDrawerOpen(true)}
        onOpenLeaderboard={() => {
          setLobbyInitialTab('leaderboard');
          setIsOnlineModalOpen(true);
        }}
        onStartGame={() => {
          if (!hasSelectedMode) {
            showToast('Vui lòng chọn chế độ đấu đối kháng trước khi bắt đầu!');
            return;
          }
          setIsConsoleDocked(true);
          setStartMenuOpen(false);
          if (game.gameMode === 'online') {
            setLobbyInitialTab('ranked');
            setIsOnlineModalOpen(true);
          } else {
            game.startNewGame(game.gameMode, game.variant);
            setIsConsoleCollapsed(true);
            showToast(
              `Bắt đầu ván mới: ${game.variant === 'jieqi' ? 'Cờ Úp' : 'Cờ Ngửa'} · ${
                game.gameMode === 'pvp' ? 'Đấu 2 người (local)' : `Đấu với máy (${game.difficulty.toUpperCase()})`
              }`
            );
            scrollToBoard();
          }
        }}
        onFlyToConsole={handleFlyToConsole}
        colorMode={colorMode}
      />

      <GameOverModal
        modalData={game.modalData}
        isOnline={game.gameMode === 'online'}
        onClose={handleCloseGameOverModal}
        onNewGame={handleGameOverNewGame}
        onRematch={handleGameOverRematch}
        rematchRequestedByOpponent={rematchRequestedByOpponent}
        myRematchRequested={myRematchRequested}
        onCreateOnlineRoom={handleCreateOnlineRoom}
      />

      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

      <ResignModal
        isOpen={resignModalOpen}
        onConfirm={() => {
          socket.resign();
          setResignModalOpen(false);
        }}
        onCancel={() => setResignModalOpen(false)}
      />

      <DrawOfferModal
        isOpen={socket.incomingDrawOffer}
        onAccept={() => socket.respondDraw(true)}
        onDecline={() => socket.respondDraw(false)}
      />

      <OnlineLobbyModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        publicRooms={socket.publicRooms}
        leaderboard={socket.leaderboard}
        isLoadingRooms={socket.isLoadingRooms}
        isLoadingLeaderboard={socket.isLoadingLeaderboard}
        onRefreshRooms={socket.fetchLobbyRooms}
        onRefreshLeaderboard={socket.fetchLeaderboard}
        userElo={activeUserElo}
        eloStandard={eloStd}
        eloJieqi={eloJq}
        defaultVariant={game.variant}
        initialTab={lobbyInitialTab}
        onCreateRoom={(hostName, hostColor, limit, isPub, isRk, playerElo, onlineVariant, matchmake) => {
          game.setModalData(null);
          const effectiveElo = playerElo || (onlineVariant === 'jieqi' ? eloJq : eloStd);
          socket.createRoom(hostName, 'random', limit, isPub, true, effectiveElo, onlineVariant, !!matchmake);
          game.setTimeLimit(limit);
          game.startNewGame('online', onlineVariant);
        }}
        onJoinRoom={(code, name, asSpectator, playerElo) => {
          game.setModalData(null);
          socket.joinRoom(code, name, asSpectator, playerElo || activeUserElo);
          game.startNewGame('online');
        }}
        onLeaveRoom={() => {
          socket.leaveRoom();
          game.setGameMode('pve-red');
          game.startNewGame('pve-red');
          setIsConsoleCollapsed(true);
        }}
        roomState={socket.roomState}
        myColor={socket.myColor}
        errorMessage={socket.errorMessage}
        onClearError={socket.clearError}
        isConnected={socket.isConnected}
        onReconnect={socket.reconnect}
        theme={game.theme}
        colorMode={colorMode}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        signInWithEmail={signInWithEmail}
        signUpWithEmail={signUpWithEmail}
        signInWithGoogle={signInWithGoogle}
        signInGuest={signInGuest}
        resetPassword={resetPassword}
        initialTab="login"
        onSuccess={() => {
          showToast('Đăng nhập thành công! Hồ sơ đã được đồng bộ.');
          refreshProfile();
        }}
      />

      <UserProfileDrawer
        isOpen={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        profile={profile}
        onSignOut={() => {
          signOutUser();
          setUserDrawerOpen(false);
          showToast('Đã đăng xuất.');
        }}
        onResumeGame={handleResumeSavedGame}
        onSaveCurrentGame={() => {
          if (!user) {
            setAuthModalOpen(true);
            showToast('Vui lòng đăng nhập để lưu ván cờ');
            return;
          }
          setSaveGameModalOpen(true);
        }}
        refreshTrigger={refreshProfileTrigger}
        colorMode={colorMode}
      />

      <SaveGameModal
        isOpen={saveGameModalOpen}
        onClose={() => setSaveGameModalOpen(false)}
        onSave={handleSaveGame}
        defaultName={`Ván cờ - Nước ${game.moveHistory.length}`}
      />

      <OpeningBookModal
        isOpen={openingBookModalOpen}
        onClose={() => setOpeningBookModalOpen(false)}
        onSelectOpeningForNewGame={() => {
          setHasSelectedMode(true);
          game.setGameMode('pve-red');
          game.startNewGame('pve-red');
          setIsConsoleCollapsed(true);
          showToast('Đã bắt đầu ván cờ mới! Bạn cầm Đỏ thi triển thế cờ.');
          scrollToBoard();
        }}
      />

      {/* Cài đặt Menu: Bật/Tắt Tiếng, Hiệu ứng Quân cờ, Rung, Wake Lock, Giao diện, 4 Bàn Cờ */}
      <SettingsMenuModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        variant={game.variant}
        onToggleVariant={() => {
          const next = game.variant === 'standard' ? 'jieqi' : 'standard';
          game.handleToggleVariant(next);
          showToast(`Đã chuyển sang chế độ ${next === 'jieqi' ? 'Cờ Úp (Jieqi)' : 'Cờ Ngửa'}!`);
        }}
        isMuted={soundMuted}
        onToggleMute={handleToggleMute}
        enablePieceAnimations={game.enablePieceAnimations}
        onTogglePieceAnimations={game.toggleEnablePieceAnimations}
        enableHaptics={game.enableHaptics}
        onToggleHaptics={game.toggleEnableHaptics}
        enableWakeLock={game.enableWakeLock}
        onToggleWakeLock={game.toggleEnableWakeLock}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
        boardTheme={game.theme}
        onSelectBoardTheme={(t) => {
          game.setTheme(t);
          showToast(`Đã đổi bàn cờ: ${BOARD_THEME_LABELS[t]?.name || t}`);
        }}
        onOpenRules={() => setRulesOpen(true)}
        onOpenOpeningBook={() => setOpeningBookModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1b2230] border border-amber-400/80 text-amber-200 px-4 py-2 rounded-full text-xs font-bold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMsg}
        </div>
      )}

      {/* Semantic SEO Content for Search Crawlers (Cờ Tướng, Chơi Cờ, Ziga, Cờ Úp) */}
      <section aria-label="Giới thiệu Cờ Tướng và Cờ Úp Trực Tuyến" className="sr-only">
        <h1>Cờ Tướng - Xiangqi Master: Chơi Cờ Tướng &amp; Cờ Úp Online Miễn Phí Phong Cách Ziga</h1>
        <h2>Đấu Cờ Tướng Trực Tuyến Xếp Hạng Elo &amp; Chơi Cờ Cùng Bạn Bè</h2>
        <p>
          Trải nghiệm chơi cờ tướng (Xiangqi) và cờ úp (Jieqi) trực tuyến thời gian thực mượt mà như Ziga Cờ Tướng.
          Hệ thống tự động ghép trận đấu xếp hạng Elo công bằng, bảng xếp hạng Kỳ Vương, tạo phòng chơi cờ cùng bạn bè
          và theo dõi biên bản kỳ phổ chuẩn Việt Nam.
        </p>
        <h2>Chơi Cờ Tướng Với Máy AI Kiện Tướng &amp; Luyện Khai Cuộc Cờ Tướng</h2>
        <p>
          Rèn luyện kỹ năng đánh cờ tướng và cờ úp mỗi ngày với trí tuệ nhân tạo AI 4 cấp độ (Nhập môn, Cơ bản, Cao thủ,
          Kiện Tướng), kết hợp cẩm nang khai cuộc cờ tướng kinh điển như Pháo Đầu, Bình Phong Mã, Tiên Nhân Chỉ Lộ,
          Thuận Pháo và Nghịch Pháo.
        </p>
      </section>
    </div>
  );
}
