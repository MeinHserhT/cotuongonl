# AGENT.MD - TỔNG QUAN HỆ THỐNG VÀ LỊCH SỬ THAY ĐỔI DỰ ÁN CỜ TƯỚNG (XIANGQI MASTER)

Tài liệu này tổng hợp toàn bộ kiến trúc hệ thống, các tính năng cốt lõi và lịch sử tất cả các thay đổi, tối ưu hóa đã được thực hiện trên dự án **Cờ Tướng - Xiangqi Master**.

---

## 1. TỔNG HỢP CÁC YÊU CẦU & THAY ĐỔI ĐÃ THỰC HIỆN

### 1.1. Cố định tiêu điểm bàn cờ trong suốt trận đấu và khi kết thúc ván
- **Yêu cầu**: Focus vào bàn cờ trong lúc đang đánh cờ; khi đánh xong giữ nguyên bàn cờ cố định trong khung hình, không bị giật hay cuộn màn hình xuống phần biên bản ván đấu.
- **Giải pháp**:
  - Loại bỏ hoàn toàn phương thức `scrollIntoView()` trên toàn bộ ứng dụng.
  - Chuyển việc tự động cuộn danh sách nước đi sang chế độ cuộn nội bộ trong container biên bản:
    ```ts
    if (inspectMoveIndex === null && movesContainerRef.current) {
      movesContainerRef.current.scrollTop = movesContainerRef.current.scrollHeight;
    }
    ```
  - Bàn cờ luôn nằm cố định ở vị trí trung tâm tầm nhìn của người chơi kể cả khi trận đấu kết thúc hoặc khi xem lại lịch sử nước đi.

---

### 1.2. Hiệu ứng đặc biệt chỉ kích hoạt khi Xe, Pháo, Mã ăn quân
- **Yêu cầu**: Chỉ khi quân Xe, Pháo, Mã ăn quân khác thì mới tạo hiệu ứng đặc biệt; khi di chuyển bình thường không cần hiệu ứng.
- **Giải pháp**:
  - Tại `hooks/useXiangqiGame.ts`:
    - Ràng buộc nghiêm ngặt điều kiện `isCapture === true` cho các hiệu ứng:
      - **Pháo đại bác (`CannonJumpAnimation`)**: Chỉ phóng bay qua đầu quân ngòi khi ăn quân đích.
      - **Xe thần tốc (`ChariotChargeAnimation`)**: Chỉ tạo vệt xung kích khi va chạm ăn quân đối phương.
      - **Mã phi cước (`HorseKickAnimation`)**: Chỉ đá văng quân địch vào khay tù binh khi ăn quân.
    - Quỹ đạo bay parabol 3D (`computeCurveTrajectory`) và sóng xung kích tiếp đất (`landingEffect`) chỉ kích hoạt khi `isCapture === true`.
    - Các nước đi thông thường không ăn quân lướt mượt mà theo đường thẳng 2D (`computeStraightTrajectory`).

---

### 1.3. Tối ưu giao diện khi Chiến Thắng (Ẩn thành phần dư thừa)
- **Yêu cầu**: Tinh gọn hộp thoại Chiến Thắng, loại bỏ khối icon tròn dư thừa.
- **Giải pháp**:
  - Tại `components/GameModals.tsx`:
    - Ẩn khối icon tròn 80px nảy bật khi `modalData.resultType === 'victory'`.
    - Tích hợp biểu tượng cúp khải hoàn `🏆` trực tiếp vào tiêu đề cỡ lớn, giúp hộp thoại chiến thắng sang trọng và gọn gàng.

---

### 1.4. Chỉ báo trực quan nước đi cuối cùng của đối thủ (Last Move Indicator)
- **Yêu cầu**: Thêm chỉ báo trực quan trên bàn cờ tại vị trí quân cờ vừa di chuyển để người chơi dễ dàng theo dõi nước đi cuối cùng.
- **Giải pháp**:
  - Tại `components/XiangqiBoard.tsx`:
    - **Ô xuất phát (`isLastMoveFrom`)**: Hiển thị vòng tròn mờ màu hổ phách viền nét đứt kèm chấm sáng tâm, đánh dấu nơi quân cờ vừa rời đi.
    - **Ô đích đến (`isLastMoveTo`)**: Hiển thị hào quang nổi bật bao quanh quân cờ vừa hạ xuống.
    - Đồng bộ `lastMove` trong `app/page.tsx` với cả chế độ xem lại lịch sử (`inspectMoveIndex`).

