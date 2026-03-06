"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/data", label: "Data" },
  { href: "/mechanics", label: "Mechanics" },
  { href: "/governance", label: "Governance" },
  { href: "/validators", label: "Validators" },
  { href: "/treasury", label: "Treasury" },
  { href: "/mint", label: "Mint", highlight: true },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <img
          src="/assets/photon.svg"
          alt="Photon"
          className="w-8 h-8"
        />
        <span className="font-mono font-medium text-lg tracking-wider text-text-primary">
          PHOTON
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline",
              pathname === link.href
                ? "text-accent bg-accent/10"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-card",
              link.highlight &&
                pathname !== link.href &&
                "text-accent border border-accent/30 hover:bg-accent/10"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <span
          className={cn(
            "w-5 h-0.5 bg-text-primary transition-all",
            mobileOpen && "rotate-45 translate-y-2"
          )}
        />
        <span
          className={cn(
            "w-5 h-0.5 bg-text-primary transition-all",
            mobileOpen && "opacity-0"
          )}
        />
        <span
          className={cn(
            "w-5 h-0.5 bg-text-primary transition-all",
            mobileOpen && "-rotate-45 -translate-y-2"
          )}
        />
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-bg-primary/95 backdrop-blur-xl border-b border-border md:hidden">
          <div className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-2.5 rounded-md text-sm font-medium transition-colors no-underline",
                  pathname === link.href
                    ? "text-accent bg-accent/10"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
