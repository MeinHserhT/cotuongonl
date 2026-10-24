# CodeGraph Knowledge Graph

Generated using [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph).

- **SQLite Database**: `.codegraph/codegraph.db`
- **JSON Graph Export**: `.codegraph/knowledge-graph.json`
- **Total Indexed Files**: 50
- **Total AST Nodes**: 1301
- **Total Graph Edges**: 2586

## Quick CLI Commands

```bash
npm run codegraph:status                        # View index stats
npm run codegraph:sync                          # Sync latest code changes into the graph
npx @colbymchenry/codegraph explore "<query>"   # Explore symbols + call paths
npx @colbymchenry/codegraph context "<task>"    # Build task context from the graph
npx @colbymchenry/codegraph callers <symbol>    # Trace all callers of a symbol
npx @colbymchenry/codegraph callees <symbol>    # Trace all callees of a symbol
npx @colbymchenry/codegraph impact <symbol>     # Analyze impact radius of changing a symbol
```

## Node Distribution

| Node Kind | Count |
|---|---:|
| `property` | 675 |
| `function` | 195 |
| `import` | 159 |
| `interface` | 71 |
| `constant` | 61 |
| `file` | 50 |
| `method` | 47 |
| `component` | 11 |
| `type_alias` | 10 |
| `enum_member` | 9 |
| `variable` | 7 |
| `class` | 2 |
| `enum` | 2 |
| `route` | 2 |

## Edge Distribution

| Edge Kind | Count |
|---|---:|
| `contains` | 1249 |
| `calls` | 527 |
| `references` | 491 |
| `imports` | 316 |
| `instantiates` | 3 |

## Indexed Files & Core Symbols

### `app/api/mp/route.ts` (typescript, 6 nodes)
- **`dynamic`** (`export constant`, L4–L4): `= 'force-dynamic'`
- **`POST`** (`export function`, L6–L17): `(req: NextRequest)`
- **`POST /api/mp`** (`export route`, L6–L6)

### `app/error.tsx` (tsx, 4 nodes)
- **`ErrorBoundary`** (`export function`, L6–L65): `({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
})`

### `app/global-error.tsx` (tsx, 4 nodes)
- **`GlobalError`** (`export function`, L6–L52): `({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
})`

### `app/layout.tsx` (tsx, 10 nodes)
- **`appUrl`** (`constant`, L4–L4): `= process.env.APP_URL || 'https://cotuong-online.web.app'`
- **`seoTitle`** (`constant`, L5–L5): `= 'Cờ Tướng - Xiangqi Master'`
- **`seoDescription`** (`constant`, L6–L7): `= 'Chơi Cờ Tướng, Cờ Úp online miễn phí phong cách Ziga. Đấu cờ tướng trực tuyến xếp hạng Elo, đấu v`
- **`viewport`** (`export constant`, L9–L19): `= {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportF`
- **`metadata`** (`export constant`, L21–L101): `= {
  verification: {
    google: 'yAvrW9i9Z8WcAH6NczFOhNtznW5L9KVrX92bzpNzgI0',
  },
  metadataBase`
- **`jsonLd`** (`constant`, L103–L162): `= {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['VideoGame', 'WebApplica`
- **`RootLayout`** (`export function`, L164–L235): `({children}: {children: React.ReactNode})`

### `app/page.tsx` (tsx, 49 nodes)
- **`/`** (`export route`, L1–L1)
- **`OnlineLobbyModal`** (`constant`, L25–L28): `= dynamic(
  () => import('@/components/OnlineLobbyModal').then((m) => m.OnlineLobbyModal),
  { ssr:`
- **`AuthModal`** (`constant`, L29–L32): `= dynamic(
  () => import('@/components/AuthModal').then((m) => m.AuthModal),
  { ssr: false }
)`
- **`UserProfileDrawer`** (`constant`, L33–L36): `= dynamic(
  () => import('@/components/UserProfileDrawer').then((m) => m.UserProfileDrawer),
  { ss`
- **`SaveGameModal`** (`constant`, L37–L40): `= dynamic(
  () => import('@/components/SaveGameModal').then((m) => m.SaveGameModal),
  { ssr: false`
- **`OpeningBookModal`** (`constant`, L41–L44): `= dynamic(
  () => import('@/components/OpeningBookModal').then((m) => m.OpeningBookModal),
  { ssr:`
- **`SettingsMenuModal`** (`constant`, L45–L48): `= dynamic(
  () => import('@/components/SettingsMenuModal').then((m) => m.SettingsMenuModal),
  { ss`
- **`XiangqiPage`** (`export function`, L50–L1358): `()`
- **`handleGesture`** (`export function`, L58–L60): `()`
- **`handleToggleMute`** (`export function`, L72–L78): `()`
- **`showToast`** (`export function`, L83–L87): `(msg: string)`
- **`handleLocalMove`** (`export function`, L90–L94): `(m: Move)`
- **`handleWrongTurnClick`** (`export function`, L96–L102): `(clickedColor: PieceColor, currentTurn: PieceColor)`
- **`handlePerpetualCheckWarning`** (`export function`, L104–L106): `(count: number, color: PieceColor)`
- **`handleFlyToConsole`** (`export function`, L116–L128): `()`
- **`handleLocalGameEnd`** (`export function`, L131–L133): `(result: 'win' | 'loss' | 'draw', turnsCount: number)`
- **`handleToggleColorMode`** (`export function`, L216–L224): `()`
- **`handleRemoteMove`** (`export function`, L227–L229): `(m: Move)`
- **`copyToClipboard`** (`export function`, L415–L441): `(text: string)`
- **`handleCopyFen`** (`export function`, L446–L451): `()`
- **`handleShareRoom`** (`export function`, L455–L470): `()`
- **`recordMatchOutcome`** (`export function`, L473–L534): `(result: 'win' | 'loss' | 'draw', turnsCount: number)`
- **`handleCloseGameOverModal`** (`export function`, L550–L556): `()`
- **`handleGameOverNewGame`** (`export function`, L558–L582): `()`
- **`handleGameOverRematch`** (`export function`, L584–L591): `()`
- **`handleCreateOnlineRoom`** (`export function`, L593–L603): `()`
- **`handleSaveGame`** (`export function`, L611–L629): `(name: string)`
- **`handleResumeSavedGame`** (`export function`, L631–L676): `(savedGame: SavedGameData)`
- **`handleOrientation`** (`export function`, L681–L685): `()`
- **`scrollToBoard`** (`export function`, L700–L708): `()`
- **`updateSize`** (`export function`, L714–L725): `()`

