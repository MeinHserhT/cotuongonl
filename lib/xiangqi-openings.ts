import { PieceColor, Move, BotDifficulty } from './xiangqi-types';

export interface OpeningInfo {
  id: string;
  nameVn: string;
  nameCn: string;
  tagline: string;
  description: string;
  principles: string[];
  counters: string;
  difficultyToMaster: 'Dễ' | 'Trung bình' | 'Khó' | 'Cao cấp';
}

export interface BookMove {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  weight: number;
  openingId: string;
  openingName: string;
  moveVn: string;
  notes?: string;
}

export const OPENING_CATALOG: Record<string, OpeningInfo> = {
  'trung-phao': {
    id: 'trung-phao',
    nameVn: 'Pháo Đầu (Trung Pháo)',
    nameCn: '当头炮',
    tagline: 'Đệ nhất khai cuộc tấn công, kiểm soát trung lộ sấm sét',
    description:
      'Pháo 2 bình 5 (hoặc Pháo 8 bình 5) là nước cờ khai cuộc phổ biến nhất trong lịch sử cờ tướng (chiếm hơn 70% các ván đấu). Ngay từ nước đầu tiên, Pháo nhắm thẳng vào Chốt đầu và Cung Tướng của đối phương, giành thế chủ động tấn công trung lộ, ép đối phương phải sớm phòng ngự hoặc nghênh chiến.',
    principles: [
      'Khống chế chặt chẽ đường trung tâm (cột 5).',
      'Phát triển nhanh chóng cặp Mã (Mã 2 tiến 3, Mã 8 tiến 7) để giữ chốt đầu và yểm trợ Pháo.',
      'Xuất Xe lộ 2 hoặc lộ 8 chiếm giữ lộ thoáng (Trực Xa hoặc Hoành Xa).',
      'Đẩy Binh 7 hoặc Binh 3 qua sông mở đường cho Mã xông trận.'
    ],
    counters:
      'Bên Hậu thường sử dụng Bình Phong Mã (chắc chắn nhất), Thuận Pháo (đối công), Nghịch Pháo (sinh tử), hoặc Phản Cung Mã.',
    difficultyToMaster: 'Trung bình'
  },
  'binh-phong-ma': {
    id: 'binh-phong-ma',
    nameVn: 'Bình Phong Mã',
    nameCn: '屏风马',
    tagline: 'Tường thành bất khả xâm phạm, khắc tinh của Pháo Đầu',
    description:
      'Bên Hậu phát triển hai Mã lên hàng 2 cột 2 và 6 (Mã 8 tiến 7 và Mã 2 tiến 3), tạo thành một bình phong vững chắc bảo vệ Chốt giữa. Đây là thế trận phòng ngự phản công hoàn chỉnh và có tỷ lệ bất bại cao nhất trong các giải vô địch cờ tướng đỉnh cao.',
    principles: [
      'Hai Mã liên kết bảo vệ Chốt đầu, không để Pháo đối phương đục thủng trung lộ.',
      'Pháo hai cánh làm ngòi bảo vệ Mã và sẵn sàng cơ động (Pháo tuần hà, Pháo quá hà, Pháo thoái 1).',
      'Xuất nhanh Xe lộ 8 hoặc lộ 2 đối chọi Trực Xa của đối phương.',
      'Tấn Chốt 7 hoặc Chốt 3 đúng thời điểm để giải phóng chân Mã.'
    ],
    counters:
      'Bên Tiên thường dùng Trung Pháo tiến Thất Binh, Ngũ Lục Pháo, hoặc Quá Hà Xa để ép cánh.',
    difficultyToMaster: 'Cao cấp'
  },
  'thuan-phao': {
    id: 'thuan-phao',
    nameVn: 'Thuận Pháo (Thuận Thủ Pháo)',
    nameCn: '顺手炮',
    tagline: 'Khai cuộc cổ điển hào sảng, đôi bên so tài tấn công',
    description:
      'Khi bên Tiên đi Pháo 2 bình 5, bên Hậu lập tức đáp trả bằng Pháo 8 bình 5 (cùng vào trung lộ cùng hướng). Hai bên cùng nhắm vào tim của nhau, dẫn đến cuộc so tài công phá trực diện, đòi hỏi tính toán chiến thuật chính xác từng nước đi.',
    principles: [
      'Sau khi vào Pháo, phải xuất quân nhanh: Mã giữ chốt, Xe xuất trận tức khắc.',
      'Phân định rõ chiến thuật Trực Xa (Xe đi thẳng kiểm soát lộ thông) hay Hoành Xa (Xe tiến 1 rồi bình sang cánh sườn).',
      'Tuyệt đối không vội vã dùng Pháo ăn Chốt đầu quá sớm khi chưa phát triển Xe Mã.'
    ],
    counters:
      'Bên phòng thủ cần chú ý bảo vệ sườn, tránh để đối phương tạo thế Pháo Trống (Trung Pháo không có quân cản).',
    difficultyToMaster: 'Khó'
  },
  'nghich-phao': {
    id: 'nghich-phao',
    nameVn: 'Nghịch Pháo (Nghịch Thủ Pháo)',
    nameCn: '逆手炮',
    tagline: 'Quyết đấu sinh tử một mất một còn, công kích cánh sườn mãnh liệt',
    description:
      'Bên Tiên đi Pháo 2 bình 5, bên Hậu đi Pháo 2 bình 5 (cùng vào trung lộ nhưng ngược hướng). Cấu trúc quân hai bên đối xứng nghịch đảo, dẫn đến các đòn đánh chéo cánh cực kỳ gay cấn, hiếm khi hòa cờ.',
    principles: [
      'Công phá mạnh vào cánh yếu của đối phương (nơi Pháo đối phương đã rời đi).',
      'Thường dùng Xe Hoành hoặc Xe Trực thọc sâu hàng chốt.',
      'Phải giữ vững nhịp độ tấn công, bên nào chậm 1 nước là nguy cơ vỡ trận.'
    ],
    counters:
      'Cần sớm củng cố Tượng Sĩ cánh bị tấn công và phản kích trung lộ.',
    difficultyToMaster: 'Cao cấp'
  },
  'phan-cung-ma': {
    id: 'phan-cung-ma',
    nameVn: 'Phản Cung Mã (Nửa Bình Phong)',
    nameCn: '反宫马',
    tagline: 'Linh hoạt uyển chuyển, thế trận ưa thích của đại sư Hồ Vinh Hoa',
    description:
      'Một Mã giữ chốt đầu, một Mã quỳ cánh biên, một Pháo kẹp giữa Mã và Xe (Pháo 8 bình 6 hoặc Pháo 2 bình 4). Thế trận này rất dẻo dai, dễ chuyển hóa thế cờ và gài bẫy phản kích bất ngờ khi đối phương ham công.',
    principles: [
      'Sử dụng sĩ tượng linh hoạt bảo vệ cung cấm.',
      'Pháo kẹp sườn có thể thối thoái chuyển cánh bắn phá Xe địch.',
      'Chờ đợi đối phương nôn nóng sơ hở để tung đòn Mã nhảy qua sông.'
    ],
    counters:
      'Bên Tiên thường đánh ngũ thất pháo hoặc thúc chốt ép mã quỳ.',
    difficultyToMaster: 'Cao cấp'
  },
  'don-de-ma': {
    id: 'don-de-ma',
    nameVn: 'Đơn Đề Mã',
    nameCn: '单提马',
    tagline: 'Phòng thủ lệch cánh, mở đường cho Xe Pháo tung hoành',
    description:
      'Một Mã lên giữ trung lộ, một Mã nhảy ra biên (Mã 2 tiến 1). Dù giảm bớt lực giữ trung lộ nhưng lại giải phóng hoàn toàn cột dọc cho Xe xuất trận thần tốc.',
    principles: [
      'Phát triển Xe cực nhanh để bù đắp điểm yếu trung lộ.',
      'Dùng Pháo và Chốt ghìm chân cánh tấn công của đối thủ.'
    ],
    counters:
      'Đối phương dễ tập trung đánh thẳng vào điểm yếu trung lộ nếu bên Đơn Đề Mã chậm xuất Xe.',
    difficultyToMaster: 'Trung bình'
  },
  'tien-nhan-chi-lo': {
    id: 'tien-nhan-chi-lo',
    nameVn: 'Tiên Nhân Chỉ Lộ (Tấn Binh Cuộc)',
    nameCn: '仙人指路',
    tagline: 'Ném đá dò đường, khai cuộc trí tuệ và biến hóa khôn lường',
    description:
      'Nước cờ mở màn bằng Binh 7 tiến 1 (hoặc Binh 3 tiến 1). Nước đi thăm dò ý đồ chiến thuật của đối phương, thông đường cho Mã nhảy lên, đồng thời sẵn sàng chuyển hóa thành Trung Pháo, Phi Tượng hoặc Khởi Mã tùy theo phản ứng của bên Hậu.',
    principles: [
      'Quan sát nước cờ của đối thủ để chọn kế sách tiếp ứng.',
      'Nếu đối thủ vào Pháo đầu -> Chuyển thành thế cờ Tốt Để Pháo.',
      'Nếu đối thủ cũng tiến Chốt -> Đi vào thế Đối Binh Cuộc thanh thoát.'
    ],
    counters:
      'Bên Hậu có thể đối bằng Đối Binh Cuộc, Tốt Để Pháo, hoặc Phi Tượng.',
    difficultyToMaster: 'Khó'
  },
  'phi-tuong-cuoc': {
    id: 'phi-tuong-cuoc',
    nameVn: 'Phi Tượng Cuộc',
    nameCn: '飞象局',
    tagline: 'Lấy nhu thắng cương, phòng ngự kiên cố chờ thời cơ',
    description:
      'Nước đầu tiên bay Tượng (Tượng 3 tiến 5 hoặc Tượng 7 tiến 5). Đây là khai cuộc chắc chắn nhất của bên Tiên, ngay lập tức liên kết hàng thủ, giữ an toàn tuyệt đối cho Tướng và mở đường cho Pháo Mã phát triển hài hòa.',
    principles: [
      'Củng cố trung lộ vững như bàn thạch.',
      'Không vội giao tranh sớm, đợi đối phương để lộ nhược điểm.',
      'Phối hợp nhịp nhàng giữa Pháo giác, Mã trung tâm và Xe lộ thoáng.'
    ],
    counters:
      'Bên Hậu thường dùng Tả Trung Pháo hoặc Quá Cung Pháo để phá vỡ thế cân bằng.',
    difficultyToMaster: 'Trung bình'
  },
  'khoi-ma-cuoc': {
    id: 'khoi-ma-cuoc',
    nameVn: 'Khởi Mã Cuộc',
    nameCn: '起马局',
    tagline: 'Chắc chắn, kín kẽ, phong cách của những kỳ thủ kỳ cựu',
    description:
      'Nước đầu tiên nhảy Mã 2 tiến 3 (hoặc Mã 8 tiến 7). Giữ kín ý đồ chiến lược, chuẩn bị sẵn sàng cho mọi kịch bản, là vũ khí ưa chuộng của các danh thủ trường phái cờ chắc chắn.',
    principles: [
      'Bảo vệ sớm chốt 3 hoặc chốt 7.',
      'Linh hoạt kết hợp với Pháo đầu hoặc Phi tượng ở các nước sau.'
    ],
    counters:
      'Bên Hậu có thể tấn chốt đối diện hoặc vào Trung Pháo giành quyền chủ động.',
    difficultyToMaster: 'Dễ'
  },
  'qua-cung-phao': {
    id: 'qua-cung-phao',
    nameVn: 'Quá Cung Pháo',
    nameCn: '过宫炮',
    tagline: 'Tập trung hỏa lực một cánh, phòng ngự phản kích sắc bén',
    description:
      'Đi Pháo 2 bình 6 (hoặc Pháo 8 bình 4) đưa Pháo qua khỏi nóc cung sang cánh đối diện. Tạo ưu thế quân số vượt trội ở một cánh, dễ dàng tạo thế gọng kìm cô lập cánh bên kia của đối thủ.',
    principles: [
      'Tập trung Xe Pháo Mã cùng công kích một bên sườn đối phương.',
      'Củng cố Sĩ Tượng phía sau Pháo để giữ vững trận địa.'
    ],
    counters:
      'Bên Hậu thường vào Trung Pháo đánh thẳng trung lộ để phân tán lực lượng của Quá Cung Pháo.',
    difficultyToMaster: 'Khó'
  },
  'si-giac-phao': {
    id: 'si-giac-phao',
    nameVn: 'Sĩ Giác Pháo',
    nameCn: '士角炮',
    tagline: 'Gác Pháo góc Sĩ, linh hoạt biến hóa vô cùng',
    description:
      'Nước đầu đi Pháo 2 bình 4 (hoặc Pháo 8 bình 6) đặt Pháo ngay trên đầu Sĩ. Vừa che chắn cung Tướng, vừa có thể bắn chéo hoặc lùi Pháo chuyển cánh bất kỳ lúc nào.',
    principles: [
      'Dễ chuyển hóa thành Bình Phong Mã hoặc Phản Cung Mã.',
      'Thích hợp cho lối đánh phòng ngự phản kích linh hoạt.'
    ],
    counters:
      'Bên Hậu thường phát triển nhanh Mã trung tâm và kiểm soát các lộ thoáng.',
    difficultyToMaster: 'Trung bình'
  },
  'thiet-hoat-xa': {
    id: 'thiet-hoat-xa',
    nameVn: 'Thiết Hoạt Xa',
    nameCn: '铁滑车',
    tagline: 'Thí Mã tranh tiên, xuất Xe nhanh như vũ bão',
    description:
      'Khai cuộc tấn công cuồng phong: bên Tiên đi Pháo đầu rồi bỏ không giữ Mã, lập tức đưa Xe thốc lên làm chủ chiến trường. Tuy mạo hiểm nhưng có sức công phá cực kỳ mãnh liệt nếu đối phương không phòng thủ chuẩn xác.',
    principles: [
      'Dùng tốc độ của Xe bù đắp cho việc thiệt quân.',
      'Tạo áp lực liên tục không cho đối thủ kịp củng cố thế trận.'
    ],
    counters:
      'Bình tĩnh củng cố phòng ngự, ăn quân có chọn lọc và đổi bớt Xe của đối phương.',
    difficultyToMaster: 'Cao cấp'
  }
};

