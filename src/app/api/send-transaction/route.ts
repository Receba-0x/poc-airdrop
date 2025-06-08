import { NextRequest, NextResponse } from 'next/server';
import { clusterApiUrl, Connection } from '@solana/web3.js';

const NETWORK = process.env.SOLANA_NETWORK || 'devnet';

export async function POST(request: NextRequest) {
  try {
    const { signedTransaction } = await request.json();
    if (!signedTransaction || !Array.isArray(signedTransaction)) {
      return NextResponse.json(
        { success: false, error: 'Transação assinada é obrigatória e deve ser um array' },
        { status: 400 }
      );
    }
    const connection = new Connection(clusterApiUrl(NETWORK as any), 'confirmed');
    const transactionBuffer = Buffer.from(signedTransaction);
    const signature = await connection.sendRawTransaction(transactionBuffer);
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    if (confirmation.value.err) {
      console.error('Erro na confirmação da transação:', confirmation.value.err);
      return NextResponse.json(
        { success: false, error: 'Erro ao confirmar transação', details: confirmation.value.err },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      signature,
      message: 'Transação enviada e confirmada com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao enviar transação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 