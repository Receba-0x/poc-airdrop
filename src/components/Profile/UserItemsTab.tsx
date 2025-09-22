"use client";

import React from "react";
import Image from "next/image";
import { useUserItems } from "@/hooks/useItem";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserItem } from "@/services/user/UserService";

export function UserItemsTab() {
  const { t } = useLanguage();
  const { items, isLoading, isError, total, totalPage } = useUserItems();

  const translateWithInterpolation = (
    key: string,
    values: Record<string, string | number>
  ) => {
    let text = t(key);
    Object.entries(values).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, value.toString());
    });
    return text;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "COMMON":
        return "text-gray-600 bg-gray-100";
      case "UNCOMMON":
        return "text-green-600 bg-green-100";
      case "RARE":
        return "text-blue-600 bg-blue-100";
      case "EPIC":
        return "text-purple-600 bg-purple-100";
      case "LEGENDARY":
        return "text-orange-600 bg-orange-100";
      case "MYTHIC":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-10"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-11">
          Erro ao carregar itens. Tente novamente.
        </p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4">
          <svg
            className="w-full h-full text-neutral-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-12 mb-2">
          {t("items.noItems")}
        </h3>
        <p className="text-neutral-10">{t("items.noItemsDescription")}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-neutral-12 mb-4">
        {t("items.title")}
      </h2>

      <div className="bg-neutral-4 rounded-xl border border-neutral-6 overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 bg-neutral-4 border-b border-neutral-6 text-sm font-medium text-neutral-11">
          <div>Type</div>
          <div>Name</div>
          <div>Rarity</div>
          <div>Value</div>
          <div>Date Won</div>
          <div>Status</div>
        </div>

        <div className="divide-y divide-neutral-6">
          {items.map((item: UserItem, index: number) => (
            <div
              key={item.id}
              className="grid grid-cols-6 gap-4 p-4 text-sm hover:bg-neutral-4 transition-colors bg-neutral-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-neutral-12 font-medium truncate">
                  {(() => {
                    const translations = {
                      en: {
                        SOL: "SOL Token",
                        PHYSICAL: "Physical Item",
                        NFT: "NFT",
                        SPECIAL: "Special Item",
                      },
                      pt: {
                        SOL: "Token SOL",
                        PHYSICAL: "Item Físico",
                        NFT: "NFT",
                        SPECIAL: "Item Especial",
                      },
                    };
                    return (
                      translations["pt"][
                        item.item.type as keyof typeof translations.pt
                      ] || item.item.type
                    );
                  })()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {item.item.imageUrl && (
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.item.imageUrl}
                      alt={item.item.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <span className="text-neutral-12 font-medium truncate">
                  {item.item.name}
                </span>
              </div>

              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(
                    item.item.rarity
                  )}`}
                >
                  {(() => {
                    const translations = {
                      en: {
                        COMMON: "Common",
                        UNCOMMON: "Uncommon",
                        RARE: "Rare",
                        EPIC: "Epic",
                        LEGENDARY: "Legendary",
                        MYTHIC: "Mythic",
                      },
                      pt: {
                        COMMON: "Comum",
                        UNCOMMON: "Incomum",
                        RARE: "Raro",
                        EPIC: "Épico",
                        LEGENDARY: "Lendário",
                        MYTHIC: "Mítico",
                      },
                    };
                    return (
                      translations["pt"][
                        item.item.rarity as keyof typeof translations.pt
                      ] || item.item.rarity
                    );
                  })()}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-12 font-medium">
                  {item.item.type === "SOL"
                    ? `${item.item.value} SOL`
                    : `$${item.item.value}`}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-11 font-semibold">
                  {new Date(item.acquiredAt).toLocaleTimeString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center">
                <span className="px-2 py-1 rounded-full border text-xs font-medium bg-green-3 border-green-6 text-green-11">
                  Recebido
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer da Tabela */}
        <div className="p-4 bg-neutral-4 border-t border-neutral-6">
          <div className="flex items-center justify-between text-sm">
            <div className="text-neutral-11">
              {translateWithInterpolation("items.showing", {
                current: totalPage,
                total: total,
              })}
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                {t("items.previous")}
              </button>
              <button className="px-3 py-1 bg-primary-10 text-neutral-1 rounded">
                1
              </button>
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                2
              </button>
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                {t("items.next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
