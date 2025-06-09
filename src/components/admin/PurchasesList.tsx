"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../Button";

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

export function PurchasesList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    fetchPurchases();
  }, [page]);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const { data } = await axios.get(`/api/admin/purchases?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (data.success) {
        setPurchases(prev => page === 1 ? data.data : [...prev, ...data.data]);
        setHasMore(data.data.length === pageSize);
      } else {
        setError(data.error || 'Failed to load purchases');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching purchases');
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const truncateWallet = (wallet: string) => {
    if (!wallet) return '';
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading && purchases.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Loading purchases data...</p>
        </div>
      </div>
    );
  }

  if (error && purchases.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <h3 className="text-red-400 font-bold mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
          <div className="mt-4">
            <Button 
              onClick={() => {
                setPage(1);
                fetchPurchases();
              }}
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl text-white font-bold mb-4">Recent Purchases</h2>
      
      {purchases.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">No purchases found</p>
        </div>
      ) : (
        <>
          <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#111] text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Wallet</th>
                  <th className="px-4 py-3 text-left">Prize</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-[#222]">
                    <td className="px-4 py-3 text-gray-300">{purchase.id}</td>
                    <td className="px-4 py-3 text-blue-400 font-mono">
                      {truncateWallet(purchase.wallet_address)}
                    </td>
                    <td className="px-4 py-3 text-white">
                      <div className="flex flex-col">
                        <span>{purchase.prize_name}</span>
                        <span className="text-xs text-gray-400">ID: {purchase.prize_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">
                      {formatAmount(purchase.amount_purchased)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        purchase.status === 'completed' 
                          ? 'bg-green-900/30 text-green-400' 
                          : purchase.status === 'pending'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-red-900/30 text-red-400'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-sm">
                      {formatDate(purchase.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(loading || hasMore) && (
            <div className="mt-4 text-center">
              <Button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                variant="secondary"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 