'use client';

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk|Failed to fetch dynamically imported module|ChunkLoadError/i.test(
        error?.message || ''
      );

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_global_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_global_reload', now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#11141a] text-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-amber-600/30 rounded-2xl p-6 text-center shadow-2xl">
          <h2 className="text-xl font-bold text-amber-400 mb-2 font-serif">
            Cập nhật phiên bản
          </h2>
          <p className="text-neutral-400 text-sm mb-6">
            Hệ thống đã cập nhật gói mã nguồn mới. Vui lòng tải lại trang để tiếp tục.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại trang ngay
          </button>
        </div>
      </body>
    </html>
  );
}
