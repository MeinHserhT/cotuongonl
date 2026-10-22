'use client';

import React, { useEffect } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Check if error is ChunkLoadError or stale script loading failure
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk|Failed to fetch dynamically imported module|ChunkLoadError/i.test(
        error?.message || ''
      );

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_boundary_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_boundary_reload', now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#11141a] text-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900/90 border border-amber-600/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <RotateCcw className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-amber-300 font-serif mb-2">
          Đang làm mới trận đấu
        </h2>
        <p className="text-neutral-400 text-sm mb-6">
          Ứng dụng vừa được cập nhật phiên bản mới hoặc kết nối mạng bị gián đoạn tạm thời.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm border border-neutral-700 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Thử kết nối lại
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại trang
          </button>
        </div>
      </div>
    </div>
  );
}
