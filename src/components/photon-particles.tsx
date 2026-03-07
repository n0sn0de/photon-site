"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

export function PhotonParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photonImg = useRef<HTMLImageElement | null>(null);
  const atoneImg = useRef<HTMLImageElement | null>(null);
  const imagesLoaded = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let time = 0;

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = src;
      });

    const initImages = async () => {
      photonImg.current = await loadImage("/assets/photon.svg");
      atoneImg.current = await loadImage("/assets/atone.svg");
      imagesLoaded.current = true;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticles = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = Math.min(55, Math.floor(w / 22));

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2 - 0.08,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      }));
    };

    const drawParticle = (p: Particle, w: number, h: number) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      const a = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      gradient.addColorStop(0, `rgba(1, 215, 235, ${a})`);
      gradient.addColorStop(0.4, `rgba(1, 215, 235, ${a * 0.3})`);
      gradient.addColorStop(1, "rgba(1, 215, 235, 0)");

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(1, 215, 235, ${a * 1.5})`;
      ctx.fill();
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(1, 215, 235, ${(1 - dist / 120) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const drawLogo = (
      img: HTMLImageElement | null,
      x: number, y: number, size: number,
      opacity: number, rotation = 0,
      glowColor = "1, 215, 235", glowSize = 1.2
    ) => {
      if (!img || !img.complete || img.naturalWidth === 0) return;

      // Glow behind logo
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * glowSize);
      glow.addColorStop(0, `rgba(${glowColor}, ${opacity * 0.25})`);
      glow.addColorStop(0.6, `rgba(${glowColor}, ${opacity * 0.08})`);
      glow.addColorStop(1, `rgba(${glowColor}, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, size * glowSize, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      if (rotation) ctx.rotate(rotation);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    // ─── Token Logos: Staggered ──────────────────────────────
    const drawTokenLogos = (w: number, h: number) => {
      const size = Math.min(w, h) * 0.24;
      const bob1 = Math.sin(time * 0.005) * 10;
      const bob2 = Math.sin(time * 0.006 + 1.5) * 10;
      const pulse = (phase: number) => 0.2 + 0.05 * Math.sin(time * 0.007 + phase);

      // PHOTON — left side, slightly above center
      drawLogo(photonImg.current, w * 0.08, h * 0.35 + bob1, size, pulse(0), time * 0.0005, "1, 215, 235", 1.6);

      // ATONE — right side, slightly below center
      drawLogo(atoneImg.current, w * 0.92, h * 0.62 + bob2, size, pulse(3), -time * 0.0004, "107, 138, 205", 1.6);
    };

    // ─── Main Draw Loop ────────────────────────────────────
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time++;

      for (const p of particles) {
        drawParticle(p, w, h);
      }
      drawConnections();

      if (imagesLoaded.current) {
        drawTokenLogos(w, h);
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    initImages();
    draw();

    const handleResize = () => {
      resize();
      createParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}