### `app/robots.ts` (typescript, 3 nodes)
- **`robots`** (`export function`, L3–L12): `(): MetadataRoute.Robots`

### `app/sitemap.ts` (typescript, 3 nodes)
- **`sitemap`** (`export function`, L3–L13): `(): MetadataRoute.Sitemap`

### `components/AuthModal.tsx` (tsx, 19 nodes)
- **`AuthModalProps`** (`interface`, L21–L31)
- **`AuthModal`** (`export function`, L33–L439): `({
  isOpen,
  onClose,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInGuest,
  r`
- **`handleSubmit`** (`export function`, L56–L112): `(e: React.FormEvent)`
- **`handleGoogleAuth`** (`export function`, L114–L126): `()`
- **`handleGuestAuth`** (`export function`, L128–L140): `()`

### `components/BoardSideTray.tsx` (tsx, 14 nodes)
- **`BoardSideTrayProps`** (`export interface`, L7–L16)
- **`BoardSideTray`** (`export component`, L18–L282): `= React.memo(function BoardSideTray({
  playerColor,
  pieces,
  theme = 'imperial',
  orientation =`

### `components/CannonJumpAnimation.tsx` (tsx, 34 nodes)
- **`CannonJumpData`** (`export interface`, L6–L16)
- **`CannonJumpAnimationProps`** (`interface`, L18–L22)
- **`Particle`** (`interface`, L24–L35)
- **`CannonJumpAnimation`** (`export function`, L37–L298): `({
  data,
  onImpact,
  onComplete
}: CannonJumpAnimationProps)`
- **`getPos`** (`export function`, L79–L86): `(r: number, c: number, width: number, height: number)`
- **`spawnExplosionShrapnel`** (`export function`, L88–L107): `(x: number, y: number)`
- **`initMuzzleBlast`** (`export function`, L109–L126): `(x: number, y: number, targetX: number, targetY: number)`
- **`render`** (`export function`, L128–L254): `(now: number)`
- **`updateCanvasSize`** (`export function`, L256–L262): `()`

### `components/ChariotChargeAnimation.tsx` (tsx, 28 nodes)
- **`ChariotChargeData`** (`export interface`, L5–L11)
- **`ChariotChargeAnimationProps`** (`interface`, L13–L17)
- **`Particle`** (`interface`, L19–L30)
- **`ChariotChargeAnimation`** (`export function`, L32–L391): `({
  data,
  onImpact,
  onComplete
}: ChariotChargeAnimationProps)`
- **`getPos`** (`export function`, L64–L71): `(r: number, c: number, width: number, height: number)`
- **`spawnImpactExplosion`** (`export function`, L73–L124): `(x: number, y: number, angle: number)`
- **`render`** (`export function`, L126–L360): `(now: number)`
- **`updateCanvasSize`** (`export function`, L362–L368): `()`

### `components/GameHeader.tsx` (tsx, 20 nodes)
- **`GameHeaderProps`** (`interface`, L16–L29)
- **`GameHeader`** (`export component`, L31–L179): `= React.memo(({
  colorMode = 'dark',
  onToggleColorMode,
  onShareRoom,
  copiedShareLink,
  onOpe`

### `components/GameModals.tsx` (tsx, 34 nodes)
- **`GameOverModalData`** (`export interface`, L7–L13)
- **`GameOverModalProps`** (`interface`, L15–L24)
- **`GameOverModal`** (`export component`, L26–L198): `= React.memo(({
  modalData,
  isOnline = false,
  onClose,
  onNewGame,
  onRematch,
  rematchReque`
- **`RulesModalProps`** (`interface`, L202–L205)
- **`RulesModal`** (`export component`, L207–L238): `= React.memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="`
- **`ResignModalProps`** (`interface`, L242–L246)
- **`ResignModal`** (`export component`, L248–L278): `= React.memo(({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div`
- **`DrawOfferModalProps`** (`interface`, L282–L286)
- **`DrawOfferModal`** (`export component`, L288–L318): `= React.memo(({ isOpen, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div`

### `components/HorseKickAnimation.tsx` (tsx, 30 nodes)
- **`HorseKickData`** (`export interface`, L6–L15)
- **`HorseKickAnimationProps`** (`interface`, L17–L21)
- **`Particle`** (`interface`, L23–L32)
- **`HorseKickAnimation`** (`export function`, L34–L201): `({
  data,
  onImpact,
  onComplete
}: HorseKickAnimationProps)`
- **`getPos`** (`export function`, L63–L70): `(r: number, c: number, width: number, height: number)`
- **`spawnHoofKickSparks`** (`export function`, L72–L89): `(x: number, y: number, angle: number)`
- **`render`** (`export function`, L93–L157): `(now: number)`
- **`updateCanvasSize`** (`export function`, L159–L165): `()`

### `components/MatchResultOverlay.tsx` (tsx, 75 nodes)
- **`MatchResultType`** (`export type_alias`, L5–L5)
- **`MatchResultOverlayProps`** (`interface`, L7–L9)
- **`FireworkParticle`** (`interface`, L11–L21)
- **`Rocket`** (`interface`, L23–L31)
- **`ConfettiPiece`** (`interface`, L33–L45)
- **`LeafParticle`** (`interface`, L47–L62)
- **`RainParticle`** (`interface`, L64–L71)
- **`PetalParticle`** (`interface`, L73–L85)
- **`MatchResultOverlay`** (`export function`, L87–L505): `({ type }: MatchResultOverlayProps)`
- **`handleResize`** (`export function`, L100–L104): `()`
- **`explodeRocket`** (`export function`, L221–L241): `(rx: number, ry: number, baseColor: string)`
- **`drawLeaf`** (`export function`, L243–L293): `(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      col`
- **`drawPetal`** (`export function`, L295–L317): `(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      col`
- **`render`** (`export function`, L319–L481): `()`

