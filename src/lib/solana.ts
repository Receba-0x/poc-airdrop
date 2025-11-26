import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Configuração da conexão Solana
const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

// Para desenvolvimento/testnet, use:
// "https://api.devnet.solana.com" ou "https://api.testnet.solana.com"

export const connection = new Connection(SOLANA_RPC_URL, "confirmed");

export interface SendTokenParams {
  mintAddress: string; // Endereço do token SPL (mint)
  recipientWallet: string; // Wallet do destinatário (do formulário)
  amount: number; // Quantidade de tokens (em unidades menores, ex: se 1 token = 1_000_000, então 2000 tokens = 2000_000_000)
  decimals?: number; // Decimais do token (padrão: 6 para a maioria dos tokens SPL)
}

export interface SendTokenResult {
  success: boolean;
  signature?: string;
  error?: string;
}

/**
 * Envia tokens SPL de uma wallet do sistema para a wallet do usuário
 * @param params Parâmetros do envio
 * @returns Resultado do envio com signature da transação
 */
export async function sendSPLToken(
  params: SendTokenParams
): Promise<SendTokenResult> {
  try {
    const {
      mintAddress,
      recipientWallet,
      amount,
      decimals = 6, // Padrão de 6 decimais para tokens SPL
    } = params;

    // Validar endereços
    let mintPublicKey: PublicKey;
    let recipientPublicKey: PublicKey;

    try {
      mintPublicKey = new PublicKey(mintAddress);
      recipientPublicKey = new PublicKey(recipientWallet);
    } catch (error) {
      return {
        success: false,
        error: "Endereço de wallet ou token inválido",
      };
    }

    // Obter a chave privada da wallet do sistema
    const systemWalletPrivateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY;
    if (!systemWalletPrivateKey) {
      return {
        success: false,
        error: "Wallet do sistema não configurada. Configure SYSTEM_WALLET_PRIVATE_KEY no .env",
      };
    }

    // Converter a chave privada de base58 ou array
    let systemKeypair: Keypair;
    try {
      // Se for uma string (base58 ou JSON array)
      if (systemWalletPrivateKey.startsWith("[")) {
        // Array JSON
        const privateKeyArray = JSON.parse(systemWalletPrivateKey);
        systemKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
      } else {
        // Base58 string
        const bs58 = (await import("bs58")).default;
        systemKeypair = Keypair.fromSecretKey(bs58.decode(systemWalletPrivateKey));
      }
    } catch (error) {
      return {
        success: false,
        error: "Erro ao decodificar chave privada da wallet do sistema",
      };
    }

    const systemWalletPublicKey = systemKeypair.publicKey;

    // Obter endereços das contas de token associadas
    const systemTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      systemWalletPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      recipientPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    // Verificar se a conta de token do sistema existe e tem saldo
    try {
      const systemTokenAccountInfo = await getAccount(
        connection,
        systemTokenAccount,
        "confirmed",
        TOKEN_PROGRAM_ID
      );

      // Converter amount para a menor unidade (considerando decimais)
      const amountInSmallestUnit = BigInt(amount) * BigInt(10 ** decimals);

      if (systemTokenAccountInfo.amount < amountInSmallestUnit) {
        return {
          success: false,
          error: `Saldo insuficiente. Disponível: ${systemTokenAccountInfo.amount / BigInt(10 ** decimals)}, Necessário: ${amount}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Conta de token do sistema não encontrada ou sem saldo",
      };
    }

    // Verificar se a conta de token do destinatário existe
    // Se não existir, precisará ser criada (isso requer SOL para fees)
    let recipientTokenAccountInfo;
    try {
      recipientTokenAccountInfo = await getAccount(
        connection,
        recipientTokenAccount,
        "confirmed",
        TOKEN_PROGRAM_ID
      );
    } catch (error) {
      // Conta não existe, precisará criar (isso será feito automaticamente pela transferência se tiver SOL)
      console.warn("Conta de token do destinatário não existe ainda");
    }

    // Criar instrução de transferência
    const transferInstruction = createTransferInstruction(
      systemTokenAccount,
      recipientTokenAccount,
      systemWalletPublicKey,
      BigInt(amount) * BigInt(10 ** decimals),
      [],
      TOKEN_PROGRAM_ID
    );

    // Criar e enviar transação
    const transaction = new Transaction().add(transferInstruction);

    // Obter o último blockhash
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = systemWalletPublicKey;

    // Assinar e enviar transação
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [systemKeypair],
      {
        commitment: "confirmed",
        skipPreflight: false,
      }
    );

    return {
      success: true,
      signature,
    };
  } catch (error: any) {
    console.error("Erro ao enviar token SPL:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao enviar tokens",
    };
  }
}

/**
 * Verifica o saldo de tokens SPL de uma wallet
 */
export async function getTokenBalance(
  walletAddress: string,
  mintAddress: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const mintPublicKey = new PublicKey(mintAddress);

    const tokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      walletPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    try {
      const accountInfo = await getAccount(
        connection,
        tokenAccount,
        "confirmed",
        TOKEN_PROGRAM_ID
      );

      // Assumindo 6 decimais por padrão
      const decimals = 6;
      const balance = Number(accountInfo.amount) / 10 ** decimals;

      return {
        success: true,
        balance,
      };
    } catch (error) {
      return {
        success: true,
        balance: 0,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao verificar saldo",
    };
  }
}

