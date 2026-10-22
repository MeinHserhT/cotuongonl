import { PieceColor, PieceType, PIECES, Move, BotDifficulty } from './xiangqi-types';
import {
  isValidPos,
  isInsidePalace,
  findGeneral,
  areGeneralsFacing,
  isKingInCheck,
  getLegalMoves,
  getAllLegalMoves,
  simulateMove
} from './xiangqi-rules';
import { getOpeningBookMove } from './xiangqi-openings';

// ============================================================================
// 1. ZOBRIST HASHING (BẢNG BĂM HOÁN VỊ THẾ CỜ 64-BIT QUA CẶP 32-BIT)
// ============================================================================

const PIECE_INDEX_MAP: Record<string, number> = {
  r_k: 0, r_a: 1, r_e: 2, r_h: 3, r_r: 4, r_c: 5, r_p: 6,
  b_k: 7, b_a: 8, b_e: 9, b_h: 10, b_r: 11, b_c: 12, b_p: 13
};

// 14 loại quân x 90 ô = 1260 cặp số 32-bit (hi, lo)
const ZOBRIST_PIECES_HI: number[][] = [];
const ZOBRIST_PIECES_LO: number[][] = [];
let ZOBRIST_SIDE_RED_HI = 0;
let ZOBRIST_SIDE_RED_LO = 0;

// Xorshift32 PRNG sinh số giả ngẫu nhiên đồng nhất xác định
(function initZobrist() {
  let seed = 0x853c49e6;
  function nextRand32(): number {
    seed = (seed ^ (seed << 13)) >>> 0;
    seed = (seed ^ (seed >>> 17)) >>> 0;
    seed = (seed ^ (seed << 5)) >>> 0;
    return seed >>> 0;
  }

  for (let p = 0; p < 14; p++) {
    ZOBRIST_PIECES_HI[p] = new Array(90);
    ZOBRIST_PIECES_LO[p] = new Array(90);
    for (let sq = 0; sq < 90; sq++) {
      ZOBRIST_PIECES_HI[p][sq] = nextRand32();
      ZOBRIST_PIECES_LO[p][sq] = nextRand32();
    }
  }
  ZOBRIST_SIDE_RED_HI = nextRand32();
  ZOBRIST_SIDE_RED_LO = nextRand32();
})();

export interface ZobristHash {
  hi: number;
  lo: number;
}

export function computeZobristHash(board: (string | null)[][], turn: PieceColor): ZobristHash {
  let hi = turn === 'r' ? ZOBRIST_SIDE_RED_HI : 0;
  let lo = turn === 'r' ? ZOBRIST_SIDE_RED_LO : 0;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const code = board[r][c];
      if (code) {
        const pIdx = PIECE_INDEX_MAP[code];
        if (pIdx !== undefined) {
          const sq = r * 9 + c;
          hi = (hi ^ ZOBRIST_PIECES_HI[pIdx][sq]) >>> 0;
          lo = (lo ^ ZOBRIST_PIECES_LO[pIdx][sq]) >>> 0;
        }
      }
    }
  }
  return { hi, lo };
}

// ============================================================================
// 2. TRANSPOSITION TABLE (BẢNG CHUYỂN VỊ LƯU TRỮ THẾ CỜ)
// ============================================================================

export enum TTFlag {
  EXACT = 0,       // Giá trị chính xác (nằm trong khoảng [alpha, beta])
  LOWERBOUND = 1,  // Cận dưới (Beta cutoff - nước đi quá mạnh vượt trội)
  UPPERBOUND = 2   // Cận trên (Alpha fail-low - tất cả nhánh đều yếu)
}

export interface TTEntry {
  keyHi: number;
  keyLo: number;
  depth: number;
  score: number;
  flag: TTFlag;
  bestMove: Move | null;
  age: number;
}

const TT_SIZE = 131072;
const TT_MASK = TT_SIZE - 1;
const transpositionTable: (TTEntry | null)[] = new Array(TT_SIZE).fill(null);
let currentTTAage = 0;

export function clearTranspositionTable() {
  currentTTAage++;
  for (let i = 0; i < TT_SIZE; i++) {
    transpositionTable[i] = null;
  }
}

function probeTT(hash: ZobristHash): TTEntry | null {
  const idx = (hash.hi ^ hash.lo) & TT_MASK;
  const entry = transpositionTable[idx];
  if (entry && entry.keyHi === hash.hi && entry.keyLo === hash.lo) {
    return entry;
  }
  return null;
}