export function boardToFen(board: (string | null)[][], turn: PieceColor): string {
  const rows: string[] = [];
  for (let r = 0; r < 10; r++) {
    let emptyCount = 0;
    let rowStr = '';
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += emptyCount.toString();
          emptyCount = 0;
        }
        const char = piece.slice(2);
        rowStr += piece.startsWith('r_') ? char.toUpperCase() : char.toLowerCase();
      }
    }
    if (emptyCount > 0) {
      rowStr += emptyCount.toString();
    }
    rows.push(rowStr);
  }
  return `${rows.join('/')} ${turn}`;
}

export const OPENING_BOOK: Record<string, BookMove[]> = {
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR r': [
    {
      fromR: 7, fromC: 7, toR: 7, toC: 4, weight: 50,
      openingId: 'trung-phao', openingName: 'Pháo Đầu (Hữu Pháo)', moveVn: 'Pháo 2 bình 5',
      notes: 'Thế cờ tấn công phổ biến nhất (chiếm 50% lựa chọn)'
    },
    {
      fromR: 7, fromC: 1, toR: 7, toC: 4, weight: 18,
      openingId: 'trung-phao', openingName: 'Pháo Đầu (Tả Pháo)', moveVn: 'Pháo 8 bình 5',
      notes: 'Trung Pháo cánh trái bất ngờ'
    },
    {
      fromR: 6, fromC: 2, toR: 5, toC: 2, weight: 14,
      openingId: 'tien-nhan-chi-lo', openingName: 'Tiên Nhân Chỉ Lộ', moveVn: 'Binh 7 tiến 1',
      notes: 'Ném đá dò đường, mở lộ cho Mã 8'
    },
    {
      fromR: 6, fromC: 6, toR: 5, toC: 6, weight: 8,
      openingId: 'tien-nhan-chi-lo', openingName: 'Tiên Nhân Chỉ Lộ', moveVn: 'Binh 3 tiến 1',
      notes: 'Tấn Binh 3 thăm dò ý đồ đối thủ'
    },
    {
      fromR: 9, fromC: 6, toR: 7, toC: 4, weight: 5,
      openingId: 'phi-tuong-cuoc', openingName: 'Phi Tượng Cuộc', moveVn: 'Tượng 3 tiến 5',
      notes: 'Lấy nhu thắng cương, củng cố trung tâm'
    },
    {
      fromR: 9, fromC: 7, toR: 7, toC: 6, weight: 3,
      openingId: 'khoi-ma-cuoc', openingName: 'Khởi Mã Cuộc', moveVn: 'Mã 2 tiến 3',
      notes: 'Phát triển Mã chính quy, chắc chắn'
    },
    {
      fromR: 7, fromC: 7, toR: 7, toC: 5, weight: 2,
      openingId: 'qua-cung-phao', openingName: 'Quá Cung Pháo', moveVn: 'Pháo 2 bình 6',
      notes: 'Dồn hỏa lực sang một cánh'
    }
  ],
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C4/9/RHEAKAEHR b': [
    {
      fromR: 0, fromC: 7, toR: 2, toC: 6, weight: 55,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã (Tả Mã)', moveVn: 'Mã 8 tiến 7',
      notes: 'Phản đòn tối ưu và kiên cố nhất chống Pháo Đầu'
    },
    {
      fromR: 0, fromC: 1, toR: 2, toC: 2, weight: 20,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã (Hữu Mã)', moveVn: 'Mã 2 tiến 3',
      notes: 'Lên Mã 2 giữ chốt chuẩn bị Bình Phong'
    },
    {
      fromR: 2, fromC: 7, toR: 2, toC: 4, weight: 15,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo', moveVn: 'Pháo 8 bình 5',
      notes: 'Hào sảng cùng vào Pháo đầu nghênh chiến'
    },
    {
      fromR: 2, fromC: 1, toR: 2, toC: 4, weight: 10,
      openingId: 'nghich-phao', openingName: 'Nghịch Pháo', moveVn: 'Pháo 2 bình 5',
      notes: 'Đối công sinh tử nghênh chiến ngược chiều'
    }
  ],
  'rheakae1r/9/1c4hc1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C4/9/RHEAKAEHR r': [
    {
      fromR: 9, fromC: 7, toR: 7, toC: 6, weight: 70,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Đối Bình Phong Mã', moveVn: 'Mã 2 tiến 3',
      notes: 'Chính cuộc chuẩn mực của bên Tiên'
    },
    {
      fromR: 6, fromC: 2, toR: 5, toC: 2, weight: 18,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Tiến Thất Binh', moveVn: 'Binh 7 tiến 1',
      notes: 'Thúc Chốt 7 hãm Mã đối phương'
    },
    {
      fromR: 6, fromC: 6, toR: 5, toC: 6, weight: 12,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Tiến Tam Binh', moveVn: 'Binh 3 tiến 1',
      notes: 'Thúc Chốt 3 mở đường Mã'
    }
  ],
  'rheakae1r/9/1c4hc1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1H2/9/RHEAKAE1R b': [
    {
      fromR: 0, fromC: 1, toR: 2, toC: 2, weight: 65,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã Liên Hoàn', moveVn: 'Mã 2 tiến 3',
      notes: 'Hoàn thành cặp Mã bảo vệ Chốt trung lộ kiên cố'
    },
    {
      fromR: 3, fromC: 6, toR: 4, toC: 6, weight: 20,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã Tiến Tốt 7', moveVn: 'Binh 7 tiến 1',
      notes: 'Tiến chốt giải phóng lộ Mã 8'
    },
    {
      fromR: 3, fromC: 2, toR: 4, toC: 2, weight: 15,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã Tiến Tốt 3', moveVn: 'Binh 3 tiến 1',
      notes: 'Tiến chốt phong tỏa lộ đối thủ'
    }
  ],
  'r1eakae1r/9/1ch3hc1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1H2/9/RHEAKAE1R r': [
    {
      fromR: 9, fromC: 8, toR: 9, toC: 7, weight: 70,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Trực Xa', moveVn: 'Xe 1 bình 2',
      notes: 'Xuất Trực Xa lộ 2 uy hiếp cánh phải'
    },
    {
      fromR: 6, fromC: 2, toR: 5, toC: 2, weight: 20,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Thất Binh', moveVn: 'Binh 7 tiến 1',
      notes: 'Thúc Chốt 7 khống chế'
    },
    {
      fromR: 6, fromC: 6, toR: 5, toC: 6, weight: 10,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Tam Binh', moveVn: 'Binh 3 tiến 1',
      notes: 'Thúc Chốt 3 ghìm chân Mã 2'
    }
  ],
  'r1eakae1r/9/1ch3hc1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1H2/9/RHEAKAER1 b': [
    {
      fromR: 0, fromC: 8, toR: 0, toC: 7, weight: 65,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã Đối Trực Xa', moveVn: 'Xe 9 bình 8',
      notes: 'Xuất Trực Xa lộ 8 đối chọi sòng phẳng Xe Đỏ'
    },
    {
      fromR: 2, fromC: 7, toR: 4, toC: 7, weight: 20,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã Tuần Hà Pháo', moveVn: 'Pháo 8 tiến 2',
      notes: 'Pháo tuần hà phong tỏa tuyến bờ sông'
    },
    {
      fromR: 3, fromC: 6, toR: 4, toC: 6, weight: 15,
      openingId: 'binh-phong-ma', openingName: 'Bình Phong Mã Thất Binh', moveVn: 'Binh 7 tiến 1',
      notes: 'Tiến Chốt khai thông lộ Mã'
    }
  ],
  'r1eakaer1/9/1ch3hc1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1H2/9/RHEAKAER1 r': [
    {
      fromR: 6, fromC: 2, toR: 5, toC: 2, weight: 55,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Tiến Thất Binh Đối Bình Phong Mã', moveVn: 'Binh 7 tiến 1',
      notes: 'Biến thể kinh điển nhất của lịch sử cờ tướng'
    },
    {
      fromR: 6, fromC: 6, toR: 5, toC: 6, weight: 30,
      openingId: 'binh-phong-ma', openingName: 'Trung Pháo Tiến Tam Binh Đối Bình Phong Mã', moveVn: 'Binh 3 tiến 1',
      notes: 'Đòn đánh phong tỏa cánh phải đối thủ'
    },
    {
      fromR: 9, fromC: 7, toR: 3, toC: 7, weight: 15,
      openingId: 'binh-phong-ma', openingName: 'Quá Hà Xa (Xe qua sông)', moveVn: 'Xe 2 tiến 6',
      notes: 'Xe qua sông trực tiếp đe dọa hàng chốt'
    }
  ],
  'rheakaehr/9/1c2c4/p1p1p1p1p/9/9/P1P1P1P1P/1C2C4/9/RHEAKAEHR r': [
    {
      fromR: 9, fromC: 7, toR: 7, toC: 6, weight: 70,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Chính Cuộc', moveVn: 'Mã 2 tiến 3',
      notes: 'Lên Mã giữ chốt đầu vững chắc'
    },
    {
      fromR: 9, fromC: 8, toR: 9, toC: 7, weight: 20,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Trực Xa', moveVn: 'Xe 1 bình 2',
      notes: 'Xuất Xe trước tranh tiên'
    },
    {
      fromR: 6, fromC: 2, toR: 5, toC: 2, weight: 10,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Thất Binh', moveVn: 'Binh 7 tiến 1',
      notes: 'Tiến chốt thông đường Mã'
    }
  ],
  'rheakaehr/9/1c2c4/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1H2/9/RHEAKAE1R b': [
    {
      fromR: 0, fromC: 7, toR: 2, toC: 6, weight: 65,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Trực Xa Đối Hoành Xa', moveVn: 'Mã 8 tiến 7',
      notes: 'Lên Mã bảo vệ Chốt đầu sòng phẳng'
    },
    {
      fromR: 0, fromC: 8, toR: 1, toC: 8, weight: 25,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Hoành Xa', moveVn: 'Xe 9 tiến 1',
      notes: 'Hoành Xa cơ động chuyển cánh đánh úp'
    },
    {
      fromR: 0, fromC: 1, toR: 2, toC: 2, weight: 10,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Đơn Đề', moveVn: 'Mã 2 tiến 3',
      notes: 'Củng cố cánh trái'
    }
  ],
  'rheakae1r/9/1c2c1h1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1H2/9/RHEAKAE1R r': [
    {
      fromR: 9, fromC: 8, toR: 9, toC: 7, weight: 75,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Trực Xa Xuất Kích', moveVn: 'Xe 1 bình 2',
      notes: 'Chiếm cứ lộ 2 trọng yếu'
    },
    {
      fromR: 9, fromC: 1, toR: 7, toC: 2, weight: 25,
      openingId: 'thuan-phao', openingName: 'Thuận Pháo Lưỡng Mã', moveVn: 'Mã 8 tiến 7',
      notes: 'Lên đôi Mã giữ trung lộ'
    }
  ],
  'rheakaehr/9/4c2c1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C4/9/RHEAKAEHR r': [
    {
      fromR: 9, fromC: 7, toR: 7, toC: 6, weight: 65,
      openingId: 'nghich-phao', openingName: 'Nghịch Pháo Đối Công', moveVn: 'Mã 2 tiến 3',
      notes: 'Phát triển Mã giữ vững cứ điểm'
    },
    {
      fromR: 9, fromC: 8, toR: 9, toC: 7, weight: 25,
      openingId: 'nghich-phao', openingName: 'Nghịch Pháo Trực Xa', moveVn: 'Xe 1 bình 2',
      notes: 'Xuất Xe công phá cánh yếu của Nghịch Pháo'
    },
    {
      fromR: 6, fromC: 6, toR: 5, toC: 6, weight: 10,
      openingId: 'nghich-phao', openingName: 'Nghịch Pháo Tam Binh', moveVn: 'Binh 3 tiến 1',
      notes: 'Mở đường cho Mã nhảy'
    }
  ],
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/2P6/P3P1P1P/1C5C1/9/RHEAKAEHR b': [
    {
      fromR: 3, fromC: 6, toR: 4, toC: 6, weight: 45,
      openingId: 'tien-nhan-chi-lo', openingName: 'Đối Binh Cuộc', moveVn: 'Binh 7 tiến 1',
      notes: 'Ăn miếng trả miếng bằng thế Đối Binh Cuộc'
    },
    {
      fromR: 2, fromC: 1, toR: 2, toC: 4, weight: 30,
      openingId: 'tien-nhan-chi-lo', openingName: 'Tốt Để Pháo (Trung Pháo đối Tiên Nhân)', moveVn: 'Pháo 2 bình 5',
      notes: 'Vào Pháo đầu tấn công thẳng vào trung lộ'
    },
    {
      fromR: 0, fromC: 6, toR: 2, toC: 4, weight: 15,
      openingId: 'tien-nhan-chi-lo', openingName: 'Phi Tượng đối Tiên Nhân', moveVn: 'Tượng 3 tiến 5',
      notes: 'Thế cờ hòa nhã, củng cố hàng thủ'
    },
    {
      fromR: 0, fromC: 7, toR: 2, toC: 6, weight: 10,
      openingId: 'tien-nhan-chi-lo', openingName: 'Khởi Mã đối Tiên Nhân', moveVn: 'Mã 8 tiến 7',
      notes: 'Nhảy Mã bảo vệ Chốt trung tâm'
    }
  ],
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C2E2C1/9/RHEAKA1HR b': [
    {
      fromR: 2, fromC: 7, toR: 2, toC: 4, weight: 45,
      openingId: 'phi-tuong-cuoc', openingName: 'Tả Trung Pháo Phá Phi Tượng', moveVn: 'Pháo 8 bình 5',
      notes: 'Đòn đánh chủ động vào trung lộ thử thách phòng thủ Tượng'
    },
    {
      fromR: 3, fromC: 6, toR: 4, toC: 6, weight: 25,
      openingId: 'phi-tuong-cuoc', openingName: 'Tiến Binh Đối Phi Tượng', moveVn: 'Binh 7 tiến 1',
      notes: 'Tiến Chốt phát triển quân hài hòa'
    },
    {
      fromR: 0, fromC: 7, toR: 2, toC: 6, weight: 20,
      openingId: 'phi-tuong-cuoc', openingName: 'Khởi Mã Đối Phi Tượng', moveVn: 'Mã 8 tiến 7',
      notes: 'Phát triển quân cờ chắc chắn'
    },
    {
      fromR: 2, fromC: 7, toR: 2, toC: 3, weight: 10,
      openingId: 'phi-tuong-cuoc', openingName: 'Quá Cung Pháo Đối Phi Tượng', moveVn: 'Pháo 8 bình 4',
      notes: 'Dồn quân sang cánh phải'
    }
  ],
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C4H1C1/9/RHEAKAE1R b': [
    {
      fromR: 3, fromC: 6, toR: 4, toC: 6, weight: 40,
      openingId: 'khoi-ma-cuoc', openingName: 'Binh 7 tiến 1 Đối Khởi Mã', moveVn: 'Binh 7 tiến 1',
      notes: 'Hãm đường phát triển tiếp theo của Mã Đỏ'
    },
    {
      fromR: 2, fromC: 7, toR: 2, toC: 4, weight: 35,
      openingId: 'khoi-ma-cuoc', openingName: 'Trung Pháo Đối Khởi Mã', moveVn: 'Pháo 8 bình 5',
      notes: 'Giành quyền kiểm soát trung lộ'
    },
    {
      fromR: 0, fromC: 7, toR: 2, toC: 6, weight: 25,
      openingId: 'khoi-ma-cuoc', openingName: 'Đối Khởi Mã Cuộc', moveVn: 'Mã 8 tiến 7',
      notes: 'Hai bên cùng lên Mã so tài nội lực'
    }
  ],
  'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C3C3/9/RHEAKAEHR b': [
    {
      fromR: 2, fromC: 7, toR: 2, toC: 4, weight: 50,
      openingId: 'qua-cung-phao', openingName: 'Trung Pháo Phá Quá Cung Pháo', moveVn: 'Pháo 8 bình 5',
      notes: 'Đánh thẳng vào trung lộ đối thủ khi Pháo đã rời vị trí'
    },
    {
      fromR: 0, fromC: 7, toR: 2, toC: 6, weight: 30,
      openingId: 'qua-cung-phao', openingName: 'Khởi Mã Đối Quá Cung Pháo', moveVn: 'Mã 8 tiến 7',
      notes: 'Phát triển quân cờ vững vàng'
    },
    {
      fromR: 3, fromC: 6, toR: 4, toC: 6, weight: 20,
      openingId: 'qua-cung-phao', openingName: 'Tiến Binh Đối Quá Cung Pháo', moveVn: 'Binh 7 tiến 1',
      notes: 'Khai thông đường Mã'
    }
  ]
};

