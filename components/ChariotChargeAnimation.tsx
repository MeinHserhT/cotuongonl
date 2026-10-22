'use client';

import React, { useEffect, useRef } from 'react';

export interface ChariotChargeData {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  isFlipped: boolean;
}

interface ChariotChargeAnimationProps {
  data: ChariotChargeData | null;
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
  type: 'spark' | 'smoke' | 'debris' | 'shrapnel';
  trail?: { x: number; y: number }[];
}

export function ChariotChargeAnimation({
  data,
  onImpact,
  onComplete
}: ChariotChargeAnimationProps) {
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
    const chargeDuration = 270;
    const impactDuration = 180;
    const totalDuration = chargeDuration + impactDuration;

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

    const spawnImpactExplosion = (x: number, y: number, angle: number) => {
      const colors = ['#fef08a', '#facc15', '#fb923c', '#ea580c', '#ef4444', '#ffffff'];
      const count = 36;
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * Math.PI * 1.5;
        const speed = 3.0 + Math.random() * 6.0;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: 2.2 + Math.random() * 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.022 + Math.random() * 0.022,
          type: 'shrapnel',
          trail: []
        });
      }

      for (let i = 0; i < 18; i++) {
        const a = angle + (Math.random() - 0.5) * Math.PI * 1.6;
        const speed = 2.0 + Math.random() * 4.5;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: 3.5 + Math.random() * 4.5,
          color: Math.random() > 0.5 ? '#b45309' : '#d97706',
          alpha: 1,
          decay: 0.028 + Math.random() * 0.02,
          type: 'debris'
        });
      }

      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 2.5;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: 10 + Math.random() * 16,
          color: 'rgba(80, 50, 30, ',
          alpha: 0.8,
          decay: 0.03,
          type: 'smoke'
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

      const totalDx = pTo.x - pFrom.x;
      const totalDy = pTo.y - pFrom.y;
      const dist = Math.hypot(totalDx, totalDy);
      const angle = Math.atan2(totalDy, totalDx);

      const normalX = -Math.sin(angle);
      const normalY = Math.cos(angle);
      const trackOffset = 11;

      const rawT = Math.min(1.0, elapsed / chargeDuration);
      const t = rawT * rawT * (3 - 2 * rawT);

      const currX = pFrom.x + totalDx * t;
      const currY = pFrom.y + totalDy * t;

      if (rawT >= 1.0 && !hasImpacted) {
        hasImpacted = true;
        spawnImpactExplosion(pTo.x, pTo.y, angle);
        onImpactRef.current?.();
      }

      if (t > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (const side of [-1, 1]) {
          const trackFromX = pFrom.x + normalX * trackOffset * side;
          const trackFromY = pFrom.y + normalY * trackOffset * side;
          const trackCurrX = currX + normalX * trackOffset * side;
          const trackCurrY = currY + normalY * trackOffset * side;

          const grad = ctx.createLinearGradient(trackFromX, trackFromY, trackCurrX, trackCurrY);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
          grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.6)');
          grad.addColorStop(0.85, 'rgba(251, 191, 36, 0.95)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 1)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 4.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(trackFromX, trackFromY);
          ctx.lineTo(trackCurrX, trackCurrY);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(trackFromX, trackFromY);
          ctx.lineTo(trackCurrX, trackCurrY);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (rawT < 1.0) {
        for (let i = 0; i < 4; i++) {
          const side = Math.random() > 0.5 ? 1 : -1;
          const spawnX = currX + normalX * trackOffset * side + (Math.random() - 0.5) * 6;
          const spawnY = currY + normalY * trackOffset * side + (Math.random() - 0.5) * 6;
          const sprayAngle = angle + Math.PI + (Math.random() - 0.5) * 0.8;
          const speed = 2.0 + Math.random() * 4.5;
          particles.push({
            x: spawnX,
            y: spawnY,
            vx: Math.cos(sprayAngle) * speed,
            vy: Math.sin(sprayAngle) * speed,
            size: 1.8 + Math.random() * 2.8,
            color: Math.random() > 0.4 ? '#fbbf24' : '#ef4444',
            alpha: 1,
            decay: 0.04 + Math.random() * 0.03,
            type: 'spark'
          });
        }

        if (Math.random() > 0.3) {
          particles.push({
            x: currX + (Math.random() - 0.5) * 14,
            y: currY + (Math.random() - 0.5) * 14,
            vx: -Math.cos(angle) * (1.5 + Math.random() * 2),
            vy: -Math.sin(angle) * (1.5 + Math.random() * 2),
            size: 8 + Math.random() * 12,
            color: 'rgba(90, 65, 45, ',
            alpha: 0.55,
            decay: 0.028,
            type: 'smoke'
          });
        }
      }

      if (rawT < 1.0 && t > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 1.5;
        for (let i = -1; i <= 1; i += 2) {
          const shearX = currX + normalX * (trackOffset + 12) * i;
          const shearY = currY + normalY * (trackOffset + 12) * i;
          const tailLen = Math.min(dist * t, 35);
          ctx.beginPath();
          ctx.moveTo(shearX, shearY);
          ctx.lineTo(shearX - Math.cos(angle) * tailLen, shearY - Math.sin(angle) * tailLen);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (rawT < 1.0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const auraRadius = 24;
        const auraGrad = ctx.createRadialGradient(currX, currY, 4, currX, currY, auraRadius);
        auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        auraGrad.addColorStop(0.3, 'rgba(253, 224, 71, 0.85)');
        auraGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.5)');
        auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(currX, currY, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.arc(currX, currY, 18, angle - Math.PI * 0.4, angle + Math.PI * 0.4);
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
        } else if (p.type === 'smoke') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = `${p.color}${p.alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha) * 0.8), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'debris') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'shrapnel') {
          ctx.globalCompositeOperation = 'lighter';
          if (!p.trail) p.trail = [];
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 5) p.trail.shift();

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
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      if (rawT >= 1.0 && elapsed < totalDuration) {
        const impactProgress = (elapsed - chargeDuration) / impactDuration;
        const blastRadius = 40 * Math.sin(impactProgress * Math.PI);
        if (blastRadius > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          const flashGrad = ctx.createRadialGradient(pTo.x, pTo.y, 0, pTo.x, pTo.y, blastRadius);
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * (1 - impactProgress)})`);
          flashGrad.addColorStop(0.35, `rgba(251, 191, 36, ${0.85 * (1 - impactProgress)})`);
          flashGrad.addColorStop(0.75, `rgba(239, 68, 68, ${0.5 * (1 - impactProgress)})`);
          flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(pTo.x, pTo.y, blastRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(254, 240, 138, ${0.9 * (1 - impactProgress)})`;
          ctx.lineWidth = 3.5 * (1 - impactProgress);
          ctx.beginPath();
          ctx.arc(pTo.x, pTo.y, blastRadius * 1.15, angle - Math.PI * 0.5, angle + Math.PI * 0.5);
          ctx.stroke();

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

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-55 overflow-visible"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
