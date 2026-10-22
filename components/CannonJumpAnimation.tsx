'use client';

import React, { useEffect, useRef } from 'react';

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
  type: 'spark' | 'smoke' | 'shrapnel';
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

    let animId: number;
    const startTime = performance.now();
    const flightDuration = 340;
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
      const count = 32;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 2.5 + Math.random() * 5.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.2 + Math.random() * 3.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025,
          type: 'shrapnel',
          trail: []
        });
      }

      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 2.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 8 + Math.random() * 14,
          color: Math.random() > 0.5 ? 'rgba(80, 50, 40, ' : 'rgba(120, 60, 30, ',
          alpha: 0.85,
          decay: 0.03 + Math.random() * 0.02,
          type: 'smoke'
        });
      }
    };

    const initMuzzleBlast = (x: number, y: number, targetX: number, targetY: number) => {
      const baseAngle = Math.atan2(targetY - y, targetX - x);
      for (let i = 0; i < 16; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * 0.9;
        const speed = 1.5 + Math.random() * 4.0;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.8 + Math.random() * 2.5,
          color: '#fbbf24',
          alpha: 1,
          decay: 0.04 + Math.random() * 0.03,
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
      const pScreen = getPos(data.screenR, data.screenC, width, height);

      if (elapsed === now - startTime && particles.length === 0) {
        initMuzzleBlast(pFrom.x, pFrom.y, pTo.x, pTo.y);
      }

      const rawT = Math.min(1.0, elapsed / flightDuration);
      const t = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

      const currGroundX = pFrom.x + (pTo.x - pFrom.x) * t;
      const currGroundY = pFrom.y + (pTo.y - pFrom.y) * t;

      const arcFactor = 4 * t * (1 - t);
      const maxArcHeight = Math.min(width, height) * 0.16;
      const currHeight = arcFactor * maxArcHeight;

      const projX = currGroundX;
      const projY = currGroundY - currHeight;

      if (rawT >= 1.0 && !hasImpacted) {
        hasImpacted = true;
        spawnExplosionShrapnel(pTo.x, pTo.y);
        onImpactRef.current?.();
      }

      if (rawT < 1.0) {
        for (let i = 0; i < 3; i++) {
          const jitterX = (Math.random() - 0.5) * 6;
          const jitterY = (Math.random() - 0.5) * 6;
          particles.push({
            x: projX + jitterX,
            y: projY + jitterY,
            vx: (Math.random() - 0.5) * 1.5 - (pTo.x - pFrom.x) * 0.015,
            vy: (Math.random() - 0.5) * 1.5 - (pTo.y - pFrom.y) * 0.015 + 0.3,
            size: 1.5 + Math.random() * 2.8,
            color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
            alpha: 0.95,
            decay: 0.035 + Math.random() * 0.03,
            type: 'spark'
          });
        }

        if (Math.random() > 0.45) {
          particles.push({
            x: projX,
            y: projY,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.4 - Math.random() * 0.6,
            size: 5 + Math.random() * 9,
            color: 'rgba(100, 70, 50, ',
            alpha: 0.6,
            decay: 0.025,
            type: 'smoke'
          });
        }
      }

      if (rawT < 1.0) {
        const shadowScale = 1 - arcFactor * 0.35;
        const shadowAlpha = 0.35 * (1 - arcFactor * 0.45);
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(currGroundX, currGroundY, 14 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (rawT < 1.0) {
        const screenDist = Math.hypot(currGroundX - pScreen.x, currGroundY - pScreen.y);
        const screenProximity = Math.max(0, 1 - screenDist / (width * 0.25));
        if (screenProximity > 0) {
          ctx.save();
          const ringPulse = (elapsed % 300) / 300;
          ctx.strokeStyle = `rgba(245, 158, 11, ${screenProximity * 0.7 * (1 - ringPulse)})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(pScreen.x, pScreen.y, 22 + ringPulse * 28, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
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
          ctx.fillStyle = `${p.color}${p.alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha) * 0.8), 0, Math.PI * 2);
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

      if (rawT < 1.0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const auraRadius = 18 + arcFactor * 8;
        const auraGrad = ctx.createRadialGradient(projX, projY, 2, projX, projY, auraRadius);
        auraGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        auraGrad.addColorStop(0.2, 'rgba(253, 224, 71, 0.95)');
        auraGrad.addColorStop(0.55, 'rgba(249, 115, 22, 0.8)');
        auraGrad.addColorStop(0.85, 'rgba(239, 68, 68, 0.45)');
        auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(projX, projY, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        const coreRadius = 7 + arcFactor * 3.5;
        const coreGrad = ctx.createRadialGradient(projX, projY, 0, projX, projY, coreRadius);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, '#fef08a');
        coreGrad.addColorStop(0.9, '#f97316');
        coreGrad.addColorStop(1, 'rgba(239, 68, 68, 0.6)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(projX, projY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

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

  const dr = data.isFlipped ? 9 - data.screenR : data.screenR;
  const dc = data.isFlipped ? 8 - data.screenC : data.screenC;
  const screenLeftPct = ((25 + dc * 50) / 450) * 100;
  const screenTopPct = ((25 + dr * 50) / 500) * 100;

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
        className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-60"
        style={{ left: `${screenLeftPct}%`, top: `${screenTopPct}%` }}
      >
        <div className="w-14 h-14 -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 rounded-full border-2 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.9),inset_0_0_15px_rgba(245,158,11,0.7)] cannon-screen-pulse" />
      </div>
    </div>
  );
}