### `components/ModeVariantSelector.tsx` (tsx, 29 nodes)
- **`VariantEloStats`** (`export interface`, L15–L22)
- **`ModeVariantSelectorProps`** (`export interface`, L24–L41)
- **`ModeVariantSelector`** (`export component`, L43–L406): `= React.memo(({
  variant = 'standard',
  onChangeVariant,
  gameMode,
  onSelectOnline,
  onSelectP`

### `components/OnlineLobbyModal.tsx` (tsx, 38 nodes)
- **`OnlineLobbyModalProps`** (`interface`, L25–L50)
- **`OnlineLobbyModal`** (`export function`, L52–L1134): `({
  isOpen,
  onClose,
  publicRooms,
  leaderboard,
  isLoadingRooms,
  isLoadingLeaderboard,
  on`
- **`handleNameChange`** (`export function`, L157–L164): `(val: string)`
- **`handleCodeChange`** (`export function`, L166–L174): `(raw: string)`
- **`handleJoin`** (`export function`, L176–L183): `(asSpectator = false)`
- **`copyTextSafe`** (`export function`, L185–L201): `(text: string)`
- **`handleCopyCode`** (`export function`, L203–L207): `(code: string)`
- **`handleCopyLink`** (`export function`, L209–L221): `(code: string)`
- **`formatSearchTimer`** (`export function`, L225–L229): `(secs: number)`

### `components/OpeningBookModal.tsx` (tsx, 11 nodes)
- **`OpeningBookModalProps`** (`interface`, L19–L24)
- **`OpeningBookModal`** (`export function`, L26–L257): `({
  isOpen,
  onClose,
  selectedOpening: initialOpening,
  onSelectOpeningForNewGame
}: OpeningBoo`

### `components/PlayerBlock.tsx` (tsx, 29 nodes)
- **`PlayerBlockProps`** (`export interface`, L7–L31)
- **`PlayerBlock`** (`export component`, L33–L278): `= React.memo(function PlayerBlock({
  isActive,
  isRed,
  avatarChar,
  title,
  badgeLabel,
  time`

### `components/SaveGameModal.tsx` (tsx, 11 nodes)
- **`SaveGameModalProps`** (`interface`, L7–L12)
- **`SaveGameModal`** (`export function`, L14–L116): `({
  isOpen,
  onClose,
  onSave,
  defaultName = 'Ván cờ của tôi'
}: SaveGameModalProps)`
- **`handleSubmit`** (`export function`, L26–L42): `(e: React.FormEvent)`

### `components/SettingsMenuModal.tsx` (tsx, 26 nodes)
- **`SettingsMenuModalProps`** (`interface`, L22–L41)
- **`SettingsMenuModal`** (`export component`, L43–L403): `= React.memo(({
  isOpen,
  onClose,
  variant = 'standard',
  onToggleVariant,
  isMuted,
  onToggl`

### `components/StartGameMenuModal.tsx` (tsx, 25 nodes)
- **`StartGameMenuModalProps`** (`export interface`, L8–L26)
- **`StartGameMenuModal`** (`export component`, L28–L227): `= React.memo(({
  isOpen,
  onClose,
  variant = 'standard',
  onChangeVariant,
  gameMode,
  onChan`
- **`triggerFlyToConsole`** (`export function`, L52–L94): `(onComplete: () => void)`

### `components/UnifiedGameConsole.tsx` (tsx, 56 nodes)
- **`UnifiedGameConsoleProps`** (`export interface`, L27–L88)
- **`UnifiedGameConsole`** (`export function`, L90–L841): `({
  variant = 'standard',
  onChangeVariant,
  eloStandard = 1200,
  eloJieqi = 1200,
  statsStanda`
- **`handleSendChat`** (`export function`, L159–L165): `(e?: React.FormEvent)`

### `components/UserProfileDrawer.tsx` (tsx, 19 nodes)
- **`UserProfileDrawerProps`** (`interface`, L33–L42)
- **`UserProfileDrawer`** (`export function`, L44–L714): `({
  isOpen,
  onClose,
  profile,
  onSignOut,
  onResumeGame,
  onSaveCurrentGame,
  refreshTrigge`
- **`loadHistory`** (`export function`, L62–L73): `()`
- **`loadSaved`** (`export function`, L75–L86): `()`
- **`handleDeleteSaved`** (`export function`, L109–L117): `(id: string)`

### `components/XiangqiBoard.tsx` (tsx, 52 nodes)
- **`AnimatingPieceData`** (`export interface`, L16–L23)
- **`BoardMarker`** (`interface`, L25–L30)
- **`BOARD_MARKERS`** (`constant`, L32–L54): `= [
  // Black side Cannons: Rank 2, Files 1, 7
  { x: 75, y: 125, hasLeft: true, hasRight: true },
`
- **`buildMarkerPath`** (`function`, L56–L67): `(cx: number, cy: number, hasLeft: boolean, hasRight: boolean, d = 4, len = 7): string`
- **`XiangqiBoardProps`** (`interface`, L69–L98)
- **`XiangqiBoard`** (`export component`, L100–L639): `= React.memo(({
  board,
  theme,
  isFlipped,
  selectedSquare,
  validMoves,
  lastMove,
  turn,
 `
- **`getPct`** (`export function`, L134–L141): `(r: number, c: number)`

### `components/ui/AggressiveToggle.tsx` (tsx, 11 nodes)
- **`AggressiveToggleProps`** (`export interface`, L5–L12)
- **`AggressiveToggle`** (`export function`, L17–L98): `({
  checked,
  onChange,
  disabled = false,
  size = 'sm',
  ariaLabel = 'Chuyển đổi',
})`
- **`handleToggle`** (`export function`, L26–L30): `()`

### `components/ui/DayNightSwitch.tsx` (tsx, 8 nodes)
- **`DayNightSwitchProps`** (`export interface`, L5–L10)
- **`DayNightSwitch`** (`export function`, L16–L83): `({
  isDark,
  onToggle,
  size = 'md',
  className = '',
})`

### `eslint.config.mjs` (javascript, 3 nodes)

