"use client";
import React from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useClipboard } from "@/hooks/useClipboard";
import { Button } from "../Button";

interface WalletAddressProps {
  address: string;
  label?: string;
  showExplorerLink?: boolean;
  className?: string;
}

export function WalletAddress({
  address,
  label = "Deposit Address",
  showExplorerLink = true,
  className = "",
}: WalletAddressProps) {
  const { copyToClipboard, isCopied } = useClipboard();

  const handleCopy = async () => {
    try {
      await copyToClipboard(address);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleOpenExplorer = () => {
    const explorerUrl = `https://solscan.io/account/${address}?cluster=devnet`;
    window.open(explorerUrl, "_blank");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-12">
          {label}
        </label>
        {showExplorerLink && (
          <button
            onClick={handleOpenExplorer}
            className="flex items-center gap-1 text-primary-10 hover:text-primary-8 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center justify-between p-4 bg-neutral-4 rounded-lg border border-neutral-6">
          <div className="w-1/2">
            <p className="font-mono text-sm text-neutral-12 break-all">
              {address}
            </p>
          </div>

          <Button onClick={handleCopy} size="sm" variant="ghost">
            <Copy className="w-4 h-4" />
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
