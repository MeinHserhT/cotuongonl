'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PieceColor,
  PIECES,
  INITIAL_BOARD,
  Move,
  MoveRecord,
  BoardTheme,
  BotDifficulty,
  GameVariant
} from '@/lib/xiangqi-types';
import {
  findGeneral,
  isKingInCheck,
  getLegalMoves,
  getAllLegalMoves,
  formatNotation,
  findCannonScreenPiece,
  countConsecutiveChecksSamePieceAndPos
} from '@/lib/xiangqi-rules';
import {
  createInitialJieqiGame,
  getJieqiLegalMoves,
  getAllJieqiLegalMoves,
  isJieqiKingInCheck,
  executeJieqiMove,
  formatJieqiNotation,
  isPieceHidden
} from '@/lib/jieqi-rules';
import { computeAIMoveAsync } from '@/lib/ai-worker-client';
import { triggerHaptic } from '@/lib/mobile-ergonomics';
import { AudioEngine } from '@/lib/audio';
import { CurveTrajectory, computeCurveTrajectory, computeStraightTrajectory } from '@/lib/trajectory';
import { CannonJumpData } from '@/components/CannonJumpAnimation';
import { ChariotChargeData } from '@/components/ChariotChargeAnimation';
import { HorseKickData } from '@/components/HorseKickAnimation';
import { AnimatingPieceData } from '@/components/XiangqiBoard';
import { GameOverModalData } from '@/components/GameModals';

export interface UseXiangqiGameOptions {
  initialVariant?: GameVariant;
  isPaused?: boolean;
  onMove?: (move: Move) => void;
  onMoveAttempt?: (move: Move) => boolean;
  onWrongTurnClick?: (clickedColor: PieceColor, currentTurn: PieceColor) => void;
  onPerpetualCheckWarning?: (count: number, color: PieceColor) => void;
}

export interface CapturedPieceRecord {
  id: string;
  actualCode: string;
  capturedBy: PieceColor;
  wasHidden: boolean;
}

