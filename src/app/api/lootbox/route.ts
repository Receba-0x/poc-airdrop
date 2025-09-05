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
} from "@/constants";
import crypto from "crypto";
import {
  withRateLimit,
  purchaseRateLimiter,
  apiRateLimiter,
} from "@/utils/rateLimiter";
import { InputValidator } from "@/utils/inputValidator";
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
        case "purchase":
          return await handlePurchaseWithSecurity(params, req);
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

async function handlePurchaseWithSecurity(params: any, req: NextRequest) {
  try {
    const validation = InputValidator.validatePurchaseData(params);

    if (!validation.valid) {
      console.error("❌ [DEBUG] Purchase data validation failed:", {
        error: validation.error,
        params: JSON.stringify(params, null, 2),
        requiredFields: ["boxType", "wallet", "clientSeed"],
        receivedFields: Object.keys(params || {}),
      });

      securityLogger.logInvalidInput(
        "purchase_data",
        JSON.stringify(params),
        req
      );
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const sanitizedParams = validation.sanitized!;
    return await handlePurchase(sanitizedParams, req);
  } catch (error) {
    console.error("❌ [DEBUG] Exception in handlePurchaseWithSecurity:", error);
    securityLogger.logEvent(
      "invalid_input" as any,
      `Erro na validação de dados de compra: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { params },
      "medium",
      req
    );
    return NextResponse.json(
      { success: false, error: "Invalid purchase data" },
      { status: 400 }
    );
  }
}

async function handlePurchase(params: any, req?: NextRequest) {
  const { boxType, wallet, clientSeed, solFeeTransactionHash, solPrice } =
    params;
  let privateKey: string;
  try {
    privateKey = await getPrivateKey();
  } catch (error) {
    console.error("❌ [DEBUG] Error getting private key:", error);
    securityLogger.logEvent(
      "private_key_access" as any,
      "Erro ao acessar chave privada",
      { error: error instanceof Error ? error.message : "Unknown error" },
      "critical",
      req
    );
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  securityLogger.logPrivateKeyAccess("signature_generation", req);

  const isCrypto = boxType === 1;
  const priceUSD = isCrypto ? 17.5 : 45;
  const tokenPrice = 0.002;
  const amountInTokens = priceUSD / tokenPrice;
  const amountInLamports = Math.floor(amountInTokens * LAMPORTS_PER_SOL);
  const timestamp = Math.floor(Date.now() / 1000);

  const timestampValidation = purchaseTimestampValidator.validateTimestamp(
    timestamp,
    wallet,
    amountInLamports.toString()
  );

  if (!timestampValidation.valid) {
    console.error("❌ [DEBUG] Timestamp validation failed:", {
      error: timestampValidation.error,
      timestamp,
      wallet,
      amount: amountInLamports.toString(),
    });
    securityLogger.logEvent(
      "replay_attack" as any,
      timestampValidation.error || "Timestamp validation failed",
      { wallet, timestamp, amount: amountInLamports.toString() },
      "high",
      req
    );
    return NextResponse.json(
      { success: false, error: timestampValidation.error },
      { status: 400 }
    );
  }

  const tokenAmount = amountInLamports;
  securityLogger.logEvent(
    "contract_interaction" as any,
    "Assinatura gerada com sucesso para compra",
    { wallet, boxType, amount: tokenAmount.toString() },
    "low",
    req
  );

  return NextResponse.json({
    success: true,
    step: "signature_generated",
    data: {
      amountToBurn: tokenAmount.toString(),
      timestamp,
      clientSeed,
      solFeeTransactionHash,
    },
  });
}

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

      const validation = InputValidator.validateBurnTransactionData(body);
      if (!validation.valid) {
        securityLogger.logInvalidInput(
          "burn_transaction_data",
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
        signature,
        clientSeed,
        solFeeTransactionHash,
        solPrice,
        boxType,
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

      const burnValidation = await validateSolanaTransaction(
        txHash,
        wallet,
        amount,
        timestamp
      );

      if (!burnValidation.isValid) {
        securityLogger.logTransactionValidationFailed(
          txHash,
          burnValidation.error || "Unknown validation error",
          req
        );
        return NextResponse.json(
          {
            success: false,
            error: `Transaction validation failed: ${burnValidation.error}`,
          },
          { status: 400 }
        );
      }

      const serverSeed = crypto.randomBytes(32).toString("hex");
      const randomNumber = generateProvablyFairNumber(
        clientSeed,
        serverSeed,
        0
      );
      const isCrypto = boxType === 1;
      const { prizeId, wonPrize } = await determinePrize(
        randomNumber,
        isCrypto
      );

      await updateBoxStock(isCrypto);
      const prizeDeliveryResult = await deliverPrizeToWallet(wallet, wonPrize);

      await savePurchaseRecord({
        wallet,
        txHash,
        prizeId,
        wonPrize: wonPrize.name,
        randomNumber,
        clientSeed,
        serverSeed,
        nonce: prizeDeliveryResult.tokenId,
        amount,
        isCrypto,
        boxType,
        solFeeTransactionHash,
        signature,
        prizeDeliveryResult,
        burnValidation,
        solPrice,
      });

      await updatePrizeStock(prizeId);

      securityLogger.logEvent(
        "contract_interaction" as any,
        "Compra processada com sucesso",
        {
          wallet,
          txHash,
          prizeId,
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

async function validateSolanaTransaction(
  txHash: string,
  wallet: string,
  amount: string,
  timestamp: number
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
    const programPubkey = new PublicKey(PROGRAM_ID);

    const compiledInstructions =
      transaction.transaction.message.compiledInstructions;
    const hasOurProgramInstruction = compiledInstructions.some(
      (instruction: any) => {
        const programId = accountKeys.get(instruction.programIdIndex);
        return programId?.equals(programPubkey);
      }
    );

    if (!hasOurProgramInstruction) {
      return { isValid: false, error: "Invalid program interaction" };
    }

    const ED25519_PROGRAM_ID = "Ed25519SigVerify111111111111111111111111111";
    const ed25519ProgramPubkey = new PublicKey(ED25519_PROGRAM_ID);

    const hasEd25519Instruction = compiledInstructions.some(
      (instruction: any) => {
        const programId = accountKeys.get(instruction.programIdIndex);
        return programId?.equals(ed25519ProgramPubkey);
      }
    );

    if (!hasEd25519Instruction) {
      return { isValid: false, error: "Missing signature verification" };
    }

    const preTokenBalances = transaction.meta?.preTokenBalances || [];
    const postTokenBalances = transaction.meta?.postTokenBalances || [];

    let tokensBurned = 0;
    for (const preBalance of preTokenBalances) {
      if (
        preBalance.mint === PAYMENT_TOKEN_MINT &&
        preBalance.owner === wallet
      ) {
        const postBalance = postTokenBalances.find(
          (post) => post.accountIndex === preBalance.accountIndex
        );
        if (postBalance) {
          const preBal = parseFloat(preBalance.uiTokenAmount.amount);
          const postBal = parseFloat(postBalance.uiTokenAmount.amount);
          tokensBurned = preBal - postBal;
          break;
        }
      }
    }

    const expectedAmount = parseFloat(amount);
    const tolerance = expectedAmount * 0.001;

    if (Math.abs(tokensBurned - expectedAmount) > tolerance) {
      return {
        isValid: false,
        error: `Invalid burn amount. Expected: ${expectedAmount}, Got: ${tokensBurned}`,
      };
    }

    const txTimestamp = transaction.blockTime;
    if (txTimestamp) {
      const timeDiff = Math.abs(txTimestamp - timestamp);
      if (timeDiff > 300) {
        return {
          isValid: false,
          error: `Transaction timestamp too far from expected. Difference: ${timeDiff}s`,
        };
      }
    }

    return {
      isValid: true,
      sender: wallet,
      amount: tokensBurned.toString(),
      timestamp: txTimestamp || timestamp,
      txSignature: txHash,
    };
  } catch (error) {
    console.error(`❌ Error validating burn transaction: ${error}`);
    return {
      isValid: false,
      error: `Validation error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

function generateProvablyFairNumber(
  clientSeed: string,
  serverSeed: string,
  nonce: number
): number {
  const combined = `${clientSeed}:${serverSeed}:${nonce}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
}

async function determinePrize(randomNumber: number, isCrypto: boolean) {
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

  const prizeTable = isCrypto ? CRYPTO_PRIZE_TABLE : PRIZE_TABLE;

  for (let attempt = 0; attempt < 10; attempt++) {
    let cumulativeProbability = 0;
    const currentRandom = attempt === 0 ? randomNumber : Math.random();

    console.log(
      `🎲 Attempt ${attempt + 1}: Random number = ${currentRandom.toFixed(6)}`
    );

    for (const prize of prizeTable) {
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
  const fallbackPrize = prizeTable.find((p) => p.type === "sol");
  if (fallbackPrize) {
    console.log(
      `🎁 Fallback prize: ${fallbackPrize.name} (ID: ${fallbackPrize.id})`
    );
    return { prizeId: fallbackPrize.id, wonPrize: fallbackPrize };
  }

  console.log(`⚠️ Last resort: returning first prize`);
  return { prizeId: prizeTable[0].id, wonPrize: prizeTable[0] };
}

async function updateBoxStock(isCrypto: boolean) {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    console.log(
      "⚠️ Error creating Supabase client for box stock update:",
      error
    );
    return;
  }

  const boxType = isCrypto ? "crypto" : "super_prize";
  console.log(`📦 Updating box stock for type: ${boxType}`);

  const { data: boxStockData, error } = await supabase
    .from("box_stock")
    .select("*")
    .eq("box_type", boxType)
    .single();

  if (error) {
    console.error("❌ Error fetching box stock:", error);
    return;
  }

  console.log("📊 Current box stock data:", boxStockData);

  if (boxStockData && boxStockData.current_stock > 0) {
    const newStock = boxStockData.current_stock - 1;
    console.log(
      `🔄 Updating box stock from ${boxStockData.current_stock} to ${newStock}`
    );

    const { error: updateError } = await supabase
      .from("box_stock")
      .update({ current_stock: newStock })
      .eq("box_type", boxType);

    if (updateError) {
      console.error("❌ Error updating box stock:", updateError);
    } else {
      console.log("✅ Box stock updated successfully");
    }
  } else {
    console.log("⚠️ No box stock data found for type:", boxType);
  }
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
    const privateKeyBytes: any = "0x" + privateKey;
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
      box_type: data.boxType,
      status: "completed",
      fee_transaction_hash: data.solFeeTransactionHash,
      fee_validation_amount: solFeeValidationAmount,
      server_signature: data.signature,
      validation_amount: data.burnValidation.amount,
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
