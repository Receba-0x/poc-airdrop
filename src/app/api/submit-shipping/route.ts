import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const solanaPrivateKey = process.env.PRIVATE_KEY;
const NETWORK = process.env.SOLANA_NETWORK || 'devnet';

const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

/**
 * Queima um NFT utilizando o método de operador delegado
 * Esse método requer que o servidor tenha sido previamente aprovado como delegado
 * para o NFT específico pelo proprietário.
 */
async function burnNFT(nftMint: string, ownerWallet: string): Promise<string | null> {
  try {
    console.log('Iniciando processo de burn NFT como operador delegado...');
    
    // Converter strings para PublicKey
    const nftMintPublicKey = new PublicKey(nftMint);
    const originalOwner = new PublicKey(ownerWallet);
    
    // Carregar chave privada do operador/servidor
    const operatorKeypair = Keypair.fromSecretKey(bs58.decode(solanaPrivateKey || ''));
    console.log('Usando operador:', operatorKeypair.publicKey.toString());
    
    // Configurar conexão com a Solana
    const connection = new Connection(clusterApiUrl(NETWORK as any), 'confirmed');
    
    // Verificar se a carteira do operador tem SOL para pagar taxas
    const operatorBalance = await connection.getBalance(operatorKeypair.publicKey);
    console.log(`Saldo do operador: ${operatorBalance / 1e9} SOL`);
    if (operatorBalance < 10000000) { // 0.01 SOL
      console.error('Aviso: Saldo muito baixo para pagar taxas na carteira do operador');
      return null;
    }
    
    // Verificar saldo do proprietário também
    const ownerBalance = await connection.getBalance(originalOwner);
    console.log(`Saldo do proprietário: ${ownerBalance / 1e9} SOL`);
    
    // Obter a conta ATA para o NFT
    const nftTokenAccount = await getAssociatedTokenAddress(
      nftMintPublicKey,
      originalOwner
    );
    console.log('Conta do Token NFT:', nftTokenAccount.toString());
    
    // Verificar informações detalhadas sobre o mint
    try {
      const mintInfo = await connection.getAccountInfo(nftMintPublicKey);
      console.log('Mint Info:', mintInfo ? 'Encontrado' : 'Não encontrado', 
                  mintInfo ? `Tamanho: ${mintInfo.data.length} bytes` : '');
    } catch (e) {
      console.error('Erro ao verificar mint info:', e);
    }
    
    // Verificar se o operador tem delegação para esta conta
    try {
      // Obter informações da conta de token
      const tokenAccountInfo = await getAccount(connection, nftTokenAccount);
      
      // Log detalhado sobre a conta de token
      console.log('Detalhes da conta de token:');
      console.log(`- Proprietário: ${tokenAccountInfo.owner.toString()}`);
      console.log(`- Mint: ${tokenAccountInfo.mint.toString()}`);
      console.log(`- Quantidade: ${tokenAccountInfo.amount.toString()}`);
      console.log(`- Delegado: ${tokenAccountInfo.delegate ? tokenAccountInfo.delegate.toString() : 'Nenhum'}`);
      console.log(`- Quantidade delegada: ${tokenAccountInfo.delegatedAmount.toString()}`);
      console.log(`- Está congelada: ${tokenAccountInfo.isFrozen}`);
      
      // Verificar se o servidor é delegado
      if (tokenAccountInfo.delegate === null) {
        console.error('O operador não é um delegado: nenhum delegado configurado');
        return null;
      }
      
      if (!tokenAccountInfo.delegate.equals(operatorKeypair.publicKey)) {
        console.error(`O delegado configurado não é este operador. Delegado atual: ${tokenAccountInfo.delegate.toString()}`);
        return null;
      }
      
      if (tokenAccountInfo.delegatedAmount < BigInt(1)) {
        console.error('Quantidade delegada insuficiente');
        return null;
      }
      
      // Verificar proprietário
      if (!tokenAccountInfo.owner.equals(originalOwner)) {
        console.error(`O proprietário informado ${originalOwner.toString()} não é o dono da conta do token NFT. Dono atual: ${tokenAccountInfo.owner.toString()}`);
        return null;
      }
      
      // Verificar se o NFT tem saldo suficiente (deve ser 1 para NFTs)
      if (tokenAccountInfo.amount < BigInt(1)) {
        console.error(`Quantidade insuficiente de tokens. Saldo atual: ${tokenAccountInfo.amount.toString()}`);
        return null;
      }
      
      console.log('✓ Todas as verificações passaram, procedendo com a queima...');
      
      // IMPORTANTE: Quando queimamos via delegação, precisamos usar o delegado como autoridade
      // e o operadorKeypair como signatário
      console.log('Criando instrução burn com delegado como autoridade');
      
      // Criar instrução de queima via SPL Token com verificação de decimais
      const burnInstruction = createBurnCheckedInstruction(
        nftTokenAccount,                // Conta do token
        nftMintPublicKey,               // Mint
        operatorKeypair.publicKey,      // Autoridade (delegado)
        1,                              // Quantidade (1 para NFT)
        0                               // Decimais (0 para NFT)
      );
      
      // Criar e assinar transação
      const transaction = new Transaction().add(burnInstruction);
      transaction.feePayer = operatorKeypair.publicKey;
      
      // Obter blockhash recente
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      
      // Assinar transação com a chave do operador
      transaction.sign(operatorKeypair);
      
      // Simular a transação antes de enviar
      console.log('Simulando transação...');
      try {
        const simulation = await connection.simulateTransaction(transaction);
        if (simulation.value.err) {
          console.error('Simulação falhou:', simulation.value.err);
          console.log('Logs da simulação:', simulation.value.logs);
          
          // Se a simulação falhar, pode ser um problema com a delegação
          // Em último caso, podemos tentar verificar o token mais detalhadamente
          console.log('Verificação adicional do token...');
          const tokenInfo = await connection.getAccountInfo(nftTokenAccount);
          console.log('Token account raw data available:', tokenInfo !== null);
        } else {
          console.log('Simulação bem-sucedida');
        }
      } catch (simError) {
        console.error('Erro ao simular transação:', simError);
      }
      
      // Enviar e confirmar transação
      console.log('Enviando transação de burn...');
      try {
        const signature = await connection.sendRawTransaction(transaction.serialize(), {
          skipPreflight: false // Executar verificações prévias
        });
        console.log('Transação enviada:', signature);
        
        // Aguardar confirmação
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        if (confirmation.value.err) {
          console.error('Erro na confirmação:', confirmation.value.err);
          return null;
        }
        
        console.log('Transação confirmada! NFT queimada com sucesso pelo operador');
        return signature;
      } catch (sendError: any) {
        // Capturar e logar detalhes de erro de envio
        console.error('Erro ao enviar transação:', sendError.message);
        if (sendError.logs) {
          console.error('Logs de erro:', sendError.logs);
        }
        return null;
      }
      
    } catch (error: any) {
      if (error.name === 'TokenAccountNotFoundError') {
        console.error(`Conta de token NFT não encontrada: ${nftTokenAccount.toString()}`);
      } else {
        console.error('Erro durante verificação ou queima:', error);
      }
      return null;
    }
  } catch (error) {
    console.error('Erro ao processar burn NFT:', error);
    return null;
  }
}

