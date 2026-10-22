import { PieceColor, PieceType, PIECES, Move, MoveRecord, MoveNotation } from './xiangqi-types';
import {
  isValidPos,
  isInsidePalace,
  findGeneral,
  areGeneralsFacing
} from './xiangqi-rules';

/**
 * Bản đồ vị trí vai trò ban đầu của 32 vị trí trên bàn Cờ Tướng / Cờ Úp
 */
export const INITIAL_ROLE_BOARD: (PieceType | null)[][] = [
  ['r', 'h', 'e', 'a', 'k', 'a', 'e', 'h', 'r'],
  [null, null, null, null, null, null, null, null, null],
  [null, 'c', null, null, null, null, null, 'c', null],
  ['p', null, 'p', null, 'p', null, 'p', null, 'p'],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  ['p', null, 'p', null, 'p', null, 'p', null, 'p'],
  [null, 'c', null, null, null, null, null, 'c', null],
  [null, null, null, null, null, null, null, null, null],
  ['r', 'h', 'e', 'a', 'k', 'a', 'e', 'h', 'r']
];

/**
 * Thuật toán xáo trộn ngẫu nhiên Fisher-Yates
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Khởi tạo bàn cờ Cờ Úp (Jieqi):
 * - 2 quân Tướng (r_k và b_k) ngửa tại vị trí cung ban đầu.
 * - 15 quân còn lại mỗi bên được xáo trộn ngẫu nhiên và đặt úp (r_u / b_u).
 * - hiddenBoard lưu giữ chính xác quân cờ thật bên dưới từng ô úp.
 */
export function createInitialJieqiGame(): {
  board: (string | null)[][];
  hiddenBoard: (string | null)[][];
} {
  const redPool: string[] = [
    'r_r', 'r_r',
    'r_h', 'r_h',
    'r_e', 'r_e',
    'r_a', 'r_a',
    'r_c', 'r_c',
    'r_p', 'r_p', 'r_p', 'r_p', 'r_p'
  ];

  const blackPool: string[] = [
    'b_r', 'b_r',
    'b_h', 'b_h',
    'b_e', 'b_e',
    'b_a', 'b_a',
    'b_c', 'b_c',
    'b_p', 'b_p', 'b_p', 'b_p', 'b_p'
  ];

  const shuffledRed = shuffleArray(redPool);
  const shuffledBlack = shuffleArray(blackPool);

  const board: (string | null)[][] = Array.from({ length: 10 }, () => Array(9).fill(null));
  const hiddenBoard: (string | null)[][] = Array.from({ length: 10 }, () => Array(9).fill(null));

  // Đặt 2 quân Tướng (ngửa ngay từ đầu)
  board[0][4] = 'b_k';
  board[9][4] = 'r_k';

  // Đặt 15 quân Đen úp
  const blackPositions: [number, number][] = [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 5], [0, 6], [0, 7], [0, 8],
    [2, 1], [2, 7],
    [3, 0], [3, 2], [3, 4], [3, 6], [3, 8]
  ];
  blackPositions.forEach(([r, c], idx) => {
    board[r][c] = 'b_u';
    hiddenBoard[r][c] = shuffledBlack[idx];
  });

  // Đặt 15 quân Đỏ úp
  const redPositions: [number, number][] = [
    [9, 0], [9, 1], [9, 2], [9, 3], [9, 5], [9, 6], [9, 7], [9, 8],
    [7, 1], [7, 7],
    [6, 0], [6, 2], [6, 4], [6, 6], [6, 8]
  ];
  redPositions.forEach(([r, c], idx) => {
    board[r][c] = 'r_u';
    hiddenBoard[r][c] = shuffledRed[idx];
  });

  return { board, hiddenBoard };
}

/**
 * Kiểm tra xem một mã quân có phải là quân Úp hay không
 */
export function isPieceHidden(pieceCode: string | null): boolean {
  return pieceCode === 'r_u' || pieceCode === 'b_u';
}