### `hooks/useAuth.ts` (typescript, 13 nodes)
- **`useAuth`** (`export function`, L23–L207): `()`
- **`refreshProfile`** (`export function`, L33–L45): `(currUser?: User | null)`
- **`signInWithEmail`** (`export function`, L66–L79): `(email: string, pass: string)`
- **`signUpWithEmail`** (`export function`, L81–L97): `(email: string, pass: string, displayName: string)`
- **`signInWithGoogle`** (`export function`, L99–L133): `()`
- **`signInGuest`** (`export function`, L135–L168): `()`
- **`signOutUser`** (`export function`, L170–L179): `()`
- **`resetPassword`** (`export function`, L181–L191): `(email: string)`
- **`getFriendlyErrorMessage`** (`function`, L209–L235): `(msg: string): string`

### `hooks/useXiangqiGame.ts` (typescript, 40 nodes)
- **`UseXiangqiGameOptions`** (`export interface`, L41–L48)
- **`CapturedPieceRecord`** (`export interface`, L50–L55)
- **`useXiangqiGame`** (`export function`, L57–L863): `(
  audioEngineRef: React.RefObject<AudioEngine | null>,
  options?: UseXiangqiGameOptions
)`
- **`setTheme`** (`export function`, L144–L152): `(next: BoardTheme | ((prev: BoardTheme) => BoardTheme))`
- **`toggleEnablePieceAnimations`** (`export function`, L154–L162): `()`
- **`toggleEnableHaptics`** (`export function`, L169–L187): `()`
- **`toggleEnableWakeLock`** (`export function`, L189–L197): `()`
- **`triggerBoardShake`** (`export function`, L205–L222): `(type: 'check' | 'capture')`
- **`animate`** (`export function`, L248–L265): `()`
- **`handleTimeOut`** (`export function`, L271–L289): `(color: PieceColor)`
- **`executeMove`** (`export function`, L333–L588): `(m: Move, isFromBot: boolean = false, isRemote: boolean = false)`
- **`handleSquareClick`** (`export function`, L631–L664): `(r: number, c: number)`
- **`startNewGame`** (`export function`, L667–L714): `(
    newMode?: 'pve-red' | 'pve-black' | 'pvp' | 'online',
    newVariant?: GameVariant
  )`
- **`handleToggleVariant`** (`export function`, L717–L719): `(targetVariant: GameVariant)`
- **`handleUndo`** (`export function`, L722–L753): `()`
- **`getCapturedPiecesForViewer`** (`export function`, L757–L786): `(viewerColor: PieceColor)`

### `hooks/useXiangqiSocket.ts` (typescript, 24 nodes)
- **`useXiangqiSocket`** (`export function`, L14–L441): `(
  onRemoteMove?: (
    move: Move,
    notation: MoveNotation,
    finalBoard: (string | null)[][]`
- **`getClientId`** (`export function`, L51–L69): `()`
- **`saveSession`** (`export function`, L71–L77): `(roomCode: string, token: string, color: PieceColor, spectator = false)`
- **`clearSession`** (`export function`, L79–L86): `()`
- **`processServerMessage`** (`export function`, L88–L185): `(msg: ServerMessage)`
- **`pollHttp`** (`export function`, L187–L209): `(outbound: ClientMessage[] = [])`
- **`send`** (`export function`, L211–L217): `(msg: ClientMessage)`
- **`connect`** (`export function`, L219–L290): `()`
- **`fetchLobbyRooms`** (`export function`, L324–L327): `()`
- **`fetchLeaderboard`** (`export function`, L329–L332): `()`
- **`createRoom`** (`export function`, L334–L355): `(
    hostName: string,
    hostColor: 'r' | 'b' | 'random' = 'random',
    timeLimit = 900,
    isP`
- **`joinRoom`** (`export function`, L357–L370): `(
    roomCode: string,
    playerName: string,
    asSpectator = false,
    playerElo?: number
  )`
- **`leaveRoom`** (`export function`, L372–L380): `()`
- **`makeMove`** (`export function`, L382–L384): `(move: Move)`
- **`sendChat`** (`export function`, L386–L388): `(text: string, isQuick = false)`
- **`offerDraw`** (`export function`, L390–L392): `()`
- **`respondDraw`** (`export function`, L394–L397): `(accept: boolean)`
- **`resign`** (`export function`, L399–L401): `()`
- **`requestRematch`** (`export function`, L403–L405): `()`
- **`clearError`** (`export function`, L407–L409): `()`

### `lib/ai-worker-client.ts` (typescript, 12 nodes)
- **`workerInstance`** (`variable`, L8–L8): `= null`
- **`workerFailed`** (`variable`, L9–L9): `= false`
- **`reqCounter`** (`variable`, L10–L10): `= 0`
- **`pendingCallbacks`** (`constant`, L11–L11): `= new Map<number, (move: Move | null) => void>()`
- **`getWorker`** (`function`, L13–L41): `(): Worker | null`
- **`computeAIMoveAsync`** (`export function`, L43–L85): `(
  variant: GameVariant,
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  turn: `
- **`runFallbackSync`** (`function`, L87–L103): `(
  variant: GameVariant,
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  turn: `

### `lib/ai.worker.ts` (typescript, 19 nodes)
- **`AIWorkerRequest`** (`export interface`, L5–L12)
- **`AIWorkerResponse`** (`export interface`, L14–L18)
- **`WorkerScope`** (`interface`, L20–L23)
- **`ctx`** (`constant`, L25–L25): `= self as unknown as WorkerScope`

### `lib/audio.ts` (typescript, 30 nodes)
- **`AudioEngine`** (`export class`, L1–L581)
- **`constructor`** (`method`, L13–L29): `()`
- **`init`** (`method`, L31–L40): `()`
- **`loadAudioBuffers`** (`method`, L42–L74): `()`
- **`createWoodClick`** (`method`, L80–L107): `(t: number, freq: number, q: number, gainVal: number, duration: number)`
- **`createWoodTone`** (`method`, L112–L128): `(t: number, freq: number, gainVal: number, duration: number, type: OscillatorType = 'sine')`
- **`playSelect`** (`method`, L130–L139): `()`
- **`playPickup`** (`method`, L141–L160): `()`
- **`playMove`** (`method`, L167–L222): `()`
- **`playCapture`** (`method`, L229–L277): `()`
- **`playCannonFire`** (`method`, L279–L328): `()`
- **`playChariotCharge`** (`method`, L335–L396): `()`
- **`playHorseKick`** (`method`, L406–L466): `()`
- **`playCheck`** (`method`, L468–L486): `()`
- **`playVictory`** (`method`, L488–L506): `()`
- **`playDefeat`** (`method`, L508–L526): `()`
- **`playIllegal`** (`method`, L528–L543): `()`
- **`playDraw`** (`method`, L545–L563): `()`
- **`playCountdown`** (`method`, L565–L580): `()`

