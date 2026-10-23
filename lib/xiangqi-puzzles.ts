import { Move, PieceColor } from './xiangqi-types';

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface PuzzleStep {
  playerMove: Move;
  opponentReply?: Move;
  hint: string;
  explanation: string;
}

export interface XiangqiPuzzle {
  id: string;
  title: string;
  subtitle: string;
  lore: string;
  difficulty: PuzzleDifficulty;
  difficultyLabel: string;
  maxMoves: number;
  playerColor: PieceColor;
  initialBoard: (string | null)[][];
  steps: PuzzleStep[];
}

export interface PuzzleProgressItem {
  puzzleId: string;
  solved: boolean;
  stars: 1 | 2 | 3;
  bestMoves: number;
  updatedAt: string;
}

const PUZZLE_STORAGE_KEY = 'xiangqi_puzzle_progress_v1';

function createEmptyBoard(): (string | null)[][] {
  return Array.from({ length: 10 }, () => Array(9).fill(null));
}

function buildBoard(placements: Record<string, string>): (string | null)[][] {
  const b = createEmptyBoard();
  for (const [coord, pieceCode] of Object.entries(placements)) {
    const [rStr, cStr] = coord.split(',');
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);
    if (r >= 0 && r < 10 && c >= 0 && c < 9) {
      b[r][c] = pieceCode;
    }
  }
  return b;
}

