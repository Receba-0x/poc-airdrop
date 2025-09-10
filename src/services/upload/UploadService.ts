import type { ApiClient } from "../base/ApiClient";

export interface UploadError {
  message: string;
  code?: string;
  field?: string;
}

export class UploadService {
  constructor(private apiClient: ApiClient) {}

  async uploadImage(file: FormData): Promise<any> {
    try {
      const response = await this.apiClient.post("/api/v1/upload/image", file);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
  private handleError(error: any): UploadError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || "An error occurred",
        code: error.response.data.code,
        field: error.response.data.field,
      };
    }

    if (error.request) {
      return {
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }

    return {
      message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    };
  }
}
