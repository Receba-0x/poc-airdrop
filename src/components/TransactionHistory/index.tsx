"use client";
import { useEffect, useState } from "react";
import { Header } from "../Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTransactions } from "@/hooks/useTransactions";
import { SolanaIcon } from "../Icons/SolanaIcon";
import { ShirtIcon } from "../Icons/ShirtIcon";
import { ShippingAddressForm } from "../ShippingAddressForm";
import { Button } from "../Button";
import { LogoIcon } from "../Icons/LogoIcon";

export function TransactionHistory() {
  const { t } = useLanguage();
  const { transactions, isLoading, error, refreshTransactions } =
    useTransactions();
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<{
    id: string;
    name: string;
    prizeId?: number;
  } | null>(null);

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
    if (transaction.isCrypto || transaction.name.includes("SOL")) {
      return <SolanaIcon className="w-6 h-6 flex-shrink-0" />;
    }
    return <ShirtIcon className="w-6 h-6 flex-shrink-0" />;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(t("common.copied"));
    });
  };

  const handleClaimClick = (transaction: any) => {
    setSelectedTransaction({
      id: transaction.id,
      name: transaction.name,
      prizeId: transaction.prizeId,
    });
    setShippingModalOpen(true);
  };

  const closeShippingModal = () => {
    setShippingModalOpen(false);
    setSelectedTransaction(null);
  };

  const isPhysicalItem = (transaction: any) => {
    return !transaction.isCrypto && !transaction.name.includes("SOL");
  };

  const canBeClaimed = (transaction: any) => {
    return (
      isPhysicalItem(transaction) &&
      transaction.status === "Completed" &&
      !transaction.claimed
    );
  };

  return (
    <section className="w-full bg-[#0F0F0F] min-h-screen">
      <Header />

      <div className="w-full max-w-[1280px] mx-auto px-4 py-6 pt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">
            {t("transactions.title")}
          </h1>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => refreshTransactions()}
              className="text-sm py-2 px-4"
            >
              {t("common.refresh")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-white">
            <p>{t("common.loading")}...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center text-white">
            <p>{t("transactions.noTransactions")}</p>
          </div>
        ) : (
          <div className="bg-[#0F0F0F] border border-[#222222] rounded-md overflow-hidden">
            <div className="divide-y divide-[#222222]">
              {transactions.map((tx, i) => (
                <div
                  key={i}
                  className="p-4 hover:bg-[#1A1A1A] transition-colors"
                >
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
                              ${
                                tx.status === "Completed"
                                  ? "text-green-400"
                                  : ""
                              }
                              ${tx.status === "Error" ? "text-red-400" : ""}
                              ${
                                tx.status === "Processing..."
                                  ? "text-yellow-400"
                                  : ""
                              }
                              ${tx.status === "Claimed" ? "text-blue-400" : ""}
                              ${
                                tx.status === "Delivering"
                                  ? "text-blue-400"
                                  : ""
                              }
                              ${
                                tx.status === "Delivered" ? "text-blue-400" : ""
                              }
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

                          {canBeClaimed(tx) && (
                            <Button
                              className="text-xs py-1 px-3"
                              onClick={() => handleClaimClick(tx)}
                            >
                              {t("transactions.claim") || "Claim"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedTransaction && (
        <ShippingAddressForm
          refreshTransactions={refreshTransactions}
          isOpen={shippingModalOpen}
          onClose={closeShippingModal}
          transactionId={selectedTransaction.id}
          itemName={selectedTransaction.name}
          prizeId={selectedTransaction.prizeId}
        />
      )}
    </section>
  );
}
