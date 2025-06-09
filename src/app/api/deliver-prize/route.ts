import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prizeId, recipient, amount, type } = body;
    
    if (!prizeId || !recipient || amount === undefined || !type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing parameters' 
      }, { status: 400 });
    }
    
    // Only support SOL prizes for now
    if (type !== 'sol') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only SOL prizes are supported currently' 
      }, { status: 400 });
    }
    
    // Validate recipient address
    let recipientPubkey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid recipient address' 
      }, { status: 400 });
    }
    
    let treasuryKeypair;
    try {
      const privateKeyString = process.env.PRIVATE_KEY;
      
      if (!privateKeyString) {
        throw new Error('No private key found in environment variables');
      }
      
      const privateKey = bs58.decode(privateKeyString);
      treasuryKeypair = Keypair.fromSecretKey(privateKey);
      
      console.log(`Using treasury wallet: ${treasuryKeypair.publicKey.toString()}`);
    } catch (error) {
      console.error('Failed to load treasury keypair:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Treasury wallet configuration error' 
      }, { status: 500 });
    }
    
    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    // Create SOL transfer transaction
    const solAmount = amount * 1_000_000_000; // Convert SOL to lamports
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: solAmount,
      })
    );
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = treasuryKeypair.publicKey;
    try {
      transaction.sign(treasuryKeypair);
      const signature = await connection.sendRawTransaction(transaction.serialize());
      console.log(`✅ Prize delivery transaction sent: ${signature}`);
      
      return NextResponse.json({
        success: true,
        txSignature: signature,
        amount,
        recipient,
        prizeId
      });
    } catch (error) {
      console.error('Failed to send transaction:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction failed to send' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Prize delivery error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 