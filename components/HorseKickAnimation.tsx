'use client';

import React, { useEffect, useRef } from 'react';
import { PieceColor } from '@/lib/xiangqi-types';

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
}

export function HorseKickAnimation({
  data,
  onImpact,
  onComplete
}: HorseKickAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    const flightDuration = 430;

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
      const count = 24;
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * 1.8;
        const speed = 2.2 + Math.random() * 4.5;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: 2.0 + Math.random() * 2.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.038 + Math.random() * 0.025
        });
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

      const kickAngle = Math.atan2(pTo.y - pFrom.y, pTo.x - pFrom.x);

      if (!hasSpawnedInitial) {
        hasSpawnedInitial = true;
        spawnHoofKickSparks(pTo.x, pTo.y, kickAngle);
        onImpactRef.current?.();
      }

      const rawT = Math.min(1.0, elapsed / flightDuration);

      // Expanding hoof impact rings at exact destination square (pTo) where the Horse lands
      if (rawT < 0.85) {
        const waveT = rawT / 0.85;
        const radius = 16 + waveT * 30;
        ctx.save();
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.9 * (1 - waveT)})`;
        ctx.lineWidth = 3.0 * (1 - waveT);
        ctx.beginPath();
        ctx.arc(pTo.x, pTo.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(254, 240, 138, ${0.65 * (1 - waveT)})`;
        ctx.beginPath();
        ctx.arc(pTo.x, pTo.y, 10 * (1 - waveT), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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

  // Position target ring at the exact square where the Horse jumps to (toR, toC)
  const targetDr = data.isFlipped ? 9 - data.toR : data.toR;
  const targetDc = data.isFlipped ? 8 - data.toC : data.toC;
  const targetLeftPct = ((25 + targetDc * 50) / 450) * 100;
  const targetTopPct = ((25 + targetDr * 50) / 500) * 100;

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
        className="absolute w-[9.6%] h-[8.64%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-60 flex items-center justify-center"
        style={{ left: `${targetLeftPct}%`, top: `${targetTopPct}%` }}
      >
        <div className="w-full h-full rounded-full border-2 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.9),inset_0_0_15px_rgba(245,158,11,0.7)] cannon-screen-pulse" />
      </div>
    </div>
  );
}
