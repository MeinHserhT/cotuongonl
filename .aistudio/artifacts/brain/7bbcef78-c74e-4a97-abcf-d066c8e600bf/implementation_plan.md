# Nâng Cấp Giải Cờ Thế Kinh Điển: Cơ Chế AI Đối Kháng Tối Ưu Thời Gian Thực

Chuyển đổi toàn bộ chế độ **Giải Cờ Thế Kinh Điển** từ kịch bản kiểm tra nước đi cố định sang cơ chế **đấu trí trực tiếp với AI Kiện Tướng thời gian thực**: sau mỗi nước đi hợp lệ của người chơi (Quân Đỏ), hệ thống tự động kích hoạt bộ máy tìm kiếm Alpha-Beta trên Web Worker để tính toán và đi nước đáp trả tối ưu nhất cho Quân Đen.

## User Review & Critical Decisions

> [!IMPORTANT]
> Các quyết định thiết kế dưới đây đã được chuẩn hóa theo đúng lựa chọn của bạn để đảm bảo trải nghiệm phá thế cờ chân thực và giàu tính chiến thuật.

- **Cho phép đi mọi nước hợp lệ & AI tự động đáp trả tối ưu**: Người chơi được tự do thực hiện bất kỳ nước đi hợp lệ nào trên bàn cờ. Nếu chưa chiếu bí ngay, AI Kiện Tướng (Quân Đen) sẽ lập tức phân tích trạng thái bàn cờ hiện tại để đi nước phòng thủ dẻo dai nhất hoặc tung đòn phản công chiếu bí nếu người chơi đi nước yếu.
- **Gợi ý kết hợp AI thời gian thực & Thuyết minh sát pháp**: Khi bấm nút **Gợi ý**, hệ thống kết hợp bộ máy tìm kiếm AI thời gian thực để chỉ ra nước công sát tối ưu nhất từ hình cờ hiện tại (kèm ký hiệu kỳ phổ chuẩn Việt Nam) và hiển thị lời bình giải chiến thuật tương ứng.
- **Báo thất bại ngay khi vượt quá số nước mục tiêu mà chưa chiếu bí AI**: Mỗi thế cờ có định mức số nước của bên Đỏ (`maxMoves`). Nếu người chơi đã đi hết số nước quy định mà vẫn chưa chiếu bí được AI (hoặc bị AI phản công chiếu bí trước), hệ thống sẽ lập tức báo thất bại và cho phép bấm **Đi lại** hoặc **Lùi nước** để thử phương án khác.

---

## 1. Overview & Core Concept