function recordTT(
  hash: ZobristHash,
  depth: number,
  score: number,
  flag: TTFlag,
  bestMove: Move | null
) {
  const idx = (hash.hi ^ hash.lo) & TT_MASK;
  const existing = transpositionTable[idx];
  if (!existing || depth >= existing.depth || existing.age !== currentTTAage) {
    transpositionTable[idx] = {
      keyHi: hash.hi,
      keyLo: hash.lo,
      depth,
      score,
      flag,
      bestMove,
      age: currentTTAage
    };
  }
}

// ============================================================================
// 3. ĐÁNH GIÁ VẬT CHẤT & PIECE-SQUARE TABLES THEO GIAI ĐOẠN (TAPERED EVALUATION)
// ============================================================================

export const MATERIAL_VALUES_MG: Record<PieceType, number> = {
  k: 10000,
  r: 1000,
  c: 480,
  h: 430,
  a: 220,
  e: 220,
  p: 100,
  u: 300
};

export const MATERIAL_VALUES_EG: Record<PieceType, number> = {
  k: 10000,
  r: 1000,
  c: 420,
  h: 470,
  a: 220,
  e: 220,
  p: 120,
  u: 280
};

const PST_CHARIOT_MG: number[][] = [
  [20, 25, 20, 25, 20, 25, 20, 25, 20],
  [25, 35, 25, 30, 25, 30, 25, 35, 25],
  [20, 25, 20, 25, 20, 25, 20, 25, 20],
  [25, 35, 25, 30, 25, 30, 25, 35, 25],
  [15, 20, 15, 20, 15, 20, 15, 20, 15],
  [10, 15, 10, 15, 10, 15, 10, 15, 10],
  [ 5, 10,  5, 10,  5, 10,  5, 10,  5],
  [ 0,  5,  0,  5,  0,  5,  0,  5,  0],
  [-5,  5, -5,  5, -5,  5, -5,  5, -5],
  [-25, 0, -25, 0, -35, 0, -25, 0, -25]
];

const PST_CHARIOT_EG: number[][] = [
  [30, 35, 30, 35, 30, 35, 30, 35, 30],
  [30, 40, 30, 35, 30, 35, 30, 40, 30],
  [25, 30, 25, 30, 25, 30, 25, 30, 25],
  [25, 35, 25, 30, 25, 30, 25, 35, 25],
  [15, 20, 15, 20, 15, 20, 15, 20, 15],
  [10, 15, 10, 15, 10, 15, 10, 15, 10],
  [ 5, 10,  5, 10,  5, 10,  5, 10,  5],
  [ 0,  5,  0,  5,  0,  5,  0,  5,  0],
  [-5,  0, -5,  0, -5,  0, -5,  0, -5],
  [-10, 0, -10, 0, -10, 0, -10, 0, -10]
];

const PST_HORSE_MG: number[][] = [
  [  0,  -5,  15,  25,  15,  25,  15,  -5,   0],
  [  5,  20,  30,  40,  20,  40,  30,  20,   5],
  [ 10,  25,  35,  45,  35,  45,  35,  25,  10],
  [ 15,  30,  40,  45,  40,  45,  40,  30,  15],
  [  5,  20,  25,  30,  30,  30,  25,  20,   5],
  [  0,  10,  15,  20,  20,  20,  15,  10,   0],
  [ -5,   5,  10,  15,  15,  15,  10,   5,  -5],
  [-10,   0,   5,  10,   5,  10,   5,   0, -10],
  [-15,  -5,   0,   5, -15,   5,   0,  -5, -15],
  [-25, -10, -15,  -5, -20,  -5, -15, -10, -25]
];

const PST_HORSE_EG: number[][] = [
  [  0,   5,  25,  35,  20,  35,  25,   5,   0],
  [ 10,  30,  45,  55,  35,  55,  45,  30,  10],
  [ 15,  35,  50,  60,  50,  60,  50,  35,  15],
  [ 20,  35,  45,  50,  45,  50,  45,  35,  20],
  [ 10,  25,  30,  35,  35,  35,  30,  25,  10],
  [  5,  15,  20,  25,  25,  25,  20,  15,   5],
  [  0,  10,  15,  20,  20,  20,  15,  10,   0],
  [ -5,   5,  10,  15,  10,  15,  10,   5,  -5],
  [-10,  -5,   0,   5, -10,   5,   0,  -5, -10],
  [-20, -10, -10,  -5, -15,  -5, -10, -10, -20]
];

