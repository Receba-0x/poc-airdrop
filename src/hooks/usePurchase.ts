"use client";
import {
  Ed25519Program,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import {
  boxesData,
  COLLECTION_METADATA,
  CONFIG_ACCOUNT,
  CRYPTO_PRIZE_TABLE,
  PAYMENT_TOKEN_MINT,
  PRIZE_TABLE,
  PROGRAM_ID,
} from "@/constants";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { CSRF_TOKEN_HEADER, getCsrfToken } from "@/utils/getCsrfToken";
import { getErrorMessage } from "@/utils/purchase";
import { generateProvablyFairNumber } from "@/utils/probablyFair";
import bs58 from "bs58";

type PurchaseStatus =
  | "initializing"
  | "processing_sol_fee"
  | "validating_transaction"
  | "processing"
  | "success"
  | "error";

interface PurchaseState {
  isLoading: boolean;
  modalOpen: boolean;
  status: PurchaseStatus;
  errorMessage: string;
  transactionHash: string;
  prize: any;
  boxId: string;
  amount: string;
}

export function usePurchase() {
  const {
    publicKey: address,
    isConnected,
    balance,
    solPrice,
    refreshBalance,
  } = useUser();
  const { t } = useLanguage();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  const [currentStock, setCurrentStock] = useState<{ [key: number]: number }>(
    {}
  );
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isLoading: false,
    modalOpen: false,
    status: "initializing",
    errorMessage: "",
    transactionHash: "",
    prize: null,
    boxId: "",
    amount: "",
  });

  const isTransactionInProgress = useRef(false);
  const lastTransactionTime = useRef(0);
  const TRANSACTION_COOLDOWN = 10000;

  const updateState = useCallback((updates: Partial<PurchaseState>) => {
    setPurchaseState((prev) => ({ ...prev, ...updates }));
  }, []);

  const closeModal = useCallback(() => {
    updateState({
      modalOpen: false,
      ...(purchaseState.status === "success" && {
        prize: null,
        transactionHash: "",
      }),
    });

    if (
      purchaseState.status === "success" ||
      purchaseState.status === "error"
    ) {
      isTransactionInProgress.current = false;
    }
  }, [purchaseState.status, updateState]);

  const fetchCurrentStock = useCallback(async (): Promise<{
    [key: number]: number;
  }> => {
    try {
      const { data } = await axios.post("/api/lootbox", {
        action: "get-stock",
      });
      if (data.success) {
        const prizeStockArray = data.data.prizeStock;
        const formattedStock = prizeStockArray.reduce(
          (
            acc: { [key: number]: number },
            item: { prize_id: number; current_stock: number }
          ) => {
            acc[item.prize_id] = item.current_stock;
            return acc;
          },
          {} as { [key: number]: number }
        );
        setCurrentStock(formattedStock);
        return formattedStock;
      }
      throw new Error("Erro ao buscar estoque");
    } catch (error) {
      return {};
    }
  }, [address]);

  async function prepareNftAccounts(provider: AnchorProvider) {
    const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
    const program = new Program(idl, provider);

    if (!program || !program.account) {
      throw new Error("Programa não carregado corretamente");
    }

    const [nftCounter] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_counter")],
      program.programId
    );

    let nftCounterData;
    let nonce = 0;

    try {
      nftCounterData = await (program.account as any).nftCounter.fetch(
        nftCounter
      );
      nonce = nftCounterData.count ? nftCounterData.count.toNumber() : 0;
    } catch (error) {
      nonce = 0;
    }

    const collectionMetadata = new PublicKey(COLLECTION_METADATA);
    let countBytes;

    if (nftCounterData && nftCounterData.count) {
      countBytes = nftCounterData.count.toArrayLike(Buffer, "le", 8);
    } else {
      countBytes = Buffer.alloc(8);
      countBytes.writeBigUInt64LE(BigInt(0), 0);
    }

    const [nftMintAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_mint"), collectionMetadata.toBuffer(), countBytes],
      program.programId
    );

    const [nftMetadataAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_metadata"), nftMintAddress.toBuffer()],
      program.programId
    );

    const payerPaymentTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(PAYMENT_TOKEN_MINT),
      provider.wallet.publicKey,
      false
    );

    const nftTokenAccount = await getAssociatedTokenAddress(
      nftMintAddress,
      provider.wallet.publicKey
    );

    return {
      program,
      nftMintAddress,
      nftMetadataAddress,
      nftTokenAccount,
      payerPaymentTokenAccount,
      nonce,
      nftCounter,
      collectionMetadata,
    };
  }

  async function initializeProvider() {
    const wallet: any = { publicKey, signTransaction, signAllTransactions };
    return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  }

  async function sendSolFeeTransaction(provider: AnchorProvider, id: string) {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delayMs = attempt * 2000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        const FEE_USD = boxesData.find((box) => box.id === id)?.price || 0;
        const FEE_SOL = FEE_USD / solPrice;
        const lamports = Math.ceil(FEE_SOL * LAMPORTS_PER_SOL);

        const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;
        if (!treasuryWallet) {
          throw new Error("Treasury wallet address not configured");
        }

        let treasuryPublicKey: PublicKey;
        try {
          treasuryPublicKey = new PublicKey(treasuryWallet);
        } catch (error) {
          throw new Error("Invalid treasury wallet address configured");
        }

        const uniqueId = `fee_${Date.now()}_${attempt}_${Math.random()
          .toString(36)
          .substr(2, 12)}_${provider.wallet.publicKey.toString().slice(-8)}`;

        let blockhash: string = "";
        let lastValidBlockHeight: number = 0;
        let blockhashAttempts = 0;
        const maxBlockhashAttempts = 3;

        while (blockhashAttempts < maxBlockhashAttempts) {
          try {
            const blockhashResult = await connection.getLatestBlockhash(
              "confirmed"
            );
            blockhash = blockhashResult.blockhash;
            lastValidBlockHeight = blockhashResult.lastValidBlockHeight;

            if (blockhashAttempts > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            break;
          } catch (blockhashError) {
            blockhashAttempts++;
            if (blockhashAttempts >= maxBlockhashAttempts) {
              throw new Error(
                "Failed to get fresh blockhash after multiple attempts"
              );
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (!blockhash) {
          throw new Error("Failed to obtain valid blockhash");
        }

        const solFeeTransaction = new Transaction();

        const memoInstruction1 = new TransactionInstruction({
          keys: [],
          programId: new PublicKey(
            "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
          ),
          data: Buffer.from(uniqueId, "utf8"),
        });

        const memoInstruction2 = new TransactionInstruction({
          keys: [],
          programId: new PublicKey(
            "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
          ),
          data: Buffer.from(
            `blockhash_${blockhash.slice(0, 16)}_${Date.now()}`,
            "utf8"
          ),
        });

        solFeeTransaction.add(memoInstruction1);
        solFeeTransaction.add(memoInstruction2);

        const solFeeTransfer = SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: treasuryPublicKey,
          lamports,
        });
        solFeeTransaction.add(solFeeTransfer);

        solFeeTransaction.recentBlockhash = blockhash;
        solFeeTransaction.feePayer = provider.wallet.publicKey;

        const signedSolFeeTransaction = await provider.wallet.signTransaction(
          solFeeTransaction
        );

        try {
          const solFeeTxSig = await connection.sendRawTransaction(
            signedSolFeeTransaction.serialize(),
            {
              skipPreflight: false,
              preflightCommitment: "confirmed",
              maxRetries: 1,
            }
          );

          const confirmationResult = await connection.confirmTransaction(
            {
              signature: solFeeTxSig,
              blockhash: blockhash,
              lastValidBlockHeight,
            },
            "confirmed"
          );

          if (confirmationResult.value.err) {
            throw new Error(
              `Transaction confirmation failed: ${JSON.stringify(
                confirmationResult.value.err
              )}`
            );
          }

          return solFeeTxSig;
        } catch (sendError: any) {
          lastError = sendError;

          if (sendError.name === "SendTransactionError") {
            if (sendError.message?.includes("already been processed")) {
              if (attempt < maxRetries - 1) {
                continue;
              } else {
                throw new Error(
                  "Transaction keeps being detected as duplicate. Please wait longer before trying again."
                );
              }
            }

            if (sendError.message?.includes("insufficient")) {
              throw new Error(
                `Insufficient SOL balance. You need at least ${FEE_SOL.toFixed(
                  4
                )} SOL for the transaction fee.`
              );
            }

            if (sendError.message?.includes("blockhash not found")) {
              if (attempt < maxRetries - 1) {
                continue;
              }
              throw new Error(
                "Network congestion detected. Please try again in a few seconds."
              );
            }

            throw new Error(`Transaction failed: ${sendError.message}`);
          }

          throw sendError;
        }
      } catch (error: any) {
        lastError = error;

        if (
          error.message?.startsWith("Insufficient SOL") ||
          error.message?.startsWith("Treasury wallet") ||
          error.message?.startsWith("Invalid treasury")
        ) {
          throw error;
        }

        if (attempt === maxRetries - 1) {
          break;
        }
      }
    }

    throw new Error(
      `Failed to process SOL fee payment after ${maxRetries} attempts. ${
        lastError?.message || "Unknown error"
      }`
    );
  }

  const onMint = useCallback(
    async (id: string) => {
      if (!address) throw new Error("Wallet not connected");
      if (isTransactionInProgress.current) return;

      const now = Date.now();
      const timeSinceLastTransaction = now - lastTransactionTime.current;
      if (timeSinceLastTransaction < TRANSACTION_COOLDOWN) {
        const remainingCooldown = Math.ceil(
          (TRANSACTION_COOLDOWN - timeSinceLastTransaction) / 1000
        );
        updateState({
          status: "error",
          errorMessage: `Please wait ${remainingCooldown} seconds before starting a new transaction.`,
        });
        return;
      }

      const tokenAmount = 1;
      const amount = tokenAmount.toString();

      isTransactionInProgress.current = true;
      lastTransactionTime.current = now;

      updateState({
        isLoading: true,
        modalOpen: true,
        status: "initializing",
        errorMessage: "",
        transactionHash: "",
        prize: null,
        boxId: id,
        amount,
      });

      try {
        updateState({ status: "processing_sol_fee", transactionHash: "" });

        // Gerar prizeData provably fair ANTES da transação SOL
        const clientSeed = address + "_" + Date.now();
        const serverSeed = Array.from(
          crypto.getRandomValues(new Uint8Array(32))
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        const randomNumber = generateProvablyFairNumber(
          clientSeed,
          serverSeed,
          0
        );

        // Determinar o prêmio baseado no número aleatório
        // Mapear para IDs corretos da PRIZE_TABLE (8=MacBook, 9=iPhone, 7=Chuteira, 5=Camisa, 6=Bola)
        let frontendPrizeId: number;
        const randomValue = randomNumber % 1000000; // 0-999999

        if (randomValue < 100) {
          // 0.01% - MacBook (mais raro)
          frontendPrizeId = 8;
        } else if (randomValue < 1000) {
          // 0.09% - iPhone (muito raro)
          frontendPrizeId = 9;
        } else if (randomValue < 5000) {
          // 0.4% - Chuteira (raro)
          frontendPrizeId = 7;
        } else if (randomValue < 15000) {
          // 1% - Bola (incomum)
          frontendPrizeId = 6;
        } else if (randomValue < 40000) {
          // 2.5% - Camisa 1 (comum)
          frontendPrizeId = 5;
        } else {
          // 95.99% - Camisa variada (comum mais frequente)
          const camisas = [5]; // Por enquanto só camisa 1, adicione mais se tiver
          frontendPrizeId = camisas[Math.floor(Math.random() * camisas.length)];
        }

        const prizeData = {
          prizeId: frontendPrizeId,
          serverSeed,
          randomNumber: randomNumber.toString(),
          clientSeed,
        };

        const provider = await initializeProvider();
        const solFeeTransactionHash = await sendSolFeeTransaction(provider, id);

        updateState({
          status: "validating_transaction",
          transactionHash: solFeeTransactionHash || "",
        });

        try {
          const confirmation = await connection.confirmTransaction(
            {
              signature: solFeeTransactionHash,
              blockhash: (await connection.getLatestBlockhash()).blockhash,
              lastValidBlockHeight: (
                await connection.getLatestBlockhash()
              ).lastValidBlockHeight,
            },
            "confirmed"
          );

          if (confirmation.value.err) {
            throw new Error(
              `SOL fee transaction failed: ${JSON.stringify(
                confirmation.value.err
              )}`
            );
          }

          const txInfo = await connection.getTransaction(
            solFeeTransactionHash,
            {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            }
          );

          if (!txInfo) {
            throw new Error("SOL fee transaction not found after confirmation");
          }

          if (txInfo.meta?.err) {
            throw new Error(
              `SOL fee transaction failed with error: ${JSON.stringify(
                txInfo.meta.err
              )}`
            );
          }
        } catch (confirmError) {
          throw new Error(
            `SOL fee transaction confirmation failed: ${
              confirmError instanceof Error
                ? confirmError.message
                : "Unknown error"
            }`
          );
        }

        updateState({
          status: "processing",
          transactionHash: solFeeTransactionHash || "",
        });

        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const csrfTokenPut = await getCsrfToken();
          const boxPrice = boxesData.find((box) => box.id === id)?.price || 0;
          const amountInLamports = Math.floor(
            (boxPrice / solPrice) * LAMPORTS_PER_SOL
          );

          const { data } = await axios.put(
            "/api/lootbox",
            {
              wallet: address,
              timestamp: Math.floor(Date.now() / 1000),
              txHash: solFeeTransactionHash,
              clientSeed,
              solFeeTransactionHash,
              solPrice,
              boxId: Number(id),
              amount: amountInLamports,
              prizeData,
            },
            {
              headers: { [CSRF_TOKEN_HEADER]: csrfTokenPut },
              withCredentials: true,
            }
          );
          if (!data.success) {
            throw new Error(getErrorMessage(data.error));
          }
          const prizeId = data.prizeId;
          const wonPrize =
            prizeId >= 100 && prizeId <= 111
              ? CRYPTO_PRIZE_TABLE.find((p) => p.id === prizeId)
              : PRIZE_TABLE.find((p) => p.id === prizeId);

          updateState({
            status: "success",
            prize: wonPrize,
            modalOpen: false,
            transactionHash: data.txSignature || solFeeTransactionHash || "",
          });

          refreshBalance();
          return {
            tx: solFeeTransactionHash,
            prizeTx: data.txSignature,
            nftMint: data.nftMint,
            nftMetadata: data.nftMetadata,
            prize: wonPrize,
            isCrypto: prizeId >= 100 && prizeId <= 111,
            prizeId,
            provablyFair: data.randomData,
          };
        } catch (backgroundError: any) {
          console.error("❌ Erro no processamento em background:", {
            error: backgroundError?.message || backgroundError,
            stack: backgroundError?.stack,
            response: backgroundError?.response?.data,
            status: backgroundError?.response?.status,
          });
          if (backgroundError?.response?.data?.error) {
            console.error(
              "📝 Detalhes do erro da API:",
              backgroundError.response.data.error
            );
          }

          return {
            tx: solFeeTransactionHash,
            prizeTx: "",
            nftMint: "",
            nftMetadata: "",
            prize: null,
            isCrypto: false,
            prizeId: 0,
            provablyFair: null,
          };
        }
      } catch (error: any) {
        let errorMsg: string;

        if (error.message?.includes("Transaction was already processed")) {
          errorMsg = t("error.similarTransactionRecent");
        } else if (
          error.message?.includes(
            "A similar transaction was recently processed"
          )
        ) {
          errorMsg = t("error.similarTransactionRecent");
        } else if (
          error.message?.includes(
            "A similar burn transaction was recently processed"
          )
        ) {
          errorMsg = t("error.similarTransactionRecent");
        } else if (
          error.message?.includes(
            "Transaction keeps being detected as duplicate"
          )
        ) {
          errorMsg =
            "Transaction keeps being detected as duplicate. Please wait longer before trying again.";
        } else if (
          error.message?.includes("Failed to process SOL fee payment after")
        ) {
          errorMsg =
            "Failed to process SOL fee payment after multiple attempts. Please try again later.";
        } else if (error.message?.includes("Network congestion detected")) {
          errorMsg = t("error.networkCongestion");
        } else if (error.message?.includes("Insufficient SOL balance")) {
          errorMsg = error.message;
        } else if (
          error.message?.includes("Insufficient funds for token burn")
        ) {
          errorMsg = t("error.insufficientBalance");
        } else if (error.message?.includes("Program error")) {
          errorMsg = error.message;
        } else if (error.message?.includes("Invalid signature")) {
          errorMsg =
            "Invalid signature received from server. Please try again.";
        } else if (error.message?.includes("Signature must be 64 bytes")) {
          errorMsg = "Invalid signature format. Please try again.";
        } else if (error.message?.includes("insufficient")) {
          errorMsg = t("error.insufficientBalance");
        } else if (error.message?.includes("User rejected")) {
          errorMsg = t("error.transactionCancelled");
        } else if (error.message?.includes("_bn")) {
          errorMsg = "Error in NFT configuration. Try again.";
        } else if (error.message?.includes("Transaction failed:")) {
          errorMsg = error.message;
        } else if (
          error.message?.includes("Failed to process SOL fee payment")
        ) {
          errorMsg = "Failed to process SOL fee payment. Please try again.";
        } else if (error.message?.includes("Transaction simulation failed")) {
          errorMsg =
            "Transaction simulation failed. Please check your balance and try again.";
        } else {
          errorMsg = t("error.transactionFailed");
        }

        updateState({ status: "error", errorMessage: errorMsg });
        throw error;
      } finally {
        updateState({ isLoading: false });
        isTransactionInProgress.current = false;
      }
    },
    [address, t, updateState, refreshBalance, solPrice]
  );

  useEffect(() => {
    Promise.all([refreshBalance(), fetchCurrentStock()]);
  }, [address]);

  return useMemo(
    () => ({
      onMint,
      balance,
      isLoading: purchaseState.isLoading,
      isConnected,
      currentStock,
      modalOpen: purchaseState.modalOpen,
      modalStatus: purchaseState.status,
      errorMessage: purchaseState.errorMessage,
      transactionHash: purchaseState.transactionHash,
      currentPrize: purchaseState.prize,
      currentBoxId: purchaseState.boxId,
      currentAmount: purchaseState.amount,
      closeModal,
    }),
    [onMint, balance, purchaseState, isConnected, currentStock, closeModal]
  );
}