### `lib/firebase.ts` (typescript, 90 nodes)
- **`app`** (`constant`, L20–L20): `= !getApps().length ? initializeApp(firebaseConfig) : getApp()`
- **`auth`** (`export constant`, L22–L22): `= getAuth(app)`
- **`googleProvider`** (`export constant`, L23–L23): `= new GoogleAuthProvider()`
- **`db`** (`export constant`, L26–L29): `= firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? get`
- **`analytics`** (`export variable`, L31–L31): `= null`
- **`OperationType`** (`export enum`, L42–L49)
- **`CREATE`** (`enum_member`, L43–L43)
- **`UPDATE`** (`enum_member`, L44–L44)
- **`DELETE`** (`enum_member`, L45–L45)
- **`LIST`** (`enum_member`, L46–L46)
- **`GET`** (`enum_member`, L47–L47)
- **`WRITE`** (`enum_member`, L48–L48)
- **`FirestoreErrorInfo`** (`export interface`, L51–L66)
- **`handleFirestoreError`** (`export function`, L68–L87): `(error: unknown, operationType: OperationType, path: string | null): never`
- **`testConnection`** (`export function`, L90–L98): `()`
- **`UserProfileData`** (`export interface`, L100–L131)
- **`MatchRecordData`** (`export interface`, L133–L148)
- **`SavedGameData`** (`export interface`, L150–L163)
- **`createDefaultProfile`** (`export function`, L165–L203): `(user: User): UserProfileData`
- **`getOrCreateUserProfile`** (`export function`, L205–L247): `(user: User): Promise<UserProfileData>`
- **`recordMatchProgress`** (`export function`, L249–L392): `(
  userId: string,
  match: Omit<MatchRecordData, 'id' | 'userId' | 'finalElo'> & { variant?: 'stan`
- **`fetchUserMatches`** (`export function`, L394–L407): `(userId: string, count = 20): Promise<MatchRecordData[]>`
- **`saveGameState`** (`export function`, L409–L425): `(
  userId: string,
  gameData: Omit<SavedGameData, 'id' | 'userId' | 'updatedAt'>
): Promise<string`
- **`fetchUserSavedGames`** (`export function`, L427–L441): `(userId: string): Promise<SavedGameData[]>`
- **`deleteSavedGame`** (`export function`, L443–L451): `(userId: string, gameId: string): Promise<void>`

### `lib/jieqi-engine.ts` (typescript, 7 nodes)
- **`evaluateJieqiBoard`** (`export function`, L13–L58): `(board: (string | null)[][]): number`
- **`jieqiMinimax`** (`function`, L63–L111): `(
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  depth: number,
  alpha: number`
- **`findBestJieqiMove`** (`export function`, L116–L173): `(
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  color: PieceColor,
  difficult`

### `lib/jieqi-rules.ts` (typescript, 14 nodes)
- **`INITIAL_ROLE_BOARD`** (`export constant`, L12–L23): `= [
  ['r', 'h', 'e', 'a', 'k', 'a', 'e', 'h', 'r'],
  [null, null, null, null, null, null, null, nu`
- **`shuffleArray`** (`function`, L28–L35): `(arr: T[]): T[]`
- **`createInitialJieqiGame`** (`export function`, L43–L98): `(): {
  board: (string | null)[][];
  hiddenBoard: (string | null)[][];
}`
- **`isPieceHidden`** (`export function`, L103–L105): `(pieceCode: string | null): boolean`
- **`getJieqiPseudoLegalMoves`** (`export function`, L110–L375): `(
  board: (string | null)[][],
  r: number,
  c: number
): Move[]`
- **`addMove`** (`export function`, L122–L133): `(tr: number, tc: number)`
- **`isJieqiKingInCheck`** (`export function`, L380–L407): `(board: (string | null)[][], color: PieceColor): boolean`
- **`getJieqiLegalMoves`** (`export function`, L412–L437): `(
  board: (string | null)[][],
  r: number,
  c: number
): Move[]`
- **`getAllJieqiLegalMoves`** (`export function`, L442–L459): `(
  board: (string | null)[][],
  color: PieceColor
): Move[]`
- **`executeJieqiMove`** (`export function`, L466–L514): `(
  board: (string | null)[][],
  hiddenBoard: (string | null)[][],
  move: Move
): {
  newBoard: (s`
- **`formatJieqiNotation`** (`export function`, L519–L575): `(
  boardBefore: (string | null)[][],
  move: Move,
  revealedPiece: string | null
): MoveNotation`

### `lib/mobile-ergonomics.ts` (typescript, 15 nodes)
- **`HapticPatternType`** (`export type_alias`, L5–L12)
- **`HAPTIC_PATTERNS`** (`constant`, L14–L22): `= {
  select: 8,
  move: 15,
  capture: [25, 30, 42],
  check: [40, 35, 85],
  victory: [45, 45, 60,`
- **`triggerHaptic`** (`export function`, L28–L39): `(type: HapticPatternType, enabled: boolean = true): void`
- **`WakeLockSentinelLike`** (`interface`, L41–L46)
- **`useScreenWakeLock`** (`export function`, L52–L130): `(enabled: boolean, isGameActive: boolean): void`
- **`releaseWakeLock`** (`export function`, L55–L64): `()`
- **`requestWakeLock`** (`export function`, L66–L93): `()`
- **`handleVisibilityChange`** (`export function`, L102–L106): `()`
- **`handleFirstInteraction`** (`export function`, L108–L112): `()`

