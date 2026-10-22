import { PieceColor, PieceType, PIECES, Move, MoveRecord, MoveNotation, BotDifficulty } from './xiangqi-types';
import { findBestMoveEngine, evaluateBoard as evaluateBoardEngine } from './xiangqi-engine';

export const PST_HORSE = [
  [0, -10,  0,  0,  0,  0,  0, -10,  0],
  [0,   5, 10,  5,  5,  5, 10,   5,  0],
  [4,  10, 15, 20, 20, 20, 15,  10,  4],
  [6,  12, 18, 24, 24, 24, 18,  12,  6],
  [8,  16, 22, 28, 28, 28, 22,  16,  8],
  [6,  14, 20, 25, 25, 25, 20,  14,  6],
  [4,  10, 14, 18, 18, 18, 14,  10,  4],
  [2,   6,  8, 10, 10, 10,  8,   6,  2],
  [0,   4,  4,  4,  0,  4,  4,   4,  0],
  [0,  -4,  0,  0,  0,  0,  0,  -4,  0]
];

export const PST_CHARIOT = [
  [15, 20, 15, 15, 20, 15, 15, 20, 15],
  [15, 20, 15, 15, 20, 15, 15, 20, 15],
  [10, 15, 10, 10, 15, 10, 10, 15, 10],
  [10, 15, 10, 10, 15, 10, 10, 15, 10],
  [ 8, 12,  8,  8, 12,  8,  8, 12,  8],
  [ 6, 10,  6,  6, 10,  6,  6, 10,  6],
  [ 4,  8,  4,  4,  8,  4,  4,  8,  4],
  [ 2,  6,  2,  2,  6,  2,  2,  6,  2],
  [ 0,  4,  0,  0,  4,  0,  0,  4,  0],
  [-2,  2, -2, -2,  2, -2, -2,  2, -2]
];

export const PST_CANNON = [
  [10, 10, 10, 15, 15, 15, 10, 10, 10],
  [ 8,  8,  8, 12, 12, 12,  8,  8,  8],
  [ 6,  6,  6, 10, 10, 10,  6,  6,  6],
  [ 4,  4,  4,  8,  8,  8,  4,  4,  4],
  [ 0,  0,  0,  4,  4,  4,  0,  0,  0],
  [ 0,  0,  0,  0,  2,  0,  0,  0,  0],
  [ 0,  2,  0,  0,  0,  0,  0,  2,  0],
  [ 0,  4,  2,  0,  0,  0,  2,  4,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0]
];

export const PST_SOLDIER = [
  [30, 40, 50, 60, 70, 60, 50, 40, 30],
  [25, 35, 45, 55, 60, 55, 45, 35, 25],
  [20, 30, 40, 45, 50, 45, 40, 30, 20],
  [15, 20, 25, 30, 35, 30, 25, 20, 15],
  [10, 15, 20, 25, 25, 25, 20, 15, 10],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0, -2,  0,  4,  0, -2,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0]
];

export function isValidPos(r: number, c: number): boolean {
  return r >= 0 && r <= 9 && c >= 0 && c <= 8;
}

export function isInsidePalace(color: PieceColor, r: number, c: number): boolean {
  if (c < 3 || c > 5) return false;
  if (color === 'r') return r >= 7 && r <= 9;
  return r >= 0 && r <= 2;
}

export function findGeneral(board: (string | null)[][], color: PieceColor): { r: number; c: number } | null {
  const code = color === 'r' ? 'r_k' : 'b_k';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === code) return { r, c };
    }
  }
  return null;
}

export function areGeneralsFacing(board: (string | null)[][]): boolean {
  const rK = findGeneral(board, 'r');
  const bK = findGeneral(board, 'b');
  if (!rK || !bK) return false;
  if (rK.c !== bK.c) return false;
  const col = rK.c;
  const minR = Math.min(rK.r, bK.r);
  const maxR = Math.max(rK.r, bK.r);
  for (let r = minR + 1; r < maxR; r++) {
    if (board[r][col] !== null) return false;
  }
  return true;
}

