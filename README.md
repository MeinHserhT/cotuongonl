# 🏯 Cờ Tướng - Xiangqi Master

**Cờ Tướng - Xiangqi Master** là nền tảng chơi **Cờ Tướng (Xiangqi)** và **Cờ Úp (Jieqi)** trực tuyến thời gian thực mang phong cách cổ phong Á Đông hiện đại (Kỳ Vương / Ziga). Ứng dụng hỗ trợ thi đấu xếp hạng Elo tự động, tạo phòng đấu cùng bạn bè, luyện tập với máy AI 4 cấp độ, cẩm nang khai cuộc kinh điển và đồng bộ hồ sơ đám mây.

---

## ✨ Tính Năng Nổi Bật

### 1. Hai Thể Loại Cờ Độc Lập (Dual-Variant)
- **⚔️ Cờ Ngửa (Cờ Tướng Truyền Thống - Xiangqi)**: Luật Cờ Tướng chuẩn quốc tế, kiểm tra chiếu tướng, bí nước, lộ mặt tướng và cảnh báo chiếu trường (chiếu lặp lại quá 3 lần).
- **🎭 Cờ Úp (Jieqi)**: Khởi tạo 30 quân úp ngẫu nhiên (trừ 2 Tướng mở sẵn), đi nước đầu theo vị trí khung bàn cờ và lật mở quân thực tế ngay sau nước đi đầu tiên.

### 2. Ba Chế Độ Đối Kháng Linh Hoạt
- **🌐 Đấu Trực Tuyến (Online Multiplayer)**:
  - **Tìm Trận Xếp Hạng (Ranked Matchmaking)**: Tự động dò tìm và ghép cặp kỳ thủ cùng thể loại cờ theo khoảng điểm Elo mở rộng dần, tự động bốc thăm quân Đỏ/Đen (50/50) với thời gian tiêu chuẩn **15 phút/bên · 60 giây/nước**.
  - **Tạo Phòng & Phòng Chờ**: Mở bàn đấu công khai hoặc riêng tư qua mã phòng 6 ký tự, mời bạn bè qua đường dẫn chia sẻ trực tiếp hoặc vào xem trận với tư cách **Khán giả (Spectator)**.
- **🤖 Đấu Với Máy AI (PvE)**:
  - 4 cấp độ trí tuệ nhân tạo: **Nhập Môn (Easy)**, **Cơ Bản (Medium)**, **Cao Thủ (Hard)** và **Kiện Tướng (Master)** sử dụng thuật toán Minimax kết hợp cắt tỉa Alpha-Beta và bảng điểm vị trí quân (Piece-Square Tables).
- **👥 Đấu 2 Người (Local Pass & Play)**:
  - Thi đấu trực tiếp 2 người trên cùng một thiết bị với tùy chọn tự động xoay bàn cờ theo lượt đi.

### 3. Hệ Thống Điểm Elo Kép & Bậc Danh Hiệu
- Tách biệt hoàn toàn điểm **Elo Cờ Ngửa** và **Elo Cờ Úp** cùng thống kê số trận, chuỗi thắng/hòa/bại và tỷ lệ thắng (`Win Rate`).
- Phân hạng danh hiệu tự động theo mốc điểm Elo:
  - 🐣 **Tập Sự** (`< 1100`)
  - ⚔️ **Kỳ Thủ** (`1100 – 1299`)
  - 🛡️ **Cao Thủ** (`1300 – 1499`)
  - 🏅 **Đại Sư** (`1500 – 1799`)
  - 👑 **Kỳ Vương** (`≥ 1800`)