export interface DetectedOpening {
  info: OpeningInfo;
  variantName?: string;
  matchedPly: number;
}

export function detectOpening(
  moves: Array<{ fromR: number; fromC: number; toR: number; toC: number }>
): DetectedOpening | null {
  if (!moves || moves.length === 0) return null;

  const m1 = moves[0];
  const isRedCentralCannon =
    (m1.fromR === 7 && m1.fromC === 7 && m1.toR === 7 && m1.toC === 4) ||
    (m1.fromR === 7 && m1.fromC === 1 && m1.toR === 7 && m1.toC === 4);

  const isRedPawn =
    (m1.fromR === 6 && m1.fromC === 2 && m1.toR === 5 && m1.toC === 2) ||
    (m1.fromR === 6 && m1.fromC === 6 && m1.toR === 5 && m1.toC === 6);

  const isRedElephant =
    (m1.fromR === 9 && m1.fromC === 6 && m1.toR === 7 && m1.toC === 4) ||
    (m1.fromR === 9 && m1.fromC === 2 && m1.toR === 7 && m1.toC === 4);

  const isRedHorse =
    (m1.fromR === 9 && m1.fromC === 7 && m1.toR === 7 && m1.toC === 6) ||
    (m1.fromR === 9 && m1.fromC === 1 && m1.toR === 7 && m1.toC === 2);

  const isRedCrossCannon =
    (m1.fromR === 7 && m1.fromC === 7 && m1.toR === 7 && m1.toC === 5) ||
    (m1.fromR === 7 && m1.fromC === 1 && m1.toR === 7 && m1.toC === 3);

  const isRedCornerCannon =
    (m1.fromR === 7 && m1.fromC === 7 && m1.toR === 7 && m1.toC === 3) ||
    (m1.fromR === 7 && m1.fromC === 1 && m1.toR === 7 && m1.toC === 5);

  if (moves.length === 1) {
    if (isRedCentralCannon) return { info: OPENING_CATALOG['trung-phao'], matchedPly: 1 };
    if (isRedPawn) return { info: OPENING_CATALOG['tien-nhan-chi-lo'], matchedPly: 1 };
    if (isRedElephant) return { info: OPENING_CATALOG['phi-tuong-cuoc'], matchedPly: 1 };
    if (isRedHorse) return { info: OPENING_CATALOG['khoi-ma-cuoc'], matchedPly: 1 };
    if (isRedCrossCannon) return { info: OPENING_CATALOG['qua-cung-phao'], matchedPly: 1 };
    if (isRedCornerCannon) return { info: OPENING_CATALOG['si-giac-phao'], matchedPly: 1 };
  }

  if (moves.length >= 2) {
    const m2 = moves[1];
    if (isRedCentralCannon) {
      const isBlackHorse =
        (m2.fromR === 0 && m2.fromC === 7 && m2.toR === 2 && m2.toC === 6) ||
        (m2.fromR === 0 && m2.fromC === 1 && m2.toR === 2 && m2.toC === 2);

      const isBlackSameCannon = m2.fromR === 2 && m2.fromC === 7 && m2.toR === 2 && m2.toC === 4;
      const isBlackOppCannon = m2.fromR === 2 && m2.fromC === 1 && m2.toR === 2 && m2.toC === 4;

      if (isBlackHorse) {
        return {
          info: OPENING_CATALOG['binh-phong-ma'],
          variantName: 'Pháo Đầu Đối Bình Phong Mã',
          matchedPly: 2
        };
      }
      if (isBlackSameCannon) {
        return {
          info: OPENING_CATALOG['thuan-phao'],
          variantName: 'Thuận Pháo Trực Xa',
          matchedPly: 2
        };
      }
      if (isBlackOppCannon) {
        return {
          info: OPENING_CATALOG['nghich-phao'],
          variantName: 'Nghịch Pháo Đối Công',
          matchedPly: 2
        };
      }
      return { info: OPENING_CATALOG['trung-phao'], matchedPly: 2 };
    }

    if (isRedPawn) {
      const isBlackPawn =
        (m2.fromR === 3 && m2.fromC === 6 && m2.toR === 4 && m2.toC === 6) ||
        (m2.fromR === 3 && m2.fromC === 2 && m2.toR === 4 && m2.toC === 2);
      const isBlackCentralCannon =
        (m2.fromR === 2 && m2.fromC === 1 && m2.toR === 2 && m2.toC === 4) ||
        (m2.fromR === 2 && m2.fromC === 7 && m2.toR === 2 && m2.toC === 4);

      if (isBlackPawn) {
        return {
          info: OPENING_CATALOG['tien-nhan-chi-lo'],
          variantName: 'Tiên Nhân Chỉ Lộ Đối Binh Cuộc',
          matchedPly: 2
        };
      }
      if (isBlackCentralCannon) {
        return {
          info: OPENING_CATALOG['tien-nhan-chi-lo'],
          variantName: 'Tiên Nhân Chỉ Lộ Đối Tốt Để Pháo',
          matchedPly: 2
        };
      }
      return { info: OPENING_CATALOG['tien-nhan-chi-lo'], matchedPly: 2 };
    }

    if (isRedElephant) {
      return { info: OPENING_CATALOG['phi-tuong-cuoc'], matchedPly: 2 };
    }
    if (isRedHorse) {
      return { info: OPENING_CATALOG['khoi-ma-cuoc'], matchedPly: 2 };
    }
    if (isRedCrossCannon) {
      return { info: OPENING_CATALOG['qua-cung-phao'], matchedPly: 2 };
    }
  }

  return null;
}

