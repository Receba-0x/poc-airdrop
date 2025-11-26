import { NextRequest, NextResponse } from "next/server";
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
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { supabase } from "@/lib/supabase";

// Configuração da conexão Solana
const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Criar conexão com timeout e configurações mais robustas
const connection = new Connection(SOLANA_RPC_URL, {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000, // 60 segundos
  disableRetryOnRateLimit: false,
});

interface SendTokenRequest {
  recipientWallet: string;
  amount: number;
  decimals?: number;
  userEmail?: string; // Email do usuário (opcional, para relacionar com a submissão)
  userName?: string; // Nome do usuário (opcional)
}

export async function POST(request: NextRequest) {
  try {
    const body: SendTokenRequest = await request.json();
    const { recipientWallet, amount, decimals = 9, userEmail, userName } = body;

    // Validar parâmetros
    if (!recipientWallet || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    // Verificar se já foi enviado token para esta wallet ou email
    if (recipientWallet || userEmail) {
      let query = supabase
        .from("token_transfers")
        .select("recipient_wallet, user_email");

      if (recipientWallet && userEmail) {
        query = query.or(`recipient_wallet.eq.${recipientWallet},user_email.eq.${userEmail}`);
      } else if (recipientWallet) {
        query = query.eq("recipient_wallet", recipientWallet);
      } else if (userEmail) {
        query = query.eq("user_email", userEmail);
      }

      const { data: existingTransfers, error: checkError } = await query.limit(1);

      if (checkError) {
        console.error("Erro ao verificar transferências existentes:", checkError);
        // Não bloquear se houver erro na verificação, apenas logar
      } else if (existingTransfers && existingTransfers.length > 0) {
        const transfer = existingTransfers[0];
        const byWallet = recipientWallet && transfer.recipient_wallet === recipientWallet;
        const byEmail = userEmail && transfer.user_email === userEmail;

        return NextResponse.json(
          {
            success: false,
            error:
              byWallet && byEmail
                ? "Esta carteira e email já receberam tokens!"
                : byWallet
                ? "Esta carteira já recebeu tokens!"
                : "Este email já recebeu tokens!",
          },
          { status: 400 }
        );
      }
    }

    // Obter configurações do servidor
    const tokenMintAddress = process.env.TOKEN_MINT_ADDRESS;
    const systemWalletPrivateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY;

    if (!tokenMintAddress || !systemWalletPrivateKey) {
      console.error("Configuração faltando:", {
        hasTokenMint: !!tokenMintAddress,
        hasPrivateKey: !!systemWalletPrivateKey,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            "Configuração do servidor incompleta. Verifique as variáveis de ambiente.",
        },
        { status: 500 }
      );
    }

    console.log("Token Mint Address:", tokenMintAddress);

    // Validar endereços
    let mintPublicKey: PublicKey;
    let recipientPublicKey: PublicKey;

    try {
      mintPublicKey = new PublicKey(tokenMintAddress);
      recipientPublicKey = new PublicKey(recipientWallet);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Endereço de wallet ou token inválido" },
        { status: 400 }
      );
    }

    // Converter a chave privada da wallet do sistema
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
        systemKeypair = Keypair.fromSecretKey(
          bs58.decode(systemWalletPrivateKey)
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao decodificar chave privada da wallet do sistema",
        },
        { status: 500 }
      );
    }

    const systemWalletPublicKey = systemKeypair.publicKey;

    // Verificar se a wallet do sistema tem SOL suficiente para fees
    try {
      const balance = await connection.getBalance(systemWalletPublicKey);
      const minBalance = 0.001 * 1e9; // Mínimo de 0.001 SOL (em lamports)
      
      if (balance < minBalance) {
        return NextResponse.json(
          {
            success: false,
            error: `Wallet do sistema sem SOL suficiente para pagar fees. Saldo: ${balance / 1e9} SOL, Mínimo necessário: ${minBalance / 1e9} SOL`,
          },
          { status: 400 }
        );
      }
      
      console.log(`Saldo da wallet do sistema: ${balance / 1e9} SOL`);
    } catch (balanceError: any) {
      console.warn("Erro ao verificar saldo SOL da wallet do sistema:", balanceError);
      // Não bloquear se houver erro na verificação de saldo, apenas logar
    }

    // Obter ou criar conta de token do sistema
    console.log("Criando/obtendo conta de token do sistema...");
    let systemTokenAccountInfo;
    
    try {
      // Primeiro, tentar obter o endereço da conta associada
      const systemTokenAccountAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        systemWalletPublicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      console.log("Endereço da conta de token do sistema:", systemTokenAccountAddress.toString());

      // Tentar obter a conta (pode não existir ainda)
      try {
        systemTokenAccountInfo = await getAccount(
          connection,
          systemTokenAccountAddress,
          "confirmed",
          TOKEN_PROGRAM_ID
        );
        console.log("Conta de token do sistema encontrada:", {
          address: systemTokenAccountInfo.address.toString(),
          mint: systemTokenAccountInfo.mint.toString(),
          amount: systemTokenAccountInfo.amount.toString(),
        });
      } catch (accountError: any) {
        // Se a conta não existe, criar usando getOrCreateAssociatedTokenAccount
        console.log("Conta não encontrada, criando...");
        systemTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
          connection,
          systemKeypair,
          mintPublicKey,
          systemWalletPublicKey,
          false,
          undefined,
          undefined,
          TOKEN_PROGRAM_ID
        );
        console.log("Conta de token do sistema criada:", {
          address: systemTokenAccountInfo.address.toString(),
          mint: systemTokenAccountInfo.mint.toString(),
          amount: systemTokenAccountInfo.amount.toString(),
        });
      }
    } catch (error: any) {
      console.error("Erro ao obter/criar conta de token do sistema:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao acessar conta de token do sistema: ${error.message || "Erro desconhecido"}. Verifique a conexão RPC e se a conta existe.`,
        },
        { status: 500 }
      );
    }

    // Verificar se o mint da conta corresponde ao token correto
    if (systemTokenAccountInfo.mint.toString() !== mintPublicKey.toString()) {
      return NextResponse.json(
        {
          success: false,
          error: `Token mint não corresponde. Esperado: ${mintPublicKey.toString()}, Encontrado: ${systemTokenAccountInfo.mint.toString()}`,
        },
        { status: 400 }
      );
    }

    // Verificar saldo do sistema
    const amountInSmallestUnit = BigInt(amount) * BigInt(10 ** decimals);
    const currentBalance = Number(systemTokenAccountInfo.amount) / 10 ** decimals;
    
    console.log("Verificando saldo:", {
      amountRequested: amount,
      amountInSmallestUnit: amountInSmallestUnit.toString(),
      currentBalance,
      hasEnough: systemTokenAccountInfo.amount >= amountInSmallestUnit,
    });

    if (systemTokenAccountInfo.amount < amountInSmallestUnit) {
      return NextResponse.json(
        {
          success: false,
          error: `Saldo insuficiente. Disponível: ${currentBalance}, Necessário: ${amount}`,
        },
        { status: 400 }
      );
    }

    // Obter ou criar conta de token do destinatário
    // Se não existir, será criada automaticamente (requer SOL para fees)
    console.log("Criando/obtendo conta de token do destinatário...");
    let recipientTokenAccountInfo;
    
    try {
      // Primeiro, tentar obter o endereço da conta associada
      const recipientTokenAccountAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        recipientPublicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      console.log("Endereço da conta de token do destinatário:", recipientTokenAccountAddress.toString());

      // Tentar obter a conta (pode não existir ainda)
      try {
        recipientTokenAccountInfo = await getAccount(
          connection,
          recipientTokenAccountAddress,
          "confirmed",
          TOKEN_PROGRAM_ID
        );
        console.log("Conta de token do destinatário encontrada:", {
          address: recipientTokenAccountInfo.address.toString(),
          mint: recipientTokenAccountInfo.mint.toString(),
        });
      } catch (accountError: any) {
        // Se a conta não existe, criar usando getOrCreateAssociatedTokenAccount
        console.log("Conta do destinatário não encontrada, criando...");
        recipientTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
          connection,
          systemKeypair, // Usar systemKeypair para pagar as fees de criação
          mintPublicKey,
          recipientPublicKey,
          false,
          undefined,
          undefined,
          TOKEN_PROGRAM_ID
        );
        console.log("Conta de token do destinatário criada:", {
          address: recipientTokenAccountInfo.address.toString(),
          mint: recipientTokenAccountInfo.mint.toString(),
        });
      }
    } catch (error: any) {
      console.error("Erro ao obter/criar conta de token do destinatário:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao criar conta de token do destinatário: ${error.message || "Erro desconhecido"}. Verifique a conexão RPC e se a wallet do destinatário é válida.`,
        },
        { status: 500 }
      );
    }

    // Criar instrução de transferência de TOKEN SPL (não SOL)
    console.log("Criando instrução de transferência de token SPL...");
    const transferInstruction = createTransferInstruction(
      systemTokenAccountInfo.address, // Conta de token de origem
      recipientTokenAccountInfo.address, // Conta de token de destino
      systemWalletPublicKey, // Autoridade (quem autoriza a transferência)
      BigInt(amount) * BigInt(10 ** decimals), // Quantidade em unidades menores
      [], // Signers adicionais (nenhum)
      TOKEN_PROGRAM_ID // Programa de token SPL
    );

    console.log("Instrução criada:", {
      from: systemTokenAccountInfo.address.toString(),
      to: recipientTokenAccountInfo.address.toString(),
      amount: (BigInt(amount) * BigInt(10 ** decimals)).toString(),
      tokenMint: mintPublicKey.toString(),
      programId: TOKEN_PROGRAM_ID.toString(),
    });

    // Validar que ambas as contas são do mesmo token mint
    if (
      systemTokenAccountInfo.mint.toString() !== mintPublicKey.toString() ||
      recipientTokenAccountInfo.mint.toString() !== mintPublicKey.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Erro: Contas de token não correspondem ao mint esperado. Mint esperado: ${mintPublicKey.toString()}`,
        },
        { status: 400 }
      );
    }

    // Criar e enviar transação
    const transaction = new Transaction().add(transferInstruction);
    
    console.log("Enviando transação de token SPL (não SOL)...");

    // Obter o último blockhash
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = systemWalletPublicKey;

    // Assinar e enviar transação
    console.log("Enviando transação de token SPL (não SOL)...");
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [systemKeypair],
      {
        commitment: "confirmed",
        skipPreflight: false,
      }
    );

    console.log("✅ Transação enviada com sucesso:", signature);

    // Obter informações da transação para salvar
    const transactionDetails = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    // Salvar no Supabase
    try {
      const { error: dbError } = await supabase.from("token_transfers").insert([
        {
          recipient_wallet: recipientWallet,
          amount: amount,
          amount_raw: (BigInt(amount) * BigInt(10 ** decimals)).toString(),
          decimals: decimals,
          token_mint: mintPublicKey.toString(),
          transaction_signature: signature,
          system_wallet: systemWalletPublicKey.toString(),
          user_email: userEmail || null,
          user_name: userName || null,
          network: SOLANA_RPC_URL.includes("devnet") ? "devnet" : SOLANA_RPC_URL.includes("testnet") ? "testnet" : "mainnet",
          block_time: transactionDetails?.blockTime ? new Date(transactionDetails.blockTime * 1000).toISOString() : null,
          slot: transactionDetails?.slot || null,
          status: "confirmed",
        },
      ]);

      if (dbError) {
        console.error("Erro ao salvar no Supabase (mas transação foi enviada):", dbError);
        // Não falhar a requisição se o Supabase falhar, pois a transação já foi enviada
      } else {
        console.log("✅ Dados salvos no Supabase com sucesso");
      }
    } catch (dbError: any) {
      console.error("Erro ao salvar no Supabase (mas transação foi enviada):", dbError);
      // Não falhar a requisição se o Supabase falhar
    }

    return NextResponse.json({
      success: true,
      signature,
      tokenMint: mintPublicKey.toString(),
      amount: amount,
      recipientWallet: recipientWallet,
    });
  } catch (error: any) {
    console.error("Erro ao enviar token SPL:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro desconhecido ao enviar tokens",
      },
      { status: 500 }
    );
  }
}

