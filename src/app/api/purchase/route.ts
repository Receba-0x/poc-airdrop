import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const TOKEN_ID = 'solana';
const USD_PRICE = 20;

const PRIVATE_KEY_BASE58 = process.env.BACKEND_PRIVATE_KEY!;
const privateKeyUint8 = bs58.decode(PRIVATE_KEY_BASE58);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, wallet } = body;
    if (!itemId || !wallet) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_ID}&vs_currencies=usd`
    );
    const tokenPrice = data?.[TOKEN_ID]?.usd;
    if (!tokenPrice) {
      return NextResponse.json({ error: 'Token price not found' }, { status: 500 });
    }
    const tokenAmount = (USD_PRICE / tokenPrice).toFixed(6);
    const timestamp = Date.now();
    const message = `${wallet}:${tokenAmount}:${timestamp}`;
    const messageBytes = new TextEncoder().encode(message);

    const signature = nacl.sign.detached(messageBytes, privateKeyUint8);
    const signatureBase58 = bs58.encode(signature);

    return NextResponse.json({
      itemId,
      wallet,
      tokenAmount,
      timestamp,
      signature: signatureBase58,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}