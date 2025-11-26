import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import * as fs from "fs";
import * as path from "path";

// Configuração - usar devnet para testes
const RPC_URL = "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

async function createTestToken() {
  try {
    console.log("🚀 Criando token de teste no Devnet...\n");

    // 1. Gerar ou usar uma wallet existente
    let payerKeypair: Keypair;
    let walletPath = path.join(process.cwd(), "test-wallet.json");

    if (fs.existsSync(walletPath)) {
      console.log("📁 Usando wallet existente...");
      const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
      payerKeypair = Keypair.fromSecretKey(Uint8Array.from(walletData));
    } else {
      console.log("🔑 Gerando nova wallet...");
      payerKeypair = Keypair.generate();
      fs.writeFileSync(
        walletPath,
        JSON.stringify(Array.from(payerKeypair.secretKey))
      );
      console.log("✅ Wallet salva em: test-wallet.json\n");
    }

    const payerPublicKey = payerKeypair.publicKey;
    console.log(`💰 Wallet do Sistema: ${payerPublicKey.toString()}`);

    // 2. Verificar saldo SOL (precisa para fees)
    const balance = await connection.getBalance(payerPublicKey);
    const solBalance = balance / 1e9;

    console.log(`💎 Saldo SOL: ${solBalance} SOL`);

    if (solBalance < 0.1) {
      console.log("\n⚠️  Saldo SOL insuficiente! Faça um airdrop:");
      console.log(
        `   solana airdrop 2 ${payerPublicKey.toString()} --url devnet\n`
      );
      console.log("Ou acesse: https://faucet.solana.com/");
      console.log("Cole o endereço acima e solicite SOL de teste.\n");
      return;
    }

    // 3. Criar o token mint
    console.log("\n🎫 Criando token SPL...");
    const mintKeypair = Keypair.generate();
    const mintPublicKey = await createMint(
      connection,
      payerKeypair,
      payerPublicKey, // mint authority
      null, // freeze authority (null = não pode congelar)
      6, // decimais
      mintKeypair,
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log(`✅ Token criado!`);
    console.log(`📍 Token Mint Address: ${mintPublicKey.toString()}\n`);

    // 4. Criar conta de token associada
    console.log("💼 Criando conta de token...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payerKeypair,
      mintPublicKey,
      payerPublicKey
    );

    console.log(
      `✅ Conta de token criada: ${tokenAccount.address.toString()}\n`
    );

    // 5. Mint tokens (criar 1.000.000 tokens para testes)
    const amountToMint = 1_000_000; // 1 milhão de tokens
    console.log(`🪙 Mintando ${amountToMint.toLocaleString()} tokens...`);

    const signature = await mintTo(
      connection,
      payerKeypair,
      mintPublicKey,
      tokenAccount.address,
      payerPublicKey, // mint authority
      amountToMint * 10 ** 6, // multiplicar por decimais (6)
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log(`✅ Tokens mintados com sucesso!`);
    console.log(`📝 Transaction Signature: ${signature}\n`);

    // 6. Salvar informações em arquivo
    const config = {
      tokenMint: mintPublicKey.toString(),
      systemWallet: payerPublicKey.toString(),
      systemWalletPrivateKey: Array.from(payerKeypair.secretKey),
      systemWalletPrivateKeyBase58: bs58.encode(payerKeypair.secretKey),
      tokenAccount: tokenAccount.address.toString(),
      rpcUrl: RPC_URL,
      decimals: 6,
      totalSupply: amountToMint,
      network: "devnet",
    };

    const configPath = path.join(process.cwd(), "token-config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log("📋 Configuração salva em: token-config.json\n");

    // 7. Mostrar informações para .env.local
    console.log("=".repeat(60));
    console.log("📝 Adicione ao seu .env.local:");
    console.log("=".repeat(60));
    console.log(`SOLANA_RPC_URL=${RPC_URL}`);
    console.log(`TOKEN_MINT_ADDRESS=${mintPublicKey.toString()}`);
    console.log(
      `SYSTEM_WALLET_PRIVATE_KEY=${JSON.stringify(Array.from(payerKeypair.secretKey))}`
    );
    console.log("=".repeat(60));
    console.log("\n✅ Token criado com sucesso!");
    console.log(`\n🔗 Ver no Explorer: https://explorer.solana.com/address/${mintPublicKey.toString()}?cluster=devnet`);
  } catch (error: any) {
    console.error("\n❌ Erro ao criar token:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
    process.exit(1);
  }
}

// Executar
createTestToken();

