"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminItemsService, adminPurchasesService } from "@/services";
import { useLootboxes } from "@/hooks/useLootbox";
import { useRouter } from "next/navigation";
import { usePurchasesStats } from "@/hooks/usePurchase";

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
}

function DashboardCard({ title, value, change }: DashboardCardProps) {
  return (
    <div className={`bg-neutral-3 rounded-xl border border-neutral-6 p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-12">{title}</h3>
        <div className="flex items-baseline">
          <p className="font-semibold text-neutral-12">{value}</p>
          {change && (
            <p
              className={`ml-2 text-sm ${
                change.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { push } = useRouter();
  const { stats: purchasesStats, isLoading: purchasesLoading } =
    usePurchasesStats();
  const { lootboxes, isLoading: lootboxesLoading } = useLootboxes();

  const isLoading = purchasesLoading || lootboxesLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-6 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-6 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">
          Dashboard Admin
        </h1>
        <p className="text-neutral-10">Visão geral do sistema de lootbox</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total de Compras"
          value={purchasesStats?.total || 0}
        />

        <DashboardCard
          title="Receita Total"
          value={`$${purchasesStats?.totalRevenue?.toFixed(2) || "0.00"}`}
        />

        <DashboardCard title="Lootboxes" value={lootboxes?.length || 0} />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
          <h3 className="text-lg font-semibold text-neutral-12 mb-4">
            Compras por Status
          </h3>
          {purchasesStats?.byStatus &&
          Object.keys(purchasesStats.byStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(purchasesStats.byStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-neutral-11 capitalize">
                      {status.toLowerCase()}
                    </span>
                    <span className="font-semibold text-neutral-12">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-neutral-10 text-sm">Nenhum dado disponível</p>
          )}
        </div>

        {/* Today's Stats */}
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
          <h3 className="text-lg font-semibold text-neutral-12 mb-4">
            Estatísticas de Hoje
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-11">Compras Hoje</span>
              <span className="font-semibold text-neutral-12">
                {purchasesStats?.todayPurchases || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-11">Receita Hoje</span>
              <span className="font-semibold text-neutral-12">
                ${purchasesStats?.todayRevenue?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
          <h3 className="text-lg font-semibold text-neutral-12 mb-4">
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => push("/admin/lootboxes")}
              className="w-full text-left px-4 py-2 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-colors"
            >
              Criar Nova Lootbox
            </button>
            <button
              onClick={() => push("/admin/items")}
              className="w-full text-left px-4 py-2 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-colors"
            >
              Adicionar Item
            </button>
            <button
              onClick={() => push("/admin/reports")}
              className="w-full text-left px-4 py-2 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-colors"
            >
              Ver Relatórios
            </button>
            <button
              onClick={() => push("/admin/settings")}
              className="w-full text-left px-4 py-2 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-colors"
            >
              Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
