import { useMutation } from "@tanstack/react-query";
import { queryClient, userService } from "@/services";
import toast from "react-hot-toast";

export function useSellItem() {
  const sellItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await userService.sellItem(itemId);
      const data = response.data;
      return {
        success: true,
        message: `${data.soldItem.item.name} sold successfully`,
        amount: data.amountAdded,
      };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
    },
    onError: (error) => {
      console.error("Failed to sell item:", error);
    },
  });

  return {
    sellItem: sellItemMutation.mutateAsync,
    isLoading: sellItemMutation.isPending,
    isError: sellItemMutation.isError,
    error: sellItemMutation.error,
    isSuccess: sellItemMutation.isSuccess,
  };
}
