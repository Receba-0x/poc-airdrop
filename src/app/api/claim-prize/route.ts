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

// Validação de transação máxima permitida (30 minutos)
const MAX_TRANSACTION_AGE_MS = 30 * 60 * 1000;

// Interface para dados de validação da transação
interface TransactionValidation {
  isValid: boolean;
  sender: string;
  amount: string;
  timestamp: number;
  error?: string;
}

async function validateServerSignature(
  wallet: string,
  amount: number,
  timestamp: number,
  signature: string
): Promise<boolean> {
  try {
    if (!PRIVATE_KEY) {
      console.error("Server private key not configured");
      return false;
    }

    // Recriar o hash da mensagem
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256"],
      [wallet, amount, timestamp]
    );

    // Verificar a assinatura
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const recoveredAddress = ethers.verifyMessage(
      ethers.getBytes(messageHash),
      signature
    );

    console.log("🔐 Signature validation:", {
      expectedSigner: signer.address,
      recoveredAddress,
      messageHash,
      isValid: recoveredAddress.toLowerCase() === signer.address.toLowerCase(),
    });

    return recoveredAddress.toLowerCase() === signer.address.toLowerCase();
  } catch (error) {
    console.error("Error validating server signature:", error);
    return false;
  }
}

async function validateVerifiedBurnTransaction(
  txHash: string,
  expectedSender: string,
  expectedAmount: number,
  expectedTimestamp: number
): Promise<TransactionValidation> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // 1. Buscar a transação
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return {
        isValid: false,
        sender: "",
        amount: "0",
        timestamp: 0,
        error: "Transaction not found",
      };
    }

    // 2. Verificar se a transação foi confirmada
    if (!tx.blockNumber) {
      return {
        isValid: false,
        sender: "",
        amount: "0",
        timestamp: 0,
        error: "Transaction not confirmed",
      };
    }

    // 3. Buscar o receipt para verificar os eventos
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.status) {
      return {
        isValid: false,
        sender: "",
        amount: "0",
        timestamp: 0,
        error: "Transaction failed or not found",
      };
    }

    // 4. Verificar se é uma transação para o contrato correto
    if (tx.to?.toLowerCase() !== adrControllerAddress.toLowerCase()) {
      return {
        isValid: false,
        sender: "",
        amount: "0",
        timestamp: 0,
        error: "Transaction not sent to correct contract",
      };
    }

    // 5. Verificar se o sender é o esperado
    if (tx.from?.toLowerCase() !== expectedSender.toLowerCase()) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: "0",
        timestamp: 0,
        error: "Invalid sender",
      };
    }

    // 6. Buscar o timestamp do bloco
    const block = await provider.getBlock(tx.blockNumber);
    if (!block) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: "0",
        timestamp: 0,
        error: "Block not found",
      };
    }

    // 7. Verificar se a transação não é muito antiga
    const currentTime = Math.floor(Date.now() / 1000);
    const transactionAge = (currentTime - block.timestamp) * 1000; // converter para ms

    if (transactionAge > MAX_TRANSACTION_AGE_MS) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: "0",
        timestamp: block.timestamp,
        error: `Transaction too old: ${Math.floor(
          transactionAge / 1000 / 60
        )} minutes ago`,
      };
    }

    // 8. Verificar o evento VerifiedTokensBurned nos logs
    const adrContract = AdrAbi__factory.connect(adrControllerAddress, provider);
    const verifiedBurnTopic = ethers.id(
      "VerifiedTokensBurned(address,uint256,uint256)"
    );

    let burnAmount = "0";
    let burnTimestamp = 0;
    let eventFound = false;

    for (const log of receipt.logs) {
      if (log.topics[0] === verifiedBurnTopic) {
        try {
          const parsedLog = adrContract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsedLog && parsedLog.name === "VerifiedTokensBurned") {
            eventFound = true;
            burnAmount = parsedLog.args.amount.toString();
            burnTimestamp = Number(parsedLog.args.timestamp);

            // Verificar se o payer no evento é o esperado
            if (
              parsedLog.args.payer.toLowerCase() !==
              expectedSender.toLowerCase()
            ) {
              return {
                isValid: false,
                sender: tx.from || "",
                amount: burnAmount,
                timestamp: burnTimestamp,
                error: "Event payer doesn't match expected sender",
              };
            }

            break;
          }
        } catch (parseError) {
          console.warn("Error parsing log:", parseError);
          continue;
        }
      }
    }

    if (!eventFound) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: "0",
        timestamp: block.timestamp,
        error: "VerifiedTokensBurned event not found",
      };
    }

    // 9. Verificar se o amount está correto
    if (BigInt(burnAmount) !== BigInt(expectedAmount)) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: burnAmount,
        timestamp: burnTimestamp,
        error: `Amount mismatch. Expected: ${expectedAmount}, Got: ${burnAmount}`,
      };
    }

    // 10. Verificar se o timestamp está correto
    if (burnTimestamp !== expectedTimestamp) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: burnAmount,
        timestamp: burnTimestamp,
        error: `Timestamp mismatch. Expected: ${expectedTimestamp}, Got: ${burnTimestamp}`,
      };
    }

    return {
      isValid: true,
      sender: tx.from || "",
      amount: burnAmount,
      timestamp: burnTimestamp,
    };
  } catch (error) {
    console.error("Error validating verified burn transaction:", error);
    return {
      isValid: false,
      sender: "",
      amount: "0",
      timestamp: 0,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

// Validação da taxa BNB (mantida do sistema anterior)
async function validateBnbFeeTransaction(
  txHash: string,
  expectedSender: string,
  expectedRecipient: string,
  expectedAmountUSD: number,
  bnbPriceUSD: number
): Promise<TransactionValidation> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // 1. Buscar a transação
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return {
        isValid: false,
        sender: "",
        amount: "0",
        timestamp: 0,
        error: "BNB fee transaction not found",
      };
    }

    // 2. Verificar se a transação foi confirmada
    if (!tx.blockNumber) {
      return {
        isValid: false,
        sender: "",
        amount: "0",
        timestamp: 0,
        error: "BNB fee transaction not confirmed",
      };
    }

    // 3. Buscar o receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.status) {
      return {
        isValid: false,
        sender: "",
        amount: "0",
        timestamp: 0,
        error: "BNB fee transaction failed",
      };
    }

    // 4. Verificar se o sender é o esperado
    if (tx.from?.toLowerCase() !== expectedSender.toLowerCase()) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: "0",
        timestamp: 0,
        error: "Invalid BNB fee sender",
      };
    }

    // 5. Verificar se o recipient é o esperado (treasury wallet)
    if (tx.to?.toLowerCase() !== expectedRecipient.toLowerCase()) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: "0",
        timestamp: 0,
        error: "BNB fee not sent to treasury wallet",
      };
    }

    // 6. Buscar o timestamp do bloco
    const block = await provider.getBlock(tx.blockNumber);
    if (!block) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: "0",
        timestamp: 0,
        error: "Block not found for BNB fee transaction",
      };
    }

    // 7. Verificar se a transação não é muito antiga
    const currentTime = Math.floor(Date.now() / 1000);
    const transactionAge = (currentTime - block.timestamp) * 1000;

    if (transactionAge > MAX_TRANSACTION_AGE_MS) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: tx.value?.toString() || "0",
        timestamp: block.timestamp,
        error: `BNB fee transaction too old: ${Math.floor(
          transactionAge / 1000 / 60
        )} minutes ago`,
      };
    }

    // 8. Verificar o valor enviado
    const sentAmountBNB = Number(ethers.formatEther(tx.value || 0));
    const expectedAmountBNB = expectedAmountUSD / bnbPriceUSD;

    // Tolerância de 5% para variações de preço durante a transação
    const tolerance = 0.05;
    const minExpected = expectedAmountBNB * (1 - tolerance);
    const maxExpected = expectedAmountBNB * (1 + tolerance);

    console.log("🔍 BNB Fee validation:", {
      expectedAmountUSD,
      bnbPriceUSD,
      expectedAmountBNB,
      sentAmountBNB,
      minExpected,
      maxExpected,
      withinRange: sentAmountBNB >= minExpected && sentAmountBNB <= maxExpected,
    });

    if (sentAmountBNB < minExpected || sentAmountBNB > maxExpected) {
      return {
        isValid: false,
        sender: tx.from || "",
        amount: tx.value?.toString() || "0",
        timestamp: block.timestamp,
        error: `BNB fee amount mismatch. Expected: ${expectedAmountBNB.toFixed(
          6
        )} BNB (±5%), Got: ${sentAmountBNB.toFixed(6)} BNB`,
      };
    }

    return {
      isValid: true,
      sender: tx.from || "",
      amount: tx.value?.toString() || "0",
      timestamp: block.timestamp,
    };
  } catch (error) {
    console.error("Error validating BNB fee transaction:", error);
    return {
      isValid: false,
      sender: "",
      amount: "0",
      timestamp: 0,
      error:
        error instanceof Error
          ? error.message
          : "Unknown BNB fee validation error",
    };
  }
}

