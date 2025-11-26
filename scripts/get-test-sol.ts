import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import bs58 from "bs58";

const RPC_URL = "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

async function getTestSol() {
  try {
    let walletPath = path.join(process.cwd(), "test-wallet.json");
    let keypair: Keypair;

    if (fs.existsSync(walletPath)) {
      const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
      keypair = Keypair.fromSecretKey(Uint8Array.from(walletData));
    } else {
      keypair = Keypair.generate();
      fs.writeFileSync(
        walletPath,
        JSON.stringify(Array.from(keypair.secretKey))
      );
    }

    const publicKey = keypair.publicKey;
    console.log(`💰 Wallet: ${publicKey.toString()}\n`);

    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;

    console.log(`💎 Saldo atual: ${solBalance} SOL\n`);

    if (solBalance < 1) {
      console.log("🪂 Solicitando airdrop de SOL...");
      const signature = await connection.requestAirdrop(
        publicKey,
        2 * LAMPORTS_PER_SOL
      );

      console.log(`📝 Transaction: ${signature}`);
      console.log("⏳ Aguardando confirmação...");

      await connection.confirmTransaction(signature, "confirmed");

      const newBalance = await connection.getBalance(publicKey);
      console.log(`✅ Novo saldo: ${newBalance / LAMPORTS_PER_SOL} SOL\n`);
    } else {
      console.log("✅ Saldo suficiente!\n");
    }
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

getTestSol();