const PST_CANNON_MG: number[][] = [
  [ 5, 10, 15, 20, 25, 20, 15, 10,  5],
  [ 5, 10, 15, 25, 35, 25, 15, 10,  5],
  [ 0,  5, 10, 20, 30, 20, 10,  5,  0],
  [ 0,  5, 10, 15, 20, 15, 10,  5,  0],
  [ 0,  0,  5, 10, 15, 10,  5,  0,  0],
  [ 0,  0,  5,  5, 10,  5,  5,  0,  0],
  [ 0,  5,  5,  5, 10,  5,  5,  5,  0],
  [ 0,  5,  5, 15, 30, 15,  5,  5,  0],
  [ 0,  0,  0,  0,  5,  0,  0,  0,  0],
  [-5,  0,  5,  0, 10,  0,  5,  0, -5]
];

const PST_CANNON_EG: number[][] = [
  [ 5, 10, 15, 20, 25, 20, 15, 10,  5],
  [ 5, 10, 15, 20, 25, 20, 15, 10,  5],
  [ 0,  5, 10, 15, 20, 15, 10,  5,  0],
  [ 0,  5,  5, 10, 15, 10,  5,  5,  0],
  [ 0,  0,  5,  5, 10,  5,  5,  0,  0],
  [ 0,  0,  5,  5, 10,  5,  5,  0,  0],
  [ 0,  0,  0,  5,  5,  5,  0,  0,  0],
  [ 0,  0,  0,  5, 10,  5,  0,  0,  0],
  [ 0,  0,  0,  0,  5,  0,  0,  0,  0],
  [-5,  0,  0,  0,  5,  0,  0,  0, -5]
];

const PST_PAWN_MG: number[][] = [
  [ 0, 10, 20, 35, 45, 35, 20, 10,  0],
  [15, 30, 45, 60, 70, 60, 45, 30, 15],
  [15, 25, 35, 50, 60, 50, 35, 25, 15],
  [10, 20, 30, 40, 45, 40, 30, 20, 10],
  [ 5, 15, 20, 25, 30, 25, 20, 15,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  5,  0, 10,  0,  5,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0]
];

const PST_PAWN_EG: number[][] = [
  [ 0, 15, 35, 55, 65, 55, 35, 15,  0],
  [30, 50, 70, 95, 110, 95, 70, 50, 30],
  [25, 45, 60, 80, 95, 80, 60, 45, 25],
  [20, 35, 45, 60, 70, 60, 45, 35, 20],
  [15, 25, 35, 40, 45, 40, 35, 25, 15],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0]
];

const PST_ADVISOR: number[][] = [
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  5,  0,  5, 0, 0, 0],
  [0, 0, 0,  0, 15,  0, 0, 0, 0],
  [0, 0, 0,  5,  0,  5, 0, 0, 0]
];

const PST_ELEPHANT: number[][] = [
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  5, 0,  0, 0,  5, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0, 10, 0, 15, 0, 10, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  5, 0,  0, 0,  5, 0, 0]
];

const PST_KING_MG: number[][] = [
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0, -20, -30, -20, 0, 0, 0],
  [0, 0, 0, -10, -15, -10, 0, 0, 0],
  [0, 0, 0,   5,  15,   5, 0, 0, 0]
];

const PST_KING_EG: number[][] = [
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0, -5, -5, -5, 0, 0, 0],
  [0, 0, 0,  5,  5,  5, 0, 0, 0],
  [0, 0, 0, 10, 10, 10, 0, 0, 0]
];

// ============================================================================
// 4. HÀM ĐÁNH GIÁ THẾ CỜ TOÀN DIỆN (EVALUATION FUNCTION)
// ============================================================================

