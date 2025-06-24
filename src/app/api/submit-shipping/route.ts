import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";
import { AdrAbi__factory } from "@/contracts";
import { adrTokenAddress } from "@/constants";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const privateKey = process.env.PRIVATE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseServiceKey;
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function burnNFT(nftMint: string) {
  try {
    if (!privateKey) throw new Error("Private key is not configured");
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const adrContract = AdrAbi__factory.connect(adrTokenAddress, wallet);
    const tx = await adrContract.burnNFTByOperator(nftMint);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Erro ao processar burn NFT:", error);
    return null;
  }
}

async function getOrCreateShippingAddress(
  wallet: string,
  details: any,
  useExisting: boolean
) {
  if (!supabase) return null;

  if (useExisting) {
    const { data: existingAddress, error } = await supabase
      .from("shipping_addresses")
      .select("*")
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar endereço existente:", error);
      return null;
    }
    return existingAddress;
  }

  if (
    !details ||
    !details.fullName ||
    !details.country ||
    !details.streetAddress ||
    !details.city ||
    !details.stateProvince ||
    !details.zipCode ||
    !details.phoneNumber ||
    !details.email
  ) {
    console.error("Dados de endereço incompletos:", details);
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
    created_at: new Date().toISOString(),
  };

  try {
    const { data: newAddress, error } = await supabase
      .from("shipping_addresses")
      .insert(addressData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar novo endereço:", error);
      return null;
    }

    return newAddress;
  } catch (insertError) {
    console.error("Exceção ao inserir novo endereço:", insertError);
    return null;
  }
}

async function updatePurchaseStatus(
  transactionId: string,
  wallet: string,
  addressId: number | null,
  burnSignature: string | null
) {
  if (!supabase) return null;
  const updateData: any = {
    status: "claimed",
    claimed: true,
    claimed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (addressId) {
    updateData.shipping_address_id = addressId;
  }

  if (burnSignature) {
    updateData.burn_signature = burnSignature;
  }

  try {
    const { error: updateError } = await supabase
      .from("purchases")
      .update(updateData)
      .eq("nft_mint", transactionId)
      .eq("wallet_address", wallet);

    if (updateError) {
      console.error("Erro ao atualizar status da compra:", updateError);
      return null;
    }

    const { data: updatedRecord, error: fetchError } = await supabase
      .from("purchases")
      .select("*")
      .eq("nft_mint", transactionId)
      .eq("wallet_address", wallet)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar registro atualizado:", fetchError);
      return null;
    }
    return updatedRecord;
  } catch (error) {
    console.error("Erro inesperado ao atualizar status da compra:", error);
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
      teamSelected,
    } = await request.json();

    if (!walletAddress || !transactionId || !itemName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isPrizeJersey =
      itemName.toLowerCase().includes("jersey") ||
      itemName.toLowerCase().includes("camisa");
    if (isPrizeJersey && !teamSelected) {
      return NextResponse.json(
        {
          success: false,
          error: "Team selection is required for jersey prizes",
        },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: true,
        message: "Shipping data logged successfully (database not configured)",
      });
    }

    let shippingAddressId = null;
    let shippingAddressData = null;

    try {
      if (useExistingAddress && addressId) {
        const { data: specificAddress, error } = await supabase
          .from("shipping_addresses")
          .select("*")
          .eq("id", addressId)
          .single();

        if (error) {
          console.error("Erro ao buscar endereço específico:", error);
        } else if (specificAddress) {
          shippingAddressId = specificAddress.id;
          shippingAddressData = specificAddress;
        }
      } else {
        shippingAddressData = await getOrCreateShippingAddress(
          walletAddress,
          shippingDetails,
          useExistingAddress === true
        );

        if (shippingAddressData) {
          shippingAddressId = shippingAddressData.id;
        }
      }
    } catch (addressError: any) {
      console.error("Erro ao processar endereço de envio:", addressError);
    }

    console.log(
      `Tentando queimar NFT ${transactionId} para a carteira ${walletAddress}...`
    );
    let burnSignature = null;
    let burnError = null;

    try {
      burnSignature = await burnNFT(transactionId);
      if (!burnSignature) {
        burnError = "Falha ao queimar o NFT - verificar logs para detalhes";
      } else {
        const updateData: any = {
          shippingAddressId,
          burnSignature,
        };
        if (isPrizeJersey && teamSelected)
          updateData.teamSelected = teamSelected;
        await updatePurchaseStatus(
          transactionId,
          walletAddress,
          shippingAddressId,
          burnSignature
        );

        if (isPrizeJersey && teamSelected && supabase) {
          try {
            await supabase
              .from("purchases")
              .update({ team_selected: teamSelected })
              .eq("nft_mint", transactionId)
              .eq("wallet_address", walletAddress);
          } catch (teamError) {
            console.error("Erro ao salvar time selecionado:", teamError);
          }
        }

        console.log("Status da compra atualizado no banco de dados");
      }
    } catch (error: any) {
      console.error("Erro durante a queima do NFT:", error);
      burnError = error.message || "Erro desconhecido durante a queima do NFT";
    }

    return NextResponse.json({
      success: true,
      message: "Shipping information processed successfully",
      useExistingAddress,
      addressSaved: !!shippingAddressId,
      addressId: shippingAddressId,
      burnSignature,
      burnError,
      transactionId,
      teamSelected,
    });
  } catch (error: any) {
    console.error("Error processing shipping submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