export function useXiangqiGame(
  audioEngineRef: React.RefObject<AudioEngine | null>,
  options?: UseXiangqiGameOptions
) {
  const onMoveRef = useRef(options?.onMove);
  useEffect(() => {
    onMoveRef.current = options?.onMove;
  }, [options?.onMove]);

  const onWrongTurnClickRef = useRef(options?.onWrongTurnClick);
  useEffect(() => {
    onWrongTurnClickRef.current = options?.onWrongTurnClick;
  }, [options?.onWrongTurnClick]);

  const onPerpetualCheckWarningRef = useRef(options?.onPerpetualCheckWarning);
  useEffect(() => {
    onPerpetualCheckWarningRef.current = options?.onPerpetualCheckWarning;
  }, [options?.onPerpetualCheckWarning]);

  const onMoveAttemptRef = useRef(options?.onMoveAttempt);
  useEffect(() => {
    onMoveAttemptRef.current = options?.onMoveAttempt;
  }, [options?.onMoveAttempt]);

  // Game Variant State: 'standard' (Cờ Sáng) | 'jieqi' (Cờ Úp)
  const [variant, setVariant] = useState<GameVariant>(options?.initialVariant || 'standard');
  const [hiddenBoard, setHiddenBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: 10 }, () => Array(9).fill(null))
  );
  const [justRevealedSquare, setJustRevealedSquare] = useState<{ r: number; c: number } | null>(null);

  const [board, setBoard] = useState<(string | null)[][]>(() => INITIAL_BOARD.map(r => [...r]));
  const [turn, setTurn] = useState<PieceColor>('r');
  const [selectedSquare, setSelectedSquare] = useState<{ r: number; c: number } | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [hintMove, setHintMove] = useState<Move | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [inspectMoveIndex, setInspectMoveIndex] = useState<number | null>(null);

  // Danh sách quân bị ăn chi tiết
  const [capturedRecords, setCapturedRecords] = useState<CapturedPieceRecord[]>([]);

  // Animation States
  const [animatingPiece, setAnimatingPiece] = useState<AnimatingPieceData | null>(null);
  const animatingPieceRefState = useRef<boolean>(false);
  useEffect(() => {
    animatingPieceRefState.current = !!animatingPiece;
  }, [animatingPiece]);

  const [landingEffect, setLandingEffect] = useState<{ r: number; c: number; isCapture: boolean } | null>(null);
  const animatingPieceRef = useRef<HTMLDivElement | null>(null);
  const animatingShadowRef = useRef<HTMLDivElement | null>(null);

  const [boardShake, setBoardShake] = useState<'check' | 'capture' | null>(null);
  const [cannonJumpAnim, setCannonJumpAnim] = useState<CannonJumpData | null>(null);
  const [chariotChargeAnim, setChariotChargeAnim] = useState<ChariotChargeData | null>(null);
  const [horseKickAnim, setHorseKickAnim] = useState<HorseKickData | null>(null);
  const pendingMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Piece animations & Mobile Ergonomics toggles
  const [enablePieceAnimations, setEnablePieceAnimations] = useState<boolean>(true);
  const [enableHaptics, setEnableHaptics] = useState<boolean>(true);
  const [enableWakeLock, setEnableWakeLock] = useState<boolean>(true);

  // Match Configuration & Flow
  const [gameMode, setGameMode] = useState<'pve-red' | 'pve-black' | 'pvp' | 'online'>('pve-red');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [topTimer, setTopTimer] = useState<number>(60);
  const [bottomTimer, setBottomTimer] = useState<number>(60);
  const [autoFlip, setAutoFlip] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [theme, setThemeState] = useState<BoardTheme>('imperial');

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedAnim = localStorage.getItem('xiangqi_enable_piece_animations');
        if (savedAnim !== null) setEnablePieceAnimations(savedAnim === 'true');
        const savedHaptics = localStorage.getItem('xiangqi_enable_haptics');
        if (savedHaptics !== null) setEnableHaptics(savedHaptics === 'true');
        const savedWake = localStorage.getItem('xiangqi_enable_wakelock');
        if (savedWake !== null) setEnableWakeLock(savedWake === 'true');
        const savedTheme = localStorage.getItem('xiangqi_board_theme') as BoardTheme | null;
        if (savedTheme && ['imperial', 'zen', 'marble', 'lacquer'].includes(savedTheme)) {
          setThemeState(savedTheme);
        }
      } catch {
        // ignore
      }
    });
  }, []);

  const setTheme = useCallback((next: BoardTheme | ((prev: BoardTheme) => BoardTheme)) => {
    setThemeState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem('xiangqi_board_theme', resolved);
      } catch {}
      return resolved;
    });
  }, []);

  const toggleEnablePieceAnimations = useCallback(() => {
    setEnablePieceAnimations((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('xiangqi_enable_piece_animations', String(next));
      } catch {}
      return next;
    });
  }, []);

  const enableHapticsRef = useRef<boolean>(enableHaptics);
  useEffect(() => {
    enableHapticsRef.current = enableHaptics;
    if (!enableHaptics) {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = null;
      }
      setBoardShake(null);
    }
  }, [enableHaptics]);

  const toggleEnableHaptics = useCallback(() => {
    setEnableHaptics((prev) => {
      const next = !prev;
      enableHapticsRef.current = next;
      try {
        localStorage.setItem('xiangqi_enable_haptics', String(next));
      } catch {}
      if (next) {
        triggerHaptic('select', true);
      } else {
        if (shakeTimeoutRef.current) {
          clearTimeout(shakeTimeoutRef.current);
          shakeTimeoutRef.current = null;
        }
        setBoardShake(null);
      }
      return next;
    });
  }, []);

  const toggleEnableWakeLock = useCallback(() => {
    setEnableWakeLock((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('xiangqi_enable_wakelock', String(next));
      } catch {}
      return next;
    });
  }, []);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [modalData, setModalData] = useState<GameOverModalData | null>(null);

  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBoardShake = useCallback((type: 'check' | 'capture') => {
    if (!enableHapticsRef.current) {
      setBoardShake(null);
      return;
    }
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    setBoardShake(null);
    requestAnimationFrame(() => {
      if (!enableHapticsRef.current) return;
      setBoardShake(type);
      shakeTimeoutRef.current = setTimeout(() => {
        setBoardShake(null);
        shakeTimeoutRef.current = null;
      }, 350);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  // Board display accounting for history inspection
  const displayBoard = inspectMoveIndex !== null && moveHistory[inspectMoveIndex]
    ? (moveHistory[inspectMoveIndex].boardAfter || moveHistory[inspectMoveIndex].boardSnapshot || board)
    : board;

  const isCheck = !isGameOver && (
    variant === 'jieqi' ? isJieqiKingInCheck(displayBoard, turn) : isKingInCheck(displayBoard, turn)
  );

  // Parabolic Trajectory Animation Frame Loop
  useEffect(() => {
    if (!animatingPiece) return;

    let animId: number;
    const { trajectory, duration, startTime } = animatingPiece;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      const pt = trajectory.getPoint(t);

      if (animatingPieceRef.current) {
        animatingPieceRef.current.style.left = `${pt.pctX}%`;
        animatingPieceRef.current.style.top = `${pt.pctY}%`;
        animatingPieceRef.current.style.transform = `translate(-50%, -50%) scale(${pt.scale})`;
        animatingPieceRef.current.style.boxShadow = `0 ${pt.shadowOffsetY}px ${pt.shadowBlur}px rgba(0,0,0,0.55), inset 0 2px 4px #ffffff`;
      }

      if (animatingShadowRef.current) {
        animatingShadowRef.current.style.left = `${pt.groundPctX}%`;
        animatingShadowRef.current.style.top = `${pt.groundPctY}%`;
        animatingShadowRef.current.style.opacity = `${0.45 * (1 - pt.lift * 0.4)}`;
        animatingShadowRef.current.style.transform = `translate(-50%, -50%) scale(${1 - pt.lift * 0.25})`;
      }

      if (t < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [animatingPiece]);

  const handleTimeOut = useCallback((color: PieceColor) => {
    setIsGameOver(true);
    audioEngineRef.current?.playDefeat();
    setModalData({
      title: 'Hết giờ!',
      desc: `Bên ${color === 'r' ? 'Đỏ' : 'Đen'} đã hết thời gian đi quân. Bên ${color === 'r' ? 'Đen' : 'Đỏ'} giành chiến thắng!`,
      icon: '⏳',
      resultType: color === 'r' ? 'defeat' : 'victory'
    });
  }, [audioEngineRef]);

  // Turn timers countdown loop
  useEffect(() => {
    if (
      isGameOver ||
      timeLimit === 0 ||
      inspectMoveIndex !== null ||
      gameMode === 'online' ||
      moveHistory.length === 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      const isRedTurn = turn === 'r';
      const isRedAtBottom = !isFlipped;
      const isBottomActive = (isRedTurn && isRedAtBottom) || (!isRedTurn && !isRedAtBottom);

      if (isBottomActive) {
        setBottomTimer(prev => {
          if (prev <= 1) {
            handleTimeOut(isRedTurn ? 'r' : 'b');
            return 0;
          }
          if (prev === 6) audioEngineRef.current?.playCountdown();
          return prev - 1;
        });
      } else {
        setTopTimer(prev => {
          if (prev <= 1) {
            handleTimeOut(isRedTurn ? 'r' : 'b');
            return 0;
          }
          if (prev === 6) audioEngineRef.current?.playCountdown();
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, timeLimit, turn, isFlipped, inspectMoveIndex, gameMode, handleTimeOut, audioEngineRef, moveHistory.length]);

  // Execute Move
  const executeMove = useCallback((m: Move, isFromBot: boolean = false, isRemote: boolean = false) => {
    if (isGameOver) return;

    const currentPiece = board[m.fromR][m.fromC];
    if (!currentPiece) return;

    const targetPiece = board[m.toR][m.toC];
    const isCapture = !!targetPiece;
    const nextTurn: PieceColor = turn === 'r' ? 'b' : 'r';

    let newBoard: (string | null)[][];
    let newHiddenBoard: (string | null)[][];
    let revealedPiece: string | null = null;
    let capturedActual: string | null = null;

    if (variant === 'jieqi') {
      const res = executeJieqiMove(board, hiddenBoard, m);
      newBoard = res.newBoard;
      newHiddenBoard = res.newHiddenBoard;
      revealedPiece = res.revealedPiece;
      capturedActual = res.capturedActual;

      if (revealedPiece) {
        setJustRevealedSquare({ r: m.toR, c: m.toC });
        setTimeout(() => setJustRevealedSquare(null), 800);
      }
    } else {
      newBoard = board.map(row => [...row]);
      newBoard[m.toR][m.toC] = currentPiece;
      newBoard[m.fromR][m.fromC] = null;
      newHiddenBoard = hiddenBoard;
      capturedActual = targetPiece;
    }

    const notation = variant === 'jieqi'
      ? formatJieqiNotation(board, m, revealedPiece)
      : formatNotation(board, m);

    // Call onMove callback (Online sync) - do not echo if move is from remote
    if (!isFromBot && !isRemote) {
      onMoveRef.current?.({
        ...m,
        revealedPiece,
        capturedActual
      });
    }

    // Special animations for Chariot, Cannon, Horse on capture
    const pieceInfo = PIECES[currentPiece];
    if (isCapture && enablePieceAnimations && pieceInfo) {
      if (pieceInfo.type === 'c') {
        const screenPos = findCannonScreenPiece(board, m.fromR, m.fromC, m.toR, m.toC);
        if (screenPos) {
          const screenPiece = board[screenPos.r][screenPos.c];
          setCannonJumpAnim({
            fromR: m.fromR,
            fromC: m.fromC,
            toR: m.toR,
            toC: m.toC,
            screenR: screenPos.r,
            screenC: screenPos.c,
            screenPieceCode: screenPiece || 'r_c',
            targetPieceCode: targetPiece || 'b_p',
            isFlipped
          });
        }
      } else if (pieceInfo.type === 'r') {
        setChariotChargeAnim({
          fromR: m.fromR,
          fromC: m.fromC,
          toR: m.toR,
          toC: m.toC,
          isFlipped
        });
      } else if (pieceInfo.type === 'h') {
        setHorseKickAnim({
          fromR: m.fromR,
          fromC: m.fromC,
          toR: m.toR,
          toC: m.toC,
          victimPieceCode: targetPiece || 'b_p',
          victimColor: targetPiece ? (targetPiece.startsWith('r') ? 'r' : 'b') : 'b',
          isFlipped,
          isLandscape: typeof window !== 'undefined' ? window.innerHeight < window.innerWidth : false
        });
      }
    }

    // Trajectory animation
    const trajectory = (isCapture && enablePieceAnimations && (pieceInfo?.type === 'c' || pieceInfo?.type === 'h'))
      ? computeCurveTrajectory(m.fromR, m.fromC, m.toR, m.toC, isFlipped, pieceInfo.type, isCapture)
      : computeStraightTrajectory(m.fromR, m.fromC, m.toR, m.toC, isFlipped);
    const duration =
      (isCapture
        ? Math.max(160, Math.min(300, trajectory.dist * 0.85))
        : Math.max(120, Math.min(220, trajectory.dist * 0.6))) + 50;

    setAnimatingPiece({
      move: m,
      pieceCode: currentPiece,
      targetPiece,
      trajectory,
      startTime: performance.now(),
      duration
    });

    if (pendingMoveTimeoutRef.current) {
      clearTimeout(pendingMoveTimeoutRef.current);
    }

    // EXACT TIMING: Âm thanh phát ra NGAY KHI quân cờ đến vị trí chỉ định
    pendingMoveTimeoutRef.current = setTimeout(() => {
      pendingMoveTimeoutRef.current = null;
      setBoard(newBoard);
      setHiddenBoard(newHiddenBoard);
      setLastMove(m);
      setSelectedSquare(null);
      setValidMoves([]);
      setHintMove(null);
      setAnimatingPiece(null);

      // Sound effect trigger & Landing ripple:
      // Phát tức thì tiếng Soundsnap Plywood B (di chuyển) hoặc Plywood PS (ăn quân)
      if (isCapture) {
        audioEngineRef.current?.playCapture();
        triggerHaptic('capture', enableHaptics);
        setLandingEffect({ r: m.toR, c: m.toC, isCapture: true });
        setTimeout(() => setLandingEffect(null), 400);
        triggerBoardShake('capture');
      } else {
        audioEngineRef.current?.playMove();
        triggerHaptic('move', enableHaptics);
      }

      // Xử lý quân bị ăn vào khay tù binh
      if (isCapture && targetPiece) {
        const wasHidden = isPieceHidden(targetPiece);
        const actualCode = capturedActual || targetPiece;
        setCapturedRecords(prev => [
          ...prev,
          {
            id: `${Date.now()}_${prev.length}`,
            actualCode,
            capturedBy: turn,
            wasHidden
          }
        ]);
      }

      // Check king in check
      const nextInCheck = variant === 'jieqi'
        ? isJieqiKingInCheck(newBoard, nextTurn)
        : isKingInCheck(newBoard, nextTurn);

      if (nextInCheck) {
        audioEngineRef.current?.playCheck();
        triggerHaptic('check', enableHaptics);
        triggerBoardShake('check');
      }

      // Update Move History
      const record: MoveRecord = {
        move: m,
        piece: currentPiece,
        captured: targetPiece,
        revealedPiece,
        capturedActual,
        notation: {
          ...notation,
          isCheck: nextInCheck
        },
        boardAfter: newBoard
      };
      setMoveHistory(prev => [...prev, record]);

      // Perpetual Check Rule
      if (nextInCheck) {
        const consecutiveCheckCount = countConsecutiveChecksSamePieceAndPos(
          moveHistory,
          m,
          currentPiece,
          true,
          turn
        );

        if (consecutiveCheckCount > 3) {
          setIsGameOver(true);
          audioEngineRef.current?.playDraw();
          const sideName = turn === 'r' ? 'Đỏ' : 'Đen';
          setModalData({
            title: 'Hòa cờ (Trường chiếu)',
            desc: `Bên ${sideName} đã chiếu quá 3 lần liên tiếp tại cùng một vị trí bằng một quân cờ (${consecutiveCheckCount} lần). Ván đấu kết thúc với kết quả Hòa.`,
            icon: '🤝',
            resultType: 'draw'
          });
          return;
        } else if (consecutiveCheckCount === 3) {
          onPerpetualCheckWarningRef.current?.(3, turn);
        }
      }

      // Check Checkmate / Stalemate
      const opponentMoves = variant === 'jieqi'
        ? getAllJieqiLegalMoves(newBoard, nextTurn)
        : getAllLegalMoves(newBoard, nextTurn);

      if (opponentMoves.length === 0) {
        setIsGameOver(true);
        if (nextInCheck) {
          const winner = turn === 'r' ? 'Đỏ' : 'Đen';
          audioEngineRef.current?.playVictory();
          triggerHaptic('victory', enableHaptics);
          setModalData({
            title: 'CHIẾU BÍ!',
            desc: `Bên ${winner} đã chiếu bí thành công và giành chiến thắng vẻ vang!`,
            icon: '🏆'
          });
        } else {
          audioEngineRef.current?.playDraw();
          setModalData({
            title: 'Hòa cờ (Hết nước đi)',
            desc: 'Không còn nước đi hợp lệ nào. Trận đấu kết thúc với kết quả Hòa.',
            icon: '🤝'
          });
        }
        return;
      }

      // Switch turn & reset timer
      setTurn(nextTurn);
      setTopTimer(timeLimit);
      setBottomTimer(timeLimit);

      if (autoFlip && gameMode === 'pvp') {
        setIsFlipped(prev => !prev);
      }
    }, duration);
  }, [board, hiddenBoard, turn, variant, isGameOver, isFlipped, autoFlip, gameMode, timeLimit, audioEngineRef, triggerBoardShake, enablePieceAnimations, enableHaptics, moveHistory]);

  // AI bot move trigger (Offloaded to Web Worker via computeAIMoveAsync so UI stays at 60fps)
  const isPaused = !!options?.isPaused;
  useEffect(() => {
    if (isPaused || isGameOver || gameMode === 'pvp' || gameMode === 'online' || inspectMoveIndex !== null) return;

    const isBotTurn = (gameMode === 'pve-red' && turn === 'b') || (gameMode === 'pve-black' && turn === 'r');
    if (!isBotTurn) return;

    let isCancelled = false;
    const thinkDelay = difficulty === 'easy' ? 280 : difficulty === 'medium' ? 420 : 550;

    const timer = setTimeout(async () => {
      if (isCancelled) return;
      setIsAiThinking(true);
      try {
        const botMove = await computeAIMoveAsync(
          variant,
          board,
          hiddenBoard,
          turn,
          difficulty
        );
        if (!isCancelled && botMove) {
          executeMove(botMove, true);
        }
      } catch (e) {
        console.error('AI Move calculation error:', e);
      } finally {
        if (!isCancelled) {
          setIsAiThinking(false);
        }
      }
    }, thinkDelay);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isPaused, turn, board, hiddenBoard, variant, gameMode, difficulty, isGameOver, inspectMoveIndex, executeMove]);

  // Square Click Interaction
  const handleSquareClick = useCallback((r: number, c: number) => {
    if (isGameOver || isAiThinking || inspectMoveIndex !== null) return;

    // Check if clicking on an allowed target square
    if (selectedSquare) {
      const targetMove = validMoves.find(m => m.toR === r && m.toC === c);
      if (targetMove) {
        if (onMoveAttemptRef.current) {
          const allowed = onMoveAttemptRef.current(targetMove);
          if (!allowed) {
            setSelectedSquare(null);
            setValidMoves([]);
            return;
          }
        }
        executeMove(targetMove);
        return;
      }
    }

    // Select piece
    const pieceCode = board[r][c];
    if (pieceCode) {
      const pieceCol: PieceColor = pieceCode.startsWith('r') ? 'r' : 'b';
      if (pieceCol === turn) {
        audioEngineRef.current?.playSelect();
        triggerHaptic('select', enableHaptics);
        setSelectedSquare({ r, c });
        const moves = variant === 'jieqi'
          ? getJieqiLegalMoves(board, r, c)
          : getLegalMoves(board, r, c);
        setValidMoves(moves);
        return;
      } else {
        onWrongTurnClickRef.current?.(pieceCol, turn);
      }
    }

    // Deselect if clicking empty space or invalid piece
    setSelectedSquare(null);
    setValidMoves([]);
  }, [board, turn, variant, selectedSquare, validMoves, isGameOver, isAiThinking, inspectMoveIndex, executeMove, audioEngineRef, enableHaptics]);

  // Reset & Start New Game (hỗ trợ chuyển đổi giữa Cờ Sáng và Cờ Úp)
  const startNewGame = useCallback((
    newMode?: 'pve-red' | 'pve-black' | 'pvp' | 'online',
    newVariant?: GameVariant
  ) => {
    if (pendingMoveTimeoutRef.current) {
      clearTimeout(pendingMoveTimeoutRef.current);
      pendingMoveTimeoutRef.current = null;
    }
    const targetMode = newMode || gameMode;
    const targetVariant = newVariant || variant;

    if (newMode) setGameMode(newMode);
    if (newVariant) setVariant(newVariant);

    if (targetVariant === 'jieqi') {
      const { board: jBoard, hiddenBoard: jHidden } = createInitialJieqiGame();
      setBoard(jBoard);
      setHiddenBoard(jHidden);
    } else {
      setBoard(INITIAL_BOARD.map(r => [...r]));
      setHiddenBoard(Array.from({ length: 10 }, () => Array(9).fill(null)));
    }

    setTurn('r');
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    setMoveHistory([]);
    setInspectMoveIndex(null);
    setCapturedRecords([]);
    setIsGameOver(false);
    setIsAiThinking(false);
    setModalData(null);
    setAnimatingPiece(null);
    setCannonJumpAnim(null);
    setChariotChargeAnim(null);
    setHorseKickAnim(null);
    setLandingEffect(null);
    setJustRevealedSquare(null);
    setTopTimer(timeLimit);
    setBottomTimer(timeLimit);

    if (targetMode === 'pve-black') {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [gameMode, variant, timeLimit]);

  // Toggle variant helper
  const handleToggleVariant = useCallback((targetVariant: GameVariant) => {
    startNewGame(gameMode, targetVariant);
  }, [gameMode, startNewGame]);

  // Undo Move
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || isAiThinking || isGameOver) return;

    let steps = 1;
    if ((gameMode === 'pve-red' || gameMode === 'pve-black') && moveHistory.length >= 2) {
      steps = 2;
    }

    const newHistory = moveHistory.slice(0, moveHistory.length - steps);
    const lastRecord = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;

    const targetBoard = lastRecord ? (lastRecord.boardAfter || lastRecord.boardSnapshot) : null;
    if (targetBoard) {
      setBoard(targetBoard.map(r => [...r]));
    } else {
      if (variant === 'jieqi') {
        const { board: jBoard, hiddenBoard: jHidden } = createInitialJieqiGame();
        setBoard(jBoard);
        setHiddenBoard(jHidden);
      } else {
        setBoard(INITIAL_BOARD.map(r => [...r]));
      }
    }

    setTurn(newHistory.length % 2 === 0 ? 'r' : 'b');
    setLastMove(lastRecord ? lastRecord.move : null);
    setSelectedSquare(null);
    setValidMoves([]);
    setHintMove(null);
    setMoveHistory(newHistory);
    setInspectMoveIndex(null);
    audioEngineRef.current?.playMove();
  }, [moveHistory, gameMode, isAiThinking, isGameOver, variant, audioEngineRef]);

  // Danh sách quân bị ăn theo từng góc nhìn (Perspective FOW):
  // "các quân chưa được lật thì khi vào khay tù binh sẽ được lật cho bên ăn còn bên bị ăn thì sẽ không thấy"
  const getCapturedPiecesForViewer = useCallback((viewerColor: PieceColor) => {
    // Quân Đỏ bị ăn (nằm ở khay của Đen)
    const redPieces = capturedRecords
      .filter(rec => rec.actualCode.startsWith('r'))
      .map(rec => {
        // Nếu bị ăn khi chưa lật:
        if (rec.wasHidden) {
          // Nếu người xem là bên ăn (Đen): thấy quân thật
          if (viewerColor === 'b') return rec.actualCode;
          // Nếu người xem là bên bị ăn (Đỏ): chỉ thấy quân úp 'r_u'
          return 'r_u';
        }
        return rec.actualCode;
      });

    // Quân Đen bị ăn (nằm ở khay của Đỏ)
    const blackPieces = capturedRecords
      .filter(rec => rec.actualCode.startsWith('b'))
      .map(rec => {
        if (rec.wasHidden) {
          // Nếu người xem là bên ăn (Đỏ): thấy quân thật
          if (viewerColor === 'r') return rec.actualCode;
          // Nếu người xem là bên bị ăn (Đen): chỉ thấy quân úp 'b_u'
          return 'b_u';
        }
        return rec.actualCode;
      });

    return { redPieces, blackPieces };
  }, [capturedRecords]);

  // Mặc định góc nhìn người chơi hiện tại
  const myPerspective: PieceColor = gameMode === 'pve-black' ? 'b' : 'r';
  const { redPieces: capturedRed, blackPieces: capturedBlack } = getCapturedPiecesForViewer(myPerspective);

  return {
    board,
    displayBoard,
    setBoard,
    hiddenBoard,
    setHiddenBoard,
    variant,
    setVariant,
    handleToggleVariant,
    justRevealedSquare,
    turn,
    setTurn,
    selectedSquare,
    setSelectedSquare,
    validMoves,
    setValidMoves,
    lastMove: inspectMoveIndex !== null && moveHistory[inspectMoveIndex] ? moveHistory[inspectMoveIndex].move : lastMove,
    setLastMove,
    hintMove,
    setHintMove,
    moveHistory,
    setMoveHistory,
    inspectMoveIndex,
    setInspectMoveIndex,
    capturedRecords,
    setCapturedRecords,
    capturedRed,
    capturedBlack,
    getCapturedPiecesForViewer,
    isGameOver,
    setIsGameOver,
    isAiThinking,
    modalData,
    setModalData,
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    timeLimit,
    setTimeLimit,
    topTimer,
    setTopTimer,
    bottomTimer,
    setBottomTimer,
    autoFlip,
    setAutoFlip,
    isFlipped,
    setIsFlipped,
    theme,
    setTheme,
    animatingPiece,
    landingEffect,
    animatingPieceRef,
    animatingShadowRef,
    boardShake,
    triggerBoardShake,
    cannonJumpAnim,
    setCannonJumpAnim,
    chariotChargeAnim,
    setChariotChargeAnim,
    horseKickAnim,
    setHorseKickAnim,
    enablePieceAnimations,
    toggleEnablePieceAnimations,
    enableHaptics,
    toggleEnableHaptics,
    enableWakeLock,
    toggleEnableWakeLock,
    isCheck,
    executeMove,
    handleSquareClick,
    startNewGame,
    handleUndo
  };
}
