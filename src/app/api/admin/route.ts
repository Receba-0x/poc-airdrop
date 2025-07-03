import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAuthenticated } from "@/utils/auth";
import { getSupabaseKey } from "@/utils/secretsManager";

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL;

// Função para criar cliente Supabase
async function createSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL não configurada");
  }
  const supabaseServiceKey = await getSupabaseKey();
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const isAuthorized = await isAuthenticated(authHeader);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "get-purchases":
        return await handleGetPurchases(params);
      case "get-stats":
        return await handleGetStats();
      case "get-stock":
        return await handleGetStock(params);
      case "update-stock":
        return await handleUpdateStock(params);
      case "initialize-stock":
        return await handleInitializeStock();
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in admin API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle purchases retrieval
async function handleGetPurchases(params: any) {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Database not configured",
      },
      { status: 500 }
    );
  }

  const { page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("purchases")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    total: count,
    page,
    pageSize,
  });
}

// Handle admin stats
async function handleGetStats() {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        totalPurchases: 0,
        totalRevenue: 0,
        totalBoxes: 0,
        recentActivity: [],
      },
    });
  }

  // Get total purchases
  const { count: totalPurchases } = await supabase
    .from("purchases")
    .select("*", { count: "exact", head: true });

  // Get total revenue
  const { data: revenueData } = await supabase
    .from("purchases")
    .select("amount_purchased");

  const totalRevenue =
    revenueData?.reduce(
      (sum, purchase) => sum + purchase.amount_purchased,
      0
    ) || 0;

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from("purchases")
    .select("wallet_address, prize_name, purchase_timestamp, amount_purchased")
    .order("purchase_timestamp", { ascending: false })
    .limit(10);

  return NextResponse.json({
    success: true,
    data: {
      totalPurchases: totalPurchases || 0,
      totalRevenue,
      totalBoxes: totalPurchases || 0,
      recentActivity: recentActivity || [],
    },
  });
}

// Handle stock retrieval
async function handleGetStock(params: any) {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    const mockData = [
      {
        id: 1,
        prize_id: 8,
        prize_name: "Team Jersey",
        current_stock: 48,
        initial_stock: 50,
      },
      {
        id: 2,
        prize_id: 9,
        prize_name: "Official Ball",
        current_stock: 37,
        initial_stock: 40,
      },
      {
        id: 3,
        prize_id: 10,
        prize_name: "Soccer Cleats",
        current_stock: 28,
        initial_stock: 30,
      },
      {
        id: 4,
        prize_id: 11,
        prize_name: "MacBook M3",
        current_stock: 9,
        initial_stock: 10,
      },
      {
        id: 5,
        prize_id: 12,
        prize_name: "iPhone 16 Pro Max",
        current_stock: 18,
        initial_stock: 20,
      },
      {
        id: 6,
        prize_id: 13,
        prize_name: "Golden Ticket",
        current_stock: 3,
        initial_stock: 5,
      },
    ];
    return NextResponse.json({ success: true, data: mockData });
  }

  const { prize_id } = params;
  let query = supabase.from("prize_stock").select("*");

  if (prize_id) {
    query = query.eq("prize_id", prize_id);
  } else {
    query = query.order("prize_id");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: prize_id ? data[0] || null : data,
  });
}

// Handle stock updates
async function handleUpdateStock(params: any) {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Database not configured",
      },
      { status: 500 }
    );
  }

  const { prize_id, new_stock, action } = params;

  if (!prize_id || (new_stock === undefined && action !== "reset")) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required parameters (prize_id, new_stock or action)",
      },
      { status: 400 }
    );
  }

  let result;
  if (action === "reset") {
    result = await supabase.rpc("reset_prize_stock", { p_prize_id: prize_id });
  } else if (action === "increment") {
    result = await supabase.rpc("increment_stock", { p_prize_id: prize_id });
  } else if (action === "decrement") {
    result = await supabase.rpc("decrement_stock", { p_prize_id: prize_id });
  } else {
    result = await supabase
      .from("prize_stock")
      .update({
        current_stock: new_stock,
        updated_at: new Date().toISOString(),
      })
      .eq("prize_id", prize_id);
  }

  if (result.error) {
    console.error("Error updating stock:", result.error);
    return NextResponse.json(
      {
        success: false,
        error: result.error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Stock ${action || "updated"} successfully`,
    data: result.data,
  });
}

// Handle stock initialization
async function handleInitializeStock() {
  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Database not configured",
      },
      { status: 500 }
    );
  }

  const { data, error } = await supabase.rpc("create_prize_stock_table");

  if (error) {
    console.error("Error initializing prize stock table:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  const { data: stockData, error: fetchError } = await supabase
    .from("prize_stock")
    .select("*")
    .order("prize_id");

  if (fetchError) {
    console.error("Error fetching prize stock data:", fetchError);
    return NextResponse.json({
      success: true,
      message: "Prize stock table initialized but could not fetch data",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Prize stock table initialized successfully",
    data: stockData,
  });
}