export function getPseudoMoves(board: (string | null)[][], r: number, c: number): Move[] {
  const code = board[r][c];
  if (!code) return [];
  const piece = PIECES[code];
  const color = piece.color;
  const moves: Move[] = [];

  const addMove = (tr: number, tc: number) => {
    if (!isValidPos(tr, tc)) return;
    const target = board[tr][tc];
    if (!target) {
      moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: null });
    } else if (PIECES[target].color !== color) {
      moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: target });
    }
  };

  switch (piece.type) {
    case 'k': {
      const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of deltas) {
        const tr = r + dr;
        const tc = c + dc;
        if (isInsidePalace(color, tr, tc)) addMove(tr, tc);
      }
      break;
    }
    case 'a': {
      const deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of deltas) {
        const tr = r + dr;
        const tc = c + dc;
        if (isInsidePalace(color, tr, tc)) addMove(tr, tc);
      }
      break;
    }
    case 'e': {
      const deltas = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
      for (const [dr, dc] of deltas) {
        const tr = r + dr;
        const tc = c + dc;
        if (color === 'r' && tr < 5) continue; // Tượng đỏ không qua sông
        if (color === 'b' && tr > 4) continue; // Tượng đen không qua sông
        if (isValidPos(tr, tc)) {
          const eyeR = r + dr / 2;
          const eyeC = c + dc / 2;
          if (board[eyeR][eyeC] === null) addMove(tr, tc); // Mắt tượng không bị cản
        }
      }
      break;
    }
    case 'h': {
      const jumps = [
        { leg: [-1, 0], targets: [[-2, -1], [-2, 1]] },
        { leg: [1, 0],  targets: [[2, -1], [2, 1]] },
        { leg: [0, -1], targets: [[-1, -2], [1, -2]] },
        { leg: [0, 1],  targets: [[-1, 2], [1, 2]] }
      ];
      for (const j of jumps) {
        const lr = r + j.leg[0];
        const lc = c + j.leg[1];
        if (isValidPos(lr, lc) && board[lr][lc] === null) {
          for (const [tr, tc] of j.targets) addMove(r + tr, c + tc);
        }
      }
      break;
    }
    case 'r': {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let tr = r + dr;
        let tc = c + dc;
        while (isValidPos(tr, tc)) {
          if (board[tr][tc] === null) {
            moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: null });
          } else {
            if (PIECES[board[tr][tc]!].color !== color) {
              moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: board[tr][tc] });
            }
            break;
          }
          tr += dr;
          tc += dc;
        }
      }
      break;
    }
    case 'c': {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let tr = r + dr;
        let tc = c + dc;
        let foundScreen = false;
        while (isValidPos(tr, tc)) {
          if (!foundScreen) {
            if (board[tr][tc] === null) {
              moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: null });
            } else {
              foundScreen = true; // Quân làm ngòi
            }
          } else {
            if (board[tr][tc] !== null) {
              if (PIECES[board[tr][tc]!].color !== color) {
                moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: board[tr][tc] });
              }
              break;
            }
          }
          tr += dr;
          tc += dc;
        }
      }
      break;
    }
    case 'p': {
      const forwardDir = color === 'r' ? -1 : 1;
      const crossedRiver = color === 'r' ? r <= 4 : r >= 5;
      addMove(r + forwardDir, c);
      if (crossedRiver) {
        addMove(r, c - 1);
        addMove(r, c + 1);
      }
      break;
    }
  }
  return moves;
}

export function simulateMove(board: (string | null)[][], m: Move): (string | null)[][] {
  const next = board.map(row => [...row]);
  next[m.toR][m.toC] = next[m.fromR][m.fromC];
  next[m.fromR][m.fromC] = null;
  return next;
}

export function isKingInCheck(board: (string | null)[][], color: PieceColor): boolean {
  const king = findGeneral(board, color);
  if (!king) return true;
  if (areGeneralsFacing(board)) return true;
  const enemy = color === 'r' ? 'b' : 'r';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const code = board[r][c];
      if (code && PIECES[code].color === enemy) {
        const moves = getPseudoMoves(board, r, c);
        for (const m of moves) {
          if (m.toR === king.r && m.toC === king.c) return true;
        }
      }
    }
  }
  return false;
}

export function getLegalMoves(board: (string | null)[][], r: number, c: number): Move[] {
  const pseudo = getPseudoMoves(board, r, c);
  const color = PIECES[board[r][c]!].color;
  const legal: Move[] = [];
  for (const m of pseudo) {
    const nextB = simulateMove(board, m);
    if (!isKingInCheck(nextB, color)) legal.push(m);
  }
  return legal;
}

export function getAllLegalMoves(board: (string | null)[][], color: PieceColor): Move[] {
  const all: Move[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const code = board[r][c];
      if (code && PIECES[code].color === color) {
        all.push(...getLegalMoves(board, r, c));
      }
    }
  }
  return all;
}

export function evaluateBoard(board: (string | null)[][]): number {
  return evaluateBoardEngine(board);
}

export function findBestMove(
  board: (string | null)[][],
  color: PieceColor,
  difficulty: BotDifficulty = 'medium',
  moveCount: number = 0
): Move | null {
  const result = findBestMoveEngine(board, color, difficulty, moveCount);
  return result ? result.move : null;
}

export function findBestMoveWithDetail(
  board: (string | null)[][],
  color: PieceColor,
  difficulty: BotDifficulty = 'medium',
  moveCount: number = 0
) {
  return findBestMoveEngine(board, color, difficulty, moveCount);
}

