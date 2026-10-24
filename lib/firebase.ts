import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  signInAnonymously,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy, limit, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { getRankTier } from './xiangqi-types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function initDb() {
  const dbId =
    firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;
  try {
    return dbId
      ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, dbId)
      : initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = initDb();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  elo: number; // General / Standard fallback
  eloStandard?: number;
  eloJieqi?: number;
  rankTier: string;
  rankTierStandard?: string;
  rankTierJieqi?: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  // Cờ Ngửa (Standard) stats
  gamesPlayedStandard?: number;
  winsStandard?: number;
  lossesStandard?: number;
  drawsStandard?: number;
  winRateStandard?: number;
  // Cờ Úp (Jieqi) stats
  gamesPlayedJieqi?: number;
  winsJieqi?: number;
  lossesJieqi?: number;
  drawsJieqi?: number;
  winRateJieqi?: number;
  isAnonymous?: boolean;
}

export interface MatchRecordData {
  id: string;
  userId: string;
  opponentName: string;
  opponentType: 'ai' | 'pvp' | 'online';
  difficulty?: string;
  playerColor: 'r' | 'b';
  result: 'win' | 'loss' | 'draw';
  movesCount: number;
  durationSeconds: number;
  date: string;
  eloChange: number;
  finalElo: number;
  variant?: 'standard' | 'jieqi';
  pgn?: string;
}

export interface SavedGameData {
  id: string;
  userId: string;
  name: string;
  gameMode: string;
  turn: 'r' | 'b';
  boardJson: string;
  movesJson: string;
  capturedRed: string[];
  capturedBlack: string[];
  difficulty?: string;
  timeLimit: number;
  updatedAt: string;
}

export function createDefaultProfile(user: User): UserProfileData {
  const defaultElo = 1200;
  const rank = getRankTier(defaultElo);
  const rawPhoto = user.photoURL ? String(user.photoURL) : null;
  const safePhoto = rawPhoto && rawPhoto.length <= 480 ? rawPhoto : null;
  const safeName = (user.displayName?.trim() || (user.isAnonymous ? 'Kỳ thủ Ẩn danh' : (user.email ? user.email.split('@')[0] : 'Kỳ thủ mới'))).slice(0, 90);
  const safeEmail = user.email ? user.email.slice(0, 100) : null;

  return {
    uid: user.uid,
    email: safeEmail,
    displayName: safeName,
    photoURL: safePhoto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elo: defaultElo,
    eloStandard: defaultElo,
    eloJieqi: defaultElo,
    rankTier: rank.tier,
    rankTierStandard: rank.tier,
    rankTierJieqi: rank.tier,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    gamesPlayedStandard: 0,
    winsStandard: 0,
    lossesStandard: 0,
    drawsStandard: 0,
    winRateStandard: 0,
    gamesPlayedJieqi: 0,
    winsJieqi: 0,
    lossesJieqi: 0,
    drawsJieqi: 0,
    winRateJieqi: 0,
    isAnonymous: Boolean(user.isAnonymous)
  };
}

export async function getOrCreateUserProfile(user: User): Promise<UserProfileData> {
  const fallback = createDefaultProfile(user);
  const userRef = doc(db, 'users', user.uid);
  
  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as UserProfileData;
      const eloStd = data.eloStandard || data.elo || 1200;
      const eloJq = data.eloJieqi || 1200;
      const tierStd = getRankTier(eloStd);
      const tierJq = getRankTier(eloJq);
      return {
        ...data,
        elo: eloStd,
        eloStandard: eloStd,
        eloJieqi: eloJq,
        rankTier: tierStd.tier,
        rankTierStandard: tierStd.tier,
        rankTierJieqi: tierJq.tier,
        gamesPlayedStandard: data.gamesPlayedStandard ?? data.gamesPlayed ?? 0,
        winsStandard: data.winsStandard ?? data.wins ?? 0,
        lossesStandard: data.lossesStandard ?? data.losses ?? 0,
        drawsStandard: data.drawsStandard ?? data.draws ?? 0,
        gamesPlayedJieqi: data.gamesPlayedJieqi ?? 0,
        winsJieqi: data.winsJieqi ?? 0,
        lossesJieqi: data.lossesJieqi ?? 0,
        drawsJieqi: data.drawsJieqi ?? 0
      };
    }

    try {
      await setDoc(userRef, fallback);
    } catch (writeError) {
      console.warn('Could not write profile to Firestore (check Firestore Rules):', writeError);
    }
    return fallback;
  } catch (error) {
    console.warn('Could not read profile from Firestore (check Firestore Rules):', error);
    return fallback;
  }
}