export function evaluateBoard(board: (string | null)[][]): number {
  let materialRedMG = 0;
  let materialBlackMG = 0;
  let materialRedEG = 0;
  let materialBlackEG = 0;

  let pstRedMG = 0;
  let pstBlackMG = 0;
  let pstRedEG = 0;
  let pstBlackEG = 0;

  let mobilityRed = 0;
  let mobilityBlack = 0;

  let redAdvisors = 0;
  let redElephants = 0;
  let blackAdvisors = 0;
  let blackElephants = 0;

  let redChariotsMoved = 0;
  let blackChariotsMoved = 0;

  let majorPieceWeight = 0;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const code = board[r][c];
      if (!code) continue;
      const piece = PIECES[code];
      const isRed = piece.color === 'r';

      let baseValMG = MATERIAL_VALUES_MG[piece.type];
      let baseValEG = MATERIAL_VALUES_EG[piece.type];

      if (piece.type === 'r') majorPieceWeight += 4;
      else if (piece.type === 'c' || piece.type === 'h') majorPieceWeight += 2;

      if (piece.type === 'p') {
        const hasCrossed = isRed ? r <= 4 : r >= 5;
        if (hasCrossed) {
          baseValMG += 120;
          baseValEG += 150;

          const isNearPalace = isRed ? r <= 2 && c >= 2 && c <= 6 : r >= 7 && c >= 2 && c <= 6;
          if (isNearPalace) {
            baseValMG += 80;
            baseValEG += 120;
          }
        }
      }

      if (isRed) {
        materialRedMG += baseValMG;
        materialRedEG += baseValEG;
        if (piece.type === 'a') redAdvisors++;
        if (piece.type === 'e') redElephants++;
        if (piece.type === 'r' && (r !== 9 || (c !== 0 && c !== 8))) redChariotsMoved++;
      } else {
        materialBlackMG += baseValMG;
        materialBlackEG += baseValEG;
        if (piece.type === 'a') blackAdvisors++;
        if (piece.type === 'e') blackElephants++;
        if (piece.type === 'r' && (r !== 0 || (c !== 0 && c !== 8))) blackChariotsMoved++;
      }

      const pstR = isRed ? r : 9 - r;
      const pstC = isRed ? c : 8 - c;

      let scoreMG = 0;
      let scoreEG = 0;

      switch (piece.type) {
        case 'k':
          scoreMG = PST_KING_MG[pstR][pstC];
          scoreEG = PST_KING_EG[pstR][pstC];
          break;
        case 'a':
          scoreMG = PST_ADVISOR[pstR][pstC];
          scoreEG = PST_ADVISOR[pstR][pstC];
          break;
        case 'e':
          scoreMG = PST_ELEPHANT[pstR][pstC];
          scoreEG = PST_ELEPHANT[pstR][pstC];
          break;
        case 'h':
          scoreMG = PST_HORSE_MG[pstR][pstC];
          scoreEG = PST_HORSE_EG[pstR][pstC];
          break;
        case 'r':
          scoreMG = PST_CHARIOT_MG[pstR][pstC];
          scoreEG = PST_CHARIOT_EG[pstR][pstC];
          break;
        case 'c':
          scoreMG = PST_CANNON_MG[pstR][pstC];
          scoreEG = PST_CANNON_EG[pstR][pstC];
          break;
        case 'p':
          scoreMG = PST_PAWN_MG[pstR][pstC];
          scoreEG = PST_PAWN_EG[pstR][pstC];
          break;
      }

      if (isRed) {
        pstRedMG += scoreMG;
        pstRedEG += scoreEG;
      } else {
        pstBlackMG += scoreMG;
        pstBlackEG += scoreEG;
      }

      if (piece.type === 'r') {
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        let rMobility = 0;
        for (const [dr, dc] of dirs) {
          let tr = r + dr;
          let tc = c + dc;
          while (isValidPos(tr, tc)) {
            rMobility++;
            if (board[tr][tc] !== null) break;
            tr += dr;
            tc += dc;
          }
        }
        const mobVal = rMobility * 6;
        if (isRed) mobilityRed += mobVal; else mobilityBlack += mobVal;
      } else if (piece.type === 'h') {
        const jumps = [
          { leg: [-1, 0], targets: [[-2, -1], [-2, 1]] },
          { leg: [1, 0],  targets: [[2, -1], [2, 1]] },
          { leg: [0, -1], targets: [[-1, -2], [1, -2]] },
          { leg: [0, 1],  targets: [[-1, 2], [1, 2]] }
        ];
        let hMobility = 0;
        let blockedLegs = 0;
        for (const j of jumps) {
          const lr = r + j.leg[0];
          const lc = c + j.leg[1];
          if (isValidPos(lr, lc) && board[lr][lc] === null) {
            for (const [tr, tc] of j.targets) {
              if (isValidPos(r + tr, c + tc)) hMobility++;
            }
          } else {
            blockedLegs++;
          }
        }
        let horseScore = hMobility * 4;
        if (blockedLegs >= 3) horseScore -= 35;
        else if (blockedLegs === 2) horseScore -= 15;

        if (isRed) mobilityRed += horseScore; else mobilityBlack += horseScore;
      } else if (piece.type === 'c') {
        if (c === 4) {
          const bonus = 25;
          if (isRed) mobilityRed += bonus; else mobilityBlack += bonus;
        }
      }
    }
  }

  let kingSafetyRed = 0;
  let kingSafetyBlack = 0;

  if (redAdvisors === 1) kingSafetyRed -= 60;
  else if (redAdvisors === 0) kingSafetyRed -= 140;

  if (blackAdvisors === 1) kingSafetyBlack -= 60;
  else if (blackAdvisors === 0) kingSafetyBlack -= 140;

  if (redElephants === 1) kingSafetyRed -= 35;
  else if (redElephants === 0) kingSafetyRed -= 80;

  if (blackElephants === 1) kingSafetyBlack -= 35;
  else if (blackElephants === 0) kingSafetyBlack -= 80;

  if (redChariotsMoved === 0) kingSafetyRed -= 40;
  if (blackChariotsMoved === 0) kingSafetyBlack -= 40;

  const phase = Math.min(32, Math.max(0, majorPieceWeight)) / 32;

  const redMG = materialRedMG + pstRedMG;
  const redEG = materialRedEG + pstRedEG;
  const blackMG = materialBlackMG + pstBlackMG;
  const blackEG = materialBlackEG + pstBlackEG;

  const totalRed = redMG * phase + redEG * (1 - phase) + mobilityRed + kingSafetyRed;
  const totalBlack = blackMG * phase + blackEG * (1 - phase) + mobilityBlack + kingSafetyBlack;

  return Math.round(totalRed - totalBlack);
}