export function formatNotation(boardBefore: (string | null)[][], m: Move, isCheck = false): MoveNotation {
  const code = boardBefore[m.fromR][m.fromC];
  if (!code) return { vn: '', vnShort: '', cn: '', alg: '', isCheck: false, pieceNameVn: '' };
  const piece = PIECES[code];
  const isRed = piece.color === 'r';
  const cnNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

  const startColNum = isRed ? 9 - m.fromC : m.fromC + 1;
  const destColNum = isRed ? 9 - m.toC : m.toC + 1;

  const shortCodeMap: Record<PieceType, string> = {
    k: 'Tg',
    a: 'S',
    e: 'T',
    h: 'M',
    r: 'X',
    c: 'P',
    p: 'B',
    u: 'Úp'
  };
  const shortCode = shortCodeMap[piece.type] || piece.type.toUpperCase();

  const sameColPieces: number[] = [];
  for (let r = 0; r < 10; r++) {
    const cCode = boardBefore[r][m.fromC];
    if (cCode && PIECES[cCode].color === piece.color && PIECES[cCode].type === piece.type) {
      sameColPieces.push(r);
    }
  }

  let prefixVn = piece.nameVn;
  let prefixVnShort = shortCode;
  let prefixCn = piece.nameCn;
  let fromColVn = `${startColNum}`;
  let fromColVnShort = `${startColNum}`;
  let fromColCn = isRed ? cnNums[startColNum - 1] : `${startColNum}`;

  if (sameColPieces.length >= 2 && ['r', 'c', 'h', 'p'].includes(piece.type)) {
    const sorted = [...sameColPieces].sort((a, b) => isRed ? a - b : b - a);
    const idx = sorted.indexOf(m.fromR);
    if (sorted.length === 2) {
      const isFront = idx === 0;
      prefixVn = isFront ? `Tiền ${piece.nameVn}` : `Hậu ${piece.nameVn}`;
      prefixVnShort = isFront ? `T${shortCode}` : `H${shortCode}`;
      prefixCn = isFront ? `前${piece.nameCn}` : `后${piece.nameCn}`;
    } else if (sorted.length === 3) {
      const labels = ['Tiền', 'Trung', 'Hậu'];
      const labelsShort = ['T', 'Tr', 'H'];
      const labelsCn = ['前', '中', '后'];
      prefixVn = `${labels[idx]} ${piece.nameVn}`;
      prefixVnShort = `${labelsShort[idx]}${shortCode}`;
      prefixCn = `${labelsCn[idx]}${piece.nameCn}`;
    }
    fromColVn = '';
    fromColVnShort = '';
    fromColCn = '';
  }

  let dirVn = '';
  let dirVnShort = '';
  let dirCn = '';
  let stepVn = '';
  let stepVnShort = '';
  let stepCn = '';

  const rowDiff = m.fromR - m.toR;
  const isForward = isRed ? rowDiff > 0 : rowDiff < 0;
  const isBackward = isRed ? rowDiff < 0 : rowDiff > 0;
  const isHorizontal = m.fromR === m.toR;

  if (isHorizontal) {
    dirVn = 'bình';
    dirVnShort = '-';
    dirCn = '平';
    stepVn = `${destColNum}`;
    stepVnShort = `${destColNum}`;
    stepCn = isRed ? cnNums[destColNum - 1] : `${destColNum}`;
  } else if (isForward) {
    dirVn = 'tiến';
    dirVnShort = '.';
    dirCn = '进';
  } else {
    dirVn = 'thoái';
    dirVnShort = '/';
    dirCn = '退';
  }

  if (!isHorizontal) {
    if (['r', 'c', 'p', 'k'].includes(piece.type)) {
      const steps = Math.abs(rowDiff);
      stepVn = `${steps}`;
      stepVnShort = `${steps}`;
      stepCn = isRed ? cnNums[steps - 1] : `${steps}`;
    } else {
      stepVn = `${destColNum}`;
      stepVnShort = `${destColNum}`;
      stepCn = isRed ? cnNums[destColNum - 1] : `${destColNum}`;
    }
  }

  let vnText = fromColVn ? `${prefixVn} ${fromColVn} ${dirVn} ${stepVn}` : `${prefixVn} ${dirVn} ${stepVn}`;
  let vnShortText = fromColVnShort ? `${prefixVnShort}${fromColVnShort}${dirVnShort}${stepVnShort}` : `${prefixVnShort}${dirVnShort}${stepVnShort}`;
  let cnText = fromColCn ? `${prefixCn}${fromColCn}${dirCn}${stepCn}` : `${prefixCn}${dirCn}${stepCn}`;
  let algText = `${String.fromCharCode(65 + m.fromC)}${10 - m.fromR} ${String.fromCharCode(65 + m.toC)}${10 - m.toR}`;

  if (isCheck) {
    vnText += ' +';
    vnShortText += '+';
    cnText += '+';
    algText += '+';
  }

  return {
    vn: vnText,
    vnShort: vnShortText,
    cn: cnText,
    alg: algText,
    isCheck,
    pieceNameVn: piece.nameVn
  };
}

