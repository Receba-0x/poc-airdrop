import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const lastTimestamp = searchParams.get("lastTimestamp");

    let query = supabase
      .from("purchases")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Se tiver lastTimestamp, buscar transações mais recentes que isso
    if (lastTimestamp) {
      query = query.gt(
        "created_at",
        new Date(parseInt(lastTimestamp)).toISOString()
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    const formattedTransactions = data.map((purchase: any) => ({
      id: purchase.id.toString(),
      amount: purchase.amount_purchased,
      timestamp: new Date(purchase.created_at).getTime(),
      wallet_address: purchase.wallet_address,
      nft_mint: purchase.nft_mint,
      transaction_signature: purchase.transaction_signature,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
