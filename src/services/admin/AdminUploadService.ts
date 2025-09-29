import { ApiClient, ApiResponse } from "../base/ApiClient";

export interface UploadImageResponse {
  url: string;
  filename: string;
}

export interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  modifiedAt: string;
  extension: string;
}

export interface UploadListResponse {
  files: UploadedFile[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFiles: number;
    filesPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UploadFilters {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchUploadResponse {
  success: boolean;
  message: string;
  total: number;
  successCount: number;
  failed: number;
  urls: string[];
  errors: Array<{
    index: number;
    filename: string;
    error: string;
  }>;
}

export class AdminUploadService {
  constructor(private apiClient: ApiClient) {}

  // ==========================================
  // UPLOAD DE IMAGENS
  // ==========================================

  async uploadImage(file: File): Promise<ApiResponse<UploadImageResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiClient.post<UploadImageResponse>("/api/v1/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // ==========================================
  // LISTAGEM DE ARQUIVOS
  // ==========================================

  async getUploadedFiles(filters?: UploadFilters): Promise<ApiResponse<UploadListResponse>> {
    const params = new URLSearchParams();

    if (filters?.page !== undefined) {
      params.append("page", filters.page.toString());
    }
    if (filters?.limit !== undefined) {
      params.append("limit", filters.limit.toString());
    }
    if (filters?.sortBy) {
      params.append("sortBy", filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append("sortOrder", filters.sortOrder);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.apiClient.get<UploadListResponse>(`/api/v1/upload${query}`);
  }

  // ==========================================
  // DELETAR ARQUIVO
  // ==========================================

  async deleteFile(filename: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/v1/upload/${filename}`);
  }

  // ==========================================
  // MÚLTIPLO UPLOAD
  // ==========================================

  async uploadBatch(files: File[]): Promise<ApiResponse<BatchUploadResponse>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    return this.apiClient.post<BatchUploadResponse>("/api/v1/upload/batch", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async uploadMultipleImages(files: File[]): Promise<Promise<ApiResponse<UploadImageResponse>>[]> {
    return files.map(file => this.uploadImage(file));
  }
}
