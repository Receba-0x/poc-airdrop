"use client";
import React from "react";
import { BaseModal } from "../TransactionModals/BaseModal";
import { Button } from "../Button";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

interface WonItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onKeep: () => void;
  onSell: () => void;
  isSelling?: boolean;
}

export function WonItemModal({
  isOpen,
  onClose,
  item,
  onKeep,
  onSell,
  isSelling = false,
}: WonItemModalProps) {
  const { t } = useLanguage();

  const handleSell = () => {
    onSell();
    onClose();
  };

  const handleKeep = () => {
    onKeep();
    onClose();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "text-gray-400";
      case "uncommon":
        return "text-green-400";
      case "rare":
        return "text-blue-400";
      case "epic":
        return "text-purple-400";
      case "legendary":
        return "text-yellow-400";
      case "mythic":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "bg-gray-500";
      case "uncommon":
        return "bg-green-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-yellow-500";
      case "mythic":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("wonItem.title")}
      size="lg"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          {item?.imageUrl && (
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${getRarityBgColor(item?.rarity)}`}>
            {item?.rarity}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {item?.name}
          </h3>
          <p className={`text-sm sm:text-base font-semibold ${getRarityColor(item?.rarity)}`}>
            {item?.rarity}
          </p>
          {item?.description && (
            <p className="text-sm text-neutral-11 max-w-md">
              {item.description}
            </p>
          )}
          {item?.value && (
            <p className="text-lg font-bold text-[#FFD700]">
              {item.value} USD
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={handleKeep}
            variant="outline"
            className="flex-1 h-12"
            disabled={isSelling}
          >
            {t("wonItem.keep")}
          </Button>
          <Button
            onClick={handleSell}
            variant="secondary"
            className="flex-1 h-12"
            disabled={isSelling}
          >
            {isSelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t("wonItem.selling")}
              </>
            ) : (
              <>
                {t("wonItem.sell")}
              </>
            )}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
