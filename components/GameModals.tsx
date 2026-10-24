'use client';

import React from 'react';
import { Flag, Handshake, X } from 'lucide-react';
import { MatchResultType, MatchResultOverlay } from './MatchResultOverlay';

export interface GameOverModalData {
  title: string;
  desc: string;
  icon: string;
  resultType?: MatchResultType;
  eloDelta?: number;
}

interface GameOverModalProps {
  modalData: GameOverModalData | null;
  isOnline?: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onRematch?: () => void;
  rematchRequestedByOpponent?: boolean;
  myRematchRequested?: boolean;
  onCreateOnlineRoom?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = React.memo(({
  modalData,
  isOnline = false,
  onClose,
  onNewGame,
  onRematch,
  rematchRequestedByOpponent = false,
  myRematchRequested = false,
  onCreateOnlineRoom
}) => {
  if (!modalData) return null;

  return (
    <>
      <MatchResultOverlay type={modalData.resultType || 'victory'} />
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 border-2 overflow-hidden ${
            modalData.resultType === 'victory'
              ? 'bg-gradient-to-b from-[#2a1a08] via-[#1c1208] to-[#120803] border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.35)]'
              : modalData.resultType === 'defeat'
              ? 'bg-gradient-to-b from-[#181a24] via-[#12141c] to-[#0b0d13] border-slate-700/80 shadow-[0_0_40px_rgba(100,116,139,0.25)]'
              : 'bg-gradient-to-b from-[#211d18] via-[#171410] to-[#0f0d0a] border-amber-600/60 shadow-[0_0_40px_rgba(217,119,6,0.25)]'
          }`}
        >
          {/* Nút đóng góc phải */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer z-30"
            title="Đóng bảng kết quả (Xem bàn cờ)"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Defeat / Draw Emblem Icon (Ẩn khi thắng để giao diện khải hoàn gọn gàng) */}
          {modalData.resultType !== 'victory' && (
            <div className="relative inline-block mb-3 mt-1">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner border-2 ${
                  modalData.resultType === 'defeat'
                    ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border-slate-600 shadow-[0_0_20px_rgba(100,116,139,0.3)]'
                    : 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                }`}
              >
                {modalData.resultType === 'defeat' ? '🍂' : modalData.icon}
              </div>
            </div>
          )}

          <h2
            className={`text-2xl font-serif font-black mb-2 tracking-wide ${
              modalData.resultType === 'victory'
                ? 'pt-2 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent flex items-center justify-center gap-2 text-3xl'
                : modalData.resultType === 'defeat'
                ? 'text-slate-200'
                : 'text-amber-200'
            }`}
          >
            {modalData.resultType === 'victory' && <span>🏆</span>}
            <span>{modalData.title}</span>
          </h2>

          <p className="text-xs text-neutral-300 mb-3 leading-relaxed max-w-xs mx-auto">
            {modalData.desc}
          </p>

