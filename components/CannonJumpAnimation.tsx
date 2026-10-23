'use client';

import React, { useEffect, useRef } from 'react';
import { computeCurveTrajectory } from '@/lib/trajectory';

export interface CannonJumpData {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  screenR: number;
  screenC: number;
  screenPieceCode: string;
  targetPieceCode: string;
  isFlipped: boolean;
}

interface CannonJumpAnimationProps {
  data: CannonJumpData | null;
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
  type: 'spark' | 'shrapnel';
  trail?: { x: number; y: number }[];
}

export function CannonJumpAnimation({
  data,
  onImpact,
  onComplete
}: CannonJumpAnimationProps) {
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

    const trajectory = computeCurveTrajectory(
      data.fromR,
      data.fromC,
      data.toR,
      data.toC,
      data.isFlipped,
      'c',
      true
    );

    let animId: number;
    const startTime = performance.now();
    const flightDuration = Math.max(160, Math.min(300, trajectory.dist * 0.85)) + 50;
    const explosionDuration = 200;
    const totalDuration = flightDuration + explosionDuration;

    let hasImpacted = false;
    const particles: Particle[] = [];

    const getPos = (r: number, c: number, width: number, height: number) => {
      const dr = data.isFlipped ? 9 - r : r;
      const dc = data.isFlipped ? 8 - c : c;
      return {
        x: ((25 + dc * 50) / 450) * width,
        y: ((25 + dr * 50) / 500) * height
      };
    };

    const spawnExplosionShrapnel = (x: number, y: number) => {
      const colors = ['#fef08a', '#facc15', '#fb923c', '#f87171', '#ef4444', '#ffffff'];
      const count = 28;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const speed = 2.5 + Math.random() * 5.0;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.0 + Math.random() * 2.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.025 + Math.random() * 0.025,
          type: 'shrapnel',
          trail: []
        });
      }
    };

    const initMuzzleBlast = (x: number, y: number, targetX: number, targetY: number) => {
      const baseAngle = Math.atan2(targetY - y, targetX - x);
      for (let i = 0; i < 14; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * 0.8;
        const speed = 1.5 + Math.random() * 3.8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.8 + Math.random() * 2.2,
          color: '#fbbf24',
          alpha: 1,
          decay: 0.045 + Math.random() * 0.03,
          type: 'spark'
        });
      }
    };

    const render = (now: number) => {
      const elapsed = now - startTime;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const pFrom = getPos(data.fromR, data.fromC, width, height);
      const pTo = getPos(data.toR, data.toC, width, height);

      if (elapsed === now - startTime && particles.length === 0) {
        initMuzzleBlast(pFrom.x, pFrom.y, pTo.x, pTo.y);
      }

      const rawT = Math.min(1.0, elapsed / flightDuration);
      const pt = trajectory.getPoint(rawT);

      const projX = (pt.pctX / 100) * width;
      const projY = (pt.pctY / 100) * height;

      if (rawT >= 1.0 && !hasImpacted) {
        hasImpacted = true;
        spawnExplosionShrapnel(pTo.x, pTo.y);
        onImpactRef.current?.();
      }

      if (rawT < 1.0) {
        for (let i = 0; i < 2; i++) {
          const jitterX = (Math.random() - 0.5) * 4;
          const jitterY = (Math.random() - 0.5) * 4;
          particles.push({
            x: projX + jitterX,
            y: projY + jitterY,
            vx: (Math.random() - 0.5) * 1.2 - (pTo.x - pFrom.x) * 0.015,
            vy: (Math.random() - 0.5) * 1.2 - (pTo.y - pFrom.y) * 0.015 + 0.2,
            size: 1.5 + Math.random() * 2.2,
            color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
            alpha: 0.95,
            decay: 0.045 + Math.random() * 0.03,
            type: 'spark'
          });
        }
      }

      // Target circle at exact destination square (pTo) where the Cannon lands
      if (rawT < 1.0) {
        ctx.save();
        const ringPulse = (elapsed % 300) / 300;
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.8 * (1 - ringPulse)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pTo.x, pTo.y, 18 + ringPulse * 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
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
        } else if (p.type === 'shrapnel') {
          ctx.globalCompositeOperation = 'lighter';
          if (!p.trail) p.trail = [];
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 4) p.trail.shift();

          if (p.trail.length > 1) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let j = 1; j < p.trail.length; j++) {
              ctx.lineTo(p.trail[j].x, p.trail[j].y);
            }
            ctx.stroke();
          }

          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      if (rawT >= 1.0 && elapsed < totalDuration) {
        const impactProgress = (elapsed - flightDuration) / explosionDuration;
        const flashRadius = 35 * Math.sin(impactProgress * Math.PI);
        if (flashRadius > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const flashGrad = ctx.createRadialGradient(pTo.x, pTo.y, 0, pTo.x, pTo.y, flashRadius);
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * (1 - impactProgress)})`);
          flashGrad.addColorStop(0.3, `rgba(251, 191, 36, ${0.8 * (1 - impactProgress)})`);
          flashGrad.addColorStop(0.7, `rgba(239, 68, 68, ${0.5 * (1 - impactProgress)})`);
          flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(pTo.x, pTo.y, flashRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (elapsed < totalDuration || particles.length > 0) {
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

  // Position target ring at the exact square where the Cannon jumps to (toR, toC)
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
