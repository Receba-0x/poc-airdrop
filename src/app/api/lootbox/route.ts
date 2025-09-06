import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import {
  PRIZE_TABLE,
  CRYPTO_PRIZE_TABLE,
  PAYMENT_TOKEN_MINT,
  PROGRAM_ID,
  COLLECTION_SYMBOL,
  COLLECTION_NAME,
  METAPLEX_PROGRAM_ID,
  CONFIG_ACCOUNT,
  COLLECTION_METADATA,
  COLLECTION_URI,
  boxesData,
} from "@/constants";
import crypto from "crypto";
import bs58 from "bs58";
import nacl from "tweetnacl";
import {
  withRateLimit,
  purchaseRateLimiter,
  apiRateLimiter,
} from "@/utils/rateLimiter";
import { InputValidator } from "@/utils/inputValidator";
import { generateProvablyFairNumber } from "@/utils/probablyFair";
import { TimestampValidator } from "@/utils/timestampValidator";
import { withAPIProtection } from "@/utils/apiProtection";
import { SecurityLogger } from "@/utils/securityLogger";
import { getPrivateKey, getSupabaseKey } from "@/utils/secretsManager";
import {
  verifyCsrfToken,
  CSRF_SECRET_COOKIE,
  CSRF_TOKEN_HEADER,
} from "@/utils/csrf";
import { validateRequestOrigin } from "@/utils/validateRequestOrigin";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const securityLogger = SecurityLogger.getInstance();
const purchaseTimestampValidator = new TimestampValidator();

export const runtime = "nodejs";