export const XIANGQI_PUZZLES: XiangqiPuzzle[] = [
  {
    id: 'song-xa-thac-sat',
    title: 'Song Xa Thác Sát',
    subtitle: 'Đỏ đi tiên thắng trong 2 nước',
    lore: 'Sát pháp cơ bản nhưng uy lực bậc nhất: hai Xe luân phiên siết chặt hàng Cửu cung khiến Tướng đối phương không kịp trở tay.',
    difficulty: 'easy',
    difficultyLabel: 'Nhập Môn',
    maxMoves: 2,
    playerColor: 'r',
    initialBoard: buildBoard({
      '1,4': 'b_k',
      '0,6': 'b_e',
      '8,3': 'b_r',
      '9,4': 'r_k',
      '9,3': 'r_a',
      '9,5': 'r_a',
      '3,4': 'r_p',
      '3,1': 'r_r',
      '2,0': 'r_r'
    }),
    steps: [
      {
        playerMove: { fromR: 3, fromC: 1, toR: 1, toC: 1 },
        opponentReply: { fromR: 1, fromC: 4, toR: 0, toC: 4 },
        hint: 'Dùng Xe lộ 8 tấn chiếu ở hàng 1, ép Tướng Đen phải thoái về hàng đáy.',
        explanation: 'Xe 8 tấn 2 chiếu tướng! Do Chốt Đỏ ở (3,4) khóa đường tiến nên Tướng Đen buộc phải thoái về (0,4).'
      },
      {
        playerMove: { fromR: 2, fromC: 0, toR: 0, toC: 0 },
        hint: 'Tấn Xe lộ 9 xuống thẳng hàng đáy để kết liễu.',
        explanation: 'Xe 9 tấn 2 chiếu bí! Hai Xe Đỏ khóa chặt hàng 0 và hàng 1 tạo thành thế Song Xa Thác Sát.'
      }
    ]
  },
  {
    id: 'ma-hau-phao-kinh-dien',
    title: 'Mã Hậu Pháo Kinh Điển',
    subtitle: 'Đỏ đi tiên thắng trong 2 nước',
    lore: 'Sự phối hợp kinh điển giữa Mã và Pháo: Mã vừa trực tiếp chiếu rút vừa kiêm nhiệm làm ngòi vững chắc cho Pháo kết liễu.',
    difficulty: 'easy',
    difficultyLabel: 'Nhập Môn',
    maxMoves: 2,
    playerColor: 'r',
    initialBoard: buildBoard({
      '0,4': 'b_k',
      '0,5': 'b_a',
      '1,4': 'b_a',
      '0,6': 'b_e',
      '8,7': 'b_r',
      '9,4': 'r_k',
      '1,0': 'r_r',
      '4,2': 'r_h',
      '5,0': 'r_c'
    }),
    steps: [
      {
        playerMove: { fromR: 4, fromC: 2, toR: 2, toC: 3 },
        opponentReply: { fromR: 0, fromC: 4, toR: 0, toC: 3 },
        hint: 'Nhảy Mã vào lộ 6 (hàng 2, cột 3) để chiếu Tướng Đen.',
        explanation: 'Mã 7 tấn 6 chiếu tướng! Tướng Đen chỉ có duy nhất một đường bình sang lộ 4.'
      },
      {
        playerMove: { fromR: 5, fromC: 0, toR: 5, toC: 3 },
        hint: 'Bình Pháo vào sau lưng Mã để lập thế Mã Hậu Pháo.',
        explanation: 'Pháo 9 bình 6 chiếu bí! Mã khóa lộ 5, Xe Đỏ khóa hàng 1, Pháo mượn ngòi Mã kết liễu hoàn hảo.'
      }
    ]
  },
  {
    id: 'phao-trung-sat-cuc',
    title: 'Trùng Pháo Sát Cục',
    subtitle: 'Đỏ đi tiên thắng trong 2 nước',
    lore: 'Khi hai khẩu Pháo cùng trấn giữ một đường tuyến, mọi nỗ lực dùng Sĩ Tượng che chắn đều trở thành ngòi nổ phản chủ.',
    difficulty: 'easy',
    difficultyLabel: 'Nhập Môn',
    maxMoves: 2,
    playerColor: 'r',
    initialBoard: buildBoard({
      '0,4': 'b_k',
      '0,3': 'b_a',
      '0,5': 'b_a',
      '2,4': 'b_e',
      '8,2': 'b_r',
      '9,3': 'r_k',
      '1,8': 'r_r',
      '2,0': 'r_c',
      '3,1': 'r_c'
    }),
    steps: [
      {
        playerMove: { fromR: 2, fromC: 0, toR: 0, toC: 0 },
        opponentReply: { fromR: 0, fromC: 3, toR: 1, toC: 4 },
        hint: 'Tấn Pháo lộ 9 xuống đáy chiếu tướng qua ngòi Sĩ Đen.',
        explanation: 'Pháo 9 tấn 2 chiếu tướng! Xe Đỏ khóa hàng 1 nên Đen buộc phải lên Sĩ 4 tấn 5 để tháo ngòi.'
      },
      {
        playerMove: { fromR: 3, fromC: 1, toR: 0, toC: 1 },
        hint: 'Tấn tiếp Pháo thứ hai xuống hàng đáy để lập Trùng Pháo.',
        explanation: 'Pháo 8 tấn 3 lập Trùng Pháo chiếu bí! Dù Đen có thoái Sĩ về che cũng vẫn bị khẩu Pháo phía trong bắn hạ.'
      }
    ]
  },
  {
    id: 'thiet-mon-thuyen',
    title: 'Thiết Môn Thuyên (Khóa Chốt Cửa Thành)',
    subtitle: 'Đỏ đi tiên thắng trong 2 nước',
    lore: 'Mượn uy lực mặt Tướng Đỏ ghim chặt Sĩ tâm của địch, sau đó phế Xe công phá sườn cung như đóng chốt sắt khóa cửa thành.',
    difficulty: 'medium',
    difficultyLabel: 'Trung Cấp',
    maxMoves: 2,
    playerColor: 'r',
    initialBoard: buildBoard({
      '0,4': 'b_k',
      '1,4': 'b_a',
      '0,5': 'b_a',
      '0,1': 'b_r',
      '8,7': 'b_c',
      '9,4': 'r_k',
      '2,2': 'r_h',
      '3,3': 'r_r',
      '6,3': 'r_r'
    }),
    steps: [
      {
        playerMove: { fromR: 3, fromC: 3, toR: 0, toC: 3 },
        opponentReply: { fromR: 0, fromC: 1, toR: 0, toC: 3 },
        hint: 'Thí Xe đầu tiên đâm thẳng vào cửa cung (0,3) chiếu tướng.',
        explanation: 'Xe 6 tấn 3 chiếu tướng! Sĩ Đen ở (1,4) bị ghim bởi mặt Tướng Đỏ, Tướng Đen không ăn được vì có Mã giữ nên Xe Đen buộc phải ăn vào.'
      },
      {
        playerMove: { fromR: 6, fromC: 3, toR: 0, toC: 3 },
        hint: 'Dùng Xe sau chém thẳng Xe Đen tại cửa cung.',
        explanation: 'Xe 6 tấn 6 chiếu bí! Chốt cửa thành đã đóng sập, Tướng Đen hoàn toàn bất động.'
      }
    ]
  },
  {
    id: 'don-dao-pho-hoi',
    title: 'Đơn Đao Phó Hội',
    subtitle: 'Đỏ đi tiên thắng trong 2 nước',
    lore: 'Lấy điển tích Quan Vũ một đao tới hội: một Xe đơn độc thẳng tiến chém Sĩ tâm giữa vòng vây nhờ mặt Tướng Đỏ trợ lực từ xa.',
    difficulty: 'medium',
    difficultyLabel: 'Trung Cấp',
    maxMoves: 2,
    playerColor: 'r',
    initialBoard: buildBoard({
      '0,4': 'b_k',
      '1,4': 'b_a',
      '0,5': 'b_a',
      '8,7': 'b_r',
      '9,4': 'r_k',
      '3,4': 'r_r',
      '2,3': 'r_p',
      '6,1': 'r_c'
    }),
    steps: [
      {
        playerMove: { fromR: 3, fromC: 4, toR: 1, toC: 4 },
        opponentReply: { fromR: 0, fromC: 4, toR: 0, toC: 3 },
        hint: 'Dùng Xe chém thẳng Sĩ tâm (1,4) chiếu tướng.',
        explanation: 'Xe 5 tấn 2 chém Sĩ chiếu tướng! Nhờ Tướng Đỏ ở lộ 5 bảo vệ từ xa, Tướng Đen buộc phải chạy sang (0,3).'
      },
      {
        playerMove: { fromR: 1, fromC: 4, toR: 0, toC: 4 },
        hint: 'Tấn Xe lên hàng đáy hoặc bình Pháo sang lộ 6 để chiếu bí.',
        explanation: 'Tuyệt sát! Chốt Đỏ khóa đường thoái (1,3), Xe Đỏ cùng mặt Tướng khóa chặt Cửu cung.'
      }
    ]
  },
  {
    id: 'thien-dia-phao-sat-phap',
    title: 'Thiên Địa Pháo Sát Pháp',
    subtitle: 'Đỏ đi tiên thắng trong 2 nước',
    lore: 'Một khẩu Thiên Pháo trấn giữ đường đáy, một khẩu Địa Pháo đóng chặt trung lộ khiến cặp Sĩ của đối phương tiến thoái lưỡng nan.',
    difficulty: 'medium',
    difficultyLabel: 'Trung Cấp',
    maxMoves: 2,
    playerColor: 'r',
    initialBoard: buildBoard({
      '0,4': 'b_k',
      '0,3': 'b_a',
      '0,5': 'b_a',
      '2,3': 'b_h',
      '2,5': 'b_h',
      '3,5': 'b_p',
      '9,3': 'r_k',
      '1,3': 'r_p',
      '2,0': 'r_c',
      '7,1': 'r_c'
    }),
    steps: [
      {
        playerMove: { fromR: 2, fromC: 0, toR: 0, toC: 0 },
        opponentReply: { fromR: 0, fromC: 3, toR: 1, toC: 4 },
        hint: 'Tấn Pháo biên xuống hàng đáy lập Thiên Pháo chiếu tướng.',
        explanation: 'Pháo 9 tấn 2 chiếu tướng! Tướng Đen không thể lên (1,4) do có Chốt Đỏ nên buộc phải lên Sĩ 4 tấn 5 tháo ngòi.'
      },
      {
        playerMove: { fromR: 7, fromC: 1, toR: 7, toC: 4 },
        hint: 'Bình Pháo còn lại vào trung lộ để hoàn thành thế Thiên Địa Pháo.',
        explanation: 'Pháo 8 bình 5 chiếu bí! Sĩ tâm của Đen không thể thoái về (0,3) vì Thiên Pháo ở hàng đáy đã chực chờ.'
      }
    ]
  },
  {
    id: 'khong-minh-ta-tien',
    title: 'Khổng Minh Tá Tiễn (Mượn Tên Đánh Tướng)',
    subtitle: 'Đỏ đi tiên thắng trong 3 nước',
    lore: 'Thí Xe dụ Xe địch lùi về hàng đáy làm ngòi cho Pháo, sau đó điều Pháo liên hoàn ép địch tự rơi vào bẫy tử thần.',
    difficulty: 'hard',
    difficultyLabel: 'Cao Thủ',
    maxMoves: 3,
    playerColor: 'r',
    initialBoard: buildBoard({
      '0,4': 'b_k',
      '1,4': 'b_a',
      '0,5': 'b_a',
      '1,2': 'b_r',
      '2,6': 'b_e',
      '9,4': 'r_k',
      '3,2': 'r_r',
      '1,3': 'r_p',
      '2,0': 'r_c',
      '4,1': 'r_c'
    }),
    steps: [
      {
        playerMove: { fromR: 3, fromC: 2, toR: 0, toC: 2 },
        opponentReply: { fromR: 1, fromC: 2, toR: 0, toC: 2 },
        hint: 'Thí Xe tấn thẳng xuống đáy (0,2) chiếu tướng để dụ Xe Đen về hàng đáy.',
        explanation: 'Xe 7 tấn 3 chiếu tướng! Do Chốt Đỏ khóa (0,3), Xe Đen buộc phải thoái về (0,2) ăn Xe Đỏ.'
      },
      {
        playerMove: { fromR: 2, fromC: 0, toR: 0, toC: 0 },
        opponentReply: { fromR: 0, fromC: 2, toR: 1, toC: 2 },
        hint: 'Tấn Pháo lộ 9 xuống đáy, mượn chính Xe Đen làm ngòi chiếu tướng.',
        explanation: 'Khổng Minh Tá Tiễn! Pháo 9 tấn 2 mượn Xe Đen làm ngòi, ép Xe Đen phải rời bỏ hàng đáy.'
      },
      {
        playerMove: { fromR: 4, fromC: 1, toR: 0, toC: 1 },
        hint: 'Tấn Pháo lộ 8 xuống hàng đáy lập Trùng Pháo kết liễu.',
        explanation: 'Pháo 8 tấn 4 chiếu bí! Chốt Đỏ khóa (0,3), cặp Trùng Pháo phong tỏa hoàn toàn hàng đáy.'
      }
    ]
  },
  {
    id: 'don-ma-cam-vuong',
    title: 'Đơn Mã Cầm Vương',
    subtitle: 'Đỏ đi tiên thắng trong 3 nước',
    lore: 'Tuyệt kỹ tàn cuộc giang hồ: phế Xe phá Sĩ dẫn Tướng địch xuất cung, sau đó dùng một Mã một Tốt khóa chặt mọi lối thoát.',
    difficulty: 'hard',
    difficultyLabel: 'Cao Thủ',
    maxMoves: 3,
    playerColor: 'r',
    initialBoard: buildBoard({
      '1,3': 'b_k',
      '0,3': 'b_a',
      '0,6': 'b_e',
      '8,5': 'b_r',
      '9,4': 'r_k',
      '0,1': 'r_r',
      '3,0': 'r_h',
      '2,2': 'r_p'
    }),
    steps: [
      {
        playerMove: { fromR: 0, fromC: 1, toR: 0, toC: 3 },
        opponentReply: { fromR: 1, fromC: 3, toR: 0, toC: 3 },
        hint: 'Phế Xe chém Sĩ Đen tại (0,3) để dẫn dụ Tướng Đen bước lên.',
        explanation: 'Xe 8 bình 6 phế Xe diệt Sĩ! Tướng Đen không còn nước nào khác ngoài việc ăn Xe tại (0,3).'
      },
      {
        playerMove: { fromR: 3, fromC: 0, toR: 1, toC: 1 },
        opponentReply: { fromR: 0, fromC: 3, toR: 1, toC: 3 },
        hint: 'Nhảy Mã 9 tấn 8 vào (1,1) chiếu tướng.',
        explanation: 'Mã 9 tấn 8 chiếu tướng! Tướng Đỏ giữ lộ 5 nên Tướng Đen buộc phải thoái về (1,3).'
      },
      {
        playerMove: { fromR: 2, fromC: 2, toR: 2, toC: 3 },
        hint: 'Bình Chốt vào (2,3) dưới sự yểm trợ của Mã để chiếu bí.',
        explanation: 'Đơn Mã Cầm Vương! Chốt 7 bình 6 chiếu bí: Mã ở (1,1) vừa bảo vệ Chốt vừa khóa (0,3), mặt Tướng Đỏ khóa lộ 5.'
      }
    ]
  },
  {
    id: 'nhi-nhap-cung',
    title: 'Phế Xa Phá Trận (Song Kỵ Phá Cung)',
    subtitle: 'Đỏ đi tiên thắng trong 3 nước',
    lore: 'Khi Xe Đen canh giữ ngang lưng Cửu cung, Đỏ quyết đoán thí Xe mở đường cho Chốt áp sát rồi tung đòn Xe cắm đáy tuyệt sát.',
    difficulty: 'hard',
    difficultyLabel: 'Cao Thủ',
    maxMoves: 3,
    playerColor: 'r',
    initialBoard: buildBoard({
      '1,3': 'b_k',
      '1,4': 'b_a',
      '0,4': 'b_a',
      '2,0': 'b_r',
      '9,4': 'r_k',
      '4,3': 'r_r',
      '2,2': 'r_p',
      '4,2': 'r_h',
      '3,1': 'r_r'
    }),
    steps: [
      {
        playerMove: { fromR: 4, fromC: 3, toR: 2, toC: 3 },
        opponentReply: { fromR: 2, fromC: 0, toR: 2, toC: 3 },
        hint: 'Tấn Xe lộ 6 lên (2,3) chiếu tướng, ép Xe Đen phải đổi quân.',
        explanation: 'Xe 6 tấn 2 chiếu tướng! Do Xe Đỏ kiểm soát dọc lộ 4, Xe Đen buộc phải bình vào ăn Xe Đỏ.'
      },
      {
        playerMove: { fromR: 2, fromC: 2, toR: 2, toC: 3 },
        opponentReply: { fromR: 1, fromC: 3, toR: 0, toC: 3 },
        hint: 'Bình Chốt ăn lại Xe Đen và tiếp tục chiếu tướng.',
        explanation: 'Chốt 7 bình 6 ăn Xe chiếu tướng! Chốt được Mã Đỏ bảo vệ nên Tướng Đen buộc phải thoái về (0,3).'
      },
      {
        playerMove: { fromR: 3, fromC: 1, toR: 0, toC: 1 },
        hint: 'Tấn Xe lộ 8 xuống thẳng hàng đáy chiếu bí.',
        explanation: 'Xe 8 tấn 3 chiếu bí! Chốt Đỏ khóa (1,3), Sĩ Đen tự chặn (0,4), Tướng Đen hết đường lui.'
      }
    ]
  },
  {
    id: 'that-tinh-tu-hoi',
    title: 'Thất Tinh Tụ Hội (Giang Hồ Đệ Nhất Cục)',
    subtitle: 'Đỏ đi tiên thắng trong 3 nước',
    lore: 'Lấy cảm hứng từ danh cục đứng đầu Tứ Đại Danh Cục giang hồ: mỗi bên có đúng 7 quân cờ (Thất Tinh), Đen đang dọa sát ngay lập tức ở hàng đáy nên Đỏ phải chiếu liên hoàn không sai một nhịp.',
    difficulty: 'master',
    difficultyLabel: 'Danh Cục',
    maxMoves: 3,
    playerColor: 'r',
    initialBoard: buildBoard({
      '0,4': 'b_k',
      '0,3': 'b_a',
      '1,4': 'b_a',
      '0,2': 'b_e',
      '1,3': 'b_r',
      '8,3': 'b_p',
      '8,5': 'b_p',
      '9,4': 'r_k',
      '3,4': 'r_r',
      '4,1': 'r_r',
      '0,0': 'r_c',
      '1,5': 'r_p',
      '3,6': 'r_p',
      '9,2': 'r_e'
    }),
    steps: [
      {
        playerMove: { fromR: 3, fromC: 4, toR: 1, toC: 4 },
        opponentReply: { fromR: 1, fromC: 3, toR: 1, toC: 4 },
        hint: 'Phế Xe trung lộ chém thẳng Sĩ tâm (1,4) chiếu tướng!',
        explanation: 'Xe 5 tấn 2 phế Xe chém Sĩ tâm! Sĩ Đen ở (0,3) bị Pháo Đỏ ghim qua ngòi Tượng nên Xe Đen buộc phải ăn sang (1,4).'
      },
      {
        playerMove: { fromR: 1, fromC: 5, toR: 1, toC: 4 },
        opponentReply: { fromR: 0, fromC: 4, toR: 0, toC: 5 },
        hint: 'Dùng Chốt lộ 4 bình vào ăn Xe Đen tại tâm cung để tiếp tục chiếu.',
        explanation: 'Chốt 4 bình 5 ăn Xe chiếu tướng! Chốt được mặt Tướng Đỏ bảo vệ nên Tướng Đen buộc phải xuất cung sang (0,5).'
      },
      {
        playerMove: { fromR: 4, fromC: 1, toR: 4, toC: 5 },
        hint: 'Bình Xe lộ 8 sang lộ 4 (hàng 4, cột 5) để chiếu bí Tướng Đen.',
        explanation: 'Tuyệt sát Thất Tinh Tụ Hội! Xe 8 bình 4 chiếu bí, Chốt tâm cung khóa chặt hai ô (0,4) và (1,5).'
      }
    ]
  }
];

export type PuzzleProgressMap = Record<string, PuzzleProgressItem>;

export function getPuzzleProgressMap(): PuzzleProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PUZZLE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function savePuzzleProgressItem(
  puzzleId: string,
  stars: 1 | 2 | 3,
  movesUsed: number = 1
): PuzzleProgressMap {
  const current = getPuzzleProgressMap();
  const existing = current[puzzleId];
  const bestStars = existing ? (Math.max(existing.stars, stars) as 1 | 2 | 3) : stars;
  const bestMoves = existing ? Math.min(existing.bestMoves, movesUsed) : movesUsed;

  const updated: Record<string, PuzzleProgressItem> = {
    ...current,
    [puzzleId]: {
      puzzleId,
      solved: true,
      stars: bestStars,
      bestMoves,
      updatedAt: new Date().toISOString()
    }
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PUZZLE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }
  return updated;
}

export function isSameMove(a: Move, b: Move): boolean {
  return a.fromR === b.fromR && a.fromC === b.fromC && a.toR === b.toR && a.toC === b.toC;
}