async function checkTransactionReplay(txHash: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase not configured, skipping replay check");
    return false; // Assumir que não é replay se não puder verificar
  }

  try {
    const { data, error } = await supabase
      .from("purchases")
      .select("id")
      .eq("transaction_signature", txHash)
      .limit(1);

    if (error) {
      console.error("Error checking transaction replay:", error);
      return false; // Em caso de erro, assumir que não é replay
    }

    return data && data.length > 0; // True se já existe
  } catch (error) {
    console.error("Error in replay check:", error);
    return false;
  }
}

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
      amount,
      timestamp,
      txHash,
      signature,
      clientSeed,
      bnbFeeTransactionHash,
      bnbPrice,
      boxType,
    } = body;

    if (
      !userWalletAddress ||
      !amount ||
      !timestamp ||
      !txHash ||
      !signature ||
      !clientSeed
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // VALIDAÇÕES DE SEGURANÇA DAS TRANSAÇÕES

    // 1. Validar assinatura do servidor
    console.log("🔐 Validating server signature...");
    const isSignatureValid = await validateServerSignature(
      userWalletAddress,
      amount,
      timestamp,
      signature
    );

    if (!isSignatureValid) {
      console.error("❌ Invalid server signature");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid server signature",
        },
        { status: 400 }
      );
    }

    console.log("✅ Server signature validation successful");

    // 2. Verificar se são replay attacks
    console.log("🔍 Checking for replay attacks...");
    const isBurnReplay = await checkTransactionReplay(txHash);
    const isFeeReplay = bnbFeeTransactionHash
      ? await checkTransactionReplay(bnbFeeTransactionHash)
      : false;

    if (isBurnReplay) {
      console.error("⚠️  Burn transaction replay attack detected:", txHash);
      return NextResponse.json(
        {
          success: false,
          error: "Burn transaction already used (replay attack detected)",
        },
        { status: 400 }
      );
    }

    if (isFeeReplay) {
      console.error(
        "⚠️  Fee transaction replay attack detected:",
        bnbFeeTransactionHash
      );
      return NextResponse.json(
        {
          success: false,
          error: "Fee transaction already used (replay attack detected)",
        },
        { status: 400 }
      );
    }

    // 3. Validar a transação de taxa BNB na blockchain (se fornecida)
    if (bnbFeeTransactionHash && bnbPrice) {
      const isCrypto = boxType === 1;
      const expectedFeeUSD = isCrypto ? 1.65 : 7.65;
      const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;

      if (!treasuryWallet) {
        return NextResponse.json(
          {
            success: false,
            error: "Treasury wallet not configured",
          },
          { status: 500 }
        );
      }

      console.log("🔍 Validating BNB fee transaction on blockchain...");
      const feeValidation = await validateBnbFeeTransaction(
        bnbFeeTransactionHash,
        userWalletAddress,
        treasuryWallet,
        expectedFeeUSD,
        bnbPrice
      );

      if (!feeValidation.isValid) {
        console.error(
          "❌ BNB fee transaction validation failed:",
          feeValidation.error
        );
        return NextResponse.json(
          {
            success: false,
            error: `BNB fee validation failed: ${feeValidation.error}`,
          },
          { status: 400 }
        );
      }

      console.log("✅ BNB fee transaction validation successful:", {
        sender: feeValidation.sender,
        amount: feeValidation.amount,
        timestamp: new Date(feeValidation.timestamp * 1000).toISOString(),
      });
    }

    // 4. Validar a transação de queima verificada na blockchain
    console.log("🔍 Validating verified burn transaction on blockchain...");
    const burnValidation = await validateVerifiedBurnTransaction(
      txHash,
      userWalletAddress,
      amount,
      timestamp
    );

    if (!burnValidation.isValid) {
      console.error(
        "❌ Verified burn transaction validation failed:",
        burnValidation.error
      );
      return NextResponse.json(
        {
          success: false,
          error: `Verified burn validation failed: ${burnValidation.error}`,
        },
        { status: 400 }
      );
    }

    console.log("✅ Verified burn transaction validation successful:", {
      sender: burnValidation.sender,
      amount: burnValidation.amount,
      timestamp: new Date(burnValidation.timestamp * 1000).toISOString(),
    });

    // Continuar com o processamento do prêmio...
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

    // Determinar se é crypto baseado no amount
    const isCrypto = amount <= 8750 * 1e9; // 8750 tokens = crypto box
    const { prizeId, wonPrize } = await determinePrize(randomNumber, isCrypto);

    // Atualizar estoque de caixas
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
    const nftMetadata = `https://imperadortoken.com/metadata/${wonPrize.metadata}.json`;

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

    // Salvar registro da compra
    await savePurchaseRecord(
      userWalletAddress,
      nftMint,
      nftMetadata,
      txHash,
      prizeId,
      wonPrize.name,
      randomNumber,
      clientSeed,
      serverSeed,
      nonce,
      boxType || (isCrypto ? 1 : 2),
      isCrypto,
      amount,
      burnValidation,
      bnbFeeTransactionHash || "",
      signature
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
      randomData: {
        randomNumber,
        clientSeed,
        serverSeed,
        nonce,
      },
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
  tokenAmount: number,
  burnValidation: TransactionValidation,
  bnbFeeTransactionHash: string,
  signature: string
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
          validation_amount: burnValidation.amount,
          bnb_fee_transaction_hash: bnbFeeTransactionHash,
          server_signature: signature,
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
    const uri = `https://www.imperadortoken.com/metadata/${prize.metadata}.json`;
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