async function getOrCreateShippingAddress(wallet: string, details: any, useExisting: boolean) {
  if (!supabase) return null;
  
  if (useExisting) {
    const { data: existingAddress } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    return existingAddress;
  }
  
  const addressData = {
    wallet_address: wallet,
    full_name: details.fullName,
    country: details.country,
    street_address: details.streetAddress,
    apartment: details.apartment || null,
    city: details.city,
    state_province: details.stateProvince,
    zip_code: details.zipCode,
    phone_number: details.phoneNumber,
    email: details.email,
    created_at: new Date().toISOString()
  };
  
  const { data: newAddress, error } = await supabase
    .from('shipping_addresses')
    .insert(addressData)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao salvar endereço:', error);
    return null;
  }
  
  return newAddress;
}

async function updatePurchaseStatus(transactionId: string, wallet: string, addressId: number | null, burnSignature: string | null) {
  if (!supabase) return null;
  
  const updateData: any = {
    status: 'claimed',
    updated_at: new Date().toISOString()
  };
  
  if (addressId) {
    updateData.shipping_address_id = addressId;
  }
  
  if (burnSignature) {
    updateData.burn_signature = burnSignature;
  }
  
  const { data, error } = await supabase
    .from('purchases')
    .update(updateData)
    .eq('nft_mint', transactionId)
    .eq('wallet_address', wallet)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar compra:', error);
    return null;
  }
  
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const {
      walletAddress,
      transactionId,
      itemName,
      shippingDetails,
      timestamp,
      useExistingAddress
    } = await request.json();

    if (!walletAddress || !transactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: true,
        message: 'Shipping data logged successfully (database not configured)',
      });
    }

    let shippingAddressId = null;
    let shippingAddressData = null;
    
    try {
      shippingAddressData = await getOrCreateShippingAddress(
        walletAddress, 
        shippingDetails, 
        useExistingAddress === true
      );
      
      if (shippingAddressData) {
        shippingAddressId = shippingAddressData.id;
        console.log(`Endereço ${useExistingAddress ? 'existente' : 'novo'} processado com ID: ${shippingAddressId}`);
      }
    } catch (addressError: any) {
      console.error('Erro ao processar endereço de envio:', addressError);
    }

    console.log(`Tentando queimar NFT ${transactionId} para a carteira ${walletAddress}...`);
    let burnSignature = null;
    let burnError = null;

    try {
      burnSignature = await burnNFT(transactionId, walletAddress);
      if (!burnSignature) {
        burnError = 'Falha ao queimar o NFT - verificar logs para detalhes';
      } else {
        console.log(`NFT queimado com sucesso. Assinatura: ${burnSignature}`);
        
        await updatePurchaseStatus(transactionId, walletAddress, shippingAddressId, burnSignature);
        console.log('Status da compra atualizado no banco de dados');
      }
    } catch (error: any) {
      console.error('Erro durante a queima do NFT:', error);
      burnError = error.message || 'Erro desconhecido durante a queima do NFT';
    }

    return NextResponse.json({
      success: true,
      message: 'Shipping information processed successfully',
      useExistingAddress,
      addressSaved: !!shippingAddressId,
      addressId: shippingAddressId,
      burnSignature,
      burnError,
      transactionId
    });
  } catch (error: any) {
    console.error('Error processing shipping submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
} 