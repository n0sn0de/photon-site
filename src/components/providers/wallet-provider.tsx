"use client";

import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import type { MainWalletBase } from "@cosmos-kit/core";
import { atomoneChain, atomoneAssets } from "@/lib/atomone-chain";
import "@interchain-ui/react/styles";

// Only include AtomOne — no need to load 100+ chains from chain-registry
const allChains = [atomoneChain] as any[];
const allAssets = [atomoneAssets] as any[];

const wallets = [...keplrWallets, ...leapWallets] as MainWalletBase[];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChainProvider
      chains={allChains}
      assetLists={allAssets}
      wallets={wallets}
      throwErrors={false}
      sessionOptions={{
        duration: 1000 * 60 * 60 * 24 * 7,
      }}
      endpointOptions={{
        isLazy: true,
        endpoints: {
          atomone: {
            rpc: ["https://atomone-rpc.nosnode.com"],
            rest: ["https://atomone-lcd.nosnode.com"],
          },
        },
      }}
    >
      {children}
    </ChainProvider>
  );
}
