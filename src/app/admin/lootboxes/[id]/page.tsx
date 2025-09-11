"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  adminLootboxService,
  adminItemsService,
  LinkItemToLootboxRequest,
  queryClient,
  queryKeys,
  uploadService,
} from "@/services";
import { Button } from "@/components/Button";
import { BaseModal } from "@/components/TransactionModals";
import { useLootbox } from "@/hooks/useLootbox";
import type { Item, LootboxItem } from "@/services/lootbox/LootboxService";

const rarityColors = {
  COMMON: "bg-gray-100 text-gray-800",
  UNCOMMON: "bg-green-100 text-green-800",
  RARE: "bg-blue-100 text-blue-800",
  EPIC: "bg-purple-100 text-purple-800",
  LEGENDARY: "bg-orange-100 text-orange-800",
};

export default function LootboxDetailPage() {
  const params = useParams();
  const lootboxId = params.id as string;
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LootboxItem | null>(null);
  const [linkData, setLinkData] = useState({
    probability: 0,
    minQuantity: 1,
    maxQuantity: 1,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    currency: "SOL" as "SOL" | "USD",
    sortOrder: 0,
    isActive: true,
  });

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCSV, setSelectedCSV] = useState<File | null>(null);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const { lootbox: lootboxData, isLoading: lootboxLoading } =
    useLootbox(lootboxId);

  const linkItemMutation = useMutation({
    mutationFn: (data: LinkItemToLootboxRequest) =>
      adminLootboxService.linkItemToLootbox(lootboxId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lootbox.detail(lootboxId),
      });
      setIsLinkModalOpen(false);
      setSelectedItem(null);
      setLinkData({ probability: 0, minQuantity: 1, maxQuantity: 1 });
    },
  });

  const unlinkItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      adminLootboxService.unlinkItemFromLootbox(lootboxId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lootbox.detail(lootboxId),
      });
    },
  });

  const editLootboxMutation = useMutation({
    mutationFn: (data: typeof editFormData) =>
      adminLootboxService.updateLootbox(lootboxId, {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        currency: data.currency,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lootbox.detail(lootboxId),
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-lootboxes"],
      });
      setIsEditModalOpen(false);
    },
  });

  const handleEditLootbox = () => {
    editLootboxMutation.mutate(editFormData);
  };

  const csvBatchUploadMutation = useMutation({
    mutationFn: (file: File) =>
      adminItemsService.createItemsBatchFromCSV(file, lootboxId),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lootbox.detail(lootboxId),
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-lootboxes"],
      });
      setIsCSVModalOpen(false);
      setSelectedCSV(null);

      // Feedback para o usuário
      if (response.data) {
        const { success, failed, errors } = response.data;
        console.log(
          `Upload concluído: ${success} itens criados, ${failed} falharam`
        );
        if (errors.length > 0) {
          console.log("Erros encontrados:", errors);
        }
      }
    },
    onError: (error) => {
      console.error("Erro no upload do CSV:", error);
    },
  });

  const handleCSVUpload = () => {
    if (selectedCSV) {
      csvBatchUploadMutation.mutate(selectedCSV);
    }
  };

  // Image handling functions
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      try {
        const response = await uploadService.uploadImage(formData);
        if (!response.success) throw new Error(response.error);
        const imageUrl = response.imageUrl;
        const serverUrl = process.env.NEXT_PUBLIC_API_URL;
        const fullImageUrl = serverUrl + imageUrl;
        setEditFormData({ ...editFormData, imageUrl: fullImageUrl });
        setIsImageModalOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
      } catch (error) {
        console.error("Upload error:", error);
        setIsImageModalOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
      }
    }
  };

  const handleCancelUpload = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // CSV handling functions
  const handleCSVSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedCSV(file);
    }
  };

  const handleCSVDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCSVDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedCSV(file);
    }
  };

  const handleCancelCSVUpload = () => {
    setIsCSVModalOpen(false);
    setSelectedCSV(null);
  };

  const openCSVFileDialog = () => {
    csvInputRef.current?.click();
  };

  const handleLinkItem = () => {
    if (!selectedItem) return;
    linkItemMutation.mutate({
      itemId: selectedItem.id,
      probability: linkData.probability,
      minQuantity: linkData.minQuantity,
      maxQuantity: linkData.maxQuantity,
    });
  };

  const handleUnlinkItem = (itemId: string) => {
    if (
      window.confirm("Tem certeza que deseja desvincular este item da lootbox?")
    ) {
      unlinkItemMutation.mutate(itemId);
    }
  };

  const items = lootboxData?.items || [];
  const linkedItems = lootboxData?.items || [];

  const availableItems = items.filter(
    (item: LootboxItem) =>
      !linkedItems.some((linkedItem: LootboxItem) => linkedItem.id === item.id)
  );

  const isLoading = lootboxLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-6 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-6 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!lootboxData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-12">
            Lootbox não encontrada
          </h1>
          <p className="text-neutral-10 mt-2">
            A lootbox solicitada não existe ou foi removida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-neutral-12">
              {lootboxData.name}
            </h1>
            <span className="text-sm text-neutral-10">
              ID: {lootboxData.id}
            </span>
            <div className="flex items-center space-x-4 mt-4">
              <span className="text-sm text-neutral-10">
                Preço: {lootboxData.price} {lootboxData.currency}
              </span>
              <span className="text-sm text-neutral-10">
                Ordem: {lootboxData.sortOrder || 0}
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  lootboxData.isActive
                    ? "bg-green-4 text-green-11"
                    : "bg-error-4 text-error-11"
                }`}
              >
                {lootboxData.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setEditFormData({
                  name: lootboxData.name,
                  description: (lootboxData as any).description || "",
                  imageUrl: lootboxData.imageUrl || "",
                  price: lootboxData.price,
                  currency: lootboxData.currency,
                  sortOrder: lootboxData.sortOrder || 0,
                  isActive: lootboxData.isActive,
                });
                setIsEditModalOpen(true);
              }}
            >
              Editar Lootbox
            </Button>
            <Button variant="secondary" onClick={() => setIsCSVModalOpen(true)}>
              Importar CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-6 mb-8">
        <h3 className="text-lg font-semibold text-neutral-12 mb-4">
          Itens Vinculados ({linkedItems.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-6">
            <thead className="bg-neutral-4">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Raridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Probabilidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-10 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-3 divide-y divide-neutral-6">
              {linkedItems.map((linkedItem: LootboxItem) => (
                <tr key={linkedItem.id} className="hover:bg-neutral-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-12">
                      {linkedItem.item?.name || "Item não encontrado"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12 capitalize">
                      {linkedItem.item?.type?.toLowerCase() || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {linkedItem.item?.rarity && (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rarityColors[
                            linkedItem.item.rarity as keyof typeof rarityColors
                          ]
                        }`}
                      >
                        {linkedItem.item.rarity.toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">
                      {(linkedItem.probability * 100).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">
                      {linkedItem.minQuantity} - {linkedItem.maxQuantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      onClick={() => handleUnlinkItem(linkedItem.itemId)}
                      variant="secondary"
                    >
                      Desvincular
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {linkedItems.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-neutral-10">
              Nenhum item vinculado a esta lootbox
            </p>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="mt-4 text-orange-600 hover:text-orange-800 font-medium"
            >
              Vincular primeiro item
            </button>
          </div>
        )}
      </div>

      {/* Probability Summary */}
      <div className="bg-neutral-4 rounded-lg shadow-sm border border-neutral-6 p-6">
        <h3 className="text-lg font-semibold text-neutral-12 mb-4">
          Resumo de Probabilidades
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="text-sm font-medium text-neutral-10">
              Total de Itens
            </h4>
            <p className="text-2xl font-bold text-neutral-12">
              {linkedItems.length}
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-neutral-10">
              Probabilidade Total
            </h4>
            <p className="text-2xl font-bold text-neutral-12">
              {(
                linkedItems.reduce(
                  (sum: number, item) => sum + item.probability,
                  0
                ) * 100
              ).toFixed(2)}
              %
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-neutral-10">Status</h4>
            <p
              className={`text-lg font-bold ${
                linkedItems.reduce(
                  (sum: number, item) => sum + item.probability,
                  0
                ) <= 1
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {linkedItems.reduce(
                (sum: number, item) => sum + item.probability,
                0
              ) <= 1
                ? "Válido"
                : "Probabilidades > 100%"}
            </p>
          </div>
        </div>
      </div>

      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-neutral-6 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-neutral-4">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-neutral-12 mb-4">
                Vincular Item à Lootbox
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-10 mb-1">
                    Selecionar Item
                  </label>
                  <select
                    value={selectedItem?.id || ""}
                    onChange={(e) => {
                      const item = availableItems.find(
                        (i) => i.id === e.target.value
                      );
                      setSelectedItem(item || null);
                    }}
                    className="w-full px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecione um item</option>
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.item.name} ({item.item.type} - {item.item.rarity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-10 mb-1">
                      Probabilidade (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={linkData.probability}
                      onChange={(e) =>
                        setLinkData({
                          ...linkData,
                          probability: parseFloat(e.target.value) / 100 || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-10 mb-1">
                      Min Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={linkData.minQuantity}
                      onChange={(e) =>
                        setLinkData({
                          ...linkData,
                          minQuantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-10 mb-1">
                      Max Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={linkData.maxQuantity}
                      onChange={(e) =>
                        setLinkData({
                          ...linkData,
                          maxQuantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {selectedItem && (
                  <div className="bg-neutral-4 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-10 mb-2">
                      Item Selecionado:
                    </h4>
                    <div className="text-sm text-neutral-12">
                      <strong>{selectedItem.item.name}</strong> -{" "}
                      {selectedItem.item.type} ({selectedItem.item.rarity})
                    </div>
                    {selectedItem.item.description && (
                      <div className="text-sm text-neutral-10 mt-1">
                        {selectedItem.item.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => {
                    setIsLinkModalOpen(false);
                    setSelectedItem(null);
                    setLinkData({
                      probability: 0,
                      minQuantity: 1,
                      maxQuantity: 1,
                    });
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleLinkItem}
                  disabled={!selectedItem || linkItemMutation.isPending}
                >
                  {linkItemMutation.isPending ? "Vinculando..." : "Vincular"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BaseModal
        preventClose={true}
        showCloseButton={false}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Lootbox"
        size="lg"
      >
        <div className="mt-3">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-11 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                placeholder="Nome da lootbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-11 mb-1">
                Descrição
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                className="w-full bg-neutral-3 px-3 py-2 border border-neutral-6 rounded-lg text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                placeholder="Descrição da lootbox"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-11 mb-1">
                Imagem da Lootbox
              </label>
              <div className="flex items-center gap-4">
                {editFormData.imageUrl && (
                  <div className="min-w-20 min-h-20 w-20 h-20 bg-neutral-3 rounded-lg overflow-hidden border-2 border-neutral-6 flex items-center justify-center">
                    <img
                      src={editFormData.imageUrl}
                      alt="Lootbox preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col items-center gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setIsImageModalOpen(true)}
                    className="w-full"
                  >
                    {editFormData.imageUrl
                      ? "Alterar Imagem"
                      : "Adicionar Imagem"}
                  </Button>
                  {editFormData.imageUrl && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setEditFormData({ ...editFormData, imageUrl: "" })
                      }
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-11 mb-1">
                  Preço
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.price}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-11 mb-1">
                  Moeda
                </label>
                <select
                  value={editFormData.currency}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      currency: e.target.value as "SOL" | "USD",
                    })
                  }
                  className="w-full bg-neutral-3 px-3 py-2 border border-neutral-6 rounded-lg text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                >
                  <option value="SOL">SOL</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-11 mb-1">
                Ordem de Classificação
              </label>
              <input
                type="number"
                value={editFormData.sortOrder}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={editFormData.isActive}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    isActive: e.target.checked,
                  })
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-6 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm text-neutral-11"
              >
                Ativo
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleEditLootbox}
              disabled={editLootboxMutation.isPending}
            >
              {editLootboxMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        preventClose={true}
        isOpen={isImageModalOpen}
        onClose={handleCancelUpload}
        title="Upload de Imagem da Lootbox"
        size="lg"
      >
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
              imagePreview
                ? "border-neutral-6 bg-neutral-3"
                : "border-neutral-6 bg-neutral-3 hover:border-primary-6 hover:bg-primary-3"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={imagePreview}
                    alt="Preview da imagem"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-lg border-4 border-neutral-6"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-12 text-neutral-3 rounded-full flex items-center justify-center text-xs hover:bg-neutral-12 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-neutral-11">
                  Imagem selecionada: {selectedImage?.name}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-12 mb-2">
                    Arraste uma imagem aqui
                  </p>
                  <p className="text-sm text-neutral-10 mb-4">
                    ou clique para selecionar um arquivo
                  </p>
                  <Button variant="outline" onClick={openFileDialog}>
                    Selecionar Imagem
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="bg-neutral-4 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-12 mb-2">
              Requisitos da imagem:
            </h4>
            <ul className="text-xs text-neutral-11 space-y-1">
              <li>• Formatos aceitos: JPG, PNG, GIF</li>
              <li>• Tamanho máximo: 5MB</li>
              <li>• Resolução recomendada: 200x200px ou maior</li>
              <li>• Formato quadrado recomendado para melhor visualização</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancelUpload}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleImageUpload}
              disabled={!selectedImage}
            >
              {selectedImage ? "Confirmar Upload" : "Selecione uma imagem"}
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* CSV Batch Upload Modal */}
      <BaseModal
        isOpen={isCSVModalOpen}
        onClose={handleCancelCSVUpload}
        title="Importar Itens via CSV"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-neutral-4 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-12 mb-2">
              Formato do CSV esperado:
            </h4>
            <div className="bg-neutral-3 rounded p-3 font-mono text-xs text-neutral-11 break-words">
              <div>
                name,description,type,rarity,value,imageUrl,probability,minQuantity,maxQuantity
              </div>
              <div className="mt-1 text-neutral-10">
                Exemplo: "Espada Mágica","Uma espada
                poderosa","PHYSICAL","RARE",150,"",0.25,1,3
              </div>
            </div>
            <ul className="text-xs text-neutral-10 space-y-1 mt-2">
              <li>
                • <strong>name</strong>: Nome do item (obrigatório)
              </li>
              <li>
                • <strong>description</strong>: Descrição (opcional)
              </li>
              <li>
                • <strong>type</strong>: SOL, PHYSICAL, NFT, SPECIAL
                (obrigatório)
              </li>
              <li>
                • <strong>rarity</strong>: COMMON, UNCOMMON, RARE, EPIC,
                LEGENDARY (obrigatório)
              </li>
              <li>
                • <strong>value</strong>: Valor numérico (obrigatório)
              </li>
              <li>
                • <strong>imageUrl</strong>: URL da imagem (opcional)
              </li>
              <li>
                • <strong>probability</strong>: Probabilidade individual (0-1,
                obrigatório)
              </li>
              <li>
                • <strong>minQuantity</strong>: Quantidade mínima (opcional,
                padrão: 1)
              </li>
              <li>
                • <strong>maxQuantity</strong>: Quantidade máxima (opcional,
                padrão: 1)
              </li>
            </ul>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
              selectedCSV
                ? "border-neutral-6 bg-neutral-3"
                : "border-neutral-6 bg-neutral-3 hover:border-primary-6 hover:bg-primary-3"
            }`}
            onDragOver={handleCSVDragOver}
            onDrop={handleCSVDrop}
          >
            {selectedCSV ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <svg
                    className="w-full h-full text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-12 mb-2">
                    Arquivo selecionado
                  </p>
                  <p className="text-sm text-neutral-11">{selectedCSV.name}</p>
                  <p className="text-xs text-neutral-10 mt-1">
                    {(selectedCSV.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCSV(null)}
                  className="text-red-600 hover:text-red-700 text-sm underline"
                >
                  Remover arquivo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-12 mb-2">
                    Arraste um arquivo CSV aqui
                  </p>
                  <p className="text-sm text-neutral-10 mb-4">
                    ou clique para selecionar um arquivo
                  </p>
                  <Button variant="outline" onClick={openCSVFileDialog}>
                    Selecionar Arquivo CSV
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCSVSelect}
              className="hidden"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancelCSVUpload}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleCSVUpload}
              disabled={!selectedCSV || csvBatchUploadMutation.isPending}
            >
              {csvBatchUploadMutation.isPending
                ? "Importando..."
                : "Importar CSV"}
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
