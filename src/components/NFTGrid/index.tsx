"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNFTs } from "@/hooks/useNFTs";
import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollAnimation } from "../ScrollAnimation";
import Image from "next/image";
import { NFTModal } from "./NFTModal";

export function NFTGrid() {
  const { t } = useLanguage();
  const { nfts, isLoading, error, refreshNFTs } = useNFTs();
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNFTClick = (nft: any) => {
    setSelectedNFT(nft);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNFT(null);
  };

  const handleClaim = () => {
    refreshNFTs();
  };

  if (isLoading) {
    return (
      <ScrollAnimation
        type="fade"
        direction="up"
        duration={0.6}
        className="py-10 text-center text-white"
      >
        <motion.div
          className="flex items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p>{t("common.loading")}...</p>
        </motion.div>
      </ScrollAnimation>
    );
  }

  if (error) {
    return (
      <ScrollAnimation
        type="fade"
        direction="up"
        duration={0.6}
        className="py-10 text-center text-red-500"
      >
        <motion.p
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      </ScrollAnimation>
    );
  }

  if (nfts.length === 0) {
    return (
      <ScrollAnimation
        type="fade"
        direction="up"
        duration={0.6}
        className="py-10 text-center text-white"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-[#333333]">
            <span className="text-2xl">🎨</span>
          </div>
          <p>{t("nfts.noNFTs")}</p>
        </motion.div>
      </ScrollAnimation>
    );
  }

  return (
    <>
      <ScrollAnimation
        type="fade"
        direction="up"
        duration={0.8}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {nfts.map((nft, index) => (
          <motion.div
            key={nft.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            onClick={() => handleNFTClick(nft)}
            className="bg-[#0F0F0F] hover:bg-[#1E1E1E] transition-all duration-300 ease-in-out border border-[#222222] rounded-lg overflow-hidden cursor-pointer group"
            whileHover={{ transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={nft.image}
                alt={nft.name}
                height={1000000}
                width={1000000}
                className="w-full h-full object-contain rounded-lg p-4 hover:scale-110 transition-all duration-300 ease-in-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/logo_token.png";
                }}
              />
            </div>

            <motion.div
              className="p-4"
              initial={false}
              whileHover={{ backgroundColor: "#1A1A1A" }}
              transition={{ duration: 0.2 }}
            >
              <motion.h3
                className="font-medium text-white truncate mb-1"
                initial={false}
                whileHover={{ color: "#28D939" }}
                transition={{ duration: 0.2 }}
              >
                {nft.name}
              </motion.h3>
              <p className="text-sm text-gray-400 font-mono">#{nft.tokenId}</p>

              <div className="mt-3 flex items-center justify-between">
                <motion.span
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#1A1A1A] text-green-400 border border-green-400/20"
                  whileHover={{
                    backgroundColor: "#28D939",
                    color: "#000000",
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {t("nfts.owned")}
                </motion.span>

                <motion.button
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("nfts.viewDetails")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </ScrollAnimation>

      {selectedNFT && modalOpen && (
        <NFTModal
          nft={selectedNFT}
          isOpen={modalOpen}
          onClose={closeModal}
          onClaim={handleClaim}
        />
      )}
    </>
  );
}
