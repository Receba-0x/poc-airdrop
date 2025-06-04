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
  PAYMENT_TOKEN_MINT,
  PROGRAM_ID,
} from "@/constants";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

// Constantes do sistema de caixa surpresa
const BOX_PRICE_USD = 45.00; // Preço em tokens ADR que serão queimados
const SOL_FEE = 0.046364; // Fee em SOL (0,046364 SOL = $7,65)

// Tabela de prêmios com probabilidades conforme especificação
const PRIZE_TABLE = [
  { id: 1, name: "0.01 SOL", type: "sol", amount: 0.01, probability: 0.208636, stockRequired: false },
  { id: 2, name: "0.05 SOL", type: "sol", amount: 0.05, probability: 0.125182, stockRequired: false },
  { id: 3, name: "0.1 SOL", type: "sol", amount: 0.1, probability: 0.062591, stockRequired: false },
  { id: 4, name: "0.3 SOL", type: "sol", amount: 0.3, probability: 0.020864, stockRequired: false },
  { id: 5, name: "NFT Comum", type: "nft", metadata: "nft-comum", probability: 0.222545, stockRequired: false },
  { id: 6, name: "NFT Rara", type: "nft", metadata: "nft-rara", probability: 0.041727, stockRequired: false },
  { id: 7, name: "NFT Lendária", type: "nft", metadata: "nft-lendaria", probability: 0.013909, stockRequired: false },
  { id: 8, name: "Camisas de time", type: "physical", metadata: "t-shirt", probability: 0.150000, stockRequired: true, stock: 90 },
  { id: 9, name: "Bolas oficiais", type: "physical", metadata: "mikasa", probability: 0.080000, stockRequired: true, stock: 40 },
  { id: 10, name: "Chuteiras", type: "physical", metadata: "chuteira", probability: 0.060000, stockRequired: true, stock: 30 },
  { id: 11, name: "MacBook M3", type: "physical", metadata: "macbook", probability: 0.003636, stockRequired: true, stock: 1 },
  { id: 12, name: "iPhone 16 Pro Max", type: "physical", metadata: "iphone", probability: 0.007273, stockRequired: true, stock: 2 },
  { id: 13, name: "Ticket Dourado", type: "special", metadata: "ticket-dourado", probability: 0.003636, stockRequired: true, stock: 10 },
];

let globalStock: { [key: number]: number } = {
  8: 90,   // Camisas
  9: 40,   // Bolas
  10: 30,  // Chuteiras
  11: 1,   // MacBook
  12: 2,   // iPhone
  13: 10   // Ticket Dourado
};

