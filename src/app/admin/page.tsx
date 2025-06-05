"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("purchases");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const checkAuth = () => {
    // Simple client-side auth for demo purposes - should be replaced with proper auth
    const correctPassword = "admin123"; // Should be environment variable
    if (adminPassword === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
    } else {
      setError("Invalid password");
    }
  };

  useEffect(() => {
    // Check if admin is already authenticated
    const isAuth = localStorage.getItem("adminAuth") === "true";
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch purchases data
      const purchasesResponse = await fetch("/api/admin/purchases");
      const purchasesData = await purchasesResponse.json();
      if (!purchasesResponse.ok) throw new Error(purchasesData.error || "Failed to fetch purchases");
      
      // Fetch stock data
      const stockResponse = await fetch("/api/admin/stock");
      const stockData = await stockResponse.json();
      if (!stockResponse.ok) throw new Error(stockData.error || "Failed to fetch stock");

      setPurchases(purchasesData.data || []);
      setStock(stockData.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  // Handle database setup
  const handleSetupDatabase = async () => {
    setIsSettingUp(true);
    setSetupMessage("Setting up database...");
    
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST"
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to set up database");
      }
      
      setSetupMessage("Database setup completed successfully");
      // Reload the data
      fetchData();
    } catch (err: any) {
      setSetupMessage(`Error: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsSettingUp(false);
        setSetupMessage(null);
      }, 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen text-white pt-20 bg-[#0F0F0F]">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                {t("admin.title") || "Admin Panel"}
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {t("admin.description") || "Access the administrative controls for ADR Token"}
              </p>
            </div>
            
            <div className="bg-[#1A1A1A] border border-gray-800 p-8 rounded-lg max-w-md mx-auto shadow-xl">
              <h2 className="text-2xl font-bold mb-6">{t("admin.login") || "Login"}</h2>
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded mb-6">
                  {error}
                </div>
              )}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  {t("admin.password") || "Admin Password"}
                </label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 bg-[#111111] border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500 transition"
                  onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
                />
              </div>
              <button 
                onClick={checkAuth}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-4 rounded-md transition font-semibold"
              >
                {t("admin.loginButton") || "Login"}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen text-white pt-20 bg-[#0F0F0F]">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {t("admin.dashboard") || "Admin Dashboard"}
              </h1>
              <p className="text-gray-400">
                {t("admin.welcomeMessage") || "Monitor and manage your application"}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button 
                onClick={handleSetupDatabase}
                disabled={isSettingUp}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-5 rounded-md transition font-medium disabled:opacity-50 flex items-center"
              >
                {isSettingUp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("admin.settingUp") || "Setting up..."}
                  </>
                ) : (
                  t("admin.setupDatabase") || "Setup Database"
                )}
              </button>
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-5 rounded-md transition font-medium"
              >
                {t("admin.logout") || "Logout"}
              </button>
            </div>
          </div>

          {setupMessage && (
            <div className={`p-4 mb-6 rounded-md border ${setupMessage.includes('Error') ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-green-900/50 border-green-700 text-green-200'}`}>
              {setupMessage}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-800 mb-8">
            <button 
              className={`py-3 px-6 font-medium ${activeTab === 'purchases' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('purchases')}
            >
              {t("admin.purchases") || "Purchases"}
            </button>
            <button 
              className={`py-3 px-6 font-medium ${activeTab === 'stock' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('stock')}
            >
              {t("admin.stock") || "Stock"}
            </button>
            <button 
              className={`py-3 px-6 font-medium ${activeTab === 'stats' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('stats')}
            >
              {t("admin.statistics") || "Statistics"}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-gray-400">{t("admin.loading") || "Loading data..."}</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-5 rounded-md mb-6 flex items-center justify-between">
              <div>{error}</div>
              <button 
                onClick={fetchData} 
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition"
              >
                {t("admin.retry") || "Retry"}
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'purchases' && (
                <div className="overflow-x-auto">
                  <h2 className="text-2xl font-bold mb-6">
                    {t("admin.recentPurchases") || "Recent Purchases"}
                  </h2>
                  <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <table className="w-full">
                      <thead className="bg-[#111111]">
                        <tr>
                          <th className="py-4 px-4 text-left font-medium text-gray-300">ID</th>
                          <th className="py-4 px-4 text-left font-medium text-gray-300">{t("admin.wallet") || "Wallet"}</th>
                          <th className="py-4 px-4 text-left font-medium text-gray-300">{t("admin.prize") || "Prize"}</th>
                          <th className="py-4 px-4 text-left font-medium text-gray-300">{t("admin.amount") || "Amount"}</th>
                          <th className="py-4 px-4 text-left font-medium text-gray-300">{t("admin.status") || "Status"}</th>
                          <th className="py-4 px-4 text-left font-medium text-gray-300">{t("admin.date") || "Date"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {purchases.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-[#232323] transition">
                            <td className="py-4 px-4 text-gray-300">{purchase.id}</td>
                            <td className="py-4 px-4">
                              <span className="truncate block max-w-xs text-gray-300" title={purchase.wallet_address}>
                                {purchase.wallet_address.substring(0, 8)}...{purchase.wallet_address.substring(purchase.wallet_address.length - 6)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-300">{purchase.prize_name}</td>
                            <td className="py-4 px-4 text-gray-300">{purchase.amount_purchased.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${purchase.status === 'completed' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'}`}>
                                {purchase.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-300">{new Date(purchase.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                        {purchases.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                              {t("admin.noPurchases") || "No purchases found"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'stock' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {t("admin.prizeStock") || "Prize Stock"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stock.map((item) => (
                      <div key={item.id} className="bg-[#1A1A1A] border border-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-3">{item.prize_name}</h3>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">{t("admin.currentStock") || "Current Stock"}</span>
                            <span className="font-medium text-blue-400">{item.current_stock} / {item.initial_stock}</span>
                          </div>
                          <div className="w-full bg-[#111111] rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full ${item.current_stock / item.initial_stock < 0.3 ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-blue-600 to-blue-500'}`}
                              style={{ width: `${(item.current_stock / item.initial_stock) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm">
                          <span className="font-medium text-white">{Math.round((1 - item.current_stock / item.initial_stock) * 100)}%</span> {t("admin.sold") || "sold"}
                        </div>
                      </div>
                    ))}
                    {stock.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500 bg-[#1A1A1A] border border-gray-800 rounded-lg">
                        {t("admin.noStock") || "No stock data available"}
                        <div className="mt-2">
                          <button 
                            onClick={handleSetupDatabase}
                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            {t("admin.setupDatabaseToViewStock") || "Setup database to view stock"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {t("admin.statistics") || "Statistics"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#1A1A1A] border border-gray-800 p-6 rounded-lg shadow-lg">
                      <h3 className="text-lg font-medium mb-2 text-gray-400">{t("admin.totalPurchases") || "Total Purchases"}</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{purchases.length}</p>
                    </div>
                    <div className="bg-[#1A1A1A] border border-gray-800 p-6 rounded-lg shadow-lg">
                      <h3 className="text-lg font-medium mb-2 text-gray-400">{t("admin.totalValue") || "Total Value"}</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                        {purchases.reduce((sum, p) => sum + p.amount_purchased, 0).toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">tokens</p>
                    </div>
                    <div className="bg-[#1A1A1A] border border-gray-800 p-6 rounded-lg shadow-lg">
                      <h3 className="text-lg font-medium mb-2 text-gray-400">{t("admin.uniqueUsers") || "Unique Users"}</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                        {new Set(purchases.map(p => p.wallet_address)).size}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] border border-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-6">{t("admin.prizeDistribution") || "Prize Distribution"}</h3>
                    {/* Simple bar chart */}
                    <div className="space-y-5">
                      {Object.entries(
                        purchases.reduce((acc: Record<string, number>, p) => {
                          acc[p.prize_name] = (acc[p.prize_name] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, count]) => (
                        <div key={name}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-white">{name}</span>
                            <span className="text-blue-400">{count} {t("admin.purchasesCount") || "purchases"}</span>
                          </div>
                          <div className="w-full bg-[#111111] rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                              style={{ width: `${(count / purchases.length) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-right text-xs text-gray-500">
                            {Math.round((count / purchases.length) * 100)}%
                          </div>
                        </div>
                      ))}
                      
                      {purchases.length === 0 && (
                        <div className="py-8 text-center text-gray-500">
                          {t("admin.noPurchasesForStats") || "No purchases data available for statistics"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 