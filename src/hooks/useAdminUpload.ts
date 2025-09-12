import {
  adminUploadService,
  queryKeys,
  type UploadFilters,
  queryClient,
} from "@/services";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useAdminUploadedFiles(filters?: UploadFilters) {
  const query = useQuery({
    queryKey: queryKeys.adminUploads.list(filters || {}),
    queryFn: async () => {
      const response = await adminUploadService.getUploadedFiles(filters);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  return {
    files: query.data?.files || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUploadImage() {
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      return adminUploadService.uploadImage(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUploads.all });
    },
  });

  return {
    uploadImage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteUploadedFile() {
  const mutation = useMutation({
    mutationFn: async (filename: string) => {
      return adminUploadService.deleteFile(filename);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUploads.all });
    },
  });

  return {
    deleteFile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useUploadMultipleImages() {
  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      return Promise.all(
        files.map((file) => adminUploadService.uploadImage(file))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUploads.all });
    },
  });

  return {
    uploadMultipleImages: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