- **What It Does**: Biến mỗi thế cờ kinh điển thành một ván cờ tàn thực chiến sống động. Thay vì bắt người chơi đoán đúng một chuỗi tọa độ cứng nhắc, bàn cờ cho phép thử nghiệm mọi biến hóa tấn công và chứng kiến AI trực tiếp hóa giải hoặc phản kích nếu nước đi chưa đủ sắc bén.
- **Target Audience / Persona**: Kỳ thủ muốn rèn luyện khả năng tính toán sát cục thực chiến, kiểm chứng vì sao một nước đi sai lầm trong cờ thế lại dẫn đến thất bại trước sự phòng thủ tối ưu của AI.
- **Key Value**:
  - Người chơi nhìn thấy tận mắt cách AI hóa giải hoặc phản sát khi mình đi chệch hướng.
  - Hỗ trợ giải các thế cờ có nhiều biến thắng tương đương (miễn là chiếu bí AI trong phạm vi số nước quy định).

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Chọn Thế Cờ**: Người chơi mở bảng **Giải Cờ Thế**, chọn 1 trong 10 thế cờ (từ *Nhập Môn* đến *Danh Cục*). Bàn cờ nạp thế trận, hiển thị thanh điều khiển Cờ Thế phía trên bàn cờ với mục tiêu số nước (ví dụ: *Thắng trong ≤ 3 nước*).
  2. **Người Chơi Đi Quân (Đỏ)**: Người chơi chọn quân và đi bất kỳ nước hợp lệ nào.
     - *Trường hợp Chiếu Bí Ngay*: Nếu nước đi khiến Quân Đen hết nước đi hợp lệ trong phạm vi số nước quy định, hệ thống chúc mừng chiến thắng và trao thưởng từ 1 đến 3 sao.
     - *Trường hợp Đạt Giới Hạn Nước Đi Mà Chưa Chiếu Bí*: Nếu đây đã là nước đi cuối cùng trong định mức (`redMovesUsed >= maxMoves`) mà Quân Đen vẫn còn nước đỡ hợp lệ, AI sẽ thực hiện nước đỡ thoát hiểm trên bàn cờ rồi hệ thống báo **Thất bại (Quá số nước mục tiêu)**.
  3. **AI Kiện Tướng Đáp Trả Tối Ưu (Đen)**: Ngay sau khi nước đi của người chơi hoàn tất mà chưa hết lượt giới hạn, trạng thái chuyển sang *"AI Kiện Tướng đang tính nước tối ưu..."*. Web Worker tính toán nước đi tốt nhất cho Quân Đen và thực hiện trên bàn cờ:
     - Nếu AI phản công chiếu bí Quân Đỏ: Hệ thống báo **Thất bại (AI phản sát thành công)**.
     - Nếu AI phòng thủ thành công và còn lượt: Chuyển lại lượt cho người chơi đi nước tiếp theo.
  4. **Gợi Ý AI & Thuyết Minh Sát Pháp**: Khi người chơi bấm **Gợi ý**, hệ thống tính toán nước đi công sát tối ưu nhất cho Quân Đỏ trên hình cờ hiện tại, làm nổi bật quân cần đi và ô đích trên bàn cờ, đồng thời hiển thị ký hiệu kỳ phổ (ví dụ: *Xe 5 tấn 2*) kèm lời giải thích sát pháp.
  5. **Lùi Nước (Undo) & Đi Lại (Retry)**: Khi đi sai hoặc thất bại, người chơi có thể bấm **Lùi nước** để quay lại ngay trước nước đi vừa rồi hoặc **Đi lại** để khôi phục thế cờ gốc.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: Giữ vững phong cách kỳ đài truyền thống kết hợp giao diện điều khiển hiện đại, sắc nét trên cả chế độ Ban Đêm (`#0E131B` / `#151C28`) và Ban Ngày (`#F4F5F7` / `#FAF7F0`), tương thích hoàn hảo với cả 4 chủ đề mặt bàn cờ (*Hoàng Cung*, *Thiền Trà*, *Cẩm Thạch*, *Sơn Mài*).
  - **Color Palette & Mood**:
    - Trạng thái Đang giải / AI đang tính: Vàng hổ phách (`amber-500`) kết hợp biểu tượng trạng thái suy nghĩ của AI.
    - Trạng thái Phá thế thành công: Xanh ngọc lục bảo (`emerald-500`) kèm hiệu ứng sao vàng (`1–3★`).
    - Trạng thái Thất bại / Quá số nước: Đỏ san hô (`rose-500`) kèm thông điệp nguyên nhân rõ ràng (AI hóa giải thoát chiếu hoặc AI phản sát).
  - **Typography & Hierarchy**: Bộ đếm bước đi và giới hạn nước dùng số đồng폭 (`font-mono tabular-nums`), thuyết minh sát pháp trình bày súc tích, dễ đọc trên cả màn hình dọc di động.

- **Interactive Feedback & Motion**:
  - Hiển thị chỉ báo trạng thái khi AI đang suy nghĩ trên thanh Cờ Thế để người chơi biết AI đang phân tích nước đỡ tối ưu.
  - Phản hồi âm thanh gỗ chạm mặt bàn, hiệu ứng rung xúc giác (Haptics) trên di động và độ rung bàn cờ khi chiếu tướng hoặc ăn quân.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Sử dụng bộ máy Alpha-Beta + Tìm kiếm Sát Cục (Mate-Distance Scoring) trên Web Worker cho cả AI Đáp Trả và AI Gợi Ý**
  - *Chosen Approach*: Tận dụng điểm số chiếu bí theo độ sâu (`±99999 ∓ ply`) của thuật toán Minimax Alpha-Beta trong Web Worker. Khi cầm Quân Đen bị ép chiếu, AI sẽ tự động chọn nước đi kéo dài số bước sống sót lâu nhất (hoặc ăn quân chủ lực của Đỏ / phản chiếu bí ngay nếu Đỏ đi nước yếu). Khi tính Gợi ý cho Quân Đỏ, AI tìm nước đi dẫn đến chiếu bí ở độ sâu ngắn nhất.
  - *Why*: Phản ánh đúng bản chất cờ thế thực chiến mà vẫn giữ tốc độ phản hồi mượt mà (`~150ms–450ms`) trên trình duyệt di động nhờ ít quân trên bàn cờ tàn và tách luồng Web Worker.
  - *Alternatives Considered*: Chỉ dùng kịch bản tĩnh (bị loại vì không cho phép người chơi tự do đi quân và không có AI đối kháng thực sự).

