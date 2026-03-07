"use client";

import { useState, useCallback, useEffect } from "react";
import { useChain } from "@cosmos-kit/react";
import { Registry } from "@cosmjs/proto-signing";
import { SigningStargateClient, defaultRegistryTypes } from "@cosmjs/stargate";
import { MSG_MINT_PHOTON_TYPE } from "@/lib/chain-config";
import { LCD_BASE, RPC_BASE, ATONE_DENOM, PHOTON_DENOM, MICRO_MULTIPLIER } from "@/lib/constants";
import { formatNumber, formatToken } from "@/lib/format";

// Manual protobuf encoder for MsgMintPhoton
// Proto: message MsgMintPhoton { string sender = 1; cosmos.base.v1beta1.Coin amount = 2; }
// Coin:  message Coin { string denom = 1; string amount = 2; }
function encodeVarint(value: number): number[] {
  const bytes: number[] = [];
  let v = value;
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v & 0x7f);
  return bytes;
}

function encodeStringField(fieldNumber: number, value: string): number[] {
  const encoded = new TextEncoder().encode(value);
  return [
    ...encodeVarint((fieldNumber << 3) | 2),
    ...encodeVarint(encoded.length),
    ...encoded,
  ];
}

function encodeBytesField(fieldNumber: number, value: Uint8Array): number[] {
  return [
    ...encodeVarint((fieldNumber << 3) | 2),
    ...encodeVarint(value.length),
    ...value,
  ];
}

function encodeMsgMintPhoton(message: any): Uint8Array {
  const parts: number[] = [];
  if (message.sender) {
    parts.push(...encodeStringField(1, message.sender));
  }
  if (message.amount) {
    const coinParts: number[] = [];
    if (message.amount.denom) {
      coinParts.push(...encodeStringField(1, message.amount.denom));
    }
    if (message.amount.amount) {
      coinParts.push(...encodeStringField(2, message.amount.amount));
    }
    parts.push(...encodeBytesField(2, new Uint8Array(coinParts)));
  }
  return new Uint8Array(parts);
}

interface BalanceState {
  atoneBalance: string;
  photonBalance: string;
}

interface MintState {
  loading: boolean;
  txHash: string;
  error: string;
}