// ============================================================================
// 5. MOVE ORDERING (TỐI ƯU HÓA THỨ TỰ NƯỚC ĐI - MVV-LVA, KILLER, HISTORY)
// ============================================================================

const killerMoves: [Move | null, Move | null][] = Array.from({ length: 32 }, () => [null, null]);
const historyTable: number[][] = Array.from({ length: 90 }, () => new Array(90).fill(0));

export function clearHeuristics() {
  for (let i = 0; i < 32; i++) {
    killerMoves[i] = [null, null];
  }
  for (let i = 0; i < 90; i++) {
    historyTable[i].fill(0);
  }
}

function scoreMove(
  board: (string | null)[][],
  move: Move,
  pvMove: Move | null,
  ply: number
): number {
  if (
    pvMove &&
    move.fromR === pvMove.fromR &&
    move.fromC === pvMove.fromC &&
    move.toR === pvMove.toR &&
    move.toC === pvMove.toC
  ) {
    return 2000000;
  }

  const movingPieceCode = board[move.fromR][move.fromC];
  const targetPieceCode = board[move.toR][move.toC] || move.captured;

  if (targetPieceCode && movingPieceCode) {
    const victimVal = PIECES[targetPieceCode].val;
    const attackerVal = PIECES[movingPieceCode].val;
    return 1000000 + victimVal * 10 - attackerVal;
  }

  if (ply < 32) {
    const [k1, k2] = killerMoves[ply];
    if (k1 && move.fromR === k1.fromR && move.fromC === k1.fromC && move.toR === k1.toR && move.toC === k1.toC) {
      return 800000;
    }
    if (k2 && move.fromR === k2.fromR && move.fromC === k2.fromC && move.toR === k2.toR && move.toC === k2.toC) {
      return 700000;
    }
  }

  const fromSq = move.fromR * 9 + move.fromC;
  const toSq = move.toR * 9 + move.toC;
  return Math.min(500000, historyTable[fromSq][toSq]);
}