- **Decision 2: Bỏ qua Sách Khai Cuộc (Opening Book) và Tăng Độ Sâu Tìm Kiếm Khi Giải Cờ Thế**
  - *Chosen Approach*: Trong chế độ Cờ Thế, bộ máy AI luôn chạy tìm kiếm chiến thuật trực tiếp trên hình cờ hiện tại ở cấp độ cao nhất (`master`), kết hợp ưu tiên sắp xếp các nước chiếu tướng và ăn quân trong hàm đánh giá.
  - *Why*: Cờ thế là giai đoạn tàn cuộc/trung cuộc có sát cục ngắn hạn; việc tập trung toàn bộ thời gian tìm kiếm vào các biến chiếu tướng giúp AI nhìn thấy sát chiêu 3–4 nước chính xác tuyệt đối.

---

## 4. Technical Architecture & Data Strategy

### Architecture & State Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        CHẾ ĐỘ GIẢI CỜ THẾ VỚI AI                          │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
        1. Người chơi (Quân Đỏ) đi bất kỳ nước hợp lệ nào trên Bàn Cờ
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                  Bộ Kiểm Tra Trạng Thái Bàn Cờ Sau Nước Đỏ                │
│  • Quân Đen còn nước hợp lệ không?                                        │
│  • Số nước Đỏ đã đi (redMovesUsed) so với Định mức (maxMoves)?            │
└───────┬─────────────────────────────┬─────────────────────────────┬───────┘
        │                             │                             │
 [Đen hết nước đi]       [Đạt maxMoves mà Đen       [Còn nước đi & chưa vượt
 (Chiếu bí <= maxMoves)    vẫn còn nước đỡ]             quá maxMoves]
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐   ┌───────────────────────────┐   ┌───────────────────┐
│  THÀNH CÔNG!      │   │ AI đi nước thoát hiểm tối │   │ Web Worker AI     │
│  • Tính 1-3 Sao   │   │ ưu trên bàn cờ -> Báo     │   │ (Cấp Kiện Tướng)  │
│  • Lưu kỷ lục     │   │ THẤT BẠI (Quá số nước)    │   │ tính nước Đen     │
└───────────────────┘   └───────────────────────────┘   └─────────┬─────────┘
                                                                  │
                                  2. AI thực hiện nước đi tối ưu của Quân Đen
                                                                  ▼
                                            ┌───────────────────────────────┐
                                            │ Đỏ bị AI chiếu bí?            │
                                            │ • Có -> Báo THẤT BẠI          │
                                            │ • Không -> Đến lượt Đỏ đi tiếp│
                                            └───────────────────────────────┘
```

### Data Model & State
- **Trạng thái phiên giải Cờ Thế**:
  - `activePuzzle`: Thông tin thế cờ đang mở (`id`, `title`, `maxMoves`, `initialBoard`, `steps` tham khảo thuyết minh).
  - `redMovesUsed`: Số nước Quân Đỏ đã thực hiện tính từ đầu thế cờ (dựa trên lịch sử nước đi `moveHistory`).
  - `puzzleStatus`: `'solving' | 'ai-thinking' | 'wrong' | 'solved'`.
  - `puzzleStatusMsg`: Thông điệp phản hồi trực quan theo từng nước đi (thuyết minh sát pháp, nước đi AI vừa đáp trả, hoặc lý do thất bại).
  - `isHintLoading`: Trạng thái khi AI đang tính nước gợi ý tối ưu cho Quân Đỏ.

### Interactive Component & State Mapping
- **Bàn cờ tương tác (`XiangqiBoard` & `useXiangqiGame`)**:
  - Mở khóa toàn bộ nước đi hợp lệ của Quân Đỏ khi đến lượt người chơi (`turn === 'r'` và `puzzleStatus === 'solving'`).
  - Khi người chơi bấm **Lùi nước**, hệ thống lùi lại 1 cặp nước (nước AI vừa đỡ + nước người chơi vừa đi) hoặc lùi 1 nước nếu AI vừa thắng, đồng thời khôi phục trạng thái `'solving'` để người chơi thử ngay nhánh khác.
- **Thanh điều khiển Cờ Thế (`PuzzleBanner`)**:
  - Hiển thị tiến độ `Nước đã đi: X / Y nước mục tiêu` và trạng thái suy nghĩ của AI.
  - Tích hợp 4 nút thao tác trực quan: **Gợi ý AI**, **Lùi nước**, **Đi lại**, và **Thế tiếp theo** (khi đã thắng).
