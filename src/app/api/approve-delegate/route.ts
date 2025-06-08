import { NextRequest, NextResponse } from 'next/server';
import { 
  clusterApiUrl, 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction 
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createApproveInstruction 
} from '@solana/spl-token';
import bs58 from 'bs58';

// Configurações
const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const OPERATOR_PUBLIC_KEY = process.env.PRIVATE_KEY 
  ? new PublicKey(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY)).publicKey)
  : new PublicKey('11111111111111111111111111111111'); // Fallback para evitar erros

/**
 * Endpoint para gerar uma transação que aprova o servidor como delegado para uma NFT
 * O usuário precisa assinar esta transação com sua carteira
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

    // Configurar conexão
    const connection = new Connection(clusterApiUrl(NETWORK as any), 'confirmed');
    
    // Converter strings para PublicKey
    const mintPublicKey = new PublicKey(nftMint);
    const ownerPublicKey = new PublicKey(walletAddress);
    
    // Obter a conta ATA para o NFT
    const nftTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      ownerPublicKey
    );
    
    // Verificar se a conta existe
    try {
      const accountInfo = await connection.getAccountInfo(nftTokenAccount);
      if (!accountInfo) {
        return NextResponse.json(
          { success: false, error: 'Conta de token não encontrada' },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error('Erro ao verificar conta de token:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar conta de token' },
        { status: 500 }
      );
    }
    
    // Criar instrução de aprovação
    const approveInstruction = createApproveInstruction(
      nftTokenAccount,        // conta do token
      OPERATOR_PUBLIC_KEY,    // delegado (nosso servidor)
      ownerPublicKey,         // proprietário/autoridade
      1                       // quantidade (1 para NFT)
    );

    // Criar transação
    const transaction = new Transaction().add(approveInstruction);
    
    // Obter blockhash recente
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    
    // Definir o pagador da taxa
    transaction.feePayer = ownerPublicKey;
    
    // Serializar transação para enviar ao frontend
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
    const base64Transaction = serializedTransaction.toString('base64');

    return NextResponse.json({
      success: true,
      transaction: base64Transaction,
      message: 'Transação de aprovação gerada com sucesso',
      delegateKey: OPERATOR_PUBLIC_KEY.toString(),
      nftTokenAccount: nftTokenAccount.toString()
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar transação de aprovação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 