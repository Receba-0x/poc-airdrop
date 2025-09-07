import React from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useClipboard } from "@/hooks/useClipboard";

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
        <div className="flex items-center gap-3 p-4 bg-neutral-4 rounded-lg border border-neutral-6">
          <div className="flex-1">
            <p className="font-mono text-sm text-neutral-12 break-all">
              {address}
            </p>
          </div>

          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 bg-primary-8 hover:bg-primary-7 text-primary-12 rounded-md transition-colors text-sm font-medium min-w-[80px] justify-center"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="text-center text-neutral-11 text-sm flex items-center justify-center gap-3">
        <div className="min-w-32 w-32 h-32 mx-auto mb-2 bg-neutral-5 rounded-lg flex items-center justify-center">
          <span className="text-neutral-8 w-full">QR Code</span>
        </div>
        <p className="w-max">
          QR Codes let you send crypto faster from your phone. Open your wallet
          app, select ‘Send’, and scan the code to avoid typing the address
          manually
        </p>
      </div>
    </div>
  );
}