const SOLANA_RPC_URL = "https://api.devnet.solana.com";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const POST = withAPIProtection(
  withRateLimit(apiRateLimiter)(async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { action, ...params } = body;

      if (action === "purchase") {
        const csrfSecret = req.cookies.get(CSRF_SECRET_COOKIE)?.value;
        const csrfToken = req.headers.get(CSRF_TOKEN_HEADER);
        if (
          !csrfSecret ||
          !csrfToken ||
          !verifyCsrfToken(csrfSecret, csrfToken)
        ) {
          securityLogger.logEvent(
            "csrf_attempt" as any,
            "CSRF token inválido ou ausente",
            {
              origin: req.headers.get("origin"),
              referer: req.headers.get("referer"),
              userAgent: req.headers.get("user-agent"),
            },
            "high",
            req
          );
          return NextResponse.json(
            { success: false, error: "CSRF token inválido" },
            { status: 403 }
          );
        }
        if (!validateRequestOrigin(req, action)) {
          securityLogger.logEvent(
            "csrf_attempt" as any,
            "Invalid request origin detected for purchase",
            {
              origin: req.headers.get("origin"),
              referer: req.headers.get("referer"),
              userAgent: req.headers.get("user-agent"),
            },
            "high",
            req
          );
          return NextResponse.json(
            { success: false, error: "Access denied" },
            { status: 403 }
          );
        }
      }

      securityLogger.logEvent(
        "contract_interaction" as any,
        `Lootbox API chamada: ${action}`,
        { action },
        "low",
        req
      );

      switch (action) {
        case "get-stock":
          return await handleGetStock();
        case "get-stats":
          return await handleGetStats();
        default:
          securityLogger.logInvalidInput("action", action, req);
          return NextResponse.json(
            { success: false, error: "Invalid action" },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("Error in lootbox API:", error);
      securityLogger.logEvent(
        "transaction_validation_failed" as any,
        `Erro na API lootbox: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { error: error instanceof Error ? error.message : "Unknown error" },
        "high",
        req
      );
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  })
);

export const PUT = withAPIProtection(
  withRateLimit(purchaseRateLimiter)(async (req: NextRequest) => {
    try {
      if (!validateRequestOrigin(req, "purchase")) {
        securityLogger.logEvent(
          "csrf_attempt" as any,
          "Invalid request origin for purchase transaction",
          {
            origin: req.headers.get("origin"),
            referer: req.headers.get("referer"),
          },
          "high",
          req
        );
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }

      const body = await req.json();

      const validation = InputValidator.validateLootboxProcessingData(body);
      if (!validation.valid) {
        securityLogger.logInvalidInput(
          "lootbox_processing_data",
          JSON.stringify(body),
          req
        );
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      const sanitizedData = validation.sanitized!;
      const {
        wallet,
        amount,
        timestamp,
        txHash,
        clientSeed,
        solFeeTransactionHash,
        solPrice,
        boxId,
        prizeData,
      } = sanitizedData;

      const timestampValidation = purchaseTimestampValidator.validateTimestamp(
        timestamp,
        wallet,
        amount,
        true
      );

      if (!timestampValidation.valid) {
        securityLogger.logReplayAttack(wallet, timestamp, req);
        return NextResponse.json(
          { success: false, error: timestampValidation.error },
          { status: 400 }
        );
      }

      const feeValidation = await validateSolFeeTransaction(
        solFeeTransactionHash,
        wallet,
        amount,
        timestamp,
        solPrice
      );

      if (!feeValidation.isValid) {
        securityLogger.logTransactionValidationFailed(
          solFeeTransactionHash,
          feeValidation.error || "Unknown validation error",
          req
        );
        return NextResponse.json(
          {
            success: false,
            error: `SOL fee validation failed: ${feeValidation.error}`,
          },
          { status: 400 }
        );
      }

      // Usar dados do prizeData gerado no frontend
      const { prizeId, serverSeed, randomNumber } = prizeData;
      const randomNumberValue = Number(randomNumber);
      
      // Usar o prizeId do frontend (provably fair) ao invés de recalcular
      const wonPrize = PRIZE_TABLE.find(p => p.id === prizeId);
      if (!wonPrize) {
        return NextResponse.json(
          { success: false, error: `Prize ID ${prizeId} not found` },
          { status: 400 }
        );
      }
      
      console.log(`🎁 Using frontend prize: ${wonPrize.name} (ID: ${prizeId})`);

      /* await updateBoxStock(isCrypto); */
      const prizeDeliveryResult = await deliverPrizeToWallet(wallet, wonPrize);

      await savePurchaseRecord({
        wallet,
        txHash,
        prizeId: prizeId,
        wonPrize: wonPrize.name,
        randomNumber: randomNumberValue,
        clientSeed,
        serverSeed,
        nonce: prizeDeliveryResult.tokenId,
        amount,
        boxId,
        solFeeTransactionHash,
        prizeDeliveryResult,
        feeValidation,
        solPrice,
      });

      await updatePrizeStock(prizeId);

      securityLogger.logEvent(
        "contract_interaction" as any,
        "Compra processada com sucesso",
        {
          wallet,
          txHash,
          prizeId: prizeId,
          prizeName: wonPrize.name,
          amount,
        },
        "low",
        req
      );

      return NextResponse.json({
        success: true,
        prizeId,
        prizeName: wonPrize.name,
        prizeType: wonPrize.type,
        amount: wonPrize.amount,
        txSignature: prizeDeliveryResult.txHash || txHash,
        nftTokenId: prizeDeliveryResult.tokenId,
        nftMetadata: prizeDeliveryResult.metadataUri,
        randomData: { randomNumber, clientSeed, serverSeed, nonce: 0 },
      });
    } catch (error) {
      console.error("Error processing prize claim:", error);
      securityLogger.logEvent(
        "transaction_validation_failed" as any,
        `Erro no processamento de prêmio: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { error: error instanceof Error ? error.message : "Unknown error" },
        "high",
        req
      );
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  })
);

async function handleGetStock() {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    console.log("⚠️ Error creating Supabase client for stock check:", error);
    return NextResponse.json({
      success: true,
      data: { boxStock: [], prizeStock: [] },
    });
  }

  try {
    const { data: boxStock, error: boxError } = await supabase
      .from("box_stock")
      .select("*");

    const { data: prizeStock, error: prizeError } = await supabase
      .from("prize_stock")
      .select("*");

    if (boxError) console.error("Box stock error:", boxError);
    if (prizeError) console.error("Prize stock error:", prizeError);

    return NextResponse.json({
      success: true,
      data: {
        boxStock: boxStock || [],
        prizeStock: prizeStock || [],
      },
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock" },
      { status: 500 }
    );
  }
}

async function handleGetStats() {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    console.log("⚠️ Error creating Supabase client for stats:", error);
    return NextResponse.json({
      success: true,
      data: {
        totalPurchases: 0,
        totalRevenue: 0,
        totalBoxes: 0,
        recentActivity: [],
      },
    });
  }

  try {
    const { count: totalPurchases } = await supabase
      .from("purchases")
      .select("*", { count: "exact", head: true });

    const { data: revenueData } = await supabase
      .from("purchases")
      .select("amount_purchased");

    const totalRevenue =
      revenueData?.reduce(
        (sum: number, purchase: any) => sum + purchase.amount_purchased,
        0
      ) || 0;

    const { data: recentActivity } = await supabase
      .from("purchases")
      .select(
        "wallet_address, prize_name, purchase_timestamp, amount_purchased"
      )
      .order("purchase_timestamp", { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        totalPurchases: totalPurchases || 0,
        totalRevenue,
        totalBoxes: totalPurchases || 0,
        recentActivity: recentActivity || [],
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

async function validateSolFeeTransaction(
  txHash: string,
  wallet: string,
  amount: string,
  timestamp: number,
  solPrice: number
) {
  try {
    const connection = new Connection(SOLANA_RPC_URL);
    const transaction = await connection.getTransaction(txHash, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if (!transaction) {
      return { isValid: false, error: "Transaction not found" };
    }
    if (transaction.meta?.err) {
      return { isValid: false, error: "Transaction failed" };
    }
    const expectedWalletPubkey = new PublicKey(wallet);
    const accountKeys = transaction.transaction.message.getAccountKeys();

    const firstSigner = accountKeys.get(0);
    if (!firstSigner || !firstSigner.equals(expectedWalletPubkey)) {
      return { isValid: false, error: "Invalid transaction signer" };
    }
    const systemProgramId = new PublicKey("11111111111111111111111111111111");
    const compiledInstructions =
      transaction.transaction.message.compiledInstructions;

    const hasSystemTransfer = compiledInstructions.some((instruction: any) => {
      const programId = accountKeys.get(instruction.programIdIndex);
      return programId?.equals(systemProgramId);
    });

    if (!hasSystemTransfer) {
      return { isValid: false, error: "Missing SOL transfer instruction" };
    }

    // Validar se tem memo instruction (para identificação única)
    const memoProgramId = new PublicKey(
      "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
    );
    const hasMemoInstruction = compiledInstructions.some((instruction: any) => {
      const programId = accountKeys.get(instruction.programIdIndex);
      return programId?.equals(memoProgramId);
    });

    if (!hasMemoInstruction) {
      return {
        isValid: false,
        error: "Missing memo instruction for transaction identification",
      };
    }

    // Calcular valor transferido
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];

    if (preBalances.length === 0 || postBalances.length === 0) {
      return { isValid: false, error: "Unable to verify SOL fee amount" };
    }

    const payerPreBalance = preBalances[0];
    const payerPostBalance = postBalances[0];
    const solTransferred =
      (payerPreBalance - payerPostBalance) / LAMPORTS_PER_SOL;

    // Validar timestamp da transação
    const txTimestamp = transaction.blockTime;
    if (txTimestamp) {
      const timeDiff = Math.abs(txTimestamp - timestamp);
      if (timeDiff > 300) {
        // 5 minutos de tolerância
        return {
          isValid: false,
          error: `SOL fee transaction timestamp too old. Difference: ${timeDiff}s`,
        };
      }
    }

    return {
      isValid: true,
      sender: wallet,
      amount: solTransferred.toString(),
      timestamp: txTimestamp || timestamp,
      txSignature: txHash,
    };
  } catch (error) {
    console.error(`❌ Error validating SOL fee transaction: ${error}`);
    return {
      isValid: false,
      error: `Validation error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function determinePrize(randomNumber: number, boxId: number) {
  const stock: { [key: number]: number } = {};

  if (isSupabaseConfigured && supabase) {
    const { data: stockData } = await supabase
      .from("prize_stock")
      .select("prize_id, current_stock");

    if (stockData) {
      stockData.forEach((item) => {
        stock[item.prize_id] = item.current_stock;
      });
    }
  }

  const PHYSICAL_PRIZES = [5, 6, 7, 8, 9, 10];
  const checkStock = (prizeId: number): boolean => {
    if (!PHYSICAL_PRIZES.includes(prizeId)) return true;
    return (stock[prizeId] || 0) > 0;
  };

  for (let attempt = 0; attempt < 10; attempt++) {
    let cumulativeProbability = 0;
    const currentRandom = attempt === 0 ? randomNumber : Math.random();

    console.log(
      `🎲 Attempt ${attempt + 1}: Random number = ${currentRandom.toFixed(6)}`
    );

    for (const prize of PRIZE_TABLE) {
      cumulativeProbability += prize.probability;
      if (currentRandom < cumulativeProbability) {
        if (PHYSICAL_PRIZES.includes(prize.id) && !checkStock(prize.id)) {
          console.log(
            `⚠️ Prize ${prize.name} (ID: ${prize.id}) is out of stock, trying again...`
          );
          break; // Sai do loop interno e tenta com novo número
        }
        console.log(`🎁 Selected prize: ${prize.name} (ID: ${prize.id})`);
        return { prizeId: prize.id, wonPrize: prize };
      }
    }
  }

  console.log(
    `⚠️ Fallback triggered after 10 attempts - looking for BNB prize`
  );
  const fallbackPrize = PRIZE_TABLE.find((p) => p.type === "sol");
  if (fallbackPrize) {
    console.log(
      `🎁 Fallback prize: ${fallbackPrize.name} (ID: ${fallbackPrize.id})`
    );
    return { prizeId: fallbackPrize.id, wonPrize: fallbackPrize };
  }

  console.log(`⚠️ Last resort: returning first prize`);
  return { prizeId: PRIZE_TABLE[0].id, wonPrize: PRIZE_TABLE[0] };
}

async function deliverPrizeToWallet(
  wallet: string,
  wonPrize: any
): Promise<{
  txHash: string;
  tokenId?: string;
  metadataUri?: string;
}> {
  let privateKey: string;
  try {
    privateKey = await getPrivateKey();
  } catch (error) {
    console.log("⚠️ Error accessing private key for prize delivery:", error);
    return { txHash: "" };
  }

  if (!SOLANA_RPC_URL) {
    console.log("⚠️ Solana RPC URL not configured for prize delivery");
    return { txHash: "" };
  }

  try {
    const connection = new Connection(SOLANA_RPC_URL);
    const privateKeyBytes = bs58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);

    if (wonPrize.type === "sol" && wonPrize.amount) {
      console.log(`💰 Delivering ${wonPrize.amount} SOL to ${wallet}`);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(wallet),
          lamports: Math.floor(wonPrize.amount * LAMPORTS_PER_SOL),
        })
      );

      const signature = await connection.sendTransaction(transaction, [
        keypair,
      ]);
      await connection.confirmTransaction(signature);

      console.log(`✅ SOL delivery successful: ${signature}`);
      return { txHash: signature };
    } else if (wonPrize.type === "physical" || wonPrize.type === "special") {
      const connection = new web3.Connection(SOLANA_RPC_URL, "confirmed");
      const adminKeypair = getAdminKeypair();
      const adminWallet = new NodeWallet(adminKeypair);
      const provider = new AnchorProvider(connection, adminWallet, {
        commitment: "confirmed",
      });
      const {
        program,
        metaplexMetadata,
        nftMetadata,
        nftMint,
        config,
        collectionMetadata,
        nftCounter,
      } = await prepareNftAccounts(provider);
      const authority = provider.wallet.publicKey;
      const recipient = new PublicKey(wallet);
      const recipientAta = await getAssociatedTokenAddress(nftMint, recipient);

      const tx = await program.methods
        .mintNftByAuthority(
          COLLECTION_NAME,
          COLLECTION_SYMBOL,
          `${COLLECTION_URI}/${wonPrize.metadata}.json`,
          recipient
        )
        .accounts({
          authority,
          nftCounter: nftCounter,
          nftMint,
          nftMetadata,
          metaplexMetadata,
          tokenMetadataProgram: METAPLEX_PROGRAM_ID,
          recipientTokenAccount: recipientAta,
          recipient,
          collectionMetadata,
          config,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
      await connection.confirmTransaction(tx);

      return {
        txHash: "simulated_nft_creation", // This would be a real transaction signature
        tokenId: `solana_nft_${Date.now()}`, // This would be the mint address
        metadataUri: "",
      };
    }

    console.log(`⚠️ Unknown prize type: ${wonPrize.type}`);
    return { txHash: "" };
  } catch (error) {
    console.error(`❌ Error delivering prize: ${error}`);
    return { txHash: "" };
  }
}

function getAdminKeypair(): web3.Keypair {
  try {
    const ADMIN_PRIVATE_KEY_ARRAY = process.env.PRIVATE_KEY_ARRAY;
    const privateKeyArray = JSON.parse(ADMIN_PRIVATE_KEY_ARRAY as any);
    if (Array.isArray(privateKeyArray) && privateKeyArray.length > 0) {
      const privateKeyUint8 = Uint8Array.from(privateKeyArray);
      if (privateKeyUint8.length === 32) {
        return web3.Keypair.fromSeed(privateKeyUint8);
      } else {
        return web3.Keypair.fromSecretKey(privateKeyUint8);
      }
    }
    throw new Error("Nenhuma chave privada válida encontrada");
  } catch (error) {
    console.error("Erro ao criar keypair do admin:", error);
    throw new Error("Falha ao inicializar keypair do admin");
  }
}

async function prepareNftAccounts(provider: AnchorProvider) {
  const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
  const program = new anchor.Program(idl, provider);

  if (!program || !program.account) {
    throw new Error("Programa não carregado corretamente");
  }

  const [nftCounter] = PublicKey.findProgramAddressSync(
    [Buffer.from("nft_counter")],
    program.programId
  );
  const counterAccount = await (program.account as any).nftCounter.fetch(
    nftCounter
  );
  const currentCount = counterAccount.count;

  const collectionMetadata = new PublicKey(COLLECTION_METADATA);
  const [nftMint] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("nft_mint"),
      collectionMetadata.toBuffer(),
      new anchor.BN(currentCount.toString()).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const [nftMetadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("nft_metadata"), nftMint.toBuffer()],
    program.programId
  );

  const payerPaymentTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(PAYMENT_TOKEN_MINT),
    provider.wallet.publicKey,
    false
  );

  const config = new PublicKey(CONFIG_ACCOUNT);
  const metaplexProgramId = new PublicKey(METAPLEX_PROGRAM_ID);
  const [metaplexMetadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), metaplexProgramId.toBuffer(), nftMint.toBuffer()],
    metaplexProgramId
  );

  const nftTokenAccount = await getAssociatedTokenAddress(
    nftMint,
    provider.wallet.publicKey
  );

  return {
    program,
    nftMint,
    nftMetadata,
    nftTokenAccount,
    payerPaymentTokenAccount,
    nftCounter,
    collectionMetadata,
    config,
    metaplexMetadata,
  };
}

async function savePurchaseRecord(data: any) {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    console.log(
      `⚠️ Error creating Supabase client, skipping database save:`,
      error
    );
    return;
  }

  try {
    const solFeeValidationAmount = data.solPrice;

    const purchaseRecord = {
      wallet_address: data.wallet,
      transaction_signature: data.txHash,
      prize_id: data.prizeId,
      prize_name: data.wonPrize,
      random_number: data.randomNumber,
      user_seed: data.clientSeed,
      server_seed: data.serverSeed,
      nonce: null,
      nft_token_id: null,
      nft_metadata_uri: null,
      amount_purchased: Number(data.amount) / 1e9,
      token_amount_burned: Number(data.amount) / 1e9,
      purchase_timestamp: new Date().toISOString(),
      box_type: data.boxId,
      status: "completed",
      fee_transaction_hash: data.solFeeTransactionHash,
      fee_validation_amount: solFeeValidationAmount,
      server_signature: data.signature,
      validation_amount: data.feeValidation.amount,
    };

    console.log(`📝 Purchase record to save:`, purchaseRecord);

    const { data: insertResult, error } = await supabase
      .from("purchases")
      .insert([purchaseRecord]);

    if (error) {
      console.error(`❌ Supabase insert error:`, error);
      throw error;
    }

    console.log(`✅ Purchase record saved successfully!`, insertResult);
  } catch (error) {
    console.error(`❌ Error in savePurchaseRecord:`, error);
    throw error;
  }
}

async function updatePrizeStock(prizeId: number) {
  console.log(`🎁 Updating prize stock for prize ID: ${prizeId}`);

  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    console.log(
      "⚠️ Error creating Supabase client, skipping prize stock update:",
      error
    );
    return;
  }

  const PHYSICAL_PRIZES = [5, 6, 7, 8, 9, 10];
  if (!PHYSICAL_PRIZES.includes(prizeId)) {
    console.log(
      `ℹ️ Prize ${prizeId} is not a physical prize, no stock update needed`
    );
    return;
  }

  console.log(`🔍 Fetching current stock for prize ID: ${prizeId}`);

  const { data: prizeStockData, error } = await supabase
    .from("prize_stock")
    .select("*")
    .eq("prize_id", prizeId)
    .single();

  if (error) {
    console.error("❌ Error fetching prize stock:", error);
    return;
  }

  console.log("📊 Current prize stock data:", prizeStockData);

  if (prizeStockData && prizeStockData.current_stock > 0) {
    const newStock = prizeStockData.current_stock - 1;
    console.log(
      `🔄 Updating prize stock from ${prizeStockData.current_stock} to ${newStock}`
    );

    const { error: updateError } = await supabase
      .from("prize_stock")
      .update({ current_stock: newStock })
      .eq("prize_id", prizeId);

    if (updateError) {
      console.error("❌ Error updating prize stock:", updateError);
    } else {
      console.log("✅ Prize stock updated successfully");
    }
  } else {
    console.log(`⚠️ Prize ${prizeId} is out of stock or not found`);
  }
}

async function createSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL não configurada");
  }
  const supabaseServiceKey = await getSupabaseKey();
  return createClient(supabaseUrl, supabaseServiceKey);
}
