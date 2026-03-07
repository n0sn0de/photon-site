"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================
// Hero Background Variants — toggle with ?hero=d|e|f in URL
//
// ALL variants keep the center clear for text. Logos live at
// the edges/periphery only.
//
// D: "Gravity Wells" — Large logos anchored in corners as
//    gravitational attractors. Particles stream between them
//    in curved orbital paths.
//
// E: "Horizon" — Token logos float along the bottom like
//    celestial bodies on a horizon. Aurora-like particle
//    streams rise upward from them.
//
// F: "Flanking" — Big PHOTON left, big ATONE right, both
//    partially off-screen. Particle river flows between them
//    horizontally through the background.
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

    // ─── VARIANT D: Gravity Wells ──────────────────────────
    const drawVariantD = (w: number, h: number) => {
      // PHOTON — top-left corner
      const pSize = Math.min(w, h) * 0.22;
      const px = pSize * 0.35;
      const py = pSize * 0.4;
      const pPulse = 0.18 + 0.04 * Math.sin(time * 0.008);
      drawLogo(photonImg.current, px, py, pSize, pPulse, time * 0.0008, "1, 215, 235", 1.5);

      // ATONE — bottom-right corner
      const aSize = Math.min(w, h) * 0.2;
      const ax = w - aSize * 0.35;
      const ay = h - aSize * 0.4;
      const aPulse = 0.15 + 0.04 * Math.sin(time * 0.009 + 1);
      drawLogo(atoneImg.current, ax, ay, aSize, aPulse, -time * 0.0006, "107, 138, 205", 1.5);

      // Small secondary logos — ATONE top-right, PHOTON bottom-left
      const s2 = Math.min(w, h) * 0.1;
      drawLogo(atoneImg.current, w - s2 * 0.8, s2 * 1.2, s2, 0.08 + 0.03 * Math.sin(time * 0.01), time * 0.001, "107, 138, 205");
      drawLogo(photonImg.current, s2 * 0.8, h - s2 * 1.2, s2, 0.08 + 0.03 * Math.sin(time * 0.011), -time * 0.001);

      // Curve particles toward the gravity wells
      for (const p of particles) {
        // Pull toward PHOTON well (top-left)
        const dxP = px - p.x;
        const dyP = py - p.y;
        const distP = Math.sqrt(dxP * dxP + dyP * dyP);
        if (distP > 40 && distP < 350) {
          const force = 0.008 / (distP * 0.02);
          p.speedX += (dxP / distP) * force;
          p.speedY += (dyP / distP) * force;
        }

        // Pull toward ATONE well (bottom-right)
        const dxA = ax - p.x;
        const dyA = ay - p.y;
        const distA = Math.sqrt(dxA * dxA + dyA * dyA);
        if (distA > 40 && distA < 350) {
          const force = 0.006 / (distA * 0.02);
          p.speedX += (dxA / distA) * force;
          p.speedY += (dyA / distA) * force;
        }

        // Speed limit
        const speed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
        if (speed > 1.2) {
          p.speedX *= 0.98;
          p.speedY *= 0.98;
        }
      }
    };

    // ─── VARIANT E: Horizon ────────────────────────────────
    const drawVariantE = (w: number, h: number) => {
      // Horizon line — faint gradient at bottom 20%
      const horizonY = h * 0.82;
      const horizonGrad = ctx.createLinearGradient(0, horizonY - 30, 0, h);
      horizonGrad.addColorStop(0, "rgba(1, 215, 235, 0)");
      horizonGrad.addColorStop(0.3, "rgba(1, 215, 235, 0.015)");
      horizonGrad.addColorStop(1, "rgba(0, 19, 71, 0.1)");
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, horizonY - 30, w, h - horizonY + 30);

      // Thin horizon line
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.strokeStyle = `rgba(1, 215, 235, ${0.06 + 0.02 * Math.sin(time * 0.005)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Token logos sitting on the horizon
      const logoSize = Math.min(w * 0.08, 55);
      const positions = [
        { x: w * 0.12, type: "photon" as const, phase: 0 },
        { x: w * 0.32, type: "atone" as const, phase: 1.5 },
        { x: w * 0.55, type: "photon" as const, phase: 3 },
        { x: w * 0.75, type: "atone" as const, phase: 4.5 },
        { x: w * 0.92, type: "photon" as const, phase: 6 },
      ];

      for (const pos of positions) {
        const bob = Math.sin(time * 0.006 + pos.phase) * 6;
        const y = horizonY - logoSize * 0.4 + bob;
        const img = pos.type === "photon" ? photonImg.current : atoneImg.current;
        const color = pos.type === "photon" ? "1, 215, 235" : "107, 138, 205";
        const opacity = 0.2 + 0.06 * Math.sin(time * 0.01 + pos.phase);
        drawLogo(img, pos.x, y, logoSize, opacity, 0, color, 1.8);

        // Aurora streams rising from each logo
        const streamCount = 5;
        for (let s = 0; s < streamCount; s++) {
          const streamT = ((time * 0.3 + s * 60 + pos.phase * 30) % 300) / 300;
          const streamX = pos.x + Math.sin(time * 0.003 + s * 2 + pos.phase) * 25;
          const streamY = y - streamT * h * 0.5;
          const streamOpacity = opacity * 0.3 * (1 - streamT) * (streamT > 0.05 ? 1 : streamT / 0.05);

          ctx.beginPath();
          ctx.arc(streamX, streamY, 1.2 + (1 - streamT) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${streamOpacity})`;
          ctx.fill();
        }
      }
    };

    // ─── VARIANT F: Flanking ───────────────────────────────
    const drawVariantF = (w: number, h: number) => {
      // Large PHOTON on left — ~65% visible
      const bigSize = Math.min(w, h) * 0.55;
      const leftX = bigSize * 0.18;
      const leftY = h * 0.45 + Math.sin(time * 0.004) * 12;
      const leftPulse = 0.18 + 0.05 * Math.sin(time * 0.006);
      drawLogo(photonImg.current, leftX, leftY, bigSize, leftPulse, time * 0.0005, "1, 215, 235", 1.5);

      // Large ATONE on right — ~65% visible
      const rightX = w - bigSize * 0.18;
      const rightY = h * 0.55 + Math.sin(time * 0.005 + 2) * 12;
      const rightPulse = 0.15 + 0.05 * Math.sin(time * 0.007 + 1);
      drawLogo(atoneImg.current, rightX, rightY, bigSize * 0.5, rightPulse, -time * 0.0004, "107, 138, 205", 1.5);

      // Small accent logos — ATONE top-left area, PHOTON bottom-right
      const smSize = Math.min(w, h) * 0.07;
      drawLogo(atoneImg.current, w * 0.06, h * 0.15, smSize, 0.1 + 0.03 * Math.sin(time * 0.012), 0, "107, 138, 205");
      drawLogo(photonImg.current, w * 0.94, h * 0.1, smSize * 0.9, 0.1 + 0.03 * Math.sin(time * 0.013 + 1));

      // Horizontal particle river — give particles a rightward flow bias
      for (const p of particles) {
        // Add subtle horizontal current from left to right
        p.speedX += 0.002;
        // Gentle vertical centering
        const dy = h * 0.5 - p.y;
        p.speedY += dy * 0.00003;
        // Dampen
        p.speedX *= 0.999;
        p.speedY *= 0.998;
        // Speed limit
        if (Math.abs(p.speedX) > 0.8) p.speedX *= 0.95;
      }

      // Flowing energy line connecting the two sides
      ctx.beginPath();
      const segments = 80;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = t * w;
        const y = h * 0.5 + Math.sin(t * Math.PI * 3 + time * 0.01) * 30 + Math.sin(t * Math.PI * 7 + time * 0.02) * 8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const flowOpacity = 0.025 + 0.01 * Math.sin(time * 0.008);
      ctx.strokeStyle = `rgba(1, 215, 235, ${flowOpacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
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
    { key: "d", label: "Gravity Wells" },
    { key: "e", label: "Horizon" },
    { key: "f", label: "Flanking" },
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
