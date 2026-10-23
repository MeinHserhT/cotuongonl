import assert from 'node:assert/strict';
import { INITIAL_BOARD } from '../lib/xiangqi-types';
import { getAllLegalMoves, isKingInCheck } from '../lib/xiangqi-rules';
import { createInitialJieqiGame, executeJieqiMove, getAllJieqiLegalMoves, isPieceHidden } from '../lib/jieqi-rules';
import { RoomManager } from '../server/room-manager';
import { ServerMessage } from '../lib/multiplayer-types';

function findLastMessage<T extends ServerMessage['type']>(
  messages: ServerMessage[],
  type: T
): Extract<ServerMessage, { type: T }> | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === type) {
      return messages[i] as Extract<ServerMessage, { type: T }>;
    }
  }
  return undefined;
}

function runProductionVerification() {
  console.log('1. Verifying Standard Xiangqi Engine Rules...');
  const initialMovesRed = getAllLegalMoves(INITIAL_BOARD, 'r');
  assert.equal(initialMovesRed.length, 44, 'Initial Xiangqi position should have exactly 44 legal moves for Red');
  assert.equal(isKingInCheck(INITIAL_BOARD, 'r'), false, 'Red King should not be in check initially');
  assert.equal(isKingInCheck(INITIAL_BOARD, 'b'), false, 'Black King should not be in check initially');

  console.log('2. Verifying Jieqi (Cờ Úp) Engine & Mystery Flip...');
  const jieqi = createInitialJieqiGame();
  let hiddenCount = 0;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      if (isPieceHidden(jieqi.board[r][c])) hiddenCount++;
    }
  }
  assert.equal(hiddenCount, 30, 'Jieqi initial board must have 30 face-down pieces (all except 2 Kings)');
  const jieqiRedMoves = getAllJieqiLegalMoves(jieqi.board, 'r');
  assert.equal(jieqiRedMoves.length, 46, 'Jieqi initial board must have 46 legal moves for Red (Advisors can leave palace)');

  // Execute a pawn push in Jieqi and verify it flips face-up
  const firstMove = { fromR: 6, fromC: 0, toR: 5, toC: 0 };
  const moveRes = executeJieqiMove(jieqi.board, jieqi.hiddenBoard, firstMove);
  assert.ok(moveRes.revealedPiece, 'Moving a hidden piece in Jieqi must reveal its actual identity');
  assert.equal(isPieceHidden(moveRes.newBoard[5][0]), false, 'Revealed piece on board must no longer be hidden');

  console.log('3. Verifying RoomManager Bounds Guard & Jieqi Rematch Parity...');
  const rm = new RoomManager();
  const hostId = 'test_host_client';
  const guestId = 'test_guest_client';

  // Create a Jieqi room
  const hostCreateOut = rm.handleHttpPoll(hostId, [
    {
      type: 'ROOM_CREATE',
      hostName: 'HostPlayer',
      hostColor: 'random',
      timeLimit: 900,
      isPublic: true,
      isRanked: true,
      playerElo: 1500,
      variant: 'jieqi'
    }
  ]);

  const createdMsg = findLastMessage(hostCreateOut, 'ROOM_JOINED');
  assert.ok(createdMsg, 'Host must receive ROOM_JOINED');
  const roomCode = createdMsg.roomCode;
  const hostInitialColor = createdMsg.playerColor;

  // Guest joins room
  const guestJoinOut = rm.handleHttpPoll(guestId, [
    {
      type: 'ROOM_JOIN',
      roomCode,
      playerName: 'GuestPlayer',
      asSpectator: false,
      playerElo: 1300
    }
  ]);

  const guestJoined = findLastMessage(guestJoinOut, 'ROOM_JOINED');
  assert.ok(guestJoined, 'Guest must receive ROOM_JOINED');
  assert.equal(guestJoined.roomState.isGameStarted, true, 'Game should start once both players join');
  assert.equal(guestJoined.roomState.variant, 'jieqi', 'Room variant must be jieqi');

  const redClientId = hostInitialColor === 'r' ? hostId : guestId;
  const blackClientId = hostInitialColor === 'r' ? guestId : hostId;
  const initialRedElo = hostInitialColor === 'r' ? 1500 : 1300;
  const initialBlackElo = hostInitialColor === 'r' ? 1300 : 1500;

  // Attempt malformed out-of-bounds moves from active Red player — server must NOT crash and must return ERROR
  const invalidPayloads = [
    { fromR: -1, fromC: 0, toR: 5, toC: 0 },
    { fromR: 99, fromC: 0, toR: 5, toC: 0 },
    { fromR: 6, fromC: 0, toR: 5, toC: 99 },
    { fromR: NaN, fromC: 0, toR: 5, toC: 0 }
  ];
  for (const badMove of invalidPayloads) {
    const errOut = rm.handleHttpPoll(redClientId, [
      {
        type: 'MOVE_MAKE',
        move: badMove
      }
    ]);
    const errMsg = findLastMessage(errOut, 'ERROR');
    assert.ok(errMsg, 'Malformed move coordinates must return an ERROR message without crashing');
  }

  // Make a valid Jieqi move so a piece is revealed
  const moveOut = rm.handleHttpPoll(redClientId, [
    {
      type: 'MOVE_MAKE',
      move: { fromR: 6, fromC: 4, toR: 5, toC: 4 }
    }
  ]);
  const moveBroadcast = findLastMessage(moveOut, 'MOVE_BROADCAST');
  assert.ok(moveBroadcast, 'Valid Jieqi move must broadcast MOVE_BROADCAST');
  assert.equal(isPieceHidden(moveBroadcast.board[5][4]), false, 'Moved piece must be face-up after move');

  // Black resigns to finish the match, then test Rematch in Jieqi mode
  const resignOut = rm.handleHttpPoll(blackClientId, [{ type: 'RESIGN' }]);
  const gameOverMsg = findLastMessage(resignOut, 'GAME_OVER');
  assert.ok(gameOverMsg, 'Resignation must broadcast GAME_OVER');
  const redDelta = gameOverMsg.redEloDelta || 0;
  const blackDelta = gameOverMsg.blackEloDelta || 0;

  // Both players request rematch
  rm.handleHttpPoll(redClientId, [{ type: 'REMATCH_REQUEST' }]);
  const rematchOut = rm.handleHttpPoll(blackClientId, [{ type: 'REMATCH_REQUEST' }]);

  const rematchRoomJoined = findLastMessage(rematchOut, 'ROOM_JOINED');
  assert.ok(rematchRoomJoined, 'Rematch must send updated ROOM_JOINED');
  assert.equal(rematchRoomJoined.playerColor, 'r', 'Previous Black player must swap to Red on rematch');
  assert.equal(
    rematchRoomJoined.roomState.redElo,
    initialBlackElo + blackDelta,
    'Swapped Red Elo must match the new Red player updated Elo'
  );
  assert.equal(
    rematchRoomJoined.roomState.blackElo,
    initialRedElo + redDelta,
    'Swapped Black Elo must match the new Black player updated Elo'
  );

  // Verify the rematched Jieqi board has 30 face-down pieces again!
  let rematchHiddenCount = 0;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      if (isPieceHidden(rematchRoomJoined.roomState.board[r][c])) rematchHiddenCount++;
    }
  }
  assert.equal(rematchHiddenCount, 30, 'Jieqi rematch board must reset to 30 hidden pieces instead of standard Xiangqi');

  console.log('✅ All production verification checks passed!');
  process.exit(0);
}

runProductionVerification();