### `lib/multiplayer-types.ts` (typescript, 74 nodes)
- **`PlayerInfo`** (`export interface`, L3–L13)
- **`ChatMessage`** (`export interface`, L15–L23)
- **`PublicRoomSummary`** (`export interface`, L25–L37)
- **`LeaderboardEntry`** (`export interface`, L39–L49)
- **`RoomState`** (`export interface`, L51–L81)
- **`ClientMessage`** (`export type_alias`, L83–L95)
- **`ServerMessage`** (`export type_alias`, L97–L124)

### `lib/trajectory.ts` (typescript, 26 nodes)
- **`CurvePoint`** (`export interface`, L1–L10)
- **`CurveTrajectory`** (`export interface`, L12–L25)
- **`computeCurveTrajectory`** (`export function`, L27–L131): `(
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  isFlipped: boolean,
  pieceType?`
- **`computeStraightTrajectory`** (`export function`, L133–L184): `(
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  isFlipped: boolean
): CurveTraje`
- **`findCannonScreen`** (`export function`, L189–L212): `(
  board: (string | null)[][],
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): { `

### `lib/xiangqi-engine.ts` (typescript, 73 nodes)
- **`PIECE_INDEX_MAP`** (`constant`, L18–L21): `= {
  r_k: 0, r_a: 1, r_e: 2, r_h: 3, r_r: 4, r_c: 5, r_p: 6,
  b_k: 7, b_a: 8, b_e: 9, b_h: 10, b_r`
- **`ZOBRIST_PIECES_HI`** (`constant`, L24–L24): `= []`
- **`ZOBRIST_PIECES_LO`** (`constant`, L25–L25): `= []`
- **`ZOBRIST_SIDE_RED_HI`** (`variable`, L26–L26): `= 0`
- **`ZOBRIST_SIDE_RED_LO`** (`variable`, L27–L27): `= 0`
- **`initZobrist`** (`function`, L30–L49): `()`
- **`nextRand32`** (`function`, L32–L37): `(): number`
- **`ZobristHash`** (`export interface`, L51–L54)
- **`computeZobristHash`** (`export function`, L56–L74): `(board: (string | null)[][], turn: PieceColor): ZobristHash`
- **`TTFlag`** (`export enum`, L80–L84)
- **`EXACT`** (`enum_member`, L81–L81)
- **`LOWERBOUND`** (`enum_member`, L82–L82)
- **`UPPERBOUND`** (`enum_member`, L83–L83)
- **`TTEntry`** (`export interface`, L86–L94)
- **`TT_SIZE`** (`constant`, L96–L96): `= 131072`
- **`TT_MASK`** (`constant`, L97–L97): `= TT_SIZE - 1`
- **`transpositionTable`** (`constant`, L98–L98): `= new Array(TT_SIZE).fill(null)`
- **`currentTTAage`** (`variable`, L99–L99): `= 0`
- **`clearTranspositionTable`** (`export function`, L101–L106): `()`
- **`probeTT`** (`function`, L108–L115): `(hash: ZobristHash): TTEntry | null`
- **`recordTT`** (`function`, L117–L137): `(
  hash: ZobristHash,
  depth: number,
  score: number,
  flag: TTFlag,
  bestMove: Move | null
)`
- **`MATERIAL_VALUES_MG`** (`export constant`, L143–L152): `= {
  k: 10000,
  r: 1000,
  c: 480,
  h: 430,
  a: 220,
  e: 220,
  p: 100,
  u: 300
}`
- **`MATERIAL_VALUES_EG`** (`export constant`, L154–L163): `= {
  k: 10000,
  r: 1000,
  c: 420,
  h: 470,
  a: 220,
  e: 220,
  p: 120,
  u: 280
}`
- **`PST_CHARIOT_MG`** (`constant`, L165–L176): `= [
  [20, 25, 20, 25, 20, 25, 20, 25, 20],
  [25, 35, 25, 30, 25, 30, 25, 35, 25],
  [20, 25, 20, 2`
- **`PST_CHARIOT_EG`** (`constant`, L178–L189): `= [
  [30, 35, 30, 35, 30, 35, 30, 35, 30],
  [30, 40, 30, 35, 30, 35, 30, 40, 30],
  [25, 30, 25, 3`
- **`PST_HORSE_MG`** (`constant`, L191–L202): `= [
  [  0,  -5,  15,  25,  15,  25,  15,  -5,   0],
  [  5,  20,  30,  40,  20,  40,  30,  20,   5]`
- **`PST_HORSE_EG`** (`constant`, L204–L215): `= [
  [  0,   5,  25,  35,  20,  35,  25,   5,   0],
  [ 10,  30,  45,  55,  35,  55,  45,  30,  10]`
- **`PST_CANNON_MG`** (`constant`, L217–L228): `= [
  [ 5, 10, 15, 20, 25, 20, 15, 10,  5],
  [ 5, 10, 15, 25, 35, 25, 15, 10,  5],
  [ 0,  5, 10, 2`
- **`PST_CANNON_EG`** (`constant`, L230–L241): `= [
  [ 5, 10, 15, 20, 25, 20, 15, 10,  5],
  [ 5, 10, 15, 20, 25, 20, 15, 10,  5],
  [ 0,  5, 10, 1`
- **`PST_PAWN_MG`** (`constant`, L243–L254): `= [
  [ 0, 10, 20, 35, 45, 35, 20, 10,  0],
  [15, 30, 45, 60, 70, 60, 45, 30, 15],
  [15, 25, 35, 5`
- **`PST_PAWN_EG`** (`constant`, L256–L267): `= [
  [ 0, 15, 35, 55, 65, 55, 35, 15,  0],
  [30, 50, 70, 95, 110, 95, 70, 50, 30],
  [25, 45, 60, `
- **`PST_ADVISOR`** (`constant`, L269–L280): `= [
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0`
- **`PST_ELEPHANT`** (`constant`, L282–L293): `= [
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0, 0],
  [0, 0,  0, 0,  0, 0,  0, 0`
- **`PST_KING_MG`** (`constant`, L295–L306): `= [
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0,   0, 0, 0, 0],
  [0, 0, 0,   0,   0, `
