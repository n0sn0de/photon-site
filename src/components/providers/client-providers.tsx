"use client";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Wallet provider moved to /mint page only — no global cosmos-kit bundle
  return <>{children}</>;
}
