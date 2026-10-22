export type PieceColor = 'r' | 'b';
export type PieceType = 'k' | 'a' | 'e' | 'h' | 'r' | 'c' | 'p' | 'u';
export type BoardTheme = 'imperial' | 'zen';
export type GameVariant = 'standard' | 'jieqi';

export interface PieceInfo {
  type: PieceType;
  color: PieceColor;
  nameCn: string;
  nameVn: string;
  nameEn: string;
  val: number;
}

export const PIECES: Record<string, PieceInfo> = {
  // Red (Tiên - Đỏ) - Iansui calligraphy supported glyphs
  r_k: { type: 'k', color: 'r', nameCn: '帥', nameVn: 'Tướng', nameEn: 'K', val: 10000 },
  r_a: { type: 'a', color: 'r', nameCn: '仕', nameVn: 'Sĩ',   nameEn: 'A', val: 250 },
  r_e: { type: 'e', color: 'r', nameCn: '相', nameVn: 'Tượng',nameEn: 'E', val: 250 },
  r_h: { type: 'h', color: 'r', nameCn: '傌', nameVn: 'Mã',   nameEn: 'H', val: 450 },
  r_r: { type: 'r', color: 'r', nameCn: '俥', nameVn: 'Xe',   nameEn: 'R', val: 950 },
  r_c: { type: 'c', color: 'r', nameCn: '炮', nameVn: 'Pháo', nameEn: 'C', val: 500 },
  r_p: { type: 'p', color: 'r', nameCn: '兵', nameVn: 'Tốt',  nameEn: 'S', val: 150 },
  r_u: { type: 'u', color: 'r', nameCn: 'Ẩn', nameVn: 'Úp',   nameEn: '?', val: 350 },
  // Black (Hậu - Đen) - Iansui calligraphy supported glyphs
  b_k: { type: 'k', color: 'b', nameCn: '將', nameVn: 'Tướng', nameEn: 'K', val: 10000 },
  b_a: { type: 'a', color: 'b', nameCn: '士', nameVn: 'Sĩ',   nameEn: 'A', val: 250 },
  b_e: { type: 'e', color: 'b', nameCn: '象', nameVn: 'Tượng',nameEn: 'E', val: 250 },
  b_h: { type: 'h', color: 'b', nameCn: '馬', nameVn: 'Mã',   nameEn: 'H', val: 450 },
  b_r: { type: 'r', color: 'b', nameCn: '車', nameVn: 'Xe',   nameEn: 'R', val: 950 },
  b_c: { type: 'c', color: 'b', nameCn: '包', nameVn: 'Pháo', nameEn: 'C', val: 500 },
  b_p: { type: 'p', color: 'b', nameCn: '卒', nameVn: 'Tốt',  nameEn: 'S', val: 150 },
  b_u: { type: 'u', color: 'b', nameCn: 'Ẩn', nameVn: 'Úp',   nameEn: '?', val: 350 }
};

export const INITIAL_BOARD: (string | null)[][] = [
  ['b_r', 'b_h', 'b_e', 'b_a', 'b_k', 'b_a', 'b_e', 'b_h', 'b_r'],
  [ null,  null,  null,  null,  null,  null,  null,  null,  null ],
  [ null, 'b_c',  null,  null,  null,  null,  null, 'b_c',  null ],
  ['b_p',  null, 'b_p',  null, 'b_p',  null, 'b_p',  null, 'b_p'],
  [ null,  null,  null,  null,  null,  null,  null,  null,  null ],
  [ null,  null,  null,  null,  null,  null,  null,  null,  null ],
  ['r_p',  null, 'r_p',  null, 'r_p',  null, 'r_p',  null, 'r_p'],
  [ null, 'r_c',  null,  null,  null,  null,  null, 'r_c',  null ],
  [ null,  null,  null,  null,  null,  null,  null,  null,  null ],
  ['r_r', 'r_h', 'r_e', 'r_a', 'r_k', 'r_a', 'r_e', 'r_h', 'r_r']
];

export interface Move {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  captured?: string | null;
  revealedPiece?: string | null;
  capturedActual?: string | null;
}

export interface MoveNotation {
  vn: string;
  vnShort: string;
  cn: string;
  alg: string;
  isCheck: boolean;
  pieceNameVn: string;
}

export interface MoveRecord {
  move: Move;
  piece?: string;
  captured?: string | null;
  revealedPiece?: string | null;
  capturedActual?: string | null;
  notation: MoveNotation;
  boardAfter?: (string | null)[][];
  boardSnapshot?: (string | null)[][];
}

export type RankTier = 'Tập Sự' | 'Kỳ Thủ' | 'Cao Thủ' | 'Kiện Tướng' | 'Kỳ Vương';
export type BotDifficulty = 'easy' | 'medium' | 'hard' | 'master';

export function getRankTier(elo: number, isDark: boolean = true): {
  tier: RankTier;
  colorClass: string;
  badge: string;
  minElo: number;
  nextThreshold: number;
  progressPercent: number;
} {
  let tier: RankTier = 'Tập Sự';
  let colorClass = isDark
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40'
    : 'text-emerald-700 border-emerald-600/30 bg-emerald-50';
  const badge = '';
  let minElo = 800;
  let nextThreshold = 1250;

  if (elo >= 2000) {
    tier = 'Kỳ Vương';
    colorClass = isDark
      ? 'text-amber-300 border-amber-500/40 bg-amber-950/40'
      : 'text-amber-800 border-amber-600/40 bg-amber-50';
    minElo = 2000;
    nextThreshold = 2500;
  } else if (elo >= 1700) {
    tier = 'Kiện Tướng';
    colorClass = isDark
      ? 'text-rose-300 border-rose-500/40 bg-rose-950/40'
      : 'text-rose-800 border-rose-600/40 bg-rose-50';
    minElo = 1700;
    nextThreshold = 2000;
  } else if (elo >= 1450) {
    tier = 'Cao Thủ';
    colorClass = isDark
      ? 'text-sky-300 border-sky-500/40 bg-sky-950/40'
      : 'text-sky-800 border-sky-600/40 bg-sky-50';
    minElo = 1450;
    nextThreshold = 1700;
  } else if (elo >= 1250) {
    tier = 'Kỳ Thủ';
    colorClass = isDark
      ? 'text-slate-200 border-slate-500/40 bg-slate-800/60'
      : 'text-slate-700 border-slate-400/50 bg-slate-100';
    minElo = 1250;
    nextThreshold = 1450;
  }

  const range = Math.max(1, nextThreshold - minElo);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((elo - minElo) / range) * 100)));

  return { tier, colorClass, badge, minElo, nextThreshold, progressPercent };
}