- **`PST_KING_EG`** (`constant`, L308–L319): `= [
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0`
- **`evaluateBoard`** (`export function`, L325–L513): `(board: (string | null)[][]): number`
- **`killerMoves`** (`constant`, L519–L519): `= Array.from({ length: 32 }, () => [null, null])`
- **`historyTable`** (`constant`, L520–L520): `= Array.from({ length: 90 }, () => new Array(90).fill(0))`
- **`clearHeuristics`** (`export function`, L522–L529): `()`
- **`scoreMove`** (`function`, L531–L569): `(
  board: (string | null)[][],
  move: Move,
  pvMove: Move | null,
  ply: number
): number`
- **`orderMoves`** (`export function`, L571–L583): `(
  board: (string | null)[][],
  moves: Move[],
  pvMove: Move | null = null,
  ply: number = 0
): `
- **`quiescence`** (`function`, L589–L633): `(
  board: (string | null)[][],
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  depthLef`
- **`SearchContext`** (`interface`, L639–L646)
- **`minimax`** (`function`, L648–L764): `(
  board: (string | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: bo`
- **`BotSearchResult`** (`export interface`, L770–L778)
- **`findBestMoveEngine`** (`export function`, L780–L995): `(
  board: (string | null)[][],
  color: PieceColor,
  difficulty: BotDifficulty = 'medium',
  moveC`
- **`findOptimalAnalysisMove`** (`export function`, L997–L1049): `(
  board: (string | null)[][],
  color: PieceColor,
  depth: number = 3
): BotSearchResult | null`

### `lib/xiangqi-openings.ts` (typescript, 35 nodes)
- **`OpeningInfo`** (`export interface`, L3–L12)
- **`BookMove`** (`export interface`, L14–L24)
- **`OPENING_CATALOG`** (`export constant`, L26–L216): `= {
  'trung-phao': {
    id: 'trung-phao',
    nameVn: 'Pháo Đầu (Trung Pháo)',
    nameCn: '当头炮',
`
- **`boardToFen`** (`export function`, L218–L242): `(board: (string | null)[][], turn: PieceColor): string`
- **`OPENING_BOOK`** (`export constant`, L244–L530): `= {
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR r': [
    {
      fromR: 7, fromC`
- **`DetectedOpening`** (`export interface`, L532–L536)
- **`detectOpening`** (`export function`, L538–L648): `(
  moves: Array<{ fromR: number; fromC: number; toR: number; toC: number }>
): DetectedOpening | nu`
- **`OpeningBookResult`** (`export interface`, L650–L655)
- **`getOpeningBookMove`** (`export function`, L657–L720): `(
  board: (string | null)[][],
  turn: PieceColor,
  difficulty: BotDifficulty = 'master',
  moveCo`

### `lib/xiangqi-rules.ts` (typescript, 23 nodes)
- **`PST_HORSE`** (`export constant`, L4–L15): `= [
  [0, -10,  0,  0,  0,  0,  0, -10,  0],
  [0,   5, 10,  5,  5,  5, 10,   5,  0],
  [4,  10, 15,`
- **`PST_CHARIOT`** (`export constant`, L17–L28): `= [
  [15, 20, 15, 15, 20, 15, 15, 20, 15],
  [15, 20, 15, 15, 20, 15, 15, 20, 15],
  [10, 15, 10, 1`
- **`PST_CANNON`** (`export constant`, L30–L41): `= [
  [10, 10, 10, 15, 15, 15, 10, 10, 10],
  [ 8,  8,  8, 12, 12, 12,  8,  8,  8],
  [ 6,  6,  6, 1`
- **`PST_SOLDIER`** (`export constant`, L43–L54): `= [
  [30, 40, 50, 60, 70, 60, 50, 40, 30],
  [25, 35, 45, 55, 60, 55, 45, 35, 25],
  [20, 30, 40, 4`
- **`isValidPos`** (`export function`, L56–L58): `(r: number, c: number): boolean`
- **`isInsidePalace`** (`export function`, L60–L64): `(color: PieceColor, r: number, c: number): boolean`
- **`findGeneral`** (`export function`, L66–L74): `(board: (string | null)[][], color: PieceColor): { r: number; c: number } | null`
- **`areGeneralsFacing`** (`export function`, L76–L88): `(board: (string | null)[][]): boolean`
- **`getPseudoMoves`** (`export function`, L90–L216): `(board: (string | null)[][], r: number, c: number): Move[]`
- **`addMove`** (`export function`, L97–L105): `(tr: number, tc: number)`
- **`simulateMove`** (`export function`, L218–L223): `(board: (string | null)[][], m: Move): (string | null)[][]`
- **`isKingInCheck`** (`export function`, L225–L242): `(board: (string | null)[][], color: PieceColor): boolean`
- **`getLegalMoves`** (`export function`, L244–L253): `(board: (string | null)[][], r: number, c: number): Move[]`
- **`getAllLegalMoves`** (`export function`, L255–L266): `(board: (string | null)[][], color: PieceColor): Move[]`
- **`evaluateBoard`** (`export function`, L268–L270): `(board: (string | null)[][]): number`
- **`findBestMove`** (`export function`, L272–L280): `(
  board: (string | null)[][],
  color: PieceColor,
  difficulty: BotDifficulty = 'medium',
  moveC`
- **`findBestMoveWithDetail`** (`export function`, L282–L289): `(
  board: (string | null)[][],
  color: PieceColor,
  difficulty: BotDifficulty = 'medium',
  moveC`
- **`formatNotation`** (`export function`, L291–L411): `(boardBefore: (string | null)[][], m: Move, isCheck = false): MoveNotation`
- **`findCannonScreenPiece`** (`export function`, L417–L440): `(
  board: (string | null)[][],
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): { `
- **`countConsecutiveChecksSamePieceAndPos`** (`export function`, L448–L516): `(
  history: MoveRecord[],
  currentMove: Move,
  currentPiece: string,
  isCurrentCheck: boolean,
 `

### `lib/xiangqi-types.ts` (typescript, 42 nodes)
- **`PieceColor`** (`export type_alias`, L1–L1)
- **`PieceType`** (`export type_alias`, L2–L2)
- **`BoardTheme`** (`export type_alias`, L3–L3)
- **`GameVariant`** (`export type_alias`, L4–L4)
- **`BOARD_THEME_LABELS`** (`export constant`, L6–L11): `= {
  imperial: { name: 'Hoàng Cung', subtitle: 'Gỗ Đàn Hương' },
  zen: { name: 'Thiền Trà', subtit`
