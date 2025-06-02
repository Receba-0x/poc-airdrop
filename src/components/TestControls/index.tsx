"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export function TestControls() {
  const [isSimulating, setIsSimulating] = useState(false);

  const populateInitialData = async () => {
    setIsSimulating(true);
    try {
      const { data } = await axios.post('/api/populate-test-data');
      if (data.success) {
        if (data.action === 'skipped') {
          toast('ℹ️ Dados de teste já existem');
        } else {
          toast.success('✅ Dados iniciais criados!');
        }
      }
    } catch (error) {
      console.error('Error populating data:', error);
      toast.error('❌ Erro ao criar dados iniciais');
    } finally {
      setIsSimulating(false);
    }
  };

  const simulateSinglePurchase = async () => {
    setIsSimulating(true);
    try {
      const { data } = await axios.post('/api/simulate-purchase', { count: 1 });
      if (data.success) {
        toast.success('✅ Compra simulada criada!');
      }
    } catch (error) {
      console.error('Error simulating purchase:', error);
      toast.error('❌ Erro ao simular compra');
    } finally {
      setIsSimulating(false);
    }
  };

  const simulateMultiplePurchases = async () => {
    setIsSimulating(true);
    try {
      const { data } = await axios.post('/api/simulate-purchase', { count: 5 });
      if (data.success) {
        toast.success('✅ 5 compras simuladas criadas!');
      }
    } catch (error) {
      console.error('Error simulating purchases:', error);
      toast.error('❌ Erro ao simular compras');
    } finally {
      setIsSimulating(false);
    }
  };

  const simulateBurst = async () => {
    setIsSimulating(true);
    try {
      // Simular várias compras com delay entre elas
      for (let i = 0; i < 3; i++) {
        await axios.post('/api/simulate-purchase', { count: 1 });
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
      }
      toast.success('✅ Rajada de compras simulada!');
    } catch (error) {
      console.error('Error simulating burst:', error);
      toast.error('❌ Erro ao simular rajada');
    } finally {
      setIsSimulating(false);
    }
  };

  // Só mostra em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg max-w-[250px]">
      <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
        🧪 Test Controls
        <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded">DEV</span>
      </h3>
      
      <div className="flex flex-col gap-2">
        {/* Dados Iniciais */}
        <div className="pb-2 border-b border-gray-700">
          <button
            onClick={populateInitialData}
            disabled={isSimulating}
            className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
          >
            {isSimulating ? 'Criando...' : '📊 Popular Dados Iniciais'}
          </button>
        </div>

        {/* Simulações */}
        <div className="space-y-2">
          <button
            onClick={simulateSinglePurchase}
            disabled={isSimulating}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
          >
            {isSimulating ? 'Simulando...' : '🔄 1x Compra Simulada'}
          </button>
          
          <button
            onClick={simulateMultiplePurchases}
            disabled={isSimulating}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
          >
            {isSimulating ? 'Simulando...' : '🚀 5x Compras Simuladas'}
          </button>
          
          <button
            onClick={simulateBurst}
            disabled={isSimulating}
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
          >
            {isSimulating ? 'Simulando...' : '💥 Rajada (3x com delay)'}
          </button>
        </div>
        
        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
          💡 Use para testar o ticker em tempo real
        </div>
      </div>
    </div>
  );
} 