export async function recordMatchProgress(
  userId: string,
  match: Omit<MatchRecordData, 'id' | 'userId' | 'finalElo'> & { variant?: 'standard' | 'jieqi' }
): Promise<{ newElo: number; eloDelta: number; newEloStandard?: number; newEloJieqi?: number }> {
  const userRef = doc(db, 'users', userId);
  const eloDelta = match.eloChange || 0;
  const isJieqi = match.variant === 'jieqi';
  
  try {
    const snap = await getDoc(userRef);

    let currentProfile: UserProfileData;
    if (!snap.exists()) {
      currentProfile = {
        uid: userId,
        email: null,
        displayName: 'Kỳ thủ',
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        elo: 1200,
        eloStandard: 1200,
        eloJieqi: 1200,
        rankTier: getRankTier(1200).tier,
        rankTierStandard: getRankTier(1200).tier,
        rankTierJieqi: getRankTier(1200).tier,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
        gamesPlayedStandard: 0,
        winsStandard: 0,
        lossesStandard: 0,
        drawsStandard: 0,
        gamesPlayedJieqi: 0,
        winsJieqi: 0,
        lossesJieqi: 0,
        drawsJieqi: 0
      };
    } else {
      currentProfile = snap.data() as UserProfileData;
    }

    const totalGames = (currentProfile.gamesPlayed || 0) + 1;
    const totalWins = (currentProfile.wins || 0) + (match.result === 'win' ? 1 : 0);
    const totalLosses = (currentProfile.losses || 0) + (match.result === 'loss' ? 1 : 0);
    const totalDraws = (currentProfile.draws || 0) + (match.result === 'draw' ? 1 : 0);
    const totalWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

    let targetFinalElo: number;
    let updatePayload: Record<string, unknown>;

    if (isJieqi) {
      const curJqElo = currentProfile.eloJieqi || 1200;
      const newJqElo = Math.max(800, curJqElo + eloDelta);
      targetFinalElo = newJqElo;
      const newJqGames = (currentProfile.gamesPlayedJieqi || 0) + 1;
      const newJqWins = (currentProfile.winsJieqi || 0) + (match.result === 'win' ? 1 : 0);
      const newJqLosses = (currentProfile.lossesJieqi || 0) + (match.result === 'loss' ? 1 : 0);
      const newJqDraws = (currentProfile.drawsJieqi || 0) + (match.result === 'draw' ? 1 : 0);
      const newJqWinRate = newJqGames > 0 ? Math.round((newJqWins / newJqGames) * 100) : 0;
      const newJqTier = getRankTier(newJqElo);

      updatePayload = {
        eloJieqi: newJqElo,
        rankTierJieqi: newJqTier.tier,
        gamesPlayedJieqi: newJqGames,
        winsJieqi: newJqWins,
        lossesJieqi: newJqLosses,
        drawsJieqi: newJqDraws,
        winRateJieqi: newJqWinRate,
        gamesPlayed: totalGames,
        wins: totalWins,
        losses: totalLosses,
        draws: totalDraws,
        winRate: totalWinRate,
        updatedAt: new Date().toISOString()
      };
    } else {
      const curStdElo = currentProfile.eloStandard || currentProfile.elo || 1200;
      const newStdElo = Math.max(800, curStdElo + eloDelta);
      targetFinalElo = newStdElo;
      const newStdGames = (currentProfile.gamesPlayedStandard || currentProfile.gamesPlayed || 0) + 1;
      const newStdWins = (currentProfile.winsStandard || currentProfile.wins || 0) + (match.result === 'win' ? 1 : 0);
      const newStdLosses = (currentProfile.lossesStandard || currentProfile.losses || 0) + (match.result === 'loss' ? 1 : 0);
      const newStdDraws = (currentProfile.drawsStandard || currentProfile.draws || 0) + (match.result === 'draw' ? 1 : 0);
      const newStdWinRate = newStdGames > 0 ? Math.round((newStdWins / newStdGames) * 100) : 0;
      const newStdTier = getRankTier(newStdElo);

      updatePayload = {
        elo: newStdElo,
        eloStandard: newStdElo,
        rankTier: newStdTier.tier,
        rankTierStandard: newStdTier.tier,
        gamesPlayed: totalGames,
        gamesPlayedStandard: newStdGames,
        wins: totalWins,
        winsStandard: newStdWins,
        losses: totalLosses,
        lossesStandard: newStdLosses,
        draws: totalDraws,
        drawsStandard: newStdDraws,
        winRate: totalWinRate,
        winRateStandard: newStdWinRate,
        updatedAt: new Date().toISOString()
      };
    }

    await updateDoc(userRef, updatePayload);

    const matchesCol = collection(db, 'users', userId, 'matches');
    const safeMatchPayload: Record<string, unknown> = {
      userId,
      opponentName: match.opponentName ? String(match.opponentName).slice(0, 90) : 'Đối thủ',
      opponentType: match.opponentType || 'ai',
      playerColor: match.playerColor || 'r',
      result: match.result,
      movesCount: match.movesCount || 0,
      durationSeconds: match.durationSeconds || 0,
      eloChange: match.eloChange || 0,
      finalElo: targetFinalElo,
      variant: isJieqi ? 'jieqi' : 'standard',
      date: match.date || new Date().toISOString()
    };
    if (match.difficulty) {
      safeMatchPayload.difficulty = match.difficulty;
    }
    if (match.pgn) {
      safeMatchPayload.pgn = match.pgn;
    }
    await addDoc(matchesCol, safeMatchPayload);

    return {
      newElo: targetFinalElo,
      eloDelta,
      newEloStandard: isJieqi ? (currentProfile.eloStandard || currentProfile.elo || 1200) : targetFinalElo,
      newEloJieqi: isJieqi ? targetFinalElo : (currentProfile.eloJieqi || 1200)
    };
  } catch (error) {
    console.warn('Could not record match progress to Firestore (check Firestore Rules):', error);
    return { newElo: Math.max(800, 1200 + eloDelta), eloDelta };
  }
}

export async function fetchUserMatches(userId: string, count = 20): Promise<MatchRecordData[]> {
  try {
    const matchesCol = collection(db, 'users', userId, 'matches');
    const q = query(matchesCol, orderBy('date', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<MatchRecordData, 'id'>)
    }));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function saveGameState(
  userId: string,
  gameData: Omit<SavedGameData, 'id' | 'userId' | 'updatedAt'>
): Promise<string> {
  const path = `users/${userId}/savedGames`;
  try {
    const savedCol = collection(db, 'users', userId, 'savedGames');
    const docRef = await addDoc(savedCol, {
      ...gameData,
      userId,
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchUserSavedGames(userId: string): Promise<SavedGameData[]> {
  const path = `users/${userId}/savedGames`;
  try {
    const savedCol = collection(db, 'users', userId, 'savedGames');
    const q = query(savedCol, orderBy('updatedAt', 'desc'), limit(15));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<SavedGameData, 'id'>)
    }));
  } catch (error) {
    console.error('Error fetching saved games:', error);
    return [];
  }
}

export async function deleteSavedGame(userId: string, gameId: string): Promise<void> {
  const path = `users/${userId}/savedGames/${gameId}`;
  try {
    const docRef = doc(db, 'users', userId, 'savedGames', gameId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
