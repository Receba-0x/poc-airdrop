import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";
import {
  PRIZE_TABLE,
  CRYPTO_PRIZE_TABLE,
  adrControllerAddress,
} from "@/constants";
import crypto from "crypto";
import { AdrAbi__factory } from "@/contracts";

export const runtime = "nodejs";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Consolidated lootbox endpoint - handles everything in one request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "purchase":
        return await handlePurchase(params);
      case "get-stock":
        return await handleGetStock();
      case "get-stats":
        return await handleGetStats();
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in lootbox API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle complete purchase flow
async function handlePurchase(params: any) {
  const { boxType, wallet, clientSeed, bnbFeeTransactionHash, bnbPrice } =
    params;

  if (!boxType || !wallet || !clientSeed) {
    return NextResponse.json(
      { success: false, error: "Missing required parameters" },
      { status: 400 }
    );
  }

  if (!PRIVATE_KEY) {
    return NextResponse.json(
      { success: false, error: "Server private key not configured" },
      { status: 500 }
    );
  }

  // Step 1: Generate signature
  const isCrypto = boxType === 1;
  const priceUSD = isCrypto ? 17.5 : 45;
  const tokenPrice = 0.002;
  const amountInTokens = priceUSD / tokenPrice;
  const amountToBurn = ethers.parseUnits(amountInTokens.toString(), 18);
  const timestamp = Math.floor(Date.now() / 1000);

  const walletBytes = ethers.getBytes(wallet);
  const amountBytes = ethers.toBeHex(amountToBurn, 32);
  const timestampBytes = ethers.toBeHex(timestamp, 32);
  const packedData = ethers.concat([walletBytes, amountBytes, timestampBytes]);
  const messageHash = ethers.keccak256(packedData);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const arrayifiedHash = ethers.getBytes(messageHash);
  const signature = await signer.signMessage(arrayifiedHash);

  // Step 2: Validate signature locally
  try {
    const ethSignedMessageHash = ethers.hashMessage(arrayifiedHash);
    const recoveredAddress = ethers.recoverAddress(
      ethSignedMessageHash,
      signature
    );
    const isValidLocal =
      recoveredAddress.toLowerCase() === signer.address.toLowerCase();

    if (!isValidLocal) {
      throw new Error("Generated signature is invalid");
    }
  } catch (validationError) {
    console.error("❌ Signature validation error:", validationError);
    return NextResponse.json(
      { success: false, error: "Failed to generate valid signature" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    step: "signature_generated",
    data: {
      amountToBurn: amountToBurn.toString(),
      timestamp,
      signature,
      clientSeed,
    },
  });
}

// Handle prize claiming after blockchain transaction
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body;

    // Validate blockchain transaction
    const burnValidation = await validateVerifiedBurnTransaction(
      txHash,
      wallet,
      amount,
      timestamp
    );

    if (!burnValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Transaction validation failed: ${burnValidation.error}`,
        },
        { status: 400 }
      );
    }

    // Determine prize
    const serverSeed = crypto.randomBytes(32).toString("hex");
    const randomNumber = generateProvablyFairNumber(clientSeed, serverSeed, 0);
    const isCrypto = boxType === 1;
    const { prizeId, wonPrize } = await determinePrize(randomNumber, isCrypto);

    // Update stock and deliver prize
    await updateBoxStock(isCrypto);
    const prizeDeliveryResult = await deliverPrize(wallet, wonPrize);

    // Save purchase record
    await savePurchaseRecord({
      wallet,
      txHash,
      prizeId,
      wonPrize: wonPrize.name,
      randomNumber,
      clientSeed,
      serverSeed,
      nonce: 0, // First nonce used for prize determination
      amount,
      isCrypto,
      boxType,
      bnbFeeTransactionHash,
      signature,
      prizeDeliveryResult,
      burnValidation,
      bnbPrice,
    });

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleGetStock() {
  if (!isSupabaseConfigured || !supabase) {
    const initialStock = { 8: 90, 9: 40, 10: 30, 11: 1, 12: 2, 13: 10 };
    return NextResponse.json({ success: true, stock: initialStock });
  }

  const { data, error } = await supabase
    .from("prize_stock")
    .select("*")
    .order("prize_id");

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }

  const stockMap: { [key: number]: number } = {};
  data.forEach((item) => {
    stockMap[item.prize_id] = item.current_stock;
  });

  return NextResponse.json({ success: true, stock: stockMap });
}

async function handleGetStats() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      data: {
        totalBoxesOpened: 0,
        totalCryptoBoxesOpened: 0,
        totalSuperPrizeBoxesOpened: 0,
        remainingCryptoBoxes: 275,
        remainingSuperPrizeBoxes: 275,
        maxCryptoBoxes: 275,
        maxSuperPrizeBoxes: 275,
      },
    });
  }

  const { data: boxStockData } = await supabase.from("box_stock").select("*");

  const cryptoBoxData = boxStockData?.find((box) => box.box_type === "crypto");
  const superPrizeBoxData = boxStockData?.find(
    (box) => box.box_type === "super_prize"
  );

  const DEFAULT_MAX_BOXES = 275;
  const cryptoBoxInitial = cryptoBoxData?.initial_stock || DEFAULT_MAX_BOXES;
  const cryptoBoxCurrent = cryptoBoxData?.current_stock || DEFAULT_MAX_BOXES;
  const superPrizeBoxInitial =
    superPrizeBoxData?.initial_stock || DEFAULT_MAX_BOXES;
  const superPrizeBoxCurrent =
    superPrizeBoxData?.current_stock || DEFAULT_MAX_BOXES;

  return NextResponse.json({
    success: true,
    data: {
      totalBoxesOpened:
        cryptoBoxInitial -
        cryptoBoxCurrent +
        (superPrizeBoxInitial - superPrizeBoxCurrent),
      totalCryptoBoxesOpened: cryptoBoxInitial - cryptoBoxCurrent,
      totalSuperPrizeBoxesOpened: superPrizeBoxInitial - superPrizeBoxCurrent,
      remainingCryptoBoxes: cryptoBoxCurrent,
      remainingSuperPrizeBoxes: superPrizeBoxCurrent,
      maxCryptoBoxes: cryptoBoxInitial,
      maxSuperPrizeBoxes: superPrizeBoxInitial,
    },
  });
}

// Helper functions
async function validateVerifiedBurnTransaction(
  txHash: string,
  wallet: string,
  amount: string,
  timestamp: number
) {
  try {
    console.log(`🔍 Validating transaction: ${txHash}`);
    console.log(
      `📋 Expected: wallet=${wallet}, amount=${amount}, timestamp=${timestamp}`
    );

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

    const adrContract = AdrAbi__factory.connect(adrControllerAddress, provider);
    const logs = receipt.logs;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      console.log(`🔍 Processing log ${i + 1}/${logs.length}`);
      console.log(`📍 Log address: ${log.address}`);
      console.log(`📍 Expected address: ${adrControllerAddress}`);

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

  // Fallback: Find a BNB prize that doesn't require stock
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

  // Last resort: return first prize
  console.log(`⚠️ Last resort: returning first prize`);
  return { prizeId: prizeTable[0].id, wonPrize: prizeTable[0] };
}

async function updateBoxStock(isCrypto: boolean) {
  if (!isSupabaseConfigured || !supabase) return;

  const boxType = isCrypto ? "crypto" : "super_prize";
  const { data: boxStockData } = await supabase
    .from("box_stock")
    .select("*")
    .eq("box_type", boxType)
    .single();

  if (boxStockData) {
    await supabase
      .from("box_stock")
      .update({ current_stock: boxStockData.current_stock - 1 })
      .eq("box_type", boxType);
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
  if (!PRIVATE_KEY || !RPC_URL) {
    console.log("⚠️ Private key or RPC URL not configured for prize delivery");
    return { txHash: "" };
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

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

      const adrContract = AdrAbi__factory.connect(adrControllerAddress, signer);
      const metadataUri = `https://www.imperadortoken.com/metadata/${wonPrize.metadata}.json`;

      const tx = await adrContract.mintNFT(wallet, metadataUri, {
        gasLimit: 200000,
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
  if (!isSupabaseConfigured || !supabase) {
    console.log(`⚠️ Supabase not configured, skipping database save`);
    return;
  }

  try {
    const bnbFeeUSD = data.isCrypto ? 5 : 10;
    const bnbFeeValidationAmount = bnbFeeUSD / data.bnbPrice;

    console.log(
      `💰 BNB fee calculation: $${bnbFeeUSD} / $${data.bnbPrice} = ${bnbFeeValidationAmount} BNB`
    );
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