export function orderMoves(
  board: (string | null)[][],
  moves: Move[],
  pvMove: Move | null = null,
  ply: number = 0
): Move[] {
  const scored = moves.map(m => ({
    move: m,
    score: scoreMove(board, m, pvMove, ply)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.move);
}

// ============================================================================
// 6. QUIESCENCE SEARCH (TÌM KIẾM TĨNH TRÁNH HIỆU ỨNG CHÂN TRỜI)
// ============================================================================

function quiescence(
  board: (string | null)[][],
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  depthLeft: number = 4
): number {
  const standPat = evaluateBoard(board);

  if (depthLeft <= 0) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat < alpha - 1100) return alpha;
    alpha = Math.max(alpha, standPat);

    const moves = getAllLegalMoves(board, 'r').filter(m => m.captured !== null);
    if (moves.length === 0) return standPat;

    const ordered = orderMoves(board, moves, null, 0);
    for (const m of ordered) {
      const nextB = simulateMove(board, m);
      const score = quiescence(nextB, alpha, beta, false, depthLeft - 1);
      if (score >= beta) return beta;
      alpha = Math.max(alpha, score);
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat > beta + 1100) return beta;
    beta = Math.min(beta, standPat);

    const moves = getAllLegalMoves(board, 'b').filter(m => m.captured !== null);
    if (moves.length === 0) return standPat;

    const ordered = orderMoves(board, moves, null, 0);
    for (const m of ordered) {
      const nextB = simulateMove(board, m);
      const score = quiescence(nextB, alpha, beta, true, depthLeft - 1);
      if (score <= alpha) return alpha;
      beta = Math.min(beta, score);
    }
    return beta;
  }
}

// ============================================================================
// 7. MINIMAX VỚI ALPHA-BETA PRUNING & TRANSPOSITION TABLE
// ============================================================================

interface SearchContext {
  startTime: number;
  timeLimitMs: number;
  isAborted: boolean;
  nodesEvaluated: number;
  useQuiescence: boolean;
  maxQuiescenceDepth: number;
}

function minimax(
  board: (string | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  ply: number,
  ctx: SearchContext
): number {
  ctx.nodesEvaluated++;

  if ((ctx.nodesEvaluated & 1023) === 0) {
    if (Date.now() - ctx.startTime >= ctx.timeLimitMs) {
      ctx.isAborted = true;
      return isMaximizing ? alpha : beta;
    }
  }

  const color: PieceColor = isMaximizing ? 'r' : 'b';
  const originalAlpha = alpha;
  const hash = computeZobristHash(board, color);

  const ttEntry = probeTT(hash);
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.flag === TTFlag.EXACT) {
      return ttEntry.score;
    } else if (ttEntry.flag === TTFlag.LOWERBOUND) {
      alpha = Math.max(alpha, ttEntry.score);
    } else if (ttEntry.flag === TTFlag.UPPERBOUND) {
      beta = Math.min(beta, ttEntry.score);
    }
    if (alpha >= beta) {
      return ttEntry.score;
    }
  }

  if (depth <= 0) {
    if (ctx.useQuiescence) {
      return quiescence(board, alpha, beta, isMaximizing, ctx.maxQuiescenceDepth);
    }
    return evaluateBoard(board);
  }

  const legalMoves = getAllLegalMoves(board, color);
  if (legalMoves.length === 0) {
    return isMaximizing ? -99999 + ply : 99999 - ply;
  }

  const pvMove = ttEntry ? ttEntry.bestMove : null;
  const ordered = orderMoves(board, legalMoves, pvMove, ply);

  let bestMove: Move | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of ordered) {
      const nextB = simulateMove(board, m);
      const evalScore = minimax(nextB, depth - 1, alpha, beta, false, ply + 1, ctx);
      if (ctx.isAborted) return maxEval;

      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMove = m;
      }
      alpha = Math.max(alpha, evalScore);

      if (beta <= alpha) {
        if (!m.captured && ply < 32) {
          killerMoves[ply][1] = killerMoves[ply][0];
          killerMoves[ply][0] = m;
        }
        const fromSq = m.fromR * 9 + m.fromC;
        const toSq = m.toR * 9 + m.toC;
        historyTable[fromSq][toSq] += depth * depth;
        break;
      }
    }

    let flag = TTFlag.EXACT;
    if (maxEval <= originalAlpha) flag = TTFlag.UPPERBOUND;
    else if (maxEval >= beta) flag = TTFlag.LOWERBOUND;
    recordTT(hash, depth, maxEval, flag, bestMove);

    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of ordered) {
      const nextB = simulateMove(board, m);
      const evalScore = minimax(nextB, depth - 1, alpha, beta, true, ply + 1, ctx);
      if (ctx.isAborted) return minEval;

      if (evalScore < minEval) {
        minEval = evalScore;
        bestMove = m;
      }
      beta = Math.min(beta, evalScore);

      if (beta <= alpha) {
        if (!m.captured && ply < 32) {
          killerMoves[ply][1] = killerMoves[ply][0];
          killerMoves[ply][0] = m;
        }
        const fromSq = m.fromR * 9 + m.fromC;
        const toSq = m.toR * 9 + m.toC;
        historyTable[fromSq][toSq] += depth * depth;
        break;
      }
    }

    let flag = TTFlag.EXACT;
    if (minEval <= originalAlpha) flag = TTFlag.LOWERBOUND;
    else if (minEval >= beta) flag = TTFlag.UPPERBOUND;
    recordTT(hash, depth, minEval, flag, bestMove);

    return minEval;
  }
}

