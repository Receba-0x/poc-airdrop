import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

const SECRET = process.env.SIGN_SECRET || 'supersecretkey';
const TOKEN_ID = 'solana';
const USD_PRICE = 20;

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

    const payload = {
      itemId,
      wallet,
      tokenAmount,
      timestamp: Date.now(),
    };

    const signature = crypto
      .createHmac('sha256', SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    return NextResponse.json({ ...payload, signature });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