---

### 1.5. Chưa đánh nước đầu tiên thì không tính thời gian
- **Yêu cầu**: Khi ván cờ mới bắt đầu và chưa có ai đi nước đầu tiên thì không đếm lùi đồng hồ.
- **Giải pháp**:
  - Tại `hooks/useXiangqiGame.ts` và `server/room-manager.ts`:
    - Thêm điều kiện `moveHistory.length === 0` vào bộ đếm thời gian để chỉ bắt đầu tính giờ sau khi nước đi đầu tiên được thực hiện.
    - Đồng bộ cờ `isTimerRunning` tại `PlayerBlock.tsx`.

---

### 1.6. Vị trí khay cờ bắt giữ (`BoardSideTray`) linh hoạt theo tỉ lệ khung nhìn (`vh` vs `vw`)
- **Yêu cầu**:
  - Nếu `vh < vw` (màn hình ngang / landscape): khay cờ nằm ở **2 bên** của bàn cờ (`orientation="vertical"`).
  - Nếu `vh >= vw` (màn hình dọc / portrait): khay cờ nằm ở **trên và dưới** của bàn cờ (`orientation="horizontal"`).
- **Giải pháp**:
  - Theo dõi tỉ lệ khung nhìn thực tế trong `app/page.tsx` và tự động chuyển đổi vị trí cũng như hướng bay của quân cờ bị bắt vào đúng khay tương ứng.

---

### 1.7. Đồng bộ kích thước khay cờ khớp tuyệt đối với bàn cờ (`BoardSideTray` Dimension Matching)
- **Yêu cầu**: Khay cờ có chiều dài bằng đúng chiều cao bàn cờ (khi đặt ở 2 bên) hoặc bằng đúng chiều rộng bàn cờ (khi đặt ở trên/dưới).
- **Giải pháp**:
  - Sử dụng `ResizeObserver` trên `boardRef` của `XiangqiBoard` để đồng bộ kích thước pixel chính xác cho `BoardSideTray`.

---

### 1.8. Hệ thống âm thanh Web Audio API thuần khiết & Không độ trễ
- **Yêu cầu**: Phát chính xác âm thanh khi di chuyển và ăn quân với độ trễ 0ms, đồng thời loại bỏ hoàn toàn các tệp dữ liệu Base64 trùng lặp gây nặng mã nguồn.
- **Giải pháp**:
  - Xóa bỏ triệt để 2 tệp chuỗi Base64 khổng lồ (`lib/moveAudioData.ts` và `lib/captureAudioData.ts`).
  - Tại `lib/audio.ts` (`AudioEngine`):
    - Tải trực tiếp tệp âm thanh tĩnh `/sounds/move.mp3` và `/sounds/capture.mp3` giải mã vào `AudioBuffer` của Web Audio API (phát tức thì với độ trễ 0ms), kèm fallback `HTMLAudioElement` và bộ tổng hợp âm thanh vật lý (Oscillator & BiquadFilter cho tiếng đại bác, chiến xa, vó ngựa, chiếu tướng, thắng/thua).
    - Cơ chế chống lặp âm (debounce 60ms–80ms).

---

### 1.9. Tối ưu hóa toàn diện theo triết lý Ponytail & Tiêu chuẩn hiệu năng Addy Osmani
- **Yêu cầu**: Tinh gọn kiến trúc theo tinh thần *"The Laziest Senior Dev"* (Ponytail), tối ưu Core Web Vitals theo chuẩn Addy Osmani và gia cố bảo mật WebSocket.
- **Giải pháp**:
  1. **Gỡ bỏ thư viện dư thừa (Zero-Bloat Discipline)**:
     - Loại bỏ `@google/genai`, `@hookform/resolvers`, `class-variance-authority`, và `firebase-tools` khỏi `package.json`.
  2. **Tách gói & Lazy Loading (`next/dynamic`)**:
     - Chuyển các modal phụ trợ nặng (`OnlineLobbyModal`, `OpeningBookModal`, `UserProfileDrawer`, `SaveGameModal`, `SettingsMenuModal`, `AuthModal`) trong `app/page.tsx` sang `next/dynamic` với `{ ssr: false }`.
     - Giảm đáng kể dung lượng bundle JavaScript tải ban đầu, tăng tốc First Contentful Paint (FCP) và Largest Contentful Paint (LCP).
  3. **Gia cố an ninh WebSocket Server (`server.ts` & `server/room-manager.ts`)**:
     - Giới hạn cứng khung truyền tải WebSocket `maxPayload: 16KB` tại `server.ts`.
     - Giới hạn kích thước gói tin JSON $\le 8\text{KB}$ tại `RoomManager.handleConnection`.
     - Tích hợp **Rate Limiting**: Tối đa 20 thông điệp/giây trên mỗi kết nối WebSocket để chống spam nước đi, flood chat hoặc tấn công DoS.
     - Kiểm tra tính hợp lệ của cấu trúc JSON (`typeof msg === 'object' && typeof msg.type === 'string'`) trước khi thực thi logic phòng đấu.

