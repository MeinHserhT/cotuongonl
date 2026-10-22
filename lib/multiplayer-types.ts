import { PieceColor, Move, MoveRecord, MoveNotation, RankTier, GameVariant } from './xiangqi-types';

export interface PlayerInfo {
  id: string;
  name: string;
  color: PieceColor;
  connected: boolean;
  isHost: boolean;
  joinedAt: number;
  elo: number;
  rankTier: RankTier;
  isSpectator?: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderColor?: PieceColor;
  text: string;
  isSpectator: boolean;
  timestamp: number;
  isQuick?: boolean;
}

export interface PublicRoomSummary {
  roomCode: string;
  hostName: string;
  hostColor: PieceColor;
  timeLimit: number;
  moveTimeLimit?: number;
  openSide: PieceColor | null;
  createdAt: number;
  isRanked: boolean;
  spectatorCount: number;
  hostElo: number;
  variant?: GameVariant;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  elo: number;
  tier: RankTier;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  variant?: GameVariant;
}

export interface RoomState {
  roomCode: string;
  isPublic: boolean;
  isRanked: boolean;
  timeLimit: number;
  hostId: string;
  redPlayer: PlayerInfo | null;
  blackPlayer: PlayerInfo | null;
  spectators: PlayerInfo[];
  board: (string | null)[][];
  turn: PieceColor;
  moveHistory: MoveRecord[];
  lastMove: Move | null;
  inCheck: boolean;
  isGameStarted: boolean;
  isGameOver: boolean;
  winner: PieceColor | 'draw' | null;
  gameOverReason: string | null;
  redTimer: number;
  blackTimer: number;
  turnTimer?: number;
  moveTimeLimit?: number;
  drawOffer: PieceColor | null;
  rematchRequested: PieceColor | null;
  chatMessages: ChatMessage[];
  redElo?: number;
  blackElo?: number;
  redEloDelta?: number;
  blackEloDelta?: number;
  variant?: GameVariant;
}

export type ClientMessage =
  | { type: 'LOBBY_LIST' }
  | { type: 'ROOM_CREATE'; hostName: string; hostColor?: 'r' | 'b' | 'random'; timeLimit: number; isPublic: boolean; isRanked?: boolean; playerElo?: number; variant?: GameVariant; matchmake?: boolean }
  | { type: 'ROOM_JOIN'; roomCode: string; playerName: string; playerToken?: string; asSpectator?: boolean; playerElo?: number }
  | { type: 'ROOM_LEAVE' }
  | { type: 'MOVE_MAKE'; move: Move }
  | { type: 'DRAW_OFFER' }
  | { type: 'DRAW_RESPOND'; accept: boolean }
  | { type: 'RESIGN' }
  | { type: 'REMATCH_REQUEST' }
  | { type: 'CHAT_SEND'; text: string; isQuick?: boolean }
  | { type: 'LEADERBOARD_GET' }
  | { type: 'PING' };

export type ServerMessage =
  | { type: 'LOBBY_ROOMS'; rooms: PublicRoomSummary[] }
  | { type: 'LEADERBOARD_DATA'; leaderboard: LeaderboardEntry[] }
  | { type: 'ROOM_JOINED'; roomCode: string; playerToken: string; playerColor: PieceColor; isSpectator: boolean; roomState: RoomState }
  | { type: 'ROOM_STATE'; roomState: RoomState }
  | {
      type: 'MOVE_BROADCAST';
      move: Move;
      notation: MoveNotation;
      board: (string | null)[][];
      turn: PieceColor;
      inCheck: boolean;
      redTimer: number;
      blackTimer: number;
      turnTimer?: number;
      moveHistory: MoveRecord[];
      byColor: PieceColor;
      capturedPiece: string | null;
      revealedPiece?: string | null;
      capturedActualPiece?: string | null;
    }
  | { type: 'CLOCK_TICK'; redTimer: number; blackTimer: number; turnTimer?: number }
  | { type: 'CHAT_BROADCAST'; message: ChatMessage }
  | { type: 'DRAW_OFFERED'; fromColor: PieceColor }
  | { type: 'DRAW_DECLINED' }
  | { type: 'GAME_OVER'; winner: PieceColor | 'draw'; reason: string; redEloDelta?: number; blackEloDelta?: number }
  | { type: 'OPPONENT_PRESENCE'; connected: boolean; graceSeconds?: number }
  | { type: 'ERROR'; message: string };
