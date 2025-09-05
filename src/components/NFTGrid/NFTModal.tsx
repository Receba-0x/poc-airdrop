import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "../Button";
import { ClaimFlow } from "../ClaimFlow";

interface NFTModalProps {
  nft: any;
  isOpen: boolean;
  onClose: () => void;
  onClaim?: () => void;
}

export function NFTModal({ nft, isOpen, onClose, onClaim }: NFTModalProps) {
  const { t } = useLanguage();
  const [claimFlowOpen, setClaimFlowOpen] = useState(false);
  const [isClaimCompleted, setIsClaimCompleted] = useState(false);

  useEffect(() => {
    if (nft && isOpen) {
      const claimKey = `nft_claimed_${nft.tokenId}`;
      const wasClaimed = localStorage.getItem(claimKey) === "true";
      const isNftBurned = nft.status === "burned" || nft.status === "claimed";

      if (wasClaimed || isNftBurned) {
        setIsClaimCompleted(true);
      }
    }
  }, [nft, isOpen]);

  if (!isOpen) return null;

  const canBeClaimed = (nft: any) => {
    if (!nft || !nft.metadata) return false;
    const isPhysicalItem = nft.attributes?.some(
      (attr: any) =>
        attr.trait_type.toLowerCase().includes("category") &&
        !attr.value.toLowerCase().includes("digital") &&
        !attr.value.toLowerCase().includes("gift") &&
        !attr.value.toLowerCase().includes("crypto")
    );
    const isClaimed = nft.status === "burned" || nft.status === "claimed";
    return isPhysicalItem && !isClaimed;
  };

  const handleClaimClick = () => {
    setClaimFlowOpen(true);
  };

  const handleClaimComplete = () => {
    setIsClaimCompleted(true);
    setClaimFlowOpen(false);

    const claimKey = `nft_claimed_${nft.tokenId}`;
    localStorage.setItem(claimKey, "true");

    if (onClaim) {
      onClaim();
    }
  };

  const handleModalClose = () => {
    setClaimFlowOpen(false);
    setIsClaimCompleted(false);
    const claimKey = `nft_claimed_${nft.tokenId}`;
    const wasClaimed = localStorage.getItem(claimKey) === "true";
    if (!wasClaimed) {
      localStorage.removeItem(claimKey);
    }
    onClose();
  };

  const renderClaimSection = () => {
    if (isClaimCompleted) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/20 p-4 rounded-lg border border-green-400/30"
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-1">
                {t("shipping.claimSuccessful") || "Claim Successful!"}
              </h3>
              <p className="text-sm text-gray-300">
                Your physical item is being processed for delivery.
              </p>
            </div>
            <Button onClick={handleModalClose} variant="default">
              {t("common.done") || "Done"}
            </Button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-400/20"
      >
        <div className="text-center space-y-3">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-1">
              {t("nfts.claimAvailable") || "Physical Item Ready"}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t("nfts.claimDescription") ||
                "This NFT can be exchanged for a physical item. Starting the claim process will permanently burn this NFT."}
            </p>
          </div>
          <Button onClick={handleClaimClick} variant="default">
            {t("nfts.claimItem") || "Claim Physical Item"}
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0F0F0F] border border-[#222222] rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">{nft.name}</h2>
                  <button
                    onClick={handleModalClose}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1A1A1A]"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* NFT Image */}
                    <div className="relative group">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        height={300}
                        width={300}
                        className="w-full h-64 object-contain rounded-lg border border-[#333333] p-3 bg-[#1A1A1A] transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/logo_token.png";
                        }}
                      />
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333] hover:border-[#444444] transition-colors">
                        <h3 className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                          {t("nfts.tokenId")}
                        </h3>
                        <p className="text-white font-mono font-bold">
                          #{nft.tokenId}
                        </p>
                      </motion.div>

                      {nft.metadata?.collection && (
                        <motion.div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333] hover:border-[#444444] transition-colors">
                          <h3 className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                            {t("nfts.collection")}
                          </h3>
                          <p className="text-white font-medium text-sm">
                            {nft.metadata.collection.name}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Claim Section */}
                    {canBeClaimed(nft) && renderClaimSection()}
                  </div>

                  <div className="space-y-4 min-h-0">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-bold text-white border-b border-[#333333] pb-2 mb-3">
                        {t("nfts.description")}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {nft.description}
                      </p>
                    </div>

                    {/* Attributes */}
                    {nft.attributes && nft.attributes.length > 0 && (
                      <div className="flex-1 min-h-0">
                        <h3 className="text-lg font-bold text-white border-b border-[#333333] pb-2 mb-3">
                          {t("nfts.attributes")}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333333] scrollbar-track-[#1A1A1A] pr-2">
                          {nft.attributes.map((attr: any, index: number) => (
                            <motion.div
                              key={index}
                              className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 hover:bg-[#222222] transition-colors"
                            >
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-1 tracking-wide">
                                {attr.trait_type}
                              </p>
                              <p className="text-sm font-bold text-white leading-tight break-words">
                                {attr.value}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Claim Flow */}
      <ClaimFlow
        isOpen={claimFlowOpen}
        onClose={() => setClaimFlowOpen(false)}
        nft={nft}
        onBurnComplete={handleClaimComplete}
      />
    </>
  );
}