---

### 1.10. Cập nhật nhãn chế độ chơi & Khắc phục lỗi che dấu tiếng Việt (Line-Height Preservation)
- **Yêu cầu**:
  - Đổi tên nút chế độ chơi 2 người thành **"Đấu 2 người (Local)"**.
  - Chỉnh lại `line-height` đang che mất dấu sắc, dấu ngã, dấu hỏi, dấu mũ của các chữ *Đấu, ngẫu, Ẩn, xếp...*
- **Giải pháp**:
  - Tại `components/UnifiedGameConsole.tsx`: Cập nhật nhãn nút thành **"Đấu 2 người (Local)"**.
  - Tại `app/globals.css`:
    - Thiết lập `line-height: 1.5` cho `html, body` và `1.45` cho `button, input, select, textarea`.
    - Bổ sung khoảng đệm an toàn cho lớp `.truncate` (`padding-top: 0.18em; padding-bottom: 0.12em; line-height: 1.45 !important`) và nâng `.leading-tight` lên `1.42 !important` để `overflow: hidden` không cắt mất phần dấu nhô cao của font `Lemonada`.
  - Tại `components/GameHeader.tsx`, `components/UnifiedGameConsole.tsx`, `components/PlayerBlock.tsx`:
    - Áp dụng `leading-normal` và đệm dọc `py-0.5` / `py-1` cho nút hồ sơ (**"Kỳ thủ Ẩn danh"**), các nút chọn chế độ đấu (**"Đấu 2 người (Local)"**, **"Đấu Trực Tuyến"**, **"Đấu với máy (chọn bên ngẫu nhiên)"**), tiêu đề **"Elo Xếp Hạng"** và dòng **"Hệ số xếp hạng Elo"**.

---

### 1.11. Chuẩn hóa SEO, Kiểm thử Build/Lint & Sẵn sàng Triển khai (Deployment Readiness)
- **Giải pháp**:
  - **SEO & Metadata**: Cấu hình đầy đủ OpenGraph, Twitter Card, Schema.org `VideoGame` JSON-LD trong `app/layout.tsx`, tự động tạo `sitemap.xml` (`app/sitemap.ts`) và `robots.txt` (`app/robots.ts`).
  - **Cấu hình WebSocket linh hoạt**: Hỗ trợ biến môi trường `NEXT_PUBLIC_WS_SERVER_URL` tại `hooks/useXiangqiSocket.ts` và `.env.example`, giúp ứng dụng tự động kết nối WebSocket nội bộ (khi deploy trên Railway/Render) hoặc WebSocket tách rời (khi deploy Frontend trên Vercel).
  - **Kiểm tra chất lượng**: Đạt chuẩn 0 lỗi `eslint` và biên dịch `next build` thành công 100%.

---

### 1.12. Loại bỏ hoàn toàn chế độ Daily Puzzle (Giải Cờ Thế Hàng Ngày)
- **Yêu cầu**: Gỡ bỏ toàn bộ tính năng Daily Puzzle không cần thiết.
- **Giải pháp**:
  - Xóa hoàn toàn các tệp dữ liệu, API route và giao diện liên quan đến Puzzle:
    - `lib/xiangqi-puzzles.ts`
    - `app/api/puzzles/daily/route.ts` (và thư mục `app/api/puzzles`)
    - `components/TacticalPuzzleBar.tsx`
    - `components/TacticalPuzzleCatalogModal.tsx`
    - `components/TacticalPuzzleVictoryModal.tsx`
  - Làm sạch kiểu dữ liệu `gameMode` (`'pve-red' | 'pve-black' | 'pvp' | 'online'`) và gỡ bỏ hàm `loadFenPosition` trong `hooks/useXiangqiGame.ts`, `components/UnifiedGameConsole.tsx` và `components/PlayerBlock.tsx`.

