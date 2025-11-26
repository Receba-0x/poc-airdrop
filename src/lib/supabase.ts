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