/**
 * Tìm vị trí và mã quân cờ đóng vai trò làm 'Ngòi Pháo' (Cannon Screen piece)
 * khi quân Pháo (Cannon) thực hiện nước đi ăn quân nhảy qua ngòi.
 */
export function findCannonScreenPiece(
  board: (string | null)[][],
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): { r: number; c: number; piece: string } | null {
  if (fromR === toR) {
    const step = toC > fromC ? 1 : -1;
    for (let c = fromC + step; c !== toC; c += step) {
      if (board[fromR][c] !== null) {
        return { r: fromR, c, piece: board[fromR][c]! };
      }
    }
  } else if (fromC === toC) {
    const step = toR > fromR ? 1 : -1;
    for (let r = fromR + step; r !== toR; r += step) {
      if (board[r][fromC] !== null) {
        return { r, c: fromC, piece: board[r][fromC]! };
      }
    }
  }
  return null;
}

/**
 * Đếm số lần chiếu liên tiếp tại cùng 1 vị trí bởi cùng 1 quân cờ của một kỳ thủ.
 * Luật cờ tướng (Trường chiếu - Perpetual Check):
 * Nếu một kỳ thủ dùng cùng 1 quân cờ liên tục chiếu Tướng quá 3 lần tại cùng 1 vị trí
 * (tức đến lần thứ 4 trở lên) mà không đổi nước đi thì sẽ bị tính Hòa (hoặc xử phạm quy).
 */
export function countConsecutiveChecksSamePieceAndPos(
  history: MoveRecord[],
  currentMove: Move,
  currentPiece: string,
  isCurrentCheck: boolean,
  playerColor: PieceColor
): number {
  if (!isCurrentCheck) return 0;

  const targetR = currentMove.toR;
  const targetC = currentMove.toC;
  const opponentColor: PieceColor = playerColor === 'r' ? 'b' : 'r';

  // Nước đi hiện tại đã là 1 lần chiếu tại (targetR, targetC) bằng currentPiece
  let checkCount = 1;

  // Lấy các nước đi của kỳ thủ này trong lịch sử theo thứ tự từ mới nhất đến cũ nhất
  const playerMoves: MoveRecord[] = [];
  for (let i = history.length - 1; i >= 0; i--) {
    const isThisPlayerMove = playerColor === 'r' ? (i % 2 === 0) : (i % 2 === 1);
    if (isThisPlayerMove) {
      playerMoves.push(history[i]);
    }
  }

  // Lần vết quân cờ này ngược dòng thời gian:
  // Nước cờ hiện tại xuất phát từ currentMove.fromR, currentMove.fromC
  let currentExpectedPos = { r: currentMove.fromR, c: currentMove.fromC };

  for (let i = 0; i < playerMoves.length; i++) {
    const rec = playerMoves[i];

    // Nếu nước đi này có ăn quân, cấu trúc bàn cờ đã thay đổi vĩnh viễn -> ngắt chuỗi trường chiếu
    if (rec.captured) {
      break;
    }

    // Nước đi trước đó của kỳ thủ này phải đưa quân cờ đến đúng vị trí currentExpectedPos
    if (rec.move.toR !== currentExpectedPos.r || rec.move.toC !== currentExpectedPos.c) {
      // Kỳ thủ đã chuyển sang đi quân cờ khác -> ngắt chuỗi của quân cờ này
      break;
    }

    // Nếu có ghi nhận mã quân cờ, phải đúng cùng quân cờ đó
    if (rec.piece && rec.piece !== currentPiece) {
      break;
    }

    // Cập nhật vị trí quân cờ trước nước đi rec
    currentExpectedPos = { r: rec.move.fromR, c: rec.move.fromC };

    // Kiểm tra xem nước đi rec có hạ xuống đúng vị trí mục tiêu (targetR, targetC) hay không
    if (rec.move.toR === targetR && rec.move.toC === targetC) {
      // Kiểm tra xem nước đi rec đó có tạo thế chiếu hay không
      const isCheckThen = rec.notation?.isCheck ||
        (rec.boardAfter && isKingInCheck(rec.boardAfter, opponentColor)) ||
        (rec.boardSnapshot && isKingInCheck(rec.boardSnapshot, opponentColor));

      if (isCheckThen) {
        checkCount++;
      } else {
        // Đến cùng vị trí nhưng không chiếu -> ngắt chuỗi
        break;
      }
    }
  }

  return checkCount;
}
