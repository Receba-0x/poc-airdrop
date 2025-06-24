import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boxType, wallet, clientSeed } = body;

    if (!boxType || !wallet) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const userSeed = clientSeed || wallet;
    const boxPrice = boxType === 1 ? 17.5 : 45;
    const tokenPrice = 0.002;
    const boxPriceInSol = boxPrice / tokenPrice;
    const tokenAmount = Number(boxPriceInSol * 1e9);

    return NextResponse.json({
      boxType,
      wallet,
      tokenAmount,
      clientSeed: userSeed,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