export interface OpeningBookResult {
  move: Move;
  opening: OpeningInfo;
  variantName: string;
  notes?: string;
}

export function getOpeningBookMove(
  board: (string | null)[][],
  turn: PieceColor,
  difficulty: BotDifficulty = 'master',
  moveCount: number = 0
): OpeningBookResult | null {
  if (moveCount > 12) return null;

  if (difficulty === 'easy') {
    if (moveCount > 3 || Math.random() > 0.35) return null;
  } else if (difficulty === 'medium') {
    if (moveCount > 6 || Math.random() > 0.70) return null;
  } else if (difficulty === 'hard') {
    if (Math.random() > 0.90) return null;
  }

  const fen = boardToFen(board, turn);
  const candidates = OPENING_BOOK[fen];
  if (!candidates || candidates.length === 0) return null;

  let selected = candidates[0];
  if (candidates.length > 1) {
    if (difficulty === 'master' || difficulty === 'hard') {
      const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
      let rand = Math.random() * totalWeight;
      for (const c of candidates) {
        if (rand < c.weight) {
          selected = c;
          break;
        }
        rand -= c.weight;
      }
    } else {
      const idx = Math.floor(Math.random() * candidates.length);
      selected = candidates[idx];
    }
  }

  const info = OPENING_CATALOG[selected.openingId] || {
    id: selected.openingId,
    nameVn: selected.openingName,
    nameCn: '',
    tagline: '',
    description: '',
    principles: [],
    counters: '',
    difficultyToMaster: 'Trung bình'
  };

  const move: Move = {
    fromR: selected.fromR,
    fromC: selected.fromC,
    toR: selected.toR,
    toC: selected.toC,
    captured: board[selected.toR][selected.toC]
  };

  return {
    move,
    opening: info,
    variantName: selected.openingName,
    notes: selected.notes
  };
}
