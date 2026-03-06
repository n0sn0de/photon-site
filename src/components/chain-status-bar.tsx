"use client";

import { useEffect, useState } from "react";
import { LCD_BASE } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

interface BlockInfo {
  height: string;
  time: string;
  chainId: string;
}

export function ChainStatusBar({ initial }: { initial?: BlockInfo | null }) {
  const [block, setBlock] = useState(initial);
  const [blockTime, setBlockTime] = useState<string>("—");

  useEffect(() => {
    let prevHeight = initial ? parseInt(initial.height) : 0;
    let prevTime = initial ? new Date(initial.time).getTime() : 0;

    const fetchBlock = async () => {
      try {
        const res = await fetch(
          `${LCD_BASE}/cosmos/base/tendermint/v1beta1/blocks/latest`
        );
        if (!res.ok) return;
        const data = await res.json();
        const header = data.block?.header;
        if (!header) return;

        const height = parseInt(header.height);
        const time = new Date(header.time).getTime();

        setBlock({
          height: header.height,
          time: header.time,
          chainId: header.chain_id,
        });

        if (prevHeight > 0 && height > prevHeight) {
          const timeDiff = (time - prevTime) / 1000;
          const blocksDiff = height - prevHeight;
          setBlockTime((timeDiff / blocksDiff).toFixed(1) + "s");
        }

        prevHeight = height;
        prevTime = time;
      } catch {
        // ignore
      }
    };

    const interval = setInterval(fetchBlock, 10_000);
    fetchBlock();
    return () => clearInterval(interval);
  }, [initial]);

  const timeAgo = block
    ? (() => {
        const ago = Math.round(
          (Date.now() - new Date(block.time).getTime()) / 1000
        );
        return ago < 60 ? `${ago}s ago` : `${Math.round(ago / 60)}m ago`;
      })()
    : "—";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary/90 backdrop-blur-lg border-t border-border">
      <div className="max-w-container mx-auto flex items-center justify-center gap-4 md:gap-8 px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-text-muted">Chain</span>
          <span className="text-text-secondary">
            {block?.chainId || "atomone-1"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-text-muted">Block</span>
          <span className="text-text-secondary">
            {block ? formatNumber(parseInt(block.height)) : "—"}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-text-muted">Last Block</span>
          <span className="text-text-secondary">{timeAgo}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-text-muted">Block Time</span>
          <span className="text-text-secondary">{blockTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-text-muted">Node</span>
          <a
            href="https://atomone-lcd.nosnode.com/swagger/"
            target="_blank"
            className="text-accent text-xs"
          >
            NosNode
          </a>
        </div>
      </div>
    </div>
  );
}
