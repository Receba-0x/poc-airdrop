"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminItemsService, adminPurchasesService } from "@/services";
import { useLootboxes } from "@/hooks/useLootbox";
import { useRouter } from "next/navigation";
import { usePurchasesStats } from "@/hooks/usePurchase";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Package, Box, FileText, Settings } from "lucide-react";

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
  const { t } = useLanguage();
  const { push } = useRouter();
  const { stats: purchasesStats, isLoading: purchasesLoading } =
    usePurchasesStats();
  const { lootboxes, isLoading: lootboxesLoading } = useLootboxes();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isLoading = purchasesLoading || lootboxesLoading;

  const handleNavigation = async (route: string, actionName: string) => {
    try {
      setActionLoading(actionName);
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      push(route);
      toast.success(`Navegando para ${actionName.toLowerCase()}...`, {
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 2000,
      });
    } catch (error) {
      toast.error(`Erro ao navegar para ${actionName.toLowerCase()}`, {
        icon: <XCircle className="w-5 h-5" />,
        duration: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-6 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral-6 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-neutral-6 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-neutral-6 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">
          {t("admin.dashboard.title")}
        </h1>
        <p className="text-neutral-10">{t("admin.dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title={t("admin.dashboard.totalPurchases")}
          value={purchasesStats?.total || 0}
        />

        <DashboardCard
          title={t("admin.dashboard.totalRevenue")}
          value={`$${purchasesStats?.totalRevenue?.toFixed(2) || "0.00"}`}
        />

        <DashboardCard title={t("admin.dashboard.lootboxes")} value={lootboxes?.length || 0} />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
          <h3 className="text-lg font-semibold text-neutral-12 mb-4">
            {t("admin.dashboard.purchasesByStatus")}
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
                    <span className="text-sm text-neutral-11">
                      {status.toLowerCase()}
                    </span>
                    <span className="font-semibold text-neutral-12">
                      {Number(count)}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-neutral-10 text-sm">{t("admin.dashboard.noData")}</p>
          )}
        </div>

        {/* Today's Stats */}
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
          <h3 className="text-lg font-semibold text-neutral-12 mb-4">
            {t("admin.dashboard.todayStats")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-11">{t("admin.dashboard.todayPurchases")}</span>
              <span className="font-semibold text-neutral-12">
                {purchasesStats?.todayPurchases || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-11">{t("admin.dashboard.todayRevenue")}</span>
              <span className="font-semibold text-neutral-12">
                ${purchasesStats?.todayRevenue?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
          <h3 className="text-lg font-semibold text-neutral-12 mb-4">
            {t("admin.dashboard.quickActions")}
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleNavigation("/admin/lootboxes", "Lootboxes")}
              disabled={actionLoading === "Lootboxes"}
              className="w-full text-left px-4 py-3 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className={`w-4 h-4 ${actionLoading === "Lootboxes" ? 'animate-spin' : ''}`} />
              {actionLoading === "Lootboxes" ? "Carregando..." : t("admin.dashboard.createLootbox")}
            </button>
            <button
              onClick={() => handleNavigation("/admin/items", "Items")}
              disabled={actionLoading === "Items"}
              className="w-full text-left px-4 py-3 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Box className={`w-4 h-4 ${actionLoading === "Items" ? 'animate-spin' : ''}`} />
              {actionLoading === "Items" ? "Carregando..." : t("admin.dashboard.addItem")}
            </button>
            <button
              onClick={() => handleNavigation("/admin/reports", "Reports")}
              disabled={actionLoading === "Reports"}
              className="w-full text-left px-4 py-3 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className={`w-4 h-4 ${actionLoading === "Reports" ? 'animate-spin' : ''}`} />
              {actionLoading === "Reports" ? "Carregando..." : t("admin.dashboard.viewReports")}
            </button>
            <button
              onClick={() => handleNavigation("/admin/settings", "Settings")}
              disabled={actionLoading === "Settings"}
              className="w-full text-left px-4 py-3 text-sm text-neutral-11 hover:bg-neutral-4 rounded-lg transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Settings className={`w-4 h-4 ${actionLoading === "Settings" ? 'animate-spin' : ''}`} />
              {actionLoading === "Settings" ? "Carregando..." : t("admin.dashboard.settings")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