// ============================================================================
// 8. HỆ THỐNG ĐIỀU CHỈNH 4 CẤP ĐỘ KHÓ & ITERATIVE DEEPENING
// ============================================================================

export interface BotSearchResult {
  move: Move;
  depthReached: number;
  score: number;
  nodesEvaluated: number;
  timeSpentMs: number;
  openingName?: string;
  isBookMove?: boolean;
}

export function findBestMoveEngine(
  board: (string | null)[][],
  color: PieceColor,
  difficulty: BotDifficulty = 'medium',
  moveCount: number = 0
): BotSearchResult | null {
  const startTime = Date.now();
  const legalMoves = getAllLegalMoves(board, color);
  if (legalMoves.length === 0) return null;

  const bookResult = getOpeningBookMove(board, color, difficulty, moveCount);
  if (bookResult) {
    return {
      move: bookResult.move,
      depthReached: 99,
      score: 0,
      nodesEvaluated: 1,
      timeSpentMs: Math.min(30, Date.now() - startTime),
      openingName: bookResult.variantName,
      isBookMove: true
    };
  }

  const isRed = color === 'r';

  if (difficulty === 'easy') {
    if (Math.random() < 0.35) {
      const randomIdx = Math.floor(Math.random() * legalMoves.length);
      return {
        move: legalMoves[randomIdx],
        depthReached: 1,
        score: evaluateBoard(board),
        nodesEvaluated: 1,
        timeSpentMs: Date.now() - startTime
      };
    }

    const scored = legalMoves.map(m => {
      const nextB = simulateMove(board, m);
      return { move: m, score: evaluateBoard(nextB) };
    });
    scored.sort((a, b) => isRed ? b.score - a.score : a.score - b.score);

    const chosenIdx = Math.min(scored.length - 1, Math.random() < 0.7 ? 0 : 1);
    return {
      move: scored[chosenIdx].move,
      depthReached: 1,
      score: scored[chosenIdx].score,
      nodesEvaluated: scored.length,
      timeSpentMs: Date.now() - startTime
    };
  }

  if (difficulty === 'medium') {
    const depth = 3;
    const ctx: SearchContext = {
      startTime,
      timeLimitMs: 1200,
      isAborted: false,
      nodesEvaluated: 0,
      useQuiescence: false,
      maxQuiescenceDepth: 1
    };

    const ordered = orderMoves(board, legalMoves, null, 0);
    const scoredMoves: { move: Move; score: number }[] = [];

    for (const m of ordered) {
      const nextB = simulateMove(board, m);
      const score = minimax(nextB, depth - 1, -Infinity, Infinity, !isRed, 1, ctx);
      scoredMoves.push({ move: m, score });
    }

    scoredMoves.sort((a, b) => isRed ? b.score - a.score : a.score - b.score);

    const chosenIdx = Math.random() < 0.10 && scoredMoves.length > 1 ? 1 : 0;
    return {
      move: scoredMoves[chosenIdx].move,
      depthReached: depth,
      score: scoredMoves[chosenIdx].score,
      nodesEvaluated: ctx.nodesEvaluated,
      timeSpentMs: Date.now() - startTime
    };
  }

  if (difficulty === 'hard') {
    const depth = 5;
    const ctx: SearchContext = {
      startTime,
      timeLimitMs: 2200,
      isAborted: false,
      nodesEvaluated: 0,
      useQuiescence: true,
      maxQuiescenceDepth: 3
    };

    const hash = computeZobristHash(board, color);
    const ttEntry = probeTT(hash);
    const pvMove = ttEntry ? ttEntry.bestMove : null;
    const ordered = orderMoves(board, legalMoves, pvMove, 0);

    let bestMove = ordered[0];
    let bestScore = isRed ? -Infinity : Infinity;

    for (const m of ordered) {
      const nextB = simulateMove(board, m);
      const score = minimax(nextB, depth - 1, -Infinity, Infinity, !isRed, 1, ctx);
      if (ctx.isAborted) break;

      if (isRed) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = m;
        }
      }
    }

    recordTT(hash, depth, bestScore, TTFlag.EXACT, bestMove);

    return {
      move: bestMove,
      depthReached: depth,
      score: bestScore,
      nodesEvaluated: ctx.nodesEvaluated,
      timeSpentMs: Date.now() - startTime
    };
  }

  const maxDepth = 8;
  const timeLimitMs = 2500;
  const ctx: SearchContext = {
    startTime,
    timeLimitMs,
    isAborted: false,
    nodesEvaluated: 0,
    useQuiescence: true,
    maxQuiescenceDepth: 4
  };

  const hash = computeZobristHash(board, color);
  let globalBestMove: Move = legalMoves[0];
  let globalBestScore = isRed ? -Infinity : Infinity;
  let finalDepthReached = 1;

  clearHeuristics();

  for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
    let currentBestMove = legalMoves[0];
    let currentBestScore = isRed ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    const ttEntry = probeTT(hash);
    const pvMove = ttEntry ? ttEntry.bestMove : globalBestMove;
    const ordered = orderMoves(board, legalMoves, pvMove, 0);

    let iterationCompleted = true;

    for (const m of ordered) {
      const nextB = simulateMove(board, m);
      const score = minimax(nextB, currentDepth - 1, alpha, beta, !isRed, 1, ctx);

      if (ctx.isAborted) {
        iterationCompleted = false;
        break;
      }

      if (isRed) {
        if (score > currentBestScore) {
          currentBestScore = score;
          currentBestMove = m;
        }
        alpha = Math.max(alpha, score);
      } else {
        if (score < currentBestScore) {
          currentBestScore = score;
          currentBestMove = m;
        }
        beta = Math.min(beta, score);
      }

      if (beta <= alpha) break;
    }

    if (iterationCompleted) {
      globalBestMove = currentBestMove;
      globalBestScore = currentBestScore;
      finalDepthReached = currentDepth;
      recordTT(hash, currentDepth, currentBestScore, TTFlag.EXACT, currentBestMove);

      if (Math.abs(currentBestScore) > 90000) {
        break;
      }
    } else {
      break;
    }

    if (Date.now() - startTime >= timeLimitMs * 0.6) {
      break;
    }
  }

  return {
    move: globalBestMove,
    depthReached: finalDepthReached,
    score: globalBestScore,
    nodesEvaluated: ctx.nodesEvaluated,
    timeSpentMs: Date.now() - startTime
  };
}

