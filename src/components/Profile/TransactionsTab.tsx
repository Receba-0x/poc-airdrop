"use client";

import React from "react";
import toast from "react-hot-toast";
import type { BalanceTransaction } from "@/services/user/UserService";
import { useLanguage } from "@/contexts/LanguageContext";

interface TransactionsTabProps {
  transactions: BalanceTransaction[];
}

export function TransactionsTab({ transactions }: TransactionsTabProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-neutral-12 mb-4">
        {t("transactions.title")}
      </h2>

      <div className="bg-neutral-4 rounded-xl border border-neutral-6 overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 bg-neutral-4 border-b border-neutral-6 text-sm font-medium text-neutral-11">
          <div>{t("transactions.type")}</div>
          <div>{t("transactions.id")}</div>
          <div>{t("transactions.amount")}</div>
          <div>{t("transactions.description")}</div>
          <div>{t("transactions.date")}</div>
          <div>{t("transactions.status")}</div>
        </div>

        <div className="divide-y divide-neutral-6">
          {transactions.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-6 gap-4 p-4 text-sm hover:bg-neutral-4 transition-colors bg-neutral-3`}
            >
              <div className="flex items-center gap-2">
                <span className="text-neutral-11 font-medium truncate">
                  {item.type}
                </span>
              </div>

              <div className="flex items-center">
                <span
                  className="text-link-9 cursor-pointer"
                  onClick={() => {
                    toast.success(t("transactions.copied"), {
                      duration: 3000,
                    });
                    navigator.clipboard.writeText(item.id);
                  }}
                >
                  {item.id.toString().slice(0, 10)}...
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-12 font-medium">
                  {item.amount.toFixed(2)} USD
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-11">{item.description}</span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-11 font-semibold">
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full border text-xs font-medium ${
                    item.status.toLowerCase() === "completed"
                      ? "bg-green-3 border-green-6 text-green-11"
                      : item.status === "pending"
                      ? "bg-primary-3 border-primary-6 text-primary-11"
                      : "bg-error-3 border-error-6 text-error-11"
                  }`}
                >
                  {item.status.toLowerCase() === "completed"
                    ? t("transactions.completed")
                    : item.status === "pending"
                    ? t("transactions.pending")
                    : t("transactions.failed")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer da Tabela */}
        <div className="p-4 bg-neutral-4 border-t border-neutral-6">
          <div className="flex items-center justify-between text-sm">
            <div className="text-neutral-11">
              {t("transactions.showing").replace("{current}", "2").replace("{total}", "2")}
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                {t("transactions.previous")}
              </button>
              <button className="px-3 py-1 bg-primary-10 text-neutral-1 rounded">
                1
              </button>
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                2
              </button>
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                {t("transactions.next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
