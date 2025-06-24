import { NextResponse } from "next/server";
import {
  PRIZE_TABLE,
  CRYPTO_PRIZE_TABLE,
  adrControllerAddress,
} from "@/constants";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";
import { AdrAbi__factory } from "@/contracts";

export const runtime = "nodejs";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const PHYSICAL_PRIZES = [5, 6, 7, 8, 9, 10];
const NFT_PRIZES = [5, 6, 7, 8, 9, 10];

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

function generateProvablyFairNumber(
  clientSeed: string,
  serverSeed: string,
  nonce: number
): number {
  const combined = `${clientSeed}:${serverSeed}:${nonce}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  const hexNumber = parseInt(hash.substring(0, 8), 16);
  return hexNumber / 0xffffffff;
}

async function determinePrize(
  randomNumber: number,
  isCrypto: boolean = false
): Promise<{ prizeId: number; wonPrize: any }> {
  const stock: { [key: number]: number } = {};

  if (isSupabaseConfigured && supabase) {
    const { data: stockData, error } = await supabase
      .from("prize_stock")
      .select("prize_id, current_stock");

    if (!error && stockData) {
      stockData.forEach((item) => {
        stock[item.prize_id] = item.current_stock;
      });
    } else {
      console.error("Error fetching stock:", error);
      throw new Error("Error fetching stock");
    }
  } else {
    throw new Error("Error supabase not configured");
  }

  const checkStock = (prizeId: number): boolean => {
    if (!PHYSICAL_PRIZES.includes(prizeId)) return true;
    const currentStock = stock[prizeId] || 0;
    return currentStock > 0;
  };

  if (isCrypto) {
    let cumulativeProbability = 0;
    for (const prize of CRYPTO_PRIZE_TABLE) {
      cumulativeProbability += prize.probability;
      if (randomNumber < cumulativeProbability) {
        return { prizeId: prize.id, wonPrize: prize };
      }
    }
    return {
      prizeId: CRYPTO_PRIZE_TABLE[0].id,
      wonPrize: CRYPTO_PRIZE_TABLE[0],
    };
  } else {
    let cumulativeProbability = 0;
    for (const prize of PRIZE_TABLE) {
      cumulativeProbability += prize.probability;
      if (randomNumber < cumulativeProbability) {
        if (PHYSICAL_PRIZES.includes(prize.id) && !checkStock(prize.id))
          continue;
        return { prizeId: prize.id, wonPrize: prize };
      }
    }
    const fallbackPrize = PRIZE_TABLE.find(
      (p) => p.type === "sol" && !PHYSICAL_PRIZES.includes(p.id)
    );
    if (fallbackPrize)
      return { prizeId: fallbackPrize.id, wonPrize: fallbackPrize };
    return { prizeId: 1, wonPrize: PRIZE_TABLE[0] };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      wallet: userWalletAddress,
      boxType,
      clientSeed,
      transactionSignature = "",
      tokenAmount,
    } = body;

    if (!userWalletAddress || !clientSeed || !boxType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    const serverSeed = crypto.randomBytes(32).toString("hex");
    let nonce = 0;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("purchases")
          .select("count")
          .eq("wallet_address", userWalletAddress)
          .single();

        if (!error && data) {
          nonce = data.count || 0;
        }
      } catch (error) {
        console.error("Error getting user purchase count:", error);
      }
    }

    const randomNumber = generateProvablyFairNumber(
      clientSeed,
      serverSeed,
      nonce
    );
    const isCrypto = boxType === 1;
    const { prizeId, wonPrize } = await determinePrize(randomNumber, isCrypto);

    if (isSupabaseConfigured && supabase) {
      const { data: boxStockData, error: boxStockError } = await supabase
        .from("box_stock")
        .select("*")
        .eq("box_type", isCrypto ? "crypto" : "super_prize")
        .single();

      if (boxStockError && boxStockError.code !== "PGRST116") {
        console.error("Erro ao verificar estoque de caixas:", boxStockError);
      } else if (boxStockData) {
        const { error: updateBoxStockError } = await supabase
          .from("box_stock")
          .update({ current_stock: boxStockData.current_stock - 1 })
          .eq("box_type", isCrypto ? "crypto" : "super_prize");

        if (updateBoxStockError) {
          console.error(
            "Erro ao atualizar estoque de caixas:",
            updateBoxStockError
          );
        }
      }
    }

    let prizeDeliveryTx = "";
    let nftMint = "";
    let nftMetadata = `https://imperadortoken.com/metadata/${wonPrize.metadata}.json`;
    let nftTokenId = "";

    if (wonPrize.type === "sol") {
      prizeDeliveryTx = await deliverBnbPrize(userWalletAddress, wonPrize);
    } else if (NFT_PRIZES.includes(prizeId)) {
      try {
        const { txHash, tokenId } = await mintNFT(userWalletAddress, wonPrize);
        prizeDeliveryTx = txHash;
        nftMint = tokenId.toString();
      } catch (error) {
        console.error("Erro ao criar NFT:", error);
      }
    }

    if (PHYSICAL_PRIZES.includes(prizeId) && isSupabaseConfigured && supabase) {
      try {
        const { data: stockData, error: stockError } = await supabase.rpc(
          "decrement_stock",
          { p_prize_id: prizeId }
        );

        if (stockError) {
          console.error(
            `Erro ao atualizar estoque para prêmio ${prizeId}:`,
            stockError
          );
        } else {
          console.log(
            `Estoque atualizado para prêmio ${prizeId}, novo estoque: ${stockData}`
          );
        }
      } catch (stockUpdateError) {
        console.error(
          "Erro ao chamar função de atualização de estoque:",
          stockUpdateError
        );
      }
    }

    await savePurchaseRecord(
      userWalletAddress,
      nftMint,
      nftMetadata,
      prizeDeliveryTx,
      prizeId,
      wonPrize.name,
      randomNumber,
      clientSeed,
      serverSeed,
      nonce,
      boxType,
      isCrypto,
      tokenAmount
    );

    return NextResponse.json({
      success: true,
      prizeId,
      prizeName: wonPrize.name,
      prizeType: wonPrize.type,
      amount: wonPrize.amount,
      txSignature: prizeDeliveryTx,
      nftMint,
      nftMetadata,
      nftTokenId,
      randomData: {
        randomNumber,
        clientSeed,
        serverSeed,
        nonce,
      },
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function deliverBnbPrize(recipient: string, prize: any) {
  try {
    if (!prize.amount || prize.amount <= 0) {
      console.error(`Invalid BNB prize amount: ${prize.amount}`);
      return "";
    }

    if (!PRIVATE_KEY) {
      console.error("Server private key not found");
      return "";
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const value = ethers.parseEther(prize.amount.toString());
    const tx = await wallet.sendTransaction({ to: recipient, value });
    await tx.wait();

    if (!supabase) throw new Error("Supabase not configured");
    await supabase.from("bnb_prizes_delivered").insert({
      wallet: recipient,
      amount: prize.amount,
      transaction_signature: tx.hash,
      prize_id: prize.id,
      prize_name: prize.name,
    });
    return tx.hash;
  } catch (error) {
    console.error("❌ Erro ao entregar prêmio em BNB:", error);
    if (!supabase) throw new Error("Supabase not configured");
    await supabase.from("delivery_errors").insert({
      wallet: recipient,
      prize_id: prize.id,
      prize_name: prize.name,
      error_message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return "";
  }
}

async function savePurchaseRecord(
  wallet: string,
  nftMint: string | null,
  nftMetadata: string | null,
  transactionSignature: string,
  prizeId: number,
  prizeName: string,
  randomNumber: number,
  clientSeed: string,
  serverSeed: string,
  nonce: number,
  boxType: string,
  isCrypto: boolean,
  tokenAmount: number
) {
  if (!isSupabaseConfigured || !supabase) {
    console.log("Supabase not configured, skipping database save");
    return true;
  }

  try {
    const { error } = await supabase
      .from("purchases")
      .insert([
        {
          wallet_address: wallet,
          nft_mint: nftMint,
          nft_metadata: nftMetadata,
          amount_purchased: Number(tokenAmount / 1e9),
          token_amount_burned: Number(tokenAmount / 1e9),
          transaction_signature: transactionSignature,
          prize_id: prizeId,
          prize_name: prizeName,
          random_number: randomNumber,
          user_seed: clientSeed,
          server_seed: serverSeed,
          nonce: nonce,
          purchase_timestamp: new Date().toISOString(),
          is_crypto:
            (prizeId >= 100 && prizeId <= 111) ||
            (prizeId >= 1 && prizeId <= 4),
          is_crypto_box: isCrypto,
          box_type: boxType,
          status: "completed",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving purchase record:", error);
    return false;
  }
}

async function mintNFT(
  recipient: string,
  prize: any
): Promise<{ txHash: string; tokenId: string }> {
  try {
    if (!PRIVATE_KEY) throw new Error("Server private key not found");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const adrContract = AdrAbi__factory.connect(adrControllerAddress, wallet);
    const uri = `https://imperadortoken.com/metadata/${prize.metadata}.json`;
    const tx = await adrContract.mintNFT(recipient, uri);
    const receipt = await tx.wait();

    let tokenId = "0";
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = adrContract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsedLog && parsedLog.name === "NFTMinted") {
            tokenId = parsedLog.args.tokenId.toString();
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }

    return { txHash: tx.hash, tokenId };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
}
