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

async function burnNFT(nftMint: string, ownerWallet: string): Promise<string | null> {
  try {
    const nftMintPublicKey = new PublicKey(nftMint);
    const originalOwner = new PublicKey(ownerWallet);
    const operatorKeypair = Keypair.fromSecretKey(bs58.decode(solanaPrivateKey || ''));
    const connection = new Connection(clusterApiUrl(NETWORK as any), 'confirmed');
    const operatorBalance = await connection.getBalance(operatorKeypair.publicKey);
    if (operatorBalance < 10000000) {
      console.error('Aviso: Saldo muito baixo para pagar taxas na carteira do operador');
      return null;
    }
    const nftTokenAccount = await getAssociatedTokenAddress(
      nftMintPublicKey,
      originalOwner
    );
    try {
      const tokenAccountInfo = await getAccount(connection, nftTokenAccount);
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
      if (!tokenAccountInfo.owner.equals(originalOwner)) {
        console.error(`O proprietário informado ${originalOwner.toString()} não é o dono da conta do token NFT. Dono atual: ${tokenAccountInfo.owner.toString()}`);
        return null;
      }
      if (tokenAccountInfo.amount < BigInt(1)) {
        console.error(`Quantidade insuficiente de tokens. Saldo atual: ${tokenAccountInfo.amount.toString()}`);
        return null;
      }
      const burnInstruction = createBurnCheckedInstruction(
        nftTokenAccount,
        nftMintPublicKey,
        operatorKeypair.publicKey,
        1,
        0
      );
      const transaction = new Transaction().add(burnInstruction);
      transaction.feePayer = operatorKeypair.publicKey;

      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.sign(operatorKeypair);
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
    const { data: existingAddress, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar endereço existente:', error);
      return null;
    }
    return existingAddress;
  }

  if (!details || !details.fullName || !details.country || !details.streetAddress ||
    !details.city || !details.stateProvince || !details.zipCode ||
    !details.phoneNumber || !details.email) {
    console.error('Dados de endereço incompletos:', details);
    return null;
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

  try {
    const { data: newAddress, error } = await supabase
      .from('shipping_addresses')
      .insert(addressData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar novo endereço:', error);
      return null;
    }

    return newAddress;
  } catch (insertError) {
    console.error('Exceção ao inserir novo endereço:', insertError);
    return null;
  }
}

async function updatePurchaseStatus(transactionId: string, wallet: string, addressId: number | null, burnSignature: string | null) {
  if (!supabase) return null;
  const updateData: any = {
    status: 'claimed',
    claimed: true,
    claimed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (addressId) {
    updateData.shipping_address_id = addressId;
  }

  if (burnSignature) {
    updateData.burn_signature = burnSignature;
  }

  try {
    const { error: updateError } = await supabase
      .from('purchases')
      .update(updateData)
      .eq('nft_mint', transactionId)
      .eq('wallet_address', wallet);

    if (updateError) {
      console.error('Erro ao atualizar status da compra:', updateError);
      return null;
    }

    const { data: updatedRecord, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('nft_mint', transactionId)
      .eq('wallet_address', wallet)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar registro atualizado:', fetchError);
      return null;
    }
    return updatedRecord;
  } catch (error) {
    console.error('Erro inesperado ao atualizar status da compra:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      walletAddress,
      transactionId,
      itemName,
      shippingDetails,
      useExistingAddress,
      addressId,
      teamSelected
    } = await request.json();

    if (!walletAddress || !transactionId || !itemName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isPrizeJersey = itemName.toLowerCase().includes('jersey') || itemName.toLowerCase().includes('camisa');
    if (isPrizeJersey && !teamSelected) {
      return NextResponse.json(
        { success: false, error: 'Team selection is required for jersey prizes' },
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
      if (useExistingAddress && addressId) {
        const { data: specificAddress, error } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('id', addressId)
          .single();

        if (error) {
          console.error('Erro ao buscar endereço específico:', error);
        } else if (specificAddress) {
          shippingAddressId = specificAddress.id;
          shippingAddressData = specificAddress;
        }
      } else {
        shippingAddressData = await getOrCreateShippingAddress(
          walletAddress,
          shippingDetails,
          useExistingAddress === true,
        );

        if (shippingAddressData) {
          shippingAddressId = shippingAddressData.id;
        }
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
        const updateData: any = {
          shippingAddressId,
          burnSignature
        };
        if (isPrizeJersey && teamSelected) updateData.teamSelected = teamSelected;
        await updatePurchaseStatus(transactionId, walletAddress, shippingAddressId, burnSignature);

        if (isPrizeJersey && teamSelected && supabase) {
          try {
            await supabase
              .from('purchases')
              .update({ team_selected: teamSelected })
              .eq('nft_mint', transactionId)
              .eq('wallet_address', walletAddress);
          } catch (teamError) {
            console.error('Erro ao salvar time selecionado:', teamError);
          }
        }

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
      transactionId,
      teamSelected
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