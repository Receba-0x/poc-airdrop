import { solanaTransactionService } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTransactionStore } from "@/stores/transactionStore";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

// Hook simplificado baseado na nova documentação
export function useWithdraw() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  // Query para buscar solicitações de saque
  const query = useQuery({
    queryKey: ["withdraw-requests"],
    queryFn: async () => {
      const response = await solanaTransactionService.getWithdrawRequests();
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation principal para saque via Solana (conforme nova documentação)
  const withdrawMutation = useMutation({
    mutationFn: async ({ usdAmount }: { usdAmount: number }) => {
      const response = await solanaTransactionService.withdrawSolana({
        usdAmount,
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["withdraw-requests"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      refetchUser();
      toast.success(`✅ Saque realizado! Novo saldo: $${data.balance}`, {
        icon: "🎉",
        duration: 6000,
      });

      return {
        success: true,
        balance: data.balance,
        currency: "USD",
        lastUpdated: new Date(),
      };
    },
    onError: (error: any) => {
      console.error("Withdraw error:", error);

      // Tratamento específico de timeout
      if (error.status === 408) {
        toast.error(
          "⏳ Verificação pendente - SOL enviado, confirme manualmente",
          {
            duration: 10000,
          }
        );
        return;
      }

      // Outros erros
      toast.error(error.message || "Erro no saque. Tente novamente.", {
        icon: "❌",
        duration: 5000,
      });
    },
  });

  return {
    // Query data
    items: query.data?.requests || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Mutation principal (conforme nova documentação)
    withdrawSolana: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
  };
}
