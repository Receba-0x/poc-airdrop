"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StatsData {
  total_purchases: number;
  total_value: number;
  physical_prizes_claimed: number;
  crypto_prizes_claimed: number;
  unique_wallets: number;
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
  daily_activity: {
    date: string;
    count: number;
  }[];
  daily_volume: {
    date: string;
    value: number;
  }[];
  prize_distribution: {
    name: string;
    count: number;
  }[];
  value_distribution: {
    range: string;
    count: number;
  }[];
  sales_by_hour: {
    hour: number;
    count: number;
  }[];
  box_stock_data: {
    id: number;
    box_type: string;
    name: string;
    current_stock: number;
    initial_stock: number;
    created_at: string;
  }[];
  crypto_boxes_opened: number;
  super_prize_boxes_opened: number;
}

export function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [boxStockSetupLoading, setBoxStockSetupLoading] = useState(false);
  const [boxStockSetupSuccess, setBoxStockSetupSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'prizes' | 'boxes'>('overview');

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

  const setupBoxStockTable = async () => {
    setBoxStockSetupLoading(true);
    setBoxStockSetupSuccess(false);
    setError(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Não autenticado. Faça login novamente.');
        setBoxStockSetupLoading(false);
        return;
      }
      
      const { data } = await axios.post('/api/admin/setup-box-stock', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setBoxStockSetupSuccess(true);
        // Após configuração bem-sucedida, buscar estatísticas novamente
        await fetchStats();
      } else {
        throw new Error(data.error || 'Falha ao configurar tabela de estoque de caixas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao configurar tabela de estoque de caixas');
      console.error('Erro ao configurar estoque de caixas:', err);
    } finally {
      setBoxStockSetupLoading(false);
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

  // Opções e dados para os gráficos
  const getLineChartOptions = (title: string) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#CCC'
        }
      },
      title: {
        display: true,
        text: title,
        color: '#EEE'
      },
    },
    scales: {
      x: {
        ticks: { color: '#AAA' },
        grid: { color: '#333' }
      },
      y: {
        ticks: { color: '#AAA' },
        grid: { color: '#333' }
      }
    }
  });

  const getBarChartOptions = (title: string) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#CCC'
        }
      },
      title: {
        display: true,
        text: title,
        color: '#EEE'
      },
    },
    scales: {
      x: {
        ticks: { color: '#AAA' },
        grid: { color: '#333' }
      },
      y: {
        ticks: { color: '#AAA' },
        grid: { color: '#333' }
      }
    }
  });

  const getPieChartOptions = (title: string) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#CCC'
        }
      },
      title: {
        display: true,
        text: title,
        color: '#EEE'
      },
    }
  });

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
          
          {/* Botões para configuração */}
          <div className="flex gap-2">
            <button
              onClick={setupBoxStockTable}
              disabled={boxStockSetupLoading}
              className="px-3 py-1 bg-green-800 hover:bg-green-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {boxStockSetupLoading ? 'Configurando...' : 'Configurar Estoque de Caixas'}
            </button>
            
            <button
              onClick={setupStatisticsFunctions}
              disabled={setupLoading}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setupLoading ? 'Configurando...' : 'Atualizar Funções DB'}
            </button>
          </div>
          
          {setupSuccess && (
            <p className="mt-2 text-green-400">Funções configuradas com sucesso!</p>
          )}
          
          {boxStockSetupSuccess && (
            <p className="mt-2 text-green-400">Tabela de estoque de caixas configurada com sucesso!</p>
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
          
          {/* Botões para configuração */}
          <div className="flex gap-2">
            <button
              onClick={setupBoxStockTable}
              disabled={boxStockSetupLoading}
              className="px-3 py-1 bg-green-800 hover:bg-green-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {boxStockSetupLoading ? 'Configurando...' : 'Configurar Estoque de Caixas'}
            </button>
            
            <button
              onClick={setupStatisticsFunctions}
              disabled={setupLoading}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setupLoading ? 'Configurando...' : 'Atualizar Funções DB'}
            </button>
          </div>
          
          {setupSuccess && (
            <p className="mt-2 text-green-400">Funções configuradas com sucesso!</p>
          )}
          
          {boxStockSetupSuccess && (
            <p className="mt-2 text-green-400">Tabela de estoque de caixas configurada com sucesso!</p>
          )}
        </div>
      </div>
    );
  }

  // Preparando dados para os gráficos
  const activityChartData = {
    labels: stats.daily_activity.map(d => d.date.slice(5)), // Mostrar apenas mês/dia
    datasets: [
      {
        label: 'Compras',
        data: stats.daily_activity.map(d => d.count),
        borderColor: 'rgba(53, 162, 235, 0.8)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2
      }
    ]
  };

  const volumeChartData = {
    labels: stats.daily_volume.map(d => d.date.slice(5)), // Mostrar apenas mês/dia
    datasets: [
      {
        label: 'Volume ($)',
        data: stats.daily_volume.map(d => d.value),
        borderColor: 'rgba(75, 192, 192, 0.8)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.2
      }
    ]
  };

  const prizesChartData = {
    labels: stats.prize_distribution.map(d => d.name),
    datasets: [
      {
        label: 'Distribuição de Prêmios',
        data: stats.prize_distribution.map(d => d.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const valueRangeChartData = {
    labels: stats.value_distribution.map(d => d.range),
    datasets: [
      {
        label: 'Faixas de Valor',
        data: stats.value_distribution.map(d => d.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const hourlyChartData = {
    labels: stats.sales_by_hour.map(d => `${d.hour}h`),
    datasets: [
      {
        label: 'Vendas por Hora',
        data: stats.sales_by_hour.map(d => d.count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const prizeTypeData = {
    labels: ['Físicos', 'Crypto'],
    datasets: [
      {
        label: 'Tipos de Prêmios',
        data: [stats.physical_prizes_claimed, stats.crypto_prizes_claimed],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calcular as porcentagens
  const totalPrizes = stats.physical_prizes_claimed + stats.crypto_prizes_claimed;
  const physicalPercentage = totalPrizes > 0 
    ? Math.round((stats.physical_prizes_claimed / totalPrizes) * 100) 
    : 0;
  const cryptoPercentage = totalPrizes > 0 
    ? Math.round((stats.crypto_prizes_claimed / totalPrizes) * 100) 
    : 0;

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-white font-bold">Estatísticas da Plataforma</h2>
          
          {/* Botões para configuração */}
          <div className="flex gap-2">
            <button
              onClick={setupBoxStockTable}
              disabled={boxStockSetupLoading}
              className="px-3 py-1 bg-green-800 hover:bg-green-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {boxStockSetupLoading ? 'Configurando...' : 'Configurar Estoque de Caixas'}
            </button>
            
            <button
              onClick={setupStatisticsFunctions}
              disabled={setupLoading}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setupLoading ? 'Configurando...' : 'Atualizar Funções DB'}
            </button>
          </div>
        </div>
        
        {setupSuccess && (
          <div className="mb-4 p-2 bg-green-900/20 border border-green-700/30 rounded-md">
            <p className="text-green-400 text-sm">Funções de estatísticas configuradas com sucesso!</p>
          </div>
        )}
        
        {boxStockSetupSuccess && (
          <div className="mb-4 p-2 bg-green-900/20 border border-green-700/30 rounded-md">
            <p className="text-green-400 text-sm">Tabela de estoque de caixas configurada com sucesso!</p>
          </div>
        )}

        {/* Tabs para navegar entre as diferentes visualizações */}
        <div className="border-b border-gray-700 mb-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === 'sales'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Vendas
            </button>
            <button
              onClick={() => setActiveTab('prizes')}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === 'prizes'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Prêmios
            </button>
            <button
              onClick={() => setActiveTab('boxes')}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === 'boxes'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Caixas
            </button>
          </nav>
        </div>

        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Atividade Diária */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Line 
                  options={getLineChartOptions('Atividade Diária (30 dias)')} 
                  data={activityChartData} 
                />
              </div>
              
              {/* Gráfico de Volume Diário */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Line 
                  options={getLineChartOptions('Volume Diário ($)')} 
                  data={volumeChartData} 
                />
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
          </>
        )}
        
        {/* Análise de Vendas */}
        {activeTab === 'sales' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              
              {/* Card - Carteiras Únicas */}
              <div className="bg-gradient-to-br from-orange-900/30 to-orange-700/10 p-4 rounded-lg border border-orange-700/20">
                <h3 className="text-gray-400 text-sm mb-1">Carteiras Únicas</h3>
                <p className="text-white text-2xl font-bold">{formatNumber(stats.unique_wallets)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Volume Diário */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Line 
                  options={getLineChartOptions('Volume de Vendas (30 dias)')} 
                  data={volumeChartData} 
                />
              </div>
              
              {/* Gráfico de Distribuição por Valor */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Pie 
                  options={getPieChartOptions('Vendas por Faixa de Valor')} 
                  data={valueRangeChartData} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Vendas por Hora do Dia */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Bar
                  options={getBarChartOptions('Vendas por Hora do Dia')}
                  data={hourlyChartData}
                />
              </div>
              
              {/* Gráfico de Atividade Diária */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Line 
                  options={getLineChartOptions('Tendência de Compras')} 
                  data={activityChartData} 
                />
              </div>
            </div>
          </>
        )}
        
        {/* Análise de Prêmios */}
        {activeTab === 'prizes' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Card - Prêmios Físicos */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-700/10 p-4 rounded-lg border border-yellow-700/20">
                <h3 className="text-gray-400 text-sm mb-1">Prêmios Físicos</h3>
                <p className="text-white text-2xl font-bold">{formatNumber(stats.physical_prizes_claimed)}</p>
                <p className="text-yellow-400 text-sm mt-1">{physicalPercentage}% do total</p>
              </div>
              
              {/* Card - Prêmios Crypto */}
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-700/10 p-4 rounded-lg border border-purple-700/20">
                <h3 className="text-gray-400 text-sm mb-1">Prêmios Crypto</h3>
                <p className="text-white text-2xl font-bold">{formatNumber(stats.crypto_prizes_claimed)}</p>
                <p className="text-purple-400 text-sm mt-1">{cryptoPercentage}% do total</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Distribuição de Prêmios */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Doughnut 
                  options={getPieChartOptions('Distribuição de Prêmios por Tipo')} 
                  data={prizesChartData} 
                />
              </div>
              
              {/* Gráfico de Tipos de Prêmios */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Pie 
                  options={getPieChartOptions('Físicos vs Crypto')} 
                  data={prizeTypeData} 
                />
              </div>
            </div>
            
            {/* Tabela de comparação de prêmios */}
            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-3 bg-[#111] border-b border-gray-800">
                <h3 className="font-medium text-white">Comparativo de Prêmios</h3>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-[#111]">
                      <tr>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3">Quantidade</th>
                        <th scope="col" className="px-6 py-3">Porcentagem</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <th scope="row" className="px-6 py-4 font-medium text-yellow-400">
                          Físicos
                        </th>
                        <td className="px-6 py-4">
                          {formatNumber(stats.physical_prizes_claimed)}
                        </td>
                        <td className="px-6 py-4">
                          {physicalPercentage}%
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 mr-2"></div>
                            {stats.physical_prizes_claimed > stats.crypto_prizes_claimed ? 'Mais popular' : 'Menos popular'}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="px-6 py-4 font-medium text-cyan-400">
                          Crypto
                        </th>
                        <td className="px-6 py-4">
                          {formatNumber(stats.crypto_prizes_claimed)}
                        </td>
                        <td className="px-6 py-4">
                          {cryptoPercentage}%
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 mr-2"></div>
                            {stats.crypto_prizes_claimed > stats.physical_prizes_claimed ? 'Mais popular' : 'Menos popular'}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Lista de prêmios mais populares */}
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
          </>
        )}
        
        {/* Análise de Caixas */}
        {activeTab === 'boxes' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Card - Crypto Boxes */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-700/10 p-4 rounded-lg border border-cyan-700/20">
                <h3 className="text-gray-400 text-sm mb-1">Caixas Crypto</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(stats.crypto_boxes_opened || 0)}
                    </p>
                    <p className="text-cyan-400 text-sm">Caixas Abertas</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(stats.box_stock_data?.find(b => b.box_type === 'crypto')?.current_stock || 0)}
                    </p>
                    <p className="text-green-400 text-sm">Disponíveis</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                {stats.box_stock_data?.find(b => b.box_type === 'crypto') && (
                  <div className="mt-3">
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (stats.crypto_boxes_opened || 0) / 
                            (stats.box_stock_data?.find(b => b.box_type === 'crypto')?.initial_stock || 275) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{((stats.crypto_boxes_opened || 0) / 
                        (stats.box_stock_data?.find(b => b.box_type === 'crypto')?.initial_stock || 275) * 100).toFixed(1)}%</span>
                      <span>Total: {formatNumber(stats.box_stock_data?.find(b => b.box_type === 'crypto')?.initial_stock || 275)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card - Super Prize Boxes */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-700/10 p-4 rounded-lg border border-yellow-700/20">
                <h3 className="text-gray-400 text-sm mb-1">Caixas Super Prize</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(stats.super_prize_boxes_opened || 0)}
                    </p>
                    <p className="text-yellow-400 text-sm">Caixas Abertas</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white text-2xl font-bold">
                      {formatNumber(stats.box_stock_data?.find(b => b.box_type === 'super_prize')?.current_stock || 0)}
                    </p>
                    <p className="text-green-400 text-sm">Disponíveis</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                {stats.box_stock_data?.find(b => b.box_type === 'super_prize') && (
                  <div className="mt-3">
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (stats.super_prize_boxes_opened || 0) / 
                            (stats.box_stock_data?.find(b => b.box_type === 'super_prize')?.initial_stock || 275) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{((stats.super_prize_boxes_opened || 0) / 
                        (stats.box_stock_data?.find(b => b.box_type === 'super_prize')?.initial_stock || 275) * 100).toFixed(1)}%</span>
                      <span>Total: {formatNumber(stats.box_stock_data?.find(b => b.box_type === 'super_prize')?.initial_stock || 275)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tabela de estoque de caixas */}
            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-3 bg-[#111] border-b border-gray-800">
                <h3 className="font-medium text-white">Estoque de Caixas</h3>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-[#111]">
                      <tr>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Estoque Inicial</th>
                        <th scope="col" className="px-6 py-3">Estoque Atual</th>
                        <th scope="col" className="px-6 py-3">Vendidas</th>
                        <th scope="col" className="px-6 py-3">Porcentagem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.box_stock_data && stats.box_stock_data.length > 0 ? (
                        stats.box_stock_data.map((box, index) => {
                          const soldCount = box.initial_stock - box.current_stock;
                          const soldPercentage = (soldCount / box.initial_stock) * 100;
                          
                          return (
                            <tr key={index} className={index < stats.box_stock_data.length - 1 ? "border-b border-gray-800" : ""}>
                              <th scope="row" className="px-6 py-4 font-medium">
                                {box.box_type === 'crypto' ? (
                                  <span className="text-cyan-400">Crypto</span>
                                ) : (
                                  <span className="text-yellow-400">Super Prize</span>
                                )}
                              </th>
                              <td className="px-6 py-4">{box.name}</td>
                              <td className="px-6 py-4">{formatNumber(box.initial_stock)}</td>
                              <td className="px-6 py-4">{formatNumber(box.current_stock)}</td>
                              <td className="px-6 py-4">{formatNumber(soldCount)}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2 max-w-[100px]">
                                    <div 
                                      className={`h-2.5 rounded-full ${box.box_type === 'crypto' ? 'bg-cyan-500' : 'bg-yellow-500'}`}
                                      style={{ width: `${soldPercentage}%` }}
                                    ></div>
                                  </div>
                                  <span>{soldPercentage.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            Nenhum dado de estoque disponível
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Comparativo entre tipos de caixas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de distribuição de caixas */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Pie 
                  options={getPieChartOptions('Distribuição de Vendas por Tipo de Caixa')} 
                  data={{
                    labels: ['Crypto', 'Super Prize'],
                    datasets: [
                      {
                        label: 'Caixas Vendidas',
                        data: [stats.crypto_boxes_opened || 0, stats.super_prize_boxes_opened || 0],
                        backgroundColor: [
                          'rgba(75, 192, 192, 0.6)',
                          'rgba(255, 206, 86, 0.6)'
                        ],
                        borderColor: [
                          'rgba(75, 192, 192, 1)',
                          'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
              
              {/* Gráfico de estoque restante */}
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <Bar
                  options={getBarChartOptions('Estoque de Caixas Restante')}
                  data={{
                    labels: ['Crypto', 'Super Prize'],
                    datasets: [
                      {
                        label: 'Estoque Atual',
                        data: [
                          stats.box_stock_data?.find(b => b.box_type === 'crypto')?.current_stock || 0,
                          stats.box_stock_data?.find(b => b.box_type === 'super_prize')?.current_stock || 0
                        ],
                        backgroundColor: [
                          'rgba(75, 192, 192, 0.6)',
                          'rgba(255, 206, 86, 0.6)'
                        ],
                        borderColor: [
                          'rgba(75, 192, 192, 1)',
                          'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1,
                      },
                      {
                        label: 'Estoque Total',
                        data: [
                          stats.box_stock_data?.find(b => b.box_type === 'crypto')?.initial_stock || 275,
                          stats.box_stock_data?.find(b => b.box_type === 'super_prize')?.initial_stock || 275
                        ],
                        backgroundColor: [
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(255, 206, 86, 0.2)'
                        ],
                        borderColor: [
                          'rgba(75, 192, 192, 0.5)',
                          'rgba(255, 206, 86, 0.5)'
                        ],
                        borderWidth: 1,
                      }
                    ],
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 