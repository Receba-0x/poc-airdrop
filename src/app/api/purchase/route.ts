import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const TOKEN_ID = 'solana';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boxType, wallet } = body;
    if (!boxType || !wallet) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_ID}&vs_currencies=usd`
    );
    const tokenPrice = data?.[TOKEN_ID]?.usd;
    if (!tokenPrice) {
      return NextResponse.json({ error: 'Token price not found' }, { status: 500 });
    }
    const boxPrice = boxType === 1 ? 45 : 45;
    const tokenAmount = Math.floor((boxPrice / tokenPrice) * 1e9);

    const privateKey = bs58.decode(process.env.PRIVATE_KEY!);
    const keypair = nacl.sign.keyPair.fromSecretKey(privateKey);
    const timestamp = Math.floor(Date.now() / 1000);
    const backendPubkey = bs58.encode(keypair.publicKey);

    const messagePayload = {
      wallet,
      amount: tokenAmount,
      timestamp,
    };
    const message = JSON.stringify(messagePayload);
    const signature = nacl.sign.detached(Buffer.from(message), keypair.secretKey);

    return NextResponse.json({
      boxType,
      wallet,
      tokenAmount,
      timestamp,
      signature: Array.from(signature),
      backendPubkey,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}