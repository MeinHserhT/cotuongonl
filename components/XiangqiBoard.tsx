'use client';

import React from 'react';
import {
  PieceColor,
  PIECES,
  Move,
  BoardTheme
} from '@/lib/xiangqi-types';
import { findGeneral } from '@/lib/xiangqi-rules';
import { CannonJumpAnimation, CannonJumpData } from '@/components/CannonJumpAnimation';
import { ChariotChargeAnimation, ChariotChargeData } from '@/components/ChariotChargeAnimation';
import { HorseKickAnimation, HorseKickData } from '@/components/HorseKickAnimation';
import { CurveTrajectory } from '@/lib/trajectory';

export interface AnimatingPieceData {
  move: Move;
  pieceCode: string;
  targetPiece: string | null;
  trajectory: CurveTrajectory;
  startTime: number;
  duration: number;
}

interface BoardMarker {
  x: number;
  y: number;
  hasLeft: boolean;
  hasRight: boolean;
}

const BOARD_MARKERS: BoardMarker[] = [
  // Black side Cannons: Rank 2, Files 1, 7
  { x: 75, y: 125, hasLeft: true, hasRight: true },
  { x: 375, y: 125, hasLeft: true, hasRight: true },

  // Black side Pawns: Rank 3, Files 0, 2, 4, 6, 8
  { x: 25, y: 175, hasLeft: false, hasRight: true },
  { x: 125, y: 175, hasLeft: true, hasRight: true },
  { x: 225, y: 175, hasLeft: true, hasRight: true },
  { x: 325, y: 175, hasLeft: true, hasRight: true },
  { x: 425, y: 175, hasLeft: true, hasRight: false },

  // Red side Pawns: Rank 6, Files 0, 2, 4, 6, 8
  { x: 25, y: 325, hasLeft: false, hasRight: true },
  { x: 125, y: 325, hasLeft: true, hasRight: true },
  { x: 225, y: 325, hasLeft: true, hasRight: true },
  { x: 325, y: 325, hasLeft: true, hasRight: true },
  { x: 425, y: 325, hasLeft: true, hasRight: false },

  // Red side Cannons: Rank 7, Files 1, 7
  { x: 75, y: 375, hasLeft: true, hasRight: true },
  { x: 375, y: 375, hasLeft: true, hasRight: true }
];

function buildMarkerPath(cx: number, cy: number, hasLeft: boolean, hasRight: boolean, d = 4, len = 7): string {
  let p = '';
  if (hasLeft) {
    p += `M ${cx - d - len} ${cy - d} H ${cx - d} V ${cy - d - len} `;
    p += `M ${cx - d - len} ${cy + d} H ${cx - d} V ${cy + d + len} `;
  }
  if (hasRight) {
    p += `M ${cx + d + len} ${cy - d} H ${cx + d} V ${cy - d - len} `;
    p += `M ${cx + d + len} ${cy + d} H ${cx + d} V ${cy + d + len} `;
  }
  return p.trim();
}

interface XiangqiBoardProps {
  board: (string | null)[][];
  theme: BoardTheme;
  colorMode?: 'dark' | 'light';
  isFlipped: boolean;
  selectedSquare: { r: number; c: number } | null;
  validMoves: Move[];
  lastMove: Move | null;
  turn: PieceColor;
  isCheck: boolean;
  isInspecting?: boolean;
  disabled?: boolean;
  onSquareClick: (r: number, c: number) => void;
  onExecuteMove: (m: Move) => void;
  // Animation props
  animatingPiece: AnimatingPieceData | null;
  animatingPieceRef: React.RefObject<HTMLDivElement | null>;
  landingEffect: { r: number; c: number; isCapture: boolean } | null;
  boardShake: 'check' | 'capture' | null;
  cannonJumpAnim: CannonJumpData | null;
  onCannonImpact: () => void;
  onCannonComplete: () => void;
  chariotChargeAnim: ChariotChargeData | null;
  onChariotImpact: () => void;
  onChariotComplete: () => void;
  horseKickAnim: HorseKickData | null;
  onHorseImpact: () => void;
  onHorseComplete: () => void;
  boardRef?: React.Ref<HTMLDivElement>;
  justRevealedSquare?: { r: number; c: number } | null;
  isLandscape?: boolean;
}

