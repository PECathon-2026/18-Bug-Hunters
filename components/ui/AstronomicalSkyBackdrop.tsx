"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/auth-context";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

const STAR_COLORS = [
  "rgba(255, 255, 255, ", // Pure white
  "rgba(196, 163, 90, ",  // Celestial gold
  "rgba(112, 192, 255, ", // Rigel blue / cyan
  "rgba(232, 238, 248, ", // Moonlight silver
  "rgba(224, 201, 135, ", // Soft amber
];

export function AstronomicalSkyBackdrop() {
  const { hasEnteredDojo } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only activate canvas when user has entered
    if (!hasEnteredDojo) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener("resize", handleResize);

    // Mouse coordinates for gentle celestial starlight interaction
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Initialize stars
    let stars: Star[] = [];
    const initStars = () => {
      const count = Math.floor((width * height) / 8000);
      stars = [];
      for (let i = 0; i < count; i++) {
        const baseAlpha = 0.2 + Math.random() * 0.7;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.6 + 0.4,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: 0.008 + Math.random() * 0.02,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
      }
    };

    initStars();

    // Meteors / Shooting stars system
    const meteors: Meteor[] = [];
    const maxMeteors = 2;

    const spawnMeteor = () => {
      if (meteors.length >= maxMeteors) return;
      meteors.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.45),
        length: Math.random() * 80 + 50,
        speed: Math.random() * 7 + 9,
        angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1), // ~45 degrees diagonal
        alpha: 1,
        active: true,
      });
    };

    // Meteor trigger timer
    let meteorTimer = setInterval(() => {
      if (Math.random() < 0.65) {
        spawnMeteor();
      }
    }, 4500);

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw faint constellation links between nearby stars
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i += 3) {
        for (let j = i + 1; j < Math.min(i + 6, stars.length); j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            const linkAlpha = (1 - dist / 85) * 0.15 * Math.sin(time + i);
            if (linkAlpha > 0) {
              ctx.strokeStyle = `rgba(196, 163, 90, ${linkAlpha})`;
              ctx.beginPath();
              ctx.moveTo(stars[i].x, stars[i].y);
              ctx.lineTo(stars[j].x, stars[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw and twinkle stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Twinkle oscillation
        star.alpha = star.baseAlpha + Math.sin(time * 3 + i) * 0.25;

        // Mouse proximity glow effect
        const dx = star.x - mouseX;
        const dy = star.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let finalRadius = star.radius;
        let finalAlpha = Math.max(0.08, Math.min(1, star.alpha));

        if (dist < 120) {
          const proximity = 1 - dist / 120;
          finalAlpha = Math.min(1, finalAlpha + proximity * 0.6);
          finalRadius += proximity * 0.8;
        }

        ctx.fillStyle = `${star.color}${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, finalRadius, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft starlight halo for larger stars
        if (star.radius > 1.4 && finalAlpha > 0.6) {
          ctx.fillStyle = `${star.color}${finalAlpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, finalRadius * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw and update meteors (shooting stars)
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (!m.active) {
          meteors.splice(i, 1);
          continue;
        }

        const headX = m.x;
        const headY = m.y;
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const grad = ctx.createLinearGradient(headX, headY, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(0.3, `rgba(112, 192, 255, ${m.alpha * 0.8})`);
        grad.addColorStop(0.7, `rgba(196, 163, 90, ${m.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(196, 163, 90, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Bright meteor head glow
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
        ctx.beginPath();
        ctx.arc(headX, headY, 1.8, 0, Math.PI * 2);
        ctx.fill();

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.018;

        if (m.alpha <= 0 || m.x > width + 100 || m.y > height + 100) {
          m.active = false;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(meteorTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hasEnteredDojo]);

  if (!hasEnteredDojo) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Deep Space Atmospheric Cosmic Nebulae Layers */}
      <div className="absolute -top-[25%] -left-[10%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,rgba(77,168,218,0.07)_0%,rgba(143,45,58,0.05)_45%,transparent_70%)] blur-[90px] animate-pulse-soft" style={{ animationDuration: "14s" }} />
      <div className="absolute top-[40%] -right-[15%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full bg-[radial-gradient(circle,rgba(196,163,90,0.06)_0%,rgba(11,26,50,0.25)_50%,transparent_75%)] blur-[100px] animate-pulse-soft" style={{ animationDuration: "18s" }} />
      <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(circle,rgba(143,45,58,0.08)_0%,rgba(18,26,43,0.3)_60%,transparent_80%)] blur-[80px]" />

      {/* 2. Interactive Twinkling & Shooting Star Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full opacity-90" />
    </div>
  );
}

