import { PieceColor, Move, BotDifficulty, PIECES } from './xiangqi-types';
import {
  getAllJieqiLegalMoves,
  executeJieqiMove,
  isPieceHidden,
  INITIAL_ROLE_BOARD
} from './jieqi-rules';
import { PST_HORSE, PST_CHARIOT, PST_CANNON, PST_SOLDIER } from './xiangqi-rules';

/**
 * Đánh giá điểm thế cờ trong Cờ Úp (Positive = Ưu thế Đỏ, Negative = Ưu thế Đen)
 */
export function evaluateJieqiBoard(board: (string | null)[][]): number {
  let redScore = 0;
  let blackScore = 0;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const pieceCode = board[r][c];
      if (!pieceCode) continue;

      if (isPieceHidden(pieceCode)) {
        // Quân úp có giá trị kỳ vọng trung bình ~ 380 điểm
        const isRed = pieceCode === 'r_u';
        const role = INITIAL_ROLE_BOARD[r][c] || 'p';
        let roleBonus = 0;
        if (role === 'r') roleBonus = 120; // Ô Xe úp rất cơ động
        else if (role === 'c') roleBonus = 80;
        else if (role === 'h') roleBonus = 60;
        else if (role === 'p') roleBonus = 30;

        const val = 380 + roleBonus;
        if (isRed) redScore += val;
        else blackScore += val;
      } else {
        const piece = PIECES[pieceCode];
        if (!piece) continue;

        const isRed = piece.color === 'r';
        let val = piece.val;

        // Vị trí chiến lược
        const pstR = isRed ? r : 9 - r;
        switch (piece.type) {
          case 'r': val += PST_CHARIOT[pstR][c] * 2; break;
          case 'h': val += PST_HORSE[pstR][c] * 2; break;
          case 'c': val += PST_CANNON[pstR][c] * 2; break;
          case 'p': val += PST_SOLDIER[pstR][c] * 2; break;
        }

        if (isRed) redScore += val;
        else blackScore += val;
      }
    }
  }

  return redScore - blackScore;
}

/**
 * Thuật toán Minimax Alpha-Beta cho AI Cờ Úp
 */
function jieqiMinimax(
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) {
    return evaluateJieqiBoard(board);
  }

  const turn: PieceColor = isMaximizing ? 'r' : 'b';
  const legalMoves = getAllJieqiLegalMoves(board, turn);

  if (legalMoves.length === 0) {
    // Không còn nước đi => Thua cuộc
    return isMaximizing ? -20000 : 20000;
  }

  // Sắp xếp nước đi ưu tiên ăn quân để cắt tỉa Alpha-Beta hiệu quả hơn
  legalMoves.sort((a, b) => {
    const valA = a.captured ? 100 : 0;
    const valB = b.captured ? 100 : 0;
    return valB - valA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const { newBoard, newHiddenBoard } = executeJieqiMove(board, hiddenBoard, move);
      const evalScore = jieqiMinimax(newBoard, newHiddenBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const { newBoard, newHiddenBoard } = executeJieqiMove(board, hiddenBoard, move);
      const evalScore = jieqiMinimax(newBoard, newHiddenBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Tìm nước đi tối ưu cho Bot trong Cờ Úp
 */
export function findBestJieqiMove(
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  color: PieceColor,
  difficulty: BotDifficulty = 'medium'
): Move | null {
  const legalMoves = getAllJieqiLegalMoves(board, color);
  if (legalMoves.length === 0) return null;

  // Dễ: 35% chọn ngẫu nhiên, 65% chọn nước ăn quân tốt nhất
  if (difficulty === 'easy') {
    if (Math.random() < 0.35) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
    // Ưu tiên ăn quân
    const captureMoves = legalMoves.filter(m => m.captured !== null);
    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const depth = difficulty === 'master' ? 3 : difficulty === 'hard' ? 2 : 1;
  const isMaximizing = color === 'r';

  let bestMove: Move = legalMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Xáo trộn nhẹ để bot không đi theo một khuôn rập
  const shuffledMoves = [...legalMoves].sort(() => Math.random() - 0.5);

  // Sắp xếp ưu tiên nước ăn quân
  shuffledMoves.sort((a, b) => (b.captured ? 100 : 0) - (a.captured ? 100 : 0));

  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of shuffledMoves) {
    const { newBoard, newHiddenBoard } = executeJieqiMove(board, hiddenBoard, move);
    const score = jieqiMinimax(newBoard, newHiddenBoard, depth - 1, alpha, beta, !isMaximizing);

    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
    }
  }

  return bestMove;
}
