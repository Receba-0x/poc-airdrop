"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  adminPurchasesService,
  PurchasesFilters,
  UpdatePurchaseStatusRequest,
  queryClient,
  type Purchase,
} from "@/services";
import { Button } from "@/components/Button";
import { usePurchases, usePurchasesStats } from "@/hooks/usePurchase";
import { CopyIcon } from "@/components/Icons/CopyIcon";
import { useClipboard } from "@/hooks/useClipboard";
import { BaseModal } from "@/components/TransactionModals";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  OPENED: "bg-green-100 text-green-800",
  DELIVERED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

const statusLabels = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  OPENED: "Aberto",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  FAILED: "Falhou",
};

export default function AdminPurchases() {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [filters, setFilters] = useState<PurchasesFilters>({});
  const [newStatus, setNewStatus] = useState<string>("");
  const { purchases, isLoading: purchasesLoading } = usePurchases(filters);
  const { stats, isLoading: statsLoading } = usePurchasesStats();
  const { copyToClipboard } = useClipboard();
  const isLoading = purchasesLoading || statsLoading;

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: UpdatePurchaseStatusRequest;
    }) => adminPurchasesService.updatePurchaseStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["admin-purchases-stats"] });
      setSelectedPurchase(null);
      setNewStatus("");
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedPurchase || !newStatus) return;
    updateStatusMutation.mutate({
      id: selectedPurchase.id,
      status: { status: newStatus as any },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "SOL") {
      return `${amount} SOL`;
    }
    return `$${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-6 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-6 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-neutral-12">
          Monitoramento de Compras
        </h1>
        <p className="text-neutral-11 mt-2">
          Acompanhe todas as compras e estatísticas do sistema
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-4">
          <h3 className="text-sm font-medium text-gray-500">
            Total de Compras
          </h3>
          <p className="text-2xl font-bold text-neutral-12">
            {stats?.total || 0}
          </p>
        </div>

        <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-4">
          <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
          <p className="text-2xl font-bold text-neutral-12">
            ${stats?.totalRevenue?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-4">
          <h3 className="text-sm font-medium text-gray-500">Compras Hoje</h3>
          <p className="text-2xl font-bold text-neutral-12">
            {stats?.recentPurchases || 0}
          </p>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-4 mb-4">
        <h3 className="text-lg font-semibold text-neutral-12 mb-4">
          Distribuição por Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats?.byStatus &&
            Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    statusColors[status as keyof typeof statusColors]
                  }`}
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </div>
                <p className="text-2xl font-bold text-neutral-12 mt-2">
                  {count}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-4 mb-6">
        <h3 className="text-lg font-semibold text-neutral-12 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: (e.target.value as any) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 bg-neutral-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="OPENED">Aberto</option>
              <option value="DELIVERED">Entregue</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="FAILED">Falhou</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              ID do Usuário
            </label>
            <input
              type="text"
              value={filters.userId || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  userId: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 bg-neutral-3  rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Buscar por usuário"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={() => setFilters({})} variant="secondary">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-6">
          <h3 className="text-lg font-semibold text-neutral-12">
            Compras ({purchases.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-6">
            <thead className="bg-neutral-4">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Lootbox
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-4 divide-y divide-neutral-6">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-neutral-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      onClick={() => copyToClipboard(purchase.id)}
                      className="text-sm font-medium text-neutral-12 flex items-center gap-2 cursor-pointer"
                    >
                      {purchase.id.slice(-8)} <CopyIcon className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      onClick={() => copyToClipboard(purchase.userId)}
                      className="text-sm text-neutral-12 flex items-center gap-2 cursor-pointer"
                    >
                      {purchase.user.username} <CopyIcon className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">
                      {purchase.lootbox.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">
                      {formatCurrency(purchase.amount, purchase.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[
                          purchase.status as keyof typeof statusColors
                        ]
                      }`}
                    >
                      {
                        statusLabels[
                          purchase.status as keyof typeof statusLabels
                        ]
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">
                      {formatDate(purchase.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      onClick={() => setSelectedPurchase(purchase)}
                      variant="secondary"
                    >
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {purchases.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">Nenhuma compra encontrada</p>
          </div>
        )}
      </div>

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <BaseModal
          isOpen={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          title="Detalhes da Compra"
        >
          <div className="mt-3">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    ID da Compra
                  </label>
                  <p className="text-sm text-neutral-12 font-mono">
                    {selectedPurchase.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    ID do Usuário
                  </label>
                  <p className="text-sm text-neutral-12 font-mono">
                    {selectedPurchase.userId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    Lootbox
                  </label>
                  <p className="text-sm text-neutral-12 font-mono">
                    {selectedPurchase.lootboxId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    Valor
                  </label>
                  <p className="text-sm text-neutral-12">
                    {formatCurrency(
                      selectedPurchase.amount,
                      selectedPurchase.currency
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[
                        selectedPurchase.status as keyof typeof statusColors
                      ]
                    }`}
                  >
                    {
                      statusLabels[
                        selectedPurchase.status as keyof typeof statusLabels
                      ]
                    }
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    Data de Criação
                  </label>
                  <p className="text-sm text-neutral-12">
                    {formatDate(selectedPurchase.createdAt)}
                  </p>
                </div>
              </div>

              {selectedPurchase.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    Data de Abertura
                  </label>
                  <p className="text-sm text-neutral-12">
                    {formatDate(selectedPurchase.updatedAt)}
                  </p>
                </div>
              )}

              {selectedPurchase.walletAddress && (
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    Endereço da Carteira
                  </label>
                  <p className="text-sm text-neutral-12 font-mono break-all">
                    {selectedPurchase.walletAddress}
                  </p>
                </div>
              )}

              {selectedPurchase.serverSeedHash && (
                <div>
                  <label className="block text-sm font-medium text-neutral-11">
                    Hash da Transação
                  </label>
                  <p className="text-sm text-neutral-12 font-mono break-all">
                    {selectedPurchase.serverSeedHash}
                  </p>
                </div>
              )}

              {selectedPurchase.rewards &&
                selectedPurchase.rewards.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-11 mb-2">
                      Recompensas
                    </label>
                    <div className="space-y-2">
                      {selectedPurchase.rewards.map((reward, index) => (
                        <div key={index} className="flex flex-col rounded">
                          <span className="text-sm text-neutral-12">
                            Item {reward.item.name}
                          </span>
                          <span className="text-sm font-medium text-neutral-12">
                            Quantidade: {reward.quantity} | Valor: $
                            {reward.item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Status Update */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-neutral-11 mb-2">
                  Atualizar Status
                </label>
                <div className="flex space-x-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-6 bg-neutral-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecionar novo status</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="OPENED">Aberto</option>
                    <option value="DELIVERED">Entregue</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <Button
                onClick={() => setSelectedPurchase(null)}
                variant="secondary"
              >
                Fechar
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updateStatusMutation.isPending}
                variant="default"
              >
                {updateStatusMutation.isPending
                  ? "Atualizando..."
                  : "Atualizar"}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
