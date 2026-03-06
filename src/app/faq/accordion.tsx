"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-bg-card rounded-xl border border-border overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-card-hover transition-colors"
            aria-expanded={openIndex === i}
          >
            <span className="text-sm font-medium text-text-primary pr-4">
              {item.q}
            </span>
            <span
              className={cn(
                "text-text-muted transition-transform text-lg flex-shrink-0",
                openIndex === i && "rotate-45"
              )}
            >
              +
            </span>
          </button>
          <div
            className={cn(
              "grid transition-all duration-200",
              openIndex === i
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                {item.a}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
