import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL ou Anon Key não configurados. Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AirdropSubmission {
  name: string;
  instagram: string;
  phone: string;
  email: string;
  wallet: string;
  created_at?: string;
}

export async function saveAirdropSubmission(
  data: AirdropSubmission
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("airdrop_submissions").insert([
      {
        name: data.name,
        instagram: data.instagram,
        phone: data.phone,
        email: data.email,
        wallet: data.wallet,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar no Supabase:", error);
    return { success: false, error: error.message || "Erro desconhecido" };
  }
}

/**
 * Verifica se já existe uma submissão com a wallet ou email fornecidos
 */
export async function checkExistingSubmission(
  wallet?: string,
  email?: string
): Promise<{
  exists: boolean;
  byWallet?: boolean;
  byEmail?: boolean;
  error?: string;
}> {
  try {
    if (!wallet && !email) {
      return { exists: false };
    }

    // Construir query
    let query = supabase.from("airdrop_submissions").select("wallet, email");

    if (wallet && email) {
      // Verificar ambos usando OR
      query = query.or(`wallet.eq.${wallet},email.eq.${email}`);
    } else if (wallet) {
      query = query.eq("wallet", wallet);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error("Erro ao verificar submissão existente:", error);
      return { exists: false, error: error.message };
    }

    if (data && data.length > 0) {
      const submission = data[0];
      const byWallet = wallet ? submission.wallet === wallet : false;
      const byEmail = email ? submission.email === email : false;
      return { exists: true, byWallet, byEmail };
    }

    return { exists: false };
  } catch (error: any) {
    console.error("Erro ao verificar submissão existente:", error);
    return { exists: false, error: error.message || "Erro desconhecido" };
  }
}

/**
 * Verifica se já recebeu tokens (já girou e recebeu)
 */
export async function checkAlreadyReceivedTokens(
  wallet?: string,
  email?: string
): Promise<{
  received: boolean;
  byWallet?: boolean;
  byEmail?: boolean;
  error?: string;
}> {
  try {
    if (!wallet && !email) {
      return { received: false };
    }

    // Verificar na tabela de transferências de tokens
    let query = supabase
      .from("token_transfers")
      .select("recipient_wallet, user_email");

    if (wallet && email) {
      query = query.or(`recipient_wallet.eq.${wallet},user_email.eq.${email}`);
    } else if (wallet) {
      query = query.eq("recipient_wallet", wallet);
    } else if (email) {
      query = query.eq("user_email", email);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error("Erro ao verificar tokens recebidos:", error);
      return { received: false, error: error.message };
    }

    if (data && data.length > 0) {
      const transfer = data[0];
      const byWallet = wallet ? transfer.recipient_wallet === wallet : false;
      const byEmail = email ? transfer.user_email === email : false;
      return { received: true, byWallet, byEmail };
    }

    return { received: false };
  } catch (error: any) {
    console.error("Erro ao verificar tokens recebidos:", error);
    return { received: false, error: error.message || "Erro desconhecido" };
  }
}