/**
 * Lấy danh sách nước đi thô (pseudo-legal) của một ô cờ trong Cờ Úp
 */
export function getJieqiPseudoLegalMoves(
  board: (string | null)[][],
  r: number,
  c: number
): Move[] {
  const pieceCode = board[r][c];
  if (!pieceCode) return [];

  const moves: Move[] = [];
  const isHidden = isPieceHidden(pieceCode);
  const color: PieceColor = pieceCode.startsWith('r') ? 'r' : 'b';

  const addMove = (tr: number, tc: number) => {
    if (!isValidPos(tr, tc)) return;
    const target = board[tr][tc];
    if (!target) {
      moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: null });
    } else {
      const targetColor: PieceColor = target.startsWith('r') ? 'r' : 'b';
      if (targetColor !== color) {
        moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: target });
      }
    }
  };

  if (isHidden) {
    // Quân Úp: Di chuyển dựa theo vai trò của vị trí ô ban đầu
    const role = INITIAL_ROLE_BOARD[r][c];
    if (!role) return [];

    switch (role) {
      case 'r': {
        // Xe úp: Đi thẳng 4 hướng không giới hạn
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
          let tr = r + dr;
          let tc = c + dc;
          while (isValidPos(tr, tc)) {
            if (board[tr][tc] === null) {
              moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, captured: null });
            } else {
              const targetColor = board[tr][tc]!.startsWith('r') ? 'r' : 'b';
              if (targetColor !== color) {
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
      case 'h': {
        // Mã úp: Nhảy chữ L, có cản chân mã
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
      case 'c': {
        // Pháo úp: Đi thẳng, nhảy qua 1 quân để ăn
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
                foundScreen = true;
              }
            } else {
              if (board[tr][tc] !== null) {
                const targetColor = board[tr][tc]!.startsWith('r') ? 'r' : 'b';
                if (targetColor !== color) {
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
        // Tốt úp: Đi thẳng 1 ô về phía trước; qua sông được đi ngang
        const forwardDir = color === 'r' ? -1 : 1;
        const crossedRiver = color === 'r' ? r <= 4 : r >= 5;
        addMove(r + forwardDir, c);
        if (crossedRiver) {
          addMove(r, c - 1);
          addMove(r, c + 1);
        }
        break;
      }
      case 'a': {
        // Sĩ úp: Đi chéo 1 ô. LUẬT CHUẨN VIỆT NAM: ĐƯỢC PHÉP VƯỢT SÔNG, KHÔNG GIỚI HẠN TRONG CUNG
        const deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of deltas) {
          addMove(r + dr, c + dc);
        }
        break;
      }
      case 'e': {
        // Tượng úp: Đi chéo 2 ô, có cản mắt tượng. LUẬT CHUẨN VIỆT NAM: ĐƯỢC PHÉP VƯỢT SÔNG
        const deltas = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
        for (const [dr, dc] of deltas) {
          const tr = r + dr;
          const tc = c + dc;
          if (isValidPos(tr, tc)) {
            const eyeR = r + dr / 2;
            const eyeC = c + dc / 2;
            if (board[eyeR][eyeC] === null) {
              addMove(tr, tc);
            }
          }
        }
        break;
      }
    }
  } else {
    // Quân cờ đã lật: Đi theo quy tắc chuẩn của quân thật
    const pieceInfo = PIECES[pieceCode];
    if (!pieceInfo) return [];

    switch (pieceInfo.type) {
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
        // Sĩ thật: Nếu nằm trong cung thì đi chéo trong cung.
        // Nếu lật ngoài cung (do Sĩ úp qua sông rồi lật): đi chéo 1 ô tự do tìm đường về cung
        const inPalace = isInsidePalace(color, r, c);
        const deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of deltas) {
          const tr = r + dr;
          const tc = c + dc;
          if (inPalace) {
            if (isInsidePalace(color, tr, tc)) addMove(tr, tc);
          } else {
            addMove(tr, tc);
          }
        }
        break;
      }
      case 'e': {
        // Tượng thật: Đi chéo 2 ô, cản mắt tượng.
        // Nếu ở sân nhà: không qua sông. Nếu đã lật ở sân đối phương: đi chéo 2 ô trên đất đối phương.
        const deltas = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
        const onHomeSide = color === 'r' ? r >= 5 : r <= 4;
        for (const [dr, dc] of deltas) {
          const tr = r + dr;
          const tc = c + dc;
          if (onHomeSide) {
            if (color === 'r' && tr < 5) continue;
            if (color === 'b' && tr > 4) continue;
          }
          if (isValidPos(tr, tc)) {
            const eyeR = r + dr / 2;
            const eyeC = c + dc / 2;
            if (board[eyeR][eyeC] === null) addMove(tr, tc);
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
              const targetColor = board[tr][tc]!.startsWith('r') ? 'r' : 'b';
              if (targetColor !== color) {
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
                foundScreen = true;
              }
            } else {
              if (board[tr][tc] !== null) {
                const targetColor = board[tr][tc]!.startsWith('r') ? 'r' : 'b';
                if (targetColor !== color) {
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
  }

  return moves;
}

/**
 * Kiểm tra xem Tướng của phe color có đang bị chiếu trong Cờ Úp hay không
 */
export function isJieqiKingInCheck(board: (string | null)[][], color: PieceColor): boolean {
  const kingPos = findGeneral(board, color);
  if (!kingPos) return false;

  const enemyColor: PieceColor = color === 'r' ? 'b' : 'r';

  // 1. Kiểm tra 2 Tướng đối mặt trực diện
  if (areGeneralsFacing(board)) return true;

  // 2. Quét mọi quân địch (cả quân sáng và quân úp) xem có nước đi ăn vào ô Tướng không
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const pieceCode = board[r][c];
      if (!pieceCode) continue;
      const pieceCol: PieceColor = pieceCode.startsWith('r') ? 'r' : 'b';
      if (pieceCol !== enemyColor) continue;

      const rawMoves = getJieqiPseudoLegalMoves(board, r, c);
      for (const m of rawMoves) {
        if (m.toR === kingPos.r && m.toC === kingPos.c) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Lấy tất cả nước đi hợp lệ tuyệt đối của 1 quân cờ Cờ Úp (đã lọc chống chiếu và chống đối mặt tướng)
 */
export function getJieqiLegalMoves(
  board: (string | null)[][],
  r: number,
  c: number
): Move[] {
  const pieceCode = board[r][c];
  if (!pieceCode) return [];
  const color: PieceColor = pieceCode.startsWith('r') ? 'r' : 'b';

  const rawMoves = getJieqiPseudoLegalMoves(board, r, c);
  const legal: Move[] = [];

  for (const m of rawMoves) {
    // Mô phỏng nước đi
    const simBoard = board.map(row => [...row]);
    simBoard[m.toR][m.toC] = simBoard[m.fromR][m.fromC];
    simBoard[m.fromR][m.fromC] = null;

    // Kiểm tra xem sau nước đi tướng mình có bị chiếu không
    if (!isJieqiKingInCheck(simBoard, color)) {
      legal.push(m);
    }
  }

  return legal;
}

/**
 * Lấy tất cả nước đi hợp lệ của toàn bộ phe color trong Cờ Úp
 */
export function getAllJieqiLegalMoves(
  board: (string | null)[][],
  color: PieceColor
): Move[] {
  const allMoves: Move[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const pieceCode = board[r][c];
      if (!pieceCode) continue;
      const pieceCol: PieceColor = pieceCode.startsWith('r') ? 'r' : 'b';
      if (pieceCol === color) {
        const moves = getJieqiLegalMoves(board, r, c);
        allMoves.push(...moves);
      }
    }
  }
  return allMoves;
}

/**
 * Thực hiện nước đi Cờ Úp trên bàn cờ:
 * - Nếu quân đi là quân úp: Lật mở quân bài thật từ hiddenBoard sang board
 * - Nếu ăn phải quân úp của địch: Tiết lộ quân thật cho bên ăn
 */
export function executeJieqiMove(
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  move: Move
): {
  newBoard: (string | null)[][];
  newHiddenBoard: (string | null)[][];
  revealedPiece: string | null;
  capturedActual: string | null;
} {
  const newBoard = board.map(row => [...row]);
  const newHiddenBoard = hiddenBoard.map(row => [...row]);

  const movingPiece = board[move.fromR][move.fromC];
  const targetPiece = board[move.toR][move.toC];

  let revealedPiece: string | null = null;
  let capturedActual: string | null = null;

  // 1. Xử lý quân bị ăn
  if (targetPiece) {
    if (isPieceHidden(targetPiece)) {
      capturedActual = newHiddenBoard[move.toR][move.toC];
      newHiddenBoard[move.toR][move.toC] = null;
    } else {
      capturedActual = targetPiece;
    }
  }

  // 2. Xử lý quân di chuyển
  if (movingPiece && isPieceHidden(movingPiece)) {
    // Lật mở quân thật!
    revealedPiece = newHiddenBoard[move.fromR][move.fromC];
    newBoard[move.toR][move.toC] = revealedPiece;
    newBoard[move.fromR][move.fromC] = null;
    newHiddenBoard[move.fromR][move.fromC] = null;
  } else {
    // Quân đã mở đi bình thường
    newBoard[move.toR][move.toC] = movingPiece;
    newBoard[move.fromR][move.fromC] = null;
  }

  return {
    newBoard,
    newHiddenBoard,
    revealedPiece,
    capturedActual
  };
}

/**
 * Tạo ký hiệu biên bản nước đi cho Cờ Úp (có hiển thị kèm thông tin quân vừa lật)
 */
export function formatJieqiNotation(
  boardBefore: (string | null)[][],
  move: Move,
  revealedPiece: string | null
): MoveNotation {
  const pieceCode = boardBefore[move.fromR][move.fromC];
  if (!pieceCode) {
    return { vn: 'Nước đi', vnShort: 'Nước', cn: '着', alg: '', isCheck: false, pieceNameVn: '' };
  }

  const isHidden = isPieceHidden(pieceCode);
  const color: PieceColor = pieceCode.startsWith('r') ? 'r' : 'b';
  const role = isHidden ? INITIAL_ROLE_BOARD[move.fromR][move.fromC] || 'p' : PIECES[pieceCode].type;

  const roleNameMap: Record<PieceType, string> = {
    k: 'Tướng',
    a: 'Sĩ úp',
    e: 'Tượng úp',
    h: 'Mã úp',
    r: 'Xe úp',
    c: 'Pháo úp',
    p: 'Tốt úp',
    u: 'Quân úp'
  };

  const name = isHidden ? roleNameMap[role] : PIECES[pieceCode].nameVn;
  const colFrom = color === 'r' ? 9 - move.fromC : move.fromC + 1;
  const colTo = color === 'r' ? 9 - move.toC : move.toC + 1;

  let action = '';
  if (move.fromR === move.toR) {
    action = `bình ${colTo}`;
  } else {
    const isAdvancing = color === 'r' ? move.toR < move.fromR : move.toR > move.fromR;
    const dist = Math.abs(move.toR - move.fromR);
    if (role === 'h' || role === 'a' || role === 'e') {
      action = isAdvancing ? `tiến ${colTo}` : `thoái ${colTo}`;
    } else {
      action = isAdvancing ? `tiến ${dist}` : `thoái ${dist}`;
    }
  }

  let vn = `${name} ${colFrom} ${action}`;
  if (revealedPiece) {
    const actualPieceInfo = PIECES[revealedPiece];
    vn += ` (Mở ${actualPieceInfo ? actualPieceInfo.nameVn : '?'})`;
  }

  return {
    vn,
    vnShort: vn,
    cn: vn,
    alg: `${move.fromR}${move.fromC}-${move.toR}${move.toC}`,
    isCheck: false,
    pieceNameVn: name
  };
}
