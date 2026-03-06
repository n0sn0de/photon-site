"use client";

import { WalletProvider } from "./wallet-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
