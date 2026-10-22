import { WebSocket } from 'ws';
import {
  INITIAL_BOARD,
  Move,
  MoveRecord,
  PieceColor,
  getRankTier,
  GameVariant
} from '../lib/xiangqi-types';
import {
  getLegalMoves,
  getAllLegalMoves,
  isKingInCheck,
  formatNotation,
  countConsecutiveChecksSamePieceAndPos
} from '../lib/xiangqi-rules';
import {
  createInitialJieqiGame,
  getJieqiLegalMoves,
  getAllJieqiLegalMoves,
  isJieqiKingInCheck,
  executeJieqiMove,
  formatJieqiNotation
} from '../lib/jieqi-rules';
import {
  ClientMessage,
  ServerMessage,
  RoomState,
  PublicRoomSummary,
  PlayerInfo,
  ChatMessage,
  LeaderboardEntry
} from '../lib/multiplayer-types';

export interface ClientSocket {
  send(data: string): void;
}

interface InternalPlayer extends PlayerInfo {
  token: string;
  ws: ClientSocket | null;
  disconnectTimeout?: NodeJS.Timeout;
}

interface InternalRoom {
  roomCode: string;
  isPublic: boolean;
  isRanked: boolean;
  timeLimit: number;
  moveTimeLimit: number;
  hostId: string;
  redPlayer: InternalPlayer | null;
  blackPlayer: InternalPlayer | null;
  spectators: InternalPlayer[];
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
  turnTimer: number;
  lastTimerTick: number;
  drawOffer: PieceColor | null;
  rematchRequested: PieceColor | null;
  chatMessages: ChatMessage[];
  createdAt: number;
  redElo: number;
  blackElo: number;
  redEloDelta?: number;
  blackEloDelta?: number;
  variant?: GameVariant;
  hiddenBoard?: (string | null)[][];
}

