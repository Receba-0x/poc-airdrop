"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../Button";

export function StockManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const { data } = await axios.get('/api/admin/update-stock', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (data.success) {
        setStockData(data.data || []);
      } else {
        setError(data.error || 'Falha ao carregar dados de estoque');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados de estoque');
      console.error('Erro ao buscar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeStock = async () => {
    setInitializing(true);
    setError(null);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const { data } = await axios.post('/api/admin/initialize-stock', {}, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (data.success) {
        setStockData(data.data || []);
        alert('Tabela de estoque inicializada com sucesso!');
      } else {
        setError(data.error || 'Falha ao inicializar tabela de estoque');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao inicializar estoque');
      console.error('Erro ao inicializar estoque:', err);
    } finally {
      setInitializing(false);
      fetchStockData();
    }
  };

  const updateStock = async (prizeId: number, action: string, newStock?: number) => {
    setUpdating(prizeId);
    setError(null);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const { data } = await axios.post('/api/admin/update-stock', {
        prize_id: prizeId,
        action,
        new_stock: newStock
      }, { headers: { 'Authorization': `Bearer ${adminToken}` } });

      if (data.success) {
        setStockData(prev =>
          prev.map(item =>
            item.prize_id === prizeId ? { ...item, ...data.data } : item
          )
        );
      } else {
        setError(data.error || `Falha ao ${action === 'reset' ? 'resetar' : 'atualizar'} estoque`);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar estoque');
      console.error('Erro ao atualizar estoque:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Carregando dados de estoque...</p>
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
          <div className="mt-4">
            <Button
              onClick={fetchStockData}
              variant="secondary"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-white font-bold">Gerenciamento de Estoque</h2>
        <div className="flex space-x-2">
          <Button
            onClick={initializeStock}
            disabled={initializing}
          >
            {initializing ? 'Inicializando...' : 'Inicializar Estoque'}
          </Button>
          <Button
            onClick={fetchStockData}
            variant="secondary"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {stockData.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Nenhum dado de estoque encontrado. Clique em "Inicializar Estoque" para configurar.</p>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#111] text-gray-400 text-sm">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-right">Estoque Atual</th>
                <th className="px-4 py-3 text-right">Estoque Inicial</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stockData.map((item) => (
                <tr key={item.prize_id} className="hover:bg-[#222]">
                  <td className="px-4 py-3 text-gray-300">{item.prize_id}</td>
                  <td className="px-4 py-3 text-white">{item.prize_name}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-mono ${item.current_stock === 0
                        ? 'text-red-400'
                        : item.current_stock < 5
                          ? 'text-yellow-400'
                          : 'text-green-400'
                        }`}
                    >
                      {item.current_stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 font-mono">{item.initial_stock}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        disabled={updating === item.prize_id}
                        onClick={() => updateStock(item.prize_id, 'increment', item.current_stock + 1)}
                        className="px-2 py-1 bg-green-800 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50"
                      >
                        +1
                      </button>
                      <button
                        disabled={updating === item.prize_id || item.current_stock === 0}
                        onClick={() => updateStock(item.prize_id, 'decrement', item.current_stock - 1)}
                        className="px-2 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded disabled:opacity-50"
                      >
                        -1
                      </button>
                      <button
                        disabled={updating === item.prize_id || item.current_stock === item.initial_stock}
                        onClick={() => updateStock(item.prize_id, 'reset', item.initial_stock)}
                        className="px-2 py-1 bg-blue-800 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 