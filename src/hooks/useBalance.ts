"use client";

import { queryKeys, solanaTransactionService, userService } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTransactionStore } from "@/stores/transactionStore";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

export function useDeposit() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const { createTransaction, updateTransaction, setCurrentTransaction } =
    useTransactionStore();

  const query = useQuery({
    queryKey: queryKeys.deposit.requests(),
    queryFn: async () => {
      const response: any = await solanaTransactionService.getDepositRequests({
        status: "PENDING",
        limit: 1,
        offset: 0,
      });
      setCurrentTransaction(response[0]);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const initMutation = useMutation({
    mutationFn: async (solAmount: number) => {
      const response = await solanaTransactionService.initDeposit({
        solAmount,
      });
      return response;
    },
    onSuccess: (response) => {
      console.log("response_initDeposit", response);
      const transaction = createTransaction("deposit", {
        type: "deposit",
        amount: response.solAmount,
        currency: "SOL",
        solAmount: response.solAmount,
        usdAmount: response.usdAmount,
        solPrice: response.solPrice,
        serverWallet: response.serverWallet,
        memo: response.memo,
        expiresAt: new Date(response.expiresAt),
      });
      setCurrentTransaction({ ...transaction, status: "pending" });
      queryClient.invalidateQueries({ queryKey: queryKeys.deposit.requests() });
      toast.success("Deposit request created successfully!");
      return transaction;
    },
    onError: (error: any) => {
      console.error("Deposit init error:", error);
      toast.error(
        error.message || "Failed to initialize deposit. Please try again.",
        { icon: "❌", duration: 4000 }
      );
    },
  });

  // Mutation para verificar depósito
  const verifyMutation = useMutation({
    mutationFn: async ({
      depositId,
      transactionHash,
    }: {
      depositId: string;
      transactionHash?: string;
    }) => {
      const response = await solanaTransactionService.verifyDeposit({
        depositId,
        transactionHash,
      });
      return { response, depositId };
    },
    onSuccess: ({ response, depositId }) => {
      console.log("response_verifyDeposit", response);
      updateTransaction(depositId, {
        status: "completed",
        txHash: (response as any).transactionHash,
      });
      refetchUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.deposit.requests() });
      toast.success("Deposit verified successfully!");
    },
    onError: (error: any, { depositId }) => {
      console.error("Deposit verification error:", error);
      updateTransaction(depositId, {
        status: "failed",
        errorMessage: error.message,
      });
      toast.error(
        error.message || "Failed to verify deposit. Please try again.",
        {
          icon: "❌",
          duration: 4000,
        }
      );
    },
  });

  // Mutation para cancelar depósito
  const cancelMutation = useMutation({
    mutationFn: async (depositId: string) => {
      const response = await solanaTransactionService.cancelDeposit(depositId);
      return { response, depositId };
    },
    onSuccess: ({ depositId }) => {
      updateTransaction(depositId, { status: "cancelled" });
      queryClient.invalidateQueries({ queryKey: queryKeys.deposit.requests() });
      toast.success("Deposit cancelled successfully!");
    },
    onError: (error: any) => {
      console.error("Cancel deposit error:", error);
      toast.error("Failed to cancel deposit. Please try again.", {
        icon: "❌",
        duration: 4000,
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

    // Mutations
    initDeposit: initMutation.mutateAsync,
    isInitializing: initMutation.isPending,

    verifyDeposit: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,

    cancelDeposit: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
}

export function useBalanceTransactions(filters: {
  limit: number;
  offset: number;
  type: string;
  status: string;
}) {
  const query = useQuery({
    queryKey: ["balance-transactions", filters],
    queryFn: async () => {
      return await userService.getBalanceTransactions({
        limit: filters.limit,
        offset: filters.offset,
        type: filters.type,
        status: filters.status,
      });
    },
  });
  const transactions = query.data?.transactions || [];
  return {
    transactions: transactions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