export class RoomManager {
  private rooms = new Map<string, InternalRoom>();
  private wsToSession = new Map<ClientSocket, { roomCode: string; token: string; isSpectator?: boolean }>();
  private httpClients = new Map<string, { socket: ClientSocket; outbox: ServerMessage[]; lastSeen: number }>();
  private leaderboardStandard = new Map<string, LeaderboardEntry>();
  private leaderboardJieqi = new Map<string, LeaderboardEntry>();
  private rateLimits = new Map<ClientSocket, { count: number; resetTime: number }>();
  private tickInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.seedLeaderboard();
    this.startClockTicker();
  }

  private seedLeaderboard() {
    const initialStandardMasters: Array<Omit<LeaderboardEntry, 'rank'>> = [
      { name: 'Nguyễn Thành Bảo', elo: 2420, tier: 'Kỳ Vương', wins: 185, losses: 22, draws: 45, winRate: 85, variant: 'standard' },
      { name: 'Lại Lý Huynh', elo: 2390, tier: 'Kỳ Vương', wins: 172, losses: 19, draws: 38, winRate: 86, variant: 'standard' },
      { name: 'Trềnh A Sáng', elo: 2180, tier: 'Kiện Tướng', wins: 140, losses: 35, draws: 52, winRate: 74, variant: 'standard' },
      { name: 'Uông Dương Bắc', elo: 2050, tier: 'Kiện Tướng', wins: 118, losses: 42, draws: 31, winRate: 71, variant: 'standard' },
      { name: 'Đặng Cửu Tùng Lân', elo: 1890, tier: 'Cao Thủ', wins: 95, losses: 38, draws: 24, winRate: 69, variant: 'standard' },
      { name: 'Trần Văn Ninh', elo: 1820, tier: 'Cao Thủ', wins: 88, losses: 41, draws: 20, winRate: 65, variant: 'standard' },
      { name: 'Vũ Hữu Cường', elo: 1650, tier: 'Kỳ Thủ', wins: 64, losses: 32, draws: 18, winRate: 62, variant: 'standard' },
      { name: 'Phí Trọng Hiếu', elo: 1540, tier: 'Kỳ Thủ', wins: 51, losses: 29, draws: 12, winRate: 60, variant: 'standard' },
      { name: 'Kỳ Nghệ Lạc Hồng', elo: 1380, tier: 'Tập Sự', wins: 33, losses: 24, draws: 8, winRate: 56, variant: 'standard' },
      { name: 'Kỳ Đạo Tràng An', elo: 1250, tier: 'Tập Sự', wins: 19, losses: 15, draws: 4, winRate: 54, variant: 'standard' }
    ];

    const initialJieqiMasters: Array<Omit<LeaderboardEntry, 'rank'>> = [
      { name: 'Lại Lý Huynh (Úp Vương)', elo: 2450, tier: 'Kỳ Vương', wins: 192, losses: 18, draws: 30, winRate: 88, variant: 'jieqi' },
      { name: 'Hà Văn Tiến', elo: 2380, tier: 'Kỳ Vương', wins: 165, losses: 24, draws: 35, winRate: 84, variant: 'jieqi' },
      { name: 'Chu Tuấn Hải', elo: 2260, tier: 'Kiện Tướng', wins: 148, losses: 32, draws: 40, winRate: 77, variant: 'jieqi' },
      { name: 'Nguyễn Hoàng Kiên', elo: 2210, tier: 'Kiện Tướng', wins: 135, losses: 38, draws: 32, winRate: 74, variant: 'jieqi' },
      { name: 'Uông Dương Bắc', elo: 2090, tier: 'Kiện Tướng', wins: 122, losses: 40, draws: 28, winRate: 72, variant: 'jieqi' },
      { name: 'Đặng Hữu Trang', elo: 1980, tier: 'Cao Thủ', wins: 104, losses: 36, draws: 22, winRate: 70, variant: 'jieqi' },
      { name: 'Trần Quyết Thắng', elo: 1840, tier: 'Cao Thủ', wins: 91, losses: 44, draws: 18, winRate: 64, variant: 'jieqi' },
      { name: 'Phí Trọng Hiếu', elo: 1710, tier: 'Kỳ Thủ', wins: 76, losses: 35, draws: 16, winRate: 63, variant: 'jieqi' },
      { name: 'Lạc Hồng Úp Sĩ', elo: 1420, tier: 'Tập Sự', wins: 38, losses: 22, draws: 9, winRate: 58, variant: 'jieqi' },
      { name: 'Kỳ Hiệp Tràng An', elo: 1280, tier: 'Tập Sự', wins: 22, losses: 16, draws: 5, winRate: 55, variant: 'jieqi' }
    ];

    initialStandardMasters.forEach((m, idx) => {
      this.leaderboardStandard.set(m.name, { ...m, rank: idx + 1 });
    });

    initialJieqiMasters.forEach((m, idx) => {
      this.leaderboardJieqi.set(m.name, { ...m, rank: idx + 1 });
    });
  }

  public getLeaderboard(variant?: GameVariant): LeaderboardEntry[] {
    if (variant === 'jieqi') {
      const list = Array.from(this.leaderboardJieqi.values());
      list.sort((a, b) => b.elo - a.elo);
      return list.slice(0, 15).map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
    if (variant === 'standard') {
      const list = Array.from(this.leaderboardStandard.values());
      list.sort((a, b) => b.elo - a.elo);
      return list.slice(0, 15).map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
    // Default: Return all entries so client can filter by variant
    const listStd = Array.from(this.leaderboardStandard.values()).map(e => ({ ...e, variant: 'standard' as GameVariant }));
    const listJq = Array.from(this.leaderboardJieqi.values()).map(e => ({ ...e, variant: 'jieqi' as GameVariant }));
    return [...listStd, ...listJq];
  }

  private updatePlayerLeaderboard(name: string, won: boolean, isDraw: boolean, eloDelta: number, variant: GameVariant = 'standard') {
    const targetMap = variant === 'jieqi' ? this.leaderboardJieqi : this.leaderboardStandard;
    const existing = targetMap.get(name) || {
      rank: 99,
      name,
      elo: 1200,
      tier: 'Tập Sự',
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      variant
    };

    const newElo = Math.max(800, existing.elo + eloDelta);
    const wins = existing.wins + (won ? 1 : 0);
    const losses = existing.losses + (!won && !isDraw ? 1 : 0);
    const draws = existing.draws + (isDraw ? 1 : 0);
    const total = wins + losses + draws;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const tier = getRankTier(newElo).tier;

    targetMap.set(name, {
      ...existing,
      elo: newElo,
      tier,
      wins,
      losses,
      draws,
      winRate,
      variant
    });
  }

  private calculateEloDelta(ratingA: number, ratingB: number, scoreA: number): number {
    const K = 32;
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    return Math.round(K * (scoreA - expectedA));
  }

  private startClockTicker() {
    this.tickInterval = setInterval(() => {
      const now = Date.now();
      for (const [clientId, client] of this.httpClients.entries()) {
        if (now - client.lastSeen > 25000) {
          this.httpClients.delete(clientId);
          this.handleDisconnect(client.socket);
        }
      }

      for (const room of this.rooms.values()) {
        if (!room.isGameStarted || room.isGameOver) continue;
        if (!room.redPlayer?.connected || !room.blackPlayer?.connected) continue;
        // Chưa đánh nước đầu tiên thì không trừ thời gian
        if (room.moveHistory.length === 0) continue;

        // 1. Trừ tổng thời gian của bên đang tới lượt (cố định 15 phút)
        if (room.turn === 'r') {
          room.redTimer = Math.max(0, room.redTimer - 1);
          if (room.redTimer === 0) {
            this.handleTimeout(room, 'b', 'Hết tổng thời gian 15 phút');
            continue;
          }
        } else {
          room.blackTimer = Math.max(0, room.blackTimer - 1);
          if (room.blackTimer === 0) {
            this.handleTimeout(room, 'r', 'Hết tổng thời gian 15 phút');
            continue;
          }
        }

        // 2. Trừ thời gian cho nước đi hiện tại (cố định 60 giây mỗi nước)
        room.turnTimer = Math.max(0, (room.turnTimer ?? 60) - 1);
        if (room.turnTimer === 0) {
          const timeoutSide = room.turn;
          const winner: PieceColor = timeoutSide === 'r' ? 'b' : 'r';
          this.handleTimeout(room, winner, 'Quá thời gian 60s cho một nước đi');
          continue;
        }

        this.broadcastToRoom(room, {
          type: 'CLOCK_TICK',
          redTimer: room.redTimer,
          blackTimer: room.blackTimer,
          turnTimer: room.turnTimer
        });
      }
    }, 1000);
  }

  private handleTimeout(room: InternalRoom, winner: PieceColor, reasonDetail?: string) {
    room.isGameOver = true;
    room.winner = winner;
    const loserName = winner === 'r' ? 'Đen' : 'Đỏ';
    const winnerName = winner === 'r' ? 'Đỏ' : 'Đen';
    const detail = reasonDetail ? ` (${reasonDetail})` : '';
    room.gameOverReason = `Bên ${loserName} đã hết thời gian${detail}! Bên ${winnerName} thắng cuộc.`;

    this.settleMatchElo(room, winner);

    this.broadcastToRoom(room, {
      type: 'GAME_OVER',
      winner,
      reason: room.gameOverReason,
      redEloDelta: room.redEloDelta,
      blackEloDelta: room.blackEloDelta
    });
  }

  private settleMatchElo(room: InternalRoom, winner: PieceColor | 'draw') {
    if (!room.isRanked) return;
    const rScore = winner === 'r' ? 1 : winner === 'draw' ? 0.5 : 0;
    const delta = this.calculateEloDelta(room.redElo, room.blackElo, rScore);
    room.redEloDelta = delta;
    room.blackEloDelta = -delta;

    if (room.redPlayer) {
      room.redPlayer.elo = Math.max(800, room.redPlayer.elo + delta);
      room.redPlayer.rankTier = getRankTier(room.redPlayer.elo).tier;
      this.updatePlayerLeaderboard(room.redPlayer.name, winner === 'r', winner === 'draw', delta, room.variant);
    }
    if (room.blackPlayer) {
      room.blackPlayer.elo = Math.max(800, room.blackPlayer.elo - delta);
      room.blackPlayer.rankTier = getRankTier(room.blackPlayer.elo).tier;
      this.updatePlayerLeaderboard(room.blackPlayer.name, winner === 'b', winner === 'draw', -delta, room.variant);
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateRoomCode() : code;
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public getPublicRooms(): PublicRoomSummary[] {
    const summaries: PublicRoomSummary[] = [];
    for (const room of this.rooms.values()) {
      if (!room.isPublic) continue;
      const host = room.redPlayer?.isHost ? room.redPlayer : room.blackPlayer;
      if (!host) continue;

      let openSide: PieceColor | null = null;
      if (!room.redPlayer) openSide = 'r';
      else if (!room.blackPlayer) openSide = 'b';

      summaries.push({
        roomCode: room.roomCode,
        hostName: host.name,
        hostColor: host.color,
        timeLimit: room.timeLimit || 900,
        moveTimeLimit: room.moveTimeLimit || 60,
        openSide: room.isGameStarted ? null : openSide,
        createdAt: room.createdAt,
        isRanked: room.isRanked,
        spectatorCount: room.spectators.length,
        hostElo: host.elo,
        variant: room.variant || 'standard'
      });
    }
    return summaries.sort((a, b) => b.createdAt - a.createdAt);
  }

  public handleConnection(ws: WebSocket) {
    ws.on('message', (data: any) => {
      // 1. Giới hạn kích thước gói tin (Payload Cap: max 8KB chống tràn buffer)
      const dataStr = typeof data === 'string' ? data : data?.toString?.() || '';
      if (dataStr.length > 8192) {
        try {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Kích thước gói tin vượt quá giới hạn 8KB.' }));
        } catch {}
        return;
      }

      // 2. Chống spam / rate-limiting (Tối đa 20 gói tin / giây trên mỗi kết nối)
      const now = Date.now();
      let rl = this.rateLimits.get(ws);
      if (!rl || now > rl.resetTime) {
        rl = { count: 1, resetTime: now + 1000 };
        this.rateLimits.set(ws, rl);
      } else {
        rl.count++;
        if (rl.count > 20) {
          try {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Thao tác quá nhanh, vui lòng chờ trong giây lát.' }));
          } catch {}
          return;
        }
      }

      // 3. Kiểm tra cấu trúc JSON hợp lệ trước khi phân loại logic
      try {
        const msg = JSON.parse(dataStr);
        if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') {
          return;
        }
        this.handleMessage(ws, msg as ClientMessage);
      } catch (err) {
        console.error('Invalid WS message payload format:', err);
      }
    });

    ws.on('close', () => {
      this.rateLimits.delete(ws);
      this.handleDisconnect(ws);
    });

    ws.on('error', (err) => {
      this.rateLimits.delete(ws);
      console.error('WS Error:', err);
    });
  }

  public handleHttpPoll(clientId: string, messages: ClientMessage[]): ServerMessage[] {
    let client = this.httpClients.get(clientId);
    if (!client) {
      const outbox: ServerMessage[] = [];
      const socket: ClientSocket = {
        send: (data: string) => {
          try {
            const parsed = JSON.parse(data) as ServerMessage;
            outbox.push(parsed);
            if (outbox.length > 100) outbox.shift();
          } catch {}
        }
      };
      client = { socket, outbox, lastSeen: Date.now() };
      this.httpClients.set(clientId, client);
    } else {
      client.lastSeen = Date.now();
    }

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg && typeof msg === 'object' && typeof msg.type === 'string') {
          this.handleMessage(client.socket, msg);
        }
      }
    }

    const drained = [...client.outbox];
    client.outbox.length = 0;
    return drained;
  }

  private handleMessage(ws: ClientSocket, msg: ClientMessage) {
    switch (msg.type) {
      case 'PING':
        ws.send(JSON.stringify({ type: 'PONG' }));
        break;

      case 'LOBBY_LIST':
        ws.send(JSON.stringify({
          type: 'LOBBY_ROOMS',
          rooms: this.getPublicRooms()
        }));
        break;

      case 'LEADERBOARD_GET':
        ws.send(JSON.stringify({
          type: 'LEADERBOARD_DATA',
          leaderboard: this.getLeaderboard()
        }));
        break;

      case 'ROOM_CREATE':
        this.createRoom(ws, msg.hostName, msg.timeLimit, msg.isPublic, msg.playerElo, msg.variant, !!msg.matchmake);
        break;

      case 'ROOM_JOIN':
        this.joinRoom(ws, msg.roomCode.toUpperCase().trim(), msg.playerName, msg.playerToken, !!msg.asSpectator, msg.playerElo);
        break;

      case 'ROOM_LEAVE':
        this.leaveRoom(ws);
        break;

      case 'MOVE_MAKE':
        this.makeMove(ws, msg.move);
        break;

      case 'CHAT_SEND':
        this.handleChat(ws, msg.text, !!msg.isQuick);
        break;

      case 'DRAW_OFFER':
        this.offerDraw(ws);
        break;

      case 'DRAW_RESPOND':
        this.respondDraw(ws, msg.accept);
        break;

      case 'RESIGN':
        this.resign(ws);
        break;

      case 'REMATCH_REQUEST':
        this.requestRematch(ws);
        break;
    }
  }

  private createRoom(
    ws: ClientSocket,
    hostName: string,
    timeLimit: number,
    isPublic: boolean,
    playerElo?: number,
    variant?: GameVariant,
    matchmake = false
  ) {
    const prevSession = this.wsToSession.get(ws);
    if (prevSession) {
      this.leaveRoom(ws);
    }

    const roomVariant = variant || 'standard';
    const hostElo = typeof playerElo === 'number' && playerElo >= 800 ? playerElo : 1200;

    // Nếu là tìm trận tự động (matchmake), kiểm tra xem có phòng công khai cùng thể loại đang chờ đối thủ không
    if (matchmake) {
      const candidateRooms: Array<{ room: InternalRoom; eloDiff: number }> = [];
      for (const r of this.rooms.values()) {
        if (!r.isPublic || r.isGameStarted || r.isGameOver) continue;
        if ((r.variant || 'standard') !== roomVariant) continue;
        const waitingPlayer = r.redPlayer || r.blackPlayer;
        if (!waitingPlayer || !waitingPlayer.connected || waitingPlayer.ws === ws) continue;
        if (r.redPlayer && r.blackPlayer) continue;
        candidateRooms.push({
          room: r,
          eloDiff: Math.abs(waitingPlayer.elo - hostElo)
        });
      }
      if (candidateRooms.length > 0) {
        candidateRooms.sort((a, b) => a.eloDiff - b.eloDiff || a.room.createdAt - b.room.createdAt);
        this.joinRoom(ws, candidateRooms[0].room.roomCode, hostName, undefined, false, hostElo);
        return;
      }
    }

    const roomCode = this.generateRoomCode();
    const token = this.generateToken();
    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);

    // Luôn chọn quân cờ ngẫu nhiên 50/50 cho các trận đấu online:
    const assignedColor: PieceColor = Math.random() < 0.5 ? 'r' : 'b';

    // Cố định tổng thời gian thi đấu là 15 phút (900s) và 60s cho mỗi nước đi
    const MATCH_TOTAL_TIME = 900;
    const MOVE_TIME_LIMIT = 60;

    const hostPlayer: InternalPlayer = {
      id: playerId,
      name: hostName.trim() || (assignedColor === 'r' ? 'Kỳ thủ Đỏ' : 'Kỳ thủ Đen'),
      color: assignedColor,
      connected: true,
      isHost: true,
      joinedAt: Date.now(),
      elo: hostElo,
      rankTier: getRankTier(hostElo).tier,
      token,
      ws
    };

    let initBoard: (string | null)[][];
    let initHiddenBoard: (string | null)[][] | undefined = undefined;

    if (roomVariant === 'jieqi') {
      const jGame = createInitialJieqiGame();
      initBoard = jGame.board;
      initHiddenBoard = jGame.hiddenBoard;
    } else {
      initBoard = INITIAL_BOARD.map(r => [...r]);
    }

    const room: InternalRoom = {
      roomCode,
      isPublic,
      isRanked: true,
      variant: roomVariant,
      hiddenBoard: initHiddenBoard,
      timeLimit: MATCH_TOTAL_TIME,
      moveTimeLimit: MOVE_TIME_LIMIT,
      hostId: playerId,
      redPlayer: assignedColor === 'r' ? hostPlayer : null,
      blackPlayer: assignedColor === 'b' ? hostPlayer : null,
      spectators: [],
      board: initBoard,
      turn: 'r',
      moveHistory: [],
      lastMove: null,
      inCheck: false,
      isGameStarted: false,
      isGameOver: false,
      winner: null,
      gameOverReason: null,
      redTimer: MATCH_TOTAL_TIME,
      blackTimer: MATCH_TOTAL_TIME,
      turnTimer: MOVE_TIME_LIMIT,
      lastTimerTick: Date.now(),
      drawOffer: null,
      rematchRequested: null,
      chatMessages: [
        {
          id: 'sys_' + Date.now(),
          senderName: 'Hệ thống',
          text: `Phòng ${roomCode} đã được khởi tạo (${roomVariant === 'jieqi' ? 'Thể loại: CỜ ÚP (Jieqi)' : 'Thể loại: CỜ TƯỚNG (Sáng)'} · Đấu Xếp Hạng Elo · Bốc thăm quân ngẫu nhiên · Cố định 15 phút, 60s/nước: Bạn cầm ${assignedColor === 'r' ? 'Quân Đỏ' : 'Quân Đen'}). Chúc bạn thi đấu vẻ vang!`,
          isSpectator: false,
          timestamp: Date.now()
        }
      ],
      createdAt: Date.now(),
      redElo: assignedColor === 'r' ? hostElo : 1200,
      blackElo: assignedColor === 'b' ? hostElo : 1200
    };

    this.rooms.set(roomCode, room);
    this.wsToSession.set(ws, { roomCode, token, isSpectator: false });

    ws.send(JSON.stringify({
      type: 'ROOM_JOINED',
      roomCode,
      playerToken: token,
      playerColor: assignedColor,
      isSpectator: false,
      roomState: this.toPublicState(room)
    }));
  }

  private joinRoom(
    ws: ClientSocket,
    rawRoomCode: string,
    playerName: string,
    playerToken?: string,
    asSpectator = false,
    playerElo?: number
  ) {
    const roomCode = (rawRoomCode || '').trim().toUpperCase();
    const room = this.rooms.get(roomCode);
    if (!room) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: `Không tìm thấy phòng "${roomCode}". Vui lòng kiểm tra lại mã phòng!`
      }));
      return;
    }

    const prevSession = this.wsToSession.get(ws);
    if (prevSession && prevSession.roomCode !== roomCode) {
      this.leaveRoom(ws);
    }

    if (asSpectator) {
      const spectatorToken = this.generateToken();
      const specId = 'spec_' + Math.random().toString(36).substring(2, 9);
      const specPlayer: InternalPlayer = {
        id: specId,
        name: playerName.trim() || `Khán giả ${room.spectators.length + 1}`,
        color: 'r',
        connected: true,
        isHost: false,
        joinedAt: Date.now(),
        elo: 1200,
        rankTier: 'Tập Sự',
        isSpectator: true,
        token: spectatorToken,
        ws
      };

      room.spectators.push(specPlayer);
      this.wsToSession.set(ws, { roomCode, token: spectatorToken, isSpectator: true });

      const welcomeMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        senderName: 'Hệ thống',
        text: `${specPlayer.name} vừa vào xem trận đấu.`,
        isSpectator: true,
        timestamp: Date.now()
      };
      room.chatMessages.push(welcomeMsg);

      ws.send(JSON.stringify({
        type: 'ROOM_JOINED',
        roomCode,
        playerToken: spectatorToken,
        playerColor: 'r',
        isSpectator: true,
        roomState: this.toPublicState(room)
      }));

      this.broadcastToRoom(room, {
        type: 'CHAT_BROADCAST',
        message: welcomeMsg
      });

      this.broadcastToRoom(room, {
        type: 'ROOM_STATE',
        roomState: this.toPublicState(room)
      });
      return;
    }

    if (playerToken) {
      if (room.redPlayer && room.redPlayer.token === playerToken) {
        if (room.redPlayer.disconnectTimeout) {
          clearTimeout(room.redPlayer.disconnectTimeout);
          room.redPlayer.disconnectTimeout = undefined;
        }
        room.redPlayer.connected = true;
        room.redPlayer.ws = ws;
        this.wsToSession.set(ws, { roomCode, token: playerToken, isSpectator: false });

        ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode,
          playerToken,
          playerColor: 'r',
          isSpectator: false,
          roomState: this.toPublicState(room)
        }));
        this.broadcastOpponentPresence(room, 'r', true);
        return;
      }

      if (room.blackPlayer && room.blackPlayer.token === playerToken) {
        if (room.blackPlayer.disconnectTimeout) {
          clearTimeout(room.blackPlayer.disconnectTimeout);
          room.blackPlayer.disconnectTimeout = undefined;
        }
        room.blackPlayer.connected = true;
        room.blackPlayer.ws = ws;
        this.wsToSession.set(ws, { roomCode, token: playerToken, isSpectator: false });

        ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode,
          playerToken,
          playerColor: 'b',
          isSpectator: false,
          roomState: this.toPublicState(room)
        }));
        this.broadcastOpponentPresence(room, 'b', true);
        return;
      }
    }

    if (room.redPlayer && room.blackPlayer) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Bàn cờ này đã đủ 2 kỳ thủ thi đấu. Bạn có thể chọn "Vào xem trận"!'
      }));
      return;
    }

    // Phân định quân cờ ngẫu nhiên: Vị trí còn trống đối xứng với chủ phòng
    const assignedColor: PieceColor = room.redPlayer ? 'b' : 'r';
    const token = this.generateToken();
    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const guestElo = typeof playerElo === 'number' && playerElo >= 800 ? playerElo : 1200;

    const newPlayer: InternalPlayer = {
      id: playerId,
      name: playerName.trim() || (assignedColor === 'r' ? 'Kỳ thủ Đỏ' : 'Kỳ thủ Đen'),
      color: assignedColor,
      connected: true,
      isHost: false,
      joinedAt: Date.now(),
      elo: guestElo,
      rankTier: getRankTier(guestElo).tier,
      token,
      ws
    };

    if (assignedColor === 'r') {
      room.redPlayer = newPlayer;
      room.redElo = guestElo;
    } else {
      room.blackPlayer = newPlayer;
      room.blackElo = guestElo;
    }

    // Đảm bảo thời gian thi đấu luôn cố định 15 phút tổng và 60s cho mỗi nước đi
    room.timeLimit = 900;
    room.moveTimeLimit = 60;
    room.redTimer = 900;
    room.blackTimer = 900;
    room.turnTimer = 60;
    room.isRanked = true;
    room.isGameStarted = true;
    room.lastTimerTick = Date.now();

    this.wsToSession.set(ws, { roomCode, token, isSpectator: false });

    ws.send(JSON.stringify({
      type: 'ROOM_JOINED',
      roomCode,
      playerToken: token,
      playerColor: assignedColor,
      isSpectator: false,
      roomState: this.toPublicState(room)
    }));

    const startMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderName: 'Hệ thống',
      text: `🎲 Bốc thăm quân ngẫu nhiên: ${room.redPlayer?.name} (${room.redPlayer?.elo} Elo) cầm [Quân Đỏ (Tiên)], ${room.blackPlayer?.name} (${room.blackPlayer?.elo} Elo) cầm [Quân Đen]. Trận đấu tính điểm Elo chính thức bắt đầu (Thời gian: 15 phút/bên · 60s/nước)!`,
      isSpectator: false,
      timestamp: Date.now()
    };
    room.chatMessages.push(startMsg);

    this.broadcastToRoom(room, {
      type: 'ROOM_STATE',
      roomState: this.toPublicState(room)
    });
    this.broadcastToRoom(room, {
      type: 'CHAT_BROADCAST',
      message: startMsg
    });
  }

  private handleChat(ws: ClientSocket, text: string, isQuick: boolean) {
    const session = this.wsToSession.get(ws);
    if (!session) return;
    const room = this.rooms.get(session.roomCode);
    if (!room) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    let senderName = 'Khán giả';
    let senderColor: PieceColor | undefined = undefined;
    let isSpectator = true;

    if (room.redPlayer && room.redPlayer.token === session.token) {
      senderName = room.redPlayer.name;
      senderColor = 'r';
      isSpectator = false;
    } else if (room.blackPlayer && room.blackPlayer.token === session.token) {
      senderName = room.blackPlayer.name;
      senderColor = 'b';
      isSpectator = false;
    } else {
      const spec = room.spectators.find(s => s.token === session.token);
      if (spec) senderName = spec.name;
    }

    const chatMsg: ChatMessage = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderName,
      senderColor,
      text: trimmed.slice(0, 160),
      isSpectator,
      timestamp: Date.now(),
      isQuick
    };

    room.chatMessages.push(chatMsg);
    if (room.chatMessages.length > 50) {
      room.chatMessages.shift();
    }

    this.broadcastToRoom(room, {
      type: 'CHAT_BROADCAST',
      message: chatMsg
    });
  }

  private makeMove(ws: ClientSocket, move: Move) {
    const session = this.wsToSession.get(ws);
    if (!session || session.isSpectator) return;
    const room = this.rooms.get(session.roomCode);
    if (!room || !room.isGameStarted || room.isGameOver) return;

    const player = this.getPlayerByToken(room, session.token);
    if (!player || player.color !== room.turn) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Chưa tới lượt đi của bạn!' }));
      return;
    }

    const movingPiece = room.board[move.fromR][move.fromC];
    if (!movingPiece) return;

    const isJieqi = room.variant === 'jieqi';
    let isValid = false;
    if (isJieqi) {
      const legalMoves = getJieqiLegalMoves(room.board, move.fromR, move.fromC);
      isValid = legalMoves.some(m => m.toR === move.toR && m.toC === move.toC);
    } else {
      const legalMoves = getLegalMoves(room.board, move.fromR, move.fromC);
      isValid = legalMoves.some(m => m.toR === move.toR && m.toC === move.toC);
    }

    if (!isValid) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Nước đi không hợp lệ!' }));
      return;
    }

    const capturedPiece = room.board[move.toR][move.toC];
    let nextBoard: (string | null)[][];
    let revealedPiece: string | null = null;
    let capturedActual: string | null = null;

    if (isJieqi && room.hiddenBoard) {
      const res = executeJieqiMove(room.board, room.hiddenBoard, move);
      nextBoard = res.newBoard;
      room.hiddenBoard = res.newHiddenBoard;
      revealedPiece = res.revealedPiece;
      capturedActual = res.capturedActual;
    } else {
      nextBoard = room.board.map(r => [...r]);
      nextBoard[move.toR][move.toC] = movingPiece;
      nextBoard[move.fromR][move.fromC] = null;
      capturedActual = capturedPiece;
    }

    const notation = isJieqi
      ? formatJieqiNotation(room.board, move, revealedPiece)
      : formatNotation(room.board, move);

    room.board = nextBoard;
    room.lastMove = move;

    const nextTurn: PieceColor = room.turn === 'r' ? 'b' : 'r';
    room.turn = nextTurn;
    const inCheck = isJieqi
      ? isJieqiKingInCheck(nextBoard, nextTurn)
      : isKingInCheck(nextBoard, nextTurn);
    room.inCheck = inCheck;
    room.drawOffer = null;

    room.moveHistory.push({
      move,
      piece: movingPiece,
      captured: capturedPiece,
      revealedPiece,
      capturedActual,
      notation: { ...notation, isCheck: inCheck },
      boardSnapshot: nextBoard.map(r => [...r])
    });

    // Kiểm tra luật trường chiếu (Perpetual Check):
    if (inCheck) {
      const historyBeforeThis = room.moveHistory.slice(0, room.moveHistory.length - 1);
      const consecutiveChecks = countConsecutiveChecksSamePieceAndPos(
        historyBeforeThis,
        move,
        movingPiece,
        true,
        player.color
      );

      if (consecutiveChecks > 3) {
        room.isGameOver = true;
        room.winner = 'draw';
        const sideName = player.color === 'r' ? 'Đỏ' : 'Đen';
        room.gameOverReason = `Hòa cờ (Trường chiếu)! Bên ${sideName} đã chiếu quá 3 lần liên tiếp tại cùng một vị trí bằng một quân cờ (${consecutiveChecks} lần).`;
        this.settleMatchElo(room, 'draw');
      } else if (consecutiveChecks === 3) {
        const sideName = player.color === 'r' ? 'Đỏ' : 'Đen';
        const warnMsg: ChatMessage = {
          id: 'sys_' + Date.now(),
          senderName: 'Hệ Thống',
          senderColor: undefined,
          text: `⚠️ Cảnh báo trường chiếu: Bên ${sideName} đã chiếu lần thứ 3 tại vị trí này! Chiếu quá 3 lần sẽ bị tính Hòa.`,
          isSpectator: false,
          timestamp: Date.now()
        };
        room.chatMessages.push(warnMsg);
        this.broadcastToRoom(room, {
          type: 'CHAT_BROADCAST',
          message: warnMsg
        });
      }
    }

    const nextLegalMoves = isJieqi
      ? getAllJieqiLegalMoves(nextBoard, nextTurn)
      : getAllLegalMoves(nextBoard, nextTurn);
    if (nextLegalMoves.length === 0) {
      room.isGameOver = true;
      room.winner = player.color;
      const winnerName = player.color === 'r' ? 'Đỏ' : 'Đen';
      if (inCheck) {
        room.gameOverReason = `Chiếu bí! Bên ${winnerName} đã giành chiến thắng.`;
      } else {
        room.gameOverReason = `Hết nước đi (Vây khốn)! Bên ${winnerName} thắng cuộc.`;
      }
      this.settleMatchElo(room, room.winner);
    }

    // Đổi lượt đi: Đặt lại đồng hồ đếm ngược 60s cho người đi tiếp theo
    room.turnTimer = room.moveTimeLimit || 60;

    this.broadcastToRoom(room, {
      type: 'MOVE_BROADCAST',
      move,
      notation,
      board: room.board,
      turn: room.turn,
      inCheck: room.inCheck,
      redTimer: room.redTimer,
      blackTimer: room.blackTimer,
      turnTimer: room.turnTimer,
      moveHistory: room.moveHistory,
      byColor: player.color,
      capturedPiece,
      revealedPiece,
      capturedActualPiece: capturedActual
    });

    if (room.isGameOver) {
      this.broadcastToRoom(room, {
        type: 'GAME_OVER',
        winner: room.winner!,
        reason: room.gameOverReason!,
        redEloDelta: room.redEloDelta,
        blackEloDelta: room.blackEloDelta
      });
    }
  }

  private offerDraw(ws: ClientSocket) {
    const session = this.wsToSession.get(ws);
    if (!session || session.isSpectator) return;
    const room = this.rooms.get(session.roomCode);
    if (!room || !room.isGameStarted || room.isGameOver) return;

    const player = this.getPlayerByToken(room, session.token);
    if (!player) return;

    room.drawOffer = player.color;
    const opponent = player.color === 'r' ? room.blackPlayer : room.redPlayer;
    if (opponent && opponent.ws) {
      opponent.ws.send(JSON.stringify({
        type: 'DRAW_OFFERED',
        fromColor: player.color
      }));
    }
  }

  private respondDraw(ws: ClientSocket, accept: boolean) {
    const session = this.wsToSession.get(ws);
    if (!session || session.isSpectator) return;
    const room = this.rooms.get(session.roomCode);
    if (!room || !room.isGameStarted || room.isGameOver || !room.drawOffer) return;

    const player = this.getPlayerByToken(room, session.token);
    if (!player || player.color === room.drawOffer) return;

    if (accept) {
      room.isGameOver = true;
      room.winner = 'draw';
      room.gameOverReason = 'Hai bên đã đồng ý hòa cờ!';
      this.settleMatchElo(room, 'draw');

      this.broadcastToRoom(room, {
        type: 'GAME_OVER',
        winner: 'draw',
        reason: room.gameOverReason,
        redEloDelta: room.redEloDelta,
        blackEloDelta: room.blackEloDelta
      });
    } else {
      room.drawOffer = null;
      const proponent = player.color === 'r' ? room.blackPlayer : room.redPlayer;
      if (proponent && proponent.ws) {
        proponent.ws.send(JSON.stringify({ type: 'DRAW_DECLINED' }));
      }
    }
  }

  private resign(ws: ClientSocket) {
    const session = this.wsToSession.get(ws);
    if (!session || session.isSpectator) return;
    const room = this.rooms.get(session.roomCode);
    if (!room || !room.isGameStarted || room.isGameOver) return;

    const player = this.getPlayerByToken(room, session.token);
    if (!player) return;

    const winner: PieceColor = player.color === 'r' ? 'b' : 'r';
    room.isGameOver = true;
    room.winner = winner;
    const resigningName = player.color === 'r' ? 'Đỏ' : 'Đen';
    const winnerName = winner === 'r' ? 'Đỏ' : 'Đen';
    room.gameOverReason = `Bên ${resigningName} đã xin đầu hàng. Bên ${winnerName} thắng cuộc!`;
    this.settleMatchElo(room, winner);

    this.broadcastToRoom(room, {
      type: 'GAME_OVER',
      winner,
      reason: room.gameOverReason,
      redEloDelta: room.redEloDelta,
      blackEloDelta: room.blackEloDelta
    });
  }

  private requestRematch(ws: ClientSocket) {
    const session = this.wsToSession.get(ws);
    if (!session || session.isSpectator) return;
    const room = this.rooms.get(session.roomCode);
    if (!room || !room.isGameOver) return;

    const player = this.getPlayerByToken(room, session.token);
    if (!player) return;

    const opponent = player.color === 'r' ? room.blackPlayer : room.redPlayer;
    if (!opponent || !opponent.connected) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Đối thủ đã rời khỏi phòng, không thể đấu lại. Hãy tạo phòng mới hoặc tìm đối thủ khác!'
      }));
      return;
    }

    if (!room.rematchRequested) {
      room.rematchRequested = player.color;
      this.broadcastToRoom(room, {
        type: 'ROOM_STATE',
        roomState: this.toPublicState(room)
      });
    } else if (room.rematchRequested !== player.color) {
      const oldRed = room.redPlayer;
      const oldBlack = room.blackPlayer;

      if (oldRed && oldBlack) {
        oldRed.color = 'b';
        oldBlack.color = 'r';
        room.redPlayer = oldBlack;
        room.blackPlayer = oldRed;
      }

      room.board = INITIAL_BOARD.map(r => [...r]);
      room.turn = 'r';
      room.moveHistory = [];
      room.lastMove = null;
      room.inCheck = false;
      room.isRanked = true;
      room.isGameStarted = true;
      room.isGameOver = false;
      room.winner = null;
      room.gameOverReason = null;
      room.timeLimit = 900;
      room.moveTimeLimit = 60;
      room.redTimer = 900;
      room.blackTimer = 900;
      room.turnTimer = 60;
      room.drawOffer = null;
      room.rematchRequested = null;
      room.redEloDelta = undefined;
      room.blackEloDelta = undefined;

      const rematchMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        senderName: 'Hệ thống',
        text: `🎲 Ván tái đấu Xếp Hạng Elo bắt đầu! Đổi quân cờ: ${room.redPlayer?.name} cầm [Quân Đỏ (Tiên)], ${room.blackPlayer?.name} cầm [Quân Đen]. Tổng thời gian: 15 phút, 60s/nước!`,
        isSpectator: false,
        timestamp: Date.now()
      };
      room.chatMessages.push(rematchMsg);

      this.broadcastToRoom(room, {
        type: 'ROOM_STATE',
        roomState: this.toPublicState(room)
      });
      this.broadcastToRoom(room, {
        type: 'CHAT_BROADCAST',
        message: rematchMsg
      });

      // Gửi ROOM_JOINED cập nhật màu quân mới chuẩn xác cho từng người chơi
      if (room.redPlayer?.ws) {
        room.redPlayer.ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode: room.roomCode,
          playerToken: room.redPlayer.token,
          playerColor: 'r',
          isSpectator: false,
          roomState: this.toPublicState(room)
        }));
      }
      if (room.blackPlayer?.ws) {
        room.blackPlayer.ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode: room.roomCode,
          playerToken: room.blackPlayer.token,
          playerColor: 'b',
          isSpectator: false,
          roomState: this.toPublicState(room)
        }));
      }
    }
  }

  private handleDisconnect(ws: ClientSocket) {
    const session = this.wsToSession.get(ws);
    if (!session) return;
    this.wsToSession.delete(ws);

    const room = this.rooms.get(session.roomCode);
    if (!room) return;

    if (session.isSpectator) {
      room.spectators = room.spectators.filter(s => s.token !== session.token);
      this.broadcastToRoom(room, {
        type: 'ROOM_STATE',
        roomState: this.toPublicState(room)
      });
      return;
    }

    const player = this.getPlayerByToken(room, session.token);
    if (!player) return;

    player.connected = false;
    player.ws = null;

    if (!room.isGameStarted && !room.redPlayer?.connected && !room.blackPlayer?.connected) {
      this.rooms.delete(room.roomCode);
      return;
    }

    this.broadcastOpponentPresence(room, player.color, false, 45);

    player.disconnectTimeout = setTimeout(() => {
      if (!player.connected && room.isGameStarted && !room.isGameOver) {
        const winner: PieceColor = player.color === 'r' ? 'b' : 'r';
        room.isGameOver = true;
        room.winner = winner;
        const colorName = player.color === 'r' ? 'Đỏ' : 'Đen';
        const winName = winner === 'r' ? 'Đỏ' : 'Đen';
        room.gameOverReason = `Bên ${colorName} mất kết nối quá thời gian quy định (45s). Bên ${winName} thắng cuộc!`;
        this.settleMatchElo(room, winner);

        this.broadcastToRoom(room, {
          type: 'GAME_OVER',
          winner,
          reason: room.gameOverReason,
          redEloDelta: room.redEloDelta,
          blackEloDelta: room.blackEloDelta
        });
      }

      if (!room.redPlayer?.connected && !room.blackPlayer?.connected) {
        this.rooms.delete(room.roomCode);
      }
    }, 45000);
  }

  private leaveRoom(ws: ClientSocket) {
    const session = this.wsToSession.get(ws);
    if (session && !session.isSpectator) {
      const room = this.rooms.get(session.roomCode);
      if (room && !room.isGameStarted) {
        this.wsToSession.delete(ws);
        this.rooms.delete(session.roomCode);
        return;
      }
    }
    this.handleDisconnect(ws);
  }

  private broadcastOpponentPresence(
    room: InternalRoom,
    disconnectedSide: PieceColor,
    connected: boolean,
    graceSeconds?: number
  ) {
    const recipient = disconnectedSide === 'r' ? room.blackPlayer : room.redPlayer;
    if (recipient && recipient.ws && recipient.connected) {
      recipient.ws.send(JSON.stringify({
        type: 'OPPONENT_PRESENCE',
        connected,
        graceSeconds
      }));
    }
  }

  private broadcastToRoom(room: InternalRoom, msg: ServerMessage) {
    const data = JSON.stringify(msg);
    if (room.redPlayer?.ws && room.redPlayer.connected) {
      room.redPlayer.ws.send(data);
    }
    if (room.blackPlayer?.ws && room.blackPlayer.connected) {
      room.blackPlayer.ws.send(data);
    }
    for (const spec of room.spectators) {
      if (spec.ws && spec.connected) {
        spec.ws.send(data);
      }
    }
  }

  private getPlayerByToken(room: InternalRoom, token: string): InternalPlayer | null {
    if (room.redPlayer && room.redPlayer.token === token) return room.redPlayer;
    if (room.blackPlayer && room.blackPlayer.token === token) return room.blackPlayer;
    return null;
  }

  private toPublicState(room: InternalRoom): RoomState {
    return {
      roomCode: room.roomCode,
      isPublic: room.isPublic,
      isRanked: room.isRanked,
      timeLimit: room.timeLimit,
      hostId: room.hostId,
      redPlayer: room.redPlayer ? {
        id: room.redPlayer.id,
        name: room.redPlayer.name,
        color: room.redPlayer.color,
        connected: room.redPlayer.connected,
        isHost: room.redPlayer.isHost,
        joinedAt: room.redPlayer.joinedAt,
        elo: room.redPlayer.elo,
        rankTier: room.redPlayer.rankTier
      } : null,
      blackPlayer: room.blackPlayer ? {
        id: room.blackPlayer.id,
        name: room.blackPlayer.name,
        color: room.blackPlayer.color,
        connected: room.blackPlayer.connected,
        isHost: room.blackPlayer.isHost,
        joinedAt: room.blackPlayer.joinedAt,
        elo: room.blackPlayer.elo,
        rankTier: room.blackPlayer.rankTier
      } : null,
      spectators: room.spectators.map(s => ({
        id: s.id,
        name: s.name,
        color: s.color,
        connected: s.connected,
        isHost: false,
        joinedAt: s.joinedAt,
        elo: s.elo,
        rankTier: s.rankTier,
        isSpectator: true
      })),
      board: room.board,
      turn: room.turn,
      moveHistory: room.moveHistory,
      lastMove: room.lastMove,
      inCheck: room.inCheck,
      isGameStarted: room.isGameStarted,
      isGameOver: room.isGameOver,
      winner: room.winner,
      gameOverReason: room.gameOverReason,
      redTimer: room.redTimer,
      blackTimer: room.blackTimer,
      turnTimer: room.turnTimer,
      moveTimeLimit: room.moveTimeLimit || 60,
      drawOffer: room.drawOffer,
      rematchRequested: room.rematchRequested,
      chatMessages: room.chatMessages,
      redElo: room.redElo,
      blackElo: room.blackElo,
      redEloDelta: room.redEloDelta,
      blackEloDelta: room.blackEloDelta,
      variant: room.variant || 'standard'
    };
  }
}

const globalForRoomManager = globalThis as unknown as {
  __xiangqiRoomManager?: RoomManager;
};

export function getRoomManager(): RoomManager {
  if (!globalForRoomManager.__xiangqiRoomManager) {
    globalForRoomManager.__xiangqiRoomManager = new RoomManager();
  }
  return globalForRoomManager.__xiangqiRoomManager;
}
