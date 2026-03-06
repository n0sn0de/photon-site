"use client";

import { useState, useCallback, useEffect } from "react";
import { atomoneChainInfo, MSG_MINT_PHOTON_TYPE } from "@/lib/chain-config";
import { LCD_BASE, ATONE_DENOM, PHOTON_DENOM, MICRO_MULTIPLIER } from "@/lib/constants";
import { formatNumber, formatToken } from "@/lib/format";

interface WalletState {
  connected: boolean;
  address: string;
  atoneBalance: string;
  photonBalance: string;
  walletName: string;
}

interface MintState {
  loading: boolean;
  txHash: string;
  error: string;
}

export function WalletConnect({ conversionRate }: { conversionRate: number }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: "",
    atoneBalance: "0",
    photonBalance: "0",
    walletName: "",
  });
  const [mint, setMint] = useState<MintState>({
    loading: false,
    txHash: "",
    error: "",
  });
  const [atoneInput, setAtoneInput] = useState("");
  const photonOutput =
    atoneInput && conversionRate > 0
      ? parseFloat(atoneInput) * conversionRate
      : null;

  const fetchBalances = useCallback(async (address: string) => {
    try {
      const res = await fetch(
        `${LCD_BASE}/cosmos/bank/v1beta1/balances/${address}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const balances = data.balances || [];
      const atone = balances.find(
        (b: { denom: string }) => b.denom === ATONE_DENOM
      );
      const photon = balances.find(
        (b: { denom: string }) => b.denom === PHOTON_DENOM
      );
      setWallet((prev) => ({
        ...prev,
        atoneBalance: atone?.amount || "0",
        photonBalance: photon?.amount || "0",
      }));
    } catch {
      // ignore
    }
  }, []);

  const connectWallet = useCallback(
    async (walletType: "keplr" | "leap") => {
      try {
        const provider =
          walletType === "keplr"
            ? (window as any).keplr
            : (window as any).leap;
        if (!provider) {
          setMint((prev) => ({
            ...prev,
            error: `${walletType === "keplr" ? "Keplr" : "Leap"} wallet not found. Please install it.`,
          }));
          return;
        }

        // Suggest chain if needed
        try {
          await provider.experimentalSuggestChain(atomoneChainInfo);
        } catch {
          // Chain may already be added
        }

        await provider.enable(atomoneChainInfo.chainId);
        const offlineSigner = provider.getOfflineSigner(atomoneChainInfo.chainId);
        const accounts = await offlineSigner.getAccounts();

        if (accounts.length === 0) {
          setMint((prev) => ({
            ...prev,
            error: "No accounts found in wallet.",
          }));
          return;
        }

        const address = accounts[0].address;
        setWallet({
          connected: true,
          address,
          atoneBalance: "0",
          photonBalance: "0",
          walletName: walletType === "keplr" ? "Keplr" : "Leap",
        });
        setMint({ loading: false, txHash: "", error: "" });

        await fetchBalances(address);
      } catch (err: any) {
        setMint((prev) => ({
          ...prev,
          error: err?.message || "Failed to connect wallet",
        }));
      }
    },
    [fetchBalances]
  );

  const disconnect = useCallback(() => {
    setWallet({
      connected: false,
      address: "",
      atoneBalance: "0",
      photonBalance: "0",
      walletName: "",
    });
    setMint({ loading: false, txHash: "", error: "" });
    setAtoneInput("");
  }, []);

  const handleMint = useCallback(async () => {
    if (!wallet.connected || !atoneInput || parseFloat(atoneInput) <= 0) return;

    setMint({ loading: true, txHash: "", error: "" });

    try {
      const walletType = wallet.walletName.toLowerCase() as "keplr" | "leap";
      const provider =
        walletType === "keplr"
          ? (window as any).keplr
          : (window as any).leap;

      const offlineSigner = provider.getOfflineSigner(atomoneChainInfo.chainId);

      // Dynamic import CosmJS
      const { SigningStargateClient } = await import("@cosmjs/stargate");

      const client = await SigningStargateClient.connectWithSigner(
        atomoneChainInfo.rpc,
        offlineSigner
      );

      const microAmount = Math.floor(
        parseFloat(atoneInput) * MICRO_MULTIPLIER
      ).toString();

      const msg = {
        typeUrl: MSG_MINT_PHOTON_TYPE,
        value: {
          sender: wallet.address,
          amount: { denom: ATONE_DENOM, amount: microAmount },
        },
      };

      // MsgMintPhoton is fee-exempt
      const fee = { amount: [], gas: "200000" };

      const result = await client.signAndBroadcast(
        wallet.address,
        [msg],
        fee,
        ""
      );

      if (result.code !== 0) {
        throw new Error(result.rawLog || `Transaction failed with code ${result.code}`);
      }

      setMint({ loading: false, txHash: result.transactionHash, error: "" });

      // Refresh balances
      setTimeout(() => fetchBalances(wallet.address), 3000);
    } catch (err: any) {
      setMint({
        loading: false,
        txHash: "",
        error: err?.message || "Transaction failed",
      });
    }
  }, [wallet, atoneInput, fetchBalances]);

  // Refresh balances periodically
  useEffect(() => {
    if (!wallet.connected) return;
    const interval = setInterval(() => fetchBalances(wallet.address), 30_000);
    return () => clearInterval(interval);
  }, [wallet.connected, wallet.address, fetchBalances]);

  if (!wallet.connected) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-6 md:p-8 max-w-lg mx-auto">
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Connect Wallet
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Connect your wallet to mint PHOTON by burning ATONE directly on-chain.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => connectWallet("keplr")}
            className="w-full py-3 px-4 rounded-lg bg-accent/10 border border-accent/30 text-accent font-mono text-sm hover:bg-accent/20 transition-colors"
          >
            Connect Keplr
          </button>
          <button
            onClick={() => connectWallet("leap")}
            className="w-full py-3 px-4 rounded-lg bg-bg-elevated border border-border text-text-secondary font-mono text-sm hover:bg-bg-card-hover transition-colors"
          >
            Connect Leap
          </button>
        </div>
        {mint.error && (
          <p className="text-xs text-danger mt-3">{mint.error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Wallet info */}
      <div className="bg-bg-card rounded-xl border border-accent/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-mono text-text-muted">
              {wallet.walletName}
            </span>
          </div>
          <button
            onClick={disconnect}
            className="text-xs font-mono text-text-muted hover:text-danger transition-colors"
          >
            Disconnect
          </button>
        </div>
        <div className="text-xs font-mono text-text-secondary break-all mb-4">
          {wallet.address}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="text-xs font-mono text-text-muted mb-1">ATONE</div>
            <div className="font-mono text-text-primary">
              {formatToken(wallet.atoneBalance)}
            </div>
          </div>
          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="text-xs font-mono text-text-muted mb-1">
              PHOTON
            </div>
            <div className="font-mono text-accent">
              {formatToken(wallet.photonBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Mint form */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h3 className="font-mono text-sm text-text-primary mb-4">
          Mint PHOTON
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-text-muted mb-2 block">
              ATONE to burn
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="any"
                value={atoneInput}
                onChange={(e) => setAtoneInput(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
              />
              <button
                onClick={() => {
                  const max = parseInt(wallet.atoneBalance) / MICRO_MULTIPLIER;
                  setAtoneInput(max.toString());
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-accent hover:text-accent-bright"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="text-center text-accent text-xl">⚡</div>

          <div>
            <label className="text-xs font-mono text-text-muted mb-2 block">
              PHOTON you&apos;ll receive
            </label>
            <div className="text-xl font-mono text-accent">
              {photonOutput !== null
                ? formatNumber(photonOutput, 4) + " PHOTON"
                : "—"}
            </div>
            <div className="text-xs font-mono text-text-muted mt-1">
              Rate: {conversionRate.toFixed(4)} PHOTON/ATONE
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={
              mint.loading || !atoneInput || parseFloat(atoneInput) <= 0
            }
            className="w-full py-3 px-4 rounded-lg bg-accent text-bg-primary font-mono font-medium text-sm hover:bg-accent-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mint.loading ? "Broadcasting..." : "🔥 Burn ATONE → Mint PHOTON"}
          </button>
        </div>

        {mint.error && (
          <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">
            {mint.error}
          </div>
        )}

        {mint.txHash && (
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="text-xs text-success font-mono mb-1">
              ✅ Transaction successful!
            </div>
            <a
              href={`https://www.mintscan.io/atomone/tx/${mint.txHash}`}
              target="_blank"
              className="text-xs font-mono break-all"
            >
              {mint.txHash}
            </a>
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted text-center">
        ⚠️ Burning ATONE is irreversible. MsgMintPhoton is fee-exempt — no
        PHOTON needed for this transaction.
      </p>
    </div>
  );
}