          {modalData.eloDelta !== undefined && (
            <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono font-bold">
              <span>Điểm Elo:</span>
              <span className={modalData.eloDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {modalData.eloDelta >= 0 ? `+${modalData.eloDelta}` : modalData.eloDelta} Elo
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2 relative z-20">
            {isOnline ? (
              <div className="flex flex-col gap-2">
                {rematchRequestedByOpponent && (
                  <div className="py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                    <span>⚔️ Đối thủ muốn đấu lại ván mới!</span>
                  </div>
                )}
                {myRematchRequested && (
                  <div className="py-2 px-3 rounded-xl bg-sky-500/20 border border-sky-500/50 text-sky-200 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span>Đã gửi lời mời đấu lại · Đang chờ đối thủ...</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {onRematch && (
                    <button
                      type="button"
                      onClick={onRematch}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 ${
                        rematchRequestedByOpponent
                          ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 hover:from-emerald-400 text-white shadow-emerald-500/30 animate-pulse'
                          : myRematchRequested
                          ? 'bg-[#2a3448] text-slate-400 border border-[#3d4c6a] cursor-default'
                          : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-neutral-950 shadow-amber-500/25'
                      }`}
                    >
                      <span>
                        {rematchRequestedByOpponent
                          ? '⚔️ Chấp nhận Đấu lại'
                          : myRematchRequested
                          ? '⏳ Chờ đối thủ...'
                          : '⚔️ Đấu lại'}
                      </span>
                    </button>
                  )}
                  {onCreateOnlineRoom && (
                    <button
                      type="button"
                      onClick={onCreateOnlineRoom}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 text-amber-100 font-bold text-xs border border-amber-600/60 shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>➕ Tạo phòng mới</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onNewGame}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 text-white font-bold text-xs border border-slate-600 transition-all active:scale-95 cursor-pointer"
                  >
                    Chơi với máy
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#1F1812] hover:bg-[#2A2018] text-[#EFE6D5] font-bold text-xs border border-[#36291E] transition-all active:scale-95 cursor-pointer"
                  >
                    Xem bàn cờ
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onNewGame}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer ${
                    modalData.resultType === 'victory'
                      ? 'bg-[#D97706] hover:bg-amber-500 text-white shadow-amber-500/25'
                      : 'bg-[#2A2018] hover:bg-[#36291E] text-[#EFE6D5] border border-[#36291E]'
                  }`}
                >
                  Chơi ván mới
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#1F1812] hover:bg-[#2A2018] text-[#EFE6D5] font-bold text-xs border border-[#36291E] transition-all active:scale-95 cursor-pointer"
                >
                  Xem bàn cờ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

GameOverModal.displayName = 'GameOverModal';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = React.memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1F1812] border border-[#36291E] rounded-2xl max-w-md w-full p-5 max-h-[85vh] overflow-y-auto shadow-2xl">
        <h2 className="text-base font-extrabold text-[#D97706] mb-3 text-center uppercase tracking-wide">
          Luật Cờ Tướng (Xiangqi)
        </h2>
        <div className="text-xs text-[#EFE6D5] space-y-2.5 leading-relaxed">
          <p>🔹 <strong>Tướng (帥/將):</strong> Di chuyển 1 ô thẳng/ngang trong Cung (3x3). Hai Tướng không được nhìn thấy nhau trên cùng một đường thẳng không có quân cản (Lộ mặt tướng).</p>
          <p>🔹 <strong>Sĩ (仕/士):</strong> Di chuyển 1 ô đường chéo trong Cung (chỉ đi 5 điểm cố định).</p>
          <p>🔹 <strong>Tượng (相/象):</strong> Đi chéo 2 ô (hình vuông 2x2), không được qua sông. Bị cản khi có quân nằm giữa đường chéo (Mắt tượng).</p>
          <p>🔹 <strong>Mã (傌/馬):</strong> Đi hình chữ L (1 ô thẳng rồi 1 ô chéo). Bị cản nếu hướng bước đầu tiên có quân đứng (Cản chân mã).</p>
          <p>🔹 <strong>Xe (俥/車):</strong> Đi và ăn quân theo đường ngang và dọc nếu không bị cản.</p>
          <p>🔹 <strong>Pháo (炮/包):</strong> Đi như Xe khi không ăn quân; khi ăn quân bắt buộc phải nhảy qua đúng một quân làm ngòi (Giá pháo).</p>
          <p>🔹 <strong>Tốt/Binh (兵/卒):</strong> Chưa qua sông chỉ được tiến 1 ô; qua sông rồi được tiến 1 ô hoặc đi ngang 1 ô. Không bao giờ được đi lùi.</p>
          <p>🔹 <strong>Hết nước đi:</strong> Trong Cờ Tướng, bên bị hết nước đi hợp lệ (dù không bị chiếu) thì bị tính THUA (Stalemate = Defeat).</p>
          <p>🔹 <strong>Trường chiếu (Perpetual Check):</strong> Nếu một bên dùng 1 quân cờ liên tục chiếu Tướng quá 3 lần tại cùng 1 vị trí mà không đổi nước đi thì sẽ bị tính HÒA.</p>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#D97706] hover:bg-amber-500 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
});

RulesModal.displayName = 'RulesModal';

interface ResignModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResignModal: React.FC<ResignModalProps> = React.memo(({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1F1812] border border-red-500/50 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto mb-3">
          <Flag className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-red-300 mb-1.5">Xác Nhận Đầu Hàng</h2>
        <p className="text-xs text-[#EFE6D5] mb-5 leading-relaxed">
          Bạn có chắc chắn muốn xin hàng và chịu thua ván đấu này không?
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            Đầu hàng
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-[#120E0A] hover:bg-[#2A2018] text-[#EFE6D5] font-bold text-xs border border-[#36291E] transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
});

ResignModal.displayName = 'ResignModal';

interface DrawOfferModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const DrawOfferModal: React.FC<DrawOfferModalProps> = React.memo(({ isOpen, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1F1812] border border-[#D97706]/60 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-[#120E0A] border border-[#D97706]/50 flex items-center justify-center text-[#D97706] mx-auto mb-3">
          <Handshake className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#EFE6D5] mb-1.5">Lời Cầu Hòa</h2>
        <p className="text-xs text-[#B8A996] mb-5 leading-relaxed">
          Đối thủ đề nghị bắt tay hòa ván cờ này. Bạn có đồng ý kết thúc trận đấu với tỷ số hòa không?
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-xl bg-[#D97706] hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            Đồng ý hòa
          </button>
          <button
            onClick={onDecline}
            className="flex-1 py-2.5 rounded-xl bg-[#120E0A] hover:bg-[#2A2018] text-[#EFE6D5] font-bold text-xs border border-[#36291E] transition-all cursor-pointer"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
});

DrawOfferModal.displayName = 'DrawOfferModal';