export function usePurchase() {
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Sistema provably fair para determinação de prêmio
  function generateProvablyFairNumber(userSeed: string, serverSeed: string, nonce: number): number {
    const crypto = require('crypto');
    const combined = `${userSeed}:${serverSeed}:${nonce}`;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    
    // Converter hash para número entre 0 e 1
    const hexNumber = parseInt(hash.substring(0, 8), 16);
    return hexNumber / 0xffffffff;
  }

  // Verificar estoque para prêmios físicos
  function checkStock(prizeId: number): boolean {
    const prize = PRIZE_TABLE.find(p => p.id === prizeId);
    if (!prize?.stockRequired) return true;
    
    return (globalStock[prizeId] || 0) > 0;
  }

  function determinePrize(randomNumber: number): number | null {
    let cumulativeProbability = 0;
    for (const prize of PRIZE_TABLE) {
      cumulativeProbability += prize.probability;
      if (randomNumber < cumulativeProbability) {
        if (prize.stockRequired && !checkStock(prize.id)) {
          continue;
        }
        
        if (prize.stockRequired && globalStock[prize.id]) {
          globalStock[prize.id]--;
        }
        return prize.id;
      }
    }
    
    return null;
  }

  function handleJackpot(userAddress: string, prizeId: number) {
    if (prizeId === 11 || prizeId === 13) { // MacBook ou Ticket Dourado
      console.log(`🎉 JACKPOT! User ${userAddress} won prize ${prizeId}`);
      
      // Em produção, implementar:
      // - Registro em log especial
      // - Notificação para administradores
      // - Processo de verificação KYC
      // - Sistema de voucher para prêmios físicos
    }
  }

  // Entregar prêmio conforme tipo
  async function deliverPrize(userAddress: PublicKey, prizeId: number) {
    const prize = PRIZE_TABLE.find(p => p.id === prizeId);
    if (!prize) throw new Error("Prêmio não encontrado");

    switch (prize.type) {
      case "sol":
        // Enviar SOL para o usuário
        const solAmount = (prize.amount || 0) * LAMPORTS_PER_SOL;
        const solTransfer = SystemProgram.transfer({
          fromPubkey: new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET!),
          toPubkey: userAddress,
          lamports: solAmount,
        });
        
        console.log(`Enviando ${prize.amount || 0} SOL para ${userAddress.toString()}`);
        // Em produção, executar a transferência de SOL
        break;

      case "nft":
        // Mintar NFT específico
        console.log(`Mintando NFT ${prize.metadata} para ${userAddress.toString()}`);
        // Implementar mint de NFT com metadata específica
        break;

      case "physical":
      case "special":
        // Gerar voucher para prêmio físico
        console.log(`Gerando voucher para ${prize.name} - ${userAddress.toString()}`);
        // Implementar sistema de voucher
        handleJackpot(userAddress.toString(), prizeId);
        break;
    }
  }

  async function onMint(amount: number) {
    try {
      if (!publicKey) throw new Error("Wallet not connected");
      setIsLoading(true);

      const wallet: any = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });

      // Verificar saldo em SOL para taxa
      const balance = await connection.getBalance(provider.wallet.publicKey);
      const requiredSol = (SOL_FEE + 0.01) * LAMPORTS_PER_SOL; // Fee + taxa de transação
      
      if (balance < requiredSol) {
        toast.error(`Saldo insuficiente. Você precisa de pelo menos ${SOL_FEE + 0.01} SOL`);
        throw new Error("Saldo em SOL insuficiente");
      }

      const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
      const program = new Program(idl, provider);

      const [nftCounter] = PublicKey.findProgramAddressSync(
        [Buffer.from("nft_counter")],
        program.programId
      );
      const nftCounterData = await (program.account as any).nftCounter.fetch(nftCounter);

      const collectionMetadata = new PublicKey(COLLECTION_METADATA);
      const countBytes = nftCounterData.count.toArrayLike(Buffer, 'le', 8);
      
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

      const tokenAccount = await connection.getTokenAccountBalance(payerPaymentTokenAccount);
      const nftTokenAccount = await getAssociatedTokenAddress(
        nftMintAddress,
        provider.wallet.publicKey
      );

      // 1. COBRAR FEE EM SOL (conforme especificação)
      const solFeeTransaction = new Transaction();
      const solFeeTransfer = SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET!),
        lamports: SOL_FEE * LAMPORTS_PER_SOL,
      });
      solFeeTransaction.add(solFeeTransfer);
      solFeeTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      solFeeTransaction.feePayer = provider.wallet.publicKey;

      const signedSolFeeTransaction = await provider.wallet.signTransaction(solFeeTransaction);
      const solFeeTxSig = await connection.sendRawTransaction(signedSolFeeTransaction.serialize());
      console.log("SOL fee transaction:", solFeeTxSig);

      // 2. COBRAR TOKENS ADR (burn)
      const { data } = await axios.post('/api/purchase', {
        itemId: 1,
        wallet: provider.wallet.publicKey.toString(),
        amount,
      });

      const { tokenAmount, timestamp, signature, backendPubkey } = data;
      const arraySignature = new Uint8Array(signature);

      if (tokenAccount.value.uiAmount && tokenAccount.value.amount < tokenAmount) {
        toast.error("Saldo insuficiente de tokens ADR");
        throw new Error("Saldo insuficiente de tokens ADR");
      }

      // 3. SISTEMA PROVABLY FAIR PARA DETERMINAR PRÊMIO
      const userSeed = provider.wallet.publicKey.toString();
      const serverSeed = `${timestamp}_${Math.random()}`;
      const nonce = nftCounterData.count.toNumber();
      
      const randomNumber = generateProvablyFairNumber(userSeed, serverSeed, nonce);
      const prizeId = determinePrize(randomNumber);
      
      if (!prizeId) {
        throw new Error("Erro ao determinar prêmio");
      }

      const wonPrize = PRIZE_TABLE.find(p => p.id === prizeId);
      console.log(`🎁 Prêmio ganho: ${wonPrize?.name} (ID: ${prizeId})`);
      console.log(`🎲 Random: ${randomNumber}, Seed: ${userSeed}:${serverSeed}:${nonce}`);

      // 4. EXECUTAR MINT DE NFT (com burn de tokens ADR)
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

      const ix = await program.methods
        .mintNftWithPayment(
          COLLECTION_NAME,
          COLLECTION_SYMBOL,
          COLLECTION_URI,
          new anchor.BN(tokenAmount),
          new anchor.BN(timestamp),
          arraySignature
        )
        .accounts({
          payer: provider.wallet.publicKey,
          backendAuthority,
          nftMint: nftMintAddress,
          nftMetadata: nftMetadataAddress,
          nftTokenAccount,
          collectionMetadata,
          paymentTokenMint: new PublicKey(PAYMENT_TOKEN_MINT),
          payerPaymentTokenAccount,
          config,
          tokenProgram: TOKEN_PROGRAM_ID,
          sysvarInstructions,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        }).instruction();

      tx.add(ix);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = provider.wallet.publicKey;

      const signedTx = await provider.wallet.signTransaction(tx);
      const txSig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
      });

      // 5. ENTREGAR PRÊMIO CONFORME TIPO
      await deliverPrize(provider.wallet.publicKey, prizeId);

      // 6. SALVAR NO BANCO DE DADOS
      try {
        await axios.post('/api/save-purchase', {
          wallet: provider.wallet.publicKey.toString(),
          nftMint: nftMintAddress.toString(),
          nftMetadata: nftMetadataAddress.toString(),
          amount,
          tokenAmount,
          transactionSignature: txSig,
          prizeId,
          prizeName: wonPrize?.name,
          randomNumber,
          userSeed,
          serverSeed,
          nonce,
          timestamp: new Date().toISOString(),
        });
      } catch (saveError) {
        console.error("Erro ao salvar no banco:", saveError);
      }

      const result = {
        tx: txSig,
        solFeeTx: solFeeTxSig,
        nftMint: nftMintAddress.toString(),
        nftMetadata: nftMetadataAddress.toString(),
        prize: wonPrize,
        provablyFair: {
          randomNumber,
          userSeed,
          serverSeed,
          nonce
        }
      };

      await getBalance();
      toast.success(`🎁 Você ganhou: ${wonPrize?.name}!`);
      return result;

    } catch (error) {
      console.error("Erro ao processar transação:", error);
      toast.error("Erro ao abrir caixa surpresa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const getBalance = async () => {
    if (!connected || !publicKey) return;
    setIsLoading(true);
    try {
      const tokenMint = new PublicKey(PAYMENT_TOKEN_MINT);

      getAssociatedTokenAddress(tokenMint, publicKey)
        .then((tokenAccount) => {
          return connection
            .getTokenAccountBalance(tokenAccount)
            .then((tokenAccountInfo) => {
              setBalance(
                parseFloat(tokenAccountInfo.value.uiAmount?.toString() || "0")
              );
            })
            .catch((err) => {
              console.log("Token account may not exist yet:", err);
              setBalance(0);
            });
        })
        .catch((error) => {
          console.error("Error fetching token balance:", error);
          setBalance(0);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error("Invalid token mint address:", error);
      setIsLoading(false);
      setBalance(0);
    }
  };

  useEffect(() => {
    getBalance();
  }, [connected, publicKey]);

  return { onMint, balance, isLoading, connected };
}