export const XiangqiBoard: React.FC<XiangqiBoardProps> = React.memo(({
  board,
  theme,
  colorMode = 'dark',
  isFlipped,
  selectedSquare,
  validMoves,
  lastMove,
  turn,
  isCheck,
  isInspecting = false,
  disabled = false,
  onSquareClick,
  onExecuteMove,
  animatingPiece,
  animatingPieceRef,
  landingEffect,
  boardShake,
  cannonJumpAnim,
  onCannonImpact,
  onCannonComplete,
  chariotChargeAnim,
  onChariotImpact,
  onChariotComplete,
  horseKickAnim,
  onHorseImpact,
  onHorseComplete,
  boardRef,
  justRevealedSquare,
  isLandscape = false
}) => {
  const isZen = theme === 'zen';
  const isMarble = theme === 'marble';
  const isLacquer = theme === 'lacquer';

  // Coordinate mapping helper
  const getPct = (r: number, c: number) => {
    const dr = isFlipped ? 9 - r : r;
    const dc = isFlipped ? 8 - c : c;
    return {
      left: `${((25 + dc * 50) / 450) * 100}%`,
      top: `${((25 + dr * 50) / 500) * 100}%`
    };
  };

  // O(1) lookup set for capturable squares & memoized empty valid moves
  const { capturableSet, emptyValidMoves } = React.useMemo(() => {
    const capSet = new Set<string>();
    const emptyMoves: Move[] = [];
    if (!isInspecting) {
      for (let i = 0; i < validMoves.length; i++) {
        const m = validMoves[i];
        if (board[m.toR]?.[m.toC] !== null) {
          capSet.add(`${m.toR},${m.toC}`);
        } else {
          emptyMoves.push(m);
        }
      }
    }
    return { capturableSet: capSet, emptyValidMoves: emptyMoves };
  }, [validMoves, board, isInspecting]);

  // Find King in check for red alert ring
  const checkedGeneral = React.useMemo(
    () => (isCheck ? findGeneral(board, turn) : null),
    [isCheck, board, turn]
  );

  const isDark = colorMode !== 'light';

  // Theme tokens for SVG board and pieces (harmonized with Dark Rosewood #1F1812/#36291E & Light Jade #0F766E/#132226)
  const boardFrameClass = isMarble
    ? 'bg-gradient-to-b from-[#1f5c52] via-[#15463e] to-[#0e332d] border-[#09221e] shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.28),inset_0_-2px_4px_rgba(0,0,0,0.45)]'
    : isLacquer
    ? 'bg-gradient-to-b from-[#2c1509] via-[#1f0e05] to-[#130802] border-[#92400e] shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(251,191,36,0.35),inset_0_-2px_4px_rgba(0,0,0,0.7)]'
    : isZen
    ? isDark
      ? 'bg-gradient-to-b from-[#36291E] via-[#281E15] to-[#1F1812] border-[#5C4430] shadow-[0_14px_38px_rgba(0,0,0,0.78),inset_0_1px_2px_rgba(239,230,213,0.18),inset_0_-2px_4px_rgba(0,0,0,0.55)]'
      : 'bg-gradient-to-b from-[#b88c5a] via-[#a77c4b] to-[#916738] border-[#5e3e1a] shadow-[0_12px_32px_rgba(19,34,38,0.22),inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.35)]'
    : isDark
    ? 'bg-gradient-to-b from-[#3A2818] via-[#291C10] to-[#1F1812] border-[#D97706]/50 shadow-[0_14px_38px_rgba(0,0,0,0.82),inset_0_1px_2px_rgba(239,230,213,0.22),inset_0_-2px_4px_rgba(0,0,0,0.6)]'
    : 'bg-gradient-to-b from-[#1A423F] via-[#133230] to-[#132226] border-[#0F766E] shadow-[0_14px_34px_rgba(19,34,38,0.26),inset_0_1px_2px_rgba(255,255,255,0.28),inset_0_-2px_4px_rgba(0,0,0,0.4)]';

  const surfaceStops = isMarble
    ? ['#dff2eb', '#c6e5da', '#add6c8']
    : isLacquer
    ? ['#221c17', '#18130f', '#100c09']
    : isZen
    ? ['#caa272', '#be9565', '#b28755']
    : ['#df9b54', '#d58f48', '#cb823b'];

  const riverStops = isMarble
    ? ['#9bc9ba', '#7fb5a4', '#9bc9ba']
    : isLacquer
    ? ['#451a03', '#290f02', '#451a03']
    : isZen
    ? ['#b88958', '#a87848', '#b88958']
    : ['#c47d33', '#b26e25', '#c47d33'];

  const gridStroke = isMarble
    ? '#114b43'
    : isLacquer
    ? '#d97706'
    : isZen
    ? '#5c3917'
    : '#3d1c06';

  const riverTextColor = isMarble
    ? '#0d3b35'
    : isLacquer
    ? '#f59e0b'
    : isZen
    ? '#4d2d10'
    : '#2b1203';

  const pieceBgStyle = isMarble
    ? 'radial-gradient(circle at 32% 28%, #ffffff 0%, #f4fbf8 75%, #dceee7 92%, #c6e2d8 100%)'
    : isLacquer
    ? 'radial-gradient(circle at 32% 28%, #fffbeb 0%, #fef3c7 72%, #fde68a 92%, #f59e0b 100%)'
    : isZen
    ? 'radial-gradient(circle at 32% 28%, #ffffff 0%, #faf8f5 75%, #ece5d8 92%, #e2d9c8 100%)'
    : 'radial-gradient(circle at 32% 28%, #ffffff 0%, #ffffff 75%, #f8fafc 92%, #f1f5f9 100%)';

  const pieceBorderClass = isMarble
    ? 'border-[#e6f5ef]'
    : isLacquer
    ? 'border-amber-300'
    : isZen
    ? 'border-[#f5efe6]'
    : 'border-white';

  return (
    <div
      ref={boardRef}
      className={`relative ${
        isLandscape
          ? 'h-screen h-[100dvh] max-h-[100dvh] w-auto max-w-none aspect-[9/10] shrink-0'
          : 'w-screen w-[100vw] max-w-[100vw] h-auto aspect-[9/10] shrink-0'
      } rounded-2xl p-1.5 sm:p-2.5 shadow-2xl select-none border-4 ${
        boardShake ? 'transition-none' : 'transition-all duration-300'
      } ${boardFrameClass} ${
        boardShake === 'check'
          ? 'animate-shake-intense shake-checkmate'
          : boardShake === 'capture'
          ? 'animate-shake-gentle shake-capture'
          : ''
      }`}
    >
      {/* Board Surface with SVG Lines and River */}
      <div className="relative w-full h-full aspect-[9/10] rounded-xl overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.32)] border border-amber-950/40">
        <svg
          viewBox="0 0 450 500"
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boardWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={surfaceStops[0]} />
              <stop offset="50%" stopColor={surfaceStops[1]} />
              <stop offset="100%" stopColor={surfaceStops[2]} />
            </linearGradient>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={riverStops[0]} stopOpacity="0.45" />
              <stop offset="50%" stopColor={riverStops[1]} stopOpacity="0.75" />
              <stop offset="100%" stopColor={riverStops[2]} stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Background Surface */}
          <rect x="0" y="0" width="450" height="500" rx="12" fill="url(#boardWoodGrad)" />

          {/* Symmetrical Inner Bevel Highlight & Shadow */}
          <rect x="2.5" y="2.5" width="445" height="495" rx="10" fill="none" stroke={isLacquer ? 'rgba(251,191,36,0.22)' : 'rgba(255,255,255,0.22)'} strokeWidth="1.5" />
          <rect x="5.5" y="5.5" width="439" height="489" rx="8" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />

          {/* Traditional Outer Boundary Frame */}
          <rect
            x="14"
            y="14"
            width="422"
            height="472"
            rx="4"
            fill="none"
            stroke={gridStroke}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Inner Grid Boundary Frame */}
          <rect
            x="25"
            y="25"
            width="400"
            height="450"
            fill="none"
            stroke={gridStroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* River Background Band */}
          <rect x="25" y="225" width="400" height="50" fill="url(#riverGrad)" />

          {/* Inner Horizontal Lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h-${i + 1}`}
              x1="25"
              y1={75 + i * 50}
              x2="425"
              y2={75 + i * 50}
              stroke={gridStroke}
              strokeWidth={1.2}
            />
          ))}

          {/* Inner Vertical Lines */}
          {Array.from({ length: 7 }).map((_, i) => {
            const x = 75 + i * 50;
            return (
              <g key={`v-${i + 1}`}>
                <line
                  x1={x}
                  y1="25"
                  x2={x}
                  y2="225"
                  stroke={gridStroke}
                  strokeWidth={1.2}
                />
                <line
                  x1={x}
                  y1="275"
                  x2={x}
                  y2="475"
                  stroke={gridStroke}
                  strokeWidth={1.2}
                />
              </g>
            );
          })}

          {/* Palace Diagonals (Top & Bottom) */}
          <line x1="175" y1="25" x2="275" y2="125" stroke={gridStroke} strokeWidth={1.2} />
          <line x1="275" y1="25" x2="175" y2="125" stroke={gridStroke} strokeWidth={1.2} />
          <line x1="175" y1="375" x2="275" y2="475" stroke={gridStroke} strokeWidth={1.2} />
          <line x1="275" y1="375" x2="175" y2="475" stroke={gridStroke} strokeWidth={1.2} />

          {/* Traditional Star Markers */}
          {BOARD_MARKERS.map((m, idx) => (
            <path
              key={`marker-${idx}`}
              d={buildMarkerPath(m.x, m.y, m.hasLeft, m.hasRight)}
              stroke={gridStroke}
              strokeWidth={1.2}
              fill="none"
            />
          ))}

          {/* River Calligraphy */}
          <text
            x="110"
            y="258"
            fill={riverTextColor}
            fontSize="24"
            fontFamily="var(--font-piece), 'Iansui', 'Ma Shan Zheng', cursive, serif"
            fontWeight="bold"
            letterSpacing="8"
            opacity="0.88"
            textAnchor="middle"
          >
            楚河
          </text>
          <text
            x="340"
            y="258"
            fill={riverTextColor}
            fontSize="24"
            fontFamily="var(--font-piece), 'Iansui', 'Ma Shan Zheng', cursive, serif"
            fontWeight="bold"
            letterSpacing="8"
            opacity="0.88"
            textAnchor="middle"
          >
            漢界
          </text>
        </svg>

        {/* Board Click Hitboxes (90 Intersections) */}
        <div className="absolute inset-0 touch-manipulation">
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 9 }).map((_, c) => {
              const pos = getPct(r, c);
              const pieceCode = board[r][c];
              const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
              const isLastMoveFrom = lastMove?.fromR === r && lastMove?.fromC === c;
              const isLastMoveTo = lastMove?.toR === r && lastMove?.toC === c;
              const isCheckedKing = checkedGeneral?.r === r && checkedGeneral?.c === c;
              const isCapturable = pieceCode !== null && capturableSet.has(`${r},${c}`);

              const isAnimatingThisPiece =
                animatingPiece &&
                animatingPiece.move.fromR === r &&
                animatingPiece.move.fromC === c;

              return (
                <div
                  key={`cell-${r}-${c}`}
                  onClick={() => !disabled && onSquareClick(r, c)}
                  style={pos}
                  className="absolute w-[9.6%] h-[8.64%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer z-20 group touch-manipulation before:absolute before:-inset-1.5 before:content-['']"
                >
                  {/* Selected square indicator */}
                  {isSelected && (
                    <div className="absolute -inset-0.5 sm:-inset-1 rounded-full border-2 border-amber-400 bg-amber-400/20 ring-2 ring-amber-300 animate-pulse pointer-events-none z-30" />
                  )}

                  {/* Last move: Origin square */}
                  {isLastMoveFrom && !isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400/25 border-1.5 sm:border-2 border-dashed border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.6)] flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                      </div>
                    </div>
                  )}

                  {/* Last move: Destination square */}
                  {isLastMoveTo && !isSelected && (
                    <>
                      <div className="absolute -inset-0.5 rounded-full border-2 border-amber-400 bg-amber-400/20 ring-2 ring-amber-300/60 shadow-[0_0_14px_rgba(251,191,36,0.85)] pointer-events-none z-25 animate-pulse" />
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border border-white shadow-[0_0_8px_rgba(251,191,36,1)] pointer-events-none z-30 animate-ping opacity-75" />
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border border-white shadow-[0_0_8px_rgba(251,191,36,1)] pointer-events-none z-30" />
                    </>
                  )}

                  {/* King in check warning ring */}
                  {isCheckedKing && (
                    <div className="absolute -inset-1 rounded-full border-3 border-red-500 bg-red-600/30 ring-4 ring-red-400 animate-ping pointer-events-none z-35" />
                  )}

                  {/* Chess piece rendering */}
                  {pieceCode && !isAnimatingThisPiece && (() => {
                    const piece = PIECES[pieceCode];
                    if (!piece) return null;
                    const isRed = piece.color === 'r';
                    const isKing = piece.type === 'k';
                    const isHidden = pieceCode === 'r_u' || pieceCode === 'b_u';
                    const isJustRevealed = justRevealedSquare?.r === r && justRevealedSquare?.c === c;

                    if (isHidden) {
                      return (
                        <div
                          className={`piece relative w-full h-full rounded-full flex items-center justify-center select-none border-2 transition-transform duration-150 ${
                            isSelected ? 'scale-110 shadow-2xl ring-2 ring-amber-400' : '[@media(hover:hover)]:hover:scale-105'
                          } ${
                            isRed
                              ? 'bg-[radial-gradient(circle_at_32%_28%,#3a1515_0%,#240b0b_70%,#150505_100%)] border-red-700/80 text-amber-200'
                              : 'bg-[radial-gradient(circle_at_32%_28%,#1f242d_0%,#14171f_70%,#090a0e_100%)] border-slate-600/80 text-slate-300'
                          }`}
                          style={{
                            background: isRed
                              ? 'radial-gradient(circle at 32% 28%, #3a1515 0%, #240b0b 70%, #150505 100%)'
                              : 'radial-gradient(circle at 32% 28%, #1f242d 0%, #14171f 70%, #090a0e 100%)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.6)'
                          }}
                        >
                          <div className={`absolute inset-[2.5px] sm:inset-[3px] rounded-full border border-dashed ${isRed ? 'border-amber-500/40' : 'border-slate-400/30'} pointer-events-none`} />
                          <div className={`w-[58%] h-[58%] rounded-full flex items-center justify-center border shadow-inner ${
                            isRed
                              ? 'bg-red-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                              : 'bg-slate-900/80 border-slate-400/40 text-slate-200 shadow-[0_0_8px_rgba(148,163,184,0.2)]'
                          }`} />

                          {isCapturable && (
                            <div className="absolute -inset-1 sm:-inset-1.5 rounded-full border-2 border-red-500 bg-red-600/20 ring-2 ring-red-400/80 shadow-[0_0_16px_rgba(239,68,68,0.9)] animate-pulse pointer-events-none flex items-center justify-center z-40">
                              <div className="w-[84%] h-[84%] rounded-full border border-dashed border-red-300 pointer-events-none" />
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        className={`piece relative w-full h-full rounded-full flex items-center justify-center select-none border-2 transition-all duration-200 ${
                          isSelected ? 'scale-110 shadow-2xl' : '[@media(hover:hover)]:hover:scale-105'
                        } ${isKing ? 'piece-king' : ''} ${
                          isJustRevealed ? 'animate-bounce ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)]' : ''
                        } ${pieceBorderClass} ${isRed ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}
                        style={{
                          background: pieceBgStyle,
                          boxShadow:
                            '0 4px 10px rgba(0,0,0,0.38), inset 0 2px 4px #ffffff, inset 0 -2px 4px rgba(0,0,0,0.22)'
                        }}
                      >
                        <div className="absolute inset-[2px] sm:inset-[3px] rounded-full border border-slate-400/45 pointer-events-none" />

                        <span
                          className="font-piece font-bold select-none pointer-events-none text-[clamp(15px,4.5vw,28px)] sm:text-[24px] md:text-[28px] tracking-tight leading-none"
                          style={{
                            fontFamily: '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif',
                            textShadow: isKing
                              ? isRed
                                ? '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(185,28,28,0.7), 0 0 8px rgba(245,158,11,0.55)'
                                : '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(0,0,0,0.75), 0 0 8px rgba(245,158,11,0.55)'
                              : isRed
                              ? '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(185,28,28,0.65)'
                              : '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(0,0,0,0.7)'
                          }}
                        >
                          {piece.nameCn}
                        </span>

                        {isCapturable && (
                          <div className="absolute -inset-1 sm:-inset-1.5 rounded-full border-2 border-red-500 bg-red-600/20 ring-2 ring-red-400/80 shadow-[0_0_16px_rgba(239,68,68,0.9)] animate-pulse pointer-events-none flex items-center justify-center z-40">
                            <div className="w-[84%] h-[84%] rounded-full border border-dashed border-red-300 pointer-events-none" />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })
          )}

          {/* Valid Move Dots for Empty Squares */}
          {!isInspecting && selectedSquare &&
            emptyValidMoves.map((m, idx) => {
              const pos = getPct(m.toR, m.toC);
              return (
                <div
                  key={`dot-${m.toR}-${m.toC}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecuteMove(m);
                  }}
                  style={pos}
                  className="absolute w-[10.8%] h-[9.72%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-35 flex items-center justify-center touch-manipulation group/dot"
                >
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9),inset_0_0_2px_#fff] transition-transform [@media(hover:hover)]:group-hover/dot:scale-135 active:scale-125" />
                </div>
              );
            })}

          {/* Dynamic Parabolic Flight Piece */}
          {animatingPiece && (() => {
            const animPiece = PIECES[animatingPiece.pieceCode];
            const isRed = animPiece?.color === 'r';
            const isAnimKing = animPiece?.type === 'k';
            const isHiddenAnim = animatingPiece.pieceCode === 'r_u' || animatingPiece.pieceCode === 'b_u';
            const initPt = animatingPiece.trajectory.getPoint(0);

            if (isHiddenAnim) {
              return (
                <div
                  ref={animatingPieceRef}
                  className={`piece absolute z-50 pointer-events-none w-[9.6%] h-[8.64%] rounded-full flex items-center justify-center select-none border-2 ${
                    isRed
                      ? 'bg-[radial-gradient(circle_at_32%_28%,#3a1515_0%,#240b0b_70%,#150505_100%)] border-red-700 text-amber-200'
                      : 'bg-[radial-gradient(circle_at_32%_28%,#1f242d_0%,#14171f_70%,#090a0e_100%)] border-slate-600 text-slate-300'
                  }`}
                  style={{
                    left: `${initPt.pctX}%`,
                    top: `${initPt.pctY}%`,
                    transform: 'translate(-50%, -50%) scale(1)',
                    background: isRed
                      ? 'radial-gradient(circle at 32% 28%, #3a1515 0%, #240b0b 70%, #150505 100%)'
                      : 'radial-gradient(circle at 32% 28%, #1f242d 0%, #14171f 70%, #090a0e 100%)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.55), inset 0 2px 3px rgba(255,255,255,0.25)'
                  }}
                >
                  <div className={`absolute inset-[2.5px] sm:inset-[3px] rounded-full border border-dashed ${isRed ? 'border-amber-500/40' : 'border-slate-400/30'} pointer-events-none`} />
                  <div className={`w-[58%] h-[58%] rounded-full flex items-center justify-center border shadow-inner ${
                    isRed
                      ? 'bg-red-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900/80 border-slate-400/40 text-slate-200 shadow-[0_0_8px_rgba(148,163,184,0.2)]'
                  }`} />
                </div>
              );
            }

            return (
              <div
                ref={animatingPieceRef}
                className={`piece absolute z-50 pointer-events-none w-[9.6%] h-[8.64%] rounded-full flex items-center justify-center select-none border-2 ${
                  isAnimKing ? 'piece-king' : ''
                } ${pieceBorderClass} ${isRed ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}
                style={{
                  left: `${initPt.pctX}%`,
                  top: `${initPt.pctY}%`,
                  transform: 'translate(-50%, -50%) scale(1)',
                  background: pieceBgStyle,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.45), inset 0 2px 4px #ffffff'
                }}
              >
                <div className="absolute inset-[2px] sm:inset-[3px] rounded-full border border-slate-400/45 pointer-events-none" />
                <span
                  className="font-piece font-bold select-none pointer-events-none text-[clamp(15px,4.5vw,28px)] sm:text-[24px] md:text-[28px] tracking-tight leading-none"
                  style={{
                    fontFamily: '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif',
                    textShadow: isAnimKing
                      ? isRed
                        ? '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(185,28,28,0.7), 0 0 8px rgba(245,158,11,0.55)'
                        : '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(0,0,0,0.75), 0 0 8px rgba(245,158,11,0.55)'
                      : isRed
                      ? '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(185,28,28,0.65)'
                      : '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(0,0,0,0.7)'
                  }}
                >
                  {animPiece?.nameCn}
                </span>
              </div>
            );
          })()}

          {/* Landing Shockwave Ripple */}
          {landingEffect && (
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 rounded-full shockwave-ripple ${
                landingEffect.isCapture
                  ? 'w-[9.6%] h-[8.64%] border-2 border-red-500 bg-red-500/30'
                  : 'w-[9.6%] h-[8.64%] border-2 border-amber-400 bg-amber-400/25'
              }`}
              style={getPct(landingEffect.r, landingEffect.c)}
            />
          )}

          {/* Cannon Jump & Attack Animation */}
          <CannonJumpAnimation
            data={cannonJumpAnim}
            onImpact={onCannonImpact}
            onComplete={onCannonComplete}
          />

          {/* Chariot Charge & Dust Trail Animation */}
          <ChariotChargeAnimation
            data={chariotChargeAnim}
            onImpact={onChariotImpact}
            onComplete={onChariotComplete}
          />

          {/* Horse Kick & Clatter Animation */}
          <HorseKickAnimation
            data={horseKickAnim}
            onImpact={onHorseImpact}
            onComplete={onHorseComplete}
          />
        </div>
      </div>
    </div>
  );
});

XiangqiBoard.displayName = 'XiangqiBoard';
