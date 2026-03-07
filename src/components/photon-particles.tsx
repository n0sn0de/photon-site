"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================
// Hero Background Variants — toggle with ?hero=d|e|f in URL
//
// ALL variants keep the center clear for text. Logos live at
// the edges/periphery only.
//
// D: "Centered" — One logo each side, vertically centered in
//    the void space. Clean and symmetrical.
//
// E: "Upper" — Logos sit in the upper void areas (left-high,
//    right-high) above where the text sits.
//
// F: "Staggered" — PHOTON left-center, ATONE right-lower.
//    Diagonal balance, more dynamic composition.
// ============================================================

type HeroVariant = "d" | "e" | "f";

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
  const [variant, setVariant] = useState<HeroVariant>("d");
  const photonImg = useRef<HTMLImageElement | null>(null);
  const atoneImg = useRef<HTMLImageElement | null>(null);
  const imagesLoaded = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get("hero");
    if (v === "d" || v === "e" || v === "f") {
      setVariant(v);
    }
  }, []);

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

    // Shared logo size + pulse for all variants (one logo per side, same size)
    const logoSize = () => Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.24;
    const logoPulse = (phase: number) => 0.2 + 0.05 * Math.sin(time * 0.007 + phase);

    // ─── VARIANT D: Centered ───────────────────────────────
    const drawVariantD = (w: number, h: number) => {
      const size = logoSize();
      const bob = Math.sin(time * 0.005) * 8;

      // PHOTON — left side, vertically centered
      drawLogo(photonImg.current, w * 0.1, h * 0.48 + bob, size, logoPulse(0), time * 0.0006, "1, 215, 235", 1.6);

      // ATONE — right side, vertically centered
      drawLogo(atoneImg.current, w * 0.9, h * 0.48 - bob, size, logoPulse(2), -time * 0.0005, "107, 138, 205", 1.6);
    };

    // ─── VARIANT E: Upper ──────────────────────────────────
    const drawVariantE = (w: number, h: number) => {
      const size = logoSize();
      const bob = Math.sin(time * 0.004) * 6;

      // PHOTON — upper-left void
      drawLogo(photonImg.current, w * 0.09, h * 0.25 + bob, size, logoPulse(0), time * 0.0005, "1, 215, 235", 1.6);

      // ATONE — upper-right void
      drawLogo(atoneImg.current, w * 0.91, h * 0.28 - bob, size, logoPulse(2.5), -time * 0.0004, "107, 138, 205", 1.6);
    };

    // ─── VARIANT F: Staggered ─────────────────────────────
    const drawVariantF = (w: number, h: number) => {
      const size = logoSize();
      const bob1 = Math.sin(time * 0.005) * 10;
      const bob2 = Math.sin(time * 0.006 + 1.5) * 10;

      // PHOTON — left side, slightly above center
      drawLogo(photonImg.current, w * 0.08, h * 0.35 + bob1, size, logoPulse(0), time * 0.0005, "1, 215, 235", 1.6);

      // ATONE — right side, slightly below center
      drawLogo(atoneImg.current, w * 0.92, h * 0.62 + bob2, size, logoPulse(3), -time * 0.0004, "107, 138, 205", 1.6);
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
        if (variant === "d") drawVariantD(w, h);
        else if (variant === "e") drawVariantE(w, h);
        else if (variant === "f") drawVariantF(w, h);
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
  }, [variant]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
      {/* Variant toggle — visible when ?hero param is in URL */}
      <VariantToggle variant={variant} setVariant={setVariant} />
    </>
  );
}

function VariantToggle({ variant, setVariant }: { variant: HeroVariant; setVariant: (v: HeroVariant) => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShow(new URLSearchParams(window.location.search).has("hero"));
    }
  }, []);

  if (!show) return null;

  const options: { key: HeroVariant; label: string }[] = [
    { key: "d", label: "Centered" },
    { key: "e", label: "Upper" },
    { key: "f", label: "Staggered" },
  ];

  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2">
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => {
            setVariant(key);
            const url = new URL(window.location.href);
            url.searchParams.set("hero", key);
            window.history.replaceState({}, "", url.toString());
          }}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
            variant === key
              ? "bg-accent text-bg-primary"
              : "bg-bg-card/80 text-text-secondary border border-border hover:border-accent/50"
          }`}
        >
          {key.toUpperCase()}: {label}
        </button>
      ))}
    </div>
  );
}
