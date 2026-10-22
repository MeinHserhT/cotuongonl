'use client';

import React, { useEffect, useRef } from 'react';

export type MatchResultType = 'victory' | 'defeat' | 'draw';

interface MatchResultOverlayProps {
  type: MatchResultType;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  trail: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number }[];
}

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  angle: number;
  dAngle: number;
  flip: number;
  dFlip: number;
}

interface LeafParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  stemColor: string;
  speedY: number;
  swayAmplitude: number;
  swaySpeed: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  type: 'maple' | 'oval';
}

interface RainParticle {
  x: number;
  y: number;
  length: number;
  speedY: number;
  speedX: number;
  alpha: number;
}

interface PetalParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  swaySpeed: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
}

export function MatchResultOverlay({ type }: MatchResultOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const VICTORY_COLORS = [
      '#ffd700',
      '#ff4444',
      '#ff9f1c',
      '#2ec4b6',
      '#e71d36',
      '#ffffff',
      '#f72585',
      '#7209b7'
    ];

    const LEAF_COLORS = [
      { fill: '#c25e1a', stem: '#78350f' },
      { fill: '#b45309', stem: '#713f12' },
      { fill: '#9a3412', stem: '#451a03' },
      { fill: '#d97706', stem: '#854d0e' },
      { fill: '#854d0e', stem: '#3f2207' },
      { fill: '#7f1d1d', stem: '#450a0a' }
    ];

    const PETAL_COLORS = [
      '#fbcfe8', '#f472b6', '#fda4af', '#fecdd3', '#ffe4e6'
    ];

    const rockets: Rocket[] = [];
    const fireworks: FireworkParticle[] = [];
    const confettis: ConfettiPiece[] = [];
    const leaves: LeafParticle[] = [];
    const raindrops: RainParticle[] = [];
    const petals: PetalParticle[] = [];

    if (type === 'victory') {
      for (let i = 0; i < 45; i++) {
        confettis.push({
          x: Math.random() * width,
          y: Math.random() * height - height * 0.5,
          w: Math.random() * 8 + 6,
          h: Math.random() * 5 + 4,
          color: VICTORY_COLORS[Math.floor(Math.random() * VICTORY_COLORS.length)],
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 2 + 1.5,
          angle: Math.random() * Math.PI * 2,
          dAngle: (Math.random() - 0.5) * 0.08,
          flip: Math.random() * Math.PI * 2,
          dFlip: (Math.random() - 0.5) * 0.1
        });
      }

      for (let i = 0; i < 3; i++) {
        rockets.push({
          x: width * 0.2 + Math.random() * width * 0.6,
          y: height + Math.random() * 40,
          targetY: height * 0.18 + Math.random() * height * 0.35,
          vy: -(Math.random() * 3 + 12),
          color: VICTORY_COLORS[Math.floor(Math.random() * VICTORY_COLORS.length)],
          exploded: false,
          trail: []
        });
      }
    }

    if (type === 'defeat') {
      for (let i = 0; i < 35; i++) {
        const pal = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
        leaves.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          size: Math.random() * 12 + 14,
          color: pal.fill,
          stemColor: pal.stem,
          speedY: Math.random() * 1.2 + 0.8,
          swayAmplitude: Math.random() * 30 + 15,
          swaySpeed: Math.random() * 0.02 + 0.015,
          phase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.03 + 0.01,
          type: Math.random() > 0.4 ? 'maple' : 'oval'
        });
      }

      for (let i = 0; i < 55; i++) {
        raindrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 20 + 15,
          speedY: Math.random() * 6 + 9,
          speedX: -1.2,
          alpha: Math.random() * 0.25 + 0.1
        });
      }
    }

    if (type === 'draw') {
      for (let i = 0; i < 40; i++) {
        petals.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          size: Math.random() * 8 + 10,
          color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
          speedY: Math.random() * 1 + 0.7,
          swaySpeed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.03 + 0.01
        });
      }
    }

    let frame = 0;

    const explodeRocket = (rx: number, ry: number, baseColor: string) => {
      const count = Math.floor(Math.random() * 25 + 45);
      const isMultiColor = Math.random() > 0.4;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 4.5 + 1.5;
        fireworks.push({
          x: rx,
          y: ry,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: isMultiColor
            ? VICTORY_COLORS[Math.floor(Math.random() * VICTORY_COLORS.length)]
            : baseColor,
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          size: Math.random() * 2.5 + 1.5,
          trail: []
        });
      }
    };

    const drawLeaf = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      stemColor: string,
      rotation: number,
      flip: number,
      leafType: 'maple' | 'oval'
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);
      c.scale(Math.cos(flip), 1);

      c.fillStyle = color;
      c.beginPath();

      if (leafType === 'maple') {
        c.moveTo(0, -size);
        c.lineTo(size * 0.35, -size * 0.5);
        c.lineTo(size * 0.8, -size * 0.6);
        c.lineTo(size * 0.5, -size * 0.1);
        c.lineTo(size * 0.9, size * 0.2);
        c.lineTo(size * 0.4, size * 0.35);
        c.lineTo(size * 0.55, size * 0.7);
        c.lineTo(0, size * 0.5);
        c.lineTo(-size * 0.55, size * 0.7);
        c.lineTo(-size * 0.4, size * 0.35);
        c.lineTo(-size * 0.9, size * 0.2);
        c.lineTo(-size * 0.5, -size * 0.1);
        c.lineTo(-size * 0.8, -size * 0.6);
        c.lineTo(-size * 0.35, -size * 0.5);
        c.closePath();
      } else {
        c.moveTo(0, -size);
        c.bezierCurveTo(size * 0.6, -size * 0.4, size * 0.7, size * 0.4, 0, size);
        c.bezierCurveTo(-size * 0.7, size * 0.4, -size * 0.6, -size * 0.4, 0, -size);
      }
      c.fill();

      c.strokeStyle = stemColor;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, -size * 0.8);
      c.lineTo(0, size * 1.1);
      c.stroke();

      c.restore();
    };

    const drawPetal = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      rotation: number,
      flip: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);
      c.scale(Math.cos(flip), 1);

      c.fillStyle = color;
      c.globalAlpha = 0.85;
      c.beginPath();
      c.moveTo(0, -size);
      c.bezierCurveTo(size * 0.8, -size * 0.3, size * 0.6, size * 0.6, 0, size);
      c.bezierCurveTo(-size * 0.6, size * 0.6, -size * 0.8, -size * 0.3, 0, -size);
      c.fill();
      c.restore();
    };

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (type === 'victory') {
        if (frame % 38 === 0 || (frame < 120 && frame % 25 === 0)) {
          rockets.push({
            x: width * 0.15 + Math.random() * width * 0.7,
            y: height + 10,
            targetY: height * 0.12 + Math.random() * height * 0.4,
            vy: -(Math.random() * 3 + 12),
            color: VICTORY_COLORS[Math.floor(Math.random() * VICTORY_COLORS.length)],
            exploded: false,
            trail: []
          });
        }

        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 5) r.trail.shift();

          r.y += r.vy;
          r.vy += 0.08;

          ctx.strokeStyle = r.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let j = 0; j < r.trail.length; j++) {
            const p = r.trail[j];
            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (r.y <= r.targetY || r.vy >= -1) {
            explodeRocket(r.x, r.y, r.color);
            rockets.splice(i, 1);
          }
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
          const p = fireworks[i];
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 3) p.trail.shift();

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06;
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            fireworks.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        for (let i = 0; i < confettis.length; i++) {
          const c = confettis[i];
          c.x += c.vx;
          c.y += c.vy;
          c.angle += c.dAngle;
          c.flip += c.dFlip;

          if (c.y > height + 20) {
            c.y = -20;
            c.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.angle);
          ctx.scale(Math.cos(c.flip), 1);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        }
      }

      if (type === 'defeat') {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < raindrops.length; i++) {
          const r = raindrops[i];
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + r.speedX * 2, r.y + r.length);
          ctx.stroke();

          r.x += r.speedX;
          r.y += r.speedY;

          if (r.y > height + r.length) {
            r.y = -r.length;
            r.x = Math.random() * width + 50;
          }
        }

        for (let i = 0; i < leaves.length; i++) {
          const l = leaves[i];
          l.phase += l.swaySpeed;
          l.y += l.speedY;
          l.x += Math.sin(l.phase) * 1.6 - 0.4;
          l.rotation += l.rotationSpeed;
          l.flip += l.flipSpeed;

          if (l.y > height + l.size * 2) {
            l.y = -l.size * 2;
            l.x = Math.random() * width;
          }

          drawLeaf(
            ctx,
            l.x,
            l.y,
            l.size,
            l.color,
            l.stemColor,
            l.rotation,
            l.flip,
            l.type
          );
        }
      }

      if (type === 'draw') {
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          p.phase += p.swaySpeed;
          p.y += p.speedY;
          p.x += Math.sin(p.phase) * 1.2;
          p.rotation += p.rotationSpeed;
          p.flip += p.flipSpeed;

          if (p.y > height + p.size * 2) {
            p.y = -p.size * 2;
            p.x = Math.random() * width;
          }

          drawPetal(ctx, p.x, p.y, p.size, p.color, p.rotation, p.flip);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {type === 'victory' && (
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent animate-pulse duration-1000" />
      )}
      {type === 'defeat' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-900/20 to-amber-950/20" />
      )}
      {type === 'draw' && (
        <div className="absolute inset-0 bg-radial from-rose-500/10 via-transparent to-transparent" />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
