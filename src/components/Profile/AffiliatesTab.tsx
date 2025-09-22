"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { WalletIcon } from "@/components/Icons/WalletIcon";
import { EarningIcon } from "@/components/Icons/EarningIcon";
import { useLanguage } from "@/contexts/LanguageContext";

export function AffiliatesTab() {
  const { t } = useLanguage();

  // Mock data - substitua por dados reais da API
  const affiliateData = [
    {
      id: 1,
      affiliate: "João Silva",
      date: "2024-01-15",
      type: "Loot Box",
      spent: 150.0,
      commission: 7.5,
      status: "Pago",
    },
    {
      id: 2,
      affiliate: "Maria Santos",
      date: "2024-01-14",
      type: "Upgrade VIP",
      spent: 299.99,
      commission: 15.0,
      status: "Pago",
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "Pago"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="space-y-6 w-full">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 px-4 py-6 w-full">
        <h1 className="text-xl font-bold text-neutral-12 mb-2">
          {t("affiliates.title")}
        </h1>

        <div className="flex items-end gap-4 justify-between w-full">
          <div className="space-y-1 w-full">
            <h2 className="text-neutral-12">{t("affiliates.referralCode")}</h2>
            <Input
              type="text"
              placeholder={t("affiliates.referralCode")}
              className="w-full"
            />
          </div>

          <div className="space-y-1 w-full">
            <h2 className="text-neutral-12">{t("affiliates.referralLink")}</h2>
            <Input
              type="text"
              disabled
              placeholder="https://loot-for-fun/CódigoAleatorio"
              className="w-full"
            />
          </div>

          <Button variant="secondary">{t("affiliates.copy")}</Button>
        </div>
      </div>

      <div className="bg-neutral-3 rounded-xl border border-neutral-6 px-4 py-6 w-full h-full">
        <h1 className="text-xl font-bold text-neutral-12 mb-2">
          {t("affiliates.dashboard.title")}
        </h1>

        <div className="flex items-center justify-between w-full bg-neutral-4 border border-neutral-6 rounded-xl p-4 h-full">
          <div className="space-y-1 w-1/2 h-full flex items-center gap-4">
            <div className="w-10 h-10 rounded-full relative">
              <div className="absolute bottom-1/2 translate-x-1/2 right-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-[#68432C] z-10 blur-md" />
              <Image
                src="/images/emblems/bronze.png"
                alt={t("affiliates.dashboard.title")}
                width={40}
                height={40}
                draggable={false}
                className="object-cover z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <div className="w-full">
              <p className="text-neutral-12 font-medium">
                {t("affiliates.dashboard.tier")}
              </p>
              <p className="text-green-11">{t("affiliates.dashboard.commission")}</p>
            </div>
          </div>

          <div className="flex items-center justify-center w-1/2">
            <div className="w-[1px] h-12 bg-neutral-6" />
          </div>

          <div className="space-y-1 w-full flex items-center gap-4">
            <div className="w-full flex flex-col gap-1">
              <div className="flex items-center justify-between w-full">
                <p className="text-neutral-12">$00,00</p>
                <p className="text-neutral-11 font-medium">
                  $10.000,00{" "}
                  <span className="font-normal">{t("affiliates.dashboard.nextLevel")}</span>
                </p>
              </div>
              <div className="flex items-center bg-neutral-7 h-3 w-full rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-10 rounded-r-full"
                  style={{ width: "40%" }}
                />
              </div>
            </div>

            <div className="w-10 h-10 rounded-full relative">
              <div className="absolute bottom-1/2 translate-x-1/2 right-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-neutral-8 z-10 blur-md" />
              <Image
                src="/images/emblems/prata.png"
                alt={t("affiliates.dashboard.title")}
                width={47}
                height={47}
                draggable={false}
                className="object-cover z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          <div className="flex items-center justify-center w-1/2">
            <div className="w-[1px] h-12 bg-neutral-6" />
          </div>

          <Button variant="secondary">{t("affiliates.dashboard.viewTiers")}</Button>
        </div>

        <div className="flex items-center justify-between w-full gap-5">
          <div className="flex flex-col gap-2 w-1/2 bg-neutral-4 border border-neutral-6 rounded-xl p-4 h-full mt-4">
            <h1 className="text-neutral-12">{t("affiliates.dashboard.availableEarnings")}</h1>
            <div className="flex items-center gap-2">
              <WalletIcon className="w-6 h-6 text-green-11" />
              <p className="text-green-12 text-xl font-semibold">$0,00</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-1/2 bg-neutral-4 border border-neutral-6 rounded-xl p-4 h-full mt-4">
            <h1 className="text-neutral-12">{t("affiliates.dashboard.totalEarnings")}</h1>
            <div className="flex items-center gap-2">
              <EarningIcon className="w-6 h-6 text-primary-11" />
              <p className="text-primary-12 text-xl font-semibold">$0,00</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-neutral-12">
          <div className="bg-neutral-4 rounded-xl border border-neutral-6 p-3 flex items-center justify-between">
            <h1 className="font-be-vietnam-pro">{t("affiliates.dashboard.deposit")}</h1>
            <p className="font-sora">$0,00</p>
          </div>
          <div className="bg-neutral-4 rounded-xl border border-neutral-6 p-3 flex items-center justify-between">
            <h1 className="font-be-vietnam-pro">{t("affiliates.dashboard.spent")}</h1>
            <p className="font-sora">$0,00</p>
          </div>
          <div className="bg-neutral-4 rounded-xl border border-neutral-6 p-3 flex items-center justify-between">
            <h1 className="font-be-vietnam-pro">{t("affiliates.dashboard.referrals")}</h1>
            <p className="font-sora">0 {t("affiliates.dashboard.users")}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-neutral-12 mb-4">
          {t("affiliates.history.title")}
        </h2>

        <div className="bg-neutral-4 rounded-xl border border-neutral-6 overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 bg-neutral-4 border-b border-neutral-6 text-sm font-medium text-neutral-11">
            <div>{t("affiliates.history.affiliate")}</div>
            <div>{t("affiliates.history.date")}</div>
            <div>{t("affiliates.history.spentAmount")}</div>
            <div>{t("affiliates.history.commission")}</div>
            <div>{t("affiliates.history.status")}</div>
          </div>

          <div className="divide-y divide-neutral-6">
            {affiliateData.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-5 gap-4 p-4 text-sm hover:bg-neutral-4 transition-colors bg-neutral-3`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-10 flex items-center justify-center">
                    <span className="text-neutral-1 text-xs font-bold">
                      {item.affiliate
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <span className="text-neutral-12 font-medium truncate">
                    {item.affiliate}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-neutral-11">
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-neutral-12 font-medium">
                    ${item.spent.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-green-500 font-semibold">
                    +${item.commission.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer da Tabela */}
          <div className="p-4 bg-neutral-4 border-t border-neutral-6">
            <div className="flex items-center justify-between text-sm">
              <div className="text-neutral-11">
                {t("affiliates.history.showing").replace("{current}", "2").replace("{total}", "2")}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                  {t("affiliates.history.previous")}
                </button>
                <button className="px-3 py-1 bg-primary-10 text-neutral-1 rounded">
                  1
                </button>
                <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                  2
                </button>
                <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                  {t("affiliates.history.next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
