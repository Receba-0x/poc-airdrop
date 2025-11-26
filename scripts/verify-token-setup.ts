import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

async function verifyTokenSetup() {
  try {
    console.log("🔍 Verificando configuração do token...\n");

    // Ler configuração do token
    const configPath = path.join(process.cwd(), "token-config.json");
    if (!fs.existsSync(configPath)) {
      console.error("❌ Arquivo token-config.json não encontrado!");
      console.log("Execute: pnpm run create-token");
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("📋 Configuração do Token:");
    console.log(`   Token Mint: ${config.tokenMint}`);
    console.log(`   System Wallet: ${config.systemWallet}`);
    console.log(`   Network: ${config.network}`);
    console.log(`   Decimals: ${config.decimals}\n`);

    // Verificar variáveis de ambiente
    console.log("🔐 Variáveis de Ambiente:");
    const tokenMint = process.env.TOKEN_MINT_ADDRESS;
    const rpcUrl = process.env.SOLANA_RPC_URL;
    
    console.log(`   TOKEN_MINT_ADDRESS: ${tokenMint || "❌ NÃO CONFIGURADO"}`);
    console.log(`   SOLANA_RPC_URL: ${rpcUrl || "❌ NÃO CONFIGURADO"}`);
    console.log(`   SYSTEM_WALLET_PRIVATE_KEY: ${process.env.SYSTEM_WALLET_PRIVATE_KEY ? "✅ Configurado" : "❌ NÃO CONFIGURADO"}\n`);

    if (!tokenMint) {
      console.error("❌ TOKEN_MINT_ADDRESS não está configurado no .env.local!");
      console.log("\nAdicione ao .env.local:");
      console.log(`TOKEN_MINT_ADDRESS=${config.tokenMint}`);
      process.exit(1);
    }

    if (tokenMint !== config.tokenMint) {
      console.warn("⚠️  TOKEN_MINT_ADDRESS não corresponde ao token criado!");
      console.log(`   Config: ${config.tokenMint}`);
      console.log(`   Env: ${tokenMint}\n`);
    }

    // Verificar conta de token do sistema
    console.log("💼 Verificando conta de token do sistema...");
    const systemWalletPubkey = new PublicKey(config.systemWallet);
    const tokenMintPubkey = new PublicKey(config.tokenMint);
    
    const systemTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      systemWalletPubkey,
      false,
      TOKEN_PROGRAM_ID
    );

    try {
      const accountInfo = await getAccount(
        connection,
        systemTokenAccount,
        "confirmed",
        TOKEN_PROGRAM_ID
      );

      const balance = Number(accountInfo.amount) / 10 ** config.decimals;
      console.log(`   ✅ Conta encontrada: ${systemTokenAccount.toString()}`);
      console.log(`   💰 Saldo: ${balance.toLocaleString()} tokens`);
      console.log(`   🎫 Mint: ${accountInfo.mint.toString()}`);
      
      if (accountInfo.mint.toString() !== config.tokenMint) {
        console.error(`   ❌ ERRO: Mint não corresponde! Esperado: ${config.tokenMint}`);
      } else {
        console.log(`   ✅ Mint correto!\n`);
      }
    } catch (error) {
      console.error(`   ❌ Conta de token não encontrada: ${systemTokenAccount.toString()}`);
      console.error(`   Erro: ${error}`);
      process.exit(1);
    }

    // Verificar saldo SOL da wallet do sistema
    console.log("💎 Verificando saldo SOL da wallet do sistema...");
    const solBalance = await connection.getBalance(systemWalletPubkey);
    console.log(`   Saldo SOL: ${solBalance / 1e9} SOL\n`);

    console.log("✅ Configuração verificada com sucesso!");
    console.log("\n📝 Certifique-se de que seu .env.local contém:");
    console.log(`SOLANA_RPC_URL=${config.rpcUrl}`);
    console.log(`TOKEN_MINT_ADDRESS=${config.tokenMint}`);
    console.log(`SYSTEM_WALLET_PRIVATE_KEY=${JSON.stringify(config.systemWalletPrivateKey)}`);
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

verifyTokenSetup();

