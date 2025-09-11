import { itemService, queryKeys, type ItemsFilters } from "@/services";
import type { CreateItemBatchPayload } from "@/services/item/ItemService";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useItem(id: string) {
  const query = useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: async () => {
      return itemService.getItem(id);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    item: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useItems(filters?: ItemsFilters) {
  const query = useQuery({
    queryKey: queryKeys.items.list(filters || {}),
    queryFn: async () => {
      const response = await itemService.getItems(filters);
      console.log(response);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateItem() {
  const mutation = useMutation({
    mutationFn: async (itemData: any) => {
      return itemService.createItem(itemData);
    },
  });

  return {
    createItem: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useCreateItemsBatch() {
  const mutation = useMutation({
    mutationFn: async (data: CreateItemBatchPayload) => {
      return itemService.createItemBatch(data);
    },
  });

  return {
    createItemsBatch: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
