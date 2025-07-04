import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";
import {
  PRIZE_TABLE,
  CRYPTO_PRIZE_TABLE,
  controllerAddress,
} from "@/constants";
import crypto from "crypto";
import { ControllerAbi__factory } from "@/contracts";
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
import { validateRequestOrigin } from '@/utils/validateRequestOrigin';

const securityLogger = SecurityLogger.getInstance();
const purchaseTimestampValidator = new TimestampValidator();

export const runtime = "nodejs";

const RPC_URL = process.env.RPC_URL;
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
    console.log("🔍 [DEBUG] Purchase validation starting:", {
      params: JSON.stringify(params, null, 2),
      headers: {
        origin: req.headers.get("origin"),
        referer: req.headers.get("referer"),
        userAgent: req.headers.get("user-agent"),
        host: req.headers.get("host"),
        contentType: req.headers.get("content-type"),
      },
      environment: process.env.NODE_ENV,
    });

    const validation = InputValidator.validatePurchaseData(params);
    
    console.log("🔍 [DEBUG] Validation result:", {
      valid: validation.valid,
      error: validation.error,
      sanitized: validation.sanitized,
    });

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
  const { boxType, wallet, clientSeed, bnbFeeTransactionHash, bnbPrice } =
    params;

  let privateKey: string;
  try {
    privateKey = await getPrivateKey();
  } catch (error) {
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
  const amountToBurn = ethers.parseUnits(amountInTokens.toString(), 18);
  const timestamp = Math.floor(Date.now() / 1000);

  const timestampValidation = purchaseTimestampValidator.validateTimestamp(
    timestamp,
    wallet,
    amountToBurn.toString()
  );

  console.log("🔍 Initial timestamp validation result:", timestampValidation);

  if (!timestampValidation.valid) {
    securityLogger.logEvent(
      "replay_attack" as any,
      timestampValidation.error || "Timestamp validation failed",
      { wallet, timestamp, amount: amountToBurn.toString() },
      "high",
      req
    );
    return NextResponse.json(
      { success: false, error: timestampValidation.error },
      { status: 400 }
    );
  }

  const walletBytes = ethers.getBytes(wallet);
  const amountBytes = ethers.toBeHex(amountToBurn, 32);
  const timestampBytes = ethers.toBeHex(timestamp, 32);
  const packedData = ethers.concat([walletBytes, amountBytes, timestampBytes]);
  const messageHash = ethers.keccak256(packedData);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(privateKey, provider);
  const arrayifiedHash = ethers.getBytes(messageHash);
  const signature = await signer.signMessage(arrayifiedHash);

  try {
    const ethSignedMessageHash = ethers.hashMessage(arrayifiedHash);
    const recoveredAddress = ethers.recoverAddress(
      ethSignedMessageHash,
      signature
    );
    const isValidLocal =
      recoveredAddress.toLowerCase() === signer.address.toLowerCase();

    if (!isValidLocal) {
      securityLogger.logSignatureVerificationFailed(
        wallet,
        "Generated signature is invalid",
        req
      );
      throw new Error("Generated signature is invalid");
    }
  } catch (validationError) {
    console.error("❌ Signature validation error:", validationError);
    securityLogger.logSignatureVerificationFailed(
      wallet,
      validationError instanceof Error
        ? validationError.message
        : "Unknown error",
      req
    );
    return NextResponse.json(
      { success: false, error: "Failed to generate valid signature" },
      { status: 500 }
    );
  }

  securityLogger.logEvent(
    "contract_interaction" as any,
    "Assinatura gerada com sucesso para compra",
    { wallet, boxType, amount: amountToBurn.toString() },
    "low",
    req
  );

  return NextResponse.json({
    success: true,
    step: "signature_generated",
    data: {
      amountToBurn: amountToBurn.toString(),
      timestamp,
      signature,
      clientSeed,
      bnbFeeTransactionHash,
      bnbPrice,
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
      console.log("🔍 Body:", body);

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
        bnbFeeTransactionHash,
        bnbPrice,
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

      const burnValidation = await validateVerifiedBurnTransaction(
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
      const prizeDeliveryResult = await deliverPrize(wallet, wonPrize);

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
        bnbFeeTransactionHash,
        signature,
        prizeDeliveryResult,
        burnValidation,
        bnbPrice,
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
    // Get box stock
    const { data: boxStock, error: boxError } = await supabase
      .from("box_stock")
      .select("*");

    // Get prize stock
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
    // Get total purchases
    const { count: totalPurchases } = await supabase
      .from("purchases")
      .select("*", { count: "exact", head: true });

    // Get total revenue
    const { data: revenueData } = await supabase
      .from("purchases")
      .select("amount_purchased");

    const totalRevenue =
      revenueData?.reduce(
        (sum: number, purchase: any) => sum + purchase.amount_purchased,
        0
      ) || 0;

    // Get recent activity
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

async function validateVerifiedBurnTransaction(
  txHash: string,
  wallet: string,
  amount: string,
  timestamp: number
) {
  try {
    console.log(`🔍 Validating transaction: ${txHash}`);
    console.log(
      `📋 Expected: wallet=${wallet}, amount=${amount}, timestamp=${timestamp}`    );

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      console.log(`❌ Transaction receipt not found for ${txHash}`);
      return { isValid: false, error: "Transaction not found" };
    }

    console.log(
      `✅ Transaction receipt found. Logs count: ${receipt.logs.length}`
    );
    console.log(`📍 Transaction status: ${receipt.status}`);

    const adrContract = ControllerAbi__factory.connect(
      controllerAddress,
      provider
    );
    const logs = receipt.logs;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      console.log(`🔍 Processing log ${i + 1}/${logs.length}`);
      console.log(`📍 Log address: ${log.address}`);
      console.log(`📍 Expected address: ${controllerAddress}`);

      try {
        const parsedLog = adrContract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog) {
          console.log(`✅ Parsed log: ${parsedLog.name}`);

          if (parsedLog.name === "VerifiedTokensBurned") {
            const logWallet = parsedLog.args.payer;
            const logAmount = parsedLog.args.amount.toString();
            const logTimestamp = Number(parsedLog.args.timestamp);

            console.log(`🔍 Found VerifiedTokensBurned event:`);
            console.log(`   Wallet: ${logWallet} (expected: ${wallet})`);
            console.log(`   Amount: ${logAmount} (expected: ${amount})`);
            console.log(
              `   Timestamp: ${logTimestamp} (expected: ${timestamp})`
            );

            if (
              logWallet.toLowerCase() === wallet.toLowerCase() &&
              logAmount === amount &&
              logTimestamp === timestamp
            ) {
              console.log(`✅ Event validation successful!`);
              return {
                isValid: true,
                sender: logWallet,
                amount: logAmount,
                timestamp: logTimestamp,
              };
            } else {
              console.log(`❌ Event data mismatch`);
            }
          }
        }
      } catch (parseError) {
        console.log(`⚠️ Failed to parse log ${i + 1}: ${parseError}`);
        continue;
      }
    }

    console.log(
      `❌ VerifiedTokensBurned event not found in any of the ${logs.length} logs`
    );
    return { isValid: false, error: "VerifiedTokensBurned event not found" };
  } catch (error) {
    console.error(`❌ Transaction validation error:`, error);
    return { isValid: false, error: `Transaction validation error: ${error}` };
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

async function deliverPrize(
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

  if (!RPC_URL) {
    console.log("⚠️ RPC URL not configured for prize delivery");
    return { txHash: "" };
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);

    if (wonPrize.type === "sol" && wonPrize.amount) {
      console.log(`💰 Delivering ${wonPrize.amount} BNB to ${wallet}`);

      const tx = await signer.sendTransaction({
        to: wallet,
        value: ethers.parseEther(wonPrize.amount.toString()),
        gasLimit: 21000,
      });

      await tx.wait();
      console.log(`✅ BNB delivery successful: ${tx.hash}`);
      return { txHash: tx.hash };
    } else if (wonPrize.type === "physical" || wonPrize.type === "special") {
      console.log(`🎨 Minting NFT for ${wonPrize.name} to ${wallet}`);

      const adrContract = ControllerAbi__factory.connect(
        controllerAddress,
        signer
      );
      const metadataUri = `https://www.imperadortoken.com/metadata/${wonPrize.metadata}.json`;

      const tx = await adrContract.mint(wallet, metadataUri, {
        gasLimit: 1000000,
      });
      const receipt = await tx.wait();
      let tokenId = "";
      if (receipt && receipt.logs) {
        console.log(
          `🔍 Analyzing ${receipt.logs.length} logs from NFT mint transaction...`
        );
        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          console.log(`📋 Log ${i + 1}: Address: ${log.address}`);
          if (
            log.topics.length >= 4 &&
            log.topics[0] ===
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
          ) {
            tokenId = parseInt(log.topics[3], 16).toString();
            console.log(
              `🎯 Found Transfer event from NFT contract - TokenID: ${tokenId}`
            );
            break;
          }
        }
      }

      if (!tokenId) {
        console.log(
          `⚠️ Could not extract tokenId from logs, will save as null`
        );
      }

      console.log(
        `✅ NFT minting successful: ${tx.hash}, TokenID: ${
          tokenId || "NOT_FOUND"
        }`
      );
      return {
        txHash: tx.hash,
        tokenId: tokenId || undefined,
        metadataUri: metadataUri,
      };
    }

    console.log(`⚠️ Unknown prize type: ${wonPrize.type}`);
    return { txHash: "" };
  } catch (error) {
    console.error(`❌ Prize delivery failed for ${wallet}:`, error);
    return { txHash: "" };
  }
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
    const bnbFeeValidationAmount = data.bnbPrice;
    console.log(`🎁 Prize delivery result:`, data.prizeDeliveryResult);

    const purchaseRecord = {
      wallet_address: data.wallet,
      transaction_signature: data.txHash,
      prize_id: data.prizeId,
      prize_name: data.wonPrize,
      random_number: data.randomNumber,
      user_seed: data.clientSeed,
      server_seed: data.serverSeed,
      nonce: data.nonce,
      nft_token_id: data.prizeDeliveryResult.tokenId || null,
      nft_metadata_uri: data.prizeDeliveryResult.metadataUri || null,
      amount_purchased: Number(data.amount) / 1e18,
      token_amount_burned: Number(data.amount) / 1e18,
      purchase_timestamp: new Date().toISOString(),
      box_type: data.boxType,
      status: "completed",
      bnb_fee_transaction_hash: data.bnbFeeTransactionHash,
      bnb_fee_validation_amount: bnbFeeValidationAmount,
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

