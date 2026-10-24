'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ClientMessage,
  ServerMessage,
  RoomState,
  PublicRoomSummary,
  ChatMessage,
  LeaderboardEntry
} from '@/lib/multiplayer-types';
import { Move, PieceColor, MoveNotation, GameVariant } from '@/lib/xiangqi-types';

export function useXiangqiSocket(
  onRemoteMove?: (
    move: Move,
    notation: MoveNotation,
    finalBoard: (string | null)[][],
    capturedPiece: string | null
  ) => void,
  enabled: boolean = false
) {
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myColor, setMyColor] = useState<PieceColor | null>(null);
  const [myToken, setMyToken] = useState<string | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [incomingDrawOffer, setIncomingDrawOffer] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [opponentGraceSeconds, setOpponentGraceSeconds] = useState(45);

  const myColorRef = useRef<PieceColor | null>(null);
  useEffect(() => {
    myColorRef.current = myColor;
  }, [myColor]);

  const onRemoteMoveRef = useRef(onRemoteMove);
  const connectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onRemoteMoveRef.current = onRemoteMove;
  }, [onRemoteMove]);

  const getClientId = useCallback(() => {
    if (clientIdRef.current) return clientIdRef.current;
    if (typeof window !== 'undefined') {
      try {
        const existing = sessionStorage.getItem('xq_mp_client_id');
        if (existing) {
          clientIdRef.current = existing;
          return existing;
        }
        const generated = 'cid_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        sessionStorage.setItem('xq_mp_client_id', generated);
        clientIdRef.current = generated;
        return generated;
      } catch {}
    }
    const fallback = 'cid_' + Math.random().toString(36).substring(2, 10);
    clientIdRef.current = fallback;
    return fallback;
  }, []);

  const saveSession = useCallback((roomCode: string, token: string, color: PieceColor, spectator = false) => {
    try {
      sessionStorage.setItem('xq_online_session', JSON.stringify({ roomCode, token, color, spectator, timestamp: Date.now() }));
    } catch {
      // ignore
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem('xq_online_session');
      localStorage.removeItem('xq_online_session');
    } catch {
      // ignore
    }
  }, []);

  const processServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'LOBBY_ROOMS':
        setPublicRooms(msg.rooms);
        setIsLoadingRooms(false);
        break;

      case 'LEADERBOARD_DATA':
        setLeaderboard(msg.leaderboard);
        setIsLoadingLeaderboard(false);
        break;

      case 'ROOM_JOINED':
        setRoomState(msg.roomState);
        setMyColor(msg.playerColor);
        setMyToken(msg.playerToken);
        setIsSpectator(msg.isSpectator);
        setChatMessages(msg.roomState.chatMessages || []);
        saveSession(msg.roomCode, msg.playerToken, msg.playerColor, msg.isSpectator);
        break;

      case 'ROOM_STATE':
        setRoomState(msg.roomState);
        if (msg.roomState.chatMessages) {
          setChatMessages(msg.roomState.chatMessages);
        }
        break;

      case 'MOVE_BROADCAST':
        setRoomState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            board: msg.board,
            turn: msg.turn,
            inCheck: msg.inCheck,
            lastMove: msg.move,
            redTimer: msg.redTimer,
            blackTimer: msg.blackTimer,
            turnTimer: msg.turnTimer !== undefined ? msg.turnTimer : 60,
            moveHistory: msg.moveHistory
          };
        });
        if (msg.byColor !== myColorRef.current) {
          onRemoteMoveRef.current?.(msg.move, msg.notation, msg.board, msg.capturedPiece);
        }
        break;

      case 'CLOCK_TICK':
        setRoomState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            redTimer: msg.redTimer,
            blackTimer: msg.blackTimer,
            turnTimer: msg.turnTimer !== undefined ? msg.turnTimer : prev.turnTimer
          };
        });
        break;

      case 'CHAT_BROADCAST':
        setChatMessages(prev => [...prev, msg.message].slice(-50));
        break;

      case 'DRAW_OFFERED':
        setIncomingDrawOffer(true);
        break;

      case 'DRAW_DECLINED':
        setErrorMessage('Đối thủ đã từ chối lời cầu hòa.');
        break;

      case 'GAME_OVER':
        setRoomState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isGameOver: true,
            winner: msg.winner,
            gameOverReason: msg.reason,
            redEloDelta: msg.redEloDelta,
            blackEloDelta: msg.blackEloDelta
          };
        });
        break;

      case 'OPPONENT_PRESENCE':
        setOpponentDisconnected(!msg.connected);
        if (msg.graceSeconds) {
          setOpponentGraceSeconds(msg.graceSeconds);
        }
        break;

      case 'ERROR':
        setErrorMessage(msg.message);
        break;
    }
  }, [saveSession]);

  const pollHttp = useCallback(async (outbound: ClientMessage[] = []) => {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/mp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: getClientId(),
          messages: outbound
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      setIsConnected(true);
      if (Array.isArray(data?.messages)) {
        for (const srvMsg of data.messages) {
          processServerMessage(srvMsg as ServerMessage);
        }
      }
    } catch {
      // ignore transient network errors
    }
  }, [getClientId, processServerMessage]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      void pollHttp([msg]);
    }
  }, [pollHttp]);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Initialize HTTP session immediately so app works even if WS is blocked by proxy
    const initialMsgs: ClientMessage[] = [
      { type: 'LOBBY_LIST' },
      { type: 'LEADERBOARD_GET' }
    ];
    try {
      const saved = sessionStorage.getItem('xq_online_session');
      if (saved) {
        const { roomCode, token, spectator, timestamp } = JSON.parse(saved);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          initialMsgs.unshift({
            type: 'ROOM_JOIN',
            roomCode,
            playerName: 'Kỳ thủ',
            playerToken: token,
            asSpectator: spectator
          });
        } else {
          clearSession();
        }
      }
    } catch {}
    void pollHttp(initialMsgs);

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const envWs = process.env.NEXT_PUBLIC_WS_SERVER_URL?.trim();
    const isDeadRenderUrl = Boolean(envWs && /cotuongonl\.onrender\.com/i.test(envWs));
    const isServerlessHost =
      typeof window !== 'undefined' && /\.vercel\.app$/i.test(window.location.hostname);

    let wsUrl: string | null = null;
    if (envWs && !isDeadRenderUrl && /^(wss?|https?):\/\//i.test(envWs)) {
      wsUrl = envWs.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
    } else if (!isServerlessHost) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}/api/ws`;
    }

    if (!wsUrl) {
      // Serverless deployment (e.g. Vercel) uses /api/mp HTTP polling transport directly without console WS errors
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setErrorMessage(null);
        ws.send(JSON.stringify({ type: 'LOBBY_LIST' }));
        ws.send(JSON.stringify({ type: 'LEADERBOARD_GET' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          processServerMessage(msg);
        } catch (err) {
          console.error('Failed to parse WS server message:', err);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
      };

      ws.onerror = () => {
        // Fallback to HTTP polling is already active
      };
    } catch {
      // Fallback to HTTP polling is already active
    }
  }, [clearSession, pollHttp, processServerMessage]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    let shouldAutoConnect = enabled;
    if (!shouldAutoConnect && typeof window !== 'undefined') {
      try {
        if (
          sessionStorage.getItem('xq_online_session') ||
          window.location.search.includes('room=')
        ) {
          shouldAutoConnect = true;
        }
      } catch {}
    }

    if (!shouldAutoConnect) {
      return;
    }

    const initTimer = setTimeout(() => {
      connect();
    }, 0);

    const httpPollTimer = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        void pollHttp([]);
      }
    }, 1200);

    const pingTimer = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(httpPollTimer);
      clearInterval(pingTimer);
    };
  }, [enabled, connect, pollHttp]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const fetchLobbyRooms = useCallback(() => {
    setIsLoadingRooms(true);
    send({ type: 'LOBBY_LIST' });
  }, [send]);

  const fetchLeaderboard = useCallback(() => {
    setIsLoadingLeaderboard(true);
    send({ type: 'LEADERBOARD_GET' });
  }, [send]);

  const createRoom = useCallback((
    hostName: string,
    hostColor: 'r' | 'b' | 'random' = 'random',
    timeLimit = 900,
    isPublic = true,
    isRanked = true,
    playerElo?: number,
    variant?: GameVariant,
    matchmake = false
  ) => {
    send({
      type: 'ROOM_CREATE',
      hostName,
      hostColor: 'random',
      timeLimit,
      isPublic,
      isRanked: true,
      playerElo,
      variant,
      matchmake
    });
  }, [send]);

  const joinRoom = useCallback((
    roomCode: string,
    playerName: string,
    asSpectator = false,
    playerElo?: number
  ) => {
    send({
      type: 'ROOM_JOIN',
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim(),
      asSpectator,
      playerElo
    });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: 'ROOM_LEAVE' });
    setRoomState(null);
    setMyColor(null);
    setMyToken(null);
    setIsSpectator(false);
    clearSession();
    send({ type: 'LOBBY_LIST' });
  }, [send, clearSession]);

  const makeMove = useCallback((move: Move) => {
    send({ type: 'MOVE_MAKE', move });
  }, [send]);

  const sendChat = useCallback((text: string, isQuick = false) => {
    send({ type: 'CHAT_SEND', text, isQuick });
  }, [send]);

  const offerDraw = useCallback(() => {
    send({ type: 'DRAW_OFFER' });
  }, [send]);

  const respondDraw = useCallback((accept: boolean) => {
    send({ type: 'DRAW_RESPOND', accept });
    setIncomingDrawOffer(false);
  }, [send]);

  const resign = useCallback(() => {
    send({ type: 'RESIGN' });
  }, [send]);

  const requestRematch = useCallback(() => {
    send({ type: 'REMATCH_REQUEST' });
  }, [send]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    isConnected,
    reconnect: connect,
    isInRoom: roomState !== null,
    roomState,
    myColor,
    myToken,
    isSpectator,
    publicRooms,
    leaderboard,
    chatMessages,
    isLoadingRooms,
    isLoadingLeaderboard,
    errorMessage,
    incomingDrawOffer,
    opponentDisconnected,
    opponentGraceSeconds,
    fetchLobbyRooms,
    fetchLeaderboard,
    createRoom,
    joinRoom,
    leaveRoom,
    makeMove,
    sendChat,
    offerDraw,
    respondDraw,
    resign,
    requestRematch,
    clearError
  };
}
