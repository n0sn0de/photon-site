"use client";

import { useCallback, useMemo } from "react";

interface ConversionChartProps {
  /** Current photon supply in tokens (not micro) */
  currentPhotonSupply: number;
  /** Current ATONE supply in tokens */
  atoneSupply: number;
  /** Simulated additional mint amount */
  simulatedMint: number;
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
}

const MAX_PHOTON = 1_000_000_000;

/**
 * Conversion rate formula: (1B - photon_supply) / atone_supply
 * As photon_supply increases, rate decreases linearly.
 */
function calcRate(photonSupply: number, atoneSupply: number): number {
  if (atoneSupply === 0) return 0;
  return (MAX_PHOTON - photonSupply) / atoneSupply;
}

export function ConversionChart({
  currentPhotonSupply,
  atoneSupply,
  simulatedMint,
  width = 700,
  height = 350,
}: ConversionChartProps) {
  const padding = { top: 30, right: 30, bottom: 50, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Generate curve points (photon supply from 0 to 1B)
  const points = useMemo(() => {
    const pts: Array<{ x: number; y: number; supply: number; rate: number }> = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const supply = (i / steps) * MAX_PHOTON;
      const rate = calcRate(supply, atoneSupply);
      pts.push({
        x: padding.left + (supply / MAX_PHOTON) * chartW,
        y: padding.top + chartH - (rate / calcRate(0, atoneSupply)) * chartH,
        supply,
        rate,
      });
    }
    return pts;
  }, [atoneSupply, chartW, chartH, padding.left, padding.top]);

  const maxRate = calcRate(0, atoneSupply);
  const currentRate = calcRate(currentPhotonSupply, atoneSupply);
  const simulatedSupply = currentPhotonSupply + simulatedMint;
  const simulatedRate = calcRate(Math.min(simulatedSupply, MAX_PHOTON), atoneSupply);

  // Current position on chart
  const currentX = padding.left + (currentPhotonSupply / MAX_PHOTON) * chartW;
  const currentY = padding.top + chartH - (currentRate / maxRate) * chartH;

  // Simulated position
  const simX = padding.left + (Math.min(simulatedSupply, MAX_PHOTON) / MAX_PHOTON) * chartW;
  const simY = padding.top + chartH - (simulatedRate / maxRate) * chartH;

  // Build SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Filled area under curve up to current supply
  const filledPoints = points.filter((p) => p.supply <= currentPhotonSupply);
  const filledPath = filledPoints.length > 1
    ? filledPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ") +
      ` L ${currentX.toFixed(1)} ${(padding.top + chartH).toFixed(1)} L ${padding.left} ${(padding.top + chartH).toFixed(1)} Z`
    : "";

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.ceil(maxRate / 5);
    for (let v = 0; v <= maxRate; v += step) ticks.push(v);
    return ticks;
  }, [maxRate]);

  // X-axis ticks (in millions)
  const xTicks = [0, 200, 400, 600, 800, 1000];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="PHOTON conversion rate curve"
    >
      <defs>
        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#01D7EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#01D7EB" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="curveStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#01D7EB" />
          <stop offset="100%" stopColor="#01D7EB" stopOpacity="0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {yTicks.map((v) => {
        const y = padding.top + chartH - (v / maxRate) * chartH;
        return (
          <g key={`y-${v}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + chartW}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-text-muted text-[10px] font-mono"
            >
              {v.toFixed(1)}
            </text>
          </g>
        );
      })}

      {xTicks.map((v) => {
        const x = padding.left + (v / 1000) * chartW;
        return (
          <g key={`x-${v}`}>
            <line
              x1={x}
              y1={padding.top}
              x2={x}
              y2={padding.top + chartH}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4 4"
            />
            <text
              x={x}
              y={padding.top + chartH + 20}
              textAnchor="middle"
              className="fill-text-muted text-[10px] font-mono"
            >
              {v === 0 ? "0" : `${v}M`}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text
        x={padding.left + chartW / 2}
        y={height - 5}
        textAnchor="middle"
        className="fill-text-secondary text-[11px] font-mono"
      >
        PHOTON Supply
      </text>
      <text
        x={15}
        y={padding.top + chartH / 2}
        textAnchor="middle"
        className="fill-text-secondary text-[11px] font-mono"
        transform={`rotate(-90, 15, ${padding.top + chartH / 2})`}
      >
        Rate (PHOTON per ATONE)
      </text>

      {/* Filled area under curve (minted region) */}
      {filledPath && (
        <path d={filledPath} fill="url(#curveFill)" />
      )}

      {/* Main curve */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#curveStroke)"
        strokeWidth="2"
      />

      {/* Simulated region highlight */}
      {simulatedMint > 0 && (
        <>
          {/* Vertical line at simulated position */}
          <line
            x1={simX}
            y1={simY}
            x2={simX}
            y2={padding.top + chartH}
            stroke="#fbbf24"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          {/* Horizontal line from simulated point */}
          <line
            x1={padding.left}
            y1={simY}
            x2={simX}
            y2={simY}
            stroke="#fbbf24"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          {/* Simulated dot */}
          <circle
            cx={simX}
            cy={simY}
            r="5"
            fill="#fbbf24"
            opacity="0.9"
            filter="url(#glow)"
          />
          {/* Label */}
          <text
            x={simX}
            y={simY - 12}
            textAnchor="middle"
            className="fill-warning text-[10px] font-mono font-medium"
          >
            {simulatedRate.toFixed(2)}:1
          </text>
        </>
      )}

      {/* Current position marker */}
      <line
        x1={currentX}
        y1={currentY}
        x2={currentX}
        y2={padding.top + chartH}
        stroke="#01D7EB"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <line
        x1={padding.left}
        y1={currentY}
        x2={currentX}
        y2={currentY}
        stroke="#01D7EB"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <circle
        cx={currentX}
        cy={currentY}
        r="6"
        fill="#01D7EB"
        filter="url(#glow)"
      />
      <text
        x={currentX + 10}
        y={currentY - 8}
        className="fill-accent text-[11px] font-mono font-medium"
      >
        Now: {currentRate.toFixed(2)}:1
      </text>
    </svg>
  );
}
