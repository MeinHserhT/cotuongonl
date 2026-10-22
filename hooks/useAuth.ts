'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  signInAnonymously
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  getOrCreateUserProfile,
  UserProfileData,
  testConnection
} from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const refreshProfile = useCallback(async (currUser?: User | null) => {
    const targetUser = currUser !== undefined ? currUser : user;
    if (!targetUser) {
      setProfile(null);
      return;
    }
    try {
      const p = await getOrCreateUserProfile(targetUser);
      setProfile(p);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const prof = await getOrCreateUserProfile(currentUser);
          setProfile(prof);
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const prof = await getOrCreateUserProfile(res.user);
      setProfile(prof);
      return res.user;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      const friendlyMsg = getFriendlyErrorMessage(message);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName.trim()) {
        await updateProfile(res.user, { displayName: displayName.trim() });
      }
      const prof = await getOrCreateUserProfile(res.user);
      setProfile(prof);
      return res.user;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      const friendlyMsg = getFriendlyErrorMessage(message);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      try {
        const prof = await getOrCreateUserProfile(res.user);
        setProfile(prof);
      } catch (profErr) {
        console.warn('Could not sync profile to Firestore, using fallback profile:', profErr);
        const fallbackProf: UserProfileData = {
          uid: res.user.uid,
          email: res.user.email || null,
          displayName: (res.user.displayName?.trim() || 'Kỳ thủ Google').slice(0, 80),
          photoURL: res.user.photoURL ? String(res.user.photoURL).slice(0, 480) : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          elo: 1200,
          rankTier: 'Kỳ Binh',
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          isAnonymous: false
        };
        setProfile(fallbackProf);
      }
      return res.user;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng nhập Google thất bại';
      const friendlyMsg = getFriendlyErrorMessage(message);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signInGuest = async () => {
    setAuthError(null);
    try {
      const res = await signInAnonymously(auth);
      try {
        const prof = await getOrCreateUserProfile(res.user);
        setProfile(prof);
      } catch (profErr) {
        console.warn('Guest profile fallback:', profErr);
        setProfile({
          uid: res.user.uid,
          email: null,
          displayName: 'Kỳ thủ Ẩn danh',
          photoURL: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          elo: 1200,
          rankTier: 'Kỳ Binh',
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          isAnonymous: true
        });
      }
      return res.user;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Chế độ khách thất bại';
      const friendlyMsg = getFriendlyErrorMessage(message);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gửi email đặt lại mật khẩu thất bại';
      const friendlyMsg = getFriendlyErrorMessage(message);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  return {
    user,
    profile,
    loading,
    authError,
    setAuthError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInGuest,
    signOutUser,
    resetPassword,
    refreshProfile
  };
}

function getFriendlyErrorMessage(msg: string): string {
  if (msg.includes('auth/unauthorized-domain')) {
    return 'Tên miền preview hiện tại chưa được cấp quyền trong Firebase Console (auth/unauthorized-domain). Bạn có thể đăng nhập bằng Email/Mật khẩu hoặc chọn "Chơi nhanh với tài khoản Khách" bên dưới để vào chơi ngay!';
  }
  if (msg.includes('auth/popup-blocked')) {
    return 'Trình duyệt đã chặn cửa sổ Popup đăng nhập Google. Vui lòng cấp quyền mở popup trên thanh địa chỉ, hoặc dùng Đăng nhập Email / Khách.';
  }
  if (msg.includes('auth/operation-not-allowed')) {
    return 'Phương thức Google Sign-In chưa được kích hoạt trong Firebase Authentication. Vui lòng đăng nhập bằng Email hoặc Chế độ Khách.';
  }
  if (msg.includes('auth/popup-closed-by-user')) {
    return 'Cửa sổ đăng nhập Google đã được đóng trước khi hoàn tất xác thực.';
  }
  if (msg.includes('auth/cancelled-popup-request')) {
    return 'Yêu cầu mở cửa sổ đăng nhập trước đó đang diễn ra hoặc đã bị hủy. Vui lòng bấm thử lại.';
  }
  if (msg.includes('auth/account-exists-with-different-credential')) {
    return 'Email này đã liên kết với tài khoản bằng mật khẩu. Vui lòng đăng nhập bằng Email và Mật khẩu.';
  }
  if (msg.includes('auth/invalid-email')) return 'Email không hợp lệ. Vui lòng kiểm tra lại.';
  if (msg.includes('auth/user-not-found')) return 'Không tìm thấy tài khoản với email này.';
  if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) return 'Mật khẩu hoặc email không chính xác.';
  if (msg.includes('auth/email-already-in-use')) return 'Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng Nhập.';
  if (msg.includes('auth/weak-password')) return 'Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự.';
  if (msg.includes('auth/network-request-failed')) return 'Lỗi kết nối mạng. Vui lòng thử lại sau.';
  return msg;
}
