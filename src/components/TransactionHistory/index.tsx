"use client";
import { useState } from "react";
import { Header } from "../Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTransactions } from "@/hooks/useTransactions";
import { BSCIcon } from "../Icons/BSCIcon";
import { ShirtIcon } from "../Icons/ShirtIcon";
import { Button } from "../Button";
import { LogoIcon } from "../Icons/LogoIcon";
import { NFTGrid } from "../NFTGrid";

type TabType = "transactions" | "nfts";

function TransactionSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#1A1A1A] rounded-full shimmer"></div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <div className="h-5 bg-[#1A1A1A] rounded w-32 shimmer"></div>
            <div className="h-4 bg-[#1A1A1A] rounded w-20 shimmer mt-2 sm:mt-0"></div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 bg-[#1A1A1A] rounded w-16 shimmer"></div>
              <div className="h-4 bg-[#1A1A1A] rounded w-24 shimmer"></div>
            </div>
            <div className="h-4 bg-[#1A1A1A] rounded w-28 shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionSkeletonGrid() {
  return (
    <div className="bg-[#0F0F0F] border border-[#222222] rounded-md overflow-hidden">
      <div className="divide-y divide-[#222222]">
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function TransactionHistory() {
  const { t } = useLanguage();
  const { transactions, isLoading, error, refreshTransactions } =
    useTransactions();
  const [activeTab, setActiveTab] = useState<TabType>("transactions");

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "Completed":
        return t("transactions.completed");
      case "Error":
        return t("transactions.error");
      case "Processing...":
        return t("transactions.processing");
      case "Claimed":
        return t("transactions.claimed");
      case "Delivering":
        return t("transactions.delivering");
      case "Delivered":
        return t("transactions.delivered");
      default:
        return status;
    }
  };

  const getItemIcon = (transaction: any) => {
    if (transaction.isCrypto || transaction.name.includes("BNB")) {
      return <BSCIcon className="w-8 h-8 flex-shrink-0" />;
    }
    return <ShirtIcon className="w-6 h-6 flex-shrink-0" />;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(t("common.copied"));
    });
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? "bg-white text-black"
          : "bg-[#1A1A1A] text-white hover:bg-[#222222]"
      }`}
    >
      {label}
    </button>
  );

  const renderTransactionsContent = () => {
    if (isLoading) {
      return <TransactionSkeletonGrid />;
    }

    if (error) {
      return (
        <div className="py-10 text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={refreshTransactions}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            {t("common.tryAgain")}
          </button>
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="py-10 text-center text-white">
          <p>{t("transactions.noTransactions")}</p>
        </div>
      );
    }

    return (
      <div className="bg-[#0F0F0F] border border-[#222222] rounded-md overflow-hidden">
        <div className="divide-y divide-[#222222]">
          {transactions.map((tx, i) => (
            <div key={i} className="p-4 hover:bg-[#1A1A1A] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                  {getItemIcon(tx)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{tx.name}</h3>
                    <div className="text-sm text-gray-400">{tx.date}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded text-xs font-medium bg-[#1A1A1A]">
                        <span
                          className={`
                          ${tx.status === "Completed" ? "text-green-400" : ""}
                          ${tx.status === "Error" ? "text-red-400" : ""}
                          ${
                            tx.status === "Processing..."
                              ? "text-yellow-400"
                              : ""
                          }
                          ${tx.status === "Claimed" ? "text-blue-400" : ""}
                          ${tx.status === "Delivering" ? "text-blue-400" : ""}
                          ${tx.status === "Delivered" ? "text-blue-400" : ""}
                        `}
                        >
                          {getStatusTranslation(tx.status)}
                        </span>
                      </div>

                      <div className="text-gray-400 font-medium flex items-center gap-1 text-sm">
                        <LogoIcon className="w-4 h-4" />
                        {tx.value.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tx.txHash && (
                        <button
                          onClick={() => copyToClipboard(tx.txHash)}
                          className="text-xs text-white hover:text-white transition-colors flex items-center gap-1"
                        >
                          {tx.txHash.slice(0, 4)}...{tx.txHash.slice(-4)}
                          <span className="text-gray-400">
                            {t("common.copy")}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            #1a1a1a 0px,
            #2a2a2a 40px,
            #1a1a1a 80px
          );
          background-size: 200px;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      <section className="w-full bg-[#0F0F0F] min-h-screen">
        <Header />

        <div className="w-full max-w-screen-2xl mx-auto px-4 py-6 pt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-white">
              {activeTab === "transactions"
                ? t("transactions.title")
                : t("nfts.title")}
            </h1>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => refreshTransactions()}
                disabled={isLoading}
                className="text-sm py-2 px-4"
              >
                {isLoading ? t("common.loading") : t("common.refresh")}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {renderTabButton("transactions", t("transactions.tab"))}
            {renderTabButton("nfts", t("nfts.tab"))}
          </div>

          {activeTab === "transactions" ? (
            renderTransactionsContent()
          ) : (
            <NFTGrid />
          )}
        </div>
      </section>
    </>
  );
}
