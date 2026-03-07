"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================
// Hero Background Variants — toggle with ?hero=a|b|c in URL
//
// A: "Orbital" — Large ghostly PHOTON logo center, ATONE logos
//    orbit around it like electrons. Small particles still float.
//
// B: "Constellation" — Token logos scattered as bright nodes in
//    the particle field, connected by constellation-style lines.
//    Logos drift slowly, creating an evolving star map.
//
// C: "Emergence" — Particles coalesce into a faint PHOTON logo
//    shape, then disperse and reform. ATONE logos float at edges,
//    visually "feeding" particles inward (burn → mint metaphor).
// ============================================================

type HeroVariant = "a" | "b" | "c";

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

interface LogoNode {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: "photon" | "atone";
}

export function PhotonParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [variant, setVariant] = useState<HeroVariant>("a");
  const photonImg = useRef<HTMLImageElement | null>(null);
  const atoneImg = useRef<HTMLImageElement | null>(null);
  const imagesLoaded = useRef(0);

  // Read variant from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get("hero");
    if (v === "a" || v === "b" || v === "c") {
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
    let logos: LogoNode[] = [];
    let time = 0;

    // Load token images
    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img); // continue even if fails
        img.src = src;
      });

    const initImages = async () => {
      photonImg.current = await loadImage("/assets/photon.svg");
      atoneImg.current = await loadImage("/assets/atone.svg");
      imagesLoaded.current = 2;
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
      const count = Math.min(50, Math.floor(w / 25));

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

    const createLogos = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      logos = [];

      if (variant === "a") {
        // Orbital: 4 ATONE logos orbiting the center
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 2 * i) / 4;
          logos.push({
            x: w / 2 + Math.cos(angle) * Math.min(w, h) * 0.28,
            y: h / 2 + Math.sin(angle) * Math.min(w, h) * 0.25,
            size: 28,
            speedX: 0,
            speedY: 0,
            opacity: 0.15,
            rotation: angle,
            rotationSpeed: 0.003 + Math.random() * 0.002,
            type: "atone",
          });
        }
      } else if (variant === "b") {
        // Constellation: mixed logos scattered as bright stars
        const logoCount = Math.min(8, Math.floor(w / 150));
        for (let i = 0; i < logoCount; i++) {
          logos.push({
            x: Math.random() * w * 0.8 + w * 0.1,
            y: Math.random() * h * 0.7 + h * 0.15,
            size: 18 + Math.random() * 14,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: (Math.random() - 0.5) * 0.1,
            opacity: 0.12 + Math.random() * 0.12,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.004,
            type: i % 3 === 0 ? "atone" : "photon",
          });
        }
      } else if (variant === "c") {
        // Emergence: ATONE logos at edges feeding inward
        const edgeLogos = Math.min(6, Math.floor(w / 200));
        for (let i = 0; i < edgeLogos; i++) {
          const side = i % 4;
          let x: number, y: number;
          if (side === 0) { x = Math.random() * w * 0.15; y = Math.random() * h; }
          else if (side === 1) { x = w - Math.random() * w * 0.15; y = Math.random() * h; }
          else if (side === 2) { x = Math.random() * w; y = Math.random() * h * 0.15; }
          else { x = Math.random() * w; y = h - Math.random() * h * 0.15; }

          logos.push({
            x, y,
            size: 22 + Math.random() * 10,
            speedX: (w / 2 - x) * 0.00005,
            speedY: (h / 2 - y) * 0.00005,
            opacity: 0.12 + Math.random() * 0.08,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.003,
            type: "atone",
          });
        }
      }
    };

    const drawParticles = (w: number, h: number) => {
      for (const p of particles) {
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
      }

      // Connections between nearby particles
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

    const drawLogo = (img: HTMLImageElement | null, x: number, y: number, size: number, opacity: number, rotation: number) => {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    const drawVariantA = (w: number, h: number) => {
      // Central ghostly PHOTON logo
      const centerSize = Math.min(w, h) * 0.35;
      const centralPulse = 0.06 + 0.03 * Math.sin(time * 0.008);
      drawLogo(photonImg.current, w / 2, h / 2, centerSize, centralPulse, time * 0.001);

      // Glow behind central logo
      const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, centerSize * 0.6);
      glow.addColorStop(0, `rgba(1, 215, 235, ${0.04 + 0.02 * Math.sin(time * 0.01)})`);
      glow.addColorStop(1, "rgba(1, 215, 235, 0)");
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, centerSize * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Orbiting ATONE logos
      const radius = Math.min(w, h) * 0.3;
      for (let i = 0; i < logos.length; i++) {
        const l = logos[i];
        const angle = (Math.PI * 2 * i) / logos.length + time * l.rotationSpeed;
        // Elliptical orbit
        l.x = w / 2 + Math.cos(angle) * radius;
        l.y = h / 2 + Math.sin(angle) * radius * 0.7;
        const pulse = l.opacity * (0.7 + 0.3 * Math.sin(time * 0.015 + i));
        drawLogo(atoneImg.current, l.x, l.y, l.size, pulse, angle * 0.5);

        // Faint trail line from ATONE to center
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(w / 2, h / 2);
        ctx.strokeStyle = `rgba(1, 215, 235, ${pulse * 0.15})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    const drawVariantB = (w: number, h: number) => {
      // Logos as constellation nodes
      for (const l of logos) {
        l.x += l.speedX;
        l.y += l.speedY;
        l.rotation += l.rotationSpeed;

        // Soft bounce off edges
        if (l.x < w * 0.05 || l.x > w * 0.95) l.speedX *= -1;
        if (l.y < h * 0.1 || l.y > h * 0.9) l.speedY *= -1;

        const img = l.type === "photon" ? photonImg.current : atoneImg.current;
        const pulse = l.opacity * (0.7 + 0.3 * Math.sin(time * 0.012 + l.x));
        drawLogo(img, l.x, l.y, l.size, pulse, l.rotation);

        // Glow behind each logo
        const glow = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.size * 1.5);
        const color = l.type === "photon" ? "1, 215, 235" : "107, 138, 205";
        glow.addColorStop(0, `rgba(${color}, ${pulse * 0.3})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Constellation lines between logos
      for (let i = 0; i < logos.length; i++) {
        for (let j = i + 1; j < logos.length; j++) {
          const dx = logos[i].x - logos[j].x;
          const dy = logos[i].y - logos[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            ctx.beginPath();
            ctx.moveTo(logos[i].x, logos[i].y);
            ctx.lineTo(logos[j].x, logos[j].y);
            ctx.strokeStyle = `rgba(1, 215, 235, ${(1 - dist / 250) * 0.12})`;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([4, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // Also connect logos to nearby particles
      for (const l of logos) {
        for (const p of particles) {
          const dx = l.x - p.x;
          const dy = l.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(1, 215, 235, ${(1 - dist / 100) * 0.06})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      }
    };

    const drawVariantC = (w: number, h: number) => {
      // Central PHOTON formation — particles gravitate toward center in a pattern
      const cx = w / 2;
      const cy = h / 2;
      const formStrength = 0.3 + 0.2 * Math.sin(time * 0.003); // breathing formation

      // Ghost PHOTON at center (fades in and out)
      const ghostOpacity = 0.03 + 0.04 * Math.sin(time * 0.005);
      const ghostSize = Math.min(w, h) * 0.4;
      drawLogo(photonImg.current, cx, cy, ghostSize, ghostOpacity, 0);

      // Particles slightly attracted to center
      for (const p of particles) {
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 30) {
          p.speedX += (dx / dist) * 0.003 * formStrength;
          p.speedY += (dy / dist) * 0.003 * formStrength;
        }
        // Dampen speed to prevent clumping
        p.speedX *= 0.998;
        p.speedY *= 0.998;
      }

      // Edge ATONE logos with energy streams toward center
      for (const l of logos) {
        l.x += l.speedX;
        l.y += l.speedY;
        l.rotation += l.rotationSpeed;

        // Slow drift toward center, then reset to edge
        const distToCenter = Math.sqrt((l.x - cx) ** 2 + (l.y - cy) ** 2);
        if (distToCenter < 60) {
          // Reset to random edge
          const side = Math.floor(Math.random() * 4);
          if (side === 0) { l.x = Math.random() * w * 0.1; l.y = Math.random() * h; }
          else if (side === 1) { l.x = w - Math.random() * w * 0.1; l.y = Math.random() * h; }
          else if (side === 2) { l.x = Math.random() * w; l.y = Math.random() * h * 0.1; }
          else { l.x = Math.random() * w; l.y = h - Math.random() * h * 0.1; }
          l.speedX = (cx - l.x) * 0.0001;
          l.speedY = (cy - l.y) * 0.0001;
        }

        const pulse = l.opacity * (0.6 + 0.4 * Math.sin(time * 0.01 + l.x));
        drawLogo(atoneImg.current, l.x, l.y, l.size, pulse, l.rotation);

        // Energy stream from ATONE toward center
        const streamLen = 3;
        for (let s = 1; s <= streamLen; s++) {
          const t = s / (streamLen + 1);
          const sx = l.x + (cx - l.x) * t;
          const sy = l.y + (cy - l.y) * t;
          const streamOpacity = pulse * 0.2 * (1 - t);
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(1, 215, 235, ${streamOpacity})`;
          ctx.fill();
        }
      }
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time++;

      drawParticles(w, h);

      if (imagesLoaded.current >= 2) {
        if (variant === "a") drawVariantA(w, h);
        else if (variant === "b") drawVariantB(w, h);
        else if (variant === "c") drawVariantC(w, h);
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    createLogos();
    initImages().then(() => {
      // Images loaded, animation will use them
    });
    draw();

    const handleResize = () => {
      resize();
      createParticles();
      createLogos();
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
      {/* Variant toggle — only visible with ?hero param */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).has("hero") && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {(["a", "b", "c"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setVariant(v);
                const url = new URL(window.location.href);
                url.searchParams.set("hero", v);
                window.history.replaceState({}, "", url.toString());
              }}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                variant === v
                  ? "bg-accent text-bg-primary"
                  : "bg-bg-card/80 text-text-secondary border border-border hover:border-accent/50"
              }`}
            >
              {v.toUpperCase()}:{" "}
              {v === "a" ? "Orbital" : v === "b" ? "Constellation" : "Emergence"}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