export function WalletConnect({ conversionRate }: { conversionRate: number }) {
  const {
    connect,
    disconnect,
    address,
    status,
    wallet,
    getOfflineSignerDirect,
  } = useChain("atomone");

  const [balances, setBalances] = useState<BalanceState>({
    atoneBalance: "0",
    photonBalance: "0",
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

  const fetchBalances = useCallback(async (addr: string) => {
    try {
      const res = await fetch(
        `${LCD_BASE}/cosmos/bank/v1beta1/balances/${addr}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const bals = data.balances || [];
      const atone = bals.find(
        (b: { denom: string }) => b.denom === ATONE_DENOM
      );
      const photon = bals.find(
        (b: { denom: string }) => b.denom === PHOTON_DENOM
      );
      setBalances({
        atoneBalance: atone?.amount || "0",
        photonBalance: photon?.amount || "0",
      });
    } catch {
      // ignore
    }
  }, []);

  // Fetch balances when connected
  useEffect(() => {
    if (status === "Connected" && address) {
      fetchBalances(address);
      const interval = setInterval(() => fetchBalances(address), 30_000);
      return () => clearInterval(interval);
    }
  }, [status, address, fetchBalances]);

  const handleConnect = useCallback(async () => {
    try {
      setMint({ loading: false, txHash: "", error: "" });
      await connect();
    } catch (err: any) {
      setMint((prev) => ({
        ...prev,
        error: err?.message || "Failed to connect wallet",
      }));
    }
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setBalances({ atoneBalance: "0", photonBalance: "0" });
      setMint({ loading: false, txHash: "", error: "" });
      setAtoneInput("");
    } catch {
      // ignore
    }
  }, [disconnect]);

  const handleMint = useCallback(async () => {
    if (!address || !atoneInput || parseFloat(atoneInput) <= 0) return;

    setMint({ loading: true, txHash: "", error: "" });

    try {
      const signer = getOfflineSignerDirect();

      // Create registry with the custom MsgMintPhoton type
      const registry = new Registry(defaultRegistryTypes);
      registry.register(MSG_MINT_PHOTON_TYPE, {
        encode: (message: any) => ({
          finish: () => encodeMsgMintPhoton(message),
        }),
        decode: () => ({}),
        fromPartial: (obj: any) => obj,
      } as any);

      const client = await SigningStargateClient.connectWithSigner(
        RPC_BASE,
        signer,
        { registry }
      );

      const microAmount = Math.floor(
        parseFloat(atoneInput) * MICRO_MULTIPLIER
      ).toString();

      const msg = {
        typeUrl: MSG_MINT_PHOTON_TYPE,
        value: {
          sender: address,
          amount: { denom: ATONE_DENOM, amount: microAmount },
        },
      };

      // MsgMintPhoton is fee-exempt
      const fee = { amount: [], gas: "200000" };

      let txHash = "";
      try {
        const result = await client.signAndBroadcast(address, [msg], fee, "");
        if (result.code !== 0) {
          throw new Error(
            result.rawLog || `Transaction failed with code ${result.code}`
          );
        }
        txHash = result.transactionHash;
      } catch (broadcastErr: any) {
        const errMsg = broadcastErr?.message || "";
        // TX was broadcast but node can't confirm because indexing is off
        if (errMsg.includes("indexing is disabled")) {
          txHash = "pending";
        } else {
          throw broadcastErr;
        }
      }

      setMint({ loading: false, txHash, error: "" });

      // Refresh balances after a few seconds
      setTimeout(() => fetchBalances(address), 3000);
    } catch (err: any) {
      setMint({
        loading: false,
        txHash: "",
        error: err?.message || "Transaction failed",
      });
    }
  }, [address, atoneInput, fetchBalances, getOfflineSignerDirect]);

  const isConnected = status === "Connected" && address;
  const walletName = wallet?.prettyName || wallet?.name || "";

  if (!isConnected) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-6 md:p-8 max-w-lg mx-auto">
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Connect Wallet
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Connect your wallet to mint PHOTON by burning ATONE directly on-chain.
        </p>
        <button
          onClick={handleConnect}
          disabled={status === "Connecting"}
          className="w-full py-3 px-4 rounded-lg bg-accent/10 border border-accent/30 text-accent font-mono text-sm hover:bg-accent/20 transition-colors disabled:opacity-50"
        >
          {status === "Connecting" ? "Connecting..." : "Connect Wallet"}
        </button>
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
              {walletName}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs font-mono text-text-muted hover:text-danger transition-colors"
          >
            Disconnect
          </button>
        </div>
        <div className="text-xs font-mono text-text-secondary break-all mb-4">
          {address}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <img src="/assets/atone.svg" alt="ATONE" className="w-4 h-4" />
              <span className="text-xs font-mono text-text-muted">ATONE</span>
            </div>
            <div className="font-mono text-text-primary">
              {formatToken(balances.atoneBalance)}
            </div>
          </div>
          <div className="bg-bg-elevated rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <img src="/assets/photon.svg" alt="PHOTON" className="w-4 h-4" />
              <span className="text-xs font-mono text-text-muted">PHOTON</span>
            </div>
            <div className="font-mono text-accent">
              {formatToken(balances.photonBalance)}
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
                  const max =
                    parseInt(balances.atoneBalance) / MICRO_MULTIPLIER;
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
              ✅ Transaction broadcast successfully!
            </div>
            {mint.txHash === "pending" ? (
              <p className="text-xs font-mono text-text-secondary">
                Your balances will update shortly. Check{" "}
                <a
                  href={`https://www.mintscan.io/atomone/address/${address}`}
                  target="_blank"
                  className="text-accent hover:underline"
                >
                  your account on Mintscan
                </a>{" "}
                to verify.
              </p>
            ) : (
              <a
                href={`https://www.mintscan.io/atomone/tx/${mint.txHash}`}
                target="_blank"
                className="text-xs font-mono break-all text-accent hover:underline"
              >
                {mint.txHash}
              </a>
            )}
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
