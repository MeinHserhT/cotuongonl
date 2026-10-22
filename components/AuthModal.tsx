'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { User } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInGuest: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  initialTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInGuest,
  resetPassword,
  initialTab = 'login',
  onSuccess
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (tab === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Vui lòng nhập địa chỉ email của bạn.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccessMsg('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến của bạn!');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Không thể gửi email đặt lại mật khẩu.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (tab === 'register') {
      if (!displayName.trim()) {
        setErrorMsg('Vui lòng nhập tên kỳ thủ / biệt danh hiển thị.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInGuest();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Chế độ khách thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => !loading && onClose()}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-gradient-to-b from-[#1c2230] to-[#131722] border border-[#3b4760] rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-100"
      >
        <div className="relative px-6 pt-6 pb-4 border-b border-[#2d374d] bg-gradient-to-r from-red-950/40 via-amber-950/30 to-red-950/40">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 flex items-center justify-center font-piece text-2xl text-neutral-900 shadow-md">
              帥
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-amber-200 tracking-wide flex items-center gap-1.5">
                {tab === 'login' ? 'Đăng Nhập Kỳ Thủ' : tab === 'register' ? 'Đăng Ký Tài Khoản' : 'Khôi Phục Mật Khẩu'}
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Lưu lại tiến trình trận đấu, điểm Elo và bảng xếp hạng
              </p>
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="flex rounded-lg bg-[#111622] p-1 mt-4 border border-[#2b354a]">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'login'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'register'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng Ký</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs flex flex-col gap-2.5 animate-in fade-in shadow-md">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {(errorMsg.includes('unauthorized-domain') ||
                errorMsg.includes('popup') ||
                errorMsg.includes('Google') ||
                errorMsg.includes('Firebase')) && (
                <div className="pt-2 border-t border-red-800/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-200/90 font-medium">Giải pháp nhanh không cần tài khoản Google:</span>
                  <button
                    type="button"
                    onClick={handleGuestAuth}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Vào chơi ngay với Khách</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên kỳ thủ / Biệt danh hiển thị:
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Quang Trung, Kỳ Vương..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141926] border border-[#343e54] text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Địa chỉ Email:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kythu@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141926] border border-[#343e54] text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {tab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Mật khẩu:
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#141926] border border-[#343e54] text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Xác nhận mật khẩu:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141926] border border-[#343e54] text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              ) : tab === 'login' ? (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : tab === 'register' ? (
                <>
                  <span>Hoàn Tất Đăng Ký</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <span>Gửi Email Khôi Phục</span>
              )}
            </button>
          </form>

          {tab === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full mt-3 text-xs text-center text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              ← Quay lại Đăng Nhập
            </button>
          )}

          {tab !== 'forgot' && (
            <>
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2d374d]" />
                </div>
                <span className="relative px-3 bg-[#171c27] text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Hoặc đăng nhập nhanh
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl border border-[#3b4760] bg-[#1a202d] hover:bg-[#222b3d] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.1 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.2.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12c0 1.2.7 3.2 1.9 5.6l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Tiếp tục với Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuestAuth}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#343e54] hover:border-slate-400 bg-transparent text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Chơi nhanh với tài khoản Khách (Ẩn danh)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
