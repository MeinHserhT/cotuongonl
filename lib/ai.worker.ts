import { PieceColor, BotDifficulty, GameVariant, Move } from './xiangqi-types';
import { findBestMoveEngine } from './xiangqi-engine';
import { findBestJieqiMove } from './jieqi-engine';

export interface AIWorkerRequest {
  id: number;
  variant: GameVariant;
  board: (string | null)[][];
  hiddenBoard: (string | null)[][];
  turn: PieceColor;
  difficulty: BotDifficulty;
}

export interface AIWorkerResponse {
  id: number;
  move: Move | null;
  error?: string;
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<AIWorkerRequest>) => void) | null;
  postMessage: (message: AIWorkerResponse) => void;
}

const ctx = self as unknown as WorkerScope;

ctx.onmessage = (event: MessageEvent<AIWorkerRequest>) => {
  const { id, variant, board, hiddenBoard, turn, difficulty } = event.data;
  try {
    if (variant === 'jieqi') {
      const move = findBestJieqiMove(board, hiddenBoard, turn, difficulty);
      ctx.postMessage({ id, move } satisfies AIWorkerResponse);
    } else {
      const result = findBestMoveEngine(board, turn, difficulty);
      ctx.postMessage({ id, move: result?.move || null } satisfies AIWorkerResponse);
    }
  } catch (err: any) {
    ctx.postMessage({
      id,
      move: null,
      error: err?.message || 'AI worker error'
    } satisfies AIWorkerResponse);
  }
};