---

### 1.13. Rà soát & Dọn dẹp triệt để mã nguồn dư thừa lần 2 theo Ponytail (Zero Dead Code Audit)
- **Yêu cầu**: Kiểm tra lại toàn bộ dự án theo triết lý **Ponytail** xem còn thành phần nào bị dư thừa không và dọn dẹp sạch sẽ.
- **Giải pháp**:
  1. **Xóa các Component UI cũ không còn sử dụng (0 references)** — đã được hợp nhất vào `UnifiedGameConsole.tsx` và `PlayerBlock.tsx`:
     - `components/GameControls.tsx`
     - `components/ScoreSheet.tsx`
     - `components/TurnIndicatorBanner.tsx`
     - `components/InGameChatDrawer.tsx`
  2. **Xóa các Hook & Tiện ích trùng lặp / không sử dụng**:
     - `hooks/use-mobile.ts` (0 references).
     - `lib/utils.ts` (`cn()` không sử dụng trên toàn dự án).
     - `lib/fen-utils.ts` (`fenToBoard` chỉ phục vụ Daily Puzzle đã xóa; `boardToFen` dùng chung trực tiếp từ `lib/xiangqi-openings.ts`).
  3. **Xóa thư mục Script tạm & Tài nguyên âm thanh dư thừa**:
     - Xóa toàn bộ thư mục `/scripts` chứa 5 file Python nháp dùng để cào âm thanh lúc ban đầu (`check_soundsnap.py`, `download_and_convert.py`, `download_sounds.py`, `find_audio_url.py`, `test_typesense.py`).
     - Xóa file âm thanh trùng lặp `public/sounds/capture.wav` (18KB) không sử dụng (hệ thống chỉ dùng `capture.mp3` và `move.mp3`).
     - Xóa file cấu hình cũ `.eslintrc.json` (dư thừa so với chuẩn Flat Config `eslint.config.mjs` của ESLint 9) và dọn biến thừa trong `eslint.config.mjs`.
  4. **Tiếp tục tinh giản `package.json` & Dead State**:
     - Gỡ thêm 4 package không còn bất kỳ nơi nào import: `clsx`, `tailwind-merge`, `@tailwindcss/typography`, `tw-animate-css`.
     - Loại bỏ các import/state/memo dư thừa trong `app/page.tsx` (`BookOpen`, `findBestMoveEngine`, `currentOpening`, `selectedOpeningDetail`) và `hooks/useXiangqiGame.ts` (`matchResultOverlay`, `handleGetHint`).

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN HIỆN TẠI
- **`/app`**: Next.js App Router (`layout.tsx`, `page.tsx`, `globals.css`, `sitemap.ts`, `robots.ts`, `error.tsx`, `global-error.tsx`).
- **`/components`**: Hệ thống linh kiện giao diện tinh gọn 100% có sử dụng (`XiangqiBoard.tsx`, `UnifiedGameConsole.tsx`, `GameHeader.tsx`, `PlayerBlock.tsx`, `BoardSideTray.tsx`, hiệu ứng ăn quân & các Modals).
- **`/hooks`**: 3 React Hooks cốt lõi (`useXiangqiGame.ts`, `useXiangqiSocket.ts`, `useAuth.ts`).
- **`/lib`**: Động cơ AI Minimax Alpha-Beta (`xiangqi-engine.ts`, `jieqi-engine.ts`), luật Cờ Tướng & Cờ Úp (`xiangqi-rules.ts`, `jieqi-rules.ts`), sách khai cuộc & FEN (`xiangqi-openings.ts`), quỹ đạo bay (`trajectory.ts`), âm thanh (`audio.ts`) và kết nối Firebase (`firebase.ts`).
- **`/server` & `server.ts`**: Máy chủ Node.js tích hợp Next.js và WebSocket Server quản lý phòng đấu, đồng hồ, tính điểm Elo và bảng xếp hạng trực tuyến (`room-manager.ts`).
- **`/DEPLOYMENT_GUIDE.md`**: Hướng dẫn chi tiết cách triển khai ứng dụng lên Railway, Render, Vercel và Netlify.

