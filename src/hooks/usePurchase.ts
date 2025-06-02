"use client";
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { idl } from "@/constants/idl";
import {
  COLLECTION_NAME,
  COLLECTION_SYMBOL,
  COLLECTION_URI,
  collectionMetadataKeypair,
  collectionMintKeypair,
  configAccountKeypair,
  PAYMENT_TOKEN_MINT,
} from "@/constants";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { createKeypairFromPrivateKey } from "@/libs";

export function usePurchase() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const connectionUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

  const COLLECTION_MINT_KEYPAIR = createKeypairFromPrivateKey(collectionMintKeypair);
  const COLLECTION_METADATA_KEYPAIR = createKeypairFromPrivateKey(collectionMetadataKeypair);
  const CONFIG_ACCOUNT_KEYPAIR = createKeypairFromPrivateKey(configAccountKeypair);

  async function deriveNftMintAddress(
    collectionMint: PublicKey,
    nftCounter: any,
    program: Program<any>
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddressSync(
      [Buffer.from("nft_mint"), collectionMint.toBuffer(), Buffer.from(nftCounter.count.toString())],
      program.programId
    );
  }

  async function deriveNftMetadataAddress(
    nftMint: PublicKey,
    program: Program<any>
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddressSync(
      [
        Buffer.from("nft_metadata"),
        nftMint.toBuffer(),
      ],
      program.programId
    );
  }

  async function onMint(amount: number) {
    try {
      const connection = new Connection(connectionUrl, "confirmed");
      const provider = new AnchorProvider(connection, window.solana, {
        commitment: "confirmed",
      });

      const balance = await connection.getBalance(provider.wallet.publicKey);

      if (balance < 0.01 * 1e9) {
        toast.error("Balance insufficient to pay transaction fees");
        throw new Error(
          "Balance insufficient to pay transaction fees. You need at least 0.01 SOL."
        );
      }

      const program = new Program(idl, provider);
      const [nftCounterAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("nft_counter")],
        program.programId
      );
      const nftCounter = await (program.account as any).nftCounter.fetch(nftCounterAddress);

      const [nftMintAddress] = await deriveNftMintAddress(
        COLLECTION_MINT_KEYPAIR.publicKey,
        nftCounter,
        program
      );

      const [nftMetadataAddress] = await deriveNftMetadataAddress(
        nftMintAddress,
        program
      );

      const payerPaymentTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(PAYMENT_TOKEN_MINT),
        provider.wallet.publicKey
      );

      const tokenAccount = await connection.getTokenAccountBalance(payerPaymentTokenAccount);
      const nftTokenAccount = await getAssociatedTokenAddress(
        nftMintAddress,
        provider.wallet.publicKey
      );

      const [stakeAuthority] = await PublicKey.findProgramAddress(
        [Buffer.from("stake_authority")],
        program.programId
      );

      const { data } = await axios.post('/api/purchase', {
        itemId: 1,
        wallet: provider.wallet.publicKey.toString(),
        amount,
      });

      const { tokenAmount, timestamp, signature } = data;

      if (tokenAccount.value.uiAmount && tokenAccount.value.uiAmount < amount) {
        toast.error("Insufficient token balance");
        throw new Error("Insufficient token balance");
      }

      const tx = await program.methods
        .mintNftWithPayment(
          COLLECTION_NAME,
          COLLECTION_SYMBOL,
          COLLECTION_URI,
          tokenAmount,
          timestamp,
          signature
        )
        .accounts({
          payer: provider.wallet.publicKey,
          nftMint: nftMintAddress,
          nftMetadata: nftMetadataAddress,
          nftTokenAccount: nftTokenAccount,
          collectionMetadata: COLLECTION_METADATA_KEYPAIR.publicKey,
          paymentTokenMint: new PublicKey(PAYMENT_TOKEN_MINT),
          payerPaymentTokenAccount: payerPaymentTokenAccount,
          stakeAuthority: stakeAuthority,
          config: CONFIG_ACCOUNT_KEYPAIR.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        }).rpc({
          skipPreflight: true,
          maxRetries: 5,
        });

      await connection.confirmTransaction(tx, "confirmed");

      const events = await program.addEventListener("TokenBurnEvent", (event: any) => {
        if (event.payer.equals(provider.wallet.publicKey)) {
          console.log("Token burn event:", event);
        }
      });

      try {
        await axios.post('/api/save-purchase', {
          wallet: provider.wallet.publicKey.toString(),
          nftMint: nftMintAddress.toString(),
          nftMetadata: nftMetadataAddress.toString(),
          amount,
          tokenAmount,
          transactionSignature: tx,
          timestamp: new Date().toISOString(),
          burnEventData: events
        });
        console.log("Purchase saved to database successfully");
      } catch (saveError) {
        console.error("Error saving purchase to database:", saveError);
        toast.error("Transaction successful but failed to save to database");
      }

      const result = {
        tx,
        nftMint: nftMintAddress.toString(),
        nftMetadata: nftMetadataAddress.toString(),
      };
      await getBalance();
      return result;
    } catch (error) {
      console.error("Error processing transaction:", error);
      throw error;
    }
  }

  const getBalance = async () => {
    if (!connected || !publicKey) return;
    setIsLoading(true);
    const connection = new Connection(connectionUrl, "confirmed");

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
