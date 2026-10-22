# Hướng Dẫn Triển Khai (Deployment Guide) - Cờ Tướng Online

Ứng dụng Cờ Tướng Online được xây dựng trên nền tảng **Next.js 15 (App Router)** kết hợp với **Firebase** (Xác thực, Lưu trữ đám mây, Bảng xếp hạng Elo) và **WebSocket Server** (Phòng đấu thời gian thực).

---

## 1. Triển khai lên Vercel (Khuyên dùng cho Frontend & AI)

### Bước 1: Đẩy mã nguồn lên GitHub / GitLab
```bash
git init
git add .
git commit -m "feat: Sẵn sàng triển khai Cờ Tướng Online"
git branch -M main
git remote add origin <URL_REPO_CUA_BAN>
git push -u origin main
```

### Bước 2: Nhập dự án vào Vercel
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập.
2. Chọn **"Add New..."** -> **"Project"**.
3. Chọn Repository vừa tải lên từ GitHub.
4. **Framework Preset**: Vercel sẽ tự động nhận diện là `Next.js`.
5. **Build Command**: `next build` (mặc định).
6. **Output Directory**: `.next` (mặc định).

### Bước 3: Cấu hình biến môi trường (Environment Variables)
Trong mục **Environment Variables** trên Vercel:
- `GEMINI_API_KEY`: *(Tùy chọn)* Khóa API Gemini nếu sử dụng tính năng bình cờ AI.
- `NEXT_PUBLIC_WS_SERVER_URL`: *(Tùy chọn)* Nếu muốn kích hoạt phòng đấu online multiplayer qua WebSocket riêng (xem mục 3 bên dưới). Nếu để trống, người dùng vẫn chơi offline 2 người, luyện tập với máy AI Minimax và đăng nhập Firebase bình thường.

Nhấn **Deploy** và chờ khoảng 1-2 phút là website hoạt động với tên miền `.vercel.app` miễn phí kèm HTTPS tự động.

---

## 2. Triển khai lên Netlify

1. Đăng nhập vào [netlify.com](https://netlify.com).
2. Chọn **"Add new site"** -> **"Import an existing project"** -> Kết nối GitHub.
3. Cấu hình build:
   - **Base directory**: để trống.
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Cài đặt thêm plugin `@netlify/plugin-nextjs` nếu được gợi ý.
5. Nhấn **Deploy site**.

---

## 3. Triển khai Full-Stack (Bao gồm cả WebSocket Server)

Vì Vercel và Netlify hoạt động theo kiến trúc **Serverless** (không duy trì tiến trình Node.js liên tục), nếu bạn muốn phòng chơi trực tuyến qua WebSocket hoạt động 24/7, bạn có 2 lựa chọn:

### Lựa chọn A: Triển khai toàn bộ bằng Docker / Cloud Run / Railway / Render (Khuyên dùng)
Dự án đã có sẵn file `server.ts` tích hợp cả Next.js và WebSocket Server trên cùng 1 cổng:
```bash
# Cài đặt thư viện
npm install

# Biên dịch ứng dụng
npm run build

# Chạy server sản xuất
npm run start
```
Trên **Railway** hoặc **Render**:
1. Tạo Web Service mới trỏ vào Git Repo.
2. Start Command đặt là: `npm run start`
3. Cổng (PORT): để tự động (`process.env.PORT || 3000`).

### Lựa chọn B: Tách biệt Frontend Vercel + Backend WebSocket Railway/Render
1. Triển khai `server.ts` lên Railway/Render để lấy URL WebSocket: `wss://my-cotuong-ws.up.railway.app/api/ws`.
2. Trên Vercel, thêm biến môi trường:
   `NEXT_PUBLIC_WS_SERVER_URL=wss://my-cotuong-ws.up.railway.app/api/ws`
3. Redeploy lại Vercel. Frontend sẽ tự động kết nối sang server WebSocket mà không cần thay đổi code.

---

## 4. Tóm tắt điều kiện đã được tối ưu sẵn trong mã nguồn
- [x] **Biên dịch**: `npm run build` đạt 100% không có lỗi TypeScript hay cú pháp.
- [x] **Linting**: Quy chuẩn ESLint 9 đạt 0 lỗi, 0 cảnh báo.
- [x] **SEO**: Tiêu đề, mô tả, OpenGraph, Twitter card và dữ liệu cấu trúc Schema.org `VideoGame` chuẩn Google Search.
- [x] **Sitemap & Robots**: Tự động sinh `sitemap.xml` và `robots.txt`.
- [x] **Bảo mật**: `firestore.rules` kiểm soát chặt chẽ quyền ghi điểm Elo và bảo vệ hồ sơ kỳ thủ.
- [x] **Tương thích thiết bị**: Responsive mượt mà trên iPhone, Android, iPad và màn hình máy tính.
