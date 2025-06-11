import { NextResponse } from "next/server";
import {
  PublicKey,
  SystemProgram,
  Connection,
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  COLLECTION_METADATA,
  COLLECTION_NAME,
  COLLECTION_SYMBOL,
  COLLECTION_URI,
  CONFIG_ACCOUNT,
  PROGRAM_ID,
  PRIZE_TABLE,
  CRYPTO_PRIZE_TABLE,
  METAPLEX_PROGRAM_ID,
  PAYMENT_TOKEN_MINT,
} from "@/constants";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import bs58 from "bs58";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

export const runtime = "nodejs";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const PHYSICAL_PRIZES = [5, 6, 7, 8, 9, 10];
const NFT_PRIZES = [5, 6, 7, 8, 9, 10];

const ADMIN_PRIVATE_KEY = process.env.PRIVATE_KEY;
const ADMIN_PRIVATE_KEY_ARRAY = process.env.PRIVATE_KEY_ARRAY;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

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
  let stock: { [key: number]: number } = {};

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

    let prizeDeliveryTx = null;
    let nftMint = null;
    let nftMetadata = null;

    if (wonPrize.type === "sol") {
      prizeDeliveryTx = await deliverSolPrize(userWalletAddress, wonPrize);
    } else if (NFT_PRIZES.includes(prizeId)) {
      try {
        const { txSignature, mintAddress, metadataAddress } = await mintNFT(
          userWalletAddress,
          wonPrize
        );
        prizeDeliveryTx = txSignature;
        nftMint = mintAddress;
        nftMetadata = metadataAddress;
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
      transactionSignature,
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

async function deliverSolPrize(recipient: string, prize: any) {
  try {
    if (!prize.amount || prize.amount <= 0) {
      console.error(`Invalid SOL prize amount: ${prize.amount}`);
      return false;
    }

    if (!ADMIN_PRIVATE_KEY && !ADMIN_PRIVATE_KEY_ARRAY) {
      console.error("Server private key not found");
      return false;
    }

    const recipientPubkey = new PublicKey(recipient);
    const connection = new Connection(RPC_URL, "confirmed");

    const adminKeypair = getAdminKeypair();

    const lamportsToSend = Math.floor(prize.amount * LAMPORTS_PER_SOL);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: adminKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: lamportsToSend,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = adminKeypair.publicKey;
    transaction.sign(adminKeypair);

    const txSignature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    await connection.confirmTransaction({
      signature: txSignature,
      blockhash,
      lastValidBlockHeight: (await connection.getBlockHeight()) + 150,
    });

    if (isSupabaseConfigured && supabase) {
      await supabase.from("sol_prizes_delivered").insert([
        {
          wallet: recipient,
          amount: prize.amount,
          transaction_signature: txSignature,
          prize_id: prize.id,
          prize_name: prize.name,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    return txSignature;
  } catch (error) {
    console.error("❌ Erro ao entregar prêmio em SOL:", error);

    if (isSupabaseConfigured && supabase) {
      await supabase.from("delivery_errors").insert([
        {
          wallet: recipient,
          prize_id: prize.id,
          prize_name: prize.name,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    return false;
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
    let finalTxSignature = transactionSignature;
    if (!finalTxSignature || finalTxSignature.trim() === "") {
      finalTxSignature = `internal_${Date.now()}_${wallet.substring(
        0,
        8
      )}_${Math.floor(randomNumber * 1000000)}`;
    }

    const { error } = await supabase
      .from("purchases")
      .insert([
        {
          wallet_address: wallet,
          nft_mint: nftMint,
          nft_metadata: nftMetadata,
          amount_purchased: tokenAmount.toFixed(4),
          token_amount_burned: tokenAmount.toFixed(4),
          transaction_signature: finalTxSignature,
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
): Promise<{
  txSignature: string;
  mintAddress: string;
  metadataAddress: string;
}> {
  try {
    if (!ADMIN_PRIVATE_KEY && !ADMIN_PRIVATE_KEY_ARRAY)
      throw new Error("Server private key not found");

    const connection = new web3.Connection(RPC_URL, "confirmed");
    const adminKeypair = getAdminKeypair();
    const wallet = new NodeWallet(adminKeypair);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    const {
      program,
      nftCounter,
      nftMint,
      nftMetadata,
      collectionMetadata,
      config,
      metaplexMetadata,
    } = await prepareNftAccounts(provider);

    const recipientPubkey = new PublicKey(recipient);
    const recipientTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      recipientPubkey
    );

    console.log(adminKeypair.publicKey.toString());

    const tx = await program.methods
      .mintNftByAuthority(
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        `${COLLECTION_URI}/${prize.metadata}.json`,
        recipientPubkey
      )
      .accounts({
        authority: adminKeypair.publicKey,
        nftCounter,
        nftMint,
        nftMetadata,
        metaplexMetadata,
        recipientTokenAccount,
        recipient,
        collectionMetadata,
        config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: METAPLEX_PROGRAM_ID,
      })
      .rpc();

    await connection.confirmTransaction(tx);

    return {
      txSignature: tx,
      mintAddress: nftMint.toString(),
      metadataAddress: nftMetadata.toString(),
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
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
      new BN(currentCount.toString()).toArrayLike(Buffer, "le", 8),
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

function getAdminKeypair(): web3.Keypair {
  try {
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
