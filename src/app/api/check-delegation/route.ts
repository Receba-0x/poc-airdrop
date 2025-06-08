import { NextRequest, NextResponse } from 'next/server';
import { 
  clusterApiUrl, 
  Connection, 
  Keypair, 
  PublicKey 
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  getAccount 
} from '@solana/spl-token';
import bs58 from 'bs58';

// Configurações
const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const OPERATOR_KEYPAIR = process.env.PRIVATE_KEY
  ? Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY))
  : null;

/**
 * Endpoint para verificar se o servidor é delegado para um NFT específico
 */
export async function POST(request: NextRequest) {
  try {
    const { nftMint, walletAddress } = await request.json();

    if (!nftMint || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'NFT mint e wallet address são obrigatórios' },
        { status: 400 }
      );
    }

    if (!OPERATOR_KEYPAIR) {
      return NextResponse.json(
        { success: false, error: 'Chave do operador não configurada no servidor' },
        { status: 500 }
      );
    }

    // Configurar conexão
    const connection = new Connection(clusterApiUrl(NETWORK as any), 'confirmed');
    
    // Converter strings para PublicKey
    const mintPublicKey = new PublicKey(nftMint);
    const ownerPublicKey = new PublicKey(walletAddress);
    const operatorPublicKey = OPERATOR_KEYPAIR.publicKey;
    
    // Obter a conta ATA para o NFT
    const nftTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      ownerPublicKey
    );
    
    // Verificar se a conta existe
    try {
      // Obter informações da conta de token
      const tokenAccountInfo = await getAccount(connection, nftTokenAccount);
      
      // Verificar se o servidor é delegado
      let isDelegate = false;
      if (tokenAccountInfo.delegate !== null) {
        isDelegate = tokenAccountInfo.delegate.equals(operatorPublicKey) && 
                     tokenAccountInfo.delegatedAmount >= BigInt(1);
      }
      
      return NextResponse.json({
        success: true,
        isDelegated: isDelegate,
        delegateInfo: isDelegate ? {
          delegate: tokenAccountInfo.delegate?.toString() || '',
          delegatedAmount: tokenAccountInfo.delegatedAmount.toString()
        } : null,
        tokenAccount: nftTokenAccount.toString()
      });
      
    } catch (error: any) {
      if (error.name === 'TokenAccountNotFoundError') {
        return NextResponse.json(
          { success: false, error: 'Conta de token NFT não encontrada', isDelegated: false },
          { status: 404 }
        );
      } else {
        console.error('Erro ao verificar conta de token:', error);
        return NextResponse.json(
          { success: false, error: `Erro ao verificar conta de token: ${error.message}`, isDelegated: false },
          { status: 500 }
        );
      }
    }
    
  } catch (error: any) {
    console.error('Erro ao verificar delegação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor', isDelegated: false },
      { status: 500 }
    );
  }
} 