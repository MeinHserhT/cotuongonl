export interface CurvePoint {
  pctX: number;
  pctY: number;
  groundPctX: number;
  groundPctY: number;
  lift: number;
  scale: number;
  shadowBlur: number;
  shadowOffsetY: number;
}

export interface CurveTrajectory {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  midX: number;
  midY: number;
  ctrlX: number;
  ctrlY: number;
  dist: number;
  hPeak: number;
  pathD: string;
  getPoint: (t: number) => CurvePoint;
}

export function computeCurveTrajectory(
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  isFlipped: boolean,
  pieceType?: string,
  isCapture?: boolean
): CurveTrajectory {
  const dr0 = isFlipped ? 9 - fromR : fromR;
  const dc0 = isFlipped ? 8 - fromC : fromC;
  const dr1 = isFlipped ? 9 - toR : toR;
  const dc1 = isFlipped ? 8 - toC : toC;

  const startX = 25 + dc0 * 50;
  const startY = 25 + dr0 * 50;
  const endX = 25 + dc1 * 50;
  const endY = 25 + dr1 * 50;

  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // 3D Altitude peak (Z-lift simulated via Y offset and scale)
  // Cannon capturing (Pháo nhảy qua ngòi) or capture jumps have higher arching vaults
  const isCannonJump = pieceType === 'c' && isCapture;
  const isHorseLeap = pieceType === 'h';
  const basePeak = isCannonJump ? 52 : isCapture ? 42 : isHorseLeap ? 38 : 30;
  const hPeak = Math.min(68, Math.max(26, basePeak + dist * 0.12));

  // Perpendicular unit normal vector for sweeping lateral arc (bay vòng cung)
  let normalX = 0;
  let normalY = 0;
  if (dist > 1) {
    normalX = -dy / dist;
    normalY = dx / dist;
  }

  // Choose arc curve direction:
  // For Horse: bow along its L-knee; for others: natural smooth arc
  let curveDir = 1;
  if (isHorseLeap) {
    const rowDiff = toR - fromR;
    const colDiff = toC - fromC;
    if (Math.abs(rowDiff) === 2) {
      curveDir = colDiff > 0 ? 1 : -1;
    } else {
      curveDir = rowDiff > 0 ? 1 : -1;
    }
  } else {
    curveDir = (fromR + fromC) % 2 === 0 ? 1 : -1;
  }

  // Lateral arc bow amount
  const lateralBow = Math.min(26, Math.max(12, dist * 0.10)) * curveDir;

  const ctrlX = midX + normalX * lateralBow;
  const ctrlY = midY + normalY * lateralBow - hPeak;
  const pathD = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

  return {
    startX,
    startY,
    endX,
    endY,
    midX,
    midY,
    ctrlX,
    ctrlY,
    dist,
    hPeak,
    pathD,
    getPoint: (t: number) => {
      // Parabolic 3D lift curve (0 at start, 1.0 at apex, 0 at landing)
      const lift = 4 * t * (1 - t);

      // Ground plane coordinates (flat on board)
      const groundX = startX + dx * t;
      const groundY = startY + dy * t;

      // 3D Arc coordinates: curves laterally and lifts upward (-Y)
      const curX = groundX + normalX * lateralBow * lift;
      const curY = groundY + normalY * lateralBow * lift - hPeak * lift;

      // Dynamic 3D scale: piece expands as it nears camera at apex
      const scale = 1.0 + (isCannonJump ? 0.32 : isCapture ? 0.26 : 0.22) * lift;

      const shadowBlur = 3 + 12 * lift;
      const shadowOffsetY = 4 + 16 * lift;

      return {
        pctX: (curX / 450) * 100,
        pctY: (curY / 500) * 100,
        groundPctX: (groundX / 450) * 100,
        groundPctY: (groundY / 500) * 100,
        lift,
        scale,
        shadowBlur,
        shadowOffsetY
      };
    }
  };
}

export function computeStraightTrajectory(
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  isFlipped: boolean
): CurveTrajectory {
  const dr0 = isFlipped ? 9 - fromR : fromR;
  const dc0 = isFlipped ? 8 - fromC : fromC;
  const dr1 = isFlipped ? 9 - toR : toR;
  const dc1 = isFlipped ? 8 - toC : toC;

  const startX = 25 + dc0 * 50;
  const startY = 25 + dr0 * 50;
  const endX = 25 + dc1 * 50;
  const endY = 25 + dr1 * 50;

  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const pathD = `M ${startX} ${startY} L ${endX} ${endY}`;

  return {
    startX,
    startY,
    endX,
    endY,
    midX,
    midY,
    ctrlX: midX,
    ctrlY: midY,
    dist,
    hPeak: 0,
    pathD,
    getPoint: (t: number) => {
      const curX = startX + dx * t;
      const curY = startY + dy * t;
      return {
        pctX: (curX / 450) * 100,
        pctY: (curY / 500) * 100,
        groundPctX: (curX / 450) * 100,
        groundPctY: (curY / 500) * 100,
        lift: 0,
        scale: 1,
        shadowBlur: 3,
        shadowOffsetY: 4
      };
    }
  };
}

/**
 * Tìm vị trí quân Ngòi (Screen piece) giữa quân Pháo và quân mục tiêu bị ăn
 */
export function findCannonScreen(
  board: (string | null)[][],
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): { r: number; c: number; pieceCode: string } | null {
  if (fromR === toR) {
    const minC = Math.min(fromC, toC);
    const maxC = Math.max(fromC, toC);
    for (let c = minC + 1; c < maxC; c++) {
      const code = board[fromR][c];
      if (code) return { r: fromR, c, pieceCode: code };
    }
  } else if (fromC === toC) {
    const minR = Math.min(fromR, toR);
    const maxR = Math.max(fromR, toR);
    for (let r = minR + 1; r < maxR; r++) {
      const code = board[r][fromC];
      if (code) return { r, c: fromC, pieceCode: code };
    }
  }
  return null;
}
