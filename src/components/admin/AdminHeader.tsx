"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../Button";
import axios from "axios";

interface AdminHeaderProps {
  activeTab: 'purchases' | 'stock' | 'statistics';
  onTabChange: (tab: 'purchases' | 'stock' | 'statistics') => void;
}

export function AdminHeader({ activeTab, onTabChange }: AdminHeaderProps) {
  const router = useRouter();
  const [adminName, setAdminName] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const [configMessage, setConfigMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Verificar autenticação e obter nome do usuário
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      try {
        // Obter informações do usuário
        const userJson = localStorage.getItem('adminUser');
        if (userJson) {
          const user = JSON.parse(userJson);
          setAdminName(user.username || 'Administrador');
        } else {
          setAdminName('Administrador');
        }
      } catch (err) {
        console.error('Erro ao obter informações do usuário:', err);
        setAdminName('Administrador');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  const setupExecSQL = async () => {
    setConfiguring(true);
    setConfigMessage(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setConfigMessage({
          text: 'Não autenticado. Faça login novamente.',
          type: 'error'
        });
        setConfiguring(false);
        return;
      }
      
      const { data } = await axios.post('/api/admin/setup-exec-sql', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setConfigMessage({
          text: 'Função exec_sql configurada com sucesso!',
          type: 'success'
        });
        
        // Após alguns segundos, limpar a mensagem
        setTimeout(() => {
          setConfigMessage(null);
        }, 5000);
      } else {
        throw new Error(data.error || 'Falha ao configurar função exec_sql');
      }
    } catch (err: any) {
      setConfigMessage({
        text: err.message || 'Erro ao configurar função exec_sql',
        type: 'error'
      });
      console.error('Erro ao configurar função exec_sql:', err);
    } finally {
      setConfiguring(false);
    }
  };

  return (
    <header className="bg-[#121212] border-b border-[#333] shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            {adminName && (
              <p className="text-gray-400 text-sm">Bem-vindo, {adminName}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="secondary" 
              onClick={setupExecSQL}
              disabled={configuring}
              className="text-sm py-2 bg-gray-700 hover:bg-gray-600"
            >
              {configuring ? 'Configurando...' : 'Setup Funções DB'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleLogout}
              className="text-sm py-2"
            >
              Sair
            </Button>
          </div>
        </div>
        
        {configMessage && (
          <div className={`mt-2 p-2 rounded text-sm ${
            configMessage.type === 'success' 
              ? 'bg-green-900/20 border border-green-700/30 text-green-400' 
              : 'bg-red-900/20 border border-red-700/30 text-red-400'
          }`}>
            {configMessage.text}
          </div>
        )}

        <nav className="mt-6">
          <ul className="flex space-x-1 border-b border-gray-800">
            <li>
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'purchases' 
                    ? 'border-b-2 border-blue-500 text-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => onTabChange('purchases')}
              >
                Compras
              </button>
            </li>
            <li>
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'stock' 
                    ? 'border-b-2 border-blue-500 text-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => onTabChange('stock')}
              >
                Estoque
              </button>
            </li>
            <li>
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'statistics' 
                    ? 'border-b-2 border-blue-500 text-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => onTabChange('statistics')}
              >
                Estatísticas
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 