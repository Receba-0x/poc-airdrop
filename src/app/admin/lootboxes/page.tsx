"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AdminLootbox,
  adminLootboxService,
  CreateLootboxRequest,
  UpdateLootboxRequest,
  uploadService,
} from "@/services";
import { Button } from "@/components/Button";
import Image from "next/image";
import { Input } from "@/components/Input";
import { useRouter } from "next/navigation";
import { useLootboxes } from "@/hooks/useLootbox";
import { BaseModal } from "@/components/TransactionModals";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Edit,
  Package
} from "lucide-react";

interface LootboxFormData {
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  currency: "SOL" | "USD";
  sortOrder: number;
  isActive: boolean;
}

export default function AdminLootboxes() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { push } = useRouter();
  const [editingLootbox, setEditingLootbox] = useState<AdminLootbox | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    type: 'danger' | 'warning' | 'info';
  } | null>(null);
  const [formData, setFormData] = useState<LootboxFormData>({
    name: "",
    description: "",
    imageUrl: "",
    price: 0,
    currency: "SOL",
    sortOrder: 0,
    isActive: true,
  });

  const { lootboxes, isLoading } = useLootboxes();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const createLootboxMutation = useMutation({
    mutationFn: (data: CreateLootboxRequest) =>
      adminLootboxService.createLootbox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lootboxes-stock"] });
      setIsCreateModalOpen(false);
      resetForm();
      toast.success("Lootbox criada com sucesso!", {
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar lootbox: ${error.message || "Tente novamente"}`, {
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    },
  });

  const updateLootboxMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLootboxRequest }) =>
      adminLootboxService.updateLootbox(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lootboxes-stock"] });
      setEditingLootbox(null);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success("Lootbox atualizada com sucesso!", {
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar lootbox: ${error.message || "Tente novamente"}`, {
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    },
  });

  const deleteLootboxMutation = useMutation({
    mutationFn: (id: string) => adminLootboxService.deleteLootbox(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lootboxes-stock"] });
      toast.success("Lootbox deletada com sucesso!", {
        icon: <Trash2 className="w-5 h-5" />,
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast.error(`Erro ao deletar lootbox: ${error.message || "Tente novamente"}`, {
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      price: 0,
      currency: "SOL",
      sortOrder: 0,
      isActive: true,
    });
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
    createLootboxMutation.mutate({
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      price: formData.price,
      currency: formData.currency,
      sortOrder: formData.sortOrder,
    });
  };

  const handleUpdate = () => {
    if (!editingLootbox) return;
    updateLootboxMutation.mutate({
      id: editingLootbox.id,
      data: {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        price: formData.price,
        currency: formData.currency,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      },
    });
  };

  const handleDelete = (id: string) => {
    setConfirmAction({
      isOpen: true,
      title: "Deletar Lootbox",
      message: "Esta ação não pode ser desfeita. Todos os itens vinculados a esta lootbox serão removidos permanentemente.",
      action: () => {
        deleteLootboxMutation.mutate(id);
        setConfirmAction(null);
      },
      type: 'danger'
    });
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-12">
            Gerenciar Lootboxes
          </h1>
          <p className="text-neutral-10 mt-2">Crie e gerencie suas lootboxes</p>
        </div>
        <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
          Nova Lootbox
        </Button>
      </div>

      {/* Lootboxes Table */}
      <div className="bg-neutral-3 rounded-lg shadow-sm border border-neutral-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-6">
          <h3 className="text-lg font-semibold text-neutral-12">
            Lootboxes ({lootboxes.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-6">
            <thead className="bg-neutral-4">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Itens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Probabilidade Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-4 divide-y divide-neutral-6">
              {lootboxes.map((lootbox: AdminLootbox) => (
                <tr key={lootbox.id} className="hover:bg-neutral-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-11">
                      {lootbox.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-11">
                      {lootbox.price} {lootbox.price > 0 ? "SOL" : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-11">ativos</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-11">0 %</div>
                  </td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap text-sm font-medium">
                    <Button
                      onClick={() => push(`/admin/lootboxes/${lootbox.id}`)}
                      variant="secondary"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(lootbox.id)}
                      variant="destructive"
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lootboxes.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-neutral-10">Nenhuma lootbox encontrada</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
            >
              Criar primeira lootbox
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <BaseModal
          title={editingLootbox ? "Editar Lootbox" : "Criar Nova Lootbox"}
          isOpen={isCreateModalOpen}
          preventClose={true}
          onClose={() => setIsCreateModalOpen(false)}
        >
          <div className="mt-3">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-11 mb-1">
                  Nome
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nome da lootbox"
                />
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
                  className="w-full bg-neutral-3 px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Descrição da lootbox"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Preço
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Moeda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value as "SOL" | "USD",
                      })
                    }
                    className="w-full bg-neutral-3 px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="SOL">SOL</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-neutral-11 mb-1">
                  Imagem da Lootbox
                </label>
                <div className="flex items-center gap-4">
                  {formData.imageUrl && (
                    <div className="min-w-20 min-h-20 w-20 h-20 bg-neutral-3 rounded-lg overflow-hidden border-2 border-neutral-6 flex items-center justify-center">
                      <Image
                        src={formData.imageUrl}
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
                      {formData.imageUrl
                        ? "Alterar Imagem"
                        : "Adicionar Imagem"}
                    </Button>
                    {formData.imageUrl && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setFormData({ ...formData, imageUrl: "" })
                        }
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-11 mb-1">
                  Ordem de Classificação
                </label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-6 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {editingLootbox && (
                <div className="flex items-center">
                  <Input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
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
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingLootbox(null);
                  resetForm();
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={editingLootbox ? handleUpdate : handleCreate}
                disabled={
                  createLootboxMutation.isPending ||
                  updateLootboxMutation.isPending
                }
                variant="default"
              >
                {createLootboxMutation.isPending ||
                updateLootboxMutation.isPending
                  ? "Salvando..."
                  : editingLootbox
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}

      {isImageModalOpen && (
        <BaseModal
          title="Upload de Imagem da Lootbox"
          isOpen={isImageModalOpen}
          preventClose={true}
          onClose={() => setIsImageModalOpen(false)}
        >
          <div className="mt-3">
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
                      <Image
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
                    <p className="text-sm text-neutral-2">
                      Imagem selecionada: {selectedImage?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto">
                      <svg
                        className="w-full h-full text-neutral-6"
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
                      <p className="text-lg font-medium text-neutral-11 mb-2">
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

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="bg-neutral-4 rounded-lg p-4">
                <h4 className="text-sm font-medium text-neutral-11 mb-2">
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
                  variant="default"
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

      {/* Confirmation Modal */}
      {confirmAction && (
        <BaseModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          title={confirmAction.title}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {confirmAction.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
              {confirmAction.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />}
              {confirmAction.type === 'info' && <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />}
              <p className="text-neutral-12">{confirmAction.message}</p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
              >
                Cancelar
              </Button>
              <Button
                variant={confirmAction.type === 'danger' ? 'destructive' : 'default'}
                onClick={confirmAction.action}
              >
                {confirmAction.type === 'danger' ? 'Deletar' :
                 confirmAction.type === 'warning' ? 'Continuar' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