- **`PieceInfo`** (`export interface`, L13–L20)
- **`PIECES`** (`export constant`, L22–L41): `= {
  // Red (Tiên - Đỏ) - Iansui calligraphy supported glyphs
  r_k: { type: 'k', color: 'r', nameC`
- **`INITIAL_BOARD`** (`export constant`, L43–L54): `= [
  ['b_r', 'b_h', 'b_e', 'b_a', 'b_k', 'b_a', 'b_e', 'b_h', 'b_r'],
  [ null,  null,  null,  null`
- **`Move`** (`export interface`, L56–L64)
- **`MoveNotation`** (`export interface`, L66–L73)
- **`MoveRecord`** (`export interface`, L75–L84)
- **`RankTier`** (`export type_alias`, L86–L86)
- **`BotDifficulty`** (`export type_alias`, L87–L87)
- **`getRankTier`** (`export function`, L89–L139): `(elo: number, isDark: boolean = true): {
  tier: RankTier;
  colorClass: string;
  badge: string;
  `

### `next-env.d.ts` (typescript, 1 nodes)

### `next.config.ts` (typescript, 4 nodes)
- **`nextConfig`** (`constant`, L3–L34): `= {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    igno`
- **`webpack`** (`function`, L24–L33): `(config, {dev})`

### `postcss.config.mjs` (javascript, 2 nodes)
- **`config`** (`constant`, L2–L7): `= {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}`

### `scripts/verify-production.ts` (typescript, 9 nodes)
- **`findLastMessage`** (`function`, L8–L18): `(
  messages: ServerMessage[],
  type: T
): Extract<ServerMessage, { type: T }> | undefined`
- **`runProductionVerification`** (`function`, L20–L155): `()`

### `server.ts` (typescript, 14 nodes)
- **`port`** (`constant`, L9–L9): `= parseInt(process.env.PORT || '3000', 10)`
- **`hasCompleteBuild`** (`function`, L10–L13): `()`
- **`isBuilt`** (`constant`, L15–L15): `= hasCompleteBuild()`
- **`dev`** (`constant`, L16–L16): `= !isBuilt`
- **`app`** (`constant`, L17–L17): `= next({ dev })`
- **`handle`** (`constant`, L18–L18): `= app.getRequestHandler()`

### `server/room-manager.ts` (typescript, 83 nodes)
- **`ClientSocket`** (`export interface`, L35–L37)
- **`send`** (`method`, L36–L36): `(data: string): void`
- **`InternalPlayer`** (`interface`, L39–L43)
- **`InternalRoom`** (`interface`, L45–L78)
- **`RoomManager`** (`export class`, L80–L1365)
- **`constructor`** (`method`, L89–L92): `()`
- **`seedLeaderboard`** (`method`, L94–L128): `()`
- **`getLeaderboard`** (`method`, L130–L145): `(variant?: GameVariant): LeaderboardEntry[]`
- **`updatePlayerLeaderboard`** (`method`, L147–L179): `(name: string, won: boolean, isDraw: boolean, eloDelta: number, variant: GameVariant = 'standard')`
- **`calculateEloDelta`** (`method`, L181–L185): `(ratingA: number, ratingB: number, scoreA: number): number`
- **`startClockTicker`** (`method`, L187–L254): `()`
- **`handleTimeout`** (`method`, L256–L273): `(room: InternalRoom, winner: PieceColor, reasonDetail?: string)`
- **`settleMatchElo`** (`method`, L275–L292): `(room: InternalRoom, winner: PieceColor | 'draw')`
- **`generateRoomCode`** (`method`, L294–L301): `(): string`
- **`generateToken`** (`method`, L303–L305): `(): string`
- **`getPublicRooms`** (`method`, L307–L333): `(): PublicRoomSummary[]`
- **`handleConnection`** (`method`, L335–L383): `(ws: WebSocket)`
- **`handleHttpPoll`** (`method`, L385–L415): `(clientId: string, messages: ClientMessage[]): ServerMessage[]`
- **`handleMessage`** (`method`, L417–L473): `(ws: ClientSocket, msg: ClientMessage)`
- **`createRoom`** (`method`, L475–L600): `(
    ws: ClientSocket,
    hostName: string,
    timeLimit: number,
    isPublic: boolean,
    play`
- **`joinRoom`** (`method`, L602–L792): `(
    ws: ClientSocket,
    rawRoomCode: string,
    playerName: string,
    playerToken?: string,
 `
- **`handleChat`** (`method`, L794–L839): `(ws: ClientSocket, text: string, isQuick: boolean)`
- **`makeMove`** (`method`, L841–L1015): `(ws: ClientSocket, move: Move)`
- **`offerDraw`** (`method`, L1017–L1034): `(ws: ClientSocket)`
- **`respondDraw`** (`method`, L1036–L1065): `(ws: ClientSocket, accept: boolean)`
- **`resign`** (`method`, L1067–L1091): `(ws: ClientSocket)`
- **`requestRematch`** (`method`, L1093–L1197): `(ws: ClientSocket)`
- **`handleDisconnect`** (`method`, L1199–L1252): `(ws: ClientSocket)`
- **`leaveRoom`** (`method`, L1254–L1265): `(ws: ClientSocket)`
- **`broadcastOpponentPresence`** (`method`, L1267–L1281): `(
    room: InternalRoom,
    disconnectedSide: PieceColor,
    connected: boolean,
    graceSeconds`
- **`broadcastToRoom`** (`method`, L1283–L1296): `(room: InternalRoom, msg: ServerMessage)`
- **`getPlayerByToken`** (`method`, L1298–L1302): `(room: InternalRoom, token: string): InternalPlayer | null`
- **`toPublicState`** (`method`, L1304–L1364): `(room: InternalRoom): RoomState`
- **`globalForRoomManager`** (`constant`, L1367–L1369): `= globalThis as unknown as {
  __xiangqiRoomManager?: RoomManager;
}`
- **`getRoomManager`** (`export function`, L1371–L1376): `(): RoomManager`

