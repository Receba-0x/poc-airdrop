"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { PurchasesList } from "@/components/admin/PurchasesList";
import { StockManager } from "@/components/admin/StockManager";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Types based on API responses
interface Purchase {
  id: string;
  wallet_address: string;
  nft_mint: string;
  nft_metadata?: string;
  amount_purchased: number;
  prize_id: number;
  prize_name: string;
  transaction_signature: string;
  status: string;
  created_at: string;
  is_crypto: boolean;
}

interface StockItem {
  id: number;
  prize_id: number;
  prize_name: string;
  current_stock: number;
  initial_stock: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'purchases' | 'stock' | 'statistics'>('purchases');
  const router = useRouter();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      // Verificar se o token ainda é válido (não expirou)
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (expiresAt && new Date(expiresAt) > new Date()) {
        setIsAuthenticated(true);
        // Carregar dados iniciais
        fetchData();
      } else {
        // Token expirado, redirecionar para login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
      }
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');

      // Fetch purchases data
      const purchasesResponse = await fetch("/api/admin/purchases", {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const purchasesData = await purchasesResponse.json();
      if (!purchasesResponse.ok) throw new Error(purchasesData.error || "Failed to fetch purchases");

      // Fetch stock data
      const stockResponse = await fetch("/api/admin/stock", {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const stockData = await stockResponse.json();
      if (!stockResponse.ok) throw new Error(stockData.error || "Failed to fetch stock");

    } catch (err: any) {
      console.error('Error fetching data:', err);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-[1280px] mx-auto">
          {activeTab === 'purchases' && <PurchasesList />}
          {activeTab === 'stock' && <StockManager />}
          {activeTab === 'statistics' && <AdminStats />}
        </div>
      </div>
    </div>
  );
} 