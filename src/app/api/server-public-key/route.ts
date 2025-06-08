import { NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Endpoint para obter a chave pública do servidor
 * Isso é necessário para o frontend verificar delegações
 */
export async function GET() {
  try {
    // Obter a chave privada do servidor das variáveis de ambiente
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: 'Chave privada do servidor não configurada' },
        { status: 500 }
      );
    }
    
    // Criar keypair a partir da chave privada
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    
    // Retornar apenas a chave pública
    return NextResponse.json({
      success: true,
      publicKey: keypair.publicKey.toString(),
      network: process.env.SOLANA_NETWORK || 'devnet'
    });
    
  } catch (error: any) {
    console.error('Erro ao obter chave pública do servidor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 