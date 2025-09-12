"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { BaseModal, useClipboard } from "@/components/TransactionModals";
import {
  useAdminUploadedFiles,
  useUploadImage,
  useDeleteUploadedFile,
  useUploadMultipleImages,
} from "@/hooks/useAdminUpload";
import { UploadFilters, UploadedFile } from "@/services";
// Simple date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function AdminImages() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [filters, setFilters] = useState<UploadFilters>({
    page: 1,
    limit: 24,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { copyToClipboard } = useClipboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { files, pagination, isLoading, refetch } =
    useAdminUploadedFiles(filters);
  const { uploadImage, isLoading: isUploading } = useUploadImage();
  const { uploadMultipleImages, isLoading: isBulkUploading } =
    useUploadMultipleImages();
  const { deleteFile, isLoading: isDeleting } = useDeleteUploadedFile();

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (filesArray.length > 0) {
        setSelectedFiles((prev) => [...prev, ...filesArray]);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      if (selectedFiles.length === 1) {
        await uploadImage(selectedFiles[0]);
      } else {
        await uploadMultipleImages(selectedFiles);
      }
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleDelete = async (filename: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta imagem?")) {
      try {
        await deleteFile(filename);
        refetch();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleSearch = () => {
    // Note: The API doesn't have search functionality in the current documentation
    // This could be implemented later if the API supports it
    console.log("Search term:", searchTerm);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getImageUrl = (file: UploadedFile) => {
    // Assuming the API returns relative URLs that need to be prefixed
    return file.url.startsWith("http")
      ? file.url
      : `${process.env.NEXT_PUBLIC_API_URL}${file.url}`;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-6 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-6 rounded"></div>
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
              Gerenciar Imagens
            </h1>
            <p className="text-neutral-11 mt-2">
              Faça upload e gerencie suas imagens
            </p>
          </div>
          <Button variant="default" onClick={() => setIsUploadModalOpen(true)}>
            Novo Upload
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-12">
              Total de Imagens
            </h3>
            <span className="text-lg font-semibold text-neutral-12">
              {pagination?.totalFiles || 0}
            </span>
          </div>
        </div>

        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-12">
              Página Atual
            </h3>
            <span className="text-lg font-semibold text-neutral-12">
              {pagination?.currentPage || 1} / {pagination?.totalPages || 1}
            </span>
          </div>
        </div>

        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-12">Por Página</h3>
            <span className="text-lg font-semibold text-neutral-12">
              {files.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
        <h3 className="text-lg font-semibold text-neutral-12 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
              placeholder="Buscar por nome..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Ordenar por
            </label>
            <select
              value={filters.sortBy || "date"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as "name" | "date",
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
            >
              <option value="date">Data</option>
              <option value="name">Nome</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Ordem
            </label>
            <select
              value={filters.sortOrder || "desc"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortOrder: e.target.value as "asc" | "desc",
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
            >
              <option value="desc">Mais Recente</option>
              <option value="asc">Mais Antigo</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  page: 1,
                  limit: 24,
                  sortBy: "date",
                  sortOrder: "desc",
                });
                setSearchTerm("");
              }}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-neutral-12">
            Imagens ({files.length})
          </h3>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-5 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-neutral-11"
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
            <p className="text-neutral-11 mb-4">Nenhuma imagem encontrada</p>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Fazer Primeiro Upload
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file: UploadedFile) => (
                <div
                  key={file.filename}
                  className="relative group bg-neutral-4 rounded-lg overflow-hidden border border-neutral-6 hover:border-neutral-7 transition-colors"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={getImageUrl(file)}
                      alt={file.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(file.filename)}
                        disabled={isDeleting}
                        className="text-xs bg-red-3 border-red-6 text-red-11 hover:bg-red-4"
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p
                      onClick={() => copyToClipboard(getImageUrl(file))}
                      className="text-xs text-link-11 truncate cursor-pointer"
                      title={file.filename}
                    >
                      {file.filename}
                    </p>
                    <p className="text-xs text-neutral-10 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-neutral-10 mt-1">
                      {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page || 1) - 1,
                    }))
                  }
                  disabled={!pagination.hasPreviousPage}
                >
                  Anterior
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-11">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page || 1) + 1,
                    }))
                  }
                  disabled={!pagination.hasNextPage}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <BaseModal
          size="lg"
          showCloseButton={false}
          preventClose={true}
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload de Imagens"
        >
          <div className="mt-3">
            <div className="space-y-6">
              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary-10 bg-primary-3"
                    : selectedFiles.length > 0
                    ? "border-neutral-6 bg-neutral-4"
                    : "border-neutral-6 bg-neutral-5 hover:border-neutral-7"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFiles.length === 0 ? (
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-neutral-12 mb-2">
                        Arraste suas imagens aqui
                      </p>
                      <p className="text-sm text-neutral-11 mb-4">
                        ou clique para selecionar arquivos
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Selecionar Imagens
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative bg-neutral-3 rounded-lg p-2 border border-neutral-6"
                        >
                          <div className="text-xs text-neutral-11 mb-1 truncate max-w-32">
                            {file.name}
                          </div>
                          <div className="text-xs text-neutral-10">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-12 text-neutral-3 rounded-full flex items-center justify-center text-xs hover:bg-neutral-11"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={clearFiles}>
                        Limpar Tudo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Adicionar Mais
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Info */}
              <div className="bg-neutral-5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-neutral-12 mb-2">
                  Informações sobre upload:
                </h4>
                <ul className="text-xs text-neutral-11 space-y-1">
                  <li>• Formatos aceitos: JPG, PNG, GIF, WebP</li>
                  <li>• Tamanho máximo por arquivo: 10MB</li>
                  <li>
                    • As imagens são automaticamente otimizadas e comprimidas
                  </li>
                  <li>• Suporte para upload múltiplo</li>
                </ul>
              </div>

              {/* Selected Files Summary */}
              {selectedFiles.length > 0 && (
                <div className="bg-neutral-5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-12 mb-2">
                    Arquivos selecionados: {selectedFiles.length}
                  </h4>
                  <div className="text-xs text-neutral-11">
                    Total:{" "}
                    {(
                      selectedFiles.reduce((acc, file) => acc + file.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleUpload}
                  disabled={
                    selectedFiles.length === 0 || isUploading || isBulkUploading
                  }
                >
                  {isUploading || isBulkUploading
                    ? `Enviando... (${
                        selectedFiles.length > 1
                          ? selectedFiles.length + " arquivos"
                          : "1 arquivo"
                      })`
                    : `Enviar ${
                        selectedFiles.length > 1
                          ? selectedFiles.length + " imagens"
                          : "imagem"
                      }`}
                </Button>
              </div>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
