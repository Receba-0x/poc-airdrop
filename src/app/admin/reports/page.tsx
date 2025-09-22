"use client";

import React from "react";
import { usePurchasesStats } from "@/hooks/usePurchase";

export default function AdminReports() {
  const { stats, isLoading: purchasesLoading } = usePurchasesStats();
  const isLoading = purchasesLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-6 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-6 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const purchasesData = stats;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-12">
          Relatórios e Análises
        </h1>
        <p className="text-neutral-11 mt-2">
          Relatórios detalhados do sistema de lootbox
        </p>
      </div>

      {/* Purchases Report */}
      <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-6 mb-8">
        <h3 className="text-xl font-semibold text-neutral-12 mb-6">
          Relatório de Compras
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <h4 className="text-sm font-medium text-neutral-11">
              Total de Compras
            </h4>
            <p className="text-3xl font-bold text-neutral-12">
              {purchasesData?.total || 0}
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-neutral-11">
              Receita Total
            </h4>
            <p className="text-3xl font-bold text-green-600">
              ${purchasesData?.totalRevenue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-neutral-11">
              Ticket Médio
            </h4>
            <p className="text-3xl font-bold ext-neutral-12">
              ${purchasesData?.totalRevenue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-neutral-11">
              Compras Hoje
            </h4>
            <p className="text-3xl font-bold text-neutral-12">
              {purchasesData?.recentPurchases || 0}
            </p>
          </div>
        </div>

        {purchasesData?.byStatus && (
          <div>
            <h4 className="text-lg font-medium text-neutral-12 mb-4">
              Status das Compras
            </h4>
            <div className="flex justify-between gap-4">
              {Object.entries(purchasesData.byStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="bg-neutral-3 border border-neutral-6 p-4 rounded-lg text-center w-full"
                >
                  <div className="text-sm font-medium text-neutral-11 capitalize">
                    {status.toLowerCase()}
                  </div>
                  <div className="text-2xl font-bold text-neutral-12">
                    {count as number}
                  </div>
                  <div className="text-xs text-neutral-11">
                    {purchasesData.total
                      ? Math.round((count as number / purchasesData.total) * 100)
                      : 0}
                    % do total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Revenue Report */}
      <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-6">
        <h3 className="text-xl font-semibold text-neutral-12 mb-6">
          Análise de Receita
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium text-neutral-12 mb-4">
              Receita por Período
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">Hoje</span>
                <span className="font-semibold text-neutral-12">
                  ${purchasesData?.todayRevenue?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">Total Geral</span>
                <span className="font-semibold text-neutral-12">
                  ${purchasesData?.totalRevenue?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-neutral-12 mb-4">
              Métricas de Performance
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">
                  Conversão de Compras
                </span>
                <span className="font-semibold text-neutral-12">
                  {purchasesData?.total ? "100%" : "0%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">Taxa de Sucesso</span>
                <span className="font-semibold text-green-600">
                  {purchasesData?.byStatus
                    ? Math.round(
                        ((purchasesData.byStatus.DELIVERED || 0) /
                          purchasesData.total) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
