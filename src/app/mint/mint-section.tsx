"use client";

import dynamic from "next/dynamic";

const WalletProvider = dynamic(
  () =>
    import("@/components/providers/wallet-provider").then(
      (mod) => mod.WalletProvider
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-bg-card rounded-xl border border-border p-6 md:p-8 max-w-lg mx-auto animate-pulse">
        <div className="h-6 bg-bg-elevated rounded w-1/3 mb-4" />
        <div className="h-4 bg-bg-elevated rounded w-2/3 mb-6" />
        <div className="h-12 bg-bg-elevated rounded" />
      </div>
    ),
  }
);

const WalletConnect = dynamic(
  () =>
    import("@/components/wallet-connect").then((mod) => mod.WalletConnect),
  {
    ssr: false,
    loading: () => (
      <div className="bg-bg-card rounded-xl border border-border p-6 md:p-8 max-w-lg mx-auto animate-pulse">
        <div className="h-6 bg-bg-elevated rounded w-1/3 mb-4" />
        <div className="h-4 bg-bg-elevated rounded w-2/3 mb-6" />
        <div className="h-12 bg-bg-elevated rounded" />
      </div>
    ),
  }
);

export function MintSection({ conversionRate }: { conversionRate: number }) {
  return (
    <WalletProvider>
      <WalletConnect conversionRate={conversionRate} />
    </WalletProvider>
  );
}