export function findOptimalAnalysisMove(
  board: (string | null)[][],
  color: PieceColor,
  depth: number = 3
): BotSearchResult | null {
  const startTime = Date.now();
  const legalMoves = getAllLegalMoves(board, color);
  if (legalMoves.length === 0) return null;

  const isRed = color === 'r';
  const ctx: SearchContext = {
    startTime,
    timeLimitMs: 900,
    isAborted: false,
    nodesEvaluated: 0,
    useQuiescence: true,
    maxQuiescenceDepth: 2
  };

  const hash = computeZobristHash(board, color);
  const ttEntry = probeTT(hash);
  const pvMove = ttEntry ? ttEntry.bestMove : null;
  const ordered = orderMoves(board, legalMoves, pvMove, 0);

  let bestMove = ordered[0];
  let bestScore = isRed ? -Infinity : Infinity;

  for (const m of ordered) {
    const nextB = simulateMove(board, m);
    const score = minimax(nextB, depth - 1, -Infinity, Infinity, !isRed, 1, ctx);
    if (ctx.isAborted) break;

    if (isRed) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
  }

  return {
    move: bestMove,
    depthReached: depth,
    score: bestScore,
    nodesEvaluated: ctx.nodesEvaluated,
    timeSpentMs: Date.now() - startTime
  };
}
