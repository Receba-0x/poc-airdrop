"use client";
import * as anchor from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SystemProgram, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { CONFIG_ACCOUNT, PAYMENT_TOKEN_MINT, PROGRAM_ID } from "@/constants";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export function useUnstaking() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const closeModal = () => {
    setModalOpen(false);
    if (modalStatus === "success") {
      // Refresh data after successful unstake
      setTimeout(() => {
        getCurrentStake();
      }, 1000);
    }
  };

  const onUnstake = async () => {
    try {
      if (!publicKey) throw new Error("Wallet not connected");
      setIsLoading(true);
      setModalOpen(true);
      setModalStatus("loading");
      setErrorMessage("");
      setTransactionHash("");

      const wallet: any = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };

      if (!signTransaction || !signAllTransactions) {
        throw new Error("Wallet missing required methods");
      }

      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
      const program = new Program(idl, provider);

      const tokenMint = new PublicKey(PAYMENT_TOKEN_MINT);
      const [stakeAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('stake_account'),
          publicKey.toBuffer(),
          tokenMint.toBuffer(),
        ],
        program.programId
      );

      const [stakeAuthority] = await PublicKey.findProgramAddress(
        [Buffer.from("stake_authority")],
        program.programId
      );

      const stakerTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );

      const [rewardReserveAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("reward_reserve"), tokenMint.toBuffer()],
        program.programId
      );


      const stakeAccountData = await (program.account as any).stakeAccount.fetch(stakeAccount);
      console.log("Stake account data:", stakeAccountData);

      const now = Math.floor(Date.now() / 1000);
      if (now < stakeAccountData.unlockTime.toNumber()) {
        const secondsLeft = stakeAccountData.unlockTime.toNumber() - now;
        const errorMsg = `Você só pode des-stake em ${secondsLeft} segundos`;
        console.log(errorMsg);
        setModalStatus("error");
        setErrorMessage(errorMsg);
        throw new Error(errorMsg);
      }

      const tx = await program.methods
        .unstakeTokens()
        .accounts({
          staker: publicKey,
          tokenMint,
          stakerTokenAccount,
          stakeAccount,
          rewardReserveAccount,
          stakeAuthority,
          config: new PublicKey(CONFIG_ACCOUNT),
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc({
          skipPreflight: true,
          commitment: "confirmed",
          maxRetries: 5,
        });
      
      setTransactionHash(tx);
      setModalStatus("success");
      
      console.log("Unstaking successful!", tx);
    } catch (error) {
      console.error("Unstaking failed:", error);
      setModalStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStake = async () => {
    if (!publicKey) return;

    try {
      const wallet: any = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };
  
      const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
      const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
      const program = new Program(idl, provider);
  
      const [stakeAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('stake_account'),
          publicKey.toBuffer(),
          new PublicKey(PAYMENT_TOKEN_MINT).toBuffer(),
        ],
        program.programId
      );
  
      try {
        const stakeInfo = await (program.account as any).stakeAccount.fetch(stakeAccount);
    
        console.log("Stake Info:", stakeInfo);
        const now = Date.now() / 1000;
        const secondsLeft = stakeInfo.unlockTime - now;
    
        const amount = stakeInfo.amount instanceof BN
          ? Number(stakeInfo.amount.toString()) / 1e9
          : Number(stakeInfo.amount) / 1e9;
    
        const startTime = stakeInfo.startTime instanceof BN
          ? new Date(Number(stakeInfo.startTime.toString()) * 1000)
          : new Date(Number(stakeInfo.startTime) * 1000);
    
        const unlockTime = stakeInfo.unlockTime instanceof BN
          ? new Date(Number(stakeInfo.unlockTime.toString()) * 1000)
          : new Date(Number(stakeInfo.unlockTime) * 1000);
    
        let period = "";
        if (typeof stakeInfo.period === "object") {
          period = Object.keys(stakeInfo.period)[0];
        } else {
          period = stakeInfo.period;
        }
    
        const claimed = stakeInfo.claimed;
        setStakeInfo({
          amount,
          startTime,
          unlockTime,
          period,
          claimed,
          secondsLeft
        });
      } catch (error) {
        // No stake found
        setStakeInfo(null);
      }
    } catch (error) {
      console.error("Error fetching stake info:", error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      getCurrentStake();
    } else {
      setStakeInfo(null);
    }
  }, [publicKey]);

  return {
    isLoading,
    onUnstake,
    stakeInfo,
    // Modal props
    modalOpen,
    modalStatus,
    errorMessage,
    transactionHash,
    closeModal,
  };
} 