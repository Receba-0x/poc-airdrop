import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

export const runtime = "nodejs";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boxType, wallet, clientSeed } = body;

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

    const isCrypto = boxType === 1;
    const priceUSD = isCrypto ? 17.5 : 45;
    const tokenPrice = 0.002;
    const amountInTokens = priceUSD / tokenPrice;
    const amountToBurn = ethers.parseUnits(amountInTokens.toString(), 18);
    const timestamp = Math.floor(Date.now() / 1000);
    const walletBytes = ethers.getBytes(wallet);
    const amountBytes = ethers.toBeHex(amountToBurn, 32);
    const timestampBytes = ethers.toBeHex(timestamp, 32);
    const packedData = ethers.concat([
      walletBytes,
      amountBytes,
      timestampBytes,
    ]);
    const messageHash = ethers.keccak256(packedData);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

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
      amountToBurn: amountToBurn.toString(),
      timestamp,
      signature,
      clientSeed,
      tokenAmount: amountToBurn.toString(),
    });
  } catch (error) {
    console.error("Error in purchase API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
