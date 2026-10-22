'use client';

import React, { useEffect, useRef } from 'react';
import { PIECES, PieceColor } from '@/lib/xiangqi-types';

export interface HorseKickData {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  victimPieceCode: string;
  victimColor?: PieceColor;
  isFlipped: boolean;
  isLandscape?: boolean;
}

interface HorseKickAnimationProps {
  data: HorseKickData | null;
  onImpact?: () => void;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'smoke' | 'wind';
}

export function HorseKickAnimation({
  data,
  onImpact,
  onComplete
}: HorseKickAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pieceRef = useRef<HTMLDivElement | null>(null);
  const onImpactRef = useRef(onImpact);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onImpactRef.current = onImpact;
    onCompleteRef.current = onComplete;
  }, [onImpact, onComplete]);

  useEffect(() => {
    if (!data) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();
    const flightDuration = 420;

    const particles: Particle[] = [];

    const getPos = (r: number, c: number, width: number, height: number) => {
      const dr = data.isFlipped ? 9 - r : r;
      const dc = data.isFlipped ? 8 - c : c;
      return {
        x: ((25 + dc * 50) / 450) * width,
        y: ((25 + dr * 50) / 500) * height
      };
    };

    const spawnHoofKickSparks = (x: number, y: number, angle: number) => {
      const colors = ['#fef08a', '#facc15', '#f59e0b', '#ef4444', '#ffffff'];
      const count = 26;
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * 1.8;
        const speed = 2.5 + Math.random() * 5.0;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: 2.0 + Math.random() * 3.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.035 + Math.random() * 0.025,
          type: 'spark'
        });
      }

      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 2.0;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: 6 + Math.random() * 10,
          color: 'rgba(90, 70, 50, ',
          alpha: 0.7,
          decay: 0.032,
          type: 'smoke'
        });
      }
    };

    const getTrayTarget = (width: number, height: number) => {
      const isRedAtBottom = !data.isFlipped;
      const goesToTop = data.victimColor === (isRedAtBottom ? 'b' : 'r');

      if (data.isLandscape) {
        return {
          x: goesToTop ? -width * 0.08 : width * 1.08,
          y: height * 0.45
        };
      } else {
        return {
          x: width * (0.3 + Math.random() * 0.4),
          y: goesToTop ? -height * 0.08 : height * 1.08
        };
      }
    };

    let hasSpawnedInitial = false;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const pFrom = getPos(data.fromR, data.fromC, width, height);
      const pTo = getPos(data.toR, data.toC, width, height);
      const pTray = getTrayTarget(width, height);

      const kickAngle = Math.atan2(pTo.y - pFrom.y, pTo.x - pFrom.x);

      if (!hasSpawnedInitial) {
        hasSpawnedInitial = true;
        spawnHoofKickSparks(pTo.x, pTo.y, kickAngle);
        onImpactRef.current?.();
      }

      const rawT = Math.min(1.0, elapsed / flightDuration);
      const t = 1 - Math.pow(1 - rawT, 2.5);

      const currGroundX = pTo.x + (pTray.x - pTo.x) * t;
      const currGroundY = pTo.y + (pTray.y - pTo.y) * t;

      const arcFactor = 4 * t * (1 - t);
      const maxArcHeight = Math.min(width, height) * 0.22;
      const currHeight = arcFactor * maxArcHeight;

      const projX = currGroundX;
      const projY = currGroundY - currHeight;

      if (pieceRef.current) {
        const pctX = (projX / width) * 100;
        const pctY = (projY / height) * 100;
        const spinDeg = rawT * 920;
        const scale = (1.0 + arcFactor * 0.35) * (1 - rawT * 0.15);
        const opacity = Math.max(0, 1 - Math.pow(rawT, 4));

        pieceRef.current.style.left = `${pctX}%`;
        pieceRef.current.style.top = `${pctY}%`;
        pieceRef.current.style.transform = `translate(-50%, -50%) rotate(${spinDeg}deg) scale(${scale})`;
        pieceRef.current.style.opacity = `${opacity}`;
        pieceRef.current.style.boxShadow = `0 ${6 + arcFactor * 22}px ${12 + arcFactor * 28}px rgba(0,0,0,${0.4 + arcFactor * 0.35})`;
      }

      if (rawT < 1.0) {
        const shadowScale = 1 - arcFactor * 0.3;
        const shadowAlpha = 0.35 * (1 - arcFactor * 0.45);
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(currGroundX, currGroundY, 15 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (rawT < 0.35) {
        const waveT = rawT / 0.35;
        const radius = 16 + waveT * 32;
        ctx.save();
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.9 * (1 - waveT)})`;
        ctx.lineWidth = 3.0 * (1 - waveT);
        ctx.beginPath();
        ctx.arc(pTo.x, pTo.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(254, 240, 138, ${0.8 * (1 - waveT)})`;
        ctx.beginPath();
        ctx.arc(pTo.x, pTo.y, 8 * (1 - waveT), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (rawT < 0.85) {
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: projX + (Math.random() - 0.5) * 8,
            y: projY + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5 - (pTray.x - pTo.x) * 0.015,
            vy: (Math.random() - 0.5) * 1.5 - (pTray.y - pTo.y) * 0.015,
            size: 1.5 + Math.random() * 2.5,
            color: Math.random() > 0.4 ? '#fbbf24' : '#f59e0b',
            alpha: 0.9,
            decay: 0.045,
            type: 'spark'
          });
        }
      }

      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === 'spark') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'smoke') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = `${p.color}${p.alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha) * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      if (elapsed < flightDuration || particles.length > 0) {
        animId = requestAnimationFrame(render);
      } else {
        onCompleteRef.current?.();
      }
    };

    const updateCanvasSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    updateCanvasSize();
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [data]);

  if (!data) return null;

  const pieceInfo = PIECES[data.victimPieceCode];
  const isRed = pieceInfo ? pieceInfo.color === 'r' : false;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-55 overflow-visible"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />

      <div
        ref={pieceRef}
        className={`piece absolute z-60 pointer-events-none w-[9.6%] h-[8.64%] rounded-full flex items-center justify-center select-none border-2 bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#ffffff_75%,#f8fafc_92%,#f1f5f9_100%)] border-white ${
          isRed ? 'text-[#dc2626]' : 'text-[#0f172a]'
        }`}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(1)',
          background: 'radial-gradient(circle at 32% 28%, #ffffff 0%, #ffffff 75%, #f8fafc 92%, #f1f5f9 100%)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.45), inset 0 2px 4px #ffffff'
        }}
      >
        <div className="absolute inset-[3px] rounded-full border border-slate-300/50 pointer-events-none" />
        <span
          className="font-piece font-bold select-none pointer-events-none text-[18px] sm:text-[24px] md:text-[30px] tracking-tight leading-none"
          style={{
            fontFamily: '"Iansui", "Ma Shan Zheng", "Zhi Mang Xing", "LXGW WenKai TC", "STKaiti", "KaiTi", "Kaiti SC", "BiauKai", "DFKai-SB", "ZCOOL XiaoWei", "Noto Serif SC", cursive, serif',
            textShadow: isRed
              ? '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(185,28,28,0.65)'
              : '0 1px 1.5px rgba(255,255,255,1), 0 -1px 2px rgba(0,0,0,0.7)'
          }}
        >
          {pieceInfo ? pieceInfo.nameCn : '卒'}
        </span>
      </div>
    </div>
  );
}
