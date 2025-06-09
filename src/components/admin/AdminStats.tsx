"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface StatsData {
  total_purchases: number;
  total_value: number;
  physical_prizes_claimed: number;
  crypto_prizes_claimed: number;
  top_wallets: {
    wallet_address: string;
    purchase_count: number;
  }[];
  prizes_by_popularity: {
    prize_id: number;
    prize_name: string;
    claim_count: number;
  }[];
  recent_activity: {
    date: string;
    purchase_count: number;
  }[];
}

export function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Não autenticado. Faça login novamente.');
        setLoading(false);
        return;
      }
      
      const { data } = await axios.get('/api/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Falha ao carregar estatísticas');
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar estatísticas');
      console.error('Erro ao buscar estatísticas:', err);
      setLoading(false);
    }
  };

  const setupStatisticsFunctions = async () => {
    setSetupLoading(true);
    setSetupSuccess(false);
    setError(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Não autenticado. Faça login novamente.');
        setSetupLoading(false);
        return;
      }
      
      const { data } = await axios.post('/api/admin/setup-statistics', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setSetupSuccess(true);
        // Após configuração bem-sucedida, buscar estatísticas novamente
        await fetchStats();
      } else {
        throw new Error(data.error || 'Falha ao configurar funções de estatísticas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao configurar funções de estatísticas');
      console.error('Erro ao configurar estatísticas:', err);
    } finally {
      setSetupLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const truncateWallet = (wallet: string) => {
    if (!wallet) return '';
    if (!wallet.includes('...')) {
      return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
    }
    return wallet;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <h3 className="text-red-400 font-bold mb-2">Erro</h3>
          <p className="text-gray-300">{error}</p>
          
          {/* Botão para configurar as funções de estatísticas */}
          <button
            onClick={setupStatisticsFunctions}
            disabled={setupLoading}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setupLoading ? 'Configurando...' : 'Configurar Funções de Estatísticas'}
          </button>
          
          {setupSuccess && (
            <p className="mt-2 text-green-400">Funções configuradas com sucesso!</p>
          )}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">Nenhuma estatística disponível</p>
          
          {/* Botão para configurar as funções de estatísticas */}
          <button
            onClick={setupStatisticsFunctions}
            disabled={setupLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setupLoading ? 'Configurando...' : 'Configurar Funções de Estatísticas'}
          </button>
          
          {setupSuccess && (
            <p className="mt-2 text-green-400">Funções configuradas com sucesso!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-white font-bold">Estatísticas da Plataforma</h2>
        
        {/* Botão para configurar as funções de estatísticas */}
        <button
          onClick={setupStatisticsFunctions}
          disabled={setupLoading}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {setupLoading ? 'Configurando...' : 'Atualizar Funções DB'}
        </button>
      </div>
      
      {setupSuccess && (
        <div className="mb-4 p-2 bg-green-900/20 border border-green-700/30 rounded-md">
          <p className="text-green-400 text-sm">Funções de estatísticas configuradas com sucesso!</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card - Total de Compras */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-700/10 p-4 rounded-lg border border-blue-700/20">
          <h3 className="text-gray-400 text-sm mb-1">Total de Compras</h3>
          <p className="text-white text-2xl font-bold">{formatNumber(stats.total_purchases)}</p>
        </div>
        
        {/* Card - Valor Total */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-700/10 p-4 rounded-lg border border-green-700/20">
          <h3 className="text-gray-400 text-sm mb-1">Valor Total</h3>
          <p className="text-white text-2xl font-bold">{formatCurrency(stats.total_value)}</p>
        </div>
        
        {/* Card - Prêmios Físicos */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-700/10 p-4 rounded-lg border border-yellow-700/20">
          <h3 className="text-gray-400 text-sm mb-1">Prêmios Físicos</h3>
          <p className="text-white text-2xl font-bold">{formatNumber(stats.physical_prizes_claimed)}</p>
        </div>
        
        {/* Card - Prêmios Crypto */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-700/10 p-4 rounded-lg border border-purple-700/20">
          <h3 className="text-gray-400 text-sm mb-1">Prêmios Crypto</h3>
          <p className="text-white text-2xl font-bold">{formatNumber(stats.crypto_prizes_claimed)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Wallets */}
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-[#111] border-b border-gray-800">
            <h3 className="font-medium text-white">Top Wallets</h3>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-800">
              {stats.top_wallets.length > 0 ? (
                stats.top_wallets.map((wallet, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-3">#{index + 1}</span>
                      <span className="text-blue-400 font-mono">{truncateWallet(wallet.wallet_address)}</span>
                    </div>
                    <span className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded text-sm">
                      {wallet.purchase_count} compras
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-3 text-center text-gray-500">Nenhum dado disponível</li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Prizes by Popularity */}
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-[#111] border-b border-gray-800">
            <h3 className="font-medium text-white">Prêmios Mais Populares</h3>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-800">
              {stats.prizes_by_popularity.length > 0 ? (
                stats.prizes_by_popularity.map((prize, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="text-white">{prize.prize_name}</div>
                      <div className="text-gray-500 text-sm">ID: {prize.prize_id}</div>
                    </div>
                    <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded text-sm">
                      {prize.claim_count} claims
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-3 text-center text-gray-500">Nenhum dado disponível</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Atividade Recente - Gráfico simples */}
      <div className="mt-6 bg-[#1A1A1A] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[#111] border-b border-gray-800">
          <h3 className="font-medium text-white">Atividade Recente</h3>
        </div>
        <div className="p-4">
          {stats.recent_activity.length > 0 ? (
            <div className="h-20 flex items-end space-x-2">
              {stats.recent_activity.map((day, index) => {
                const maxCount = Math.max(...stats.recent_activity.map(d => d.purchase_count));
                const height = Math.max((day.purchase_count / maxCount) * 100, 10); // min 10% height
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-600/40 rounded-t hover:bg-blue-500/60 transition-all"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-1">{day.date.split('-')[2]}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-3 text-center text-gray-500">Nenhum dado disponível</div>
          )}
        </div>
      </div>
    </div>
  );
} 