'use client';

import { PieceColor, BotDifficulty, GameVariant, Move } from './xiangqi-types';
import { findBestMoveEngine } from './xiangqi-engine';
import { findBestJieqiMove } from './jieqi-engine';
import type { AIWorkerRequest, AIWorkerResponse } from './ai.worker';

let workerInstance: Worker | null = null;
let workerFailed = false;
let reqCounter = 0;
const pendingCallbacks = new Map<number, (move: Move | null) => void>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined' || workerFailed) {
    return null;
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('./ai.worker.ts', import.meta.url));
      workerInstance.onmessage = (event: MessageEvent<AIWorkerResponse>) => {
        const { id, move } = event.data;
        const cb = pendingCallbacks.get(id);
        if (cb) {
          pendingCallbacks.delete(id);
          cb(move);
        }
      };
      workerInstance.onerror = () => {
        workerFailed = true;
        workerInstance?.terminate();
        workerInstance = null;
        pendingCallbacks.forEach((cb) => cb(null));
        pendingCallbacks.clear();
      };
    } catch {
      workerFailed = true;
      workerInstance = null;
    }
  }
  return workerInstance;
}

export function computeAIMoveAsync(
  variant: GameVariant,
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  turn: PieceColor,
  difficulty: BotDifficulty
): Promise<Move | null> {
  return new Promise((resolve) => {
    const worker = getWorker();
    if (worker) {
      const id = ++reqCounter;
      const timeoutId = setTimeout(() => {
        if (pendingCallbacks.has(id)) {
          pendingCallbacks.delete(id);
          resolve(runFallbackSync(variant, board, hiddenBoard, turn, difficulty));
        }
      }, 6000);

      pendingCallbacks.set(id, (move) => {
        clearTimeout(timeoutId);
        if (move) {
          resolve(move);
        } else {
          resolve(runFallbackSync(variant, board, hiddenBoard, turn, difficulty));
        }
      });

      const payload: AIWorkerRequest = {
        id,
        variant,
        board,
        hiddenBoard,
        turn,
        difficulty
      };
      worker.postMessage(payload);
    } else {
      setTimeout(() => {
        resolve(runFallbackSync(variant, board, hiddenBoard, turn, difficulty));
      }, 16);
    }
  });
}

function runFallbackSync(
  variant: GameVariant,
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  turn: PieceColor,
  difficulty: BotDifficulty
): Move | null {
  try {
    if (variant === 'jieqi') {
      return findBestJieqiMove(board, hiddenBoard, turn, difficulty);
    }
    const res = findBestMoveEngine(board, turn, difficulty);
    return res?.move || null;
  } catch {
    return null;
  }
}
