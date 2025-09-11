"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminItemsService,
  AdminItem,
  CreateItemRequest,
  UpdateItemRequest,
  ItemsFilters,
  uploadService,
  queryClient,
} from "@/services";
import { Button } from "@/components/Button";
import Image from "next/image";
import { useCreateItem, useItems } from "@/hooks/useItem";
import { BaseModal } from "@/components/TransactionModals";
import { Checkbox } from "@/components/CheckBox";

interface ItemFormData {
  name: string;
  description: string;
  type: "SOL" | "PHYSICAL" | "NFT" | "SPECIAL";
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  value: number;
  imageUrl?: string;
  metadata: Record<string, any>;
  isActive: boolean;
}

const rarityColors = {
  COMMON: "bg-neutral-8 text-neutral-12",
  UNCOMMON: "bg-green-8 text-green-12",
  RARE: "bg-link-8 text-link-12",
  EPIC: "bg-purple-8 text-purple-12",
  LEGENDARY: "bg-warning-8 text-warning-12",
  MYTHIC: "bg-error-8 text-error-12",
};

export default function AdminItems() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);
  const [filters, setFilters] = useState<ItemsFilters>({});
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    description: "",
    type: "SOL",
    rarity: "COMMON",
    value: 0,
    imageUrl: "",
    metadata: {},
    isActive: false,
  });
  const [metadataInput, setMetadataInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { items, isLoading, refetch } = useItems(filters);
  const { createItem, isLoading: isCreateLoading } = useCreateItem();

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemRequest }) =>
      adminItemsService.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      setEditingItem(null);
      resetForm();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => adminItemsService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "SOL",
      rarity: "COMMON",
      value: 0,
      imageUrl: "",
      metadata: {},
      isActive: true,
    });
    setMetadataInput("");
    setSelectedImage(null);
    setImagePreview(null);
  };

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
      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedImage);
      try {
        const response = await uploadService.uploadImage(formDataUpload);
        if (!response.success) throw new Error(response.error);
        const imageUrl = response.imageUrl;
        const serverUrl = process.env.NEXT_PUBLIC_API_URL;
        const fullImageUrl = serverUrl + imageUrl;
        setFormData({ ...formData, imageUrl: fullImageUrl });
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

  const handleCreate = () => {
    const metadata = metadataInput ? JSON.parse(metadataInput) : {};
    createItem({
      name: formData.name,
      description: formData.description,
      type: formData.type,
      rarity: formData.rarity,
      value: formData.value,
      imageUrl: formData.imageUrl,
      metadata,
      isActive: formData.isActive,
    });
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    const metadata = metadataInput ? JSON.parse(metadataInput) : {};
    updateItemMutation.mutate({
      id: editingItem.id,
      data: {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        rarity: formData.rarity,
        value: formData.value,
        imageUrl: formData.imageUrl,
        metadata,
        isActive: formData.isActive,
      },
    });
  };

  const handleEdit = (item: AdminItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      type: item.type,
      rarity: item.rarity,
      value: item.value,
      imageUrl: item.imageUrl || "",
      metadata: item.metadata || {},
      isActive: item.isActive,
    });
    setMetadataInput(JSON.stringify(item.metadata || {}, null, 2));
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleMetadataChange = (value: string) => {
    setMetadataInput(value);
    try {
      const parsed = JSON.parse(value);
      setFormData({ ...formData, metadata: parsed });
    } catch (e) {
      // Invalid JSON, keep current metadata
    }
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
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-12">
              Gerenciar Itens
            </h1>
            <p className="text-neutral-11 mt-2">
              Crie e gerencie itens do sistema
            </p>
          </div>
          <Button variant="default" onClick={() => setIsCreateModalOpen(true)}>
            Novo Item
          </Button>
        </div>
      </div>

      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
        <h3 className="text-lg font-semibold text-neutral-12 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Tipo
            </label>
            <select
              value={filters.type || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: (e.target.value as any) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
            >
              <option value="">Todos</option>
              <option value="SOL">SOL</option>
              <option value="PHYSICAL">Físico</option>
              <option value="NFT">NFT</option>
              <option value="SPECIAL">Especial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Raridade
            </label>
            <select
              value={filters.rarity || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  rarity: (e.target.value as any) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
            >
              <option value="">Todas</option>
              <option value="COMMON">Comum</option>
              <option value="UNCOMMON">Incomum</option>
              <option value="RARE">Raro</option>
              <option value="EPIC">Épico</option>
              <option value="LEGENDARY">Lendário</option>
              <option value="MYTHIC">Mítico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Status
            </label>
            <select
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive.toString()
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive:
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-6">
          <h3 className="text-lg font-semibold text-neutral-12">
            Itens ({items.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-6">
            <thead className="bg-neutral-4">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Raridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-3 divide-y divide-neutral-6">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-4">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-neutral-12">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-neutral-11 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12 capitalize">
                      {item.type.toLowerCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rarityColors[item.rarity]
                      }`}
                    >
                      {item.rarity.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">
                      {item.type === "SOL"
                        ? `${item.value} SOL`
                        : `$${item.value}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive
                          ? "bg-green-3 border border-green-6 text-green-11"
                          : "bg-error-3 border border-error-6 text-error-11"
                      }`}
                    >
                      {item.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant={"secondary"}
                      onClick={() => handleEdit(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={() => handleDelete(item.id)}
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-neutral-11">Nenhum item encontrado</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-primary-11 hover:text-primary-12 font-medium"
            >
              Criar primeiro item
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <BaseModal
          size="lg"
          showCloseButton={false}
          preventClose={true}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingItem ? "Editar Item" : "Criar Novo Item"}
        >
          <div className="mt-3">
            <h3 className="text-lg font-semibold text-neutral-12 mb-4">
              {editingItem ? "Editar Item" : "Criar Novo Item"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                    placeholder="Nome do item"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 bg-neutral-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-10"
                  >
                    <option value="SOL">SOL</option>
                    <option value="PHYSICAL">Físico</option>
                    <option value="NFT">NFT</option>
                    <option value="SPECIAL">Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-11 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-6 bg-neutral-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-10"
                  placeholder="Descrição do item"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Raridade
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rarity: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 bg-neutral-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-10"
                  >
                    <option value="COMMON">Comum</option>
                    <option value="UNCOMMON">Incomum</option>
                    <option value="RARE">Raro</option>
                    <option value="EPIC">Épico</option>
                    <option value="LEGENDARY">Lendário</option>
                    <option value="MYTHIC">Mítico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 bg-neutral-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-10"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Imagem do Item
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-5 rounded-lg overflow-hidden border-2 border-neutral-6 flex items-center justify-center">
                      {formData.imageUrl ? (
                        <Image
                          src={formData.imageUrl}
                          alt="Item preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-neutral-11 text-2xl">📦</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsImageModalOpen(true)}
                      className="text-sm"
                    >
                      {formData.imageUrl
                        ? "Alterar Imagem"
                        : "Adicionar Imagem"}
                    </Button>
                    {formData.imageUrl && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setFormData({ ...formData, imageUrl: "" })
                        }
                        className="text-neutral-12 hover:text-neutral-11"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center pt-6 col-span-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-primary-10 focus:ring-primary-10 border-neutral-6 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-neutral-11"
                  >
                    Ativo
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-11 mb-1">
                  Metadata (JSON)
                </label>
                <textarea
                  value={metadataInput}
                  onChange={(e) => handleMetadataChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-6 bg-neutral-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-10 font-mono text-sm"
                  placeholder='{"key": "value"}'
                  rows={4}
                />
                {metadataInput && (
                  <p className="text-xs text-neutral-11 mt-1">
                    JSON válido:{" "}
                    {(() => {
                      try {
                        JSON.parse(metadataInput);
                        return "✅";
                      } catch {
                        return "❌ JSON inválido";
                      }
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}
                variant="outline"
                disabled={isCreateLoading}
              >
                Cancelar
              </Button>
              <Button onClick={editingItem ? handleUpdate : handleCreate}>
                {isCreateLoading || updateItemMutation.isPending
                  ? "Salvando..."
                  : editingItem
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}

      {isImageModalOpen && (
        <BaseModal
          size="lg"
          showCloseButton={false}
          preventClose={true}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          title="Upload de Imagem do Item"
        >
          <div className="mt-3">
            <div className="space-y-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  imagePreview
                    ? "border-neutral-6 bg-neutral-5"
                    : "border-neutral-6 bg-neutral-5 hover:border-primary-6"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <Image
                        src={imagePreview}
                        alt="Preview da imagem"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-full border-4 border-neutral-6"
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
                        className="w-full h-full text-neutral-11"
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
                      <p className="text-sm text-neutral-11 mb-4">
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

              <div className="bg-neutral-5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-neutral-12 mb-2">
                  Requisitos da imagem:
                </h4>
                <ul className="text-xs text-neutral-11 space-y-1">
                  <li>• Formatos aceitos: JPG, PNG, GIF</li>
                  <li>• Tamanho máximo: 5MB</li>
                  <li>• Resolução recomendada: 200x200px ou maior</li>
                  <li>
                    • Formato quadrado recomendado para melhor visualização
                  </li>
                </ul>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCancelUpload}>
                  Cancelar
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleImageUpload}
                  disabled={!selectedImage}
                >
                  {selectedImage ? "Confirmar Upload" : "Selecione uma imagem"}
                </Button>
              </div>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
