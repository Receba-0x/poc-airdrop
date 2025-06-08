"use client";
import {
  Ed25519Program,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import {
  COLLECTION_METADATA,
  COLLECTION_NAME,
  COLLECTION_SYMBOL,
  COLLECTION_URI,
  CONFIG_ACCOUNT,
  CRYPTO_PRIZE_TABLE,
  PAYMENT_TOKEN_MINT,
  PRIZE_TABLE,
  PROGRAM_ID,
  TOKEN_METADATA_PROGRAM,
} from "@/constants";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import crypto from "crypto";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";

const METAPLEX_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

export function usePurchase() {
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const { connection } = useConnection();
  const { balance, refreshBalance, solanaPrice } = useUser();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState<{ [key: number]: number }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<"initializing" | "processing" | "determining" | "delivering" | "saving" | "success" | "error">("initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [currentPrize, setCurrentPrize] = useState<any>(null);
  const [currentBoxType, setCurrentBoxType] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");

  const closeModal = () => {
    setModalOpen(false);
    if (modalStatus === "success") {
      setCurrentPrize(null);
      setTransactionHash("");
    }
  };

  async function fetchCurrentStock(): Promise<{ [key: number]: number }> {
    try {
      const response = await axios.get('/api/get-stock');
      if (response.data.success) {
        setCurrentStock(response.data.stock);
        return response.data.stock;
      }
      throw new Error("Erro ao buscar estoque");
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      return {
        5: 90,
        6: 40,
        7: 30,
        8: 1,
        9: 2,
        10: 10
      };
    }
  }

  function checkStock(prizeId: number, stock: { [key: number]: number }): boolean {
    const prize = PRIZE_TABLE.find(p => p.id === prizeId);
    if (!prize?.stockRequired) return true;
    return (stock[prizeId] || 0) > 0;
  }

  function generateProvablyFairNumber(userSeed: string, serverSeed: string, nonce: number): number {
    const combined = `${userSeed}:${serverSeed}:${nonce}`;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    const hexNumber = parseInt(hash.substring(0, 8), 16);
    return hexNumber / 0xffffffff;
  }

  async function determinePrize(randomNumber: number, isCrypto: boolean = false): Promise<number | null> {
    if (isCrypto) return determineCryptoPrize(randomNumber);
    const stock = await fetchCurrentStock();
    let cumulativeProbability = 0;
    for (const prize of PRIZE_TABLE) {
      cumulativeProbability += prize.probability;
      if (randomNumber < cumulativeProbability) {
        if (prize.stockRequired && !checkStock(prize.id, stock)) continue;
        return prize.id;
      }
    }

    const fallbackPrize = PRIZE_TABLE.find(p => p.type === "sol" && !p.stockRequired);
    if (fallbackPrize) return fallbackPrize.id;

    return 1;
  }

  function determineCryptoPrize(randomNumber: number): number {
    let cumulativeProbability = 0;
    for (const prize of CRYPTO_PRIZE_TABLE) {
      cumulativeProbability += prize.probability;
      if (randomNumber < cumulativeProbability) return prize.id;
    }
    return CRYPTO_PRIZE_TABLE[0].id;
  }

  async function deliverPrize(userAddress: PublicKey, prizeId: number) {
    try {
      if (prizeId >= 100 && prizeId <= 111) {
        const cryptoPrize = CRYPTO_PRIZE_TABLE.find(p => p.id === prizeId);
        if (!cryptoPrize) {
          console.error(`❌ Prêmio crypto não encontrado: ${prizeId}`);
          return;
        }
        const solAmount = cryptoPrize.amount * LAMPORTS_PER_SOL;
        SystemProgram.transfer({
          fromPubkey: new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET!),
          toPubkey: userAddress,
          lamports: solAmount,
        });
        return;
      }
      const prize = PRIZE_TABLE.find(p => p.id === prizeId);
      if (!prize) {
        console.error(`❌ Prêmio não encontrado: ${prizeId}`);
        return;
      }
      if (prize.type === "sol") {
        const solAmount = (prize.amount || 0) * LAMPORTS_PER_SOL;
        SystemProgram.transfer({
          fromPubkey: new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET!),
          toPubkey: userAddress,
          lamports: solAmount,
        });
      }
    } catch (error) {
      console.error("❌ Erro ao entregar prêmio:", error);
    }
  }

  async function onMint(isCrypto: boolean) {
    try {
      if (!publicKey) throw new Error("Wallet not connected");
      setIsLoading(true);
      setModalOpen(true);
      setModalStatus("initializing");
      setErrorMessage("");
      setTransactionHash("");
      setCurrentPrize(null);
      setCurrentBoxType(isCrypto ? t("box.cryptos") : t("box.superPrizes"));
      setCurrentAmount("45");

      const provider = await initializeProvider();
      await checkSufficientBalance(provider);

      setModalStatus("processing");
      const {
        program,
        nftMintAddress,
        nftMetadataAddress,
        nftTokenAccount,
        payerPaymentTokenAccount,
        nonce,
        nftCounter,
        collectionMetadata
      } = await prepareNftAccounts(provider);
      await sendSolFeeTransaction(provider, isCrypto);
      const { tokenAmount, timestamp, arraySignature, backendPubkey } =
        await fetchBackendData(provider, isCrypto, payerPaymentTokenAccount);
      setModalStatus("determining");
      const { prizeId, wonPrize, randomData } =
        await determineUserPrize(provider, isCrypto, nonce, timestamp);
      setCurrentPrize(wonPrize);
      setModalStatus("delivering");
      let txSig;
      let onlyBurn = isCrypto;
      if (prizeId >= 100 && prizeId <= 111) onlyBurn = true;
      const prize = PRIZE_TABLE.find(p => p.id === prizeId);
      if (prize?.type === "sol") onlyBurn = true;

      if (onlyBurn) {
        txSig = await sendCryptoTransaction(provider, program, tokenAmount, timestamp, arraySignature, backendPubkey);
      } else {
        txSig = await sendMainTransaction(provider, program, tokenAmount, timestamp, arraySignature, backendPubkey, nftCounter, nftMintAddress, nftMetadataAddress, nftTokenAccount, payerPaymentTokenAccount, collectionMetadata);
      }
      
      setTransactionHash(txSig);
      await deliverPrize(provider.wallet.publicKey, prizeId);
      setModalStatus("saving");
      await savePurchaseData(
        provider,
        nftMintAddress,
        nftMetadataAddress,
        tokenAmount,
        txSig,
        prizeId,
        wonPrize,
        randomData
      );

      await refreshBalance();
      setModalStatus("success");

      const result = {
        tx: txSig,
        nftMint: nftMintAddress.toString(),
        nftMetadata: nftMetadataAddress.toString(),
        prize: wonPrize,
        isCrypto: prizeId >= 100 && prizeId <= 111,
        prizeId,
        provablyFair: randomData,
      };
      return result;
    } catch (error: any) {
      handleMintError(error);
      setModalStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function initializeProvider() {
    const wallet: any = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };
    return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  }

  async function checkSufficientBalance(provider: AnchorProvider) {
    try {
      const balance = await connection.getBalance(provider.wallet.publicKey);
      const txFeeInSol = 0.000005;
      const requiredSol = txFeeInSol + (txFeeInSol / solanaPrice);
      const requiredLamports = Math.ceil(requiredSol * LAMPORTS_PER_SOL);

      console.log(`Saldo: ${balance / LAMPORTS_PER_SOL} SOL, Necessário: ${requiredSol.toFixed(6)} SOL`);

      if (balance < requiredLamports) {
        toast.error(`Saldo insuficiente. Você precisa de pelo menos ${requiredSol.toFixed(4)} SOL`);
        throw new Error("Saldo em SOL insuficiente");
      }
    } catch (error) {
      console.error("Erro ao verificar saldo:", error);
      throw error;
    }
  }

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
      nftCounterData = await (program.account as any).nftCounter.fetch(nftCounter);
      nonce = nftCounterData.count ? nftCounterData.count.toNumber() : 0;
    } catch (error) {
      console.log("NFT Counter account not found or not initialized, using nonce 0");
      nonce = 0;
    }

    const collectionMetadata = new PublicKey(COLLECTION_METADATA);
    let countBytes;

    if (nftCounterData && nftCounterData.count) {
      countBytes = nftCounterData.count.toArrayLike(Buffer, 'le', 8);
    } else {
      countBytes = Buffer.alloc(8);
      countBytes.writeBigUInt64LE(BigInt(0), 0);
    }

    const [nftMintAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("nft_mint"),
        collectionMetadata.toBuffer(),
        countBytes
      ],
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
      collectionMetadata
    };
  }

  async function sendSolFeeTransaction(provider: AnchorProvider, isCrypto: boolean) {
    try {
      const FEE_USD = isCrypto ? 1.65 : 7.65;
      const FEE_SOL = FEE_USD / solanaPrice;
      const lamports = Math.ceil(FEE_SOL * LAMPORTS_PER_SOL);
      const solFeeTransaction = new Transaction();
      const solFeeTransfer = SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET!),
        lamports,
      });
      solFeeTransaction.add(solFeeTransfer);
      solFeeTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      solFeeTransaction.feePayer = provider.wallet.publicKey;
      const signedSolFeeTransaction = await provider.wallet.signTransaction(solFeeTransaction);
      const solFeeTxSig = await connection.sendRawTransaction(signedSolFeeTransaction.serialize());
      return solFeeTxSig;
    } catch (error) {
      console.error("Erro ao enviar taxa em SOL:", error);
      throw new Error("Falha ao processar pagamento da taxa em SOL");
    }
  }

  async function fetchBackendData(
    provider: AnchorProvider,
    isCrypto: boolean,
    payerPaymentTokenAccount: PublicKey
  ) {
    const { data } = await axios.post('/api/purchase', {
      boxType: isCrypto ? 1 : 2,
      wallet: provider.wallet.publicKey.toString()
    });
    const { tokenAmount, timestamp, signature, backendPubkey } = data;
    const arraySignature = new Uint8Array(signature);
    const tokenAccount = await connection.getTokenAccountBalance(payerPaymentTokenAccount);
    if (tokenAccount.value.uiAmount && tokenAccount.value.amount < tokenAmount) {
      toast.error("Saldo insuficiente de tokens ADR");
      throw new Error("Saldo insuficiente de tokens ADR");
    }
    return { tokenAmount, timestamp, arraySignature, backendPubkey };
  }

  async function determineUserPrize(
    provider: AnchorProvider,
    isCrypto: boolean,
    nonce: number,
    timestamp: number
  ) {
    const userSeed = provider.wallet.publicKey.toString();
    const serverSeed = `${timestamp}_${Math.random()}`;
    const randomNumber = generateProvablyFairNumber(userSeed, serverSeed, nonce);
    const prizeId = await determinePrize(randomNumber, isCrypto);
    if (!prizeId) throw new Error("Erro ao determinar prêmio");
    let wonPrize;
    if (prizeId >= 100 && prizeId <= 111) {
      wonPrize = CRYPTO_PRIZE_TABLE.find(p => p.id === prizeId);
    } else {
      wonPrize = PRIZE_TABLE.find(p => p.id === prizeId);
    }
    const randomData = {
      randomNumber,
      userSeed,
      serverSeed,
      nonce
    };

    return { prizeId, wonPrize, randomData };
  }

  async function sendMainTransaction(
    provider: AnchorProvider,
    program: Program,
    tokenAmount: number,
    timestamp: number,
    arraySignature: Uint8Array,
    backendPubkey: string,
    nftCounter: PublicKey,
    nftMint: PublicKey,
    nftMetadata: PublicKey,
    nftTokenAccount: PublicKey,
    payerPaymentTokenAccount: PublicKey,
    collectionMetadata: PublicKey,
  ) {
    const sysvarInstructions = new PublicKey('Sysvar1nstructions1111111111111111111111111');
    const backendAuthority = new PublicKey(backendPubkey);
    const config = new PublicKey(CONFIG_ACCOUNT);
    const [metaplexMetadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey(METAPLEX_PROGRAM_ID).toBuffer(),
        nftMint.toBuffer(),
      ],
      new PublicKey(METAPLEX_PROGRAM_ID)
    );

    console.log("Metaplex metadata PDA:", metaplexMetadata.toString())

    const method = program.methods
      .mintNftWithPayment(
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        `${COLLECTION_URI}/iphone.json`,
        new anchor.BN(tokenAmount),
        new anchor.BN(timestamp),
        arraySignature
      )
      .accounts({
        payer: provider.wallet.publicKey,
        backendAuthority,
        nftCounter,
        nftMint,
        nftMetadata,
        metaplexMetadata,
        nftTokenAccount,
        collectionMetadata,
        paymentTokenMint: new PublicKey(PAYMENT_TOKEN_MINT),
        payerPaymentTokenAccount,
        config,
        sysvarInstructions,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: new PublicKey(TOKEN_METADATA_PROGRAM)
      });

    const tx = await method.transaction();

    const message = `{"wallet":"${provider.wallet.publicKey.toString()}","amount":${tokenAmount},"timestamp":${timestamp}}`;

    tx.instructions.unshift(
      Ed25519Program.createInstructionWithPublicKey({
        publicKey: new PublicKey(backendPubkey).toBytes(),
        message: Buffer.from(message),
        signature: arraySignature,
      })
    );
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.feePayer = provider.wallet.publicKey;
    const signedTx = await provider.wallet.signTransaction(tx);
    return await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: true,
    });
  }

  async function sendCryptoTransaction(
    provider: AnchorProvider,
    program: Program,
    tokenAmount: number,
    timestamp: number,
    arraySignature: Uint8Array,
    backendPubkey: string,
  ) {
    const sysvarInstructions = new PublicKey('Sysvar1nstructions1111111111111111111111111');
    const tx = new Transaction();
    const message = `{"wallet":"${provider.wallet.publicKey.toString()}","amount":${tokenAmount},"timestamp":${timestamp}}`;

    tx.add(
      Ed25519Program.createInstructionWithPublicKey({
        publicKey: new PublicKey(backendPubkey).toBytes(),
        message: Buffer.from(message),
        signature: arraySignature,
      })
    );

    const backendAuthority = new PublicKey(backendPubkey);
    const config = new PublicKey(CONFIG_ACCOUNT);
    const description = `Solana Box ${message} USD`;

    try {
      const ix = await program.methods
        .burnTokensWithSignature(
          new anchor.BN(tokenAmount),
          new anchor.BN(timestamp),
          arraySignature,
          description
        )
        .accounts({
          payer: provider.wallet.publicKey,
          paymentTokenMint: new PublicKey(PAYMENT_TOKEN_MINT),
          payerPaymentTokenAccount: await getAssociatedTokenAddress(
            new PublicKey(PAYMENT_TOKEN_MINT),
            provider.wallet.publicKey,
            false
          ),
          backendAuthority,
          config,
          sysvarInstructions,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        }).instruction();

      tx.add(ix);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = provider.wallet.publicKey;

      try {
        const simulateResult = await connection.simulateTransaction(tx);
        if (simulateResult.value.logs) {
          simulateResult.value.logs.forEach((log, i) => {
            console.log(`${i + 1}: ${log}`);
          });
        }

        if (simulateResult.value.err) {
          console.error("⚠️ Aviso: A simulação teve erro:", simulateResult.value.err);
        }
      } catch (simError) {
        console.error("❌ Erro ao simular transação:", simError);
      }
      const signedTx = await provider.wallet.signTransaction(tx);
      return await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
      });
    } catch (error: any) {
      console.error("Erro detalhado na transação crypto:", error);
      if (error.logs) {
        console.error("Logs da transação:", error.logs);
      }

      throw error;
    }
  }

  async function savePurchaseData(
    provider: AnchorProvider,
    nftMintAddress: PublicKey,
    nftMetadataAddress: PublicKey,
    tokenAmount: number,
    txSig: string,
    prizeId: number,
    wonPrize: any,
    randomData: any
  ) {
    try {
      await axios.post('/api/save-purchase', {
        wallet: provider.wallet.publicKey.toString(),
        nftMint: nftMintAddress.toString(),
        nftMetadata: nftMetadataAddress.toString(),
        tokenAmount,
        transactionSignature: txSig,
        prizeId,
        prizeName: wonPrize?.name,
        randomNumber: randomData.randomNumber,
        userSeed: randomData.userSeed,
        serverSeed: randomData.serverSeed,
        nonce: randomData.nonce,
        timestamp: new Date().toISOString(),
      });
    } catch (saveError) {
      console.error("Erro ao salvar no banco:", saveError);
    }
  }

  function handleMintError(error: any) {
    console.error("Erro ao processar transação:", error);
    if (error.message) console.error("Error message:", error.message);
    if (error.stack) console.error("Error stack:", error.stack);
    let errorMsg = "Erro ao abrir caixa surpresa. Tente novamente.";
    if (error.message?.includes("_bn")) {
      errorMsg = "Erro na configuração da conta NFT. Tente novamente.";
    } else if (error.message?.includes("insufficient")) {
      errorMsg = "Saldo insuficiente";
    } else if (error.message?.includes("User rejected")) {
      errorMsg = "Transação cancelada pelo usuário";
    }
    toast.error(errorMsg);
    setErrorMessage(errorMsg);
  }

  useEffect(() => {
    refreshBalance();
    fetchCurrentStock();
  }, [connected, publicKey]);

  return {
    onMint,
    balance,
    isLoading,
    connected,
    currentStock,
    modalOpen,
    modalStatus,
    errorMessage,
    transactionHash,
    currentPrize,
    currentBoxType,
    currentAmount,
    closeModal
  };
}
