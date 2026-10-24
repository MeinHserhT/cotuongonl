'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bookmark, Check, AlertCircle } from 'lucide-react';

interface SaveGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  defaultName?: string;
}

export function SaveGameModal({
  isOpen,
  onClose,
  onSave,
  defaultName = 'Ván cờ của tôi'
}: SaveGameModalProps) {
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên ván cờ.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(name.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={() => !loading && onClose()} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-sm bg-[#1F1812] border border-[#36291E] rounded-2xl shadow-2xl p-5 z-10 text-[#EFE6D5]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#36291E]">
          <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-sm">
            <Bookmark className="w-4 h-4 text-[#D97706]" />
            <span>Lưu Ván Cờ Vào Đám Mây</span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded text-[#B8A996] hover:text-[#EFE6D5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#B8A996] mb-1">
              Đặt tên ván cờ:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Khai cuộc Thuận Pháo hiệp 1..."
              className="w-full px-3 py-2 rounded-xl bg-[#120E0A] border border-[#36291E] text-sm text-[#EFE6D5] focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#B8A996] hover:text-[#EFE6D5] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Lưu Ván</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