### 4. Công Cụ Kỳ Phổ, Khai Cuộc & Trải Nghiệm Bàn Cờ
- **📜 Biên Bản Ván Đấu Chuẩn Việt Nam**: Ghi nhận kỳ phổ đầy đủ (`Pháo 2 bình 5`) và viết tắt (`P2-5`), hỗ trợ xem lại từng nước đi trong lịch sử và sao chép mã **FEN**.
- **📖 Cẩm Nang Khai Cuộc**: Tích hợp các thế trận khai cuộc kinh điển (*Trung Pháo đối Bình Phong Mã*, *Tiên Nhân Chỉ Lộ*, *Thuận Pháo*, *Nghịch Pháo*, *Phi Tượng Cuộc*...).
- **🎨 Giao Diện & Âm Thanh**: Chuyển đổi linh hoạt chế độ **Tối / Sáng**, mặt bàn cờ **Hoàng Gia (Imperial) / Thiền Định (Zen)**, hiệu ứng di chuyển quân cờ (Pháo nhảy, Xe xung kích, Mã phi) và âm thanh đặt quân sống động.
- **☁️ Hồ Sơ & Lưu Ván Cờ Đám Mây**: Đăng nhập qua Google, Email hoặc Khách để đồng bộ Elo, lịch sử trận đấu và lưu/mở lại các ván cờ đang đánh dở trên Firebase Firestore.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Giao diện & Hoạt ảnh** | Tailwind CSS v4, Motion (`motion/react`), Lucide Icons |
| **Real-Time Multiplayer** | Custom Node.js Server (`server.ts`), WebSocket (`ws` tại `/api/ws`) kết hợp HTTP Polling dự phòng (`/api/mp`) |
| **Xác thực & Cơ sở dữ liệu** | Firebase Authentication, Cloud Firestore |
| **SEO & Structured Data** | OpenGraph, Twitter Cards, Schema.org (`VideoGame`, `WebApplication`, `FAQPage`), Dynamic `sitemap.xml` & `robots.txt` |

---

## 📂 Cấu Trúc Thư Mục

```text
├── app/
│   ├── api/mp/route.ts         # Endpoint HTTP dự phòng cho chế độ đấu trực tuyến
│   ├── layout.tsx              # Cấu hình Root Layout, Fonts, SEO Metadata & Schema.org JSON-LD
│   ├── page.tsx                # Trang chính điều phối bàn cờ, bảng điều khiển và các hộp thoại
│   ├── robots.ts               # Cấu hình robots.txt tự động
│   └── sitemap.ts              # Cấu hình sitemap.xml tự động
├── components/
│   ├── XiangqiBoard.tsx        # Bàn cờ tương tác, quân cờ, gợi ý nước đi và hoạt ảnh
│   ├── UnifiedGameConsole.tsx  # Khung điều khiển hợp nhất (Chọn chế độ, Elo, Biên bản, Chat)
│   ├── StartGameMenuModal.tsx  # Hộp thoại chọn chế độ chơi khi mới vào trang (hiệu ứng bay về khung)
│   ├── OnlineLobbyModal.tsx    # Đại sảnh trực tuyến (Ghép trận Xếp hạng, Tạo phòng, Phòng chờ, BXH)
│   ├── OpeningBookModal.tsx    # Cẩm nang khai cuộc cờ tướng
│   ├── UserProfileDrawer.tsx   # Ngăn kéo hồ sơ kỳ thủ, lịch sử đấu và ván cờ đã lưu
│   └── ...
├── hooks/
│   ├── useXiangqiGame.ts       # Bộ máy điều khiển ván cờ local, đồng hồ, lịch sử nước đi & AI
│   └── useXiangqiSocket.ts     # Hook kết nối thời gian thực (WebSocket + HTTP Polling tự động)
├── lib/
│   ├── xiangqi-rules.ts        # Luật Cờ Tướng, kiểm tra nước đi hợp lệ, chiếu tướng & ký hiệu FEN
│   ├── jieqi-rules.ts          # Luật Cờ Úp (Jieqi), quản lý quân úp và lật quân
│   ├── xiangqi-ai.ts           # Trí tuệ nhân tạo AI (Minimax + Alpha-Beta Pruning)
│   ├── audio-engine.ts         # Bộ tổng hợp âm thanh Web Audio API
│   └── firebase.ts             # Kết nối Firebase Auth, Firestore và đồng bộ thống kê Elo
├── server/
│   └── room-manager.ts         # Quản lý phòng đấu, hàng chờ ghép trận Elo, đồng hồ và xác thực nước đi
└── server.ts                   # Máy chủ Node.js tích hợp Next.js + WebSocket + HTTP Multiplayer
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Cài đặt phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
Sao chép tệp `.env.example` sang `.env` (nếu cần thiết lập tùy chỉnh):
```bash
cp .env.example .env
```

### 3. Chạy môi trường phát triển (Development)
Khởi chạy máy chủ tích hợp cả giao diện Next.js và dịch vụ đấu trực tuyến tại `http://localhost:3000`:
```bash
npm run dev
```

### 4. Kiểm tra mã nguồn & Biên dịch Production
```bash
npm run lint
npm run build
npm run start
```
